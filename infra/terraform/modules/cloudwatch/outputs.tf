output "log_group_names" {
  value = { for key, group in aws_cloudwatch_log_group.this : key => group.name }
}
