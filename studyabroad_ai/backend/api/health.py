"""
StudyAbroad.AI — Backend Health Check Route
Enriched to report all service statuses (vector store, LLM, scraper service, Redis)
"""
from fastapi import APIRouter
from fastapi.responses import JSONResponse
import httpx
import asyncio
from datetime import datetime

from backend.config import settings, get_effective_llm
from backend.tools.vector_store import get_vector_store_status

router = APIRouter()


@router.get("/health", include_in_schema=False)
async def health_check():
    """Returns status of all integrated services."""
    checks = {
        "status": "ok",
        "version": settings.app_version,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "llm": {},
        "vector_store": {},
        "scraper_service": {},
        "redis": {},
    }

    # LLM status
    try:
        llm = get_effective_llm()
        checks["llm"] = {"status": "configured", "provider": llm}
    except Exception as e:
        checks["llm"] = {"status": "unconfigured", "note": str(e)[:120]}

    # Vector store status
    try:
        vs_status = get_vector_store_status()
        checks["vector_store"] = {"status": "ok", **vs_status}
    except Exception as e:
        checks["vector_store"] = {"status": "error", "error": str(e)[:80]}

    # Scraper service health
    scraper_url = getattr(settings, "scraper_service_url", "http://localhost:3001")
    try:
        async with httpx.AsyncClient(timeout=3) as client:
            resp = await client.get(f"{scraper_url}/health")
            checks["scraper_service"] = {"status": "ok" if resp.status_code == 200 else "degraded", "url": scraper_url}
    except Exception:
        checks["scraper_service"] = {"status": "offline", "url": scraper_url, "note": "Start with: cd scraper-service && npm run dev"}

    # Redis health
    try:
        import redis.asyncio as aioredis  # type: ignore
        r = aioredis.from_url(settings.redis_url, socket_connect_timeout=2)
        await r.ping()
        await r.aclose()
        checks["redis"] = {"status": "ok", "url": settings.redis_url}
    except Exception:
        checks["redis"] = {"status": "offline", "url": settings.redis_url, "note": "Run: docker run -d -p 6379:6379 redis"}

    # Overall status
    degraded = any(
        v.get("status") in ("error", "offline") 
        for v in [checks["vector_store"], checks["scraper_service"], checks["redis"]]
    )
    checks["status"] = "degraded" if degraded else "ok"
    http_status = 200 if checks["status"] in ("ok", "degraded") else 503

    return JSONResponse(content=checks, status_code=http_status)
