"""
StudyAbroad.AI — Multi-Database Setup
Supports:
1. Primary Relational DB (SQLite for dev / Neon PostgreSQL / Turso LibSQL)
2. MongoDB Atlas (Async Motor for raw scraped content, SOP drafts, document stores)
3. Neon PostgreSQL (Analytics & complex relational reporting)
4. Storage (Supabase Storage or local filesystem fallback)
All with zero cost, zero required dependencies if not configured.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator, Optional, Any, Dict
import os
import logging

from backend.config import settings

logger = logging.getLogger("studyabroad.database")

# Create local data directories
os.makedirs("./data", exist_ok=True)
os.makedirs("./data/logs", exist_ok=True)
os.makedirs("./data/storage", exist_ok=True)

# ── 1. Primary Relational Engine (SQLAlchemy) ──────────────────────────────
# Automatically uses Neon/PostgreSQL or Turso if configured, else local SQLite
active_db_url = settings.neon_database_url or settings.database_url

# Standardize postgresql driver if needed
if active_db_url.startswith("postgres://"):
    active_db_url = active_db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif active_db_url.startswith("postgresql://") and not active_db_url.startswith("postgresql+asyncpg://"):
    active_db_url = active_db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(
    active_db_url,
    echo=False,
    future=True,
    pool_pre_ping=True if "postgresql" in active_db_url else False,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

class Base(DeclarativeBase):
    """Base class for all database models."""
    pass

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency injection for FastAPI routes."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    """Create all tables on startup."""
    import backend.models  # Register models with Base.metadata
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Primary database schema initialized successfully.")

# ── 2. MongoDB Atlas Async Client (Motor) ──────────────────────────────────
_mongo_client = None
_mongo_db = None

def get_mongo_db():
    """Returns async MongoDB database instance if configured."""
    global _mongo_client, _mongo_db
    if not settings.mongodb_url:
        return None
    if _mongo_db is None:
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            _mongo_client = AsyncIOMotorClient(settings.mongodb_url)
            _mongo_db = _mongo_client[settings.mongodb_db_name]
            logger.info("Connected to MongoDB Atlas cluster.")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB Atlas: {e}")
            return None
    return _mongo_db

# ── 3. Document / File Storage Manager ──────────────────────────────────────
class StorageManager:
    """Manages file storage using Supabase Storage or local filesystem."""
    
    @staticmethod
    async def save_file(filename: str, content: bytes, content_type: str = "application/octet-stream") -> str:
        """Saves a file and returns its URL or local path."""
        if settings.supabase_url and settings.supabase_key:
            try:
                import httpx
                url = f"{settings.supabase_url}/storage/v1/object/{settings.supabase_bucket}/{filename}"
                headers = {
                    "Authorization": f"Bearer {settings.supabase_key}",
                    "Content-Type": content_type,
                    "x-upsert": "true",
                }
                async with httpx.AsyncClient() as client:
                    resp = await client.post(url, content=content, headers=headers)
                    if resp.status_code in (200, 201):
                        return f"{settings.supabase_url}/storage/v1/object/public/{settings.supabase_bucket}/{filename}"
            except Exception as e:
                logger.warning(f"Supabase upload failed, falling back to local: {e}")
        
        # Local fallback
        local_path = os.path.join("./data/storage", filename)
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        with open(local_path, "wb") as f:
            f.write(content)
        return local_path

storage = StorageManager()
