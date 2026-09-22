"""
StudyAbroad.AI — Agent 12: CareerROIAgent
Calculates financial return on investment for study abroad decisions.

Data: Embedded salary + employment data from LinkedIn Salary Insights,
      Glassdoor, PayScale, QS Graduate Employability Rankings (2024).

LLM used only for narrative summary — core ROI math is deterministic.
"""
import logging
from typing import Optional

from backend.tools.llm import llm

logger = logging.getLogger(__name__)


# ─── Salary & Employment Database ─────────────────────────────────────────────
# All salaries in USD/year. Graduate starting salaries (0-2 years experience).
# Source: LinkedIn Salary, Glassdoor, NACE, Prospects.ac.uk — 2024.

SALARY_DATA = {
    "computer_science": {
        "USA": {"avg": 110000, "range": "90k-140k", "top_companies": ["Google", "Meta", "Microsoft", "Amazon"]},
        "UK": {"avg": 58000, "range": "45k-75k", "top_companies": ["DeepMind", "ARM", "Revolut", "Wise"]},
        "Germany": {"avg": 65000, "range": "52k-80k", "top_companies": ["SAP", "Siemens", "BMW Tech", "Zalando"]},
        "Canada": {"avg": 75000, "range": "60k-95k", "top_companies": ["Shopify", "RBC", "TD", "Wealthsimple"]},
        "Australia": {"avg": 80000, "range": "65k-100k", "top_companies": ["Atlassian", "Canva", "Telstra"]},
        "Singapore": {"avg": 60000, "range": "48k-80k", "top_companies": ["Sea Group", "Grab", "DBS", "Google APAC"]},
        "Netherlands": {"avg": 60000, "range": "50k-78k", "top_companies": ["ASML", "Booking.com", "Adyen", "Philips"]},
        "Switzerland": {"avg": 95000, "range": "80k-120k", "top_companies": ["Google Zurich", "UBS", "Roche", "ABB"]},
    },
    "ai_ml": {
        "USA": {"avg": 130000, "range": "105k-180k", "top_companies": ["OpenAI", "Google DeepMind", "Anthropic", "NVIDIA"]},
        "UK": {"avg": 75000, "range": "60k-100k", "top_companies": ["DeepMind", "BenevolentAI", "Mind Foundry"]},
        "Germany": {"avg": 72000, "range": "58k-90k", "top_companies": ["BMW AI", "SAP AI", "Fraunhofer"]},
        "Canada": {"avg": 85000, "range": "70k-110k", "top_companies": ["Cohere", "Element AI", "Vector Institute affiliates"]},
        "Singapore": {"avg": 70000, "range": "55k-90k", "top_companies": ["Sea AI Lab", "Agency for Science", "DBS AI"]},
        "Netherlands": {"avg": 65000, "range": "52k-82k", "top_companies": ["ASML", "Booking.com ML", "ING Analytics"]},
        "Switzerland": {"avg": 105000, "range": "88k-135k", "top_companies": ["Google Brain Zurich", "EPFL spin-offs"]},
    },
    "data_science": {
        "USA": {"avg": 105000, "range": "85k-135k", "top_companies": ["Facebook", "Airbnb", "Lyft", "Bloomberg"]},
        "UK": {"avg": 55000, "range": "42k-72k", "top_companies": ["HSBC", "Barclays Analytics", "Sky", "BT"]},
        "Germany": {"avg": 62000, "range": "50k-78k", "top_companies": ["BMW", "Deutsche Bank", "Otto Group"]},
        "Canada": {"avg": 72000, "range": "58k-92k", "top_companies": ["Scotiabank", "CIBC", "Rogers", "Shopify"]},
        "Australia": {"avg": 78000, "range": "62k-98k", "top_companies": ["NAB", "ANZ", "Commonwealth Bank"]},
        "Singapore": {"avg": 58000, "range": "46k-76k", "top_companies": ["DBS", "OCBC", "Grab Data"]},
    },
    "electrical_engineering": {
        "USA": {"avg": 95000, "range": "78k-120k", "top_companies": ["Intel", "Qualcomm", "Texas Instruments", "Boeing"]},
        "Germany": {"avg": 68000, "range": "55k-85k", "top_companies": ["Siemens", "Bosch", "Infineon", "Continental"]},
        "Netherlands": {"avg": 62000, "range": "50k-78k", "top_companies": ["ASML", "NXP Semiconductors", "Philips"]},
        "Switzerland": {"avg": 90000, "range": "75k-115k", "top_companies": ["ABB", "Schindler", "Logitech", "STMicro"]},
    },
    "mechanical_engineering": {
        "USA": {"avg": 85000, "range": "70k-108k", "top_companies": ["Boeing", "SpaceX", "Caterpillar", "John Deere"]},
        "Germany": {"avg": 64000, "range": "52k-82k", "top_companies": ["BMW", "Volkswagen", "Daimler", "Rolls-Royce"]},
        "UK": {"avg": 48000, "range": "38k-62k", "top_companies": ["Rolls-Royce", "BAE Systems", "Airbus UK"]},
    },
    "business_mba": {
        "USA": {"avg": 120000, "range": "95k-180k", "top_companies": ["McKinsey", "Goldman Sachs", "Amazon", "Apple"]},
        "UK": {"avg": 70000, "range": "55k-95k", "top_companies": ["KPMG", "PwC", "Barclays", "HSBC"]},
        "Germany": {"avg": 65000, "range": "52k-82k", "top_companies": ["McKinsey Germany", "Deutsche Bank", "Allianz"]},
        "Singapore": {"avg": 65000, "range": "52k-85k", "top_companies": ["Goldman Sachs Asia", "Temasek", "GIC"]},
    },
    "biotechnology": {
        "USA": {"avg": 82000, "range": "65k-110k", "top_companies": ["Genentech", "Moderna", "Pfizer", "J&J"]},
        "Switzerland": {"avg": 88000, "range": "72k-115k", "top_companies": ["Novartis", "Roche", "Lonza", "Syngenta"]},
        "Germany": {"avg": 60000, "range": "50k-78k", "top_companies": ["Bayer", "BASF", "Merck KGaA"]},
        "UK": {"avg": 52000, "range": "42k-68k", "top_companies": ["AstraZeneca", "GSK", "MRC Labs"]},
    },
}

# Normalize field names
FIELD_ALIASES = {
    "cs": "computer_science", "computer science": "computer_science",
    "software engineering": "computer_science", "software": "computer_science",
    "ml": "ai_ml", "machine learning": "ai_ml", "artificial intelligence": "ai_ml", "ai": "ai_ml",
    "data": "data_science", "analytics": "data_science",
    "ee": "electrical_engineering", "electronics": "electrical_engineering",
    "mechanical": "mechanical_engineering", "mech eng": "mechanical_engineering",
    "mba": "business_mba", "business": "business_mba", "finance": "business_mba",
    "biotech": "biotechnology", "biology": "biotechnology", "pharma": "biotechnology",
}


class CareerROIAgent:
    """
    Agent 12: Calculates ROI of study abroad investment.

    Returns:
      1. Average starting salary by field + country
      2. Tuition payback period
      3. 5-year and 10-year net financial gain vs staying home
      4. Top hiring companies in that field+country
      5. LLM career narrative
    """

    def __init__(self):
        self.agent_name = "CareerROIAgent"

    async def calculate(
        self,
        profile: dict,
        university_name: str,
        country: str,
        annual_tuition_usd: int,
        program_duration_years: float = 2.0,
        home_country_avg_salary_usd: Optional[int] = None,
    ) -> dict:
        """Calculate full career ROI for a study abroad decision."""
        logger.info(f"[{self.agent_name}] Calculating ROI for {university_name}, {country}")

        # Resolve field
        fields = profile.get("target_fields") or ["Computer Science"]
        primary_field = fields[0].lower().strip() if fields else "computer_science"
        field_key = FIELD_ALIASES.get(primary_field, primary_field.replace(" ", "_"))

        # Get salary data
        field_data = SALARY_DATA.get(field_key)
        country_salary = None
        if field_data:
            country_salary = field_data.get(country) or field_data.get(country.title())

        # Fallback global estimate
        if not country_salary:
            country_salary = {"avg": 55000, "range": "40k-75k", "top_companies": ["Various global companies"]}
            field_key = "general"

        avg_salary = country_salary["avg"]
        home_salary = home_country_avg_salary_usd or self._estimate_home_salary(profile)

        # ROI Calculations
        total_study_cost = (annual_tuition_usd + self._get_living_cost(country)) * program_duration_years
        salary_premium_annual = max(0, avg_salary - home_salary)
        payback_years = total_study_cost / salary_premium_annual if salary_premium_annual > 0 else 999
        net_gain_5yr = (salary_premium_annual * 5) - total_study_cost
        net_gain_10yr = (salary_premium_annual * 10) - total_study_cost
        roi_pct_5yr = (net_gain_5yr / total_study_cost * 100) if total_study_cost > 0 else 0
        roi_pct_10yr = (net_gain_10yr / total_study_cost * 100) if total_study_cost > 0 else 0

        # LLM career narrative
        narrative = ""
        try:
            narrative = await self._generate_narrative(
                profile, country, field_key, avg_salary, total_study_cost, payback_years
            )
        except Exception as e:
            logger.warning(f"[{self.agent_name}] LLM narrative failed: {e}")
            narrative = (
                f"Studying {', '.join(fields)} at {university_name} in {country} is projected to yield "
                f"an average starting salary of ${avg_salary:,}/year. "
                f"With a total investment of ${total_study_cost:,.0f}, the payback period is "
                f"approximately {payback_years:.1f} years."
            )

        return {
            "field": field_key.replace("_", " ").title(),
            "country": country,
            "university": university_name,
            "avg_starting_salary_usd": avg_salary,
            "salary_range": country_salary["range"],
            "top_hiring_companies": country_salary.get("top_companies", [])[:5],
            "total_study_cost_usd": round(total_study_cost),
            "estimated_home_country_salary_usd": home_salary,
            "salary_premium_annual_usd": salary_premium_annual,
            "payback_period_years": round(payback_years, 1) if payback_years < 50 else "N/A (consider full scholarship)",
            "net_financial_gain": {
                "5_years": round(net_gain_5yr),
                "10_years": round(net_gain_10yr),
            },
            "roi_percentage": {
                "5_years": round(roi_pct_5yr, 1),
                "10_years": round(roi_pct_10yr, 1),
            },
            "verdict": self._get_verdict(roi_pct_5yr, payback_years),
            "career_narrative": narrative,
            "tool_used": "Embedded salary database (own) + financial modeling + LLM narrative",
        }

    def _estimate_home_salary(self, profile: dict) -> int:
        """Rough home country salary estimate based on country of education."""
        country = (profile.get("country_of_education") or "").lower()
        estimates = {
            "bangladesh": 8000, "india": 12000, "pakistan": 9000,
            "nigeria": 7000, "ghana": 8000, "kenya": 9000,
            "china": 18000, "vietnam": 10000, "indonesia": 10000,
            "brazil": 15000, "mexico": 14000, "turkey": 12000,
            "iran": 8000, "egypt": 9000, "ethiopia": 6000,
        }
        return estimates.get(country, 15000)

    def _get_living_cost(self, country: str) -> int:
        """Annual living cost estimate by country."""
        costs = {
            "USA": 24000, "UK": 20000, "Germany": 15000, "Canada": 18000,
            "Australia": 20000, "Singapore": 18000, "Netherlands": 18000,
            "Switzerland": 25000, "Sweden": 17000, "Japan": 16000,
        }
        return costs.get(country, 18000)

    def _get_verdict(self, roi_5yr: float, payback_years: float) -> str:
        if payback_years < 2 or roi_5yr > 150:
            return "Excellent ROI — strong financial case for this investment"
        elif payback_years < 4 or roi_5yr > 50:
            return "Good ROI — solid financial investment with reasonable payback"
        elif payback_years < 7 or roi_5yr > 0:
            return "Moderate ROI — worthwhile for career prospects but plan finances carefully"
        else:
            return "Low ROI financially — consider scholarships or lower-tuition options (Germany, ETH Zurich)"

    async def _generate_narrative(self, profile, country, field, salary, cost, payback):
        fields = ", ".join(profile.get("target_fields") or [field])
        origin = profile.get("country_of_education", "your home country")
        prompt = f"""In 2-3 sentences, describe the career prospects and financial ROI for a student from {origin} 
who studies {fields} in {country}. Average starting salary: ${salary:,}. Total study investment: ${cost:,.0f}. 
Payback period: {payback:.1f} years. Be specific and encouraging but realistic."""
        resp = await llm.complete(prompt, temperature=0.65, max_tokens=150)
        return resp.content.strip()


career_roi_agent = CareerROIAgent()
