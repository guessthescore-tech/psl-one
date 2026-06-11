# PSL One — Bootstrap Infrastructure Plan

**Date:** 2026-06-08  
**Authority:** DevOps Agent + Architecture Review Board  
**Governs:** `infra/terraform/bootstrap/`  
**Constraint:** AWS Free Tier / $0–$100/month

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      AWS Account (af-south-1)               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Default VPC (172.31.0.0/16)            │   │
│  │                                                     │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │           Public Subnet                       │  │   │
│  │  │                                               │  │   │
│  │  │   ┌─────────────────────────────────────┐    │  │   │
│  │  │   │  EC2 t2.micro                        │    │  │   │
│  │  │   │  Elastic IP: api.pslone.co.za        │    │  │   │
│  │  │   │                                     │    │  │   │
│  │  │   │  ┌──────────┐  ┌────────────────┐  │    │  │   │
│  │  │   │  │  Nginx   │  │ NestJS (Docker)│  │    │  │   │
│  │  │   │  │  :80/:443│→ │   :3000        │  │    │  │   │
│  │  │   │  └──────────┘  └────────────────┘  │    │  │   │
│  │  │   └─────────────────────────────────────┘    │  │   │
│  │  │           │ Security Group: psl-api-sg        │  │   │
│  │  └───────────┼──────────────────────────────────-┘  │   │
│  │              │ Private port 5432                      │   │
│  │  ┌───────────▼──────────────────────────────────┐   │   │
│  │  │           Private Subnet                     │   │   │
│  │  │   ┌─────────────────────────────────────┐    │   │   │
│  │  │   │  RDS db.t3.micro                     │    │   │   │
│  │  │   │  PostgreSQL 16                       │    │   │   │
│  │  │   │  No public access                   │    │   │   │
│  │  │   └─────────────────────────────────────┘    │   │   │
│  │  │           Security Group: psl-rds-sg          │   │   │
│  │  └──────────────────────────────────────────────-┘   │   │
│  └─────────────────────────────────────────────────────-┘   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ S3 Bucket    │  │  Cognito     │  │ SES              │  │
│  │ psl-media    │  │  User Pool   │  │ Transactional    │  │
│  │ (5GB free)   │  │  (50K free)  │  │ email (free)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ ECR          │  │ CloudWatch   │  │ Secrets Manager  │  │
│  │ psl-api repo │  │ Basic logs   │  │ DB password      │  │
│  │ (500MB free) │  │ (free)       │  │ Cognito config   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘

External (non-AWS, free):
  Vercel     — Next.js hosting
  GitHub     — Source, Actions, Issues
  Let's Encrypt — TLS certificates
```

---

## Terraform Configuration

### `infra/terraform/bootstrap/variables.tf`

```hcl
variable "region" {
  description = "AWS region"
  default     = "af-south-1"
}

variable "environment" {
  description = "Environment name"
  default     = "dev"
}

variable "ec2_key_pair_name" {
  description = "EC2 key pair for SSH access"
  type        = string
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "alert_email" {
  description = "Email address for budget alerts"
  type        = string
}
```

### `infra/terraform/bootstrap/main.tf`

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # Local state for bootstrap. Move to S3 backend before Phase 2.
  # backend "s3" {
  #   bucket = "psl-one-terraform-state"
  #   key    = "bootstrap/terraform.tfstate"
  #   region = "af-south-1"
  # }
}

provider "aws" {
  region = var.region
  default_tags {
    tags = {
      Project     = "psl-one"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# ── Data: Use the default VPC (no custom VPC for free tier) ──────────────

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

# ── Security Groups ───────────────────────────────────────────────────────

resource "aws_security_group" "api" {
  name        = "psl-api-${var.environment}"
  description = "PSL API: allow HTTP, HTTPS inbound; all outbound"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]   # Tighten to office IP before production
    description = "SSH — restrict to known IPs before production"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "rds" {
  name        = "psl-rds-${var.environment}"
  description = "PSL RDS: allow PostgreSQL from API security group only"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.api.id]
    description     = "PostgreSQL from API layer only"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ── IAM: EC2 Instance Profile ─────────────────────────────────────────────

resource "aws_iam_role" "ec2_instance" {
  name = "psl-ec2-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "ec2_permissions" {
  name = "psl-ec2-permissions-${var.environment}"
  role = aws_iam_role.ec2_instance.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        # S3: Read and write to media bucket only
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.media.arn}/*"
      },
      {
        # SES: Send transactional email
        Effect   = "Allow"
        Action   = ["ses:SendEmail", "ses:SendRawEmail"]
        Resource = "*"
        Condition = {
          StringEquals = { "ses:FromAddress" = "noreply@pslone.co.za" }
        }
      },
      {
        # Secrets Manager: Read PSL One secrets only
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = "arn:aws:secretsmanager:${var.region}:*:secret:psl-one/*"
      },
      {
        # ECR: Pull images
        Effect   = "Allow"
        Action   = ["ecr:GetAuthorizationToken", "ecr:BatchGetImage",
                    "ecr:GetDownloadUrlForLayer"]
        Resource = "*"
      },
      {
        # CloudWatch: Put metrics and logs
        Effect   = "Allow"
        Action   = ["cloudwatch:PutMetricData", "logs:CreateLogGroup",
                    "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2" {
  name = "psl-ec2-${var.environment}"
  role = aws_iam_role.ec2_instance.name
}

# ── EC2 Instance ──────────────────────────────────────────────────────────

resource "aws_instance" "api" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = "t2.micro"   # Free tier: 750 hrs/month
  key_name               = var.ec2_key_pair_name
  vpc_security_group_ids = [aws_security_group.api.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name
  
  # 20 GB EBS (free tier: 30 GB total available)
  root_block_device {
    volume_type = "gp2"
    volume_size = 20
  }

  user_data = file("${path.module}/user_data.sh")

  tags = {
    Name = "psl-api-${var.environment}"
  }
}

resource "aws_eip" "api" {
  instance = aws_instance.api.id
  domain   = "vpc"
  tags     = { Name = "psl-api-eip-${var.environment}" }
}

# ── RDS PostgreSQL ────────────────────────────────────────────────────────

resource "aws_db_subnet_group" "default" {
  name       = "psl-rds-subnet-group-${var.environment}"
  subnet_ids = data.aws_subnets.default.ids
}

resource "aws_db_instance" "postgres" {
  identifier              = "psl-one-${var.environment}"
  engine                  = "postgres"
  engine_version          = "16"
  instance_class          = "db.t3.micro"   # Free tier: 750 hrs/month
  allocated_storage       = 20              # Free tier: 20 GB
  max_allocated_storage   = 20              # Prevent storage auto-scale beyond free tier
  storage_type            = "gp2"
  db_name                 = "psl_one_dev"
  username                = "psl_admin"
  password                = var.db_password
  db_subnet_group_name    = aws_db_subnet_group.default.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  publicly_accessible     = false
  skip_final_snapshot     = true            # Change to false before production
  backup_retention_period = 7              # 7 days automated backups
  deletion_protection     = false           # Change to true before production

  tags = { Name = "psl-one-${var.environment}" }
}

# ── S3: Media Bucket ──────────────────────────────────────────────────────

resource "aws_s3_bucket" "media" {
  bucket = "psl-one-media-${var.environment}"
}

resource "aws_s3_bucket_versioning" "media" {
  bucket = aws_s3_bucket.media.id
  versioning_configuration {
    status = "Disabled"   # Versioning multiplies cost; disabled for bootstrap
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "media" {
  bucket = aws_s3_bucket.media.id
  rule {
    id     = "expire-tmp"
    status = "Enabled"
    filter { prefix = "tmp/" }
    expiration { days = 1 }
  }
}

resource "aws_s3_bucket_public_access_block" "media" {
  bucket                  = aws_s3_bucket.media.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ── ECR: API Repository ───────────────────────────────────────────────────

resource "aws_ecr_repository" "api" {
  name                 = "psl-one/api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "api" {
  repository = aws_ecr_repository.api.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 5 images"
      selection    = { tagStatus = "any", countType = "imageCountMoreThan", countNumber = 5 }
      action       = { type = "expire" }
    }]
  })
}

# ── CloudWatch: Budget Alert ──────────────────────────────────────────────

resource "aws_budgets_budget" "monthly" {
  name         = "psl-one-monthly-${var.environment}"
  budget_type  = "COST"
  limit_amount = "100"
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }
}

# ── CloudWatch: Basic Application Monitoring ──────────────────────────────

resource "aws_cloudwatch_metric_alarm" "ec2_cpu_high" {
  alarm_name          = "psl-ec2-cpu-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "EC2 CPU > 80% for 10 minutes"
  dimensions          = { InstanceId = aws_instance.api.id }
  alarm_actions       = []   # Add SNS topic when email alerts are configured
}

resource "aws_cloudwatch_metric_alarm" "rds_cpu_high" {
  alarm_name          = "psl-rds-cpu-high-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "RDS CPU > 80% for 10 minutes"
  dimensions          = { DBInstanceIdentifier = aws_db_instance.postgres.identifier }
}
```

### `infra/terraform/bootstrap/outputs.tf`

```hcl
output "ec2_public_ip" {
  value       = aws_eip.api.public_ip
  description = "Elastic IP of the API server — set api.pslone.co.za DNS A record to this"
}

output "rds_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "RDS connection endpoint (private — accessible from EC2 only)"
  sensitive   = true
}

output "s3_media_bucket" {
  value = aws_s3_bucket.media.bucket
}

output "ecr_repository_url" {
  value = aws_ecr_repository.api.repository_url
}
```

### `infra/terraform/bootstrap/user_data.sh`

```bash
#!/bin/bash
set -euo pipefail

# Update system
dnf update -y

# Install Docker
dnf install -y docker
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

# Install Docker Compose v2
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Install Nginx
dnf install -y nginx
systemctl enable nginx

# Install Certbot
dnf install -y python3-certbot-nginx

# Install AWS CLI v2 (already on AL2023 — verify)
aws --version || dnf install -y awscli

# Create application directory
mkdir -p /opt/psl-one
chown ec2-user:ec2-user /opt/psl-one

# Create deployment docker-compose.yml (overwritten by GitHub Actions)
cat > /opt/psl-one/docker-compose.yml <<'EOF'
services:
  api:
    image: placeholder
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
EOF

# Create Nginx configuration
cat > /etc/nginx/conf.d/psl-api.conf <<'EOF'
server {
    listen 80;
    server_name api.pslone.co.za;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
EOF

systemctl restart nginx
```

---

## GitHub Actions: Deploy Workflow (Updated)

`.github/workflows/deploy.yml` — replace the ECS-based deploy with EC2 SSH deploy:

```yaml
name: Deploy to EC2

on:
  push:
    branches: [main]
    paths:
      - 'services/api/**'
      - 'packages/**'

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_TO_ASSUME }}
          aws-region: af-south-1

      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build \
            --file services/api/Dockerfile \
            --tag $ECR_REGISTRY/psl-one/api:$IMAGE_TAG \
            --tag $ECR_REGISTRY/psl-one/api:latest \
            .
          docker push $ECR_REGISTRY/psl-one/api:$IMAGE_TAG
          docker push $ECR_REGISTRY/psl-one/api:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2 via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_PRIVATE_KEY }}
          script: |
            cd /opt/psl-one
            
            # Pull env vars from Secrets Manager (not stored in repo)
            aws secretsmanager get-secret-value \
              --secret-id psl-one/api/dev \
              --query SecretString \
              --output text > .env
            
            # Update image in docker-compose.yml
            sed -i "s|image: .*|image: ${{ env.ECR_REGISTRY }}/psl-one/api:latest|g" \
              docker-compose.yml
            
            # Pull latest and restart
            docker compose pull api
            docker compose up -d --no-deps api
            
            # Wait for health check
            sleep 10
            curl -f http://localhost:3000/health || exit 1
            
            echo "Deploy successful"
```

---

## DNS Configuration

Add these DNS records at your domain registrar (or Route 53):

| Record | Type | Value | Purpose |
|---|---|---|---|
| `api.pslone.co.za` | A | `<EC2 Elastic IP>` | API server |
| `pslone.co.za` | CNAME | `cname.vercel-dns.com` | Frontend (Vercel manages) |
| `www.pslone.co.za` | CNAME | `cname.vercel-dns.com` | Frontend redirect |

After DNS propagates (~5 minutes for most registrars), run:
```bash
certbot --nginx -d api.pslone.co.za --email devops@pslone.co.za --agree-tos --non-interactive
```

Let's Encrypt certificate is free and auto-renews via a certbot systemd timer.

---

## Secrets Management

All sensitive values are stored in AWS Secrets Manager (not environment variables in code or GitHub):

```bash
# Create the API secret bundle (run once)
aws secretsmanager create-secret \
  --name psl-one/api/dev \
  --region af-south-1 \
  --secret-string '{
    "DATABASE_URL": "postgresql://psl_admin:<password>@<rds-endpoint>:5432/psl_one_dev",
    "COGNITO_USER_POOL_ID": "af-south-1_XXXXXXXXX",
    "COGNITO_CLIENT_ID": "XXXXXXXXXXXXXXXXXXXXXXXXXX",
    "SES_FROM_ADDRESS": "noreply@pslone.co.za"
  }'
```

The EC2 instance IAM role has `GetSecretValue` permission scoped to `psl-one/*`. The deploy script fetches this secret and writes it to `/opt/psl-one/.env` (never persisted in git, ephemeral on EC2 disk).

---

## Local Development

The `docker-compose.yml` in the repo root handles local development. No AWS services needed locally:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: psl_one_dev
      POSTGRES_USER: psl_admin
      POSTGRES_PASSWORD: localdevonly
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "psl_admin"]
      interval: 5s

  # Redis: add when first feature requires it
  # redis:
  #   image: redis:7-alpine
  #   ports: ["6379:6379"]

  mailpit:
    image: axllent/mailpit
    ports:
      - "1025:1025"   # SMTP
      - "8025:8025"   # Web UI (view sent emails locally)
```

Local `.env` for `services/api/.env.local`:
```
DATABASE_URL=postgresql://psl_admin:localdevonly@localhost:5432/psl_one_dev
COGNITO_USER_POOL_ID=<dev pool ID>
COGNITO_CLIENT_ID=<dev client ID>
SES_FROM_ADDRESS=noreply@pslone.co.za
SMTP_HOST=localhost
SMTP_PORT=1025
NODE_ENV=development
```

---

## Pre-Production Hardening (Before First Real Users)

Before going live with real fans (not just internal testing):

- [ ] SSH restricted to known IPs only (update `psl-api-sg` ingress rule 22)
- [ ] RDS `deletion_protection = true`
- [ ] RDS `skip_final_snapshot = false`
- [ ] EC2 Security Group: remove port 22 after stable deployment, use AWS SSM Session Manager instead
- [ ] Enable AWS CloudTrail (1 trail, free tier)
- [ ] Enable AWS GuardDuty (30-day free trial, then ~$10/month — enable when approaching launch)
- [ ] Configure SES in production mode (out of sandbox — requires AWS support request)
- [ ] Rotate DB password via Secrets Manager (change from bootstrap value)
- [ ] Set up CloudWatch alarm SNS topic → email notifications for all alarms

---

## Phase 2 Infrastructure Changes (Post-Funding Reference)

When Phase 2 begins, the following Terraform modules are added (refer to ADR-001–010 and migration-path.md):

| Module | When | Cost Impact |
|---|---|---|
| `modules/alb/` | First service extracted | +$16/month |
| `modules/ecs-service/` | First service extracted | +$14/month per service |
| `modules/aurora-cluster/` | First service DB extracted | +$20/month per cluster |
| `modules/msk-basic/` | Kafka events needed | +$190/month |
| `modules/vpc/` | Custom VPC + NAT Gateway | +$35/month |
| `modules/waf/` | Before first public load test | +$5/month minimum |
| `modules/elasticache/` | Redis required | +$30/month |
