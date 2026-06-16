variable "aws_region" {
  type        = string
  description = "AWS region. af-south-1 is the target region for PSL One."
  default     = "af-south-1"
}

variable "environment" {
  type    = string
  default = "beta"
}

variable "project" {
  type    = string
  default = "psl-one"
}

variable "instance_type" {
  type        = string
  description = <<-EOT
    EC2 instance type.
    GUARDRAIL: Sprint 0 DenyNonFreeTierEC2 permits only t2.micro.
    t2.micro: 1 vCPU, 1 GiB RAM, burstable (CPU credits accumulate at idle).
    Note: 1 GiB is tight for three Docker services. Add swap in bootstrap if OOM is observed.
    t3.micro: 1 vCPU, 1 GiB, better baseline performance — requires guardrail amendment.
    Do NOT use t4g.* (arm64) unless all images are rebuilt for arm64.
    This environment is beta-only capacity; not suitable for production.
    Free Plan eligibility: depends on account status — not guaranteed. Charges may apply.
  EOT
  default     = "t2.micro"
}

variable "ami_id" {
  type        = string
  description = "Amazon Machine Image ID. Leave empty to use the latest Amazon Linux 2023 x86_64 AMI."
  default     = ""
}

variable "root_volume_size" {
  type        = number
  description = "Root EBS volume size in GiB. 20 GiB covers OS, Docker images, and postgres data volume."
  default     = 20
}

variable "root_volume_type" {
  type    = string
  default = "gp3"
}

variable "allowed_beta_cidrs" {
  type        = list(string)
  description = <<-EOT
    CIDRs applied to BOTH port 80 and port 443 for the beta environment.

    Mode A (restricted internal testing):
      Set to reviewer IP(s), e.g. ["196.x.x.x/32", "10.0.0.1/32"].
      Both ports are restricted. Caddy serves HTTP only (no public ACME).
      Testers add EC2 IP to /etc/hosts mapped to the staging hostnames.

    Mode B (approved public HTTPS — requires explicit owner approval):
      Set to ["0.0.0.0/0"] and update Terraform after owner sign-off.
      Caddy provisions TLS via Let's Encrypt. DNS must resolve to EC2 IP.
      Requires Elastic IP (create_elastic_ip = true) for stable ACME binding.

    Default is restricted to loopback as a safe placeholder.
    Change to ["0.0.0.0/0"] only after explicit owner approval.
  EOT
  default     = ["127.0.0.1/32"]
}

variable "create_elastic_ip" {
  type        = bool
  description = <<-EOT
    Attach an Elastic IP to the instance.
    Default false to avoid the public IPv4 charge (~$3.60/month when instance running,
    same rate when EIP is unattached to a running instance).
    Enable for Mode B HTTPS (stable IP required for Let's Encrypt ACME).
    Enable when NEXT_PUBLIC_API_BASE_URL is baked into images at a fixed address.
    Cash-spend target: R0. Credits may be consumed. Not guaranteed zero cost.
  EOT
  default     = false
}

variable "api_domain" {
  type        = string
  description = "API virtual host hostname for Caddy (used in Caddyfile environment variable)."
  default     = "api.staging.pslone.co.za"
}

variable "web_domain" {
  type        = string
  description = "Web virtual host hostname for Caddy (used in Caddyfile environment variable)."
  default     = "staging.pslone.co.za"
}

variable "key_pair_name" {
  type        = string
  description = "EC2 key pair name for emergency break-glass console access. Leave empty for SSM-only access (recommended)."
  default     = ""
}
