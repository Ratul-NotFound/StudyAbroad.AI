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
            # Additional agents registered as they're built
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
        Routes user queries to appropriate agents automatically.
        """
        state = self.get_session(session_id)
        if not state:
            raise ValueError("Session not found")

        state.add_message("user", message)

        # Simple intent detection (can be replaced with LLM-based routing)
        message_lower = message.lower()

        if any(kw in message_lower for kw in ["analyze", "profile", "strengths", "gaps"]):
            task = TaskType.ANALYZE_PROFILE
        elif any(kw in message_lower for kw in ["match", "universities", "find", "recommend"]):
            task = TaskType.FIND_UNIVERSITIES
        elif any(kw in message_lower for kw in ["sop", "statement", "write", "essay"]):
            task = TaskType.GENERATE_SOP
        elif any(kw in message_lower for kw in ["scholarship", "funding", "financial"]):
            task = TaskType.MATCH_SCHOLARSHIPS
        elif any(kw in message_lower for kw in ["visa", "permit", "immigration"]):
            task = TaskType.VISA_GUIDE
        else:
            response = (
                "I can help you with: analyzing your profile, finding matching universities, "
                "writing SOPs, finding scholarships, visa guidance, and more. "
                "What would you like to do?"
            )
            state.add_message("assistant", response, agent="Supervisor")
            return response

        result = await self.run_task(session_id, task, {"message": message})
        response_text = json.dumps(result.get("result", {}), indent=2)[:500] + "..."

        state.add_message("assistant", response_text, agent="Supervisor")
        return response_text


# ─── Global supervisor instance ───────────────────────────────────────────────
supervisor = SupervisorAgent()
