variable "repositories" {
  type        = set(string)
  description = "ECR repository names to create."
}

variable "tags" {
  type    = map(string)
  default = {}
}
