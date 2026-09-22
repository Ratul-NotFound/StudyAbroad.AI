"""
StudyAbroad.AI — Agent 10: InterviewCoachAgent
Generates personalized mock interview questions + model answers.
Scores user's practice answers with LLM.

For: University interviews, scholarship interviews, visa interviews.
Uses: LLM (Groq free / Gemini free) — replaces $150-300/hr interview coaches.
"""
import logging

from backend.tools.llm import llm

logger = logging.getLogger(__name__)


QUESTION_CATEGORIES = {
    "motivation": [
        "Why do you want to pursue a {degree} in {field}?",
        "Why did you choose {university}?",
        "Where do you see yourself in 10 years?",
        "What specific aspects of the {program} program interest you most?",
    ],
    "academic": [
        "Walk me through your undergraduate research experience.",
        "What was your most challenging academic project and how did you handle it?",
        "What are your most significant academic achievements?",
        "How does your academic background prepare you for this program?",
    ],
    "research": [
        "Describe a research problem you worked on and your methodology.",
        "What research areas do you want to explore in this program?",
        "How do you approach a research problem you know nothing about?",
        "Which faculty members' research aligns with your interests and why?",
    ],
    "career": [
        "How will this degree advance your career goals?",
        "What do you plan to do after completing your {degree}?",
        "Describe your professional experience and how it relates to this program.",
        "What impact do you want to make in your field?",
    ],
    "personal": [
        "Tell me about yourself in 2 minutes.",
        "What are your strengths and weaknesses as a student?",
        "Describe a failure and what you learned from it.",
        "How do you handle stress and tight deadlines?",
    ],
}


class InterviewCoachAgent:
    """
    Agent 10: Prepares students for admission and scholarship interviews.

    Generates:
      1. Personalized question set based on profile + university
      2. Model answer frameworks (STAR method where applicable)
      3. Practice answer scoring with feedback
    """

    def __init__(self):
        self.agent_name = "InterviewCoachAgent"

    async def generate_questions(
        self,
        profile: dict,
        university_name: str,
        program_name: str,
        interview_type: str = "admission",  # admission | scholarship | visa
        num_questions: int = 10,
    ) -> dict:
        """Generate personalized interview questions with model answers."""
        logger.info(f"[{self.agent_name}] Generating {interview_type} interview questions")

        field = ", ".join(profile.get("target_fields") or ["your field"])
        degree = profile.get("target_degree", "master's")
        research = profile.get("research_experience", "")
        work_exp = profile.get("work_experience_years", 0)
        publications = profile.get("publications", 0)

        context = f"""
Student profile:
- Degree sought: {degree} in {field}
- Target: {program_name} at {university_name}
- Research experience: {research or 'Coursework-based'}
- Work experience: {work_exp} years
- Publications: {publications}
- Skills: {', '.join((profile.get('skills') or [])[:6])}
- GPA: {profile.get('gpa', 'N/A')}/{profile.get('gpa_scale', 4.0)}
"""

        if interview_type == "visa":
            prompt = self._visa_interview_prompt(profile, university_name)
        elif interview_type == "scholarship":
            prompt = self._scholarship_interview_prompt(profile, university_name, program_name, context)
        else:
            prompt = self._admission_interview_prompt(profile, university_name, program_name, context, num_questions)

        response = await llm.complete(prompt, temperature=0.7, max_tokens=1200)
        raw = response.content.strip()

        # Parse questions from LLM output
        questions = self._parse_questions(raw, profile, university_name, program_name, degree, field)

        return {
            "interview_type": interview_type,
            "university": university_name,
            "program": program_name,
            "questions": questions,
            "total_questions": len(questions),
            "preparation_tips": self._get_prep_tips(interview_type),
            "tool_used": response.tool_used,
        }

    async def score_answer(
        self,
        question: str,
        answer: str,
        profile: dict,
        university_name: str,
    ) -> dict:
        """Score a user's practice answer and give feedback."""
        field = ", ".join(profile.get("target_fields") or ["your field"])

        prompt = f"""You are an expert interview coach evaluating a student's answer to this interview question.

Question: "{question}"
Student's answer: "{answer}"
Context: Applying for {profile.get('target_degree', 'master')} in {field} at {university_name}

Evaluate the answer on a scale of 1-10 for:
1. Relevance (is the answer on-topic?)
2. Specificity (concrete examples vs vague claims)
3. Structure (logical flow, STAR method where applicable)
4. Confidence (assertive vs uncertain tone)

Then provide:
- Overall score: [X/10]
- Top strength of this answer (1 sentence)
- Top improvement suggestion (1 sentence)
- A stronger version of this answer (2-3 sentences)

Be direct and constructive. No excessive praise."""

        response = await llm.complete(prompt, temperature=0.6, max_tokens=500)
        content = response.content.strip()

        # Extract overall score
        score = 7  # default
        for line in content.split("\n"):
            if "overall score" in line.lower():
                try:
                    score = int("".join(filter(str.isdigit, line.split(":")[-1][:3])))
                    break
                except:
                    pass

        return {
            "question": question,
            "your_answer": answer,
            "overall_score": min(10, max(1, score)),
            "full_feedback": content,
            "tool_used": response.tool_used,
        }

    def _admission_interview_prompt(self, profile, university, program, context, n):
        return f"""You are a senior admissions coach at a top global university.
{context}

Generate {n} highly specific interview questions for this student's admission interview at {program} ({university}).
Mix categories: 3 motivation, 2 academic, 2 research, 2 career, 1 personal.

For each question:
- Write the Question
- Write a Model Answer Framework in 2-3 sentences (use STAR method where applicable)

Format exactly like this for each:
Q: [question text]
A: [model answer framework]

Be specific to the student's profile. Do not use generic questions that apply to everyone."""

    def _scholarship_interview_prompt(self, profile, university, program, context):
        return f"""You are a scholarship interview coach.
{context}

Generate 8 scholarship interview questions specific to a student applying to {program} at {university}.
Focus on: leadership, impact, why this scholarship, future vision, academic excellence.

For each:
Q: [question]
A: [model answer — 2-3 sentences using their profile details]"""

    def _visa_interview_prompt(self, profile, university):
        country = (profile.get("target_countries") or ["USA"])[0]
        return f"""Generate 6 common student visa interview questions for a student applying to {university} in {country}.
Focus on: study plans, funding, ties to home country, return after studies, knowledge of program.

For each:
Q: [question]
A: [ideal answer — 1-2 sentences, confident and direct]"""

    def _parse_questions(self, raw, profile, university, program, degree, field):
        """Parse Q/A pairs from LLM output."""
        questions = []
        current_q = None
        for line in raw.split("\n"):
            line = line.strip()
            if line.startswith("Q:"):
                current_q = line[2:].strip()
            elif line.startswith("A:") and current_q:
                answer = line[2:].strip()
                questions.append({
                    "question": current_q.format(
                        degree=degree, field=field,
                        university=university, program=program
                    ),
                    "model_answer": answer,
                })
                current_q = None
        return questions

    def _get_prep_tips(self, interview_type: str) -> list:
        tips = {
            "admission": [
                "Research 2-3 specific faculty members and their recent papers before the interview.",
                "Prepare a 2-minute 'tell me about yourself' that highlights research + career direction.",
                "Know your SOP well — interviewers often ask follow-up questions based on it.",
                "Prepare 2-3 questions to ask the interviewer — it shows genuine interest.",
            ],
            "scholarship": [
                "Show genuine connection to the scholarship's mission (DAAD = Germany ties, Fulbright = cultural exchange).",
                "Quantify your impact: 'I trained 40 students' > 'I helped my community'.",
                "Be ready to discuss your 5-year and 10-year goals with specifics.",
            ],
            "visa": [
                "Be honest and consistent — visa officers compare your answers to your documents.",
                "Know your I-20/CAS/acceptance letter details (program, start date, cost).",
                "Clearly state your plan to return home after graduation.",
                "Dress formally and arrive 30 minutes early.",
            ],
        }
        return tips.get(interview_type, tips["admission"])


interview_coach_agent = InterviewCoachAgent()
