# InsightFlow Setup Guide

Complete step-by-step guide to set up InsightFlow locally and deploy to production.

## Local Development Setup

### Step 1: Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- Git ([Download](https://git-scm.com/))
- A code editor (VS Code recommended)

### Step 2: Clone Repository
\`\`\`bash
git clone https://github.com/yourusername/insightflow-ai-hub.git
cd insightflow-ai-hub
\`\`\`

### Step 3: Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Step 4: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for the project to initialize
4. Go to Project Settings → API
5. Copy:
   - Project URL → \`NEXT_PUBLIC_SUPABASE_URL\`
   - Anon Key → \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
   - Service Role Key → \`SUPABASE_SERVICE_ROLE_KEY\`

### Step 5: Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key → \`GEMINI_API_KEY\`

### Step 6: Configure Environment Variables

Create \`.env.local\`:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit \`.env.local\` with your values:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/sign-up-success
GEMINI_API_KEY=your_gemini_key_here
\`\`\`

### Step 7: Set Up Database

1. In Supabase, go to SQL Editor
2. Run each script in order:

**Script 1: Create Tables**
- Open \`scripts/001_create_tables.sql\`
- Copy all content
- Paste in Supabase SQL Editor
- Click "Run"

**Script 2: Create Meetings Table**
- Open \`scripts/002_create_meetings_table.sql\`
- Copy and run in Supabase

**Script 3: Add Company Name Column**
- Open \`scripts/003_add_company_name_to_meetings.sql\`
- Copy and run in Supabase

**Script 4: Create Reports & Dashboards**
- Open \`scripts/004_create_reports_dashboards_schema.sql\`
- Copy and run in Supabase

### Step 8: Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

### Step 9: Create Test Account

1. Click "Sign Up"
2. Enter email and password
3. Verify email (check spam folder)
4. Log in

## Production Deployment

### Deploy to Vercel

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository

3. **Add Environment Variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add all variables from \`.env.example\`:
     - NEXT_PUBLIC_SUPABASE_URL
     - NEXT_PUBLIC_SUPABASE_ANON_KEY
     - SUPABASE_SERVICE_ROLE_KEY
     - GEMINI_API_KEY
     - NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL (update to production URL)

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app is live!

### Update Auth Redirect URL

After deployment, update the redirect URL:

1. In \`.env.local\`, change:
   \`\`\`env
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://your-vercel-app.vercel.app/auth/sign-up-success
   \`\`\`

2. In Supabase, go to Authentication → URL Configuration
3. Add your Vercel URL to "Redirect URLs"

## Troubleshooting

### Port Already in Use
\`\`\`bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
npm run dev
\`\`\`

### Database Connection Error
- Verify all Supabase credentials in \`.env.local\`
- Check that database scripts have been run
- Ensure Supabase project is active

### Gemini API Errors
- Verify API key is correct
- Check that API key has quota remaining
- Ensure API is enabled in Google Cloud Console

### Build Errors
\`\`\`bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
\`\`\`

## Next Steps

1. Customize branding (logo, colors, company name)
2. Set up email notifications for scheduled reports
3. Configure backup strategy for Supabase
4. Set up monitoring and analytics
5. Create user documentation

## Support

For issues or questions:
- Check the README.md
- Open an issue on GitHub
- Contact support@insightflow.ai
