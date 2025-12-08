# InsightFlow Frontend

Next.js 16 frontend for InsightFlow AI Hub analytics platform.

## Structure

```
frontend/
├── app/                  # Next.js App Router
│   ├── api/             # API routes (proxy to Python backend)
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Main dashboard
│   ├── meeting-agent/   # Meeting generation
│   ├── analysis/        # Data analysis
│   └── ...
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── analysis/       # Analysis components
│   ├── dashboard/      # Dashboard components
│   └── ...
├── lib/                # Utilities
│   ├── supabase/       # Supabase client
│   └── utils.ts        # Helper functions
├── hooks/              # Custom React hooks
├── public/             # Static assets
└── styles/             # Global styles
```

## Setup

```bash
npm install --legacy-peer-deps
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Google Gemini (not used directly, backend uses it)
GEMINI_API_KEY=your_gemini_key

# Python Backend
PYTHON_BACKEND_URL=http://localhost:8000
```

## API Routes

All AI functionality is proxied to the Python backend:

- `/api/meeting-agent` → `http://localhost:8000/api/meetings/generate`
- `/api/chat` → `http://localhost:8000/api/analysis/analyze`
- `/api/data-quality` → `http://localhost:8000/api/analysis/analyze`

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint
```

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase
- Recharts

## License

MIT
