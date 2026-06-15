variable "name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "security_group_ids" {
  type = list(string)
}

variable "api_hostnames" {
  type        = list(string)
  description = "Hostnames routed to the API target group."
}

variable "web_hostnames" {
  type        = list(string)
  description = "Hostnames routed to the web target group."
}

variable "certificate_arn" {
  type    = string
  default = null
}

variable "tags" {
  type    = map(string)
  default = {}
}
