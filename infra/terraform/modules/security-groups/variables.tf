variable "name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "allowed_http_cidrs" {
  type    = list(string)
  default = ["0.0.0.0/0"]

  validation {
    condition     = length(var.allowed_http_cidrs) > 0 && alltrue([for cidr in var.allowed_http_cidrs : can(cidrhost(cidr, 0))])
    error_message = "allowed_http_cidrs must contain at least one valid CIDR block."
  }
}

variable "tags" {
  type    = map(string)
  default = {}
}
