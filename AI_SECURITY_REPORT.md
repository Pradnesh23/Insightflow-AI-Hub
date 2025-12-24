# AI Security Remediation Report
Generated: 2025-12-19 00:33:11

As a DevOps security expert, I've analyzed your Trivy scan report and the provided Terraform code. It's commendable that you've intentionally highlighted some vulnerabilities for learning purposes. Let's break down the findings and propose robust fixes.

### RISK ANALYSIS

Here's an analysis of the vulnerabilities identified (or implied by the code comments and common security practices):

1.  **Vulnerability ID: AVD-AWS-0028**
    *   **What the vulnerability is:** The `aws_instance` resource (`aws_instance.app`) does not explicitly require session tokens for accessing the Instance Metadata Service (IMDS). By default, IMDS v1 is enabled, or IMDS v2 is optional, meaning access to instance metadata can occur without session authentication tokens.
    *   **Security Risk/Impact:** This vulnerability makes the EC2 instance susceptible to Server-Side Request Forgery (SSRF) attacks. If an application running on the instance has an SSRF vulnerability, an attacker could exploit it to make requests to the IMDS endpoint (`http://169.254.169.254/`). This allows them to steal temporary AWS credentials, IAM role credentials, user data, or other sensitive instance metadata. With stolen credentials, an attacker could escalate privileges, access other AWS resources, or compromise your AWS account.
    *   **Severity:** HIGH (as per Trivy report).

2.  **Vulnerability ID: AVD-AWS-0104**
    *   **What the vulnerability is:** The `aws_security_group.app` has an egress rule that allows unrestricted outbound traffic (`0.0.0.0/0`) on all protocols (`-1`) and all ports (`0-0`).
    *   **Security Risk/Impact:** This is a critical security flaw. If the EC2 instance is compromised (e.g., via a successful SSH brute-force or application vulnerability), an attacker can use this unrestricted egress to:
        *   Exfiltrate sensitive data to any destination on the internet.
        *   Establish Command and Control (C2) communication with attacker-controlled servers.
        *   Launch further attacks against other internal or external systems.
        *   Download additional malicious tools.
        It makes detecting and preventing malicious outbound activity very difficult.
    *   **Severity:** CRITICAL (as per Trivy report).

3.  **Vulnerability (Implicit, noted in code comments): Unrestricted SSH Access**
    *   **What the vulnerability is:** The `aws_security_group.app` has an ingress rule allowing SSH (port 22) from `0.0.0.0/0`, meaning any IP address on the internet can attempt to connect via SSH.
    *   **Security Risk/Impact:** This exposes the instance to an extremely high risk of brute-force attacks. Automated bots constantly scan the internet for open SSH ports and attempt to guess usernames and passwords or exploit known SSH vulnerabilities. A successful compromise would give an attacker full shell access to your EC2 instance, leading to data theft, system manipulation, or using the instance as a pivot point for further attacks.
    *   **Severity:** CRITICAL (typically, for any direct administrative access like SSH).

4.  **Vulnerability (Implicit, noted in code comments): EBS Root Volume Not Encrypted**
    *   **What the vulnerability is:** The `root_block_device` configuration for `aws_instance.app` does not have `encrypted = true` explicitly set. While AWS encrypts new EBS volumes by default in many regions using AWS Key Management Service (KMS), explicitly setting `encrypted = true` ensures it, and allows for specifying a custom KMS key for enhanced control and compliance.
    *   **Security Risk/Impact:** If the EBS volume is not encrypted, any data stored on it is vulnerable to exposure if the volume is detached and accessed independently, or if there's a compromise of the underlying storage infrastructure. This can lead to data breaches, violate compliance requirements (e.g., HIPAA, PCI DSS), and compromise data at rest.
    *   **Severity:** HIGH (depending on the sensitivity of data stored).

### FIXED TERRAFORM CODE

Here is the complete `main.tf` code with all security issues resolved as per your requirements:

```hcl
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
    volume_size           = 20
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
```

### SUMMARY OF CHANGES

*   **EC2 Instance Metadata Service (IMDSv2) Enabled:**
    *   Added `metadata_options { http_tokens = "required" }` to the `aws_instance.app` resource to enforce the use of session authentication tokens for IMDS access, mitigating SSRF risks.
*   **SSH Access Restricted:**
    *   Modified the `ingress` rule for port 22 (SSH) in `aws_security_group.app` to explicitly restrict `cidr_blocks` to your public IP (`103.119.172.167/32`), preventing unauthorized access attempts from the entire internet.
*   **Outbound Traffic (Egress) Restricted:**
    *   Replaced the overly permissive `egress` rule (`protocol = "-1", from_port = 0, to_port = 0, cidr_blocks = ["0.0.0.0/0"]`) in `aws_security_group.app` with specific rules allowing outbound traffic only on ports 80 (HTTP) and 443 (HTTPS) to `0.0.0.0/0`. This maintains functionality for package updates and general web access while significantly reducing the attack surface for data exfiltration and C2 communications.
*   **EBS Root Volume Encryption Enabled:**
    *   Uncommented and set `encrypted = true` within the `root_block_device` block of `aws_instance.app` to ensure data at rest on the primary EBS volume is encrypted.
*   **VPC Flow Logs (Commented):**
    *   Added a commented block within the `aws_vpc.main` resource to illustrate where VPC Flow Logs could be configured, along with a note about the associated costs, as requested.
*   **Public IP on Subnet:**
    *   Confirmed `map_public_ip_on_launch = true` on `aws_subnet.public` remains, as it's intended for public web application access.