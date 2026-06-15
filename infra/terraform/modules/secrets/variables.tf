variable "secret_names" {
  type        = map(string)
  description = "Logical secret keys mapped to existing Secrets Manager secret names."
}
