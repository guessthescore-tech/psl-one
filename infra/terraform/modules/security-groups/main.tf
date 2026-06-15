resource "aws_security_group" "alb" {
  name        = "${var.name}-alb"
  description = "ALB ingress for PSL One staging"
  vpc_id      = var.vpc_id
  tags        = merge(var.tags, { Name = "${var.name}-alb" })
}

resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  for_each = toset(var.allowed_http_cidrs)

  security_group_id = aws_security_group.alb.id
  cidr_ipv4         = each.value
  from_port         = 80
  ip_protocol       = "tcp"
  to_port           = 80
}

resource "aws_vpc_security_group_egress_rule" "alb_all" {
  security_group_id = aws_security_group.alb.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_security_group" "api" {
  name        = "${var.name}-api"
  description = "API ECS task security group"
  vpc_id      = var.vpc_id
  tags        = merge(var.tags, { Name = "${var.name}-api" })
}

resource "aws_security_group" "web" {
  name        = "${var.name}-web"
  description = "Web ECS task security group"
  vpc_id      = var.vpc_id
  tags        = merge(var.tags, { Name = "${var.name}-web" })
}

resource "aws_security_group" "migration" {
  name        = "${var.name}-migration"
  description = "One-off Prisma migration ECS task security group"
  vpc_id      = var.vpc_id
  tags        = merge(var.tags, { Name = "${var.name}-migration" })
}

resource "aws_security_group" "database" {
  name        = "${var.name}-database"
  description = "Private PostgreSQL access from API and migration tasks only"
  vpc_id      = var.vpc_id
  tags        = merge(var.tags, { Name = "${var.name}-database" })
}

resource "aws_vpc_security_group_ingress_rule" "api_from_alb" {
  security_group_id            = aws_security_group.api.id
  referenced_security_group_id = aws_security_group.alb.id
  from_port                    = 4000
  ip_protocol                  = "tcp"
  to_port                      = 4000
}

resource "aws_vpc_security_group_ingress_rule" "web_from_alb" {
  security_group_id            = aws_security_group.web.id
  referenced_security_group_id = aws_security_group.alb.id
  from_port                    = 3001
  ip_protocol                  = "tcp"
  to_port                      = 3001
}

resource "aws_vpc_security_group_ingress_rule" "db_from_api" {
  security_group_id            = aws_security_group.database.id
  referenced_security_group_id = aws_security_group.api.id
  from_port                    = 5432
  ip_protocol                  = "tcp"
  to_port                      = 5432
}

resource "aws_vpc_security_group_ingress_rule" "db_from_migration" {
  security_group_id            = aws_security_group.database.id
  referenced_security_group_id = aws_security_group.migration.id
  from_port                    = 5432
  ip_protocol                  = "tcp"
  to_port                      = 5432
}

resource "aws_vpc_security_group_egress_rule" "api_all" {
  security_group_id = aws_security_group.api.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_vpc_security_group_egress_rule" "web_all" {
  security_group_id = aws_security_group.web.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_vpc_security_group_egress_rule" "migration_all" {
  security_group_id = aws_security_group.migration.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}
