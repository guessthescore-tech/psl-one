resource "aws_db_subnet_group" "this" {
  name       = "${var.identifier}-subnets"
  subnet_ids = var.subnet_ids
  tags       = merge(var.tags, { Name = "${var.identifier}-subnets" })
}

resource "aws_db_instance" "this" {
  identifier                          = var.identifier
  engine                              = "postgres"
  engine_version                      = var.engine_version
  instance_class                      = var.instance_class
  allocated_storage                   = var.allocated_storage
  max_allocated_storage               = var.max_allocated_storage
  storage_encrypted                   = true
  db_name                             = var.database_name
  username                            = var.username
  manage_master_user_password         = true
  db_subnet_group_name                = aws_db_subnet_group.this.name
  vpc_security_group_ids              = var.security_group_ids
  publicly_accessible                 = false
  multi_az                            = var.multi_az
  backup_retention_period             = var.backup_retention_period
  deletion_protection                 = true
  skip_final_snapshot                 = false
  iam_database_authentication_enabled = false
  auto_minor_version_upgrade          = true

  tags = merge(var.tags, { Name = var.identifier })
}
