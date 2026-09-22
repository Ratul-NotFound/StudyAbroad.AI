"""
StudyAbroad.AI — Agent 7: DocumentAuditAgent
Audits student's document readiness per target country and university.

Produces a per-document checklist with:
  - Status (ready / missing / needs_improvement)
  - Priority (critical / high / medium / low)
  - Specific action items for each gap

No paid tools needed — embedded knowledge + rule-based logic.
"""
import logging
from typing import Optional

from backend.tools.llm import llm

logger = logging.getLogger(__name__)


# ─── Document Requirements by Country ────────────────────────────────────────

COUNTRY_DOCS = {
    "default": [
        "passport", "transcripts", "degree_certificate", "sop",
        "cv_resume", "english_proficiency", "lor_1", "lor_2",
    ],
    "USA": [
        "passport", "transcripts", "degree_certificate", "sop",
        "cv_resume", "english_proficiency", "gre_scores",
        "lor_1", "lor_2", "lor_3", "financial_proof", "i20",
    ],
    "UK": [
        "passport", "transcripts", "degree_certificate", "sop",
        "cv_resume", "english_proficiency", "lor_1", "lor_2",
        "financial_proof", "cas_number",
    ],
    "Germany": [
        "passport", "transcripts", "degree_certificate", "sop",
        "cv_resume", "english_proficiency", "lor_1", "lor_2",
        "blocked_account", "health_insurance", "aps_certificate",
        "certified_translations",
    ],
    "Canada": [
        "passport", "transcripts", "degree_certificate", "sop",
        "cv_resume", "english_proficiency", "lor_1", "lor_2",
        "financial_proof", "study_permit_application",
    ],
    "Australia": [
        "passport", "transcripts", "degree_certificate", "sop",
        "cv_resume", "english_proficiency", "lor_1", "lor_2",
        "financial_proof", "oshc_insurance", "gte_statement",
    ],
    "Singapore": [
        "passport", "transcripts", "degree_certificate", "sop",
        "cv_resume", "english_proficiency", "lor_1", "lor_2",
        "financial_proof",
    ],
    "Netherlands": [
        "passport", "transcripts", "degree_certificate", "sop",
        "cv_resume", "english_proficiency", "lor_1", "lor_2",
        "financial_proof", "apostille_transcripts",
    ],
}

DOC_LABELS = {
    "passport": "Valid Passport",
    "transcripts": "Academic Transcripts (all degrees)",
    "degree_certificate": "Degree/Graduation Certificate",
    "sop": "Statement of Purpose (SOP)",
    "cv_resume": "Curriculum Vitae / Resume",
    "english_proficiency": "English Proficiency (IELTS/TOEFL/Duolingo)",
    "gre_scores": "GRE Score Report",
    "lor_1": "Letter of Recommendation #1",
    "lor_2": "Letter of Recommendation #2",
    "lor_3": "Letter of Recommendation #3",
    "financial_proof": "Financial Proof / Bank Statements (6 months)",
    "i20": "Form I-20 from US University",
    "cas_number": "CAS (Confirmation of Acceptance for Studies)",
    "blocked_account": "Blocked Account — Sperrkonto (min €11,208)",
    "health_insurance": "Health Insurance Certificate",
    "aps_certificate": "APS Certificate (Academic Evaluation Centre)",
    "certified_translations": "Certified Document Translations (German/English)",
    "study_permit_application": "Canadian Study Permit Application (IRCC)",
    "oshc_insurance": "OSHC Health Insurance (Mandatory for Australia)",
    "gte_statement": "Genuine Temporary Entrant (GTE) Statement",
    "apostille_transcripts": "Apostilled/Legalised Transcripts",
}

DOC_PRIORITY = {
    "passport": "critical",
    "blocked_account": "critical",
    "aps_certificate": "critical",
    "english_proficiency": "critical",
    "transcripts": "critical",
    "sop": "high",
    "lor_1": "high", "lor_2": "high", "lor_3": "high",
    "gre_scores": "high",
    "financial_proof": "high",
    "cv_resume": "high",
    "degree_certificate": "high",
    "i20": "high",
    "cas_number": "high",
    "oshc_insurance": "high",
    "gte_statement": "high",
    "health_insurance": "medium",
    "certified_translations": "medium",
    "study_permit_application": "medium",
    "apostille_transcripts": "medium",
}


class DocumentAuditAgent:
    """
    Agent 7: Reviews student's document readiness for target countries/universities.

    Returns a checklist with:
      - Documents required per country
      - Readiness status per document
      - Specific action items for missing or weak documents
      - Overall readiness percentage
    """

    def __init__(self):
        self.agent_name = "DocumentAuditAgent"

    async def audit(
        self,
        profile: dict,
        target_countries: Optional[list] = None,
        existing_documents: Optional[list] = None,
    ) -> dict:
        """
        Audit document readiness for target countries.

        Args:
            profile: Student profile dict
            target_countries: List of target countries (from profile if not given)
            existing_documents: List of document keys the student has ready
        """
        logger.info(f"[{self.agent_name}] Auditing documents for profile")

        countries = target_countries or profile.get("target_countries") or ["USA"]
        existing = set(existing_documents or [])

        # Infer existing documents from profile data
        existing = self._infer_from_profile(profile, existing)

        # Build checklist per country
        country_checklists = {}
        all_missing = []

        for country in countries:
            required = COUNTRY_DOCS.get(country, COUNTRY_DOCS["default"])
            items = []
            missing_count = 0

            # APS check
            aps_countries = ["Bangladesh", "India", "Pakistan", "China", "Vietnam", "Mongolia"]
            country_of_education = profile.get("country_of_education", "")

            for doc_key in required:
                # Special: APS only required for certain countries applying to Germany
                if doc_key == "aps_certificate" and country_of_education not in aps_countries:
                    continue

                label = DOC_LABELS.get(doc_key, doc_key)
                priority = DOC_PRIORITY.get(doc_key, "medium")
                has_doc = doc_key in existing

                action = self._get_action(doc_key, profile, has_doc, country)

                item = {
                    "document": label,
                    "key": doc_key,
                    "status": "ready" if has_doc else "missing",
                    "priority": priority,
                    "action": action if not has_doc else "✅ Document ready",
                }
                items.append(item)

                if not has_doc:
                    missing_count += 1
                    all_missing.append({"doc": label, "country": country, "priority": priority})

            ready = len(required) - missing_count
            readiness_pct = round((ready / len(required)) * 100) if required else 100

            country_checklists[country] = {
                "country": country,
                "required_count": len(items),
                "ready_count": ready,
                "missing_count": missing_count,
                "readiness_pct": readiness_pct,
                "items": items,
            }

        # Overall readiness
        all_counts = [v["readiness_pct"] for v in country_checklists.values()]
        overall_readiness = round(sum(all_counts) / len(all_counts)) if all_counts else 0

        # Critical gaps
        critical_gaps = [m for m in all_missing if m.get("priority") == "critical"]

        # LLM action plan
        action_plan = []
        try:
            action_plan = await self._generate_action_plan(profile, critical_gaps, all_missing[:5])
        except Exception as e:
            logger.warning(f"[{self.agent_name}] LLM action plan failed: {e}")
            action_plan = [f"Priority action: Prepare {g['doc']} for {g['country']}" for g in critical_gaps[:3]]

        return {
            "overall_readiness_pct": overall_readiness,
            "country_checklists": country_checklists,
            "critical_gaps": critical_gaps,
            "action_plan": action_plan,
            "tool_used": "Rule-based document audit (own, free)",
        }

    def _infer_from_profile(self, profile: dict, existing: set) -> set:
        """Infer document readiness from profile fields."""
        if profile.get("ielts_score") or profile.get("toefl_score"):
            existing.add("english_proficiency")
        if profile.get("gre_quant") or profile.get("gre_verbal"):
            existing.add("gre_scores")
        if profile.get("gpa") and profile.get("current_institution"):
            existing.add("transcripts")
        if profile.get("graduation_year") and int(profile.get("graduation_year", 0) or 0) <= 2025:
            existing.add("degree_certificate")
        # Assume CV and passport exist if profile is substantially filled
        filled_fields = sum(1 for v in profile.values() if v)
        if filled_fields >= 5:
            existing.add("cv_resume")
        return existing

    def _get_action(self, doc_key: str, profile: dict, has_doc: bool, country: str) -> str:
        actions = {
            "passport": "Renew or obtain a valid passport ASAP. Ensure 1+ year validity beyond your study end date.",
            "transcripts": "Request official transcripts from all institutions attended. Request them now — universities take 2-4 weeks.",
            "degree_certificate": "Obtain your original degree certificate and make notarized copies.",
            "sop": "Draft your Statement of Purpose tailored to each university. Use our AI SOP Writer.",
            "cv_resume": "Prepare a 1-2 page academic CV. Highlight research, publications, and internships.",
            "english_proficiency": "Book IELTS Academic or TOEFL iBT immediately. Tests are scheduled 3-6 weeks in advance.",
            "gre_scores": "Register for GRE on ETS.org. Available year-round; scores valid 5 years.",
            "lor_1": "Request LOR from an academic supervisor who knows your research well. Give them 4-6 weeks.",
            "lor_2": "Request LOR from a professor who has graded your work. Give them 4-6 weeks.",
            "lor_3": "Request a 3rd LOR from an employer or professional supervisor for work experience.",
            "financial_proof": "Prepare 6 months of bank statements. Ensure adequate balance for tuition + living costs.",
            "i20": "Your I-20 will be issued by your US university after acceptance. Contact their International Office.",
            "cas_number": "CAS is issued by your UK university after accepting their offer. No action needed until then.",
            "blocked_account": f"Open a Sperrkonto at Fintiba (fintiba.com) or Coracle immediately. Takes 1-2 weeks. Fund with min €11,208.",
            "health_insurance": "Obtain German statutory health insurance (AOK, TK, Barmer) or recognized private insurance.",
            "aps_certificate": f"Apply for APS certificate NOW at the German embassy in {profile.get('country_of_education', 'your country')}. Takes 4-8 weeks minimum.",
            "certified_translations": "Get all non-German/English documents translated by a certified translator (vereidigter Übersetzer).",
            "study_permit_application": "Complete your Study Permit on the IRCC portal (canada.ca). Apply as soon as you have your acceptance letter.",
            "oshc_insurance": "Purchase OSHC from an approved provider (Medibank, Bupa, AHM, NIB) before applying for your visa.",
            "gte_statement": "Write a detailed GTE statement explaining your study plans and genuine intent to leave Australia after studies.",
            "apostille_transcripts": "Get your transcripts apostilled (legalized) through your country's Ministry of Foreign Affairs.",
        }
        return actions.get(doc_key, f"Prepare {DOC_LABELS.get(doc_key, doc_key)} for {country} application.")

    async def _generate_action_plan(self, profile: dict, critical_gaps: list, top_missing: list) -> list:
        """LLM-powered prioritized action plan."""
        missing_docs = [g["doc"] for g in top_missing]
        country = (profile.get("target_countries") or ["your target country"])[0]
        field = ", ".join(profile.get("target_fields") or ["your field"])

        prompt = f"""A student applying to study {field} in {country} is missing these documents: {', '.join(missing_docs)}.

Give 3-4 specific, prioritized action steps to prepare these documents. Each step should be 1-2 sentences.
Format as a numbered list. Be direct and practical. No headers."""

        response = await llm.complete(prompt, temperature=0.5, max_tokens=300)
        text = response.content.strip()
        lines = [l.strip().lstrip("•-0123456789. ") for l in text.split("\n") if l.strip()]
        return lines[:4]


document_audit_agent = DocumentAuditAgent()
