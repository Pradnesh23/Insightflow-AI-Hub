# InsightFlow AI Hub

A comprehensive AI-powered analytics platform with **true multi-agent intelligence** powered by LangGraph and Gemini 2.5 Flash.

## 🏗️ Project Structure

```
InsightFlow-AI-Hub/
├── frontend/              # Next.js Frontend (Port 3000)
│   ├── app/              # Next.js pages and API routes
│   ├── components/       # React components
│   │   └── analysis/     # Analysis components (Quality, Stats, Correlation, Outliers, Visualizer, AI Chat)
│   ├── lib/              # Utilities and Supabase client
│   ├── hooks/            # Custom React hooks
│   ├── public/           # Static assets
│   ├── styles/           # CSS styles
│   ├── package.json      # Frontend dependencies
│   └── .env.example      # Frontend environment template
│
├── backend/              # Python LangGraph Backend (Port 8000)
│   ├── agents/           # AI Agents (Gemini 2.5 Flash)
│   │   └── orchestrator.py  # LangGraph workflow orchestration
│   ├── tools/            # Custom tools for agents
│   ├── api/              # FastAPI application
│   ├── config/           # Configuration
│   ├── requirements.txt  # Python dependencies
│   └── .env.example      # Backend environment template
│
├── scripts/              # Database migration scripts
├── .github/              # GitHub Actions workflows
├── README.md             # This file
├── QUICKSTART.md         # Quick start guide
└── SETUP.md              # Detailed setup instructions
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (for frontend)
- **Python 3.10+** (for backend)
- **Supabase account** (free tier)
- **Google Gemini API key** (free tier)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/InsightFlow-AI-Hub.git
cd InsightFlow-AI-Hub
```

### 2. Setup Backend (Python/LangGraph)
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your Gemini API key and Supabase credentials

# Run backend
cd api
python main.py
```

Backend runs at: **http://localhost:8000**

### 3. Setup Frontend (Next.js)
```bash
cd frontend
npm install --legacy-peer-deps

# Copy and configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
# Add: PYTHON_BACKEND_URL=http://localhost:8000

# Run frontend
npm run dev
```

Frontend runs at: **http://localhost:3000**

## 🤖 LangGraph Multi-Agent System

### Intelligent Orchestration with State Management

**Router Agent** - Central orchestrator that intelligently routes requests to specialized agents based on task type using LangGraph's conditional edges

### 4 Specialized AI Agents (Gemini 2.5 Flash)

1. **Meeting Agent** - Generates meeting agendas with industry research and structured timelines
2. **Data Analyst Agent** - Comprehensive statistical analysis with correlations and outlier detection
3. **Quality Agent** - Data quality assessment with scoring and recommendations
4. **Report Writer Agent** - Professional business intelligence reports

### Agent Collaboration

**Meeting Generation:**
```
User Request → Router → Meeting Agent
(Research + Agenda Generation)
```

**Data Analysis:**
```
User Request → Router → Data Analyst Agent
↓
Statistics + Correlations + Outliers + Quality Report
(All numeric columns processed, full dataset analysis)
```

**Report Generation:**
```
User Request → Router → Report Writer Agent
(Professional reports with insights)
```

## ✨ Features

### 🎯 Core Features
- **Multi-Agent Intelligence** - LangGraph-powered agent orchestration
- **Data Analysis** - Upload CSV/Excel, get AI-powered insights
- **Meeting Preparation** - AI-generated agendas with research
- **Data Quality** - Automated quality assessment with scoring
- **Report Generation** - Professional reports with AI insights
- **Real-time Dashboards** - Live data monitoring
- **Memory Explorer** - Persistent AI memory across sessions

### 📊 Advanced Analysis Features

#### 1. **Quality Report** (NEW!)
- **Comprehensive Data Assessment** - Quality score (0-100)
- **All Columns Displayed** - Shows all numeric and text columns with type indicators
- **Key Metrics Cards** - Total rows, column breakdown, missing data percentage
- **Statistics Overview** - Mean, median, std dev, min/max for all numeric columns
- **Beautiful UI** - Color-coded column types, hero quality score display

#### 2. **Statistical Analysis**
- **Full Dataset Processing** - Analyzes entire dataset (not limited to samples)
- **All Numeric Columns** - No 5-column limit, processes all numeric data
- **Comprehensive Stats** - Count, mean, median, std, min, max for each column
- **Interactive Charts** - Bar charts showing statistical distributions
- **Persistent Results** - Analysis results persist when switching tabs

#### 3. **Correlation Analysis**
- **Correlation Matrix** - Shows relationships between all numeric columns
- **Self-Correlation Support** - Works even with single numeric column
- **Heatmap Visualization** - Color-coded correlation strength
- **Persistent Results** - Correlations persist across tab switches

#### 4. **Outlier Detection**
- **IQR Method** - Interquartile range-based outlier detection
- **Box Plot Visualization** (NEW!) - Visual quartile distribution with:
  - Q1, Q3, and median markers
  - Whiskers showing outlier bounds
  - Color-coded boxes and labels
- **Scatter Plot** - Shows normal vs outlier data points
- **Detailed Metrics** - Count, percentage, bounds for each column
- **Persistent Results** - Outlier data persists when switching tabs

#### 5. **Advanced Visualizer**
- **AI-Recommended Charts** - Top 15 visualizations based on data structure
- **Multiple Chart Types** - Bar, line, area, pie, scatter, radar, stacked charts
- **Smart Column Selection** - AI selects best columns for each visualization
- **Custom Chart Requests** (NEW!) - Natural language chart generation:
  - Type: "Show me a bar chart of sales by region"
  - AI interprets request and generates chart
  - Supports: bar, line, scatter, pie, area charts
  - Keeps last 5 custom charts
- **Interactive Selection** - Click cards to switch between visualizations

#### 6. **AI Data Assistant**
- **Conversational Analysis** - Ask questions about your data
- **Context-Aware** - Understands dataset structure and content
- **Insight Extraction** - Automatically identifies and saves insights
- **Persistent Chat History** (NEW!) - Messages persist across tab switches
- **No Infinite Loops** - Fixed useEffect dependency issues

### 🎨 UI/UX Enhancements
- **Tab Persistence** - All analysis results persist when switching tabs
- **Glass-morphism Design** - Modern, premium UI with glassmorphic effects
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Dark Mode** - Beautiful dark theme throughout
- **Loading States** - Smooth loading animations and spinners
- **Error Handling** - Graceful error messages and fallbacks

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[backend/README.md](backend/README.md)** - Backend documentation

## 🛠️ Tech Stack

### Frontend
- Next.js 16 (with Turbopack)
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase (Auth & Database)
- Recharts (Data visualization)
- Shadcn/ui (Component library)

### Backend
- Python 3.10+
- FastAPI
- LangGraph (Multi-agent orchestration)
- LangChain
- Google Gemini 2.5 Flash
- Pandas & NumPy (Data processing)
- Supabase (Database)

## 🔄 Architecture

```
┌─────────────────────────────────────────┐
│         Next.js Frontend                │
│         (Port 3000)                     │
│  - UI Components                        │
│  - API Routes (proxy to backend)        │
│  - Analysis Tabs (6 types)              │
│  - Custom Chart Generation              │
└─────────────────┬───────────────────────┘
                  │ HTTP REST
                  ↓
┌─────────────────────────────────────────┐
│      Python FastAPI Backend             │
│      (Port 8000)                        │
│  - LangGraph Orchestrator               │
│  - 4 Specialized Agents (Gemini)        │
│  - Full Dataset Processing              │
│  - Statistical Analysis Engine          │
└─────────────────┬───────────────────────┘
                  │
                  ↓
          ┌───────────────┐
          │   Supabase    │
          │  (PostgreSQL) │
          └───────────────┘
```

## 🧪 Testing

### Test Backend
```bash
curl http://localhost:8000/health
```

### Test Frontend
Open browser: `http://localhost:3000`

### Test Analysis Features
1. Upload a CSV file
2. Navigate to Analysis tab
3. Try each analysis type:
   - **Quality Report** - See comprehensive data assessment
   - **Statistical Analysis** - View stats for all numeric columns
   - **Visualizer** - See AI-recommended charts + request custom charts
   - **Correlation** - Explore relationships between columns
   - **Outliers** - Detect anomalies with box plots
   - **AI Chat** - Ask questions about your data

### Test Custom Chart Generation
1. Go to Visualizer tab
2. Scroll to "Request Custom Visualization"
3. Type: "Show me a line chart of temperature over time"
4. See AI generate the chart instantly!

## 📦 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel deploy
```

### Backend (Railway/Render)
```bash
cd backend
# Deploy via Railway or Render
# Set environment variables in platform
```

## 🐛 Known Issues & Fixes

### ✅ Fixed Issues
- ✅ AI Chat infinite loop (useEffect dependency)
- ✅ Missing box plot visualization in outliers
- ✅ Analysis results not persisting across tabs
- ✅ 5-column limit in backend processing
- ✅ 100-row sample limit in frontend
- ✅ Quality report showing raw markdown

### Current Limitations
- Custom chart generation limited to 5 charts
- Box plot uses custom CSS (not Recharts native)
- AI chat requires backend API endpoint

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

## 📄 License

MIT License - see LICENSE file

## 🙏 Acknowledgments

- **LangGraph** - Multi-agent orchestration framework
- **Google Gemini** - AI model (2.5 Flash)
- **Supabase** - Backend infrastructure
- **Next.js** - React framework
- **Recharts** - Chart library
- **Shadcn/ui** - Component library

---

**Built with ❤️ using LangGraph, Gemini 2.5 Flash, Next.js 16, and Supabase**

## 🎯 Recent Updates

### Latest Features (December 2024)
- ✅ **AI-Powered Custom Charts** - Natural language chart generation
- ✅ **Box Plot Visualization** - Quartile distribution for outliers
- ✅ **Tab Persistence** - All analysis results persist across tabs
- ✅ **Quality Report Redesign** - Beautiful, comprehensive data assessment
- ✅ **Full Dataset Processing** - No more row/column limits
- ✅ **Fixed AI Chat** - Resolved infinite loop issues
- ✅ **All Columns Support** - Backend processes all numeric and text columns
