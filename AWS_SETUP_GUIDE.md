# AWS Free Tier Account - Step-by-Step Guide

## 🎯 Creating Your AWS Free Tier Account

![AWS Free Tier Signup Page](file:///C:/Users/prads/.gemini/antigravity/brain/ad2000c9-ad0c-4d5e-870f-dbb22dc94b48/aws_free_tier_signup_1766081310704.png)

---

## Step 1: Start Signup

1. Go to: **https://aws.amazon.com/free/**
2. Click **"Create a Free Account"** (orange button)

---

## Step 2: Enter Account Details

| Field | What to Enter |
|-------|---------------|
| Email address | Your email |
| AWS account name | `InsightFlow-DevOps` (or any name) |

Click **"Verify email address"** → Check your email for code → Enter it

---

## Step 3: Create Root User Password

- Create a strong password (8+ chars, uppercase, lowercase, numbers)
- Click **Continue**

---

## Step 4: Contact Information

1. Select **Personal** (for learning/testing)
2. Fill in:
   - Full name
   - Phone number
   - Country
   - Address
3. Check the agreement box
4. Click **Continue**

---

## Step 5: Payment Information

> ⚠️ **Don't worry!** AWS requires a card for verification but **won't charge you** for Free Tier usage.

Enter:
- Credit/Debit card number
- Expiry date
- Cardholder name

Click **Verify and Continue**

---

## Step 6: Phone Verification

1. Enter your phone number
2. Complete CAPTCHA
3. You'll receive a call or SMS with a code
4. Enter the verification code
5. Click **Continue**

---

## Step 7: Select Support Plan

**Choose: "Basic support - Free"** ✅

Click **Complete sign up**

---

## 🎉 Account Created!

You'll see a confirmation page. Now you need to:

1. Wait 1-2 minutes for account activation
2. Sign in to AWS Console: **https://console.aws.amazon.com/**

---

## Step 8: Create IAM User (Security Best Practice)

After signing in:

1. Search for **"IAM"** in the top search bar
2. Click **Users** → **Create user**
3. User name: `terraform-user`
4. Click **Next**
5. Select **"Attach policies directly"**
6. Search and check: ✅ `AmazonEC2FullAccess` and ✅ `AmazonVPCFullAccess`
7. Click **Next** → **Create user**

---

## Step 9: Create Access Keys

1. Click on your new user (`terraform-user`)
2. Go to **"Security credentials"** tab
3. Scroll to **"Access keys"**
4. Click **"Create access key"**
5. Select **"Command Line Interface (CLI)"**
6. Check the confirmation ✅
7. Click **Create access key**
8. **SAVE THESE KEYS!** (Download CSV or copy both):
   - Access Key ID: `AKIA...`
   - Secret Access Key: `wJal...`

---

## Step 10: Configure AWS CLI

After you have your keys, run in PowerShell:

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

Verify it works:
```powershell
aws sts get-caller-identity
```

---

## ✅ Done! 

After completing these steps, come back and tell me you're ready for the next step (running Trivy scan)!
