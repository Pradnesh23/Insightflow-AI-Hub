# InsightFlow-AI-Hub AWS Infrastructure
# AWS Free Tier Compatible - EC2, VPC, Security Groups
#
# Remediation applied based on Trivy Scan Report and security best practices.

# -----------------------------------------------------------------------------
# Data Sources
# -----------------------------------------------------------------------------

# Get latest Amazon Linux 2023 AMI (Free Tier eligible)
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Get available AZs
data "aws_availability_zones" "available" {
  state = "available"
}

# -----------------------------------------------------------------------------
# VPC and Networking
# -----------------------------------------------------------------------------

# VPC
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.app_name}-vpc"
  }

  /*
  # Optional: Enable VPC Flow Logs for network traffic monitoring and security analysis.
  # Note: This will incur additional AWS costs.
  # You would typically define aws_flow_log, aws_cloudwatch_log_group,
  # and associated IAM role/policy resources here.
  # Example:
  # resource "aws_cloudwatch_log_group" "flow_logs" {
  #   name              = "/aws/vpc/flowlogs/${var.app_name}-vpc"
  #   retention_in_days = 7
  # }
  # resource "aws_flow_log" "vpc_flow_log" {
  #   log_destination_type = "cloud-watch-logs"
  #   log_destination      = aws_cloudwatch_log_group.flow_logs.arn
  #   traffic_type         = "ALL"
  #   vpc_id               = aws_vpc.main.id
  #   # Requires an IAM role with appropriate permissions
  # }
  */
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.app_name}-igw"
  }
}

# Public Subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true # Keep public IP on launch for web app accessibility

  tags = {
    Name = "${var.app_name}-public-subnet"
  }
}

# Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.app_name}-public-rt"
  }
}

# Route Table Association
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# -----------------------------------------------------------------------------
# Security Group
# -----------------------------------------------------------------------------

resource "aws_security_group" "app" {
  name        = "${var.app_name}-sg"
  description = "Security group for InsightFlow AI Hub"
  vpc_id      = aws_vpc.main.id

  # REMEDIATED: SSH restricted to specific IP
  ingress {
    description = "SSH Access from User IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["103.119.172.167/32"] # Restricted to your public IP
  }

  # HTTP access for web application
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS access
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Application ports (Frontend: 3000, Backend: 8000)
  ingress {
    description = "Frontend Port"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend API Port"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # REMEDIATED: Egress restricted to necessary ports (HTTP/HTTPS)
  # Allows outbound traffic for system updates, package installations, and general internet access.
  egress {
    description = "Allow outbound HTTP for updates and general web access"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    description = "Allow outbound HTTPS for updates and general web access"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-sg"
  }
}

# -----------------------------------------------------------------------------
# EC2 Instance (Free Tier: t2.micro)
# -----------------------------------------------------------------------------

resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.app.id]

  # REMEDIATED: Enable IMDSv2 (require tokens)
  metadata_options {
    http_tokens = "required"
  }

  # Free Tier: 30GB EBS storage
  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30
    delete_on_termination = true
    encrypted             = true # REMEDIATED: Enabled EBS encryption
  }

  # User data script to install Docker
  user_data = <<-EOF
              #!/bin/bash
              # Update system
              yum update -y

              # Install Docker
              yum install -y docker
              systemctl start docker
              systemctl enable docker

              # Add ec2-user to docker group
              usermod -aG docker ec2-user

              # Install Docker Compose
              curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose

              # Install Git
              yum install -y git

              echo "Docker installation complete!" > /home/ec2-user/setup-complete.txt
              EOF

  tags = {
    Name = "${var.app_name}-server"
  }
}

# -----------------------------------------------------------------------------
# Elastic IP (Optional - Free Tier includes 1)
# -----------------------------------------------------------------------------

resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  tags = {
    Name = "${var.app_name}-eip"
  }

  depends_on = [aws_internet_gateway.main]
}
