"""
StudyAbroad.AI — Agent 11: CityLifeAgent
Returns cost-of-living breakdown and lifestyle info for top study destinations.

Data source: Embedded knowledge base updated from Numbeo/Expatistan/official sources.
LLM used only for summarization — core data is deterministic/reliable.
"""
import logging

from backend.tools.llm import llm

logger = logging.getLogger(__name__)


# ─── City Cost-of-Living Database ─────────────────────────────────────────────
# All costs in USD/month unless noted. Updated 2024.

CITY_DATA = {
    "munich": {
        "city": "Munich", "country": "Germany", "currency": "EUR",
        "costs": {
            "rent_shared_room": 700, "rent_studio": 1200,
            "food_groceries_monthly": 200, "eating_out_per_meal": 12,
            "public_transport_monthly": 57,  # Semester ticket subsidized
            "health_insurance_monthly": 120,
            "phone_plan_monthly": 15,
            "entertainment_monthly": 100,
        },
        "total_monthly_min": 950, "total_monthly_avg": 1300,
        "blocked_account_required": True, "blocked_account_eur": 11208,
        "part_time_work": "20 hrs/week allowed during term; full-time during breaks",
        "language": "German (English widely spoken in tech)",
        "student_life": "Vibrant beer garden culture, Oktoberfest, strong engineering/CS scene, Englischer Garten.",
        "job_market": "Excellent — BMW, Siemens, Allianz, MAN, and Germany's startup hub.",
        "safety": "Very safe. Low crime, excellent public transport.",
        "climate": "Cold winters (-5°C to 0°C), warm summers (25°C). 4 seasons.",
        "neighborhoods": ["Maxvorstadt (student hub)", "Schwabing", "Giesing (affordable)"],
        "tips": [
            "Get the Deutschlandticket (€49/month) for unlimited public transport across Germany.",
            "Mensa (university cafeteria) meals cost €1.80-€4.00 — eat there daily.",
            "Anmeldung (resident registration) at Bürgerbüro is legally required within 2 weeks of arrival.",
            "StuCard = student ID = discounts on museums, theatre, and transport.",
        ],
    },
    "berlin": {
        "city": "Berlin", "country": "Germany", "currency": "EUR",
        "costs": {
            "rent_shared_room": 600, "rent_studio": 1000,
            "food_groceries_monthly": 180, "eating_out_per_meal": 10,
            "public_transport_monthly": 86,
            "health_insurance_monthly": 120,
            "phone_plan_monthly": 15,
            "entertainment_monthly": 120,
        },
        "total_monthly_min": 850, "total_monthly_avg": 1150,
        "blocked_account_required": True, "blocked_account_eur": 11208,
        "part_time_work": "20 hrs/week during term",
        "language": "German (very English-friendly in Berlin)",
        "student_life": "Multicultural, arts, nightlife, affordable lifestyle compared to other European capitals.",
        "job_market": "Strong startup ecosystem, SoundCloud, Zalando, Delivery Hero all HQ'd here.",
        "safety": "Generally safe; some districts are louder/more hectic.",
        "climate": "Similar to Munich. Cold winters, warm summers.",
        "neighborhoods": ["Prenzlauer Berg", "Kreuzberg", "Neukölln (affordable)"],
        "tips": [
            "Berlin is much more affordable than Munich for rent.",
            "ALDI, Lidl, and Netto supermarkets are excellent for budget grocery shopping.",
            "Kiezspaziergang (neighborhood walking) is a great free activity.",
        ],
    },
    "toronto": {
        "city": "Toronto", "country": "Canada", "currency": "CAD",
        "costs": {
            "rent_shared_room": 950, "rent_studio": 1800,
            "food_groceries_monthly": 350, "eating_out_per_meal": 18,
            "public_transport_monthly": 156,
            "health_insurance_monthly": 0,  # OHIP after 3 months wait
            "phone_plan_monthly": 40,
            "entertainment_monthly": 150,
        },
        "total_monthly_min": 1600, "total_monthly_avg": 2200,
        "blocked_account_required": False,
        "part_time_work": "20 hrs/week on campus; unlimited off-campus from 2024",
        "language": "English / French",
        "student_life": "World-class multicultural city, CN Tower, Niagara nearby, vibrant Asian food scene.",
        "job_market": "MaRS Discovery District, RBC, TD Bank, Shopify, OpenText — strong CS market.",
        "safety": "Safe city. Exercise caution in Downtown East after dark.",
        "climate": "Cold harsh winters (-15°C), hot summers (30°C). Snow from Nov-Mar.",
        "neighborhoods": ["Annex (UofT)", "Kensington Market", "Scarborough (affordable)"],
        "tips": [
            "Apply for OHIP (Ontario health insurance) immediately on arrival — 3-month wait applies.",
            "TTC (transit) is expensive. Presto card gets you discounts.",
            "Canada's immigration pathway (PGWP → Express Entry) is one of the best in the world.",
        ],
    },
    "london": {
        "city": "London", "country": "UK", "currency": "GBP",
        "costs": {
            "rent_shared_room": 1000, "rent_studio": 2000,
            "food_groceries_monthly": 300, "eating_out_per_meal": 18,
            "public_transport_monthly": 180,
            "health_insurance_monthly": 0,  # NHS via IHS surcharge paid upfront
            "phone_plan_monthly": 20,
            "entertainment_monthly": 200,
        },
        "total_monthly_min": 1700, "total_monthly_avg": 2400,
        "blocked_account_required": False,
        "part_time_work": "20 hrs/week during term; full-time during official breaks",
        "language": "English",
        "student_life": "World-class museums (free), global culture, theatre, finance hub, historic landmarks.",
        "job_market": "Finance, consulting, tech — Goldman Sachs, DeepMind, King all based here.",
        "safety": "Generally safe; Zone 1-2 busy and well-patrolled.",
        "climate": "Mild winters (2-8°C), warm summers (18-25°C). Frequently rainy.",
        "neighborhoods": ["Stratford (affordable)", "Elephant & Castle", "Wembley", "Zone 3-4 for budget"],
        "tips": [
            "18+ Oyster card gives you 30% discount on TfL fares — get it immediately.",
            "Tesco/Lidl/Aldi for groceries. Avoid supermarkets near tourist areas.",
            "The UK Graduate Route Visa gives you 2 years post-study work rights — a major advantage.",
        ],
    },
    "melbourne": {
        "city": "Melbourne", "country": "Australia", "currency": "AUD",
        "costs": {
            "rent_shared_room": 800, "rent_studio": 1500,
            "food_groceries_monthly": 300, "eating_out_per_meal": 20,
            "public_transport_monthly": 100,
            "health_insurance_monthly": 55,  # OSHC
            "phone_plan_monthly": 30,
            "entertainment_monthly": 150,
        },
        "total_monthly_min": 1400, "total_monthly_avg": 2000,
        "blocked_account_required": False,
        "part_time_work": "48 hrs per fortnight (24 hrs/week) since 2023",
        "language": "English",
        "student_life": "World's most liveable city (perennially top-ranked), coffee culture, beaches, sports.",
        "job_market": "Strong in finance, healthcare tech, and data science. NAB, ANZ, Telstra based here.",
        "safety": "Very safe. Australia has very low violent crime rates.",
        "climate": "Warm summers (28°C+), mild winters (10-15°C). Famous for 4 seasons in one day.",
        "neighborhoods": ["Carlton (Uni of Melbourne)", "Brunswick", "Footscray (affordable)"],
        "tips": [
            "Myki card for public transport — always keep it topped up.",
            "Australia's minimum wage is AUD $23.23/hr — part-time work is very rewarding.",
            "Check Gumtree.com.au for affordable student housing.",
        ],
    },
    "singapore": {
        "city": "Singapore", "country": "Singapore", "currency": "SGD",
        "costs": {
            "rent_shared_room": 700, "rent_studio": 1800,
            "food_groceries_monthly": 250, "eating_out_per_meal": 5,  # Hawker centres
            "public_transport_monthly": 100,
            "health_insurance_monthly": 50,
            "phone_plan_monthly": 20,
            "entertainment_monthly": 100,
        },
        "total_monthly_min": 1100, "total_monthly_avg": 1600,
        "blocked_account_required": False,
        "part_time_work": "16 hrs/week during term",
        "language": "English (official), Mandarin, Malay, Tamil",
        "student_life": "Safe, clean, multicultural hub of SE Asia. Gardens by the Bay, hawker food, shopping.",
        "job_market": "Financial hub of Asia, Google/Facebook/Apple have major Asian HQs here.",
        "safety": "One of the safest cities in the world. Near-zero crime.",
        "climate": "Tropical. Hot and humid year-round (28-32°C). Rain anytime.",
        "neighborhoods": ["Kent Ridge (NUS)", "Clementi", "Jurong (affordable)"],
        "tips": [
            "Hawker centres are your best friend — full meals for SGD $3-6.",
            "EZ-Link card for all public transport — MRT is world-class and cheap.",
            "Singapore → PR pathway is fast for skilled graduates (2-4 years).",
        ],
    },
    "amsterdam": {
        "city": "Amsterdam", "country": "Netherlands", "currency": "EUR",
        "costs": {
            "rent_shared_room": 800, "rent_studio": 1400,
            "food_groceries_monthly": 200, "eating_out_per_meal": 14,
            "public_transport_monthly": 100,
            "health_insurance_monthly": 130,
            "phone_plan_monthly": 20,
            "entertainment_monthly": 150,
        },
        "total_monthly_min": 1200, "total_monthly_avg": 1700,
        "blocked_account_required": False,
        "part_time_work": "16 hrs/week allowed",
        "language": "Dutch (English very widely spoken)",
        "student_life": "Bicycles, canals, world-class museums (Van Gogh, Rijksmuseum), vibrant international scene.",
        "job_market": "Booking.com, ASML, ING, Philips. Strong fintech and data engineering market.",
        "safety": "Very safe. Petty theft near tourist areas.",
        "climate": "Mild and rainy. Winters 2-7°C, summers 18-22°C.",
        "neighborhoods": ["Oud-West", "De Pijp", "Oost (affordable)"],
        "tips": [
            "Buy a second-hand bicycle (€80-150) — it's the primary mode of transport.",
            "Housing is very tight. Register on housing platforms months before arrival.",
            "OV-chipkaart for all public transit across the Netherlands.",
        ],
    },
}

# Normalize keys with aliases
CITY_ALIASES = {
    "usa": "new_york", "us": "new_york",
    "germany": "munich", "de": "munich",
    "uk": "london", "britain": "london", "england": "london",
    "canada": "toronto", "ca": "toronto",
    "australia": "melbourne", "au": "melbourne",
    "sg": "singapore",
    "netherlands": "amsterdam", "nl": "amsterdam", "holland": "amsterdam",
    "delft": "amsterdam",
}


class CityLifeAgent:
    """
    Agent 11: Comprehensive cost-of-living and lifestyle guide for study destinations.
    """

    def __init__(self):
        self.agent_name = "CityLifeAgent"

    async def get_city_info(self, city: str, profile: dict = None) -> dict:
        """Return cost-of-living and lifestyle breakdown for a city."""
        logger.info(f"[{self.agent_name}] Getting city info for {city}")

        key = city.lower().strip().replace(" ", "_")
        key = CITY_ALIASES.get(key, key)

        if key not in CITY_DATA:
            available = list(CITY_DATA.keys())
            return {
                "error": f"No data for '{city}' yet.",
                "available_cities": [d["city"] for d in CITY_DATA.values()],
                "message": f"Currently covering: {', '.join(d['city'] for d in CITY_DATA.values())}",
            }

        data = CITY_DATA[key].copy()
        budget = profile.get("budget_usd_per_year", 0) // 12 if profile else 0

        # Budget compatibility check
        budget_status = "unknown"
        if budget:
            if budget >= data["total_monthly_avg"]:
                budget_status = "comfortable"
            elif budget >= data["total_monthly_min"]:
                budget_status = "tight_but_manageable"
            else:
                budget_status = "insufficient"

        # LLM lifestyle summary
        llm_summary = ""
        try:
            field = ", ".join((profile or {}).get("target_fields") or ["your field"])
            prompt = f"""Summarize in 3 sentences what it's like to be a {field} student in {data['city']}, {data['country']}.
Cover: social life, career opportunities, and 1 practical money-saving tip.
Be specific and engaging. No generic statements."""
            resp = await llm.complete(prompt, temperature=0.7, max_tokens=150)
            llm_summary = resp.content.strip()
        except Exception as e:
            logger.warning(f"[{self.agent_name}] LLM summary failed: {e}")

        return {
            "city": data["city"],
            "country": data["country"],
            "currency": data["currency"],
            "monthly_costs": data["costs"],
            "total_monthly_min_usd": data["total_monthly_min"],
            "total_monthly_avg_usd": data["total_monthly_avg"],
            "annual_estimated_usd": data["total_monthly_avg"] * 12,
            "budget_compatibility": budget_status,
            "part_time_work": data["part_time_work"],
            "language": data["language"],
            "safety": data["safety"],
            "climate": data["climate"],
            "student_life": data["student_life"],
            "job_market": data["job_market"],
            "neighborhoods": data["neighborhoods"],
            "tips": data["tips"],
            "blocked_account_required": data.get("blocked_account_required", False),
            "llm_summary": llm_summary,
            "tool_used": "Embedded cost-of-living database (own, free) + LLM summary",
        }

    async def compare_cities(self, cities: list, profile: dict = None) -> dict:
        """Compare cost-of-living across multiple cities."""
        results = {}
        for city in cities[:4]:  # max 4 cities
            info = await self.get_city_info(city, profile)
            if "error" not in info:
                results[info["city"]] = {
                    "country": info["country"],
                    "monthly_min": info["total_monthly_min_usd"],
                    "monthly_avg": info["total_monthly_avg_usd"],
                    "annual": info["annual_estimated_usd"],
                    "language": info["language"],
                    "safety": info["safety"],
                    "budget_ok": info.get("budget_compatibility") in ["comfortable", "tight_but_manageable"],
                }

        # Sort by monthly average cost
        sorted_cities = sorted(results.items(), key=lambda x: x[1]["monthly_avg"])
        return {
            "comparison": dict(sorted_cities),
            "cheapest_city": sorted_cities[0][0] if sorted_cities else None,
            "tool_used": "Embedded cost-of-living database (own, free)",
        }


city_life_agent = CityLifeAgent()
