"""
StudyAbroad.AI — Agent 4: UniversityMatchAgent
Matches student profiles to best-fit universities using FAISS + scoring.

Own tools used:
  - FAISS semantic search (free, local) — no Pinecone costs
  - sentence-transformers embeddings (free, local)
  - Custom multi-factor scoring algorithm
  - LLM for reasoning generation (Gemini free tier / Ollama)

Match algorithm:
  1. FAISS semantic search: Find semantically similar programs (top 50)
  2. Hard filters: Eliminate programs that fail minimum requirements
  3. Multi-factor scoring: Academic fit + Financial fit + Preference fit
  4. Tier classification: Reach / Match / Safety
  5. LLM reasoning: Generate human-readable explanation for each match
  6. Return ranked list with admission probability
"""
import json
import logging
from typing import Optional

from backend.tools.llm import llm
from backend.tools.embeddings import embedder
from backend.tools.vector_store import vector_store

logger = logging.getLogger(__name__)


# ─── Match Score Weights ──────────────────────────────────────────────────────

SCORE_WEIGHTS = {
    "academic_fit": 0.35,       # GPA, test scores vs. program requirements
    "financial_fit": 0.25,      # Budget vs. tuition + living costs
    "preference_fit": 0.25,     # Country, field, program type preferences
    "rank_prestige": 0.15,      # University ranking
}


class UniversityMatchAgent:
    """
    Agent 4: Finds best-matching universities for a student profile.

    Uses hybrid semantic + rule-based matching for accuracy.
    All computation done locally — no paid APIs for matching.
    """

    def __init__(self):
        self.agent_name = "UniversityMatchAgent"

    async def match(self, profile: dict, top_n: int = 20,
                    include_reasoning: bool = True) -> dict:
        """
        Find top N university matches for a student profile.

        Args:
            profile: StudentProfile dict
            top_n: Number of matches to return
            include_reasoning: Whether to generate LLM explanations (uses free LLM)

        Returns:
            Dict with ranked matches, tier breakdown, and recommendations
        """
        logger.info(f"[{self.agent_name}] Matching profile to universities...")

        # Step 1: Semantic search for candidate programs
        profile_query = self._build_search_query(profile)
        candidates = vector_store.programs.hybrid_search(
            query=profile_query,
            keyword_fields=["field", "degree", "country"],
            top_k=50
        )

        if not candidates:
            # Fallback: search universities
            candidates = vector_store.universities.hybrid_search(
                query=profile_query,
                keyword_fields=["country", "fields"],
                top_k=50
            )

        # Step 2: Score and filter each candidate
        scored_matches = []
        for candidate in candidates:
            scored = await self._score_match(profile, candidate)
            if scored["passes_hard_filters"]:
                scored_matches.append(scored)

        # Step 3: Sort by overall score
        scored_matches.sort(key=lambda x: x["overall_score"], reverse=True)
        top_matches = scored_matches[:top_n]

        # Step 4: Classify into tiers
        reach = [m for m in top_matches if m["tier"] == "reach"]
        match_tier = [m for m in top_matches if m["tier"] == "match"]
        safety = [m for m in top_matches if m["tier"] == "safety"]

        # Step 5: Generate LLM reasoning for top 5
        if include_reasoning and top_matches:
            for match in top_matches[:5]:
                match["reasoning"] = await self._generate_reasoning(profile, match)

        result = {
            "agent": self.agent_name,
            "total_candidates_evaluated": len(candidates),
            "total_matches": len(scored_matches),
            "top_matches": top_matches,
            "tier_summary": {
                "reach": len(reach),
                "match": len(match_tier),
                "safety": len(safety),
            },
            "reach_universities": reach[:3],
            "match_universities": match_tier[:5],
            "safety_universities": safety[:3],
            "tool_used": "FAISS + sentence-transformers (own, free)",
            "used_fallback": False,
        }

        logger.info(
            f"[{self.agent_name}] Found {len(scored_matches)} matches: "
            f"{len(reach)} reach, {len(match_tier)} match, {len(safety)} safety"
        )
        return result

    def _build_search_query(self, profile: dict) -> str:
        """Build a rich query string from the student profile for FAISS search."""
        target_fields = " ".join(profile.get("target_fields", []) or [])
        target_countries = " ".join(profile.get("target_countries", []) or [])
        target_degree = profile.get("target_degree", "master")
        field = profile.get("field_of_study", "")
        budget = profile.get("budget_usd_per_year", 50000)

        query = f"""
{target_degree} program in {target_fields or field}
in {target_countries}
affordable tuition budget ${budget}
{"scholarship available" if profile.get("scholarship_required") else ""}
""".strip()

        return query

    async def _score_match(self, profile: dict, candidate: dict) -> dict:
        """Score a candidate university/program match."""

        # Hard filter checks
        passes, failure_reasons = self._check_hard_filters(profile, candidate)

        scores = {
            "candidate": candidate,
            "passes_hard_filters": passes,
            "failure_reasons": failure_reasons,
            "academic_fit_score": 0,
            "financial_fit_score": 0,
            "preference_fit_score": 0,
            "rank_prestige_score": 0,
            "overall_score": 0,
            "admission_probability": 0,
            "tier": "safety",
        }

        if not passes:
            return scores

        # Academic Fit Score (0-100)
        academic_score = self._score_academic_fit(profile, candidate)

        # Financial Fit Score (0-100)
        financial_score = self._score_financial_fit(profile, candidate)

        # Preference Fit Score (0-100)
        preference_score = self._score_preference_fit(profile, candidate)

        # Prestige Score (0-100)
        prestige_score = self._score_prestige(candidate)

        # Weighted overall
        overall = (
            academic_score * SCORE_WEIGHTS["academic_fit"] +
            financial_score * SCORE_WEIGHTS["financial_fit"] +
            preference_score * SCORE_WEIGHTS["preference_fit"] +
            prestige_score * SCORE_WEIGHTS["rank_prestige"]
        )

        # Admission probability (heuristic)
        admission_prob = self._estimate_admission_probability(profile, candidate, academic_score)

        # Tier classification based on admission probability
        tier = "reach" if admission_prob < 0.4 else "match" if admission_prob < 0.7 else "safety"

        scores.update({
            "academic_fit_score": round(academic_score, 1),
            "financial_fit_score": round(financial_score, 1),
            "preference_fit_score": round(preference_score, 1),
            "rank_prestige_score": round(prestige_score, 1),
            "overall_score": round(overall, 1),
            "admission_probability": round(admission_prob, 2),
            "tier": tier,
            "university_name": candidate.get("university_name", candidate.get("text", "Unknown")),
            "country": candidate.get("country", ""),
            "semantic_similarity": round(candidate.get("score", 0), 3),
        })

        return scores

    def _check_hard_filters(self, profile: dict, candidate: dict) -> tuple[bool, list]:
        """Filter out programs that don't meet minimum requirements."""
        failures = []

        # GPA requirement
        min_gpa = candidate.get("min_gpa")
        student_gpa = profile.get("gpa")
        if min_gpa and student_gpa:
            if student_gpa < (min_gpa - 0.3):  # Allow 0.3 tolerance
                failures.append(f"GPA {student_gpa} below minimum {min_gpa}")

        # English requirement
        min_ielts = candidate.get("min_ielts")
        student_ielts = profile.get("ielts_score")
        if min_ielts and student_ielts and student_ielts < (min_ielts - 0.5):
            failures.append(f"IELTS {student_ielts} below minimum {min_ielts}")

        # Country preference
        target_countries = profile.get("target_countries", [])
        candidate_country = candidate.get("country", "")
        if target_countries and candidate_country:
            if not any(c.lower() in candidate_country.lower() or
                      candidate_country.lower() in c.lower()
                      for c in target_countries):
                failures.append(f"Country '{candidate_country}' not in preferences")

        return len(failures) == 0, failures

    def _score_academic_fit(self, profile: dict, candidate: dict) -> float:
        """Score how well student academic profile fits the program requirements."""
        score = 70.0  # Base score

        # GPA fit
        min_gpa = candidate.get("min_gpa")
        student_gpa = profile.get("gpa")
        if min_gpa and student_gpa:
            gpa_diff = student_gpa - min_gpa
            if gpa_diff >= 0.5:
                score += 15
            elif gpa_diff >= 0.2:
                score += 8
            elif gpa_diff >= 0:
                score += 3
            else:
                score -= 20

        # English fit
        min_ielts = candidate.get("min_ielts")
        student_ielts = profile.get("ielts_score")
        if min_ielts and student_ielts:
            if student_ielts >= min_ielts + 0.5:
                score += 10
            elif student_ielts >= min_ielts:
                score += 5

        # GRE fit
        gre_req = candidate.get("gre_required")
        if gre_req and not profile.get("gre_quant"):
            score -= 15

        return max(0, min(100, score))

    def _score_financial_fit(self, profile: dict, candidate: dict) -> float:
        """Score how well the university fits the student's budget."""
        budget = profile.get("budget_usd_per_year")
        tuition = candidate.get("avg_tuition_usd") or candidate.get("tuition_usd_per_year")

        if not budget or not tuition:
            return 60.0  # Neutral if data missing

        # Add estimated living costs
        living_cost = candidate.get("avg_living_cost_usd", 15000) or 15000
        total_cost = tuition + living_cost

        ratio = total_cost / budget
        if ratio <= 0.8:
            return 100.0  # Well within budget
        elif ratio <= 1.0:
            return 80.0  # Just within budget
        elif ratio <= 1.2:
            return 60.0  # Slightly over budget
        elif ratio <= 1.5:
            return 35.0  # Significantly over budget
        else:
            return 10.0  # Way over budget

    def _score_preference_fit(self, profile: dict, candidate: dict) -> float:
        """Score how well the candidate matches student preferences."""
        score = 50.0

        # Country match
        target_countries = profile.get("target_countries", []) or []
        candidate_country = candidate.get("country", "")
        if target_countries and candidate_country:
            if any(c.lower() in candidate_country.lower() for c in target_countries):
                score += 30

        # Field match
        target_fields = profile.get("target_fields", []) or []
        candidate_field = str(candidate.get("field", "") or "").lower()
        profile_field = str(profile.get("field_of_study", "") or "").lower()

        fields_to_check = [f.lower() for f in target_fields] + [profile_field]
        if any(f in candidate_field or candidate_field in f for f in fields_to_check if f):
            score += 20

        # Scholarship preference
        if profile.get("scholarship_required"):
            if candidate.get("has_scholarships"):
                score += 10

        return max(0, min(100, score))

    def _score_prestige(self, candidate: dict) -> float:
        """Score university prestige based on rankings."""
        qs_rank = candidate.get("qs_rank")
        if not qs_rank:
            return 50.0  # Unknown ranking gets neutral score

        if qs_rank <= 10:
            return 100
        elif qs_rank <= 50:
            return 90
        elif qs_rank <= 100:
            return 80
        elif qs_rank <= 200:
            return 70
        elif qs_rank <= 500:
            return 55
        else:
            return 40

    def _estimate_admission_probability(self, profile: dict, candidate: dict,
                                         academic_score: float) -> float:
        """Estimate probability of admission (heuristic model)."""
        base_prob = academic_score / 100.0

        # Adjust for acceptance rate
        acceptance_rate = candidate.get("acceptance_rate")
        if acceptance_rate:
            selectivity_factor = 1 - (1 - acceptance_rate) * 0.5
            base_prob = base_prob * selectivity_factor

        # Adjust for publications (PhD boost)
        pubs = profile.get("publications", 0) or 0
        if profile.get("target_degree") == "phd" and pubs > 0:
            base_prob = min(1.0, base_prob + pubs * 0.05)

        return max(0.05, min(0.95, base_prob))

    async def _generate_reasoning(self, profile: dict, match: dict) -> str:
        """Generate human-readable reasoning for why this is a good match."""
        prompt = f"""Explain in 2-3 sentences why this university/program is a good match for this student.
Be specific about the fit factors.

Student Profile Summary:
- GPA: {profile.get('gpa')}/{profile.get('gpa_scale', 4.0)}
- Target: {profile.get('target_degree')} in {', '.join(profile.get('target_fields', []) or [])}
- Budget: ${profile.get('budget_usd_per_year', 'unknown')}/year
- IELTS: {profile.get('ielts_score', 'N/A')}

University Match:
- University: {match.get('university_name')}
- Country: {match.get('country')}
- Overall Score: {match.get('overall_score')}/100
- Academic Fit: {match.get('academic_fit_score')}/100
- Financial Fit: {match.get('financial_fit_score')}/100
- Admission Probability: {match.get('admission_probability', 0)*100:.0f}%
- Tier: {match.get('tier')}

Write a concise, personalized explanation (2-3 sentences max):"""

        try:
            response = await llm.generate(prompt, temperature=0.5, task_name="match_reasoning")
            return response.content.strip()
        except Exception:
            return f"Strong {match.get('tier', 'match')} based on your academic profile and preferences."


# ─── Global agent instance ────────────────────────────────────────────────────
university_match_agent = UniversityMatchAgent()
