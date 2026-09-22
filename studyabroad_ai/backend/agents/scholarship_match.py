"""
StudyAbroad.AI — Agent 6: ScholarshipMatchAgent
Matches global scholarships to student profile using FAISS semantic search
+ eligibility rule scoring.

Own tools used:
  - FAISS vector store (own, free) for semantic scholarship search
  - sentence-transformers (own, free) for embeddings
  - LLM for personalized eligibility analysis and application tips
  - No paid scholarship database subscriptions needed

Coverage: DAAD, Fulbright, Chevening, Gates Cambridge, MEXT, ETH ESOP,
          Australia Awards, SINGA, Erasmus+, Swedish Institute, and more.
"""
import logging
from typing import Optional

from backend.tools.llm import llm
from backend.tools.vector_store import vector_store

logger = logging.getLogger(__name__)


# ─── Eligibility Scoring Rules ────────────────────────────────────────────────

def _score_eligibility(profile: dict, scholarship: dict) -> dict:
    """Rule-based eligibility scoring. Returns score 0-100 + breakdown."""
    score = 100
    flags = []
    passes = []

    gpa = profile.get("gpa", 0) or 0
    gpa_scale = profile.get("gpa_scale", 4.0) or 4.0
    gpa_4 = (gpa / gpa_scale) * 4.0 if gpa_scale else gpa

    target_countries = [c.lower() for c in (profile.get("target_countries") or [])]
    target_degree = (profile.get("target_degree") or "master").lower()
    work_exp = profile.get("work_experience_years", 0) or 0
    publications = profile.get("publications", 0) or 0

    # Country match
    sch_country = scholarship.get("country", "").lower()
    if sch_country and target_countries and sch_country not in target_countries:
        score -= 20
        flags.append(f"Not targeting {scholarship.get('country', '')} — lower priority for you")
    elif sch_country and target_countries and sch_country in target_countries:
        passes.append(f"Country match: {scholarship.get('country', '')}")

    # Degree match
    sch_degree = scholarship.get("degree", "").lower()
    if "phd" in sch_degree and "phd" not in target_degree and "doctorate" not in target_degree:
        score -= 25
        flags.append("This scholarship targets PhD — you're applying for " + target_degree)
    elif "master" in sch_degree and "master" in target_degree:
        passes.append("Degree level match: Master's")

    # GPA threshold
    min_gpa_raw = scholarship.get("min_gpa_4scale", 0)
    if min_gpa_raw and gpa_4 < min_gpa_raw:
        score -= 30
        flags.append(f"GPA {gpa_4:.2f}/4.0 is below minimum {min_gpa_raw:.1f}/4.0 for this scholarship")
    elif gpa_4 >= 3.7:
        passes.append(f"Strong GPA ({gpa_4:.2f}/4.0) — competitive for merit scholarships")

    # Work experience for scholarships that require it
    if scholarship.get("requires_work_exp") and work_exp < 2:
        score -= 15
        flags.append(f"This scholarship typically requires 2+ years work experience (you have {work_exp})")
    elif work_exp >= 2:
        passes.append(f"{work_exp} years professional experience — strong asset")

    # Research/publications bonus
    if publications > 0:
        score = min(100, score + 5)
        passes.append(f"{publications} publication(s) — strong differentiator for competitive scholarships")

    return {
        "score": max(0, score),
        "passes": passes,
        "flags": flags,
        "eligible": score >= 50,
    }


class ScholarshipMatchAgent:
    """
    Agent 6: Finds and ranks global scholarships matching a student profile.

    Returns:
      1. Ranked scholarship list with eligibility scores
      2. Top 3 scholarships with personalized application tips
      3. Total potential funding value
    """

    def __init__(self):
        self.agent_name = "ScholarshipMatchAgent"

    async def match(
        self,
        profile: dict,
        top_n: int = 10,
        country_filter: Optional[str] = None,
    ) -> dict:
        logger.info(f"[{self.agent_name}] Finding scholarships for profile")

        # Build semantic search query from profile
        target_fields = ", ".join(profile.get("target_fields") or ["any field"])
        target_countries = ", ".join(profile.get("target_countries") or ["any country"])
        target_degree = profile.get("target_degree", "master")
        query = (
            f"scholarship {target_degree} {target_fields} international student "
            f"{target_countries} full funding stipend"
        )
        if profile.get("scholarship_required"):
            query += " full scholarship tuition waiver"

        # FAISS search
        try:
            candidates = vector_store.scholarships.search(query=query, top_k=min(top_n * 2, 40))
        except Exception as e:
            logger.warning(f"[{self.agent_name}] Vector search failed: {e}. Using all indexed scholarships.")
            candidates = vector_store.scholarships.get_all(limit=40)

        if not candidates:
            # Return knowledge-base fallback
            candidates = self._get_fallback_scholarships(profile)

        # Score each scholarship
        scored = []
        for c in candidates:
            meta = c.get("metadata", c)
            eligibility = _score_eligibility(profile, meta)
            if country_filter and meta.get("country", "").lower() != country_filter.lower():
                continue
            scored.append({
                "scholarship": meta,
                "eligibility_score": eligibility["score"],
                "eligible": eligibility["eligible"],
                "passes": eligibility["passes"],
                "flags": eligibility["flags"],
                "amount_usd": meta.get("amount_usd", 0),
            })

        # Sort: eligible first, then by eligibility score × amount
        scored.sort(
            key=lambda x: (int(x["eligible"]), x["eligibility_score"] * 0.7 + min(x["amount_usd"] / 1000, 30) * 0.3),
            reverse=True
        )
        top = scored[:top_n]

        # LLM tips for top 3
        tips = []
        if top:
            try:
                tips = await self._get_application_tips(profile, top[:3])
            except Exception as e:
                logger.warning(f"[{self.agent_name}] LLM tips failed: {e}")

        total_potential = sum(s["amount_usd"] for s in top if s["eligible"])

        return {
            "scholarships": top,
            "total_found": len(top),
            "eligible_count": sum(1 for s in top if s["eligible"]),
            "total_potential_funding_usd": total_potential,
            "application_tips": tips,
            "tool_used": "FAISS vector search (own, free) + eligibility scoring",
        }

    async def _get_application_tips(self, profile: dict, top_scholarships: list) -> list:
        """LLM-powered personalized tips for top scholarships."""
        sch_names = ", ".join(
            s["scholarship"].get("name", "Unknown") for s in top_scholarships
        )
        gpa = profile.get("gpa", "N/A")
        field = ", ".join(profile.get("target_fields") or ["your field"])

        prompt = f"""You are a scholarship advisor for international students.
Student profile: GPA {gpa}, field: {field}, target degree: {profile.get("target_degree", "master")}.
Top matching scholarships: {sch_names}

Give 3 specific, actionable application tips for this student. Each tip should be 1-2 sentences.
Format as a plain list. No headers. No markdown symbols."""

        response = await llm.complete(prompt, temperature=0.6, max_tokens=300)
        text = response.content.strip()
        tips = [line.strip().lstrip("•-123456789. ") for line in text.split("\n") if line.strip()]
        return tips[:3]

    def _get_fallback_scholarships(self, profile: dict) -> list:
        """Return hardcoded scholarship knowledge if vector store is empty."""
        return [
            {"metadata": {"name": "DAAD Master Studies Scholarship", "country": "Germany",
                          "funding_type": "Full tuition + €934/month stipend", "amount_usd": 22000,
                          "deadline": "October 31", "degree": "Master",
                          "eligibility": "Bachelor completed within 6 years, GPA ≥ 3.3/4.0",
                          "url": "https://www.daad.de/en/", "min_gpa_4scale": 3.3}},
            {"metadata": {"name": "Fulbright Foreign Student Program", "country": "USA",
                          "funding_type": "Full tuition + living + airfare", "amount_usd": 65000,
                          "deadline": "October 15", "degree": "Master / PhD",
                          "eligibility": "Outstanding academic record, leadership potential",
                          "url": "https://foreign.fulbrightonline.org/", "min_gpa_4scale": 3.5}},
            {"metadata": {"name": "Chevening Scholarships", "country": "UK",
                          "funding_type": "Full tuition + living + airfare", "amount_usd": 45000,
                          "deadline": "November 1", "degree": "Master",
                          "eligibility": "2+ years work experience, leadership potential",
                          "url": "https://www.chevening.org/", "min_gpa_4scale": 3.3,
                          "requires_work_exp": True}},
            {"metadata": {"name": "Gates Cambridge Scholarship", "country": "UK",
                          "funding_type": "Full cost of studying at Cambridge", "amount_usd": 55000,
                          "deadline": "October 14", "degree": "Master / PhD",
                          "eligibility": "Outstanding intellectual ability, leadership, commitment to improving others' lives",
                          "url": "https://www.gatescambridge.org/", "min_gpa_4scale": 3.8}},
            {"metadata": {"name": "ETH Excellence Scholarship (ESOP)", "country": "Switzerland",
                          "funding_type": "CHF 12,000/semester + tuition waiver", "amount_usd": 28000,
                          "deadline": "December 15", "degree": "Master",
                          "eligibility": "Top 10% of undergraduate cohort (GPA ≥ 3.8/4.0)",
                          "url": "https://ethz.ch/students/en/studies/financial/scholarships/excellence.html",
                          "min_gpa_4scale": 3.8}},
            {"metadata": {"name": "Australia Awards Scholarships", "country": "Australia",
                          "funding_type": "Full tuition + airfare + living allowance", "amount_usd": 48000,
                          "deadline": "April 30", "degree": "Master / PhD",
                          "eligibility": "Citizens of Indo-Pacific countries, 2+ years work experience",
                          "url": "https://www.dfat.gov.au/people-to-people/australia-awards",
                          "requires_work_exp": True}},
            {"metadata": {"name": "MEXT Japanese Government Scholarship", "country": "Japan",
                          "funding_type": "Full tuition + ¥143,000-145,000/month + airfare", "amount_usd": 20000,
                          "deadline": "May (varies)", "degree": "Master / PhD",
                          "eligibility": "Under 35 years old, strong academic record",
                          "url": "https://www.studyinjapan.go.jp/en/smap-stopj-applications-research.html"}},
            {"metadata": {"name": "Swedish Institute Scholarship for Global Professionals", "country": "Sweden",
                          "funding_type": "SEK 11,000/month + establishment grant + tuition", "amount_usd": 20000,
                          "deadline": "February 10", "degree": "Master",
                          "eligibility": "3+ years professional experience, leadership qualities",
                          "url": "https://si.se/en/apply/scholarships/",
                          "requires_work_exp": True}},
        ]


scholarship_match_agent = ScholarshipMatchAgent()
