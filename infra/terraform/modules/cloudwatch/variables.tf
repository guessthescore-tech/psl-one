variable "log_groups" {
  type = map(object({
    retention_in_days = number
  }))
}

variable "tags" {
  type    = map(string)
  default = {}
}
