# 🌍 StudyAbroad.AI
### Fully Autonomous Study Abroad Intelligence Platform
**12 AI Agents | Free Cloud LLMs | No GPU/VPS Needed | Zero Cost**

---

## Philosophy: Free Cloud APIs — No Local Compute

> No Ollama, no local GPU, no expensive VPS needed.
> Use FREE cloud LLM APIs that provide enough compute for all tasks.
> 3rd-party paid APIs are emergency fallbacks ONLY.

### Free LLM Priority Chain
| Priority | Service | Free Tier | Speed | Get Key |
|---|---|---|---|---|
| 1 (Primary) | **Groq** | 30 RPM, 14K req/day | 275 tok/s (fastest) | [console.groq.com](https://console.groq.com) |
| 2 | **Gemini Flash** | 15 RPM, 1M tokens/day | Fast | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| 3 | **OpenRouter** | Free models (Qwen, Llama) | Good | [openrouter.ai](https://openrouter.ai) |
| 4 (Paid only) | OpenAI | PAID emergency fallback | — | Only if critical task fails |

**Monthly cost for normal operation: $0.00**

---

## The 12 Autonomous AI Agents

| # | Agent | Status | Own Tool Used |
|---|---|---|---|
| 1 | UniversityScraperAgent | ✅ Built | Playwright + LLM |
| 2 | ScholarshipScraperAgent | 🔨 Phase 2 | Playwright + BS4 |
| 3 | ProfileAnalyzerAgent | ✅ Built | LLM + sentence-transformers |
| 4 | UniversityMatchAgent | ✅ Built | FAISS + scoring algorithm |
| 5 | SOPWriterAgent | ✅ Built | LLM (replaces $200-500 consultant) |
| 6 | ScholarshipMatchAgent | 🔨 Phase 3 | FAISS + deadline filter |
| 7 | DocumentAuditAgent | 🔨 Phase 3 | Tesseract OCR + LLM |
| 8 | EmailDraftAgent | 🔨 Phase 3 | LLM (replaces cold-email tools) |
| 9 | VisaGuideAgent | 🔨 Phase 3 | Playwright + LLM |
| 10 | InterviewCoachAgent | 🔨 Phase 4 | LLM (replaces $100/session coaching) |
| 11 | CityLifeAgent | 🔨 Phase 4 | Playwright + data scrapers |
| 12 | CareerROIAgent | 🔨 Phase 4 | LLM + LinkedIn scraper |

---

## Quick Start

### 1. Prerequisites
```bash
# Python 3.10+
python --version

# Optional but recommended: Install Ollama (completely free, local LLM)
# Download from https://ollama.ai
# Then: ollama pull llama3.1:8b

# Optional: Redis for task queue
# docker run -d -p 6379:6379 redis
```

### 2. Setup
```bash
cd studyabroad_ai

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers (for scraping)
playwright install chromium

# Configure environment
cp .env.example .env
# Edit .env — add your GEMINI_API_KEY (free at https://aistudio.google.com/app/apikey)
```

### 3. Run
```bash
# Start the API
python -m uvicorn backend.main:app --reload --port 8000

# API docs: http://localhost:8000/api/docs
# Health: http://localhost:8000/api/health
```

### 4. Start Celery (optional — for background scraping)
```bash
# In another terminal:
celery -A backend.tasks.celery_app worker --loglevel=info
celery -A backend.tasks.celery_app beat --loglevel=info
```

---

## API Endpoints

| Method | Endpoint | Agent | Description |
|---|---|---|---|
| GET | `/` | — | System info |
| GET | `/api/health` | — | Tool status check |
| POST | `/api/session` | Supervisor | Create agent session |
| POST | `/api/analyze-profile` | Agent 3 | Analyze student profile |
| POST | `/api/match-universities` | Agent 4 | FAISS university matching |
| POST | `/api/generate-sop` | Agent 5 | Write personalized SOP |
| POST | `/api/full-pipeline` | Supervisor | Full autonomous pipeline |
| POST | `/api/scrape/universities` | Agent 1 | Trigger data collection |
| GET | `/api/data/stats` | — | Vector store statistics |
| POST | `/api/chat` | Supervisor | Natural language interface |
| WS | `/ws/{session_id}` | Supervisor | Real-time agent updates |
| POST | `/api/demo` | Supervisor | Quick demo run |

---

## Architecture

```
studyabroad_ai/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Settings (own-tools-first flags)
│   ├── database.py          # SQLAlchemy + SQLite
│   ├── models/              # All DB models
│   ├── api/                 # API route modules
│   ├── agents/
│   │   ├── supervisor.py    # Orchestrator
│   │   ├── university_scraper.py  # Agent 1
│   │   ├── profile_analyzer.py    # Agent 3
│   │   ├── university_match.py    # Agent 4
│   │   └── sop_writer.py          # Agent 5
│   ├── tools/
│   │   ├── llm.py           # Ollama → Gemini → OpenAI router
│   │   ├── embeddings.py    # sentence-transformers (own, free)
│   │   ├── vector_store.py  # FAISS (own, free)
│   │   └── scraper.py       # Playwright (own, free)
│   └── tasks/
│       ├── celery_app.py    # Own task queue
│       └── scheduled_tasks.py
├── data/
│   ├── vector_index/        # FAISS index files
│   └── scraped/             # Raw scraped data
├── .env                     # Configuration
└── requirements.txt
```

---

## Cost Analysis

| Component | Our Cost | Equivalent 3rd Party |
|---|---|---|
| LLM (Gemini free + Ollama) | $0/month | GPT-4: ~$50-200/month |
| Embeddings (sentence-transformers) | $0/month | OpenAI: ~$5-50/month |
| Vector Search (FAISS local) | $0/month | Pinecone: $70+/month |
| Web Scraping (Playwright) | $0/month | ScraperAPI: $49+/month |
| Task Queue (Celery+Redis) | $0-5/month | AWS SQS: $10-50/month |
| **TOTAL** | **~$0-5/month** | **$200-400+/month** |

---

## Portfolio Value

This project demonstrates:
- **Multi-agent AI systems** (12 autonomous agents with LangGraph-style orchestration)
- **Cost-conscious AI architecture** (own tools > paid APIs by default)
- **RAG system** (FAISS + sentence-transformers for semantic university search)
- **Autonomous web scraping** (Playwright with anti-bot evasion)
- **Real-time systems** (WebSocket-based live agent monitoring)
- **FastAPI + async Python** at production scale
- **Celery task orchestration** for background agent scheduling

**Domain:** EdTech / AI Engineering / Study Abroad Automation
**Target Role:** AI Engineer, ML Engineer, Backend Engineer with AI expertise
