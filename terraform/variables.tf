# Terraform Variables for InsightFlow-AI-Hub Infrastructure
# AWS Free Tier Compatible

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-south-1" # Mumbai - matching AWS CLI config
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "app_name" {
  description = "Application name for tagging"
  type        = string
  default     = "insightflow-ai-hub"
}

variable "instance_type" {
  description = "EC2 instance type (t3.micro is Free Tier eligible in ap-south-1)"
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "Name of AWS key pair for SSH access"
  type        = string
  default     = "insightflow-key"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed for SSH access"
  type        = string
  # INTENTIONAL VULNERABILITY: Open to all IPs
  # This will be detected by Trivy and fixed later
  default     = "0.0.0.0/0"
}
