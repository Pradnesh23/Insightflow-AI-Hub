# 🚀 Quick Start Guide

## Running InsightFlow AI Hub

### Option 1: Using Startup Scripts (Recommended)

#### Terminal 1: Start Backend
```powershell
cd backend
.\\start-backend.ps1
```

#### Terminal 2: Start Frontend
```powershell
cd frontend
.\\start-frontend.ps1
```

---

### Option 2: Manual Start

#### Terminal 1: Backend
```powershell
cd backend
python -m venv venv
.\\venv\\Scripts\\activate
pip install -r requirements.txt
cd api
python main.py
```

#### Terminal 2: Frontend
```powershell
cd frontend
npm install --legacy-peer-deps
npm run dev
```

---

## First Time Setup

### 1. Configure Backend Environment
```powershell
cd backend
copy .env.example .env
# Edit .env with your API keys
```

Required variables:
- `GEMINI_API_KEY` - Get from https://aistudio.google.com/apikey
- `SUPABASE_URL` - From your Supabase project
- `SUPABASE_KEY` - Supabase anon key
- `SUPABASE_SERVICE_KEY` - Supabase service role key

### 2. Configure Frontend Environment
```powershell
cd frontend
copy .env.example .env.local
# Edit .env.local with your credentials
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `PYTHON_BACKEND_URL=http://localhost:8000`

---

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.10+)
- Check .env file exists and has correct keys
- Try: `pip install --upgrade pip`

### Frontend won't start
- Check Node version: `node --version` (need 18+)
- Try: `npm install --legacy-peer-deps --force`
- Delete `node_modules` and `.next`, then reinstall

### "Connection refused" errors
- Make sure backend is running on port 8000
- Check `PYTHON_BACKEND_URL` in frontend `.env.local`

---

## Features to Test

1. **Meeting Agent** - http://localhost:3000/meeting-agent
2. **Data Analysis** - Upload CSV at http://localhost:3000/dashboard
3. **AI Chat** - Chat with your data
4. **Reports** - Generate AI-powered reports
5. **Memory Explorer** - View saved meetings

---

## Stopping the Servers

Press `Ctrl+C` in each terminal window to stop the servers.
