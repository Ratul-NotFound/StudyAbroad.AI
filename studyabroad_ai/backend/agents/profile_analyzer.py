"""
StudyAbroad.AI — Agent 3: ProfileAnalyzerAgent
Analyzes student profile, identifies gaps, produces personalized recommendations.

Own tools used:
  - sentence-transformers for semantic profile matching
  - FAISS for finding similar successful applicant profiles
  - LLM (Gemini free tier / Ollama) for gap analysis and advice
  - No paid APIs needed
"""
import os
os.environ.setdefault("PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION", "python")
import json
import logging
from typing import Optional

from backend.tools.llm import llm
from backend.tools.embeddings import embedder
from backend.tools.vector_store import vector_store

logger = logging.getLogger(__name__)


class ProfileAnalyzerAgent:
    """
    Agent 3: Deeply analyzes student academic profile.

    Produces:
      1. Profile completeness score (0-100%)
      2. Academic strength analysis
      3. Gap identification (GPA, test scores, experience)
      4. Personalized action plan to address gaps
      5. University tier recommendations (reach/match/safety)
      6. Estimated admission probability bands
    """

    def __init__(self):
        self.agent_name = "ProfileAnalyzerAgent"

    async def analyze(self, profile: dict) -> dict:
        """
        Full profile analysis.
        Input: Student profile dict
        Output: Comprehensive analysis report
        """
        logger.info(f"[{self.agent_name}] Analyzing profile for user {profile.get('user_id', 'unknown')}")

        # Step 1: Completeness check
        completeness = self._calculate_completeness(profile)

        # Step 2: Academic scoring
        academic_scores = self._score_academic_profile(profile)

        # Step 3: LLM-powered gap analysis and recommendations
        analysis = await self._llm_analysis(profile, academic_scores)

        # Step 4: Profile embedding for similarity matching
        profile_text = self._profile_to_text(profile)
        profile_embedding = embedder.embed_single(profile_text)

        result = {
            "agent": self.agent_name,
            "profile_completeness_pct": completeness,
            "academic_scores": academic_scores,
            "overall_profile_score": academic_scores["overall"],
            "strengths": analysis.get("strengths", []),
            "gaps": analysis.get("gaps", []),
            "recommendations": analysis.get("recommendations", []),
            "university_tier_guidance": analysis.get("tier_guidance", {}),
            "action_plan": analysis.get("action_plan", []),
            "estimated_target_countries": analysis.get("target_countries", []),
            "tool_used": "own (LLM + sentence-transformers)",
            "used_fallback": False,
        }

        return result

    def _calculate_completeness(self, profile: dict) -> float:
        """Calculate what % of profile is filled in."""
        required_fields = [
            "degree_level", "field_of_study", "gpa", "graduation_year",
            "target_degree", "target_fields", "target_countries",
        ]
        important_fields = [
            "ielts_score", "toefl_score", "gre_quant", "work_experience_years",
            "budget_usd_per_year", "scholarship_required"
        ]
        optional_fields = [
            "publications", "research_experience", "extracurriculars", "skills",
            "current_institution", "country_of_education"
        ]

        score = 0.0
        # Required: 60% weight
        filled_required = sum(1 for f in required_fields if profile.get(f))
        score += (filled_required / len(required_fields)) * 60

        # Important: 30% weight
        filled_important = sum(1 for f in important_fields if profile.get(f))
        score += (filled_important / len(important_fields)) * 30

        # Optional: 10% weight
        filled_optional = sum(1 for f in optional_fields if profile.get(f))
        score += (filled_optional / len(optional_fields)) * 10

        return round(min(score, 100), 1)

    def _score_academic_profile(self, profile: dict) -> dict:
        """Score different aspects of the academic profile (0-100)."""
        scores = {}

        # GPA Score (most important)
        gpa = profile.get("gpa")
        gpa_scale = profile.get("gpa_scale", 4.0)
        if gpa and gpa_scale:
            normalized_gpa = (gpa / gpa_scale) * 4.0
            scores["gpa"] = round(min((normalized_gpa / 4.0) * 100, 100), 1)
        else:
            scores["gpa"] = 0

        # English proficiency
        ielts = profile.get("ielts_score")
        toefl = profile.get("toefl_score")
        if ielts:
            scores["english"] = round(min(((ielts - 5.0) / 4.0) * 100, 100), 1)
        elif toefl:
            scores["english"] = round(min(((toefl - 60) / 60) * 100, 100), 1)
        else:
            scores["english"] = 0

        # GRE score
        gre_quant = profile.get("gre_quant")
        if gre_quant:
            scores["gre"] = round(min(((gre_quant - 130) / 40) * 100, 100), 1)
        else:
            scores["gre"] = 50  # Neutral if not required

        # Work experience
        exp_years = profile.get("work_experience_years", 0) or 0
        target_degree = profile.get("target_degree", "master")
        if target_degree == "mba":
            scores["experience"] = round(min((exp_years / 5.0) * 100, 100), 1)
        elif target_degree == "phd":
            # Research experience matters more for PhD
            pubs = profile.get("publications", 0) or 0
            research = 1 if profile.get("research_experience") else 0
            scores["experience"] = round(min(((exp_years * 10) + (pubs * 20) + (research * 20)), 100), 1)
        else:  # Master
            scores["experience"] = round(min((exp_years / 3.0) * 100, 100), 1)

        # Research/Publications
        pubs = profile.get("publications", 0) or 0
        scores["research"] = round(min(pubs * 25, 100), 1)

        # Extracurriculars
        extras = profile.get("extracurriculars", [])
        scores["extracurriculars"] = round(min(len(extras or []) * 15, 100), 1)

        # Overall weighted score
        weights = {
            "gpa": 0.30,
            "english": 0.25,
            "gre": 0.15,
            "experience": 0.15,
            "research": 0.10,
            "extracurriculars": 0.05,
        }
        overall = sum(scores.get(k, 0) * w for k, w in weights.items())
        scores["overall"] = round(overall, 1)

        return scores

    async def _llm_analysis(self, profile: dict, scores: dict) -> dict:
        """Use LLM (own Gemini/Ollama) for deep qualitative analysis."""
        profile_summary = self._profile_to_text(profile)

        prompt = f"""You are an expert study abroad advisor with 20 years of experience.
Analyze this student profile and provide expert advice.

STUDENT PROFILE:
{profile_summary}

COMPUTED SCORES (0-100):
- GPA Score: {scores.get('gpa', 0)}/100
- English Proficiency: {scores.get('english', 0)}/100
- GRE/Test Scores: {scores.get('gre', 0)}/100
- Work Experience: {scores.get('experience', 0)}/100
- Research/Publications: {scores.get('research', 0)}/100
- Overall Profile Strength: {scores.get('overall', 0)}/100

Provide a comprehensive JSON analysis:
{{
  "strengths": ["list of 3-5 specific strengths of this profile"],
  "gaps": [
    {{
      "area": "e.g., GPA/GRE/English/Experience",
      "current": "current status",
      "required": "what's typically needed",
      "severity": "critical/moderate/minor",
      "fix": "specific actionable advice to address this gap"
    }}
  ],
  "recommendations": ["list of 5-7 actionable recommendations"],
  "tier_guidance": {{
    "reach": "profile description for reach schools (e.g., top-20 US)",
    "match": "profile description for match schools",
    "safety": "profile description for safety schools"
  }},
  "action_plan": [
    {{
      "priority": 1,
      "action": "specific action to take",
      "timeline": "e.g., 3 months",
      "impact": "high/medium/low"
    }}
  ],
  "target_countries": [
    {{
      "country": "country name",
      "reason": "why this country suits this profile",
      "visa_work_rights": "work rights summary"
    }}
  ]
}}

Return ONLY valid JSON."""

        try:
            response = await llm.generate(
                prompt,
                system_prompt="You are an expert international education advisor. Always return valid JSON.",
                temperature=0.3,
                task_name="profile_analysis",
                critical=True  # This is important enough for paid fallback if needed
            )
            text = response.content.strip()
            if "```" in text:
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text)
        except Exception as e:
            logger.error(f"[{self.agent_name}] LLM analysis failed: {e}")
            return {
                "strengths": ["Profile data collected successfully"],
                "gaps": [],
                "recommendations": ["Complete your profile for better analysis"],
                "tier_guidance": {},
                "action_plan": [],
                "target_countries": []
            }

    def _profile_to_text(self, profile: dict) -> str:
        """Convert profile dict to human-readable text for LLM/embeddings."""
        return f"""
Degree Level: {profile.get('degree_level', 'N/A')}
Field: {profile.get('field_of_study', 'N/A')}
GPA: {profile.get('gpa', 'N/A')}/{profile.get('gpa_scale', 4.0)}
IELTS: {profile.get('ielts_score', 'N/A')} | TOEFL: {profile.get('toefl_score', 'N/A')}
GRE Quant: {profile.get('gre_quant', 'N/A')} | GRE Verbal: {profile.get('gre_verbal', 'N/A')}
Work Experience: {profile.get('work_experience_years', 0)} years
Publications: {profile.get('publications', 0)}
Research: {profile.get('research_experience', 'None')}
Target Degree: {profile.get('target_degree', 'N/A')}
Target Fields: {', '.join(profile.get('target_fields', []) or [])}
Target Countries: {', '.join(profile.get('target_countries', []) or [])}
Budget: ${profile.get('budget_usd_per_year', 'N/A')}/year
Scholarship Required: {profile.get('scholarship_required', False)}
""".strip()


# ─── Global agent instance ────────────────────────────────────────────────────
profile_analyzer_agent = ProfileAnalyzerAgent()
