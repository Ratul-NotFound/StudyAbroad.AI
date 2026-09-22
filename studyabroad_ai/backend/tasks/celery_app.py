"""
StudyAbroad.AI — Celery Task Queue Setup
Own self-hosted task queue (Celery + Redis) — no AWS SQS, no managed queues.
Handles:
  - Background university scraping (weekly)
  - Background scholarship scraping (daily)
  - Async agent runs triggered from API
  - Scheduled deadline checks
"""
from celery import Celery
from celery.schedules import crontab
import logging

from backend.config import settings

logger = logging.getLogger(__name__)

# ─── Create Celery App ────────────────────────────────────────────────────────

celery_app = Celery(
    "studyabroad_ai",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["backend.tasks.scheduled_tasks"]
)

# ─── Celery Configuration ─────────────────────────────────────────────────────

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_max_retries=3,
    task_default_retry_delay=60,  # 1 minute between retries
)

# ─── Celery Beat Schedule (Own cron scheduler — no managed cron costs) ────────

celery_app.conf.beat_schedule = {
    # Weekly university scraping (every Monday at 2 AM UTC)
    "scrape-universities-weekly": {
        "task": "backend.tasks.scheduled_tasks.scrape_universities",
        "schedule": crontab(hour=2, minute=0, day_of_week=1),
        "kwargs": {"limit_per_country": None},  # Full scrape
        "options": {"expires": 7 * 24 * 3600}
    },

    # Daily scholarship scraping (every day at 3 AM UTC)
    "scrape-scholarships-daily": {
        "task": "backend.tasks.scheduled_tasks.scrape_scholarships",
        "schedule": crontab(hour=3, minute=0),
        "options": {"expires": 24 * 3600}
    },

    # Every 6 hours: check for upcoming deadlines and send alerts
    "check-deadlines": {
        "task": "backend.tasks.scheduled_tasks.check_deadlines",
        "schedule": crontab(minute=0, hour="*/6"),
        "options": {"expires": 3600}
    },

    # Visa rules update (every 3 days at 4 AM UTC)
    "update-visa-rules": {
        "task": "backend.tasks.scheduled_tasks.update_visa_rules",
        "schedule": crontab(hour=4, minute=0, day_of_week="*/3"),
        "options": {"expires": 72 * 3600}
    },
}

if __name__ == "__main__":
    celery_app.start()
