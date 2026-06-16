output "instance_id" {
  description = "EC2 instance ID. Use with SSM: aws ssm start-session --target <instance_id>"
  value       = aws_instance.beta.id
}

output "instance_public_ip" {
  description = "Ephemeral public IP. Changes on stop/start unless an Elastic IP is attached."
  value       = aws_instance.beta.public_ip
}

output "elastic_ip" {
  description = "Elastic IP address. Null if create_elastic_ip is false."
  value       = try(aws_eip.beta[0].public_ip, null)
}

output "security_group_id" {
  value = aws_security_group.beta_ec2.id
}

output "instance_profile_name" {
  value = aws_iam_instance_profile.beta.name
}

output "ec2_role_arn" {
  value = aws_iam_role.beta_ec2.arn
}

output "ami_used" {
  description = "AMI ID selected for the instance."
  value       = local.ami_id
}
