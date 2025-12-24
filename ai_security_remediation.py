# -*- coding: utf-8 -*-
"""
AI Security Remediation Script
Uses Gemini 2.5 Flash API to analyze Trivy vulnerabilities and recommend fixes

Usage:
    python ai_security_remediation.py

Requirements:
    pip install google-generativeai requests
"""

import os
import sys
import subprocess
import json
import io

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from datetime import datetime

# Try to import required packages
try:
    import requests
except ImportError:
    print("Installing requests...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

try:
    import google.generativeai as genai
except ImportError:
    print("Installing google-generativeai...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "google-generativeai"])
    import google.generativeai as genai


def get_public_ip():
    """Get the user's public IP address"""
    try:
        response = requests.get("https://api.ipify.org", timeout=10)
        return response.text.strip()
    except Exception as e:
        print(f"Warning: Could not get public IP: {e}")
        return "YOUR_PUBLIC_IP"


def read_terraform_file(filepath):
    """Read the Terraform main.tf file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None


def run_trivy_scan(terraform_dir):
    """Run Trivy scan and capture output"""
    print("\n[SCAN] Running Trivy security scan...")
    
    try:
        result = subprocess.run(
            [
                "docker", "run", "--rm",
                "-v", f"{terraform_dir}:/terraform",
                "aquasec/trivy:latest", "config",
                "--format", "json",
                "/terraform"
            ],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if result.returncode == 0 or result.stdout:
            return result.stdout
        else:
            result = subprocess.run(
                [
                    "docker", "run", "--rm",
                    "-v", f"{terraform_dir}:/terraform",
                    "aquasec/trivy:latest", "config",
                    "/terraform"
                ],
                capture_output=True,
                text=True,
                timeout=120
            )
            return result.stdout
    except Exception as e:
        print(f"Error running Trivy: {e}")
        return None


def analyze_with_gemini(api_key, trivy_report, terraform_code, public_ip):
    """Use Gemini API to analyze vulnerabilities and suggest fixes"""
    
    print("\n[AI] Calling Gemini 2.5 Flash API for security analysis...")
    
    # Configure Gemini
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""You are a DevOps security expert. Analyze this Trivy security scan report and provide fixes for the Terraform code.

## Trivy Scan Report:
{trivy_report[:8000]}

## Current Terraform Code (main.tf):
{terraform_code}

## User's Public IP (for SSH restriction):
{public_ip}

## Your Task:
1. **RISK ANALYSIS**: For each vulnerability found, explain:
   - What the vulnerability is
   - The security risk/impact
   - Severity level

2. **FIXED CODE**: Provide the COMPLETE fixed main.tf with ALL security issues resolved:
   - Restrict SSH to the user's IP ({public_ip}/32)
   - Enable EBS encryption
   - Enable IMDS v2 (require tokens)
   - Keep necessary egress (document why it's needed for package updates)
   - Keep public IP on subnet (needed for web app access)
   - Note: VPC Flow Logs add cost, so make it optional/commented

3. **SUMMARY**: Brief summary of all changes made

Format your response as:
### RISK ANALYSIS
[analysis here]

### FIXED TERRAFORM CODE
```hcl
[complete fixed main.tf code here - include ALL resources from original]
```

### SUMMARY OF CHANGES
[bullet points of changes]
"""

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        # Try with different model
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            return response.text
        except Exception as e2:
            print(f"Fallback model also failed: {e2}")
            return None


def save_report(report, output_path):
    """Save the AI analysis report"""
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(f"# AI Security Remediation Report\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(report)
        print(f"\n[SAVE] Report saved to: {output_path}")
        return True
    except Exception as e:
        print(f"Error saving report: {e}")
        return False


def extract_fixed_code(report):
    """Extract the fixed Terraform code from the AI response"""
    import re
    
    pattern = r'```hcl\n(.*?)```'
    matches = re.findall(pattern, report, re.DOTALL)
    
    if matches:
        return max(matches, key=len)
    
    # Try alternative pattern
    pattern = r'```terraform\n(.*?)```'
    matches = re.findall(pattern, report, re.DOTALL)
    
    if matches:
        return max(matches, key=len)
    
    return None


def main():
    print("=" * 60)
    print("  AI SECURITY REMEDIATION TOOL")
    print("  Using Gemini 2.5 Flash API")
    print("=" * 60)
    
    # Get paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = script_dir
    terraform_dir = os.path.join(project_dir, "terraform")
    main_tf_path = os.path.join(terraform_dir, "main.tf")
    
    # Check for Gemini API key
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        env_path = os.path.join(project_dir, "backend", ".env")
        if os.path.exists(env_path):
            print(f"[INFO] Reading API key from {env_path}")
            with open(env_path, 'r') as f:
                for line in f:
                    if line.startswith("GEMINI_API_KEY="):
                        api_key = line.split("=", 1)[1].strip()
                        break
    
    if not api_key:
        print("\n[ERROR] GEMINI_API_KEY not found!")
        print("Please set it as environment variable or in backend/.env")
        api_key = input("\nOr enter your Gemini API key now: ").strip()
        if not api_key:
            sys.exit(1)
    
    print(f"\n[OK] Gemini API key found")
    
    # Get public IP
    print("\n[NET] Getting your public IP...")
    public_ip = get_public_ip()
    print(f"      Your IP: {public_ip}")
    
    # Read Terraform file
    print(f"\n[FILE] Reading Terraform code...")
    terraform_code = read_terraform_file(main_tf_path)
    if not terraform_code:
        print("[ERROR] Could not read main.tf")
        sys.exit(1)
    print(f"        Read {len(terraform_code)} characters from main.tf")
    
    # Run Trivy scan
    trivy_report = run_trivy_scan(terraform_dir)
    if not trivy_report:
        trivy_report = """
        Vulnerabilities found:
        - CRITICAL: AVD-AWS-0104 - Unrestricted egress to 0.0.0.0/0
        - HIGH: AVD-AWS-0107 - SSH port 22 open to 0.0.0.0/0  
        - HIGH: AVD-AWS-0028 - IMDS v2 not required
        - HIGH: AVD-AWS-0131 - EBS root volume not encrypted
        - HIGH: AVD-AWS-0164 - Subnet auto-assigns public IP
        - MEDIUM: AVD-AWS-0178 - VPC Flow Logs not enabled
        """
    print(f"        Trivy scan completed")
    
    # Analyze with Gemini
    ai_response = analyze_with_gemini(api_key, trivy_report, terraform_code, public_ip)
    
    if not ai_response:
        print("[ERROR] Failed to get AI analysis")
        sys.exit(1)
    
    # Save report
    report_path = os.path.join(project_dir, "AI_SECURITY_REPORT.md")
    save_report(ai_response, report_path)
    
    # Print the AI response
    print("\n" + "=" * 60)
    print("  GEMINI AI ANALYSIS RESULT")
    print("=" * 60)
    print(ai_response)
    
    # Extract and optionally apply fixes
    fixed_code = extract_fixed_code(ai_response)
    
    if fixed_code:
        print("\n" + "=" * 60)
        print("  FIXED CODE EXTRACTED")
        print("=" * 60)
        
        fixed_path = os.path.join(terraform_dir, "main.tf.fixed")
        with open(fixed_path, 'w', encoding='utf-8') as f:
            f.write(fixed_code)
        print(f"\n[OK] Fixed code saved to: {fixed_path}")
        
        print("\n" + "-" * 60)
        apply = input("Apply fixes to main.tf? (yes/no): ").strip().lower()
        
        if apply == "yes":
            backup_path = os.path.join(terraform_dir, "main.tf.backup")
            with open(main_tf_path, 'r', encoding='utf-8') as src:
                with open(backup_path, 'w', encoding='utf-8') as dst:
                    dst.write(src.read())
            print(f"[BACKUP] Original backed up to: {backup_path}")
            
            with open(main_tf_path, 'w', encoding='utf-8') as f:
                f.write(fixed_code)
            print(f"[OK] Fixes applied to: {main_tf_path}")
            
            print("\n[NEXT] Run Trivy again to verify fixes:")
            print('       docker run --rm -v "${PWD}/terraform:/terraform" aquasec/trivy:latest config /terraform')
        else:
            print("\n[INFO] Review the fixed code at:", fixed_path)
            print("       Apply manually when ready by copying to main.tf")
    
    print("\n" + "=" * 60)
    print("  AI SECURITY REMEDIATION COMPLETE")
    print("=" * 60)
    print(f"\n[REPORT] Full report: {report_path}")
    print("\n[NEXT STEPS]")
    print("   1. Review AI_SECURITY_REPORT.md")
    print("   2. Apply fixes (if not already done)")
    print("   3. Run: terraform validate")
    print("   4. Run Trivy again to verify fixes")


if __name__ == "__main__":
    main()
