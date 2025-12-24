# DevOps Infrastructure - InsightFlow-AI-Hub

## 🎯 Project Overview

This project demonstrates a complete DevOps pipeline with:
- **Docker** containerization for the InsightFlow-AI-Hub application
- **Terraform** infrastructure as code for AWS deployment
- **Jenkins** CI/CD pipeline with security scanning
- **AI-driven security remediation** using Gemini 2.5 Flash

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         JENKINS CI/CD PIPELINE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌───────────────────┐    ┌──────────────────┐         │
│  │   STAGE 1    │───►│     STAGE 2       │───►│    STAGE 3       │         │
│  │   Checkout   │    │  Trivy Security   │    │  Terraform Plan  │         │
│  │              │    │      Scan         │    │                  │         │
│  └──────────────┘    └─────────┬─────────┘    └──────────────────┘         │
│                                │                                            │
│                                ▼                                            │
│                    ┌───────────────────────┐                               │
│                    │   VULNERABILITY       │                               │
│                    │   DETECTED?           │                               │
│                    └───────────┬───────────┘                               │
│                                │ YES                                        │
│                                ▼                                            │
│                    ┌───────────────────────┐                               │
│                    │   AI REMEDIATION      │                               │
│                    │   (Gemini 2.5 Flash)  │                               │
│                    └───────────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AWS CLOUD (FREE TIER)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                              VPC                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      Public Subnet                               │  │  │
│  │  │  ┌───────────────────────────────────────────────────────────┐  │  │  │
│  │  │  │                  EC2 (t2.micro)                           │  │  │  │
│  │  │  │                                                           │  │  │  │
│  │  │  │   ┌─────────────────────────────────────────────────┐    │  │  │  │
│  │  │  │   │              Docker                              │    │  │  │  │
│  │  │  │   │  ┌──────────────┐   ┌───────────────────────┐   │    │  │  │  │
│  │  │  │   │  │   Frontend   │   │       Backend         │   │    │  │  │  │
│  │  │  │   │  │   (Next.js)  │◄──│    (FastAPI/Python)   │   │    │  │  │  │
│  │  │  │   │  │   Port 3000  │   │      Port 8000        │   │    │  │  │  │
│  │  │  │   │  └──────────────┘   └───────────────────────┘   │    │  │  │  │
│  │  │  │   └─────────────────────────────────────────────────┘    │  │  │  │
│  │  │  └───────────────────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tools & Technologies

| Category | Tool | Purpose |
|----------|------|---------|
| **Application** | Next.js, FastAPI | Frontend & Backend |
| **Containerization** | Docker, Docker Compose | Application packaging |
| **IaC** | Terraform | AWS infrastructure provisioning |
| **CI/CD** | Jenkins | Pipeline automation |
| **Security** | Trivy | Infrastructure security scanning |
| **Cloud** | AWS (Free Tier) | EC2, VPC, Security Groups |
| **AI** | Gemini 2.5 Flash | Security remediation recommendations |

## ☁️ Cloud Provider: AWS Free Tier

| Service | Configuration | Free Tier Limit |
|---------|--------------|-----------------|
| EC2 | t2.micro | 750 hours/month |
| EBS | 20GB gp3 | 30GB FREE |
| VPC | 1 VPC, 1 Subnet | Unlimited |
| Elastic IP | 1 (attached) | FREE when attached |

---

## 📁 Project Files

```
InsightFlow-AI-Hub/
├── backend/
│   ├── Dockerfile           # Backend container
│   └── ...                  # FastAPI application
├── frontend/
│   ├── Dockerfile           # Frontend container
│   └── ...                  # Next.js application
├── terraform/
│   ├── providers.tf         # AWS provider config
│   ├── variables.tf         # Input variables
│   ├── main.tf              # Infrastructure (⚠️ contains vulnerability)
│   ├── outputs.tf           # Output values
│   └── README.md            # Terraform documentation
├── docker-compose.yml           # Application orchestration
├── docker-compose.jenkins.yml   # Jenkins with Trivy
├── Jenkinsfile                  # CI/CD pipeline
├── JENKINS_SETUP.md            # Jenkins setup guide
└── DEVOPS_README.md            # This file
```

---

## 🚀 Quick Start Guide

### Prerequisites

- [x] Docker Desktop installed
- [x] AWS CLI configured (`aws configure`)
- [x] Git installed
- [x] Terraform installed

### Step 1: Run Application Locally with Docker

```powershell
cd c:\Users\prads\OneDrive\Desktop\InsightFlow-AI-Hub

# Copy environment template
copy .env.docker.example .env
# Edit .env with your API keys

# Build and run
docker-compose up -d

# Verify
docker-compose ps
```

Access: **http://localhost:3000** (Frontend) | **http://localhost:8000** (API)

### Step 2: Start Jenkins

```powershell
docker-compose -f docker-compose.jenkins.yml up -d

# Get admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Access: **http://localhost:8080**

### Step 3: Configure Jenkins Pipeline

1. Install plugins: Pipeline, Git, Docker Pipeline, AWS Credentials
2. Add AWS credentials (ID: `aws-credentials`)
3. Create Pipeline job pointing to `Jenkinsfile`
4. Click **Build Now**

### Step 4: Run Security Scan (First Run - Will FAIL)

The pipeline will detect the intentional SSH vulnerability and show:

```
❌ SECURITY SCAN FAILED - Vulnerabilities detected!
   
   SSH (Port 22) open to 0.0.0.0/0
```

### Step 5: AI Remediation with Gemini 2.5 Flash

See [AI_REMEDIATION.md](AI_REMEDIATION.md) for detailed instructions.

### Step 6: Re-run Pipeline (Will PASS)

After applying AI-recommended fixes, re-run the pipeline to confirm:

```
✅ SECURITY SCAN PASSED - No critical issues found
```

---

## 🔒 Security Vulnerability (Intentional)

### Before Remediation

**File**: `terraform/main.tf`

```hcl
# ⚠️ VULNERABLE: SSH open to entire internet
ingress {
  description = "SSH Access"
  from_port   = 22
  to_port     = 22
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]  # INSECURE!
}
```

### After AI Remediation

```hcl
# ✅ SECURE: SSH restricted to specific IP
ingress {
  description = "SSH Access - Restricted"
  from_port   = 22
  to_port     = 22
  protocol    = "tcp"
  cidr_blocks = ["YOUR_IP/32"]  # Your public IP only
}
```

---

## 📊 Before & After Security Report

### Initial Scan (FAILED)

```
CRITICAL: aws-ec2-no-public-ip-subnet (terraform/main.tf)
HIGH: aws-vpc-no-public-egress-sgr (terraform/main.tf)  
HIGH: aws-ec2-no-public-ingress-sgr (terraform/main.tf)

Result: VULNERABILITIES DETECTED
```

### Final Scan (PASSED)

```
No misconfigurations found.

Result: ALL SECURITY CHECKS PASSED ✅
```

---

## 🤖 AI Usage Log

See [AI_REMEDIATION.md](AI_REMEDIATION.md) for:
- Exact AI prompts used
- Summary of identified risks
- How AI recommendations improved security

---

## 📝 License

MIT License
