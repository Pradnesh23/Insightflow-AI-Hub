# InsightFlow - AI-Powered Analytics Platform

A comprehensive AI-powered analytics platform with intelligent agents for data analysis, meeting preparation, report generation, and real-time dashboards.

## ✨ Features

### 📊 Core Analytics
- **Data Upload & Analysis** - Upload CSV, Excel, and other data formats with automatic profiling
- **15+ Visualization Types** - AI-recommended charts including bar, line, area, pie, scatter, radar, stacked bar/area, and more
- **Smart Chart Selection** - Top 3 best visualizations displayed with dropdown to explore 12+ alternatives
- **Statistical Analysis** - Mean, median, standard deviation, quartiles, and distribution metrics
- **Correlation Analysis** - Identify relationships between variables with correlation matrices
- **Outlier Detection** - Find anomalies and unusual patterns in your data
- **Interactive Charts** - Fully responsive Recharts with tooltips, legends, and zoom capabilities

### 🤖 AI Agents
- **Meeting Agent** 
  - AI-generated meeting agendas with timeline format
  - Structured discussion points for each agenda item (3-5 bullets per section)
  - Company context-aware research including:
    - Industry Trends (4-5 insights)
    - Best Practices (4-5 recommendations)
    - Potential Challenges (3-4 risks)
    - Actionable Recommendations (4-5 action items)
  - Support for company file uploads (PDF, DOCX, XLSX) for better context
  - Participant tracking and role management
  - **Export to PDF/DOCX** with professional formatting
  - **Auto-saved to Memory Explorer** for future reference
  
- **Data Quality Agent** - Automated data quality assessment (0-100 score) with recommendations
- **Report Generator Agent** - Professional report generation with AI insights
- **AI Chat with Memory** - Conversational data analysis with persistent context

### 🧠 Memory Explorer
- **Unified Meeting Storage** - Each meeting saved as single memory (not separate insights)
- **Click-to-View** - Click any meeting card to see full agenda and research
- **Smart Search & Filter** - Search by company, topic, or memory type
- **Metadata Rich** - Company names, participants, dates, and content previews
- **Bulk Cleanup** - One-click deletion of old/outdated memories
- **Meeting Management** - Delete meetings directly from detail view
- **Export Options** - Download meetings as PDF or DOCX

### 📈 Enterprise Features
- **Data Export** - Export analyses to PDF, Excel, CSV with custom formatting
- **Scheduled Reports** - Automated report generation (daily/weekly/monthly) with email delivery
- **Real-time Dashboards** - Live data monitoring with custom widgets and auto-refresh
- **Company Context** - Upload company documents for personalized AI insights
- **Hydration-Safe Date Formatting** - Consistent date display across server/client

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI Components**: shadcn/ui, Radix UI
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.0 Flash API
- **Charts**: Recharts
- **Export**: jsPDF, XLSX
- **Authentication**: Supabase Auth

## Prerequisites

- Node.js 18+ or higher
- npm or pnpm package manager
- Supabase account (free tier available)
- Google Gemini API key (free tier available)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/insightflow-ai-hub.git
cd insightflow-ai-hub
```

### 2. Install Dependencies

**Important:** Use `--legacy-peer-deps` flag due to React 19 compatibility:

```bash
npm install --legacy-peer-deps
# or
pnpm install
```

**Required packages:**
- `react-is` (for Recharts compatibility)
- `docx` (for DOCX export)
- `file-saver` (for file downloads)
- `jspdf` (for PDF generation)

### 3. Set Up Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit \`.env.local\` with your actual values:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/sign-up-success
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Set Up Supabase Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and API keys from **Project Settings → API**
3. **Configure Authentication**:
   - Go to **Authentication → URL Configuration**
   - Set **Site URL** to `http://localhost:3000`
   - Add these to **Redirect URLs**:
     - `http://localhost:3000/**`
     - `http://localhost:3000/auth/sign-up-success`
     - `http://localhost:3000/dashboard`
   - Go to **Authentication → Providers → Email**
   - **Disable** "Confirm email" for local development
4. **Run database migration scripts** in order (Supabase SQL Editor):
   - `scripts/001_create_tables.sql` - Core tables (profiles, datasets, analysis_results, chat_history, memories)
   - `scripts/002_create_meetings_table.sql` - Meetings table with RLS policies
   - `scripts/003_add_company_name_to_meetings.sql` - Company context fields
   - `scripts/004_create_reports_dashboards_schema.sql` - Reports, dashboards, widgets, data quality tables

### 5. Get Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and add it to \`.env.local\`

### 6. Run the Development Server

```
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
insightflow-ai-hub/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── analysis/            # Statistical, correlation, outlier analysis
│   │   ├── chat/                # AI chat with memory
│   │   ├── dashboards/          # Dashboard CRUD + widgets
│   │   ├── data-quality/        # Quality assessment
│   │   ├── datasets/            # Upload, list, analyze datasets
│   │   ├── export/              # PDF/Excel/CSV export
│   │   ├── meeting-agent/       # Meeting generation with research
│   │   ├── memories/            # Memory CRUD (save, list, delete)
│   │   ├── reports/             # Report generation
│   │   └── scheduled-reports/   # Scheduled report automation
│   ├── auth/                    # Login, signup, error pages
│   ├── analysis/[id]/           # Dataset analysis page
│   ├── dashboard/               # Main dashboard with datasets
│   ├── dashboards/              # Real-time dashboard builder
│   ├── data-quality/            # Data quality assessment
│   ├── meeting-agent/           # Meeting generation UI
│   ├── meeting/[id]/            # View individual meeting details
│   ├── memories/                # Memory Explorer
│   ├── reports/                 # Reports management
│   └── scheduled-reports/       # Scheduled reports config
├── components/                   # React components
│   ├── ui/                      # shadcn/ui base components
│   ├── analysis/                
│   │   ├── advanced-visualizer.tsx  # 15+ chart types with AI selection
│   │   ├── ai-chat.tsx             # Chat with data
│   │   ├── analysis-client.tsx     # Main analysis container
│   │   ├── correlation-analysis.tsx # Correlation matrix
│   │   ├── statistical-analysis.tsx # Stats summary
│   │   └── outlier-analysis.tsx    # Outlier detection
│   ├── dashboard/               # Dataset cards, file upload
│   ├── meeting-agent/           
│   │   ├── meeting-agent-client.tsx # Meeting generation form
│   │   └── meeting-view-client.tsx  # Meeting detail view with export
│   └── memories/                
│       └── memory-explorer-client.tsx # Memory browser with cleanup
├── lib/                         # Utilities
│   ├── supabase/               # Supabase client, server, middleware
│   ├── utils.ts                # Helper functions
│   └── visualization-analyzer.ts # AI chart recommendations
├── scripts/                     # SQL migration scripts
└── middleware.ts                # Auth middleware

```

## 🎯 Usage Guide

### 1. Sign Up / Login
- Create account at `/auth/sign-up`
- For **local dev**: email confirmation is disabled
- For **production**: verify email before first login

### 2. Upload & Analyze Data
- Go to **Dashboard** → **Upload Dataset**
- Supported formats: CSV, Excel (.xlsx, .xls)
- System auto-detects:
  - Row/column counts
  - Data types (number, string, date)
  - Summary statistics

### 3. Advanced Visualizations
- Click dataset → View **Advanced Data Visualizer**
- **Top 3 charts** automatically displayed based on data structure
- **Dropdown menu** to explore 12+ additional chart types
- Includes: Bar, Line, Area, Pie, Scatter, Radar, Stacked Bar, Stacked Area, Distribution, Comparison

### 4. Generate Meetings
- Go to **Meeting Agent**
- Fill in:
  - Company Name (required)
  - Meeting Topic (required)
  - Context (optional)
  - Participants (comma-separated)
  - Company Files (optional: PDF, DOCX, XLSX)
- AI generates:
  - **Timeline agenda** with 5-7 items (90-120 min total)
  - **Discussion points** under each item (3-5 bullets)
  - **Research section** with 4 categories
- **Auto-saved to Memory Explorer**
- Click meeting → **Export as PDF or DOCX**

### 5. Memory Explorer
- Browse all saved meetings and insights
- **Filter by type**: Meeting, Insight, Preference
- **Search** by company, topic, keywords
- **Click meeting card** → View full agenda + research
- **Cleanup old memories** → Bulk delete outdated entries
- **Delete from detail view** → Remove specific meetings

### 6. Export & Share
- **Analysis**: PDF, Excel, CSV
- **Meetings**: PDF (formatted), DOCX (editable)
- **Reports**: Scheduled delivery via email
- **Dashboards**: Public sharing links

## API Endpoints

### Analysis
- \`POST /api/analysis/statistical\` - Statistical analysis
- \`POST /api/analysis/correlation\` - Correlation analysis
- \`POST /api/analysis/outliers\` - Outlier detection

### Data Management
- \`POST /api/datasets/upload\` - Upload dataset
- \`POST /api/export\` - Export analysis

### AI Agents
- \`POST /api/chat\` - AI chat
- \`POST /api/meeting-agent\` - Meeting preparation
- \`POST /api/data-quality\` - Data quality analysis
- \`POST /api/reports/generate\` - Generate report

### Dashboards
- \`POST /api/dashboards/create\` - Create dashboard
- \`GET /api/dashboards/[id]/widgets\` - Get dashboard widgets

### Scheduled Reports
- \`POST /api/scheduled-reports/create\` - Create scheduled report

## Database Schema

The application uses Supabase PostgreSQL with the following main tables:

- **profiles** - User profiles and authentication
- **datasets** - Uploaded data files and metadata
- **analysis_results** - Cached analysis outputs
- **chat_history** - AI chat conversations
- **memories** - Saved user insights
- **meetings** - Meeting agent outputs
- **reports** - Generated reports
- **scheduled_reports** - Automated report schedules
- **dashboards** - Custom dashboard configurations

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Vercel project settings
5. Deploy

```
# Environment variables to add in Vercel:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
```

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify
- DigitalOcean

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | Yes |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anonymous key | Yes |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key | Yes |
| GEMINI_API_KEY | Google Gemini API key | Yes |
| NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL | Auth redirect URL (dev) | Yes |

## Troubleshooting

### Build Cache Error
If you encounter CSS errors after updates:
1. Clear the build cache: \`rm -rf .next\`
2. Reinstall dependencies: \`npm install\`
3. Restart the dev server: \`npm run dev\`

### Database Connection Issues
1. Verify Supabase credentials in \`.env.local\`
2. Check that database migration scripts have been run
3. Ensure Row Level Security (RLS) policies are enabled

### API Errors
1. Check that all environment variables are set correctly
2. Verify Gemini API key is valid and has quota
3. Check browser console for detailed error messages

## 🛠️ Development Notes

### React 19 Compatibility
- **Always use `--legacy-peer-deps`** when installing packages
- Some packages (like `vaul`) have peer dependency conflicts with React 19

### Date Formatting
- Use `formatDate()` helper function to avoid hydration errors
- Never use `toLocaleDateString()` directly in SSR components
- Always specify locale: `en-US` with explicit format options

### Meeting Memory Structure
- Only **ONE memory per meeting** (type: "meeting")
- Metadata includes:
  - `meeting_id` - Link to meetings table
  - `company_name`, `topic`, `participants`
  - `agenda_preview`, `research_preview`
  - `full_data.agenda`, `full_data.research`

### Export Libraries
- **PDF**: jsPDF with autotable
- **DOCX**: docx + file-saver
- **Excel**: xlsx

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Check the SETUP.md for detailed configuration
- Review the scripts/ folder for database schema

---

Built with ❤️ using Next.js 16, React 19, Supabase, and Google Gemini AI
