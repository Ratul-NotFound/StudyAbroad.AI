"""
StudyAbroad.AI — Database Models
Full schema: Users, Universities, Programs, Scholarships,
StudentProfiles, ApplicationPipelines, AgentTasks, etc.
"""
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text,
    JSON, ForeignKey, Enum as SAEnum, BigInteger
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from backend.database import Base


# ─── Enums ────────────────────────────────────────────────────────────────────

class AgentStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"


class ApplicationStatus(str, enum.Enum):
    RESEARCHING = "researching"
    PREPARING = "preparing"
    SUBMITTED = "submitted"
    AWAITING = "awaiting"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    DEFERRED = "deferred"
    WAITLISTED = "waitlisted"
    WITHDRAWN = "withdrawn"


class DocumentType(str, enum.Enum):
    SOP = "sop"
    LOR = "lor"
    TRANSCRIPT = "transcript"
    RESUME = "resume"
    IELTS = "ielts"
    TOEFL = "toefl"
    GRE = "gre"
    GMAT = "gmat"
    PASSPORT = "passport"
    OTHER = "other"


# ─── User Model ───────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    profile = relationship("StudentProfile", back_populates="user", uselist=False)
    applications = relationship("ApplicationPipeline", back_populates="user")
    agent_tasks = relationship("AgentTask", back_populates="user")


# ─── Student Profile ──────────────────────────────────────────────────────────

class StudentProfile(Base):
    """Comprehensive student academic and personal profile."""
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Academic Background
    degree_level = Column(String(50))           # bachelor, master, phd
    field_of_study = Column(String(255))
    current_institution = Column(String(255))
    gpa = Column(Float)
    gpa_scale = Column(Float, default=4.0)
    graduation_year = Column(Integer)
    country_of_education = Column(String(100))

    # Test Scores
    ielts_score = Column(Float)
    toefl_score = Column(Integer)
    gre_verbal = Column(Integer)
    gre_quant = Column(Integer)
    gre_awa = Column(Float)
    gmat_score = Column(Integer)
    sat_score = Column(Integer)
    duolingo_score = Column(Integer)

    # Preferences
    target_degree = Column(String(50))          # master, phd, mba
    target_fields = Column(JSON)                # List of fields
    target_countries = Column(JSON)             # List of countries
    target_start_date = Column(String(20))      # Fall 2025, Spring 2026
    budget_usd_per_year = Column(Integer)
    scholarship_required = Column(Boolean, default=False)
    work_permit_required = Column(Boolean, default=False)

    # Work Experience
    work_experience_years = Column(Float, default=0)
    work_experience_details = Column(JSON)      # List of {company, role, years}
    publications = Column(Integer, default=0)
    research_experience = Column(Text)
    extracurriculars = Column(JSON)
    skills = Column(JSON)                       # Technical and soft skills

    # Profile Completeness & AI Analysis
    profile_completeness_pct = Column(Float, default=0)
    ai_profile_summary = Column(Text)
    ai_strengths = Column(JSON)
    ai_gaps = Column(JSON)
    ai_recommendations = Column(JSON)
    profile_vector_id = Column(String(255))     # FAISS index reference

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="profile")


# ─── University ───────────────────────────────────────────────────────────────

class University(Base):
    """University data — auto-populated by UniversityScraperAgent."""
    __tablename__ = "universities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False, index=True)
    country = Column(String(100), index=True)
    city = Column(String(255))
    website = Column(String(500))

    # Rankings
    qs_rank = Column(Integer)
    the_rank = Column(Integer)
    us_news_rank = Column(Integer)
    arwu_rank = Column(Integer)
    national_rank = Column(Integer)

    # Metadata
    type = Column(String(50))                   # public, private
    acceptance_rate = Column(Float)
    total_students = Column(Integer)
    international_students_pct = Column(Float)
    language_of_instruction = Column(String(50))

    # Financial
    avg_tuition_usd_per_year = Column(Integer)
    avg_living_cost_usd_per_year = Column(Integer)

    # Scraping metadata
    last_scraped_at = Column(DateTime(timezone=True))
    scrape_source_url = Column(Text)
    data_quality_score = Column(Float, default=1.0)

    # FAISS reference
    vector_id = Column(String(255))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    programs = relationship("Program", back_populates="university")
    scholarships = relationship("Scholarship", back_populates="university")


# ─── Program ──────────────────────────────────────────────────────────────────

class Program(Base):
    """Specific degree programs — auto-populated by UniversityScraperAgent."""
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True, index=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False)

    name = Column(String(500), nullable=False, index=True)
    degree = Column(String(50))                 # MS, MBA, PhD, MEng, MFA, etc.
    field = Column(String(255), index=True)
    specialization = Column(String(255))
    duration_years = Column(Float)
    language = Column(String(50), default="English")
    mode = Column(String(50))                   # full-time, part-time, online

    # Admission Requirements
    min_gpa = Column(Float)
    min_ielts = Column(Float)
    min_toefl = Column(Integer)
    gre_required = Column(Boolean)
    min_gre_quant = Column(Integer)
    work_exp_required_years = Column(Float)

    # Financial
    tuition_usd_per_year = Column(Integer)
    application_fee_usd = Column(Integer)

    # Deadlines (JSON for multiple intakes)
    deadlines = Column(JSON)                    # [{intake: "Fall 2025", deadline: "2025-01-15", type: "regular"}]
    intake_months = Column(JSON)                # [9, 1] for September and January

    # Application
    application_url = Column(Text)
    program_url = Column(Text)

    # Acceptance data
    avg_acceptance_rate = Column(Float)
    avg_enrolled_gpa = Column(Float)
    avg_enrolled_gre = Column(Integer)

    # Scraping metadata
    last_scraped_at = Column(DateTime(timezone=True))
    vector_id = Column(String(255))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    university = relationship("University", back_populates="programs")
    matches = relationship("UniversityMatch", back_populates="program")


# ─── Scholarship ──────────────────────────────────────────────────────────────

class Scholarship(Base):
    """Scholarships — auto-populated by ScholarshipScraperAgent."""
    __tablename__ = "scholarships"

    id = Column(Integer, primary_key=True, index=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=True)

    name = Column(String(500), nullable=False)
    provider = Column(String(255))              # University, Government, NGO
    type = Column(String(100))                  # Full, Partial, Tuition-only, Living

    # Value
    amount_usd = Column(Integer)
    covers_tuition = Column(Boolean, default=False)
    covers_living = Column(Boolean, default=False)
    covers_travel = Column(Boolean, default=False)
    coverage_percentage = Column(Float)
    is_renewable = Column(Boolean, default=False)

    # Eligibility
    eligible_countries = Column(JSON)           # List of country codes or ["ALL"]
    eligible_degrees = Column(JSON)             # ["MS", "PhD"]
    eligible_fields = Column(JSON)
    min_gpa = Column(Float)
    other_requirements = Column(JSON)

    # Deadline
    deadline = Column(DateTime(timezone=True))
    application_url = Column(Text)
    is_open = Column(Boolean, default=True)

    # Scraping metadata
    last_scraped_at = Column(DateTime(timezone=True))
    source_url = Column(Text)
    is_verified = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    university = relationship("University", back_populates="scholarships")


# ─── Application Pipeline ─────────────────────────────────────────────────────

class ApplicationPipeline(Base):
    """Tracks student's application to a specific university/program."""
    __tablename__ = "application_pipelines"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)

    status = Column(SAEnum(ApplicationStatus), default=ApplicationStatus.RESEARCHING)
    match_score = Column(Float)
    tier = Column(String(20))                   # reach, match, safety
    priority_rank = Column(Integer)

    # Application tracking
    application_deadline = Column(DateTime(timezone=True))
    submitted_at = Column(DateTime(timezone=True))
    decision_date = Column(DateTime(timezone=True))
    decision = Column(String(50))               # accepted, rejected, waitlisted, etc.

    # Documents checklist
    documents_checklist = Column(JSON)
    sop_generated = Column(Boolean, default=False)
    sop_content = Column(Text)
    email_draft = Column(Text)

    # Notes
    notes = Column(Text)
    ai_action_plan = Column(JSON)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="applications")
    program = relationship("Program")


# ─── University Match ─────────────────────────────────────────────────────────

class UniversityMatch(Base):
    """AI-generated university match results for a student."""
    __tablename__ = "university_matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)

    # Scoring (all out of 100)
    overall_score = Column(Float)
    academic_fit_score = Column(Float)
    financial_fit_score = Column(Float)
    preference_fit_score = Column(Float)
    admission_probability = Column(Float)

    tier = Column(String(20))                   # reach, match, safety
    reasoning = Column(Text)
    action_plan = Column(JSON)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    program = relationship("Program", back_populates="matches")


# ─── Agent Task ───────────────────────────────────────────────────────────────

class AgentTask(Base):
    """Tracks every autonomous agent execution."""
    __tablename__ = "agent_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    agent_name = Column(String(255), nullable=False, index=True)
    task_type = Column(String(255))
    input_data = Column(JSON)
    status = Column(SAEnum(AgentStatus), default=AgentStatus.PENDING)

    # Execution tracking
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    duration_seconds = Column(Float)
    retry_count = Column(Integer, default=0)

    # Results
    output_data = Column(JSON)
    error_message = Column(Text)

    # Tool usage tracking (own vs fallback)
    tools_used = Column(JSON)                   # List of tool names used
    used_fallback = Column(Boolean, default=False)
    fallback_reason = Column(Text)

    # Cost tracking (if any paid fallbacks were used)
    estimated_cost_usd = Column(Float, default=0.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="agent_tasks")


# ─── Visa Information ─────────────────────────────────────────────────────────

class VisaInfo(Base):
    """Country-specific visa information — scraped by VisaRulesAgent."""
    __tablename__ = "visa_info"

    id = Column(Integer, primary_key=True, index=True)
    country = Column(String(100), nullable=False, index=True)
    visa_type = Column(String(100))             # Student Visa, F-1, Tier 4, etc.

    # Requirements
    requirements = Column(JSON)
    processing_time_weeks = Column(Integer)
    fee_usd = Column(Integer)
    success_rate = Column(Float)

    # Work rights
    work_hours_per_week = Column(Integer)
    post_study_work_years = Column(Float)
    pr_pathway_available = Column(Boolean)

    # Data freshness
    last_updated = Column(DateTime(timezone=True))
    source_url = Column(Text)
    is_verified = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ─── SOP Draft ────────────────────────────────────────────────────────────────

class SOPDraft(Base):
    """SOP versions generated by SOPWriterAgent."""
    __tablename__ = "sop_drafts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)

    version = Column(Integer, default=1)
    content = Column(Text, nullable=False)
    word_count = Column(Integer)

    # AI Quality Scores
    relevance_score = Column(Float)
    clarity_score = Column(Float)
    originality_score = Column(Float)
    overall_score = Column(Float)

    ai_feedback = Column(JSON)
    llm_model_used = Column(String(100))
    used_fallback_llm = Column(Boolean, default=False)

    is_final = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ─── Scraped Data Cache ───────────────────────────────────────────────────────

class ScrapedDataCache(Base):
    """Cache for scraped web content to avoid redundant requests."""
    __tablename__ = "scraped_data_cache"

    id = Column(Integer, primary_key=True, index=True)
    url_hash = Column(String(64), unique=True, index=True)
    url = Column(Text, nullable=False)
    content_hash = Column(String(64))
    raw_content = Column(Text)
    parsed_data = Column(JSON)

    scraper_used = Column(String(50))           # playwright | scraperapi
    status_code = Column(Integer)
    scraped_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))
    is_stale = Column(Boolean, default=False)
