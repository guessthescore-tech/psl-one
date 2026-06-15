locals {
  github_oidc_provider_arn = var.create_github_oidc_provider ? aws_iam_openid_connect_provider.github[0].arn : var.existing_github_oidc_provider_arn

  ecs_deployment_resources = distinct(concat(
    [var.ecs_cluster_arn],
    var.ecs_service_arns,
    var.ecs_task_definition_arns
  ))
}

resource "terraform_data" "github_oidc_provider_configuration" {
  input = {
    create_provider       = var.create_github_oidc_provider
    existing_provider_arn = var.existing_github_oidc_provider_arn
  }

  lifecycle {
    precondition {
      condition     = var.create_github_oidc_provider != (var.existing_github_oidc_provider_arn != null)
      error_message = "Set exactly one of create_github_oidc_provider or existing_github_oidc_provider_arn."
    }
  }
}

resource "aws_iam_openid_connect_provider" "github" {
  count = var.create_github_oidc_provider ? 1 : 0

  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
  tags            = merge(var.tags, { Name = "${var.name}-github-oidc" })
}

data "aws_iam_policy_document" "assume" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [local.github_oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_owner}/${var.github_repo}:environment:${var.github_environment}"]
    }
  }
}

resource "aws_iam_role" "deploy" {
  name               = "${var.name}-github-deploy"
  assume_role_policy = data.aws_iam_policy_document.assume.json
  tags               = merge(var.tags, { Name = "${var.name}-github-deploy" })
}

data "aws_iam_policy_document" "deploy" {
  statement {
    sid = "ScopedEcrRepositoryAccess"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:CompleteLayerUpload",
      "ecr:DescribeImages",
      "ecr:DescribeRepositories",
      "ecr:GetDownloadUrlForLayer",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart"
    ]
    resources = var.ecr_repository_arns
  }

  statement {
    sid       = "EcrAuthorizationTokenAwsRequiresWildcardResource"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    sid = "ScopedEcsDeployment"
    actions = [
      "ecs:DescribeClusters",
      "ecs:DescribeServices",
      "ecs:DescribeTaskDefinition",
      "ecs:DescribeTasks",
      "ecs:RegisterTaskDefinition",
      "ecs:RunTask",
      "ecs:UpdateService",
      "ecs:ListTasks"
    ]
    resources = local.ecs_deployment_resources
  }

  statement {
    sid       = "RegisterTaskDefinitionAwsRequiresWildcardResource"
    actions   = ["ecs:RegisterTaskDefinition"]
    resources = ["*"]
  }

  statement {
    sid       = "PassOnlyApprovedEcsRoles"
    actions   = ["iam:PassRole"]
    resources = var.pass_role_arns

    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy" "deploy" {
  name   = "${var.name}-github-deploy"
  role   = aws_iam_role.deploy.id
  policy = data.aws_iam_policy_document.deploy.json
}
