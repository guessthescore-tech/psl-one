data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

locals {
  name = "${var.project}-${var.environment}"

  tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
    Story       = "S3-INFRA-01"
    State       = "NOT_DEPLOYED"
  }
}

module "networking" {
  source            = "../../modules/vpc"
  name              = local.name
  cidr_block        = var.vpc_cidr
  az_count          = var.az_count
  nat_gateway_count = var.nat_gateway_count
  tags              = local.tags
}

module "security_groups" {
  source              = "../../modules/security-groups"
  name                = local.name
  vpc_id              = module.networking.vpc_id
  allowed_http_cidrs  = var.allowed_http_cidrs
  tags                = local.tags
}

module "ecr" {
  source = "../../modules/ecr"
  repositories = [
    "${local.name}-api",
    "${local.name}-api-migrator",
    "${local.name}-web"
  ]
  tags = local.tags
}

module "logs" {
  source = "../../modules/cloudwatch"
  log_groups = {
    "/ecs/${local.name}/api"       = { retention_in_days = 30 }
    "/ecs/${local.name}/web"       = { retention_in_days = 30 }
    "/ecs/${local.name}/migration" = { retention_in_days = 30 }
  }
  tags = local.tags
}

module "secrets" {
  source = "../../modules/secrets"
  secret_names = {
    api_runtime = var.api_runtime_secret_name
  }
}

module "ecs_iam" {
  source = "../../modules/ecs-iam"
  name   = local.name
  secret_arns = [
    module.secrets.secret_arns["api_runtime"]
  ]
  ecr_repository_arns = values(module.ecr.repository_arns)
  tags                = local.tags
}

module "cluster" {
  source = "../../modules/ecs-cluster"
  name   = local.name
  tags   = local.tags
}

module "alb" {
  source             = "../../modules/alb"
  name               = local.name
  vpc_id             = module.networking.vpc_id
  subnet_ids         = module.networking.public_subnet_ids
  security_group_ids = [module.security_groups.alb_security_group_id]
  api_hostnames      = var.api_hostnames
  web_hostnames      = var.web_hostnames
  tags               = local.tags
}

module "rds" {
  count                   = var.create_rds ? 1 : 0
  source                  = "../../modules/rds-postgres"
  identifier              = "${local.name}-postgres"
  database_name           = "psl_identity_staging"
  engine_version          = var.rds_engine_version
  instance_class          = var.rds_instance_class
  allocated_storage       = var.rds_allocated_storage
  max_allocated_storage   = var.rds_max_allocated_storage
  backup_retention_period = var.rds_backup_retention_period
  multi_az                = var.rds_multi_az
  subnet_ids              = module.networking.database_subnet_ids
  security_group_ids      = [module.security_groups.database_security_group_id]
  tags                    = local.tags
}

module "api_service" {
  source             = "../../modules/ecs-service"
  name               = "${local.name}-api"
  cluster_arn        = module.cluster.cluster_arn
  execution_role_arn = module.ecs_iam.execution_role_arn
  task_role_arn      = module.ecs_iam.api_task_role_arn
  image              = var.api_image_uri
  container_port     = 4000
  subnet_ids         = module.networking.private_subnet_ids
  security_group_ids = [module.security_groups.api_security_group_id]
  target_group_arn   = module.alb.api_target_group_arn
  log_group_name     = module.logs.log_group_names["/ecs/${local.name}/api"]
  health_check_path  = "/health/ready"
  environment = {
    AWS_REGION        = var.aws_region
    NODE_ENV          = "production"
    PORT              = "4000"
    ENVIRONMENT_LABEL = "staging"
    GIT_SHA           = var.git_sha
    BUILD_TIMESTAMP   = var.build_timestamp
  }
  secrets = [
    { name = "DATABASE_URL", valueFrom = "${module.secrets.secret_arns["api_runtime"]}:DATABASE_URL::" },
    { name = "JWT_SECRET", valueFrom = "${module.secrets.secret_arns["api_runtime"]}:JWT_SECRET::" },
    { name = "JWT_EXPIRES_IN", valueFrom = "${module.secrets.secret_arns["api_runtime"]}:JWT_EXPIRES_IN::" },
    { name = "CORS_ORIGINS", valueFrom = "${module.secrets.secret_arns["api_runtime"]}:CORS_ORIGINS::" }
  ]
  tags = local.tags
}

module "web_service" {
  source             = "../../modules/ecs-service"
  name               = "${local.name}-web"
  cluster_arn        = module.cluster.cluster_arn
  execution_role_arn = module.ecs_iam.execution_role_arn
  task_role_arn      = module.ecs_iam.web_task_role_arn
  image              = var.web_image_uri
  container_port     = 3001
  subnet_ids         = module.networking.private_subnet_ids
  security_group_ids = [module.security_groups.web_security_group_id]
  target_group_arn   = module.alb.web_target_group_arn
  log_group_name     = module.logs.log_group_names["/ecs/${local.name}/web"]
  health_check_path  = "/api/health"
  environment = {
    AWS_REGION                    = var.aws_region
    NODE_ENV                      = "production"
    PORT                          = "3001"
    HOSTNAME                      = "0.0.0.0"
    NEXT_PUBLIC_ENVIRONMENT_LABEL = "staging"
    NEXT_PUBLIC_GIT_SHA           = var.git_sha
    NEXT_PUBLIC_BUILD_TIMESTAMP   = var.build_timestamp
  }
  secrets = []
  tags = local.tags
}

resource "aws_ecs_task_definition" "migration" {
  family                   = "${local.name}-migration"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = module.ecs_iam.execution_role_arn
  task_role_arn            = module.ecs_iam.migration_task_role_arn

  container_definitions = jsonencode([
    {
      name      = "migration"
      image     = var.migration_image_uri
      essential = true
      command   = ["node_modules/.bin/prisma", "migrate", "deploy", "--schema", "apps/api/prisma/schema.prisma"]
      secrets = [
        { name = "DATABASE_URL", valueFrom = "${module.secrets.secret_arns["api_runtime"]}:DATABASE_URL::" }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "ENVIRONMENT_LABEL", value = "staging" },
        { name = "GIT_SHA", value = var.git_sha },
        { name = "BUILD_TIMESTAMP", value = var.build_timestamp }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = module.logs.log_group_names["/ecs/${local.name}/migration"]
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "migration"
        }
      }
    }
  ])

  tags = local.tags
}

module "github_oidc" {
  source                            = "../../modules/github-oidc"
  name                              = local.name
  github_owner                      = var.github_owner
  github_repo                       = var.github_repo
  github_environment                = var.github_environment
  create_github_oidc_provider       = var.create_github_oidc_provider
  existing_github_oidc_provider_arn = var.existing_github_oidc_provider_arn
  ecr_repository_arns               = values(module.ecr.repository_arns)
  ecs_cluster_arn                   = module.cluster.cluster_arn
  ecs_service_arns = [
    "arn:${data.aws_partition.current.partition}:ecs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:service/${local.name}/${local.name}-api",
    "arn:${data.aws_partition.current.partition}:ecs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:service/${local.name}/${local.name}-web"
  ]
  ecs_task_definition_arns = [
    "arn:${data.aws_partition.current.partition}:ecs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:task-definition/${local.name}-api:*",
    "arn:${data.aws_partition.current.partition}:ecs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:task-definition/${local.name}-web:*",
    "arn:${data.aws_partition.current.partition}:ecs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:task-definition/${local.name}-migration:*"
  ]
  pass_role_arns = [
    module.ecs_iam.execution_role_arn,
    module.ecs_iam.api_task_role_arn,
    module.ecs_iam.web_task_role_arn,
    module.ecs_iam.migration_task_role_arn
  ]
  tags = local.tags
}

module "cloudfront" {
  source          = "../../modules/cloudfront"
  enabled         = var.enable_cloudfront
  alb_dns_name    = module.alb.dns_name
  aliases         = var.cloudfront_aliases
  certificate_arn = var.cloudfront_certificate_arn
  tags            = merge(local.tags, { Status = "PLANNED_AFTER_INITIAL_STAGING" })
}
