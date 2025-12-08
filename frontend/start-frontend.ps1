# Start InsightFlow AI Hub Frontend
# This script starts the Next.js frontend

Write-Host "🚀 Starting InsightFlow AI Hub Frontend..." -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
}

# Check if .env.local exists
if (-Not (Test-Path ".env.local")) {
    Write-Host "⚠️  Warning: .env.local file not found!" -ForegroundColor Red
    Write-Host "📝 Please copy .env.example to .env.local and configure your credentials" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Required variables:" -ForegroundColor Yellow
    Write-Host "  - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Gray
    Write-Host "  - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Gray
    Write-Host "  - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Gray
    Write-Host "  - GEMINI_API_KEY" -ForegroundColor Gray
    Write-Host "  - PYTHON_BACKEND_URL=http://localhost:8000" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to continue anyway or Ctrl+C to exit"
}

# Start the frontend
Write-Host ""
Write-Host "✨ Starting Next.js frontend on http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev
