#!/bin/bash
# PSL One Beta — ECR login helper.
# Called by systemd ExecStartPre and the deploy workflow via SSM Run Command.
# Reads AWS_REGION and ECR_REGISTRY from the systemd EnvironmentFile (.env.beta).
# No password is written to stdout or logs.
set -euo pipefail

: "${AWS_REGION:?AWS_REGION must be set}"
: "${ECR_REGISTRY:?ECR_REGISTRY must be set}"

aws ecr get-login-password --region "${AWS_REGION}" \
  | docker login --username AWS --password-stdin "${ECR_REGISTRY}"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] ECR login complete: ${ECR_REGISTRY}"
