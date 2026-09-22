"""
StudyAbroad.AI — Application Configuration
Manages all settings with environment variable overrides.
Own-tools-first strategy enforced through config flags.
"""
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Literal, Optional
from pathlib import Path
import os


BASE_DIR = Path(__file__).parent.parent


class Settings(BaseSettings):
    # ── App ───────────────────────────────────────────────────────────────────
    app_name: str = "StudyAbroad.AI"
    app_version: str = "1.0.0"
    debug: bool = True
    secret_key: str = "change-this-secret-key-in-production"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    allowed_origins: str = "http://localhost:3000,http://localhost:8000"

    # ── Database (Multi-tier Free Architecture) ──────────────────────────────
    database_url: str = "sqlite+aiosqlite:///./data/studyabroad.db"
    turso_database_url: str = ""
    turso_auth_token: str = ""
    mongodb_url: str = ""
    mongodb_db_name: str = "studyabroad"
    neon_database_url: str = ""
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_bucket: str = "documents"

    # ── Redis / Celery (Own self-hosted) ──────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # ── LLM — Free Cloud APIs (No Local Compute Needed) ──────────────────────
    # Chain: Groq (free) → Gemini (free) → OpenRouter/Qwen (free) → OpenAI (paid last resort)
    llm_timeout_seconds: int = 30
    llm_max_retries: int = 3

    # 1. Groq — FREE, fastest (275 tok/s), 30 RPM, no credit card
    # Get key: https://console.groq.com
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"  # Best free model on Groq

    # 2. Gemini — Google FREE tier (15 RPM, 1M tokens/day)
    # Get key: https://aistudio.google.com/app/apikey
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"

    # 3. OpenRouter — FREE models (Qwen, Llama, Mistral)
    # Get key: https://openrouter.ai (free $1 credit on signup)
    openrouter_api_key: str = ""
    openrouter_model: str = "qwen/qwq-32b:free"  # Qwen 32B — free on OpenRouter

    # 4. PAID emergency fallbacks — only used when ALL free APIs fail on critical tasks
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    # ── Embeddings (Own fastembed — free, ONNX, no TF/GPU needed) ────────────
    embeddings_primary: str = "fastembed"
    embeddings_model: str = "BAAI/bge-small-en-v1.5"  # 384-dim, CPU-only, no TF
    openai_embeddings_fallback: bool = False
    embeddings_fallback_model: str = "text-embedding-3-small"

    # ── Vector Store (Own FAISS, free) ────────────────────────────────────────
    vector_store_primary: Literal["faiss", "pinecone"] = "faiss"
    vector_index_path: str = "./data/vector_index"
    vector_dimension: int = 384
    use_pinecone_fallback: bool = False
    pinecone_api_key: str = ""
    pinecone_environment: str = ""

    # ── Scraping (Own Playwright, free) ──────────────────────────────────────
    scraper_primary: Literal["playwright", "scraperapi"] = "playwright"
    scraper_headless: bool = True
    scraper_max_concurrent: int = 5
    scraper_rate_limit_seconds: float = 2.0
    scraper_retry_attempts: int = 3
    use_scraper_api_fallback: bool = False
    scraper_api_key: str = ""

    # ── Email (Own SMTP, free) ────────────────────────────────────────────────
    email_backend: Literal["smtp", "sendgrid"] = "smtp"
    email_host: str = "smtp.gmail.com"
    email_port: int = 587
    email_use_tls: bool = True
    email_username: str = ""
    email_password: str = ""
    email_from_name: str = "StudyAbroad.AI"
    email_from_address: str = ""
    use_sendgrid_fallback: bool = False
    sendgrid_api_key: str = ""

    # ── OCR (Own Tesseract, free) ─────────────────────────────────────────────
    ocr_primary: Literal["tesseract", "google_vision"] = "tesseract"
    tesseract_path: str = "tesseract"
    use_vision_api_fallback: bool = False
    google_vision_api_key: str = ""

    # ── Agent Settings ────────────────────────────────────────────────────────
    agent_max_iterations: int = 10
    agent_timeout_seconds: int = 120
    supervisor_model: str = "gemini"
    enable_agent_logging: bool = True
    agent_memory_window: int = 10

    # ── Scraping Schedule ─────────────────────────────────────────────────────
    university_scrape_interval_hours: int = 168
    scholarship_scrape_interval_hours: int = 24
    visa_rules_scrape_interval_hours: int = 72
    deadline_check_interval_hours: int = 6

    # ── Frontend ──────────────────────────────────────────────────────────────
    frontend_url: str = "http://localhost:3000"
    scraper_service_url: str = "http://localhost:3001"

    # ── Logging ───────────────────────────────────────────────────────────────
    log_level: str = "INFO"
    log_file: str = "./data/logs/app.log"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    @property
    def has_any_llm(self) -> bool:
        """True if at least one free LLM API key is configured."""
        return bool(self.groq_api_key or self.gemini_api_key or self.openrouter_api_key)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


# Singleton instance
settings = Settings()


def get_effective_llm() -> str:
    """
    Returns which free LLM API will be used.
    No local models needed — all cloud-based, all free.
    Chain: Groq → Gemini → OpenRouter → OpenAI (paid last resort)
    """
    if settings.groq_api_key:
        return f"groq ({settings.groq_model})"
    elif settings.gemini_api_key:
        return f"gemini ({settings.gemini_model})"
    elif settings.openrouter_api_key:
        return f"openrouter ({settings.openrouter_model})"
    elif settings.openai_api_key:
        import logging
        logging.warning(
            "[COST ALERT] Using paid OpenAI API. "
            "Add GROQ_API_KEY or GEMINI_API_KEY to .env for free usage."
        )
        return "openai (PAID — add free API keys!)"
    else:
        raise RuntimeError(
            "No LLM API configured. Get free keys (2 min each):\n"
            "  1. Groq (FASTEST): https://console.groq.com → GROQ_API_KEY\n"
            "  2. Gemini (Google): https://aistudio.google.com/app/apikey → GEMINI_API_KEY\n"
            "  3. OpenRouter (Qwen): https://openrouter.ai → OPENROUTER_API_KEY\n"
            "All are FREE — no credit card needed!"
        )
