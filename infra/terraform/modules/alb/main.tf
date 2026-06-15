resource "aws_lb" "this" {
  name               = var.name
  load_balancer_type = "application"
  internal           = false
  security_groups    = var.security_group_ids
  subnets            = var.subnet_ids
  tags               = merge(var.tags, { Name = var.name })
}

resource "aws_lb_target_group" "api" {
  name        = "${var.name}-api"
  port        = 4000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id

  health_check {
    enabled             = true
    path                = "/health/ready"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  tags = merge(var.tags, { Name = "${var.name}-api" })
}

resource "aws_lb_target_group" "web" {
  name        = "${var.name}-web"
  port        = 3001
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id

  health_check {
    enabled             = true
    path                = "/api/health"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  tags = merge(var.tags, { Name = "${var.name}-web" })
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/plain"
      message_body = "No staging host rule matched"
      status_code  = "404"
    }
  }
}

resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  condition {
    host_header {
      values = var.api_hostnames
    }
  }
}

resource "aws_lb_listener_rule" "web" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 20

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }

  condition {
    host_header {
      values = var.web_hostnames
    }
  }
}
