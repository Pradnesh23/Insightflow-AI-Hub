# AI-Driven Security Remediation Guide

This document explains how to use **Gemini 2.5 Flash** to analyze Trivy security scan results and fix infrastructure vulnerabilities.

---

## 🔄 Remediation Workflow

```
┌────────────────┐     ┌─────────────────┐     ┌────────────────┐
│  Run Jenkins   │────►│  Trivy Detects  │────►│  Copy Report   │
│    Pipeline    │     │  Vulnerability  │     │  from Console  │
└────────────────┘     └─────────────────┘     └───────┬────────┘
                                                       │
                                                       ▼
┌────────────────┐     ┌─────────────────┐     ┌────────────────┐
│  Re-run        │◄────│  Apply Changes  │◄────│  Ask Gemini    │
│  Pipeline      │     │  to main.tf     │     │  2.5 Flash     │
└────────────────┘     └─────────────────┘     └────────────────┘
```

---

## 📋 Step 1: Get Trivy Report

After running the Jenkins pipeline, copy the vulnerability report from the console output.

**Example Trivy Report:**

```
terraform/main.tf (terraform)
=============================

Tests: 1 (SUCCESSES: 0, FAILURES: 1, EXCEPTIONS: 0)
Failures: 1 (CRITICAL: 0, HIGH: 1, MEDIUM: 0, LOW: 0, UNKNOWN: 0)

HIGH: aws-ec2-no-public-ingress-sgr
════════════════════════════════════════════════════════════════════════

An ingress security group rule allows traffic from /0.

See https://avd.aquasec.com/misconfig/avd-aws-0107

────────────────────────────────────────────────────────────────────────
 terraform/main.tf:95-102
────────────────────────────────────────────────────────────────────────
  95 ┃   ingress {
  96 ┃     description = "SSH Access - INSECURE"
  97 ┃     from_port   = 22
  98 ┃     to_port     = 22
  99 ┃     protocol    = "tcp"
 100 ┃     cidr_blocks = ["0.0.0.0/0"]
 101 ┃   }
────────────────────────────────────────────────────────────────────────
```

---

## 🤖 Step 2: AI Prompt for Gemini 2.5 Flash

Copy and paste the following prompt into Gemini 2.5 Flash:

### AI Prompt Template

```
You are a DevOps security expert. Analyze this Trivy security scan report from my Terraform infrastructure code and provide:

1. **Risk Analysis**: Explain each vulnerability and its potential security impact
2. **Severity Assessment**: Rate each issue (Critical/High/Medium/Low)
3. **Remediation Steps**: Provide the exact fixed Terraform code
4. **Best Practices**: Additional security recommendations

## Trivy Scan Report:

[PASTE YOUR TRIVY REPORT HERE]

## Current Terraform Code (terraform/main.tf):

```hcl
resource "aws_security_group" "app" {
  name        = "${var.app_name}-sg"
  description = "Security group for InsightFlow AI Hub"
  vpc_id      = aws_vpc.main.id

  # SSH access - currently insecure
  ingress {
    description = "SSH Access - INSECURE"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # ... other rules
}
```

Please provide the corrected, secure version of this code.
```

---

## 📝 Step 3: Expected AI Response

Gemini 2.5 Flash will provide an analysis like:

### Risk Analysis

| Vulnerability | Risk Level | Description |
|--------------|------------|-------------|
| SSH open to 0.0.0.0/0 | **HIGH** | Allows SSH access from any IP address globally. Attackers can brute-force credentials or exploit SSH vulnerabilities. |

### Security Impact

1. **Unauthorized Access**: Any attacker can attempt SSH connections
2. **Brute Force Attacks**: Exposed to automated password guessing
3. **Compliance Violation**: Fails PCI-DSS, SOC2, and other standards
4. **Lateral Movement**: If compromised, becomes entry point to network

### Recommended Fix

```hcl
# ✅ SECURE: SSH restricted to specific IP or CIDR
ingress {
  description = "SSH Access - Restricted to Admin IP"
  from_port   = 22
  to_port     = 22
  protocol    = "tcp"
  cidr_blocks = ["YOUR_PUBLIC_IP/32"]  # Replace with your actual IP
}
```

### Get Your Public IP

```powershell
# PowerShell
(Invoke-WebRequest -Uri "https://api.ipify.org").Content
```

---

## ✏️ Step 4: Apply the Fix

Edit `terraform/main.tf` and update the security group:

**Before:**
```hcl
cidr_blocks = ["0.0.0.0/0"]  # INSECURE
```

**After:**
```hcl
cidr_blocks = ["YOUR_IP/32"]  # e.g., "203.0.113.50/32"
```

---

## ✅ Step 5: Verify the Fix

1. **Re-run Jenkins Pipeline**
2. **Check Console Output** for:
   ```
   ✅ SECURITY SCAN PASSED - No critical issues found
   ```
3. **Take Screenshots** for documentation

---

## 📊 Summary of Identified Risks

| Issue | Severity | Status |
|-------|----------|--------|
| SSH (port 22) open to 0.0.0.0/0 | HIGH | ✅ Fixed |
| Unencrypted EBS volume | MEDIUM | ⚠️ Optional |

---

## 🔐 How AI Recommendations Improved Security

1. **Restricted SSH Access**: Changed from open (`0.0.0.0/0`) to specific IP (`YOUR_IP/32`)
2. **Reduced Attack Surface**: Only authorized IPs can attempt SSH connections
3. **Compliance Ready**: Now meets security framework requirements
4. **Defense in Depth**: Added comments explaining security measures

---

## 📸 Documentation Screenshots

After completing remediation, capture screenshots of:

1. **Initial failing Jenkins scan** (Build #1)
2. **AI prompt and response** (Gemini chat)
3. **Final passing Jenkins scan** (Build #2)

Save screenshots to `/docs/screenshots/` for project documentation.
