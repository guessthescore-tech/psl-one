output "execution_role_arn" {
  value = aws_iam_role.execution.arn
}

output "api_task_role_arn" {
  value = aws_iam_role.api_task.arn
}

output "web_task_role_arn" {
  value = aws_iam_role.web_task.arn
}

output "migration_task_role_arn" {
  value = aws_iam_role.migration_task.arn
}
