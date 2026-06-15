output "alb_security_group_id" {
  value = aws_security_group.alb.id
}

output "api_security_group_id" {
  value = aws_security_group.api.id
}

output "web_security_group_id" {
  value = aws_security_group.web.id
}

output "migration_security_group_id" {
  value = aws_security_group.migration.id
}

output "database_security_group_id" {
  value = aws_security_group.database.id
}
