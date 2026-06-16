data "aws_caller_identity" "current" {}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default_public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }

  filter {
    name   = "defaultForAz"
    values = ["true"]
  }
}

data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

locals {
  name   = "${var.project}-${var.environment}"
  ami_id = var.ami_id != "" ? var.ami_id : data.aws_ami.al2023.id
}

# ── Security group ────────────────────────────────────────────────────────────
# Port 22 is intentionally excluded. Use SSM Session Manager for operator access.
# Ports 3001, 4000, and 5432 are internal to Docker; not exposed to the internet.
# Both port 80 and port 443 are restricted by allowed_beta_cidrs.
# In Mode A (internal review): set allowed_beta_cidrs to reviewer IPs.
# In Mode B (public HTTPS):    set allowed_beta_cidrs = ["0.0.0.0/0"] after owner approval.

resource "aws_security_group" "beta_ec2" {
  name        = "${local.name}-ec2"
  description = "PSL One beta EC2 — HTTP/HTTPS via Caddy only; no SSH; both ports restricted by allowed_beta_cidrs"
  vpc_id      = data.aws_vpc.default.id

  tags = { Name = "${local.name}-ec2" }
}

resource "aws_vpc_security_group_ingress_rule" "http" {
  for_each = toset(var.allowed_beta_cidrs)

  security_group_id = aws_security_group.beta_ec2.id
  cidr_ipv4         = each.value
  from_port         = 80
  ip_protocol       = "tcp"
  to_port           = 80
}

resource "aws_vpc_security_group_ingress_rule" "https" {
  for_each = toset(var.allowed_beta_cidrs)

  security_group_id = aws_security_group.beta_ec2.id
  cidr_ipv4         = each.value
  from_port         = 443
  ip_protocol       = "tcp"
  to_port           = 443
}

resource "aws_vpc_security_group_egress_rule" "all_outbound" {
  security_group_id = aws_security_group.beta_ec2.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

# ── IAM role ──────────────────────────────────────────────────────────────────
data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "beta_ec2" {
  name               = "${local.name}-ec2"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json

  tags = { Name = "${local.name}-ec2" }
}

# SSM Session Manager — managed policy (covers SSM agent, Run Command, Session Manager)
resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.beta_ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Scoped ECR pull policy — replaces the broad AmazonEC2ContainerRegistryReadOnly managed policy.
# ecr:GetAuthorizationToken must be on * (AWS does not support resource-level scope for this action).
# Pull actions are restricted to the three beta repositories only.
resource "aws_iam_role_policy" "ecr_pull" {
  name = "${local.name}-ecr-pull"
  role = aws_iam_role.beta_ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ECRToken"
        Effect = "Allow"
        Action = ["ecr:GetAuthorizationToken"]
        # AWS does not support resource-scoping for GetAuthorizationToken
        Resource = ["*"]
      },
      {
        Sid    = "ECRPullBetaRepos"
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
        ]
        Resource = [
          "arn:aws:ecr:${var.aws_region}:${data.aws_caller_identity.current.account_id}:repository/psl-one-beta-api",
          "arn:aws:ecr:${var.aws_region}:${data.aws_caller_identity.current.account_id}:repository/psl-one-beta-api-migrator",
          "arn:aws:ecr:${var.aws_region}:${data.aws_caller_identity.current.account_id}:repository/psl-one-beta-web",
        ]
      }
    ]
  })
}

# SSM Parameter Store — scoped to beta parameters only
resource "aws_iam_role_policy" "ssm_params" {
  name = "${local.name}-ssm-params"
  role = aws_iam_role.beta_ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ReadBetaParameters"
        Effect   = "Allow"
        Action   = ["ssm:GetParameter", "ssm:GetParameters", "ssm:GetParametersByPath"]
        Resource = "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/psl-one/beta/*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "beta" {
  name = "${local.name}-ec2"
  role = aws_iam_role.beta_ec2.name

  tags = { Name = "${local.name}-ec2" }
}

# ── EC2 instance ──────────────────────────────────────────────────────────────
# INSTANCE TYPE: t3.micro is required — t2.micro is NOT offered in af-south-1.
#   GUARDRAIL BLOCKER: PSLOneSprint0DenyGuardrails is effectively attached to psl-one-admin
#   through PSLOneSprint0Infra IAM group. DenyNonFreeTierEC2 denies ec2:RunInstances for
#   any type except t2.micro. Apply is blocked until guardrail is amended (S3-INFRA-02E-IAM).
#
# INSTANCE NOTES (t3.micro):
#   - 2 vCPU, 1 GiB RAM — tight for three Docker services.
#   - Burstable CPU-credit instance: credits accumulate below baseline, consumed when bursting.
#   - T3 defaults to unlimited credit mode; sustained burst above baseline may incur charges.
#   - Consider adding swap (1–2 GiB) in bootstrap to reduce OOM risk.
#   - Beta-only capacity; not suitable for production load.
#   - Free Plan eligibility is not guaranteed. Credits may be consumed.
#
# AMI lifecycle: ami is kept in ignore_changes because the data source selects
#   the latest AL2023 AMI on every plan run. Replacing ami would replace the
#   instance and destroy the postgres data volume. AMI updates must be performed
#   deliberately via a scheduled maintenance procedure.
#
# Bootstrap lifecycle: user_data is NOT in ignore_changes. Changes to
#   bootstrap-ec2.sh will signal Terraform to replace the instance. Before
#   applying, take a database backup with scripts/beta/backup-postgres.sh and
#   copy it off-instance. After replace, restore and re-run bootstrap-data.sh.

resource "aws_instance" "beta" {
  ami                         = local.ami_id
  instance_type               = var.instance_type
  subnet_id                   = var.subnet_id != "" ? var.subnet_id : data.aws_subnets.default_public.ids[0]
  vpc_security_group_ids      = [aws_security_group.beta_ec2.id]
  iam_instance_profile        = aws_iam_instance_profile.beta.name
  associate_public_ip_address = true
  key_name                    = var.key_pair_name != "" ? var.key_pair_name : null

  # IMDSv2 required — prevents SSRF-based metadata credential theft.
  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = var.root_volume_type
    encrypted             = true
    delete_on_termination = true
  }

  user_data = filebase64("${path.module}/../../../beta/bootstrap-ec2.sh")

  tags = { Name = local.name }

  lifecycle {
    # user_data is intentionally NOT in ignore_changes.
    # Changes to bootstrap-ec2.sh signal instance replacement.
    # Take a database backup before applying bootstrap changes.
    # ami is frozen to prevent unintended instance replacement on each plan run.
    ignore_changes = [ami]
  }
}

# ── Optional Elastic IP ───────────────────────────────────────────────────────
# Required for Mode B (public HTTPS) to maintain a stable IP across stop/start.
# Cost: public IPv4 usage fee applies (~$0.005/hr in af-south-1).
# Cash-spend target is R0; credits may be consumed. Disabled by default.

resource "aws_eip" "beta" {
  count    = var.create_elastic_ip ? 1 : 0
  instance = aws_instance.beta.id
  domain   = "vpc"

  tags = { Name = "${local.name}-eip" }
}
