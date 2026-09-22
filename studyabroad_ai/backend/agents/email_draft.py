"""
StudyAbroad.AI — Agent 8: EmailDraftAgent
Drafts personalized outreach emails for:
  1. Faculty/Professor cold emails (research collaboration interest)
  2. Scholarship application cover letters
  3. Admission inquiry emails to university offices

Uses: LLM (Groq free / Gemini free) — replaces $100-200 email consultants.
"""
import logging

from backend.tools.llm import llm

logger = logging.getLogger(__name__)


class EmailDraftAgent:
    """
    Agent 8: Generates personalized professional emails for study abroad outreach.
    """

    def __init__(self):
        self.agent_name = "EmailDraftAgent"

    async def draft_professor_email(
        self,
        profile: dict,
        professor_name: str,
        professor_research: str,
        university_name: str,
        program_name: str,
    ) -> dict:
        """Generate a personalized professor outreach email."""
        logger.info(f"[{self.agent_name}] Drafting professor email to {professor_name} at {university_name}")

        student_name = profile.get("full_name", "[Your Name]")
        field = ", ".join(profile.get("target_fields") or ["Computer Science"])
        gpa = profile.get("gpa", "")
        gpa_scale = profile.get("gpa_scale", 4.0)
        publications = profile.get("publications", 0)
        research_exp = profile.get("research_experience", "")
        skills = ", ".join((profile.get("skills") or [])[:5])
        institution = profile.get("current_institution", "my current university")

        pub_line = ""
        if publications and publications > 0:
            pub_line = f"I have {publications} publication(s) in peer-reviewed venues."

        research_line = ""
        if research_exp:
            research_line = f"My research background includes: {research_exp}."

        prompt = f"""Write a professional, genuine, concise professor cold email for a graduate school applicant.

Student info:
- Name: {student_name}
- Current institution: {institution}
- GPA: {gpa}/{gpa_scale}
- Research background: {research_line or 'Solid coursework foundation'}
- Publications: {pub_line or 'Strong academic projects'}
- Skills: {skills}
- Target: {program_name} at {university_name}

Professor info:
- Name: {professor_name}
- Research area: {professor_research}

Requirements for the email:
1. Subject line (concise, specific, professional)
2. Opening that shows genuine interest in THEIR specific research (mention professor_research)
3. Brief intro: who the student is, institution, relevant background
4. One paragraph connecting student's specific experience to professor's work
5. Clear ask: express interest in joining their lab / research group
6. Professional sign-off

Keep under 300 words. Do NOT use generic phrases like "highly motivated" or "passionate learner."
Format: Subject: [subject]\n\n[email body]"""

        response = await llm.complete(prompt, temperature=0.7, max_tokens=500)
        content = response.content.strip()

        # Parse subject and body
        subject = ""
        body = content
        if content.startswith("Subject:"):
            lines = content.split("\n", 2)
            subject = lines[0].replace("Subject:", "").strip()
            body = "\n".join(lines[1:]).strip()

        return {
            "type": "professor_outreach",
            "subject": subject or f"Research Interest: {professor_research} — {student_name}",
            "body": body,
            "word_count": len(body.split()),
            "professor": professor_name,
            "university": university_name,
            "tool_used": response.tool_used,
        }

    async def draft_scholarship_cover_letter(
        self,
        profile: dict,
        scholarship_name: str,
        scholarship_country: str,
        word_limit: int = 500,
    ) -> dict:
        """Generate a scholarship application cover letter."""
        logger.info(f"[{self.agent_name}] Drafting cover letter for {scholarship_name}")

        field = ", ".join(profile.get("target_fields") or ["my field"])
        gpa = profile.get("gpa", "")
        gpa_scale = profile.get("gpa_scale", 4.0)
        target_degree = profile.get("target_degree", "master's")
        work_exp = profile.get("work_experience_years", 0)
        publications = profile.get("publications", 0)
        extra = ", ".join(profile.get("extracurriculars") or [])
        institution = profile.get("current_institution", "my university")

        prompt = f"""Write a compelling scholarship cover letter for:

Scholarship: {scholarship_name}
Country: {scholarship_country}
Student field: {field}
Degree level: {target_degree}
Current institution: {institution}
GPA: {gpa}/{gpa_scale}
Work experience: {work_exp} years
Publications: {publications}
Extracurriculars: {extra or 'Academic and community involvement'}

Requirements:
1. Strong opening statement — make it memorable
2. Academic excellence paragraph with specifics
3. Leadership and impact paragraph
4. Why this scholarship specifically (connection to {scholarship_country})
5. Future vision — how this scholarship enables your goals
6. Professional close

Word limit: {word_limit} words max.
Do NOT use clichés like "from a young age" or "passionate about."
Sound authentic, specific, and professional."""

        response = await llm.complete(prompt, temperature=0.72, max_tokens=min(word_limit * 2, 1000))
        body = response.content.strip()

        return {
            "type": "scholarship_cover_letter",
            "scholarship": scholarship_name,
            "country": scholarship_country,
            "body": body,
            "word_count": len(body.split()),
            "tool_used": response.tool_used,
        }

    async def draft_admission_inquiry(
        self,
        profile: dict,
        university_name: str,
        program_name: str,
        specific_question: str = "",
    ) -> dict:
        """Generate an admission inquiry email to a university admissions office."""
        logger.info(f"[{self.agent_name}] Drafting admission inquiry to {university_name}")

        field = ", ".join(profile.get("target_fields") or ["my field"])
        target_degree = profile.get("target_degree", "master's")
        question = specific_question or "admission requirements and application process"

        prompt = f"""Write a professional, concise admission inquiry email.

Student wants to ask about: {question}
Target: {program_name} at {university_name}
Field: {field}
Degree level: {target_degree}

Requirements:
- Professional subject line
- Brief intro (2-3 sentences max)
- One clear, specific question
- Professional close
- Under 150 words total

Format: Subject: [subject]\n\n[email body]"""

        response = await llm.complete(prompt, temperature=0.6, max_tokens=300)
        content = response.content.strip()

        subject = ""
        body = content
        if content.startswith("Subject:"):
            lines = content.split("\n", 2)
            subject = lines[0].replace("Subject:", "").strip()
            body = "\n".join(lines[1:]).strip()

        return {
            "type": "admission_inquiry",
            "subject": subject or f"Inquiry: {program_name} Application",
            "body": body,
            "word_count": len(body.split()),
            "university": university_name,
            "tool_used": response.tool_used,
        }


email_draft_agent = EmailDraftAgent()
