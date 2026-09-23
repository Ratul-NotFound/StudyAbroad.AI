"""
StudyAbroad.AI — FastAPI Main Application
Entry point: all routes, middleware, WebSocket, startup events.
"""
# Fix protobuf runtime version conflict (TensorFlow global install vs our packages)
import os
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"  # Suppress TF logs if TF is installed

import asyncio
import json
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from backend.config import settings
from backend.database import init_db, get_db
from backend.agents.supervisor import supervisor, TaskType

# ─── Logging setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


# ─── Lifespan (startup/shutdown) ──────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info(f"🚀 Starting {settings.app_name} v{settings.app_version}")
    logger.info("📋 Philosophy: Own tools first | Paid APIs = emergency fallback only")

    # Initialize database
    await init_db()
    logger.info("✅ Database initialized")

    # Check which LLM is available
    try:
        from backend.config import get_effective_llm
        llm_in_use = get_effective_llm()
        logger.info(f"🤖 LLM: {llm_in_use} (primary)")
    except Exception as e:
        logger.warning(f"⚠️  LLM check: {e}")

    # Check & seed FAISS vector indices
    from backend.tools.vector_store import vector_store
    from backend.seed_data import seed_vector_store_if_empty
    seed_vector_store_if_empty()
    unis_store = vector_store.universities
    logger.info(f"🔍 Vector store: {unis_store.stats()['total_vectors']} universities indexed")

    yield

    # Shutdown
    logger.info("👋 Shutting down StudyAbroad.AI...")
    try:
        from backend.tools.scraper import scraper
        await scraper.playwright.close()
    except Exception:
        pass


# ─── FastAPI App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Fully Autonomous Study Abroad Intelligence Platform — 12 AI Agents",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────

class StudentProfileSchema(BaseModel):
    degree_level: Optional[str] = None
    field_of_study: Optional[str] = None
    current_institution: Optional[str] = None
    gpa: Optional[float] = None
    gpa_scale: Optional[float] = 4.0
    graduation_year: Optional[int] = None
    country_of_education: Optional[str] = None
    ielts_score: Optional[float] = None
    toefl_score: Optional[int] = None
    gre_verbal: Optional[int] = None
    gre_quant: Optional[int] = None
    gmat_score: Optional[int] = None
    target_degree: Optional[str] = "master"
    target_fields: Optional[list[str]] = []
    target_countries: Optional[list[str]] = []
    budget_usd_per_year: Optional[int] = None
    scholarship_required: Optional[bool] = False
    work_experience_years: Optional[float] = 0
    work_experience_details: Optional[list[dict]] = []
    publications: Optional[int] = 0
    research_experience: Optional[str] = None
    extracurriculars: Optional[list[str]] = []
    skills: Optional[list[str]] = []


class AnalyzeProfileRequest(BaseModel):
    profile: StudentProfileSchema
    session_id: Optional[str] = None


class MatchUniversitiesRequest(BaseModel):
    profile: StudentProfileSchema
    session_id: Optional[str] = None
    top_n: int = Field(default=20, ge=1, le=50)
    include_reasoning: bool = True


class GenerateSOPRequest(BaseModel):
    profile: StudentProfileSchema
    university_name: str
    program_name: str
    session_id: Optional[str] = None
    word_count: int = Field(default=1000, ge=300, le=2000)
    tone: str = "professional"


class RunAgentRequest(BaseModel):
    task: str
    data: Optional[dict] = {}
    session_id: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    session_id: str


# ─── Helper ───────────────────────────────────────────────────────────────────

def get_or_create_session(session_id: Optional[str]) -> str:
    """Get existing session or create a new one."""
    if session_id and supervisor.get_session(session_id):
        return session_id
    return supervisor.create_session(user_id=0)  # Anonymous for now


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "philosophy": "Own tools first — Paid APIs are emergency fallback only",
        "agents": 12,
        "docs": "/api/docs"
    }


@app.get("/health", tags=["Health"], include_in_schema=False)
async def health_simple():
    """Simple health check for Docker/nginx health probes."""
    return {"status": "ok", "version": settings.app_version}


@app.get("/api/health", tags=["Health"])
async def health():
    """System health check — shows which free LLM APIs are configured."""
    from backend.tools.vector_store import vector_store
    from backend.tools.llm import llm

    uni_stats = vector_store.universities.stats()

    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "free_llm_apis": {
            "groq": {
                "configured": await llm.groq.is_available(),
                "model": settings.groq_model,
                "cost": "FREE (30 RPM, 14K req/day)",
                "signup": "https://console.groq.com"
            },
            "gemini": {
                "configured": await llm.gemini.is_available(),
                "model": settings.gemini_model,
                "cost": "FREE (15 RPM, 1M tokens/day)",
                "signup": "https://aistudio.google.com/app/apikey"
            },
            "openrouter": {
                "configured": await llm.openrouter.is_available(),
                "model": settings.openrouter_model,
                "cost": "FREE models available (Qwen, Llama, Mistral)",
                "signup": "https://openrouter.ai"
            },
            "openai": {
                "configured": bool(settings.openai_api_key),
                "cost": "PAID — emergency fallback only",
                "note": "Only used if ALL free APIs fail on critical task"
            },
        },
        "own_tools": {
            "faiss_vector_store": {"type": "own (free, local)", **uni_stats},
            "embeddings": {"model": settings.embeddings_model, "type": "own (free, CPU only)"},
            "web_scraper": {"type": "playwright (own, free)"},
            "task_queue": {"type": "celery + redis (own, free)"},
        },
        "llm_usage": llm.usage_stats(),
        "sessions_active": len(supervisor.sessions),
        "note": "No local GPU/VPS needed — all LLM inference is cloud-based and free"
    }


# ─── Session ──────────────────────────────────────────────────────────────────

@app.post("/api/session", tags=["Session"])
async def create_session():
    """Create a new agent session."""
    session_id = supervisor.create_session(user_id=0)
    return {"session_id": session_id, "message": "Session created. Agents ready."}


@app.get("/api/session/{session_id}", tags=["Session"])
async def get_session(session_id: str):
    """Get current session state."""
    state = supervisor.get_session(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")
    return state.to_dict()


# ─── Profile Analysis ─────────────────────────────────────────────────────────

@app.post("/api/analyze-profile", tags=["Agents"])
async def analyze_profile(request: AnalyzeProfileRequest):
    """
    Agent 3: Analyze student profile.
    Returns: completeness score, academic scores, strengths, gaps, action plan.
    Tool used: LLM (Gemini free / Ollama) + sentence-transformers (own, free)
    """
    session_id = get_or_create_session(request.session_id)
    result = await supervisor.run_task(
        session_id=session_id,
        task_type=TaskType.ANALYZE_PROFILE,
        task_data={"profile": request.profile.model_dump()}
    )
    result["session_id"] = session_id
    return result


# ─── University Matching ──────────────────────────────────────────────────────

@app.post("/api/match-universities", tags=["Agents"])
async def match_universities(request: MatchUniversitiesRequest):
    """
    Agent 4: Find best-matching universities using FAISS + scoring.
    Tool used: FAISS (own, free) + sentence-transformers (own, free)
    Returns: Ranked list with reach/match/safety tiers.
    """
    session_id = get_or_create_session(request.session_id)
    result = await supervisor.run_task(
        session_id=session_id,
        task_type=TaskType.FIND_UNIVERSITIES,
        task_data={
            "profile": request.profile.model_dump(),
            "top_n": request.top_n,
            "include_reasoning": request.include_reasoning
        }
    )
    result["session_id"] = session_id
    return result


# ─── SOP Generation ───────────────────────────────────────────────────────────

@app.post("/api/generate-sop", tags=["Agents"])
async def generate_sop(request: GenerateSOPRequest):
    """
    Agent 5: Generate personalized SOP for a specific university.
    Tool used: LLM (Gemini free / Ollama) — $0 cost (replaces $200-500 SOP consultant)
    Returns: Full SOP text + quality scores + improvement feedback.
    """
    session_id = get_or_create_session(request.session_id)
    result = await supervisor.run_task(
        session_id=session_id,
        task_type=TaskType.GENERATE_SOP,
        task_data={
            "profile": request.profile.model_dump(),
            "university_name": request.university_name,
            "program_name": request.program_name,
            "word_count": request.word_count,
            "tone": request.tone,
        }
    )
    result["session_id"] = session_id
    return result


# ─── Full Pipeline ────────────────────────────────────────────────────────────

@app.post("/api/full-pipeline", tags=["Agents"])
async def full_pipeline(request: AnalyzeProfileRequest):
    """
    Run the complete autonomous pipeline:
    Profile Analysis → University Matching → SOP Generation for top match.
    Orchestrated by SupervisorAgent.
    """
    session_id = get_or_create_session(request.session_id)
    result = await supervisor.run_task(
        session_id=session_id,
        task_type=TaskType.FULL_PIPELINE,
        task_data={"profile": request.profile.model_dump()}
    )
    result["session_id"] = session_id
    return result


# ─── Data Scraping ────────────────────────────────────────────────────────────

class ScrapeRequest(BaseModel):
    countries: Optional[list[str]] = None
    limit_per_country: Optional[int] = 3

@app.post("/api/scrape/universities", tags=["Data"])
async def scrape_universities(payload: ScrapeRequest = ScrapeRequest()):
    """
    Trigger UniversityScraperAgent to populate university database.
    Tool used: Playwright (own, free). Takes ~5-30 min for full run.
    """
    session_id = supervisor.create_session(user_id=0)
    # Run in background
    asyncio.create_task(supervisor.run_task(
        session_id=session_id,
        task_type=TaskType.SCRAPE_UNIVERSITIES,
        task_data={"countries": payload.countries, "limit_per_country": payload.limit_per_country}
    ))
    return {
        "message": "University scraping started in background",
        "session_id": session_id,
        "monitor_ws": f"ws://localhost:{settings.api_port}/ws/{session_id}"
    }


# ─── Admin Stats ──────────────────────────────────────────────────────────────

@app.get("/api/admin/stats", tags=["Admin"])
async def admin_stats():
    """Aggregated admin dashboard stats — all agents, LLM usage, and vector store info."""
    from backend.tools.vector_store import vector_store
    from backend.tools.llm import llm

    uni_stats = vector_store.universities.stats()
    sch_stats = vector_store.scholarships.stats()

    return {
        "status": "operational",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "agents": {
            "total": 12,
            "names": [
                "UniversityScraperAgent", "ScholarshipScraperAgent", "ProfileAnalyzerAgent",
                "UniversityMatchAgent", "SOPWriterAgent", "ScholarshipMatchAgent",
                "DocumentAuditAgent", "EmailDraftAgent", "VisaGuideAgent",
                "InterviewCoachAgent", "CityLifeAgent", "CareerROIAgent"
            ]
        },
        "llm_usage": llm.usage_stats(),
        "vector_store": {
            "universities": uni_stats,
            "scholarships": sch_stats,
        },
        "sessions_active": len(supervisor.sessions),
        "llm_pool": {
            "groq_keys": len(settings.all_groq_keys),
            "groq_configured": len(settings.all_groq_keys) > 0,
            "gemini_configured": bool(settings.gemini_api_key),
            "openrouter_configured": bool(settings.openrouter_api_key),
        }
    }


# ─── Standardized v1 REST Endpoints (Frontend BFF compatibility) ────────────

@app.post("/api/v1/profile/analyze", tags=["Profile"])
async def v1_profile_analyze(payload: dict):
    """BFF-compatible profile analysis endpoint."""
    session_id = get_or_create_session(payload.get("session_id"))
    run_res = await supervisor.run_task(
        session_id=session_id,
        task_type=TaskType.ANALYZE_PROFILE,
        task_data={"profile": payload}
    )
    result = run_res.get("result", {}) if isinstance(run_res.get("result"), dict) else run_res
    scores = result.get("academic_scores", {})
    gaps = result.get("gaps", [])
    weaknesses_list = [g.get("fix", g.get("area", "")) for g in gaps] if gaps else ["Consider taking GRE or improving test scores to boost your percentile."]
    
    return {
        "session_id": session_id,
        "completeness_score": result.get("profile_completeness_pct", 85),
        "overall_score": result.get("overall_profile_score", 85),
        "scores": {
            "gpa": scores.get("gpa", 85),
            "gre": scores.get("gre", 80),
            "ielts": scores.get("english", 85),
            "research": scores.get("research", 70),
            "experience": scores.get("experience", 80),
        },
        "strengths": result.get("strengths", ["Solid academic foundation", "Good English proficiency"]),
        "weaknesses": weaknesses_list,
        "recommendations": result.get("recommendations", []),
        "tier_guidance": result.get("university_tier_guidance", {}),
        "action_plan": result.get("action_plan", []),
        "target_countries": result.get("estimated_target_countries", []),
    }


@app.post("/api/v1/universities/match", tags=["Universities"])
async def v1_universities_match(payload: dict):
    """BFF-compatible university matching endpoint."""
    session_id = get_or_create_session(payload.get("session_id"))
    run_res = await supervisor.run_task(
        session_id=session_id,
        task_type=TaskType.FIND_UNIVERSITIES,
        task_data={"profile": payload, "top_n": 20, "include_reasoning": True}
    )
    result = run_res.get("result", {}) if isinstance(run_res.get("result"), dict) else run_res
    matches = []
    for idx, m in enumerate(result.get("top_matches", [])):
        cand = m.get("candidate", {})
        matches.append({
            "university_id": idx + 1,
            "name": cand.get("name") or cand.get("university_name", "University"),
            "country": cand.get("country", "Global"),
            "match_score": int(m.get("overall_score", 85)),
            "tier": m.get("tier", "Match").capitalize(),
            "program": cand.get("field") or cand.get("name", "Master of Science"),
            "tuition_annual": cand.get("tuition_annual") or cand.get("avg_tuition_usd", 25000),
            "rank": cand.get("rank") or cand.get("world_rank", idx + 1),
            "deadline": cand.get("deadline", "December 15"),
            "requirements": {
                "min_gpa": cand.get("min_gpa", 3.2),
                "min_ielts": cand.get("min_ielts", 6.5),
                "min_toefl": cand.get("min_toefl", 90),
                "min_gre": cand.get("min_gre_quant", 155),
            },
            "scholarship_available": cand.get("scholarship_available", True),
            "reasoning": m.get("reasoning", "")
        })

    return {"matches": matches, "total": len(matches), "session_id": session_id}


@app.get("/api/v1/universities/search", tags=["Universities"])
async def v1_universities_search(q: str = "", limit: int = 20):
    """Search universities and programs."""
    from backend.tools.vector_store import vector_store
    results = vector_store.universities.hybrid_search(
        query=q or "top world university computer science engineering",
        keyword_fields=["name", "country", "popular_fields"],
        top_k=limit
    )
    return {"results": results, "count": len(results)}


@app.post("/api/v1/sop/generate", tags=["SOP"])
async def v1_sop_generate(payload: dict):
    """BFF-compatible SOP generation endpoint."""
    session_id = get_or_create_session(payload.get("session_id"))
    run_res = await supervisor.run_task(
        session_id=session_id,
        task_type=TaskType.GENERATE_SOP,
        task_data={
            "profile": payload.get("profile", {}),
            "university_name": payload.get("university") or payload.get("university_name", "Target University"),
            "program_name": payload.get("program") or payload.get("program_name", "Graduate Program"),
            "word_count": payload.get("word_limit") or payload.get("word_count", 1000),
            "tone": payload.get("tone", "professional")
        }
    )
    result = run_res.get("result", {}) if isinstance(run_res.get("result"), dict) else run_res
    return {
        "sop_text": result.get("content", ""),
        "word_count": result.get("word_count", 0),
        "scores": result.get("scores", {}),
        "session_id": session_id,
        "model_used": result.get("tool_used", "StudyAbroad.AI Autonomous Engine")
    }


@app.post("/api/v1/sop/refine", tags=["SOP"])
async def v1_sop_refine(payload: dict):
    """Refine SOP draft with user feedback."""
    session_id = get_or_create_session(payload.get("session_id"))
    instruction = payload.get("instruction", "Improve clarity and specificity.")
    from backend.agents.sop_writer import sop_writer_agent
    res = await sop_writer_agent.improve(
        sop=payload.get("sop_text", ""),
        feedback=[{"area": "User Request", "fix": instruction}],
        profile={},
        university=payload.get("university", "Target University"),
        program=payload.get("program", "Graduate Program")
    )
    return {
        "sop_text": res.get("content", ""),
        "word_count": res.get("word_count", 0),
        "scores": res.get("scores", {}),
        "session_id": session_id,
        "model_used": "StudyAbroad.AI Autonomous Engine"
    }


@app.get("/api/v1/scholarships", tags=["Scholarships"])
async def v1_scholarships(country: Optional[str] = None):
    """Get scholarship opportunities."""
    from backend.tools.vector_store import vector_store
    q = f"scholarships in {country}" if country else "international master phd scholarships"
    results = vector_store.scholarships.hybrid_search(
        query=q,
        keyword_fields=["name", "country", "degree"],
        top_k=20
    )
    return {"scholarships": results, "count": len(results)}


# ─── Scholarship Matching ─────────────────────────────────────────────────────

@app.post("/api/v1/scholarships/match", tags=["Scholarships"])
async def v1_scholarship_match(payload: dict):
    """Match scholarships to a student profile using FAISS + eligibility scoring."""
    session_id = get_or_create_session(payload.get("session_id"))
    result = await supervisor.run_task(
        session_id=session_id,
        task_type=TaskType.MATCH_SCHOLARSHIPS,
        task_data={
            "profile": payload.get("profile", {}),
            "top_n": payload.get("top_n", 10),
            "country_filter": payload.get("country_filter"),
        }
    )
    return result.get("result", result)


# ─── Document Audit ───────────────────────────────────────────────────────────

@app.post("/api/v1/documents/audit", tags=["Documents"])
async def v1_document_audit(payload: dict):
    """Audit document readiness for target countries with per-document checklist."""
    session_id = get_or_create_session(payload.get("session_id"))
    result = await supervisor.run_task(
        session_id=session_id,
        task_type=TaskType.AUDIT_DOCUMENTS,
        task_data={
            "profile": payload.get("profile", {}),
            "target_countries": payload.get("target_countries"),
            "existing_documents": payload.get("existing_documents", []),
        }
    )
    return result.get("result", result)


# ─── Email Drafting ───────────────────────────────────────────────────────────

@app.post("/api/v1/email/draft", tags=["Email"])
async def v1_email_draft(payload: dict):
    """Draft personalized professor outreach email or scholarship cover letter."""
    session_id = get_or_create_session(payload.get("session_id"))
    result = await supervisor.run_task(
        session_id=session_id,
        task_type=TaskType.GENERATE_EMAIL,
        task_data={
            "profile": payload.get("profile", {}),
            "email_type": payload.get("email_type", "professor"),  # professor | scholarship | inquiry
            "professor_name": payload.get("professor_name", "Professor"),
            "professor_research": payload.get("professor_research", "machine learning"),
            "university_name": payload.get("university_name", "Target University"),
            "program_name": payload.get("program_name", "Graduate Program"),
            "scholarship_name": payload.get("scholarship_name", ""),
            "country": payload.get("country", ""),
            "word_limit": payload.get("word_limit", 500),
        }
    )
    return result.get("result", result)


# ─── Visa Guide ───────────────────────────────────────────────────────────────

@app.get("/api/v1/visa/guide/{country}", tags=["Visa"])
async def v1_visa_guide_get(country: str):
    """Get student visa guide for a specific country (no profile needed)."""
    from backend.agents.visa_guide import visa_guide_agent
    return await visa_guide_agent.guide(country=country)


@app.post("/api/v1/visa/guide", tags=["Visa"])
async def v1_visa_guide_post(payload: dict):
    """Get personalized student visa guide for target countries with profile gap analysis."""
    session_id = get_or_create_session(payload.get("session_id"))
    result = await supervisor.run_task(
        session_id=session_id,
        task_type=TaskType.VISA_GUIDE,
        task_data={
            "profile": payload.get("profile", {}),
            "countries": payload.get("countries") or payload.get("target_countries", ["Germany"]),
        }
    )
    return result.get("result", result)


@app.get("/api/v1/visa/countries", tags=["Visa"])
async def v1_visa_countries():
    """List all countries with available visa guides."""
    from backend.agents.visa_guide import visa_guide_agent
    return {"countries": visa_guide_agent.list_countries()}


# ─── Interview Coach ──────────────────────────────────────────────────────────

@app.post("/api/v1/interview/questions", tags=["Interview"])
async def v1_interview_questions(payload: dict):
    """Generate personalized interview questions with model answers."""
    session_id = get_or_create_session(payload.get("session_id"))
    result = await supervisor.run_task(
        session_id=session_id,
        task_type=TaskType.INTERVIEW_PREP,
        task_data={
            "profile": payload.get("profile", {}),
            "university_name": payload.get("university_name", "Target University"),
            "program_name": payload.get("program_name", "Graduate Program"),
            "interview_type": payload.get("interview_type", "admission"),  # admission | scholarship | visa
            "num_questions": payload.get("num_questions", 10),
        }
    )
    return result.get("result", result)


@app.post("/api/v1/interview/score", tags=["Interview"])
async def v1_interview_score(payload: dict):
    """Score a practice answer and give detailed feedback."""
    from backend.agents.interview_coach import interview_coach_agent
    return await interview_coach_agent.score_answer(
        question=payload.get("question", ""),
        answer=payload.get("answer", ""),
        profile=payload.get("profile", {}),
        university_name=payload.get("university_name", "Target University"),
    )


# ─── City Life ────────────────────────────────────────────────────────────────

@app.get("/api/v1/city/{city_name}", tags=["City"])
async def v1_city_get(city_name: str):
    """Get cost-of-living and lifestyle breakdown for a city."""
    from backend.agents.city_life import city_life_agent
    return await city_life_agent.get_city_info(city=city_name)


@app.post("/api/v1/city/compare", tags=["City"])
async def v1_city_compare(payload: dict):
    """Compare cost-of-living across multiple cities."""
    from backend.agents.city_life import city_life_agent
    cities = payload.get("cities", ["Munich", "Toronto", "Singapore"])
    return await city_life_agent.compare_cities(cities=cities, profile=payload.get("profile", {}))


# ─── Career ROI ───────────────────────────────────────────────────────────────

@app.post("/api/v1/career/roi", tags=["Career"])
async def v1_career_roi(payload: dict):
    """Calculate financial ROI, salary projection, and payback period for study abroad."""
    session_id = get_or_create_session(payload.get("session_id"))
    result = await supervisor.run_task(
        session_id=session_id,
        task_type=TaskType.CAREER_ROI,
        task_data={
            "profile": payload.get("profile", {}),
            "university_name": payload.get("university_name", "Target University"),
            "country": payload.get("country", ""),
            "annual_tuition_usd": payload.get("annual_tuition_usd", 25000),
            "program_duration_years": payload.get("program_duration_years", 2.0),
        }
    )
    return result.get("result", result)


# ─── Chat Interface ───────────────────────────────────────────────────────────

@app.post("/api/chat", tags=["Chat"])
async def chat(request: ChatRequest):
    """Natural language chat interface routed to appropriate agents."""
    state = supervisor.get_session(request.session_id)
    if not state:
        # Auto-create session so chatbot works without explicit session creation
        session_id = supervisor.create_session(user_id=0)
        state = supervisor.get_session(session_id)
        request_session_id = session_id
    else:
        request_session_id = request.session_id
    response = await supervisor.chat(request_session_id, request.message)
    return {"response": response, "session_id": request_session_id}


# ─── WebSocket (Real-time Agent Updates) ─────────────────────────────────────

@app.websocket("/ws/{session_id}")
async def websocket_agent_updates(websocket: WebSocket, session_id: str):
    """
    Real-time WebSocket stream of agent execution events.
    No 3rd party push notification service needed — own WebSocket.
    """
    await websocket.accept()
    logger.info(f"[WebSocket] Client connected for session {session_id}")

    # Register callback to forward messages to this WebSocket
    async def send_update(event: dict):
        try:
            await websocket.send_text(json.dumps(event))
        except Exception:
            pass

    supervisor.register_ws_callback(session_id, send_update)

    # Send initial state
    state = supervisor.get_session(session_id)
    if state:
        await websocket.send_text(json.dumps({
            "type": "connected",
            "session": state.to_dict(),
            "message": "Connected to StudyAbroad.AI agent system"
        }))

    try:
        while True:
            # Keep connection alive with ping
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        logger.info(f"[WebSocket] Client disconnected: {session_id}")


# ─── Dev: Quick demo endpoint ─────────────────────────────────────────────────

@app.post("/api/demo", tags=["Demo"])
async def run_demo():
    """
    Run a quick demo with a sample student profile.
    Shows the full own-tools pipeline in action.
    """
    sample_profile = {
        "degree_level": "bachelor",
        "field_of_study": "Computer Science",
        "current_institution": "BUET",
        "gpa": 3.6,
        "gpa_scale": 4.0,
        "graduation_year": 2024,
        "country_of_education": "Bangladesh",
        "ielts_score": 7.0,
        "gre_quant": 165,
        "gre_verbal": 155,
        "target_degree": "master",
        "target_fields": ["Computer Science", "Machine Learning", "AI"],
        "target_countries": ["USA", "Canada", "Germany"],
        "budget_usd_per_year": 40000,
        "scholarship_required": True,
        "work_experience_years": 1.5,
        "publications": 1,
        "skills": ["Python", "Machine Learning", "Deep Learning", "PyTorch"],
    }

    session_id = supervisor.create_session(user_id=0)
    result = await supervisor.run_task(
        session_id=session_id,
        task_type=TaskType.ANALYZE_PROFILE,
        task_data={"profile": sample_profile}
    )

    return {
        "demo": True,
        "sample_profile": sample_profile,
        "session_id": session_id,
        "analysis_result": result,
        "next_steps": [
            f"POST /api/match-universities with session_id={session_id}",
            f"POST /api/generate-sop with session_id={session_id}",
            f"WS ws://localhost:{settings.api_port}/ws/{session_id}"
        ]
    }


# ─── Run ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
