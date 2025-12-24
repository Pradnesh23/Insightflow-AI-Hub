# Complete DevOps Setup Guide - InsightFlow-AI-Hub

Step-by-step guide to set up and run the complete DevOps pipeline.

---

## 📋 Prerequisites Checklist

| Tool | Status | Version |
|------|--------|---------|
| Docker Desktop | ✅ Installed | Latest |
| Jenkins | ✅ Installed | Latest |
| Terraform | ❓ Need to install | 1.6+ |
| AWS CLI | ❓ Need to install | 2.x |
| Git | ✅ (assumed) | Latest |

---

# PART 1: INSTALLATIONS

## 1️⃣ Install Terraform (Windows)

### Option A: Using Chocolatey (Recommended)
```powershell
# Run PowerShell as Administrator
choco install terraform -y

# Verify installation
terraform --version
```

### Option B: Manual Download
1. Go to: https://developer.hashicorp.com/terraform/downloads
2. Download **Windows AMD64** zip file
3. Extract to `C:\terraform\`
4. Add to PATH:
```powershell
# Run PowerShell as Administrator
[System.Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\terraform", "Machine")
```
5. Restart PowerShell and verify:
```powershell
terraform --version
# Expected: Terraform v1.6.x
```

---

## 2️⃣ Install AWS CLI

### Option A: Using MSI Installer (Recommended)
1. Download: https://awscli.amazonaws.com/AWSCLIV2.msi
2. Run the installer
3. Verify:
```powershell
aws --version
# Expected: aws-cli/2.x.x
```

### Option B: Using Chocolatey
```powershell
choco install awscli -y
aws --version
```

---

## 3️⃣ Trivy (No Installation Needed!)

Trivy runs inside Docker - already handled by `docker-compose.jenkins.yml`.

To test locally:
```powershell
# This will pull and run Trivy
docker run --rm aquasec/trivy:latest --version
```

---

# PART 2: AWS FREE TIER SETUP

## Step 1: Create AWS Account

1. Go to: https://aws.amazon.com/free/
2. Click **Create a Free Account**
3. Enter email and password
4. Provide payment info (won't be charged for Free Tier)
5. Complete phone verification
6. Select **Basic Support (Free)**

> **⚠️ Important**: AWS Free Tier includes 750 hours/month of t2.micro EC2 for 12 months

---

## Step 2: Create IAM User for Terraform

1. Go to AWS Console → **IAM** → **Users**
2. Click **Create user**
3. User name: `terraform-user`
4. Click **Next**
5. Select **Attach policies directly**
6. Search and select:
   - `AmazonEC2FullAccess`
   - `AmazonVPCFullAccess`
7. Click **Next** → **Create user**

---

## Step 3: Create Access Keys

1. Click on `terraform-user`
2. Go to **Security credentials** tab
3. Click **Create access key**
4. Select **Command Line Interface (CLI)**
5. Check the confirmation box
6. Click **Create access key**
7. **SAVE BOTH KEYS** (you won't see them again!):
   - Access Key ID: `AKIA...`
   - Secret Access Key: `wJalrXUtnFE...`

---

## Step 4: Configure AWS CLI

```powershell
aws configure
```

Enter when prompted:
```
AWS Access Key ID [None]: YOUR_ACCESS_KEY_ID
AWS Secret Access Key [None]: YOUR_SECRET_ACCESS_KEY
Default region name [None]: us-east-1
Default output format [None]: json
```

Verify configuration:
```powershell
aws sts get-caller-identity
# Should show your account info
```

---

## Step 5: Create EC2 Key Pair

```powershell
# Create key pair for SSH access
aws ec2 create-key-pair --key-name insightflow-key --query 'KeyMaterial' --output text > $HOME\.ssh\insightflow-key.pem

# Set permissions (PowerShell)
icacls $HOME\.ssh\insightflow-key.pem /inheritance:r /grant:r "$($env:USERNAME):(R)"
```

---

# PART 3: JENKINS PIPELINE SETUP

## Step 1: Start Jenkins (if not running)

Since you have Jenkins installed, start it. If using Docker:
```powershell
cd c:\Users\prads\OneDrive\Desktop\InsightFlow-AI-Hub
docker-compose -f docker-compose.jenkins.yml up -d
```

Access: **http://localhost:8080**

---

## Step 2: Get Initial Admin Password

If first time:
```powershell
# For Docker-based Jenkins
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# For Windows Service Jenkins
type "C:\ProgramData\Jenkins\.jenkins\secrets\initialAdminPassword"
```

---

## Step 3: Install Required Jenkins Plugins

1. Go to **Manage Jenkins** → **Plugins** → **Available plugins**
2. Search and install:
   - ✅ **Pipeline**
   - ✅ **Git**
   - ✅ **Docker Pipeline**
   - ✅ **AWS Credentials**
   - ✅ **Credentials Binding**
3. Restart Jenkins after installation

---

## Step 4: Add AWS Credentials to Jenkins

1. Go to **Manage Jenkins** → **Credentials**
2. Click **(global)** → **Add Credentials**
3. Select **AWS Credentials**
4. Fill in:
   - **ID**: `aws-credentials`
   - **Description**: `AWS Terraform Access`
   - **Access Key ID**: Your AWS access key
   - **Secret Access Key**: Your AWS secret key
5. Click **Create**

---

## Step 5: Create Pipeline Job

1. Click **New Item** (left sidebar)
2. Enter name: `InsightFlow-Security-Pipeline`
3. Select **Pipeline**
4. Click **OK**

---

## Step 6: Configure Pipeline

### Option A: From Git Repository (Recommended)

1. Under **Pipeline** section:
   - **Definition**: `Pipeline script from SCM`
   - **SCM**: `Git`
   - **Repository URL**: `https://github.com/YOUR_USERNAME/InsightFlow-AI-Hub.git`
   - **Branch**: `*/main`
   - **Script Path**: `Jenkinsfile`
2. Click **Save**

### Option B: Direct Script (for testing)

1. Under **Pipeline** section:
   - **Definition**: `Pipeline script`
   - Paste the contents of your `Jenkinsfile`
2. Click **Save**

---

## Step 7: Run the Pipeline (First Run - Will FAIL)

1. Click **Build Now** (left sidebar)
2. Click on the build number (e.g., `#1`)
3. Click **Console Output**
4. Watch the stages execute:
   - ✅ Checkout
   - ❌ Infrastructure Security Scan (WILL FAIL - expected!)
   - ⏸️ Terraform Plan (skipped due to failure)

---

## Step 8: Review Trivy Report

In the console output, you'll see:

```
────────────────────────────────────────────────────────────────────────
 terraform/main.tf:95-102
────────────────────────────────────────────────────────────────────────
  95 ┃   ingress {
  96 ┃     description = "SSH Access - INSECURE"
  97 ┃     from_port   = 22
  98 ┃     to_port     = 22
  99 ┃     protocol    = "tcp"
 100 ┃     cidr_blocks = ["0.0.0.0/0"]  ← VULNERABILITY!
 101 ┃   }
────────────────────────────────────────────────────────────────────────

HIGH: aws-ec2-no-public-ingress-sgr
```

**📸 Take a screenshot of this for your documentation!**

---

# PART 4: AI REMEDIATION WITH GEMINI 2.5 FLASH

## Step 1: Open Gemini

Go to: https://gemini.google.com/

---

## Step 2: Use This Prompt

Copy and paste:

```
You are a DevOps security expert. I ran Trivy security scan on my Terraform code and found this vulnerability:

HIGH: aws-ec2-no-public-ingress-sgr
Location: terraform/main.tf lines 95-102

Current insecure code:
```hcl
ingress {
  description = "SSH Access - INSECURE"
  from_port   = 22
  to_port     = 22
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
}
```

Please:
1. Explain the security risk of this configuration
2. Provide the corrected, secure Terraform code
3. Explain why the fix improves security
```

---

## Step 3: Apply the Fix

Gemini will recommend changing `0.0.0.0/0` to your specific IP.

**Get your public IP:**
```powershell
(Invoke-WebRequest -Uri "https://api.ipify.org").Content
```

**Edit** `terraform/main.tf` (line 100):

```hcl
# BEFORE (insecure)
cidr_blocks = ["0.0.0.0/0"]

# AFTER (secure)
cidr_blocks = ["YOUR_PUBLIC_IP/32"]  # e.g., "103.25.47.128/32"
```

---

## Step 4: Commit and Push

```powershell
cd c:\Users\prads\OneDrive\Desktop\InsightFlow-AI-Hub
git add terraform/main.tf
git commit -m "Fix: Restrict SSH access to specific IP"
git push
```

---

## Step 5: Re-run Pipeline (Will PASS ✅)

1. Go back to Jenkins
2. Click **Build Now**
3. Watch console output:
   - ✅ Checkout
   - ✅ Infrastructure Security Scan (PASSES!)
   - ✅ Terraform Plan

**📸 Take a screenshot of the passing pipeline!**

---

# PART 5: TERRAFORM COMMANDS (Local Testing)

## Initialize Terraform
```powershell
cd c:\Users\prads\OneDrive\Desktop\InsightFlow-AI-Hub\terraform
terraform init
```

## Validate Configuration
```powershell
terraform validate
```

## Preview Changes
```powershell
terraform plan
```

## Apply Infrastructure (Actually Deploy to AWS)
```powershell
terraform apply
# Type 'yes' when prompted
```

## Destroy Infrastructure (Clean Up)
```powershell
terraform destroy
# Type 'yes' when prompted
```

---

# PART 6: TRIVY LOCAL TESTING

## Scan Terraform Files
```powershell
cd c:\Users\prads\OneDrive\Desktop\InsightFlow-AI-Hub

docker run --rm -v ${PWD}/terraform:/terraform aquasec/trivy:latest config /terraform
```

## Scan with Severity Filter
```powershell
docker run --rm -v ${PWD}/terraform:/terraform aquasec/trivy:latest config --severity CRITICAL,HIGH /terraform
```

---

# 📊 Summary - Complete Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVOPS PIPELINE WORKFLOW                     │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
   ┌──────────┐        ┌───────────┐       ┌───────────┐
   │  SETUP   │        │  JENKINS  │       │  DEPLOY   │
   │ (Once)   │        │ (CI/CD)   │       │ (Optional)│
   └────┬─────┘        └─────┬─────┘       └─────┬─────┘
        │                    │                   │
        ▼                    ▼                   ▼
   1. Install Terraform  1. Create Job      1. terraform apply
   2. Install AWS CLI    2. Build #1 FAIL   2. Verify in AWS
   3. AWS Credentials    3. AI Remediation  3. terraform destroy
   4. Create Key Pair    4. Build #2 PASS
```

---

# ❓ Troubleshooting

## Terraform: "Access Denied"
```powershell
# Verify AWS credentials
aws sts get-caller-identity
```

## Docker: "permission denied"
```powershell
# Run Docker Desktop as Administrator
# Or add your user to docker-users group
```

## Jenkins: "Docker not found"
```powershell
# Install Docker CLI in Jenkins container
docker exec -u root jenkins apt-get update
docker exec -u root jenkins apt-get install -y docker.io
```

## Trivy: No output
```powershell
# Pull latest image
docker pull aquasec/trivy:latest
```
