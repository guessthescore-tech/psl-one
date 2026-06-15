resource "aws_cloudfront_distribution" "this" {
  count           = var.enabled ? 1 : 0
  enabled         = true
  is_ipv6_enabled = true
  aliases         = var.aliases
  comment         = "PLANNED_AFTER_INITIAL_STAGING optional CloudFront front door"

  origin {
    domain_name = var.alb_dns_name
    origin_id   = "staging-alb"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "staging-alb"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Origin", "Access-Control-Request-Headers", "Access-Control-Request-Method"]

      cookies {
        forward = "all"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn            = var.certificate_arn
    cloudfront_default_certificate = var.certificate_arn == null
    ssl_support_method             = var.certificate_arn == null ? null : "sni-only"
    minimum_protocol_version       = var.certificate_arn == null ? "TLSv1" : "TLSv1.2_2021"
  }

  tags = var.tags
}
