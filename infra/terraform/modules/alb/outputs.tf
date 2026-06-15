output "dns_name" {
  value = aws_lb.this.dns_name
}

output "zone_id" {
  value = aws_lb.this.zone_id
}

output "api_target_group_arn" {
  value = aws_lb_target_group.api.arn
}

output "web_target_group_arn" {
  value = aws_lb_target_group.web.arn
}
