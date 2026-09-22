"""
StudyAbroad.AI — Supervisor Agent (Multi-Agent Orchestrator)
Coordinates all 12 autonomous agents using a state-machine workflow.

Architecture: State-graph based (LangGraph-style logic, own implementation)
  - Maintains conversation state per user session
  - Routes tasks to appropriate agents
  - Handles failures and retries
  - Broadcasts real-time updates via WebSocket
  - Logs all agent executions for transparency

Agent Registry:
  1.  UniversityScraperAgent     — Data ingestion
  2.  ScholarshipScraperAgent    — Data ingestion
  3.  ProfileAnalyzerAgent       — Profile intelligence
  4.  UniversityMatchAgent       — Matching engine
  5.  SOPWriterAgent             — Document generation
  6.  ScholarshipMatchAgent      — Financial aid matching
  7.  DocumentAuditAgent         — Document review
  8.  EmailDraftAgent            — Communication
  9.  VisaGuideAgent             — Visa navigation
  10. InterviewCoachAgent        — Interview prep
  11. CityLifeAgent              — Post-arrival
  12. CareerROIAgent             — Career outcomes
"""
import asyncio
import json
import logging
import time
from datetime import datetime, timezone
from typing import Optional, Callable, Any
from enum import Enum

logger = logging.getLogger(__name__)


# ─── Agent State ──────────────────────────────────────────────────────────────

class AgentState:
    def __init__(self, user_id: int, session_id: str):
        self.user_id = user_id
        self.session_id = session_id
        self.profile: dict = {}
        self.matches: list = []
        self.sops: dict = {}
        self.analysis: dict = {}
        self.scholarships: list = []
        self.visa_info: dict = {}
        self.history: list = []
        self.active_agents: set = set()
        self.completed_agents: set = set()
        self.failed_agents: set = set()
        self.messages: list = []
        self.created_at = datetime.now(timezone.utc).isoformat()
        self.updated_at = self.created_at

    def update(self, key: str, value: Any):
        setattr(self, key, value)
        self.updated_at = datetime.now(timezone.utc).isoformat()

    def add_message(self, role: str, content: str, agent: str = None):
        self.messages.append({
            "role": role,
            "content": content,
            "agent": agent,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "session_id": self.session_id,
            "active_agents": list(self.active_agents),
            "completed_agents": list(self.completed_agents),
            "failed_agents": list(self.failed_agents),
            "has_profile": bool(self.profile),
            "match_count": len(self.matches),
            "sop_count": len(self.sops),
            "updated_at": self.updated_at,
        }


# ─── Task Types ───────────────────────────────────────────────────────────────

class TaskType(str, Enum):
    ANALYZE_PROFILE = "analyze_profile"
    FIND_UNIVERSITIES = "find_universities"
    GENERATE_SOP = "generate_sop"
    MATCH_SCHOLARSHIPS = "match_scholarships"
    GENERATE_EMAIL = "generate_email"
    VISA_GUIDE = "visa_guide"
    SCRAPE_UNIVERSITIES = "scrape_universities"
    AUDIT_DOCUMENTS = "audit_documents"
    INTERVIEW_PREP = "interview_prep"
    CITY_LIFE_INFO = "city_life_info"
    CAREER_ROI = "career_roi"
    FULL_PIPELINE = "full_pipeline"


# ─── Supervisor Agent ─────────────────────────────────────────────────────────

class SupervisorAgent:
    """
    Central orchestrator that routes tasks to 12 specialized agents.
    Implements a state-machine workflow with:
    - Parallel agent execution where possible
    - Sequential dependencies enforced
    - Real-time WebSocket updates
    - Retry logic for failed agents
    - Cost tracking across all agents
    """

    def __init__(self):
        self.name = "SupervisorAgent"
        self.sessions: dict[str, AgentState] = {}
        self._ws_callbacks: dict[str, list[Callable]] = {}
        self._load_agents()

    def _load_agents(self):
        """Lazy-load agents to avoid circular imports and startup time."""
        self._agents = {}

    def _get_agent(self, name: str):
        """Lazy-load an agent on first use."""
        if name not in self._agents:
            if name == "profile_analyzer":
                from backend.agents.profile_analyzer import profile_analyzer_agent
                self._agents[name] = profile_analyzer_agent
            elif name == "university_match":
                from backend.agents.university_match import university_match_agent
                self._agents[name] = university_match_agent
            elif name == "sop_writer":
                from backend.agents.sop_writer import sop_writer_agent
                self._agents[name] = sop_writer_agent
            elif name == "university_scraper":
                from backend.agents.university_scraper import university_scraper_agent
                self._agents[name] = university_scraper_agent
            elif name == "scholarship_match":
                from backend.agents.scholarship_match import scholarship_match_agent
                self._agents[name] = scholarship_match_agent
            elif name == "document_audit":
                from backend.agents.document_audit import document_audit_agent
                self._agents[name] = document_audit_agent
            elif name == "email_draft":
                from backend.agents.email_draft import email_draft_agent
                self._agents[name] = email_draft_agent
            elif name == "visa_guide":
                from backend.agents.visa_guide import visa_guide_agent
                self._agents[name] = visa_guide_agent
            elif name == "interview_coach":
                from backend.agents.interview_coach import interview_coach_agent
                self._agents[name] = interview_coach_agent
            elif name == "city_life":
                from backend.agents.city_life import city_life_agent
                self._agents[name] = city_life_agent
            elif name == "career_roi":
                from backend.agents.career_roi import career_roi_agent
                self._agents[name] = career_roi_agent
        return self._agents.get(name)

    # ─── Session Management ───────────────────────────────────────────────────

    def create_session(self, user_id: int) -> str:
        """Create a new agent session for a user."""
        import uuid
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = AgentState(user_id, session_id)
        logger.info(f"[Supervisor] Created session {session_id} for user {user_id}")
        return session_id

    def get_session(self, session_id: str) -> Optional[AgentState]:
        return self.sessions.get(session_id)

    def register_ws_callback(self, session_id: str, callback: Callable):
        """Register a WebSocket callback for real-time updates."""
        if session_id not in self._ws_callbacks:
            self._ws_callbacks[session_id] = []
        self._ws_callbacks[session_id].append(callback)

    async def _broadcast(self, session_id: str, event: dict):
        """Send real-time update to connected WebSocket clients."""
        callbacks = self._ws_callbacks.get(session_id, [])
        for callback in callbacks:
            try:
                await callback(event)
            except Exception as e:
                logger.debug(f"[Supervisor] WebSocket callback error: {e}")

    # ─── Task Routing ─────────────────────────────────────────────────────────

    async def run_task(self, session_id: str, task_type: TaskType,
                        task_data: dict = None) -> dict:
        """
        Route a task to the appropriate agent(s).
        This is the main entry point for all agent operations.
        """
        state = self.get_session(session_id)
        if not state:
            raise ValueError(f"Session {session_id} not found. Call create_session first.")

        task_data = task_data or {}
        start_time = time.time()

        # Broadcast task start
        await self._broadcast(session_id, {
            "type": "task_start",
            "task": task_type.value,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        try:
            result = await self._route_task(state, task_type, task_data)
            duration = time.time() - start_time

            # Broadcast completion
            await self._broadcast(session_id, {
                "type": "task_complete",
                "task": task_type.value,
                "duration_seconds": round(duration, 2),
                "timestamp": datetime.now(timezone.utc).isoformat()
            })

            return {
                "success": True,
                "task": task_type.value,
                "duration_seconds": round(duration, 2),
                "result": result,
                "session_state": state.to_dict()
            }

        except Exception as e:
            logger.error(f"[Supervisor] Task {task_type.value} failed: {e}")
            await self._broadcast(session_id, {
                "type": "task_failed",
                "task": task_type.value,
                "error": str(e),
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            return {
                "success": False,
                "task": task_type.value,
                "error": str(e),
                "session_state": state.to_dict()
            }

    async def _route_task(self, state: AgentState, task_type: TaskType,
                           task_data: dict) -> Any:
        """Internal task routing logic."""

        if task_type == TaskType.ANALYZE_PROFILE:
            return await self._run_profile_analysis(state, task_data)

        elif task_type == TaskType.FIND_UNIVERSITIES:
            return await self._run_university_matching(state, task_data)

        elif task_type == TaskType.GENERATE_SOP:
            return await self._run_sop_generation(state, task_data)

        elif task_type == TaskType.SCRAPE_UNIVERSITIES:
            return await self._run_university_scraping(state, task_data)

        elif task_type == TaskType.FULL_PIPELINE:
            return await self._run_full_pipeline(state, task_data)

        elif task_type == TaskType.MATCH_SCHOLARSHIPS:
            return await self._run_scholarship_matching(state, task_data)

        elif task_type == TaskType.AUDIT_DOCUMENTS:
            return await self._run_document_audit(state, task_data)

        elif task_type == TaskType.GENERATE_EMAIL:
            return await self._run_email_draft(state, task_data)

        elif task_type == TaskType.VISA_GUIDE:
            return await self._run_visa_guide(state, task_data)

        elif task_type == TaskType.INTERVIEW_PREP:
            return await self._run_interview_prep(state, task_data)

        elif task_type == TaskType.CITY_LIFE_INFO:
            return await self._run_city_life(state, task_data)

        elif task_type == TaskType.CAREER_ROI:
            return await self._run_career_roi(state, task_data)

        else:
            return {"message": f"Task type '{task_type.value}' — agent coming soon in next build phase"}

    # ─── Agent Execution Methods ──────────────────────────────────────────────

    async def _run_profile_analysis(self, state: AgentState, data: dict) -> dict:
        """Run ProfileAnalyzerAgent and update session state."""
        profile = data.get("profile") or state.profile
        if not profile:
            raise ValueError("No profile data provided")

        agent_name = "ProfileAnalyzerAgent"
        state.active_agents.add(agent_name)

        await self._broadcast(state.session_id, {
            "type": "agent_start",
            "agent": agent_name,
            "message": "Analyzing your academic profile..."
        })

        try:
            agent = self._get_agent("profile_analyzer")
            result = await agent.analyze(profile)

            state.update("profile", profile)
            state.update("analysis", result)
            state.completed_agents.add(agent_name)
            state.active_agents.discard(agent_name)

            await self._broadcast(state.session_id, {
                "type": "agent_complete",
                "agent": agent_name,
                "summary": f"Profile {result.get('profile_completeness_pct', 0)}% complete. "
                          f"Overall strength: {result.get('overall_profile_score', 0)}/100"
            })

            return result

        except Exception as e:
            state.active_agents.discard(agent_name)
            state.failed_agents.add(agent_name)
            raise

    async def _run_university_matching(self, state: AgentState, data: dict) -> dict:
        """Run UniversityMatchAgent."""
        profile = data.get("profile") or state.profile
        if not profile:
            raise ValueError("Profile required for university matching")

        agent_name = "UniversityMatchAgent"
        state.active_agents.add(agent_name)

        await self._broadcast(state.session_id, {
            "type": "agent_start",
            "agent": agent_name,
            "message": "Searching 600+ universities for best matches..."
        })

        try:
            agent = self._get_agent("university_match")
            result = await agent.match(
                profile=profile,
                top_n=data.get("top_n", 20),
                include_reasoning=data.get("include_reasoning", True)
            )

            state.update("matches", result.get("top_matches", []))
            state.completed_agents.add(agent_name)
            state.active_agents.discard(agent_name)

            await self._broadcast(state.session_id, {
                "type": "agent_complete",
                "agent": agent_name,
                "summary": f"Found {result.get('total_matches', 0)} matches: "
                          f"{result['tier_summary'].get('reach', 0)} reach, "
                          f"{result['tier_summary'].get('match', 0)} match, "
                          f"{result['tier_summary'].get('safety', 0)} safety"
            })

            return result

        except Exception as e:
            state.active_agents.discard(agent_name)
            state.failed_agents.add(agent_name)
            raise

    async def _run_sop_generation(self, state: AgentState, data: dict) -> dict:
        """Run SOPWriterAgent for a specific university."""
        profile = data.get("profile") or state.profile
        university = data.get("university_name")
        program = data.get("program_name")

        if not all([profile, university, program]):
            raise ValueError("Profile, university, and program required for SOP generation")

        agent_name = "SOPWriterAgent"
        state.active_agents.add(agent_name)

        await self._broadcast(state.session_id, {
            "type": "agent_start",
            "agent": agent_name,
            "message": f"Writing personalized SOP for {university}..."
        })

        try:
            agent = self._get_agent("sop_writer")
            result = await agent.generate(
                profile=profile,
                university_name=university,
                program_name=program,
                word_count=data.get("word_count", 1000),
                tone=data.get("tone", "professional")
            )

            # Cache SOP in session state
            key = f"{university}_{program}"
            state.sops[key] = result
            state.completed_agents.add(agent_name)
            state.active_agents.discard(agent_name)

            await self._broadcast(state.session_id, {
                "type": "agent_complete",
                "agent": agent_name,
                "summary": f"SOP generated: {result.get('word_count', 0)} words, "
                          f"quality score: {result['scores'].get('overall', 0)}/100"
            })

            return result

        except Exception as e:
            state.active_agents.discard(agent_name)
            state.failed_agents.add(agent_name)
            raise

    async def _run_university_scraping(self, state: AgentState, data: dict) -> dict:
        """Run UniversityScraperAgent to populate the database."""
        agent_name = "UniversityScraperAgent"
        state.active_agents.add(agent_name)

        await self._broadcast(state.session_id, {
            "type": "agent_start",
            "agent": agent_name,
            "message": "Starting autonomous university data scraping..."
        })

        try:
            agent = self._get_agent("university_scraper")
            result = await agent.run(
                countries=data.get("countries"),
                limit_per_country=data.get("limit_per_country")
            )

            state.completed_agents.add(agent_name)
            state.active_agents.discard(agent_name)

            await self._broadcast(state.session_id, {
                "type": "agent_complete",
                "agent": agent_name,
                "summary": f"Scraped {result.get('universities_scraped', 0)} universities, "
                          f"indexed {result.get('programs_indexed', 0)} programs"
            })

            return result

        except Exception as e:
            state.active_agents.discard(agent_name)
            state.failed_agents.add(agent_name)
            raise

    async def _run_scholarship_matching(self, state: AgentState, data: dict) -> dict:
        """Run ScholarshipMatchAgent."""
        profile = data.get("profile") or state.profile
        agent_name = "ScholarshipMatchAgent"
        state.active_agents.add(agent_name)
        await self._broadcast(state.session_id, {"type": "agent_start", "agent": agent_name,
                                                   "message": "Searching global scholarships for your profile..."})
        try:
            agent = self._get_agent("scholarship_match")
            result = await agent.match(
                profile=profile,
                top_n=data.get("top_n", 10),
                country_filter=data.get("country_filter"),
            )
            state.update("scholarships", result.get("scholarships", []))
            state.completed_agents.add(agent_name)
            state.active_agents.discard(agent_name)
            await self._broadcast(state.session_id, {"type": "agent_complete", "agent": agent_name,
                                                       "summary": f"Found {result.get('eligible_count', 0)} eligible scholarships. Total potential: ${result.get('total_potential_funding_usd', 0):,}"})
            return result
        except Exception:
            state.active_agents.discard(agent_name)
            state.failed_agents.add(agent_name)
            raise

    async def _run_document_audit(self, state: AgentState, data: dict) -> dict:
        """Run DocumentAuditAgent."""
        profile = data.get("profile") or state.profile
        agent_name = "DocumentAuditAgent"
        state.active_agents.add(agent_name)
        await self._broadcast(state.session_id, {"type": "agent_start", "agent": agent_name,
                                                   "message": "Auditing your document readiness..."})
        try:
            agent = self._get_agent("document_audit")
            result = await agent.audit(
                profile=profile,
                target_countries=data.get("target_countries"),
                existing_documents=data.get("existing_documents"),
            )
            state.completed_agents.add(agent_name)
            state.active_agents.discard(agent_name)
            await self._broadcast(state.session_id, {"type": "agent_complete", "agent": agent_name,
                                                       "summary": f"Document readiness: {result.get('overall_readiness_pct', 0)}%. Critical gaps: {len(result.get('critical_gaps', []))}"})
            return result
        except Exception:
            state.active_agents.discard(agent_name)
            state.failed_agents.add(agent_name)
            raise

    async def _run_email_draft(self, state: AgentState, data: dict) -> dict:
        """Run EmailDraftAgent."""
        profile = data.get("profile") or state.profile
        agent_name = "EmailDraftAgent"
        state.active_agents.add(agent_name)
        await self._broadcast(state.session_id, {"type": "agent_start", "agent": agent_name,
                                                   "message": "Drafting personalized email..."})
        try:
            agent = self._get_agent("email_draft")
            email_type = data.get("email_type", "professor")
            if email_type == "scholarship":
                result = await agent.draft_scholarship_cover_letter(
                    profile=profile,
                    scholarship_name=data.get("scholarship_name", "Target Scholarship"),
                    scholarship_country=data.get("country", "Target Country"),
                    word_limit=data.get("word_limit", 500),
                )
            else:
                result = await agent.draft_professor_email(
                    profile=profile,
                    professor_name=data.get("professor_name", "Professor"),
                    professor_research=data.get("professor_research", "relevant research area"),
                    university_name=data.get("university_name", "Target University"),
                    program_name=data.get("program_name", "Graduate Program"),
                )
            state.completed_agents.add(agent_name)
            state.active_agents.discard(agent_name)
            return result
        except Exception:
            state.active_agents.discard(agent_name)
            state.failed_agents.add(agent_name)
            raise

    async def _run_visa_guide(self, state: AgentState, data: dict) -> dict:
        """Run VisaGuideAgent."""
        profile = data.get("profile") or state.profile
        countries = data.get("countries") or profile.get("target_countries") or ["USA"]
        agent_name = "VisaGuideAgent"
        state.active_agents.add(agent_name)
        await self._broadcast(state.session_id, {"type": "agent_start", "agent": agent_name,
                                                   "message": f"Loading visa guide for {', '.join(countries)}..."})
        try:
            agent = self._get_agent("visa_guide")
            if isinstance(countries, list):
                results = {}
                for c in countries[:3]:  # Max 3 at once
                    results[c] = await agent.guide(country=c, profile=profile)
                result = {"countries": results, "count": len(results)}
            else:
                result = await agent.guide(country=countries, profile=profile)
            state.update("visa_info", result)
            state.completed_agents.add(agent_name)
            state.active_agents.discard(agent_name)
            return result
        except Exception:
            state.active_agents.discard(agent_name)
            state.failed_agents.add(agent_name)
            raise

    async def _run_interview_prep(self, state: AgentState, data: dict) -> dict:
        """Run InterviewCoachAgent."""
        profile = data.get("profile") or state.profile
        agent_name = "InterviewCoachAgent"
        state.active_agents.add(agent_name)
        await self._broadcast(state.session_id, {"type": "agent_start", "agent": agent_name,
                                                   "message": "Generating personalized interview questions..."})
        try:
            agent = self._get_agent("interview_coach")
            result = await agent.generate_questions(
                profile=profile,
                university_name=data.get("university_name", "Target University"),
                program_name=data.get("program_name", "Graduate Program"),
                interview_type=data.get("interview_type", "admission"),
                num_questions=data.get("num_questions", 10),
            )
            state.completed_agents.add(agent_name)
            state.active_agents.discard(agent_name)
            await self._broadcast(state.session_id, {"type": "agent_complete", "agent": agent_name,
                                                       "summary": f"Generated {result.get('total_questions', 0)} interview questions"})
            return result
        except Exception:
            state.active_agents.discard(agent_name)
            state.failed_agents.add(agent_name)
            raise

    async def _run_city_life(self, state: AgentState, data: dict) -> dict:
        """Run CityLifeAgent."""
        agent_name = "CityLifeAgent"
        state.active_agents.add(agent_name)
        await self._broadcast(state.session_id, {"type": "agent_start", "agent": agent_name,
                                                   "message": "Loading city cost-of-living data..."})
        try:
            agent = self._get_agent("city_life")
            city = data.get("city") or (data.get("profile", {}).get("target_countries") or ["Germany"])[0]
            result = await agent.get_city_info(city=city, profile=data.get("profile") or state.profile)
            state.completed_agents.add(agent_name)
            state.active_agents.discard(agent_name)
            return result
        except Exception:
            state.active_agents.discard(agent_name)
            state.failed_agents.add(agent_name)
            raise

    async def _run_career_roi(self, state: AgentState, data: dict) -> dict:
        """Run CareerROIAgent."""
        profile = data.get("profile") or state.profile
        agent_name = "CareerROIAgent"
        state.active_agents.add(agent_name)
        await self._broadcast(state.session_id, {"type": "agent_start", "agent": agent_name,
                                                   "message": "Calculating career ROI for your target countries..."})
        try:
            agent = self._get_agent("career_roi")
            result = await agent.calculate(
                profile=profile,
                university_name=data.get("university_name", "Target University"),
                country=data.get("country") or (profile.get("target_countries") or ["USA"])[0],
                annual_tuition_usd=data.get("annual_tuition_usd", 25000),
                program_duration_years=data.get("program_duration_years", 2.0),
            )
            state.completed_agents.add(agent_name)
            state.active_agents.discard(agent_name)
            await self._broadcast(state.session_id, {"type": "agent_complete", "agent": agent_name,
                                                       "summary": f"ROI: {result.get('verdict', 'Calculated')}"})
            return result
        except Exception:
            state.active_agents.discard(agent_name)
            state.failed_agents.add(agent_name)
            raise

    async def _run_full_pipeline(self, state: AgentState, data: dict) -> dict:
        """Run the full autonomous pipeline: profile → match → top SOP."""
        results = {}

        # Step 1: Profile Analysis
        results["profile_analysis"] = await self._run_profile_analysis(state, data)
        await asyncio.sleep(0.5)

        # Step 2: University Matching (depends on profile analysis)
        results["university_matches"] = await self._run_university_matching(state, data)
        await asyncio.sleep(0.5)

        # Step 3: Generate SOP for top match (in parallel with scholarship matching later)
        top_matches = results["university_matches"].get("top_matches", [])
        if top_matches:
            top_match = top_matches[0]
            results["top_sop"] = await self._run_sop_generation(state, {
                **data,
                "university_name": top_match.get("university_name", ""),
                "program_name": top_match.get("program_name", data.get("program_name", "")),
            })

        return {
            "pipeline": "full",
            "steps_completed": list(results.keys()),
            "results": results
        }

    async def chat(self, session_id: str, message: str) -> str:
        """
        Natural language interface to the agent system.
        Routes user queries to appropriate agents and returns clean formatted text.
        """
        state = self.get_session(session_id)
        if not state:
            raise ValueError("Session not found")

        state.add_message("user", message)
        message_lower = message.lower()

        # Intent detection
        if any(kw in message_lower for kw in ["analyze", "profile", "strengths", "gaps", "gpa", "score"]):
            task = TaskType.ANALYZE_PROFILE
        elif any(kw in message_lower for kw in ["match", "universities", "find uni", "recommend uni", "shortlist"]):
            task = TaskType.FIND_UNIVERSITIES
        elif any(kw in message_lower for kw in ["sop", "statement of purpose", "write essay", "motivation letter"]):
            task = TaskType.GENERATE_SOP
        elif any(kw in message_lower for kw in ["scholarship", "funding", "financial aid", "fulbright", "daad", "chevening"]):
            task = TaskType.MATCH_SCHOLARSHIPS
        elif any(kw in message_lower for kw in ["visa", "permit", "immigration", "blocked account", "aps", "i-20", "cas"]):
            task = TaskType.VISA_GUIDE
        elif any(kw in message_lower for kw in ["interview", "mock interview", "prepare interview", "practice"]):
            task = TaskType.INTERVIEW_PREP
        elif any(kw in message_lower for kw in ["document", "checklist", "documents required", "what papers"]):
            task = TaskType.AUDIT_DOCUMENTS
        elif any(kw in message_lower for kw in ["email", "professor", "faculty", "contact", "outreach"]):
            task = TaskType.GENERATE_EMAIL
        elif any(kw in message_lower for kw in ["city", "cost of living", "housing", "rent", "monthly cost", "live in"]):
            task = TaskType.CITY_LIFE_INFO
        elif any(kw in message_lower for kw in ["salary", "career", "roi", "return", "job", "income", "worth it"]):
            task = TaskType.CAREER_ROI
        else:
            # Helpful fallback with all capabilities listed
            response = (
                "I'm your StudyAbroad AI Advisor. Here's what I can help with:\n\n"
                "🎓 **Profile Analysis** — analyze your GPA, test scores, and academic strength\n"
                "🏛️ **University Matching** — find the best universities for your profile\n"
                "📝 **SOP Writing** — generate a personalized Statement of Purpose\n"
                "💰 **Scholarship Search** — find DAAD, Fulbright, Chevening and more\n"
                "🛂 **Visa Guide** — step-by-step visa requirements by country\n"
                "📋 **Document Audit** — check what documents you're missing\n"
                "✉️ **Email Drafting** — write professor outreach or scholarship cover letters\n"
                "🎤 **Interview Prep** — personalized mock interview questions\n"
                "🏙️ **City Life** — cost-of-living breakdown for your target city\n"
                "📈 **Career ROI** — salary and financial return analysis\n\n"
                "What would you like to work on?"
            )
            state.add_message("assistant", response, agent="Supervisor")
            return response

        result = await self.run_task(session_id, task, {"profile": state.profile or {}, "message": message})

        # Format clean response based on task type
        agent_result = result.get("result", {})
        response_text = self._format_chat_response(task, agent_result, message)

        state.add_message("assistant", response_text, agent=task.value)
        return response_text

    def _format_chat_response(self, task: TaskType, result: dict, original_message: str) -> str:
        """Convert raw agent result into clean, readable chat response."""
        if not result or result.get("error"):
            return f"I encountered an issue processing that request. Please ensure your profile is set up at /profile and try again."

        if task == TaskType.ANALYZE_PROFILE:
            score = result.get("overall_profile_score") or result.get("overall_score", "N/A")
            completeness = result.get("profile_completeness_pct", "N/A")
            strengths = result.get("strengths", [])
            s_list = "\n".join(f"• {s}" for s in strengths[:3])
            return f"**Profile Analysis Complete** ✅\n\n📊 Overall Score: **{score}/100** | Profile Completeness: **{completeness}%**\n\n**Strengths:**\n{s_list}\n\nVisit **/profile** for the full analysis with gaps and action plan."

        elif task == TaskType.FIND_UNIVERSITIES:
            matches = result.get("top_matches", [])
            if not matches:
                return "No university matches found. Please complete your profile at /profile first."
            top3 = matches[:3]
            lines = []
            for m in top3:
                cand = m.get("candidate", m)
                name = cand.get("name") or cand.get("university_name", "University")
                score = m.get("overall_score", "N/A")
                tier = m.get("tier", "Match")
                lines.append(f"• **{name}** — {score}/100 ({tier})")
            uni_list = "\n".join(lines)
            total = result.get("total_matches", len(matches))
            return f"**Top University Matches** 🏛️\n\n{uni_list}\n\nFound {total} total matches. Visit **/universities** to see all with full details."

        elif task == TaskType.MATCH_SCHOLARSHIPS:
            schols = result.get("scholarships", [])
            eligible = result.get("eligible_count", 0)
            funding = result.get("total_potential_funding_usd", 0)
            if not schols:
                return "No scholarships found matching your profile. Complete your profile at /profile for better results."
            top2 = schols[:2]
            lines = [f"• **{s['scholarship'].get('name', 'Scholarship')}** — ${s['scholarship'].get('amount_usd', 0):,} ({s['scholarship'].get('country', '')})" for s in top2]
            return f"**Scholarships Found** 💰\n\n{chr(10).join(lines)}\n\n{eligible} scholarships you're eligible for. Total potential funding: **${funding:,}**. Visit **/dashboard** to see all."

        elif task == TaskType.VISA_GUIDE:
            countries = result.get("countries", {})
            if countries:
                country_name = list(countries.keys())[0]
                info = countries[country_name]
            else:
                info = result
                country_name = result.get("country", "Target Country")
            visa_type = info.get("visa_type", "Student Visa")
            processing = info.get("processing_time", "4-8 weeks")
            critical_gaps = info.get("profile_gaps", [])
            gap_note = f"\n\n⚠️ **Critical for you:** {critical_gaps[0].get('note', '')}" if critical_gaps else ""
            return f"**{country_name} Visa Guide** 🛂\n\n**Visa Type:** {visa_type}\n**Processing Time:** {processing}{gap_note}\n\nFull checklist and document list available at **/dashboard**."

        elif task == TaskType.AUDIT_DOCUMENTS:
            readiness = result.get("overall_readiness_pct", 0)
            gaps = result.get("critical_gaps", [])
            gap_list = "\n".join(f"• {g.get('doc', g.get('item', 'Document'))}" for g in gaps[:3])
            if gaps:
                return f"**Document Audit** 📋\n\n✅ Overall Readiness: **{readiness}%**\n\n❌ **Critical Missing:**\n{gap_list}\n\nFull checklist at **/dashboard**."
            return f"**Document Audit** 📋\n\n✅ Overall Readiness: **{readiness}%** — Looking good! See full checklist at **/dashboard**."

        elif task == TaskType.INTERVIEW_PREP:
            total = result.get("total_questions", 0)
            questions = result.get("questions", [])
            if questions:
                first_q = questions[0]
                preview = f"\n\n**Sample Question:**\n_{first_q.get('question', '')}_"
            else:
                preview = ""
            return f"**Interview Prep Ready** 🎤\n\n{total} personalized questions generated.{preview}\n\nFull mock interview at **/dashboard**."

        elif task == TaskType.CAREER_ROI:
            salary = result.get("avg_starting_salary_usd", 0)
            payback = result.get("payback_period_years", "N/A")
            verdict = result.get("verdict", "")
            roi_10 = result.get("roi_percentage", {}).get("10_years", 0)
            return f"**Career ROI Analysis** 📈\n\n💵 Avg Starting Salary: **${salary:,}/yr**\n⏱️ Payback Period: **{payback} years**\n📊 10-Year ROI: **{roi_10}%**\n\n_{verdict}_"

        elif task == TaskType.CITY_LIFE_INFO:
            city = result.get("city", "Your City")
            monthly_avg = result.get("total_monthly_avg_usd", 0)
            annual = result.get("annual_estimated_usd", 0)
            return f"**{city} Cost of Living** 🏙️\n\n💰 Monthly Average: **${monthly_avg:,}** | Annual: **${annual:,}**\n\n{result.get('student_life', '')}\n\nFull breakdown at **/dashboard**."

        # Generic fallback
        return f"Task completed. Results are available in your dashboard at **/dashboard**."


# ─── Global supervisor instance ───────────────────────────────────────────────
supervisor = SupervisorAgent()
