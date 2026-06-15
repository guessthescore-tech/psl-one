variable "aws_region" {
  type        = string
  description = "AWS region for staging. af-south-1 is proposed/default, not confirmed until deployment review."
  default     = "af-south-1"
}

variable "environment" {
  type    = string
  default = "staging"
}

variable "project" {
  type    = string
  default = "psl-one"
}

variable "vpc_cidr" {
  type    = string
  default = "10.41.0.0/16"
}

variable "az_count" {
  type    = number
  default = 2
}

variable "nat_gateway_count" {
  type        = number
  description = "NAT gateways for private app subnet egress. Default 1 for cost-conscious staging; increase to az_count for higher availability."
  default     = 1
}

variable "allowed_http_cidrs" {
  type    = list(string)
  default = ["0.0.0.0/0"]
}

variable "api_hostnames" {
  type        = list(string)
  description = "Hostnames routed to the API target group."
  default     = ["api.staging.pslone.co.za"]
}

variable "web_hostnames" {
  type        = list(string)
  description = "Hostnames routed to the web target group."
  default     = ["staging.pslone.co.za"]
}

variable "api_image_uri" {
  type        = string
  description = "Immutable API image URI with full Git SHA tag."
}

variable "web_image_uri" {
  type        = string
  description = "Immutable web image URI with full Git SHA tag."
}

variable "migration_image_uri" {
  type        = string
  description = "Immutable API migrator image URI with full Git SHA tag."
}

variable "api_runtime_secret_name" {
  type        = string
  description = "Existing Secrets Manager secret containing API runtime keys."
}

variable "github_owner" {
  type        = string
  description = "GitHub repository owner for OIDC trust."
}

variable "github_repo" {
  type        = string
  description = "GitHub repository name for OIDC trust."
}

variable "github_environment" {
  type        = string
  description = "GitHub Environment required in OIDC trust."
  default     = "staging"
}

variable "create_github_oidc_provider" {
  type        = bool
  description = "Create the GitHub OIDC provider. Use false when the account already has an approved provider."
  default     = false
}

variable "existing_github_oidc_provider_arn" {
  type        = string
  description = "Existing GitHub OIDC provider ARN when create_github_oidc_provider is false."
  default     = null
}

variable "git_sha" {
  type        = string
  description = "Full Git SHA for the release."
}

variable "build_timestamp" {
  type        = string
  description = "UTC build timestamp for runtime metadata."
}

variable "create_rds" {
  type        = bool
  description = "Must remain false until Terraform-plan review, AWS account confirmation and cost approval."
  default     = false
}

variable "rds_engine_version" {
  type    = string
  default = "16"
}

variable "rds_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "rds_allocated_storage" {
  type    = number
  default = 20
}

variable "rds_max_allocated_storage" {
  type    = number
  default = 100
}

variable "rds_backup_retention_period" {
  type    = number
  default = 7
}

variable "rds_multi_az" {
  type    = bool
  default = false
}

variable "enable_cloudfront" {
  type        = bool
  description = "Optional after initial ALB-based staging."
  default     = false
}

variable "cloudfront_aliases" {
  type    = list(string)
  default = []
}

variable "cloudfront_certificate_arn" {
  type    = string
  default = null
}
