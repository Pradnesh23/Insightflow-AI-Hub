# Complete DevOps Pipeline Execution Guide
# Run these commands in order to demonstrate the full workflow

## =====================================================
## STEP 1: VERIFY TOOLS ARE INSTALLED
## =====================================================

# Check Terraform
& "C:\Users\prads\Downloads\terraform_1.14.3_windows_amd64\terraform.exe" --version

# Check AWS CLI
& "C:\Program Files\Amazon\AWSCLIV2\aws.exe" --version

# Check Docker
docker --version

## =====================================================
## STEP 2: CONFIGURE AWS (if session expired)
## =====================================================

# Run AWS configure (enter your Access Key, Secret Key, us-east-1, json)
& "C:\Program Files\Amazon\AWSCLIV2\aws.exe" configure

# Verify AWS credentials work
& "C:\Program Files\Amazon\AWSCLIV2\aws.exe" sts get-caller-identity

## =====================================================
## STEP 3: RESTORE VULNERABLE CODE (for "BEFORE" screenshot)
## =====================================================

# Navigate to project
cd c:\Users\prads\OneDrive\Desktop\InsightFlow-AI-Hub

# Restore the vulnerable code
Copy-Item "terraform\main.tf.backup" "terraform\main.tf" -Force
Write-Host "Vulnerable code restored for BEFORE screenshot!"

## =====================================================
## STEP 4: RUN TRIVY SCAN - BEFORE (WILL SHOW VULNERABILITIES)
## =====================================================

# Start Docker Desktop first if not running!
# Run Trivy scan - THIS IS YOUR "BEFORE" SCREENSHOT
docker run --rm -v "${PWD}/terraform:/terraform" aquasec/trivy:latest config /terraform

# TAKE SCREENSHOT NOW! (Press PrtScn or Win+Shift+S)
# This should show 6 vulnerabilities including SSH open to 0.0.0.0/0

## =====================================================
## STEP 5: APPLY AI FIXES
## =====================================================

# Apply the fixed code
Copy-Item "terraform\main.tf.fixed" "terraform\main.tf" -Force
Write-Host "AI-recommended fixes applied!"

## =====================================================
## STEP 6: RUN TRIVY SCAN - AFTER (WILL SHOW FEWER ISSUES)
## =====================================================

# Run Trivy scan again - THIS IS YOUR "AFTER" SCREENSHOT
docker run --rm -v "${PWD}/terraform:/terraform" aquasec/trivy:latest config /terraform

# TAKE SCREENSHOT NOW!
# SSH vulnerability should be FIXED (restricted to your IP)

## =====================================================
## STEP 7: VALIDATE TERRAFORM
## =====================================================

cd terraform
& "C:\Users\prads\Downloads\terraform_1.14.3_windows_amd64\terraform.exe" init
& "C:\Users\prads\Downloads\terraform_1.14.3_windows_amd64\terraform.exe" validate
& "C:\Users\prads\Downloads\terraform_1.14.3_windows_amd64\terraform.exe" plan
cd ..

## =====================================================
## STEP 8: START JENKINS
## =====================================================

# Start Jenkins with Docker Compose
docker-compose -f docker-compose.jenkins.yml up -d

# Wait 30-60 seconds for Jenkins to start
Start-Sleep -Seconds 30

# Get Jenkins admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# Open Jenkins in browser
Start-Process "http://localhost:8080"

## =====================================================
## STEP 9: JENKINS PIPELINE SETUP (IN BROWSER)
## =====================================================

# 1. Enter admin password from above
# 2. Install suggested plugins
# 3. Create admin user
# 4. Go to: Manage Jenkins > Plugins > Available
#    Install: Pipeline, Git, Docker Pipeline
# 5. Go to: Manage Jenkins > Credentials > System > Global
#    Add AWS Credentials (ID: aws-credentials)
# 6. New Item > "InsightFlow-Security-Pipeline" > Pipeline
# 7. Pipeline Definition: Pipeline script from SCM
#    - SCM: Git
#    - Repository URL: file:///c:/Users/prads/OneDrive/Desktop/InsightFlow-AI-Hub
#    - Branch: */main
#    - Script Path: Jenkinsfile
# 8. Save and Build Now

## =====================================================
## STEP 10: STOP JENKINS (when done)
## =====================================================

docker-compose -f docker-compose.jenkins.yml down
