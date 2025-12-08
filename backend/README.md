# InsightFlow AI Backend

Python/CrewAI multi-agent backend for InsightFlow Analytics Platform.

## Architecture

This backend provides intelligent AI agents that work together to:
- Analyze datasets with statistical insights
- Generate meeting agendas with industry research
- Assess data quality
- Create professional reports

## Tech Stack

- **Framework**: FastAPI
- **AI Orchestration**: CrewAI
- **LLM**: Google Gemini 2.0 Flash
- **Database**: Supabase
- **Data Processing**: Pandas, NumPy

## Setup

### 1. Create Virtual Environment

```bash
# Windows
python -m venv venv
.\\venv\\Scripts\\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
```

Required environment variables:
- `GEMINI_API_KEY` - Google Gemini API key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon key
- `SUPABASE_SERVICE_KEY` - Supabase service role key

### 4. Run the Server

```bash
# Development mode (auto-reload)
cd api
python main.py

# Or using uvicorn directly
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health status

### Analysis
- `POST /api/analysis/analyze` - Run data analysis crew

### Meetings
- `POST /api/meetings/generate` - Generate meeting agenda and research

### Reports
- `POST /api/reports/generate` - Generate professional reports

## Agents

### 1. Data Analyst Agent
- **Role**: Statistical analysis and insights
- **Tools**: Calculate statistics, detect outliers
- **Temperature**: 0.3 (precise)

### 2. Meeting Planner Agent
- **Role**: Create meeting agendas
- **Delegation**: Can delegate to Research Agent
- **Temperature**: 0.7 (creative)

### 3. Quality Agent
- **Role**: Data quality assessment
- **Tools**: Analyze data quality
- **Temperature**: 0.2 (strict)

### 4. Research Agent
- **Role**: Industry research and insights
- **Temperature**: 0.6 (balanced)

### 5. Report Writer Agent
- **Role**: Professional report generation
- **Delegation**: Can delegate to Data Analyst
- **Temperature**: 0.5 (balanced)

### 6. Manager Agent
- **Role**: Coordinate multi-agent workflows
- **Delegation**: Can delegate to all agents
- **Temperature**: 0.4 (strategic)

## Crew Workflows

### Meeting Crew
Sequential workflow:
1. Research Agent → Gather industry insights
2. Meeting Planner Agent → Create structured agenda

### Analysis Crew
Sequential workflow:
1. Quality Agent → Assess data quality
2. Data Analyst Agent → Perform statistical analysis

## Development

### Project Structure

```
backend/
├── agents/          # AI agent definitions
├── tools/           # Custom tools for agents
├── crews/           # Multi-agent workflows
├── api/             # FastAPI application
│   ├── main.py      # App entry point
│   └── routes/      # API endpoints
└── config/          # Configuration
```

### Adding New Agents

1. Create agent file in `agents/`
2. Define role, goal, and backstory
3. Configure LLM and tools
4. Export in `agents/__init__.py`

### Adding New Tools

1. Create tool file in `tools/`
2. Use `@tool` decorator
3. Export in `tools/__init__.py`

### Adding New Crews

1. Create crew file in `crews/`
2. Define agents and tasks
3. Configure process (sequential/hierarchical)
4. Export in `crews/__init__.py`

## Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test meeting generation
curl -X POST http://localhost:8000/api/meetings/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_id": "test-user",
    "company_name": "TechCorp",
    "topic": "Q1 Strategy Planning",
    "context": "Focus on AI initiatives",
    "participants": "CEO, CTO, VP Product"
  }'
```

## Integration with Next.js

The Next.js frontend calls this backend via HTTP:

```typescript
// Example: Call meeting generation
const response = await fetch('http://localhost:8000/api/meetings/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: userId,
    company_name: companyName,
    topic: topic,
    context: context,
    participants: participants
  })
});

const result = await response.json();
```

## Deployment

### Docker (Recommended)

```bash
# Build image
docker build -t insightflow-backend .

# Run container
docker run -p 8000:8000 --env-file .env insightflow-backend
```

### Cloud Platforms

- **Railway**: Connect GitHub repo, set env vars
- **Render**: Deploy as Web Service
- **AWS/GCP**: Deploy with Docker or serverless

## Troubleshooting

### Import Errors
```bash
# Make sure you're in the backend directory
cd backend
python -m pip install -r requirements.txt
```

### Gemini API Errors
- Verify API key is correct
- Check quota limits
- Ensure billing is enabled

### Supabase Connection Issues
- Verify URL and keys
- Check network connectivity
- Ensure RLS policies allow access

## License

MIT
