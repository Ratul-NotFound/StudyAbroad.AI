# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## StudyAbroad.AI — Autonomous Study Abroad Intelligence Platform

**Document Information**

| Field | Detail |
|---|---|
| Document Title | Software Requirements Specification |
| Project Name | StudyAbroad.AI |
| Version | 1.0 |
| Date | September 2026 |
| Status | Draft — Awaiting Approval |

---

## Table of Contents
1. Introduction
2. Overall Description
3. System Features and Functional Requirements
4. Non-Functional Requirements
5. External Interface Requirements
6. AI Agent Specifications
7. Data Requirements
8. Security Requirements
9. Constraints and Assumptions
10. Appendix

---

## 1. Introduction

### 1.1 Purpose
This SRS defines the complete functional and non-functional requirements for StudyAbroad.AI, a fully autonomous AI-powered study abroad intelligence platform. Intended for the development team, AI engineers, project managers, and stakeholders.

### 1.2 Scope
StudyAbroad.AI is a web and mobile application that automates the entire study abroad journey for international students from initial research through university application, visa processing, and post-arrival integration. The system employs 12 autonomous AI agents, a multi-source RAG pipeline, and a full-stack web + mobile application.

**The system WILL:**
- Autonomously scrape and maintain data from 600+ universities across 20+ countries
- Monitor 100+ scholarship sources in real time
- Generate personalized, voice-preserved application documents
- Guide students through visa applications with country-specific knowledge
- Provide career ROI analytics and post-graduation employment data
- Support students from research phase through post-arrival life abroad

**The system WILL NOT:**
- Guarantee admission to any university
- Submit applications on behalf of students without explicit consent
- Store or share personal student data without GDPR-compliant consent
- Provide legally binding immigration advice

### 1.3 Definitions and Abbreviations

| Term | Definition |
|---|---|
| SRS | Software Requirements Specification |
| RAG | Retrieval-Augmented Generation |
| LLM | Large Language Model |
| HITL | Human-in-the-Loop |
| SOP | Statement of Purpose |
| LOR | Letter of Recommendation |
| IELTS | International English Language Testing System |
| GRE | Graduate Record Examination |
| GMAT | Graduate Management Admission Test |
| PR | Permanent Residency |
| OPT | Optional Practical Training (USA) |
| PGWP | Post-Graduation Work Permit (Canada) |
| PSW | Post-Study Work (UK) |
| AES | Advanced Encryption Standard |
| GDPR | General Data Protection Regulation |
| JWT | JSON Web Token |
| SSR | Server-Side Rendering |
| SEO | Search Engine Optimization |
| CI/CD | Continuous Integration / Continuous Deployment |

---

## 2. Overall Description

### 2.1 Product Perspective
StudyAbroad.AI is a standalone SaaS platform integrating multiple external data sources and AI services:
- Next.js frontend (web)
- React Native mobile application (iOS + Android)
- FastAPI backend (REST APIs)
- Multi-agent AI layer (LangGraph + CrewAI)
- Multiple databases (PostgreSQL, ChromaDB/Pinecone, Redis, TimescaleDB)

### 2.2 Product Functions (High-Level)
- FR-1: User registration, authentication, profile management
- FR-2: Autonomous university data scraping and indexing
- FR-3: Autonomous scholarship hunting and monitoring
- FR-4: AI-powered university and program recommendation
- FR-5: Voice-preserved application document generation
- FR-6: Professor outreach email automation
- FR-7: Multi-channel deadline tracking and alerting
- FR-8: Country-specific visa guidance and simulation
- FR-9: Career ROI and employment outcome analytics
- FR-10: Scholarship scam detection and validation
- FR-11: Financial document preparation assistance
- FR-12: Post-arrival wellbeing and integration support
- FR-13: 24/7 AI counselor with persistent memory
- FR-14: Human-in-the-Loop trust escalation
- FR-15: Multi-language platform support (10 languages)

### 2.3 User Classes

**Primary: International Student (Prospective)**
- Age 18-35, applying for Masters/PhD/Bachelors programs abroad
- Moderate technical literacy; uses smartphones and web
- Pain points: research overload, document prep, scholarships, visa confusion

**Secondary: Parent/Sponsor**
- Read-only view of student's application progress

**Tertiary: Human Counselor (Expert)**
- Reviews AI-escalated complex queries

**Admin: Platform Administrator**
- Full system access, scraping monitoring, user management

### 2.4 Operating Environment
- Web: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile: iOS 14+, Android 10+
- Deployment: Vercel (frontend), Railway (backend + agents)
- Screen Sizes: 320px (mobile) to 4K (desktop)

### 2.5 Design Constraints
- Must operate within free/low-cost API tiers for MVP
- Web scraping must comply with robots.txt and rate limits
- LLM token consumption must be optimized
- Platform must be GDPR-compliant from day one

---

## 3. System Features and Functional Requirements

### 3.1 Authentication and Profile Module

#### 3.1.1 Registration and Auth
- REQ-AUTH-001: Users may register via email and password
- REQ-AUTH-002: One-click registration via Google OAuth 2.0
- REQ-AUTH-003: One-click registration via LinkedIn OAuth 2.0 with profile import
- REQ-AUTH-004: Email verification link sent upon registration
- REQ-AUTH-005: Password must be minimum 8 chars, 1 uppercase, 1 number, 1 special char
- REQ-AUTH-006: JWT session management with 7-day expiry
- REQ-AUTH-007: Refresh token support for seamless session renewal

#### 3.1.2 Student Profile Builder
- REQ-PROFILE-001: Multi-step profile wizard with progress indicator

Academic Section:
- REQ-PROFILE-002: Collect highest degree, institution, graduation year, GPA/grade
- REQ-PROFILE-003: Accept GPA in all formats: 4.0 scale, 10-point, percentage, CGPA, UK classification
- REQ-PROFILE-004: Auto-convert any GPA format to standardized 4.0 scale
- REQ-PROFILE-005: Allow transcript upload (PDF/JPG/PNG); AI auto-extracts GPA and grades via OCR + LLM
- REQ-PROFILE-006: Collect test scores: IELTS, TOEFL, GRE, GMAT, LSAT, MCAT, SAT, DELF, TestDaF
- REQ-PROFILE-007: Track planned retake dates for test improvements

Personal and Financial:
- REQ-PROFILE-008: Collect nationality, study level, field of study, preferred start date
- REQ-PROFILE-009: Collect annual budget range with currency selection
- REQ-PROFILE-010: Collect preferred countries (multi-select), intake preference, program duration preference
- REQ-PROFILE-011: Collect career goals (target job title/industry post-graduation)
- REQ-PROFILE-012: Import work and education experience from LinkedIn

Research Background (PhD):
- REQ-PROFILE-013: Allow research interests entry (free-text + keyword tags)
- REQ-PROFILE-014: Allow upload of published papers or research reports
- REQ-PROFILE-015: Research experience description field

Profile Intelligence:
- REQ-PROFILE-016: Calculate Profile Strength Score (0-100) based on completeness and competitiveness
- REQ-PROFILE-017: Identify profile gaps with specific improvement actions
- REQ-PROFILE-018: What-If Simulator: adjust a score, see which new universities unlock
- REQ-PROFILE-019: Peer benchmark: compare profile against historical admitted student data

---

### 3.2 University Discovery Module

- REQ-UNIV-001: Natural language search interface (e.g. 'affordable CS Masters in Europe under 12000 euros')
- REQ-UNIV-002: Parse natural language queries to extract: field, degree, country, budget, language of instruction
- REQ-UNIV-003: Ranked results with relevance explanations
- REQ-UNIV-004: Filter refinement: country, ranking, tuition, language, intake, acceptance rate, duration
- REQ-UNIV-005: Program-level data (specific Masters/PhD programs, not just university level)
- REQ-UNIV-006: Display per program: name, country, city, tuition, IELTS/GRE minimums, GPA min, deadline, acceptance rate, ranking, duration, intakes
- REQ-UNIV-007: Side-by-side comparison of up to 5 universities across all data fields
- REQ-UNIV-008: Cost of living per city (Numbeo integration)
- REQ-UNIV-009: Student review aggregates (Reddit, TheStudentRoom, GMAT Club)
- REQ-UNIV-010: Alumni employment outcomes per program
- REQ-UNIV-011: Safety and quality of life scores per city
- REQ-UNIV-012: Save universities to shortlist with notes and tags
- REQ-UNIV-013: Subject-specific rankings (CSRankings, Shanghai Subject)
- REQ-UNIV-014: Intake availability tracker (Fall/Spring/Summer/Rolling)

---

### 3.3 AI Recommendation Engine

- REQ-REC-001: Generate personalized recommendations on profile completion
- REQ-REC-002: Use RAG over vectorized university database for semantic profile matching
- REQ-REC-003: Categorize into Dream (under 30% probability), Target (30-65%), Safety (65%+)
- REQ-REC-004: Display match score (0-100%) with written explanation per university
- REQ-REC-005: Estimate admission probability based on profile vs. university averages
- REQ-REC-006: Full cost-of-attendance breakdown: tuition + living + visa + travel = total annual cost
- REQ-REC-007: Include career ROI as a weighted ranking factor
- REQ-REC-008: Suggest universities student may not have considered
- REQ-REC-009: Recommend optimal intake based on application readiness
- REQ-REC-010: Auto-update recommendations when student profile changes

---

### 3.4 Scholarship and Funding Hub

- REQ-SCHOL-001: Personalized scholarship list matched to profile, field, nationality, target countries
- REQ-SCHOL-002: Pre-check eligibility before displaying (filter ineligible scholarships)
- REQ-SCHOL-003: Display per scholarship: name, coverage, eligible nationalities, GPA requirements, deadline, competition level, official URL
- REQ-SCHOL-004: Prioritize hidden gem scholarships (less competitive, high relevance)
- REQ-SCHOL-005: Show scholarship success rate per profile type
- REQ-SCHOL-006: Funding gap calculator: total cost minus all matched scholarships
- REQ-SCHOL-007: Part-time work regulations per country (max hours, average wages)
- REQ-SCHOL-008: Student loan comparison by country (lenders, rates, moratoriums)
- REQ-SCHOL-009: Flag potentially fraudulent scholarships
- REQ-SCHOL-010: Scholarship negotiation guide and email templates
- REQ-SCHOL-011: Anonymized scholarship essay bank for reference
- REQ-SCHOL-012: Push/email alerts when new matching scholarships open
- REQ-SCHOL-013: TA/RA funded position finder within target programs

---

### 3.5 Document Preparation Suite

Voice Preservation System:
- REQ-DOC-001: 10-question story-prompt session to capture student writing style
- REQ-DOC-002: Extract vocabulary level, sentence structure, tone, narrative style from responses
- REQ-DOC-003: All generated documents reflect captured voice profile

Statement of Purpose:
- REQ-DOC-004: Unique SOP per university + program + professor combination
- REQ-DOC-005: Incorporates: why this university, why this program, academic background, career goals
- REQ-DOC-006: Enforces word limits per university requirements (500-1000 words typically)
- REQ-DOC-007: Quality score on 5 dimensions: Clarity, Specificity, Motivation, University Fit, Uniqueness (0-10 each)
- REQ-DOC-008: Actionable improvement suggestions per dimension
- REQ-DOC-009: One-click re-tailoring from one university to another in under 60 seconds

Other Documents:
- REQ-DOC-010: Personal Statement (UK/European style)
- REQ-DOC-011: Research Proposal (PhD): title, background, questions, methodology, timeline
- REQ-DOC-012: LOR draft templates for professors/employers
- REQ-DOC-013: LOR request email generator
- REQ-DOC-014: Academic CV builder (academic format, not corporate ATS)
- REQ-DOC-015: Diversity and Inclusion Statement (US universities)
- REQ-DOC-016: Scholarship-specific essays per scholarship prompt
- REQ-DOC-017: Waitlist Appeal Letter generator
- REQ-DOC-018: Deferral Request Letter generator

Quality Assurance:
- REQ-DOC-019: Plagiarism check with similarity score on all documents
- REQ-DOC-020: AI-detection score check (target below 40% AI probability)
- REQ-DOC-021: Grammar and clarity API check

Document Vault:
- REQ-DOC-022: Central vault for all student documents (upload, store, organize)
- REQ-DOC-023: Supported formats: PDF, DOCX, JPG, PNG (max 50MB per file)
- REQ-DOC-024: Version history for last 10 versions per document
- REQ-DOC-025: Share document via secure link with mentor, parent, counselor
- REQ-DOC-026: All vault documents encrypted with AES-256 at rest

---

### 3.6 Application Tracking Module

- REQ-APP-001: Kanban tracker with stages: Research, Drafting, Submitted, Under Review, Interview, Waitlisted, Offered, Accepted, Rejected
- REQ-APP-002: Each university card shows: stage, next deadline, match score, document completion status
- REQ-APP-003: University-specific document checklist (what to submit, format, portal links)
- REQ-APP-004: Application fee tracker and total spend calculator
- REQ-APP-005: Offer Letter Analyzer: AI extracts and explains conditions, scholarships, enrollment deadlines
- REQ-APP-006: Multi-Offer Comparison: financial breakdown of 2+ offers side by side
- REQ-APP-007: Admission Interview Prep: mock interview with AI feedback per question
- REQ-APP-008: Auto-generated application timeline working backwards from each deadline
- REQ-APP-009: Application success probability per university based on profile + documents

---

### 3.7 Deadline Watcher Module

- REQ-DL-001: Track all deadlines: application, scholarship, financial aid, housing, visa, post-admission immigration
- REQ-DL-002: Alerts via: in-app notification, email, WhatsApp (optional), Telegram (optional)
- REQ-DL-003: Google Calendar and Outlook Calendar sync
- REQ-DL-004: Weekly Monday task list: top 5 priority tasks this week
- REQ-DL-005: Smart priority ordering by urgency and impact
- REQ-DL-006: Reminder schedule: 30 days, 14 days, 7 days, 3 days, 1 day, day-of alerts
- REQ-DL-007: Custom reminder frequency settings
- REQ-DL-008: Countdown timers displayed on dashboard for all active deadlines

---

### 3.8 Visa and Immigration Module

- REQ-VISA-001: Country-specific visa roadmaps for: USA F-1, UK Student Visa, Germany Studienvisum, Canada Study Permit, Australia Visa 500, Netherlands MVV, and 10+ others
- REQ-VISA-002: Personalized document checklist per visa type and home country combination
- REQ-VISA-003: Bank balance calculator using official country formula and current thresholds
- REQ-VISA-004: Financial sponsorship letter templates
- REQ-VISA-005: Embassy appointment booking guidance and processing time estimates
- REQ-VISA-006: Visa Interview Mock Coach: AI plays visa officer, evaluates answers, gives feedback
- REQ-VISA-007: Visa Rejection Recovery: identify likely rejection reason, create appeal or reapplication plan
- REQ-VISA-008: Post-study immigration guides: OPT/H-1B, PSW, PGWP, EU Blue Card, PR pathways
- REQ-VISA-009: Immigration policy change alerts for target countries

---

### 3.9 Career ROI Module

- REQ-ROI-001: Employment outcomes per program: median salary 1/3/5yr, top employers, placement rate, internship availability
- REQ-ROI-002: ROI score: salary boost / tuition cost = years to break even
- REQ-ROI-003: Country job market health score per field
- REQ-ROI-004: Best country for your field comparison tool
- REQ-ROI-005: Career ROI as weighted factor in university recommendations
- REQ-ROI-006: Job board filtered by visa work eligibility

---

### 3.10 AI Counselor Module

- REQ-CHAT-001: Persistent chat interface accessible from any page
- REQ-CHAT-002: Full access to student's profile, shortlist, documents, and application history as context
- REQ-CHAT-003: Answers questions about universities, scholarships, visas, documents, careers, finances
- REQ-CHAT-004: Persistent conversation memory across sessions
- REQ-CHAT-005: Responds in student's preferred language (10 languages)
- REQ-CHAT-006: Displays confidence level and cites sources for factual claims
- REQ-CHAT-007: Flags low-confidence answers and offers human expert escalation
- REQ-CHAT-008: Human expert response delivered within 24 hours for escalated queries

---

### 3.11 Financial Documentation Module

- REQ-FIN-001: Bank balance calculation per student's visa type, home country, target country
- REQ-FIN-002: Bank Statement Preparation Guide customized per home country banking system
- REQ-FIN-003: Financial sponsorship declaration letter templates
- REQ-FIN-004: Funding gap calculator: total cost minus scholarships and savings
- REQ-FIN-005: Education loan comparison: lenders, interest rates, moratoriums, repayment
- REQ-FIN-006: Currency exchange planning guidance

---

### 3.12 Post-Arrival Life Abroad Module

- REQ-LIFE-001: Pre-Departure Checklist customized per destination country
- REQ-LIFE-002: First 30/60/90 Day Plan for each country
- REQ-LIFE-003: Cultural Adaptation Guide per destination country
- REQ-LIFE-004: Banking Setup Guide per country
- REQ-LIFE-005: Verified student housing integration (scam detection applied)
- REQ-LIFE-006: Community connector: same home country + same university students
- REQ-LIFE-007: Connect students in same program and intake year
- REQ-LIFE-008: Mental health and counseling resources per university
- REQ-LIFE-009: Anonymous weekly wellbeing check-in with stress detection
- REQ-LIFE-010: Part-time job board filtered by visa work hour allowances
- REQ-LIFE-011: Post-graduation immigration filing deadline tracker (OPT, PGWP, PSW)

---

### 3.13 Professor Outreach Module

- REQ-PROF-001: Professor database: name, department, research interests, recent publications, grants, lab openings, email, profile URL
- REQ-PROF-002: Semantic matching: student research background vs professor research
- REQ-PROF-003: Rank professors by research alignment score and funding probability
- REQ-PROF-004: Personalized cold outreach email referencing specific professor paper or grant
- REQ-PROF-005: 3-email follow-up sequence if no reply after 7 and 14 days
- REQ-PROF-006: Track email status: drafted / sent / replied / interview scheduled
- REQ-PROF-007: Research statement tailored to each professor's lab

---

### 3.14 Scam Detection Module

- REQ-SCAM-001: Validate all scholarship URLs against whitelist of official scholarship domains
- REQ-SCAM-002: Flag scholarships requiring application fees, banking details, or with no verifiable sponsor
- REQ-SCAM-003: University accreditation verification against Ministry of Education lists
- REQ-SCAM-004: Verify This feature: student pastes any URL or email; system outputs legitimacy score
- REQ-SCAM-005: Community-reported scam database with warnings

---

## 4. Non-Functional Requirements

### 4.1 Performance
- REQ-PERF-001: Web app initial page load under 2 seconds on 10 Mbps
- REQ-PERF-002: University search results under 3 seconds
- REQ-PERF-003: Recommendation list generated within 10 seconds of profile submission
- REQ-PERF-004: SOP first draft generated within 30 seconds
- REQ-PERF-005: Support 10,000 concurrent users without degradation
- REQ-PERF-006: API uptime 99.5% monthly
- REQ-PERF-007: Weekly scrape cycle completed within 6 hours
- REQ-PERF-008: Push notifications delivered within 60 seconds

### 4.2 Scalability
- REQ-SCALE-001: Database supports up to 1 million student profiles
- REQ-SCALE-002: Vector database supports up to 5 million embedded chunks
- REQ-SCALE-003: Horizontal scaling for FastAPI backend
- REQ-SCALE-004: Parallelized scraping pipeline (1000+ concurrent workers)

### 4.3 Reliability
- REQ-REL-001: Automatic retry with exponential backoff (maximum 3 retries) for failed agent tasks
- REQ-REL-002: Graceful degradation: show cached results if AI service unavailable
- REQ-REL-003: Database backups every 24 hours with 30-day retention
- REQ-REL-004: Recovery Time Objective (RTO): restore from backup within 4 hours
- REQ-REL-005: Recovery Point Objective (RPO): maximum 24 hours data loss

### 4.4 Usability
- REQ-UX-001: New user completes profile setup within 10 minutes
- REQ-UX-002: Primary actions reachable within 3 clicks from dashboard
- REQ-UX-003: Fully responsive from 320px to 4K resolution
- REQ-UX-004: WCAG 2.1 Level AA accessibility compliance
- REQ-UX-005: Error messages in plain language (no technical jargon)
- REQ-UX-006: Supports 10 languages: English, Arabic, Chinese Simplified, Hindi, Bengali, French, German, Spanish, Turkish, Urdu
- REQ-UX-007: Interactive tooltips and walkthrough for first-time users

### 4.5 Maintainability
- REQ-MAINT-001: All AI agent actions logged in Langfuse
- REQ-MAINT-002: Minimum 70% unit test coverage
- REQ-MAINT-003: Scraper configurations externalized to config files (not hardcoded)
- REQ-MAINT-004: Structured JSON logs for all API calls and errors
- REQ-MAINT-005: Automated deployment via GitHub Actions CI/CD
- REQ-MAINT-006: Sentry dashboard for real-time error tracking and alerting

### 4.6 Compliance
- REQ-COMP-001: GDPR (EU Regulation 2016/679) compliant
- REQ-COMP-002: Data deletion: student data deleted within 72 hours of request
- REQ-COMP-003: Data export: student data exported as JSON within 24 hours
- REQ-COMP-004: Cookie consent banner on first visit with consent logging
- REQ-COMP-005: Privacy policy accessible from all pages
- REQ-COMP-006: No student data used for AI training without explicit opt-in consent

---

## 5. External Interface Requirements

### 5.1 UI Requirements
- Web app: Next.js 14 App Router
- UI components: shadcn/ui + Tailwind CSS
- Animations: Framer Motion
- Color scheme: dark mode default, light mode available
- Typography: Inter font (Google Fonts)
- Real-time: Socket.io WebSocket

### 5.2 External APIs and Services

| Service | Purpose |
|---|---|
| Google Gemini 1.5 Pro | Primary LLM for agent reasoning |
| Google Gemini Flash | Fast lightweight tasks |
| Google text-embedding-004 | Vector embedding generation |
| Groq | Fallback LLM |
| Crawl4AI | AI-native web scraping |
| Playwright | Dynamic JS page scraping |
| Pinecone | Production vector database |
| ChromaDB | Development vector database |
| Twilio WhatsApp API | Deadline notifications via WhatsApp |
| Resend | Transactional email delivery |
| Cloudinary | Document storage and CDN |
| Numbeo | Cost of living data |
| Google Calendar API | Deadline calendar sync |
| LinkedIn OAuth 2.0 | Profile data import |
| Google OAuth 2.0 | User authentication |
| Langfuse | AI agent observability |
| LangSmith | LLM evaluation and testing |
| Sentry | Error tracking |
| PostHog | Product analytics |

### 5.3 Communication Requirements
- All transit data encrypted via TLS 1.3 (HTTPS enforced)
- RESTful API design (FastAPI backend)
- WebSocket protocol via Socket.io for real-time features
- Message queues via Redis + Celery for internal agent communication
- JSON format for all API responses with consistent error structure

---

## 6. AI Agent Specifications

### 6.1 Framework
- Complex stateful workflows: LangGraph (state machine, cyclic loops, HITL checkpoints)
- Sequential pipelines: CrewAI (role-based assembly line agents)
- Hybrid: LangGraph orchestrates top-level; delegates pipeline tasks to CrewAI crews

### 6.2 Agent Execution Standards
- REQ-AGENT-001: All executions logged: agent name, input, output, tokens, execution time, cost, errors
- REQ-AGENT-002: Retry logic: maximum 3 retries with exponential backoff
- REQ-AGENT-003: Critical decisions pass through HITL trust layer before delivery
- REQ-AGENT-004: Confidence scores computed and displayed with all advice
- REQ-AGENT-005: Sources cited for all factual claims (URL, timestamp)

### 6.3 LLM Configuration Per Agent

| Agent | Model | Temperature | Framework |
|---|---|---|---|
| UniversityScraperAgent | Gemini Flash | 0.1 | CrewAI |
| ScholarshipHunterAgent | Gemini Flash | 0.1 | CrewAI |
| RecommenderAgent | Gemini 1.5 Pro | 0.3 | LangGraph |
| DocumentCraftingAgent | Gemini 1.5 Pro | 0.7 | LangGraph |
| ProfessorOutreachAgent | Gemini 1.5 Pro | 0.6 | CrewAI |
| DeadlineWatcherAgent | Gemini Flash | 0.1 | LangGraph |
| VisaGuideAgent | Gemini 1.5 Pro | 0.2 | LangGraph |
| CounselorAgent | Gemini 1.5 Pro | 0.5 | LangGraph |
| CareerROIAgent | Gemini 1.5 Pro | 0.2 | CrewAI |
| ScamDetectorAgent | Gemini Flash | 0.0 | Rule-based + LLM |
| FinancialDocAgent | Gemini 1.5 Pro | 0.2 | LangGraph |
| WellbeingCompanionAgent | Gemini 1.5 Pro | 0.6 | LangGraph |

### 6.4 Scraping Schedule

| Agent | Frequency | Trigger |
|---|---|---|
| UniversityScraperAgent | Weekly (Sunday 2:00 AM UTC) | Cron + manual |
| ScholarshipHunterAgent | Daily (12:00 AM UTC) | Cron + manual |
| ProfessorOutreachAgent | On-demand | User action |
| CareerROIAgent | Monthly (1st of month) | Cron |
| ScamDetectorAgent | Real-time per new scholarship | Event trigger |

---

## 7. Data Requirements

### 7.1 Core Database Entities (PostgreSQL)

**Users:** user_id (UUID PK), email, password_hash, name, created_at, subscription_tier, preferred_language, oauth_provider

**StudentProfiles:** profile_id, user_id (FK), degree_level, field_of_study, gpa_raw, gpa_scale, gpa_converted_40, ielts_score, toefl_score, gre_score, nationality, home_country, budget_min, budget_max, preferred_countries (JSON), career_goals, research_interests, profile_strength_score

**Universities:** university_id, name, country, city, qs_ranking, the_ranking, website, accreditation_status, last_scraped_at

**Programs:** program_id, university_id (FK), name, degree_level, field, language_of_instruction, tuition_international, duration_months, gpa_minimum, ielts_minimum, gre_minimum, acceptance_rate, application_deadline_fall, application_deadline_spring, intake_available (JSON), last_scraped_at

**Scholarships:** scholarship_id, name, funding_body, coverage_type, eligible_nationalities (JSON), eligible_fields (JSON), gpa_requirement, deadline, award_amount, official_url, is_verified, is_scam_flagged, last_scraped_at

**Applications:** application_id, user_id (FK), university_id (FK), program_id (FK), status (enum), applied_at, decision_at, offer_letter_url

**Documents:** document_id, user_id (FK), document_type (enum), title, content (encrypted), university_id (FK nullable), version, plagiarism_score, ai_detection_score, quality_score, created_at

**Deadlines:** deadline_id, user_id (FK), entity_type, entity_id, deadline_date, reminder_channels (JSON), is_completed

**Professors:** professor_id, university_id (FK), name, department, research_interests (JSON), recent_publications (JSON), has_open_position, email, last_scraped_at

**OutreachEmails:** email_id, user_id (FK), professor_id (FK), subject, body (encrypted), status (enum), sent_at, replied_at, follow_up_count

**Conversations:** conversation_id, user_id (FK), agent_name, messages (JSON encrypted), created_at, updated_at

### 7.2 Vector Database (ChromaDB / Pinecone)

**university_programs collection:** program_id as id, embedding of program description + requirements, metadata: university_name, country, field, tuition, gpa_min, intake

**scholarships collection:** scholarship_id as id, embedding of description + eligibility, metadata: name, deadline, coverage, eligible_countries

**professor_profiles collection:** professor_id as id, embedding of research interests + publication abstracts, metadata: university, department, email

**visa_guides collection:** guide_id as id, embedding of visa requirements, metadata: country, visa_type, last_updated

**career_outcomes collection:** program_id as id, embedding of career outcomes text, metadata: median_salary, placement_rate, top_employers

---

## 8. Security Requirements

- REQ-SEC-001: All data in transit encrypted via TLS 1.3 (HTTPS enforced)
- REQ-SEC-002: All documents encrypted at rest using AES-256
- REQ-SEC-003: Database backups encrypted using AES-256
- REQ-SEC-004: Passwords hashed using bcrypt (minimum cost factor 12)
- REQ-SEC-005: JWT tokens expire after 7 days; refresh tokens after 30 days
- REQ-SEC-006: Rate limiting: maximum 100 API requests per minute per user
- REQ-SEC-007: LLM API rate limiting: maximum 20 document generations per day on free tier
- REQ-SEC-008: OWASP Top 10 mitigations: SQL injection prevention, XSS prevention, CSRF protection
- REQ-SEC-009: Admin endpoints require multi-factor authentication
- REQ-SEC-010: Log all authentication events (login, logout, failed attempts) with IP and timestamp
- REQ-SEC-011: After 5 failed login attempts: account locked for 30 minutes
- REQ-SEC-012: Documents accessible only by owner, explicitly invited collaborators, and admins (with audit log)
- REQ-SEC-013: Scraping respects robots.txt; minimum 2-second delay between requests per domain
- REQ-SEC-014: All API keys stored in environment variables only

---

## 9. Constraints and Assumptions

### 9.1 Constraints
- CON-001: MVP built on free-tier APIs to minimize cost
- CON-002: Web scraping must comply with each website's terms of service
- CON-003: System cannot guarantee admission outcomes; all predictions are probabilistic
- CON-004: Visa guidance is informational only, not legal immigration advice
- CON-005: LLM context window limits require chunking strategy for large university data queries

### 9.2 Assumptions
- ASS-001: Target university websites remain publicly accessible for scraping
- ASS-002: Google Gemini API free tier available with sufficient quota for MVP
- ASS-003: Students have internet connectivity and a modern browser or mobile device
- ASS-004: Platform operates in English for MVP; multilingual added in Phase 7
- ASS-005: Initial data seed (200 universities, 500 scholarships) is sufficient for MVP launch
- ASS-006: Human expert counselors sourced within 3 months post-launch for HITL escalation

---

## 10. Appendix

### Appendix A: Supported Countries (Scraping Scope)
USA, UK, Canada, Germany, Australia, Netherlands, Sweden, France, Switzerland, New Zealand, Ireland, Japan, South Korea, Singapore, UAE, Finland, Denmark, Italy, Spain, Belgium

### Appendix B: Supported Languages
English, Arabic, Chinese Simplified, Hindi, Bengali, French, German, Spanish, Turkish, Urdu

### Appendix C: Test Score Ranges

| Test | Score Range |
|---|---|
| IELTS | 0.0 - 9.0 |
| TOEFL iBT | 0 - 120 |
| GRE | 260 - 340 |
| GMAT | 200 - 800 |
| LSAT | 120 - 180 |
| MCAT | 472 - 528 |
| SAT | 400 - 1600 |

### Appendix D: GPA Conversion

| Scale | Excellent | Good | Satisfactory | Pass |
|---|---|---|---|---|
| 4.0 Scale | 3.7-4.0 | 3.0-3.6 | 2.5-2.9 | 2.0-2.4 |
| 10-Point | 9.0-10.0 | 7.5-8.9 | 6.5-7.4 | 5.0-6.4 |
| Percentage | 90-100% | 75-89% | 65-74% | 50-64% |
| UK Class | First | 2:1 | 2:2 | Third |

---
End of Software Requirements Specification
Document: StudyAbroad.AI SRS v1.0 | Date: September 2026
