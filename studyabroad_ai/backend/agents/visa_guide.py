"""
StudyAbroad.AI — Agent 9: VisaGuideAgent
Provides country-specific student visa guidance with an embedded knowledge base.

Strategy: Rule-based knowledge base (no hallucination risk on legal/visa info)
          + LLM for personalized gap analysis only.

Covers: USA (F-1), UK (Student), Germany (National Visa), Canada (Study Permit),
        Australia (Subclass 500), Singapore (Student Pass), Netherlands,
        Sweden, Switzerland, Japan.
"""
import logging

from backend.tools.llm import llm

logger = logging.getLogger(__name__)


# ─── Embedded Visa Knowledge Base ────────────────────────────────────────────

VISA_KNOWLEDGE = {
    "usa": {
        "visa_type": "F-1 Student Visa",
        "processing_time": "3–5 weeks (apply 3+ months early)",
        "fee_usd": 185,
        "sevis_fee_usd": 350,
        "language": "English",
        "required_documents": [
            "Valid passport (6+ months beyond study end)",
            "Form I-20 issued by your US university",
            "DS-160 visa application form (completed online)",
            "SEVIS fee payment receipt (Form I-901, $350)",
            "Visa application fee payment ($185)",
            "Academic transcripts (all degree levels)",
            "Proof of English proficiency (IELTS/TOEFL scores)",
            "Financial proof: $20,000-$80,000 in bank (covers full year)",
            "Bank statements (last 3-6 months)",
            "Scholarship letters / financial aid award letters",
            "Sponsor letter + their bank statements if funded by family",
            "Passport-size photos (per US embassy specifications)",
            "Ties to home country (property deed, job letter, family declaration)",
        ],
        "post_study_work": "3 years STEM OPT (Optional Practical Training) for STEM fields; 1 year for others",
        "interview_required": True,
        "embassy_tips": [
            "Be concise and confident in your interview. Visa officers make decisions in 2-3 minutes.",
            "Clearly state your plan to return home after studies (ties to home country).",
            "Know your I-20 form details — program, cost, funding sources.",
            "Demonstrate sufficient funds clearly. Have bank statements well-organized.",
            "Avoid overly long or vague answers. Direct and specific is best.",
        ],
        "blocked_account_required": False,
        "notes": "The US has strict immigration enforcement. Any violation of F-1 status can lead to deportation and future visa bans.",
    },
    "uk": {
        "visa_type": "UK Student Visa (Tier 4 replacement)",
        "processing_time": "3 weeks (apply up to 6 months before course start)",
        "fee_usd": 490,
        "healthcare_surcharge_usd": 624,
        "language": "English",
        "required_documents": [
            "CAS (Confirmation of Acceptance for Studies) from your UK university",
            "Valid passport",
            "Proof of English (IELTS Academic 6.0+ or SELT equivalent)",
            "Financial proof: £1,334/month for London, £1,023/month for outside London (9 months minimum)",
            "Tuberculosis (TB) test results (if from a country on the list)",
            "Academic transcripts and qualifications",
            "Parental consent letter if under 18",
        ],
        "post_study_work": "Graduate Route Visa: 2 years post-study work (3 years for PhD graduates)",
        "interview_required": False,
        "embassy_tips": [
            "Apply online through the UK Visas and Immigration (UKVI) portal.",
            "Attend biometrics appointment at a local Visa Application Centre (VAC).",
            "Ensure your CAS number is correct — it is the most critical document.",
            "The Immigration Health Surcharge (IHS) must be paid upfront (~£624/year for students).",
        ],
        "blocked_account_required": False,
        "notes": "UK has shifted to a points-based immigration system. Strong in-demand jobs may lead to Graduate Route and eventually Skilled Worker visa.",
    },
    "germany": {
        "visa_type": "German National Visa (Section 16b AufenthG) — Student Visa",
        "processing_time": "6–12 weeks (apply 3-4 months before semester start)",
        "fee_usd": 80,
        "language": "German (courses), English (application letters)",
        "required_documents": [
            "University admission letter (Zulassungsbescheid)",
            "Blocked account (Sperrkonto): minimum €11,208 (2024 rate) — Fintiba, Coracle, or Deutsche Bank",
            "Valid passport (minimum 1 year validity beyond study end)",
            "Health insurance confirmation (AOK, TK, or private equivalent)",
            "Biometric passport photos (35x45mm, white background)",
            "Completed visa application form",
            "Academic transcripts and degree certificates (German-certified translations if not in German/English)",
            "APS Certificate (for applicants from China, India, Vietnam, Mongolia, Bangladesh, Pakistan) — MANDATORY",
            "Language certificate: German B1/B2 for German-taught programs OR IELTS/TOEFL for English-taught",
            "Curriculum Vitae (CV/Resume)",
            "Motivation letter",
            "Proof of accommodation in Germany (optional but recommended)",
        ],
        "post_study_work": "18-month Job Seeker Visa after graduation; fast track to EU Blue Card → PR",
        "interview_required": False,
        "embassy_tips": [
            "Book your German embassy appointment IMMEDIATELY after receiving admission — slots fill months in advance.",
            "Open your Sperrkonto (blocked account) at Fintiba or Coracle first — it takes 1-2 weeks to verify.",
            "APS certificate is MANDATORY for Bangladeshi, Indian, Pakistani, Chinese, Vietnamese, and Mongolian applicants. Apply for it months before.",
            "Get document translations certified — uncertified translations are rejected.",
            "Bring ALL original documents PLUS 2 certified copies of each.",
        ],
        "blocked_account_required": True,
        "blocked_account_amount": 11208,
        "aps_required_countries": ["Bangladesh", "India", "Pakistan", "China", "Vietnam", "Mongolia"],
        "notes": "Germany has virtually zero tuition fees for public universities. The blocked account is your biggest financial hurdle — plan 6+ months ahead.",
    },
    "canada": {
        "visa_type": "Canadian Study Permit",
        "processing_time": "8–12 weeks (apply 6+ months before start date)",
        "fee_usd": 150,
        "language": "English / French",
        "required_documents": [
            "Letter of Acceptance from a Designated Learning Institution (DLI)",
            "Valid passport",
            "Proof of financial means: $10,000 CAD/year + first year tuition",
            "Bank statements (last 4-6 months)",
            "Proof of ties to home country",
            "Academic transcripts",
            "English proficiency (IELTS Academic 6.0+ or equivalent)",
            "Medical exam results (if required from your country)",
            "Biometrics (required, $85 CAD)",
            "Statement of purpose explaining study plan and return intent",
        ],
        "post_study_work": "Post-Graduate Work Permit (PGWP): up to 3 years. Pathway to PR via Express Entry or Provincial Nominee Program.",
        "interview_required": False,
        "embassy_tips": [
            "Canada uses an online IRCC portal. Ensure your application is complete — incomplete applications are returned.",
            "Student Direct Stream (SDS) is faster (20 days) for students from India, China, Philippines, and 10 other countries.",
            "Strong SOP explaining your career connection to your home country reduces refusal risk.",
            "Biometrics must be done in person at a VAC — factor this into your timeline.",
        ],
        "blocked_account_required": False,
        "notes": "Canada is one of the most immigration-friendly destinations. PGWP → Express Entry → PR is a well-worn path for international students.",
    },
    "australia": {
        "visa_type": "Student Visa — Subclass 500",
        "processing_time": "4–6 weeks (apply 3+ months before start)",
        "fee_usd": 650,
        "language": "English",
        "required_documents": [
            "Confirmation of Enrolment (CoE) from your Australian institution",
            "Valid passport",
            "Proof of financial capacity: tuition + AUD 21,041/year living costs",
            "English proficiency: IELTS 6.0-6.5+ (depending on institution)",
            "Overseas Student Health Cover (OSHC) insurance — mandatory",
            "Genuine Temporary Entrant (GTE) statement",
            "Academic transcripts",
            "Statement of Purpose / personal statement",
            "Health examination (if from certain countries)",
        ],
        "post_study_work": "Graduate Visa (Subclass 485): 2-6 years depending on location and qualification level",
        "interview_required": False,
        "embassy_tips": [
            "The GTE (Genuine Temporary Entrant) statement is critical — explain clearly why you're studying in Australia and your plans to return.",
            "OSHC insurance must be purchased before your visa application.",
            "Student Visa applications are processed fully online through ImmiAccount.",
            "A strong academic record significantly improves your Visa Risk Rating (VRR).",
        ],
        "blocked_account_required": False,
        "notes": "Regional study (outside major cities) can extend your post-study work rights by an additional 1-2 years.",
    },
    "singapore": {
        "visa_type": "Student Pass",
        "processing_time": "4–8 weeks",
        "fee_usd": 90,
        "language": "English",
        "required_documents": [
            "ICA Form 16 (In-Principle Approval letter from your university)",
            "Valid passport (6+ months validity)",
            "Recent passport photograph",
            "Academic transcripts",
            "English proficiency scores",
            "Financial proof (tuition + SGD 10,000-15,000 living)",
            "Medical insurance",
        ],
        "post_study_work": "Employment Pass or S-Pass after graduation; high chance if employed by Singapore company",
        "interview_required": False,
        "embassy_tips": [
            "Your university will initiate the Student Pass application on your behalf via SOLAR+.",
            "Once you receive the IPA letter, collect your Student Pass within 30 days of arrival.",
        ],
        "blocked_account_required": False,
        "notes": "Singapore is among the easiest countries for high-skilled international graduates to transition to permanent residency.",
    },
    "netherlands": {
        "visa_type": "MVV (Machtiging tot Voorlopig Verblijf) + Residence Permit",
        "processing_time": "2–4 weeks (university applies on your behalf via IND)",
        "fee_usd": 200,
        "language": "Dutch / English",
        "required_documents": [
            "Admission letter from Dutch university",
            "Valid passport",
            "Financial proof: €12,000+/year",
            "Health insurance",
            "Apostilled academic transcripts",
            "IELTS/TOEFL scores",
        ],
        "post_study_work": "Zoekjaar (Orientation Year Visa): 1 year to find work after graduation",
        "interview_required": False,
        "embassy_tips": [
            "Most Dutch universities handle MVV/residence permit sponsorship — contact your university's International Office immediately.",
            "The NL Scholarship (formerly Holland Scholarship) of €5,000 is worth applying for.",
        ],
        "blocked_account_required": False,
        "notes": "The Netherlands has high English proficiency — most programs are offered in English.",
    },
}


class VisaGuideAgent:
    """
    Agent 9: Country-specific student visa guidance.

    Uses embedded knowledge base (no LLM hallucination risk on legal info)
    + LLM for personalized document gap analysis only.
    """

    def __init__(self):
        self.agent_name = "VisaGuideAgent"

    async def guide(self, country: str, profile: dict = None) -> dict:
        """
        Return full visa guide for a country, personalized to the student profile.
        """
        country_key = country.lower().strip()
        # Alias resolution
        aliases = {
            "us": "usa", "united states": "usa", "america": "usa",
            "britain": "uk", "united kingdom": "uk", "england": "uk",
            "de": "germany", "deutschland": "germany",
            "ca": "canada",
            "au": "australia",
            "sg": "singapore",
            "nl": "netherlands", "holland": "netherlands",
        }
        country_key = aliases.get(country_key, country_key)

        if country_key not in VISA_KNOWLEDGE:
            supported = list(VISA_KNOWLEDGE.keys())
            return {
                "error": f"No visa guide for '{country}' yet.",
                "supported_countries": [c.title() for c in supported],
                "message": f"Currently supporting: {', '.join(c.title() for c in supported)}. More countries coming soon.",
            }

        info = VISA_KNOWLEDGE[country_key].copy()

        # Personalized gap analysis using profile
        gaps = self._check_profile_gaps(profile or {}, info)
        tips = info.pop("embassy_tips", [])

        # LLM personalized advice (optional, graceful fallback)
        personal_advice = ""
        if profile:
            try:
                personal_advice = await self._personalize(profile, country, info, gaps)
            except Exception as e:
                logger.warning(f"[{self.agent_name}] LLM personalization failed: {e}")
                personal_advice = f"Ensure you prepare all required documents well in advance for your {info.get('visa_type')} application."

        return {
            "country": country.title(),
            "visa_type": info.get("visa_type"),
            "processing_time": info.get("processing_time"),
            "fee_usd": info.get("fee_usd"),
            "required_documents": info.get("required_documents", []),
            "post_study_work": info.get("post_study_work"),
            "interview_required": info.get("interview_required", False),
            "blocked_account_required": info.get("blocked_account_required", False),
            "blocked_account_amount": info.get("blocked_account_amount"),
            "aps_required_countries": info.get("aps_required_countries", []),
            "embassy_tips": tips,
            "profile_gaps": gaps,
            "personalized_advice": personal_advice,
            "notes": info.get("notes", ""),
            "tool_used": "Embedded knowledge base (own) + LLM gap analysis",
        }

    def _check_profile_gaps(self, profile: dict, info: dict) -> list:
        """Check what the student is missing based on their profile."""
        gaps = []
        country_of_education = (profile.get("country_of_education") or "").strip()

        # APS check for Germany
        if info.get("aps_required_countries") and country_of_education:
            if country_of_education in info["aps_required_countries"]:
                gaps.append({
                    "item": "APS Certificate",
                    "urgency": "CRITICAL",
                    "note": f"As a student from {country_of_education}, you MUST obtain the APS certificate. Apply months in advance — it takes 4-8 weeks.",
                })

        # Language scores
        ielts = profile.get("ielts_score")
        toefl = profile.get("toefl_score")
        if not ielts and not toefl:
            gaps.append({
                "item": "English Proficiency Test",
                "urgency": "HIGH",
                "note": "No IELTS or TOEFL score detected in your profile. Most countries require this for a student visa.",
            })
        elif ielts and ielts < 6.0:
            gaps.append({
                "item": "IELTS Score",
                "urgency": "HIGH",
                "note": f"Your IELTS {ielts} may be below the 6.0-6.5 minimum required by most countries. Consider retaking.",
            })

        # Financial proof
        budget = profile.get("budget_usd_per_year", 0) or 0
        if budget < 10000:
            gaps.append({
                "item": "Financial Proof",
                "urgency": "HIGH",
                "note": "Visa officers require proof of financial capability. Ensure you have sufficient savings or sponsorship documented.",
            })

        # Blocked account for Germany
        if info.get("blocked_account_required"):
            required = info.get("blocked_account_amount", 11208)
            if budget < required:
                gaps.append({
                    "item": "Blocked Account (Sperrkonto)",
                    "urgency": "CRITICAL",
                    "note": f"Germany requires a blocked account of €{required:,}. Open one at Fintiba or Coracle immediately after acceptance — it takes 1-2 weeks.",
                })

        return gaps

    async def _personalize(self, profile: dict, country: str, info: dict, gaps: list) -> str:
        field = ", ".join(profile.get("target_fields") or ["your field"])
        origin = profile.get("country_of_education", "your country")
        prompt = f"""You are a student visa advisor. A student from {origin} applying to study {field} in {country} needs personalized advice.

Known gaps: {gaps}
Visa type: {info.get('visa_type')}
Processing time: {info.get('processing_time')}

Give 2-3 sentences of specific, actionable advice for this student. Be direct. No fluff."""

        response = await llm.complete(prompt, temperature=0.5, max_tokens=200)
        return response.content.strip()

    def list_countries(self) -> list:
        return [{"country": k.title(), "visa_type": v["visa_type"]} for k, v in VISA_KNOWLEDGE.items()]


visa_guide_agent = VisaGuideAgent()
