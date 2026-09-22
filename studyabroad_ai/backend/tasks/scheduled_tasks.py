"""
StudyAbroad.AI — Scheduled Celery Tasks
All background autonomous agent runs scheduled via Celery Beat.
Own scheduler — no AWS EventBridge, no paid cron services.
"""
import asyncio
import logging
from datetime import datetime, timezone

from backend.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


def run_async(coro):
    """Helper to run async code in Celery (sync) context."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(bind=True, max_retries=3, name="backend.tasks.scheduled_tasks.scrape_universities")
def scrape_universities(self, countries=None, limit_per_country=None):
    """
    Weekly autonomous university data scraping.
    Runs Agent 1 (UniversityScraperAgent) in background.
    Tool: Playwright (own, free)
    """
    logger.info(f"[Celery] Starting weekly university scraping. Countries: {countries}")
    try:
        from backend.agents.university_scraper import university_scraper_agent
        result = run_async(university_scraper_agent.run(
            countries=countries,
            limit_per_country=limit_per_country
        ))
        logger.info(f"[Celery] University scraping complete: {result}")
        return result
    except Exception as exc:
        logger.error(f"[Celery] University scraping failed: {exc}")
        self.retry(exc=exc, countdown=300)  # Retry in 5 minutes


@celery_app.task(bind=True, max_retries=3, name="backend.tasks.scheduled_tasks.scrape_scholarships")
def scrape_scholarships(self):
    """
    Daily scholarship database update.
    Runs Agent 2 (ScholarshipScraperAgent) in background.
    """
    logger.info("[Celery] Starting daily scholarship scraping...")
    try:
        # Placeholder — ScholarshipScraperAgent built in Phase 2
        logger.info("[Celery] ScholarshipScraperAgent coming in Phase 2")
        return {"status": "pending", "message": "ScholarshipScraperAgent built in Phase 2"}
    except Exception as exc:
        self.retry(exc=exc, countdown=300)


@celery_app.task(bind=True, max_retries=2, name="backend.tasks.scheduled_tasks.check_deadlines")
def check_deadlines(self):
    """
    Every 6 hours: Check for upcoming application deadlines.
    Sends email alerts via own SMTP (no Twilio cost).
    """
    logger.info("[Celery] Running deadline check...")
    try:
        # Placeholder — email system built with auth in Phase 3
        logger.info("[Celery] Deadline checker active — email notifications coming in Phase 3")
        return {"status": "ok", "checked_at": datetime.now(timezone.utc).isoformat()}
    except Exception as exc:
        self.retry(exc=exc, countdown=120)


@celery_app.task(bind=True, max_retries=2, name="backend.tasks.scheduled_tasks.update_visa_rules")
def update_visa_rules(self):
    """
    Every 3 days: Update visa rules by scraping official government sources.
    Tool: Playwright (own, free).
    """
    logger.info("[Celery] Updating visa rules...")
    try:
        # Placeholder — VisaGuideAgent built in Phase 3
        logger.info("[Celery] VisaGuideAgent scraping coming in Phase 3")
        return {"status": "ok"}
    except Exception as exc:
        self.retry(exc=exc, countdown=300)


@celery_app.task(name="backend.tasks.scheduled_tasks.run_agent_async")
def run_agent_async(session_id: str, task_type: str, task_data: dict):
    """
    Generic async agent runner — triggered from API for long-running tasks.
    Returns task ID for polling.
    """
    from backend.agents.supervisor import supervisor, TaskType

    logger.info(f"[Celery] Running async agent task: {task_type}")
    try:
        result = run_async(supervisor.run_task(
            session_id=session_id,
            task_type=TaskType(task_type),
            task_data=task_data
        ))
        return result
    except Exception as exc:
        logger.error(f"[Celery] Agent task failed: {exc}")
        return {"success": False, "error": str(exc)}
