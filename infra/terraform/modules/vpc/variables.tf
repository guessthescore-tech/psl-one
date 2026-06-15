variable "name" {
  type        = string
  description = "Name prefix for networking resources."
}

variable "cidr_block" {
  type        = string
  description = "VPC CIDR block."
}

variable "az_count" {
  type        = number
  description = "Number of availability zones to use."
  default     = 2
}

variable "nat_gateway_count" {
  type        = number
  description = "Number of NAT gateways for private app subnet egress. Use 1 for cost-conscious staging or az_count for higher availability."
  default     = 1

  validation {
    condition     = var.nat_gateway_count >= 0 && var.nat_gateway_count <= var.az_count
    error_message = "nat_gateway_count must be between 0 and az_count."
  }
}

variable "tags" {
  type        = map(string)
  description = "Tags applied to all resources."
  default     = {}
}
