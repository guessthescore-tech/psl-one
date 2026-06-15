data "aws_secretsmanager_secret" "this" {
  for_each = var.secret_names
  name     = each.value
}
