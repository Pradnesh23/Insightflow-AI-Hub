# Jenkins Setup Guide for InsightFlow-AI-Hub

This guide explains how to set up and run the Jenkins CI/CD pipeline for security scanning.

## Quick Start

### 1. Start Jenkins

```powershell
cd c:\Users\prads\OneDrive\Desktop\InsightFlow-AI-Hub
docker-compose -f docker-compose.jenkins.yml up -d
```

### 2. Get Initial Admin Password

```powershell
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### 3. Access Jenkins

Open: **http://localhost:8080**

## Jenkins Configuration

### Install Required Plugins

1. Go to **Manage Jenkins** → **Plugins** → **Available plugins**
2. Install:
   - **Pipeline**
   - **Git**
   - **Docker Pipeline**
   - **AWS Credentials** (for Terraform)
   - **Credentials Binding**

### Configure AWS Credentials

1. Go to **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. Click **Add Credentials**
3. Select **AWS Credentials**
4. Enter:
   - ID: `aws-credentials`
   - Access Key ID: *your AWS access key*
   - Secret Access Key: *your AWS secret key*

### Create Pipeline Job

1. Click **New Item**
2. Enter name: `InsightFlow-Security-Pipeline`
3. Select **Pipeline** → Click **OK**
4. Configure:
   - **Pipeline** → **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: Your GitHub repo URL
   - **Branch**: `*/main`
   - **Script Path**: `Jenkinsfile`
5. Click **Save**

## Running the Pipeline

1. Click **Build Now**
2. Monitor progress in **Console Output**
3. Review Trivy security scan results

## Expected Results

### First Run (Before AI Remediation)

The pipeline will **detect security vulnerabilities**:
- SSH port 22 open to `0.0.0.0/0`
- Build status: **UNSTABLE**

### After AI Remediation

1. Copy Trivy report
2. Use Gemini 2.5 Flash to get fixes
3. Apply fixes to `terraform/main.tf`
4. Re-run pipeline
5. Build status: **SUCCESS**

## Troubleshooting

### Docker not found in Jenkins

```powershell
docker exec -it jenkins bash
curl -fsSL https://get.docker.com | sh
```

### Permission denied for Docker socket

```powershell
docker exec -it -u root jenkins chmod 666 /var/run/docker.sock
```

## Stop Jenkins

```powershell
docker-compose -f docker-compose.jenkins.yml down
```

## Cleanup (Remove all data)

```powershell
docker-compose -f docker-compose.jenkins.yml down -v
```
