output "secret_arns" {
  value = { for key, secret in data.aws_secretsmanager_secret.this : key => secret.arn }
}
