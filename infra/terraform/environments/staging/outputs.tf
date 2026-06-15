output "alb_dns_name" {
  value = module.alb.dns_name
}

output "ecr_repository_urls" {
  value = module.ecr.repository_urls
}

output "ecs_cluster_name" {
  value = module.cluster.cluster_name
}

output "api_service_name" {
  value = module.api_service.service_name
}

output "web_service_name" {
  value = module.web_service.service_name
}

output "migration_task_definition_arn" {
  value = aws_ecs_task_definition.migration.arn
}

output "github_deploy_role_arn" {
  value = module.github_oidc.deploy_role_arn
}

output "rds_endpoint" {
  value     = try(module.rds[0].endpoint, null)
  sensitive = true
}

output "cloudfront_domain_name" {
  value = module.cloudfront.distribution_domain_name
}
