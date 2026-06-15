variable "name" {
  type = string
}

variable "github_owner" {
  type        = string
  description = "GitHub organisation or user that owns the repository. Must be non-empty. Initial staging value: guessthescore-tech."
  default     = "guessthescore-tech"

  validation {
    condition     = length(trimspace(var.github_owner)) > 0
    error_message = "github_owner must be a non-empty string."
  }
}

variable "github_repo" {
  type        = string
  description = "GitHub repository name. Must be non-empty. Initial staging value: psl-one."
  default     = "psl-one"

  validation {
    condition     = length(trimspace(var.github_repo)) > 0
    error_message = "github_repo must be a non-empty string."
  }
}

variable "github_environment" {
  type        = string
  description = "GitHub Environment name required in the OIDC subject claim. Changing this trusts a different deployment environment. Initial staging value: staging."
  default     = "staging"

  validation {
    condition     = length(trimspace(var.github_environment)) > 0
    error_message = "github_environment must be a non-empty string."
  }
}

variable "create_github_oidc_provider" {
  type        = bool
  description = "Create a GitHub OIDC provider in this account. Set false when an approved provider already exists."
  default     = false
}

variable "existing_github_oidc_provider_arn" {
  type        = string
  description = "Existing GitHub OIDC provider ARN. Required when create_github_oidc_provider is false. Terraform plan review must confirm this ARN belongs to an approved account."
  default     = null
}

variable "ecr_repository_arns" {
  type = list(string)
}

variable "ecs_cluster_arn" {
  type = string
}

variable "ecs_service_arns" {
  type    = list(string)
  default = []
}

variable "ecs_task_definition_arns" {
  type    = list(string)
  default = []
}

variable "pass_role_arns" {
  type    = list(string)
  default = []
}

variable "tags" {
  type    = map(string)
  default = {}
}
