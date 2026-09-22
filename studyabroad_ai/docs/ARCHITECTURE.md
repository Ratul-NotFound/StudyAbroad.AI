# StudyAbroad.AI — System Architecture & Workflow Specifications

## 1. Multi-Agent Ecosystem
The platform deploys 12 specialized autonomous AI agents:
1. **UniversityScraperAgent**: Dynamic web scraping using Playwright + BeautifulSoup.
2. **ScholarshipScraperAgent**: Automated scraping across global government portals and endowments.
3. **ProfileAnalyzerAgent**: Multi-dimensional academic scoring across GPA, test scores, research, and work experience.
4. **UniversityMatchAgent**: Semantic vector matching with FAISS embeddings and tier classification (Reach/Match/Safe).
5. **SOPWriterAgent**: Contextual Statement of Purpose draft generator with voice preservation and interactive refinements.
6. **ScholarshipMatchAgent**: Eligibility scoring against 50,000+ global funding programs.
7. **DocumentAuditAgent**: Country-specific admissions compliance checklist and gap analysis.
8. **EmailDraftAgent**: Professor cold outreach and research proposal inquiry drafting.
9. **VisaGuideAgent**: Embassy requirements, financial solvency benchmarks, and interview checklists.
10. **InterviewCoachAgent**: Dynamic mock visa interview simulation with live evaluation.
11. **CityLifeAgent**: Cost of living, rent, transport, and monthly student budget calculator.
12. **CareerROIAgent**: Post-graduation salary projections, STEM OPT stay-back periods, and ROI indices.

## 2. Frontend & BFF Architecture
- **Next.js 14 App Router** with SSR-safe client-side state bridge (`lib/store.ts`).
- **Zero 404 Routes**: All primary modules (`/dashboard`, `/universities`, `/sop`, `/profile`, `/dashboard/scholarships`, `/dashboard/deadlines`, `/dashboard/documents`) fully interconnected.
- **Micro-Animations & Visual Meters**: Framer-motion transitions, animated count-ups, live agent feeds, and status badges.
