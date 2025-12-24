# Terraform Configuration for InsightFlow-AI-Hub

This directory contains Terraform infrastructure code for deploying InsightFlow-AI-Hub to AWS.

## ⚠️ Security Note

**This code contains an INTENTIONAL security vulnerability for DevOps training purposes:**
- SSH (port 22) is open to `0.0.0.0/0` (entire internet)

This vulnerability will be:
1. Detected by Trivy security scanner in Jenkins pipeline
2. Analyzed and fixed using AI (Gemini 2.5 Flash) recommendations
3. Re-scanned to confirm remediation

## Files

| File | Purpose |
|------|---------|
| `providers.tf` | AWS provider configuration |
| `variables.tf` | Input variables (region, instance type, etc.) |
| `main.tf` | Core infrastructure (VPC, EC2, Security Groups) |
| `outputs.tf` | Output values (IPs, URLs, etc.) |

## Resources Created (AWS Free Tier)

- **VPC** with public subnet
- **Internet Gateway** and route table
- **Security Group** with required ports
- **EC2 Instance** (t2.micro - Free Tier eligible)
- **Elastic IP** for static public IP

## Usage

```bash
# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply changes (requires AWS credentials)
terraform apply

# Destroy infrastructure
terraform destroy
```

## Prerequisites

1. AWS CLI configured with credentials:
   ```bash
   aws configure
   ```

2. Create SSH key pair in AWS:
   ```bash
   aws ec2 create-key-pair --key-name insightflow-key --query 'KeyMaterial' --output text > ~/.ssh/insightflow-key.pem
   chmod 400 ~/.ssh/insightflow-key.pem
   ```

## Estimated Cost

Using AWS Free Tier (first 12 months):
- EC2 t2.micro: 750 hours/month FREE
- EBS gp3 20GB: 30GB FREE
- Elastic IP (attached): FREE

**Monthly cost with Free Tier: $0**
