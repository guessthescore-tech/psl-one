variable "enabled" {
  type    = bool
  default = false
}

variable "alb_dns_name" {
  type = string
}

variable "aliases" {
  type    = list(string)
  default = []
}

variable "certificate_arn" {
  type    = string
  default = null
}

variable "tags" {
  type    = map(string)
  default = {}
}
