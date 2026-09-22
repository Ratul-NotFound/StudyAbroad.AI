# 🌍 StudyAbroad.AI — Project Plan Document
### Fully Autonomous Study Abroad Intelligence Platform
**Version:** 1.0 | **Date:** September 2026 | **Status:** Planning

---

## Table of Contents
1. Vision & Problem Statement
2. Market Analysis
3. The 12 Autonomous AI Agents
4. Complete Feature Map (50+ Features)
5. Technical Architecture
6. Tech Stack
7. 8-Phase Build Roadmap
8. Competitor Comparison
9. Portfolio Value
10. Business Model

---

## 1. Vision & Problem Statement

### The Big Idea
A **single autonomous platform** that replaces: study abroad agencies (-), manual research (weeks of work), document consultants (/SOP), and scholarship hunting (months of confusion).

From 'I think I want to study abroad' to 'I have graduated, found a job, and got my PR' — every single step, fully guided and automated by AI.

### Problems We Solve

| Problem Today | Our AI Solution |
|---|---|
| Students pay  to agents | Free AI that does 10x better |
| Outdated PDF guides | Real-time scraped, always fresh data |
| Takes 6 months of research | 10-minute AI profile gives instant plan |
| Miss deadlines and scholarships | Autonomous agents monitor 24/7 |
| Bad SOP gets rejected | AI writes and scores your SOP in your own voice |
| No idea which professor to contact | AI finds and drafts the email |
| Visa rejection due to wrong docs | AI guides step by step |
| Scholarship scams | AI validates every scholarship |
| No post-arrival support | Platform follows you until PR |
| No career outcome data | AI shows ROI of every university choice |

### What We Replace

| Service Replaced | Their Cost | Our Advantage |
|---|---|---|
| Study Abroad Agency | -,000 | Free + 24/7 + no bias |
| SOP Consultant | - | Instant + personalized per university |
| Scholarship Advisor | + | Real-time scraped + niche matching |
| Visa Consultant | - | Country-specific + always updated |
| Career Counselor | /session | Data-driven ROI + salary projections |

---

## 2. Market Analysis

### Market Size
- 6+ million students study abroad annually
-  industry dominated by expensive human consultants
- 1.5B non-native English speakers need guidance
- Study abroad numbers growing 8% year-over-year

### Competitor Gaps
| Competitor | What They Do | What They Miss |
|---|---|---|
| Leverage Edu | Human-led + AI tools | Expensive, biased toward partner universities |
| Yocket | Community + university search | No document generation, no agents |
| AbroBot | AI university matching | Very limited, no full pipeline |
| All competitors | Pre-application only | Nobody covers post-arrival life |

---

## 3. The 12 Autonomous AI Agents

### Agent 1 — UniversityScraperAgent
Autonomously crawls and maintains live university data globally
- 600+ universities, 8,000+ specific programs
- Countries: USA, UK, Canada, Germany, Australia, Netherlands, Sweden, France, Switzerland, New Zealand, Ireland, Japan, South Korea, Singapore, UAE, Finland, Denmark, Italy, Spain
- Data: programs, tuition, admission requirements, deadlines, acceptance rates, scholarships, intake schedules
- Re-scrapes weekly with change detection

### Agent 2 — ScholarshipHunterAgent
Monitors 100+ scholarship sources globally, 24/7
- Chevening, Fulbright, DAAD, Erasmus+, Commonwealth, MEXT, KAIST, CSC, Australia Awards, Vanier, Swedish Institute
- Elite: Gates Cambridge, Rhodes, Marshall, Knight-Hennessy
- University-specific: TA/RA positions, tuition waivers, fellowships
- Hidden gem discovery: less competitive, highly relevant scholarships

### Agent 3 — RecommenderAgent (Core Brain)
Builds personalized university strategy using RAG + semantic search
- Dream / Target / Safety school categorization
- Match score (0-100%) with detailed reasoning
- Admission probability estimate
- Total cost-of-attendance breakdown
- 5-university comparison matrix

### Agent 4 — DocumentCraftingAgent (Voice-Preserved)
Writes ALL application documents in the student's own voice
- SOP (per university + program + professor)
- Personal Statement, Research Proposal, LOR drafts
- Academic CV, Diversity Statement, Scholarship Essays
- Voice Preservation: AI learns student's writing style via 10-question session
- Quality checks: plagiarism, AI-detection score, clarity, fit score

### Agent 5 — ProfessorOutreachAgent
Finds funded PhD supervisors and drafts hyper-personalized outreach
- Scrapes professor research interests, publications, active grants
- Semantic matching: student research background vs professor work
- Generates personalized cold emails and follow-up sequences
- Tracks: sent / opened / replied / interview scheduled

### Agent 6 — DeadlineWatcherAgent
Ensures zero missed deadlines across the entire journey
- Tracks: application, scholarship, visa, housing, post-admission immigration deadlines
- Alerts via: in-app, email, WhatsApp, Telegram, Google Calendar sync
- Weekly auto-generated task list
- Smart priority: urgent + high-impact tasks first

### Agent 7 — VisaGuideAgent
Complete visa journey from country decision to passport stamp
- Country-specific roadmaps: F-1 USA, Student Visa UK, German Study Visa, Canadian Study Permit, Australian Visa 500
- Bank statement calculator (exact formula per country)
- Visa interview mock: AI plays visa officer
- Visa rejection recovery: analysis + appeal plan
- Post-study PR pathway guide per country

### Agent 8 — StudyAbroadCounselorAgent
24/7 AI counselor with full memory of student journey
- Full context-aware answers using complete student profile
- Remembers every conversation and preference
- Escalation to verified human experts for edge cases
- Multilingual: responds in student's native language

### Agent 9 — CareerROIAgent (Key Differentiator)
Data-driven career and financial outcome analysis
- Median salary 1yr/3yr/5yr post-graduation per program
- Top employers hiring from each university
- ROI calculator: tuition cost / salary boost = years to break even
- Immigration pathways: which degrees in which country open best PR routes
- Best country for your field comparison tool

### Agent 10 — ScamDetectorAgent
Protects students from scholarship scams and unaccredited institutions
- Validates every scholarship against official databases
- Flags: unofficial domains, payment requests, unrealistic awards
- University accreditation verification
- Community-reported scam database

### Agent 11 — FinancialDocAgent
Full financial documentation support for visa and application requirements
- Exact bank balance calculation per country per visa type
- Bank Statement Preparation Guide for home country banking systems
- Handles banking restriction contexts (Bangladesh, Pakistan, Nigeria, etc.)
- Education loan comparison tool

### Agent 12 — WellbeingCompanionAgent
Mental health support and social integration
- Culture shock preparation guide per country
- First 30/60/90 day plan post-arrival
- Anonymous mental health check-in system
- Connect with students from same home country at target university

---

## 4. Complete Feature Map (50+ Features)

### Discovery and Research
- Natural language university search
- Program-level granular data
- Subject-specific rankings (CSRankings, Shanghai Subject)
- Side-by-side comparison (up to 5 universities)
- Cost of living calculator per city (Numbeo)
- Student review aggregator (Reddit, TheStudentRoom, GMAT Club)
- Alumni employment outcomes per program
- Safety index per country/city

### Profile and Eligibility
- Comprehensive profile wizard (academic, financial, personal, research)
- GPA converter: 4.0 scale, percentage, CGPA, UK classification
- Transcript upload: AI auto-extracts GPA and grades
- LinkedIn import: auto-fills work and research experience
- Test score tracker: IELTS, TOEFL, GRE, GMAT, LSAT, MCAT
- AI eligibility checker with instant reasoning
- Profile strength score (0-100) + improvement roadmap
- What-if simulator: score improvement vs. new university options
- Peer benchmark against admitted students at target universities

### Document Preparation
- Voice preservation system (10-question style profiler)
- SOP generator (university + program + professor specific)
- SOP quality scorer (Clarity, Motivation, Fit — rated 0-10 each)
- Personal statement, Research proposal, LOR drafts
- Academic CV builder, Scholarship essay writer
- Plagiarism + AI-detection score checker
- Document vault with version history and collaboration
- One-click re-tailoring from one university to another

### Application Management
- Kanban board tracker (Research to Decision)
- University-specific checklists
- Application fee tracker and budget calculator
- Offer letter AI analyzer
- Multi-offer financial comparison
- Admission interview prep with AI mock

### Scholarships and Funding
- Personalized scholarship matching engine
- Hidden gem scholarship discovery
- Funding gap calculator
- TA/RA opportunity finder
- Student loan comparison by country
- Scholarship essay bank (anonymized winning examples)
- Scholarship scam detector

### Visa and Immigration
- Visa roadmap generator per country
- Bank statement requirement calculator
- Visa interview mock coach
- Visa rejection recovery plan
- Post-study PR pathway guide
- Immigration policy change alerts

### Pre-Departure and Arrival
- Pre-departure checklist per country
- Health insurance guide
- Banking setup guide per country
- Verified housing finder (scam-free)
- First 30/60/90 day plan generator
- Cultural adaptation guide

### Life Abroad (Post-Arrival)
- Student community connector
- Part-time job board (within visa work hour limits)
- Mental health check-in system
- Post-graduation job board
- OPT/PGWP/PSW application timeline tracker
- Alumni network access

### Analytics and Intelligence
- Application success predictor
- Admission trend charts (5 years)
- Salary benchmarks post-graduation
- ROI comparison across shortlisted universities
- Immigration path probability scores

---

## 5. Technical Architecture

FRONTEND LAYER
- Web App: Next.js 14 (App Router, SSR, SEO)
- Mobile: React Native + Expo (iOS + Android)
- UI: Tailwind CSS + shadcn/ui + Framer Motion
- Real-time: Socket.io
- Multilingual: i18next (10 languages)

API GATEWAY LAYER (FastAPI)
- Auth Service: NextAuth.js + Google + LinkedIn OAuth + JWT
- Profile Service: CRUD, import, scoring
- Search and Recommendation Service: RAG endpoint
- Document Service: generation, scoring, vault
- Agent Orchestration: LangGraph + CrewAI hybrid
- Notification Service: multi-channel dispatch
- Analytics Service: dashboards, reports

AI AGENT LAYER
- UniversityScraperAgent [CrewAI pipeline]
- ScholarshipHunterAgent [CrewAI pipeline]
- RecommenderAgent [LangGraph state machine]
- DocumentCraftingAgent [LangGraph + voice model]
- ProfessorOutreachAgent [CrewAI pipeline]
- DeadlineWatcherAgent [Cron + LangGraph]
- VisaGuideAgent [LangGraph state machine]
- CounselorAgent [LangGraph + memory]
- CareerROIAgent [CrewAI + data scraping]
- ScamDetectorAgent [Rule-based + LLM validation]
- FinancialDocAgent [LangGraph + templates]
- WellbeingCompanionAgent [LangGraph + sentiment analysis]

TRUST LAYER
- Human-in-the-Loop (HITL): expert review for flagged advice
- Verified Expert Network: human counselors on standby
- Confidence Scoring: AI shows uncertainty + sources
- Audit Logs: every agent action logged for transparency

DATA LAYER
- PostgreSQL + Prisma: users, profiles, applications
- ChromaDB to Pinecone: university and scholarship vectors
- Redis + Celery: job queues, caching
- S3 / Cloudinary: encrypted document storage
- APScheduler: weekly scraping cron jobs
- TimescaleDB: time-series for trend analytics

OBSERVABILITY AND SECURITY LAYER
- Langfuse: AI agent tracing, token usage, cost monitoring
- LangSmith: LLM evaluation and regression testing
- Sentry: error tracking and performance monitoring
- AES-256 encryption: all uploaded documents
- GDPR compliance: data deletion, export, consent flows

---

## 6. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Web Frontend | Next.js 14 (App Router) | SEO + SSR + Full-stack React |
| Mobile | React Native + Expo | iOS + Android from one codebase |
| UI Components | Tailwind CSS + shadcn/ui | Fast, beautiful, accessible |
| Animations | Framer Motion | Premium micro-interactions |
| Backend API | FastAPI (Python) | Async, fast, ideal for AI workloads |
| Agent Framework | LangGraph + CrewAI (hybrid) | LangGraph for stateful; CrewAI for pipelines |
| LLM | Gemini 1.5 Pro + Flash / Groq | Free tier, powerful, multimodal |
| Embeddings | Google text-embedding-004 | Best free embeddings available |
| Vector DB | ChromaDB (dev) to Pinecone (prod) | Scalable semantic search |
| Web Scraping | Crawl4AI + Playwright + BeautifulSoup | AI-native, handles dynamic JS pages |
| Relational DB | PostgreSQL + Prisma ORM | Production-grade, type-safe |
| Cache/Queue | Redis + Celery | Background agent jobs, rate limiting |
| Auth | NextAuth.js + Google + LinkedIn OAuth | Easy login + profile import |
| Document Storage | Cloudinary + AES-256 | Secure, scalable file vault |
| Email Alerts | Resend (3000/mo free) | Transactional emails |
| WhatsApp Alerts | Twilio WhatsApp API | Deadline alerts on mobile |
| Real-time | Socket.io | Live notifications and chat |
| Multilingual | i18next | 10-language platform support |
| Deployment | Vercel (web) + Railway (API + agents) | Free tiers, fast deploy |
| AI Monitoring | Langfuse + LangSmith | Full agent tracing and evaluation |
| Error Tracking | Sentry | Production stability |
| User Analytics | PostHog (free) | User behavior and funnels |

---

## 7. 8-Phase Build Roadmap

### Phase 1 — Foundation (Week 1)
- Monorepo setup (Next.js + FastAPI)
- PostgreSQL schema design
- Auth system: Google + LinkedIn OAuth + JWT
- Student profile wizard UI
- Basic navigation shell
- CI/CD pipeline

### Phase 2 — Data Engine (Week 2)
- UniversityScraperAgent build
- ScholarshipHunterAgent build
- ChromaDB vector store setup
- Embedding pipeline: chunk to embed to store
- Seed 200 universities + 500 scholarships across 15 countries
- Admin dashboard for scraping jobs

### Phase 3 — Core AI (Week 3)
- RAG pipeline (semantic search)
- RecommenderAgent
- CareerROIAgent
- University Explorer UI
- Scholarship Hub UI

### Phase 4 — Document Suite (Week 4)
- Voice Preservation System (10-question profiler)
- DocumentCraftingAgent (SOP, LOR, CV, Essays)
- Document editor with inline AI suggestions
- SOP quality scorer
- Plagiarism + AI-detection checker
- Document Vault

### Phase 5 — Agent Automation (Week 5)
- ProfessorOutreachAgent
- DeadlineWatcherAgent (email, WhatsApp, calendar)
- VisaGuideAgent
- FinancialDocAgent
- ScamDetectorAgent
- Application Tracker (Kanban)

### Phase 6 — Intelligence Layer (Week 6)
- CounselorAgent (24/7 chat with memory)
- WellbeingCompanionAgent
- Human-in-the-Loop trust layer
- What-if simulator
- Analytics dashboard

### Phase 7 — Mobile and Multilingual (Week 7)
- React Native mobile app
- Push notifications
- i18next (10 languages)
- Real-time notifications via Socket.io
- Post-arrival Life Abroad module

### Phase 8 — Security, Polish and Launch (Week 8)
- AES-256 document encryption
- GDPR compliance
- Langfuse + Sentry monitoring
- SEO optimization
- Landing page and onboarding flow
- Production deployment
- Beta tester recruitment (100 students)

---

## 8. Competitor Comparison

| Feature | Leverage Edu | Yocket | AbroBot | StudyAbroad.AI |
|---|---|---|---|---|
| 12 Autonomous AI Agents | No | No | No | YES |
| Voice-Preserved Documents | No | No | Partial | YES |
| Career ROI and Salary Data | No | Partial | No | YES |
| Scholarship Scam Detection | No | No | No | YES |
| Visa Rejection Recovery | No | No | No | YES |
| Post-Arrival Life Support | No | No | No | YES |
| Professor Outreach Agent | No | No | No | YES |
| Financial Document Guidance | Partial | No | No | YES |
| Mobile App | Yes | Yes | No | YES |
| Free Core Features | No | Partial | Partial | YES |
| Multilingual 10 languages | No | No | No | YES |
| Human-in-the-Loop Trust Layer | Yes (expensive) | No | No | YES (free) |

---

## 9. Portfolio Value

| AI/ML Skill | Level Shown |
|---|---|
| Multi-Agent AI (LangGraph + CrewAI) | Expert |
| RAG Pipeline with Reranking | Expert |
| Autonomous Web Scraping | Advanced |
| Vector Database Design | Expert |
| LLM Prompt Engineering | Expert |
| Full-Stack (Next.js + FastAPI) | Advanced |
| Mobile Development (React Native) | Intermediate |
| Real-time Systems (WebSocket) | Advanced |
| Production AI Monitoring | Expert |
| System Design at Scale | Expert |
| Security and GDPR Architecture | Intermediate |
| MLOps and Production Deployment | Advanced |

---

## 10. Business Model

| Tier | Price | Included |
|---|---|---|
| Free | /month | University search, basic recommendations, 1 SOP draft/month |
| Pro | /month | Unlimited documents, all 12 agents, professor outreach |
| Premium | /month | Expert human review, priority support, full ROI analytics |
| Agency | /month | White-label, bulk student management |

### Additional Revenue
- University Partnerships: -,000/month for featured placement
- Affiliate Revenue: IELTS prep, student housing, insurance, banking
- Data API: sell verified university/scholarship data to EdTech platforms
- Expert Marketplace: 15% commission on human counselor sessions

### Year 1 Target
10,000 users x 20% Pro conversion x /month = ,000 ARR

---
Document prepared for: StudyAbroad.AI Development Project
Last updated: September 2026
