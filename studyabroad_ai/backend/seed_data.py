"""
StudyAbroad.AI — Seed Database & Vector Store Initializer
Provides high-quality initial data for top global universities, programs, and scholarships.
Ensures the system produces rich, accurate recommendations out of the box.
"""
import logging
from backend.tools.vector_store import vector_store

logger = logging.getLogger(__name__)

INITIAL_UNIVERSITIES = [
    {
        "id": "uni_mit",
        "name": "Massachusetts Institute of Technology (MIT)",
        "short_name": "MIT",
        "country": "USA",
        "city": "Cambridge, MA",
        "world_rank": 1,
        "acceptance_rate": 0.04,
        "avg_tuition_usd": 59750,
        "min_gpa": 3.8,
        "min_ielts": 7.5,
        "min_toefl": 100,
        "min_gre_quant": 165,
        "popular_fields": ["Computer Science", "AI & ML", "Data Science", "Electrical Engineering", "Mechanical Engineering"],
        "scholarships_available": True,
        "description": "World #1 university in engineering, artificial intelligence, and computing. Renowned for CSAIL lab and high-impact industry research."
    },
    {
        "id": "uni_stanford",
        "name": "Stanford University",
        "short_name": "Stanford",
        "country": "USA",
        "city": "Stanford, CA",
        "world_rank": 3,
        "acceptance_rate": 0.038,
        "avg_tuition_usd": 61731,
        "min_gpa": 3.85,
        "min_ielts": 7.5,
        "min_toefl": 105,
        "min_gre_quant": 166,
        "popular_fields": ["Computer Science", "AI & ML", "Biotechnology", "MBA", "Data Science"],
        "scholarships_available": True,
        "description": "Heart of Silicon Valley. Unrivaled entrepreneurship, venture capital connections, and pioneering AI research."
    },
    {
        "id": "uni_cmu",
        "name": "Carnegie Mellon University",
        "short_name": "CMU",
        "country": "USA",
        "city": "Pittsburgh, PA",
        "world_rank": 28,
        "acceptance_rate": 0.11,
        "avg_tuition_usd": 54000,
        "min_gpa": 3.7,
        "min_ielts": 7.5,
        "min_toefl": 100,
        "min_gre_quant": 167,
        "popular_fields": ["Computer Science", "Machine Learning", "Software Engineering", "Robotics", "Data Science"],
        "scholarships_available": True,
        "description": "Top-ranked School of Computer Science and Language Technologies Institute. Global leader in ML and robotics."
    },
    {
        "id": "uni_eth",
        "name": "ETH Zurich (Swiss Federal Institute of Technology)",
        "short_name": "ETH Zurich",
        "country": "Switzerland",
        "city": "Zurich",
        "world_rank": 7,
        "acceptance_rate": 0.15,
        "avg_tuition_usd": 1600,
        "min_gpa": 3.6,
        "min_ielts": 7.0,
        "min_toefl": 100,
        "min_gre_quant": 162,
        "popular_fields": ["Computer Science", "Data Science", "Robotics", "Physics", "Mechanical Engineering"],
        "scholarships_available": True,
        "description": "Europe's top STEM university. Exceptional quality, virtually zero tuition (~$1,600/yr), world-class labs (Max Planck, Disney Research)."
    },
    {
        "id": "uni_tum",
        "name": "Technical University of Munich (TUM)",
        "short_name": "TU Munich",
        "country": "Germany",
        "city": "Munich",
        "world_rank": 28,
        "acceptance_rate": 0.22,
        "avg_tuition_usd": 400,
        "min_gpa": 3.3,
        "min_ielts": 6.5,
        "min_toefl": 88,
        "min_gre_quant": 158,
        "popular_fields": ["Informatics", "Data Engineering", "Automotive Software", "AI & Robotics", "Biomedical Engineering"],
        "scholarships_available": False,
        "description": "Germany's #1 University of Excellence. Tuition-free public university with massive industry ties to BMW, Siemens, and SAP."
    },
    {
        "id": "uni_nus",
        "name": "National University of Singapore (NUS)",
        "short_name": "NUS",
        "country": "Singapore",
        "city": "Singapore",
        "world_rank": 8,
        "acceptance_rate": 0.12,
        "avg_tuition_usd": 18500,
        "min_gpa": 3.65,
        "min_ielts": 6.5,
        "min_toefl": 90,
        "min_gre_quant": 160,
        "popular_fields": ["Computer Science", "Business Analytics", "AI", "Finance", "Electrical Engineering"],
        "scholarships_available": True,
        "description": "Asia's leading global university. Premier hub for Southeast Asia technology, finance, and AI research."
    },
    {
        "id": "uni_toronto",
        "name": "University of Toronto",
        "short_name": "U of T",
        "country": "Canada",
        "city": "Toronto, ON",
        "world_rank": 21,
        "acceptance_rate": 0.24,
        "avg_tuition_usd": 29500,
        "min_gpa": 3.5,
        "min_ielts": 7.0,
        "min_toefl": 93,
        "min_gre_quant": 160,
        "popular_fields": ["Computer Science", "Machine Learning", "Data Science", "Biotechnology", "Finance"],
        "scholarships_available": True,
        "description": "Canada's top institution and birthplace of modern deep learning (Vector Institute, Geoffrey Hinton)."
    },
    {
        "id": "uni_tudelft",
        "name": "Delft University of Technology (TU Delft)",
        "short_name": "TU Delft",
        "country": "Netherlands",
        "city": "Delft",
        "world_rank": 47,
        "acceptance_rate": 0.28,
        "avg_tuition_usd": 11500,
        "min_gpa": 3.2,
        "min_ielts": 6.5,
        "min_toefl": 90,
        "min_gre_quant": 155,
        "popular_fields": ["Computer Science", "Data Science & AI", "Embedded Systems", "Aerospace Engineering"],
        "scholarships_available": True,
        "description": "Renowned Dutch technical university with English-taught master's degrees, affordable tuition, and strong tech ecosystem."
    },
    {
        "id": "uni_melbourne",
        "name": "University of Melbourne",
        "short_name": "UniMelb",
        "country": "Australia",
        "city": "Melbourne, VIC",
        "world_rank": 14,
        "acceptance_rate": 0.35,
        "avg_tuition_usd": 33000,
        "min_gpa": 3.2,
        "min_ielts": 6.5,
        "min_toefl": 79,
        "min_gre_quant": 152,
        "popular_fields": ["Computer Science", "Data Science", "Information Technology", "Business", "Public Health"],
        "scholarships_available": True,
        "description": "Australia's top university with 2-year post-study work visa rights and excellent international student support."
    },
    {
        "id": "uni_oxford",
        "name": "University of Oxford",
        "short_name": "Oxford",
        "country": "UK",
        "city": "Oxford",
        "world_rank": 3,
        "acceptance_rate": 0.14,
        "avg_tuition_usd": 38000,
        "min_gpa": 3.8,
        "min_ielts": 7.5,
        "min_toefl": 110,
        "min_gre_quant": 165,
        "popular_fields": ["Advanced Computer Science", "AI & ML", "Public Policy", "Economics", "Bioinformatics"],
        "scholarships_available": True,
        "description": "Historic world-class collegiate university. 1-year intensive MSc degrees with Rhodes and Clarendon scholarship opportunities."
    },
    {
        "id": "uni_cambridge",
        "name": "University of Cambridge",
        "short_name": "Cambridge",
        "country": "UK",
        "city": "Cambridge",
        "world_rank": 2,
        "acceptance_rate": 0.12,
        "avg_tuition_usd": 39500,
        "min_gpa": 3.85,
        "min_ielts": 7.5,
        "min_toefl": 110,
        "min_gre_quant": 165,
        "popular_fields": ["Machine Learning and Machine Intelligence", "Advanced Computer Science", "Biotechnology", "Finance"],
        "scholarships_available": True,
        "description": "World-leading research epicenter in the UK Silicon Fen tech cluster with Gates Cambridge scholarship programs."
    },
    {
        "id": "uni_kth",
        "name": "KTH Royal Institute of Technology",
        "short_name": "KTH Stockholm",
        "country": "Sweden",
        "city": "Stockholm",
        "world_rank": 73,
        "acceptance_rate": 0.32,
        "avg_tuition_usd": 15000,
        "min_gpa": 3.2,
        "min_ielts": 6.5,
        "min_toefl": 90,
        "min_gre_quant": 155,
        "popular_fields": ["Computer Science", "Machine Learning", "Software Engineering", "Cybersecurity"],
        "scholarships_available": True,
        "description": "Sweden's foremost engineering institute. Progressive culture, strong tech startups (Spotify, Klarna), and Swedish Institute scholarships."
    }
]

INITIAL_PROGRAMS = [
    {
        "id": "prog_mit_cs",
        "university_id": "uni_mit",
        "university_name": "Massachusetts Institute of Technology",
        "name": "Master of Science in Computer Science (EECS)",
        "degree": "master",
        "field": "Computer Science",
        "country": "USA",
        "tuition_annual": 59750,
        "duration_months": 24,
        "min_gpa": 3.85,
        "min_ielts": 7.5,
        "min_toefl": 100,
        "min_gre_quant": 167,
        "deadline": "December 15",
        "rank": 1,
        "scholarship_available": True,
        "research_areas": ["Artificial Intelligence", "Systems", "Theory", "Robotics", "Bioinformatics"]
    },
    {
        "id": "prog_stanford_cs",
        "university_id": "uni_stanford",
        "university_name": "Stanford University",
        "name": "Master of Science in Computer Science (AI Track)",
        "degree": "master",
        "field": "AI & ML",
        "country": "USA",
        "tuition_annual": 61731,
        "duration_months": 24,
        "min_gpa": 3.85,
        "min_ielts": 7.5,
        "min_toefl": 105,
        "min_gre_quant": 167,
        "deadline": "December 1",
        "rank": 3,
        "scholarship_available": True,
        "research_areas": ["Deep Learning", "NLP", "Computer Vision", "Robotics"]
    },
    {
        "id": "prog_eth_cs",
        "university_id": "uni_eth",
        "university_name": "ETH Zurich",
        "name": "Master of Science in Computer Science",
        "degree": "master",
        "field": "Computer Science",
        "country": "Switzerland",
        "tuition_annual": 1600,
        "duration_months": 24,
        "min_gpa": 3.6,
        "min_ielts": 7.0,
        "min_toefl": 100,
        "min_gre_quant": 162,
        "deadline": "December 15",
        "rank": 7,
        "scholarship_available": True,
        "research_areas": ["Machine Intelligence", "Information Security", "Visual Computing", "Distributed Systems"]
    },
    {
        "id": "prog_tum_inf",
        "university_id": "uni_tum",
        "university_name": "Technical University of Munich",
        "name": "Master of Science in Informatics",
        "degree": "master",
        "field": "Computer Science",
        "country": "Germany",
        "tuition_annual": 400,
        "duration_months": 24,
        "min_gpa": 3.3,
        "min_ielts": 6.5,
        "min_toefl": 88,
        "min_gre_quant": 158,
        "deadline": "January 15",
        "rank": 28,
        "scholarship_available": False,
        "research_areas": ["Software Engineering", "Algorithms", "Artificial Intelligence", "Database Systems"]
    },
    {
        "id": "prog_nus_cs",
        "university_id": "uni_nus",
        "university_name": "National University of Singapore",
        "name": "Master of Computing - Computer Science Specialisation",
        "degree": "master",
        "field": "Computer Science",
        "country": "Singapore",
        "tuition_annual": 18500,
        "duration_months": 18,
        "min_gpa": 3.65,
        "min_ielts": 6.5,
        "min_toefl": 90,
        "min_gre_quant": 160,
        "deadline": "January 31",
        "rank": 8,
        "scholarship_available": True,
        "research_areas": ["Big Data Analytics", "AI Systems", "Information Security", "Digital Media"]
    },
    {
        "id": "prog_toronto_cs",
        "university_id": "uni_toronto",
        "university_name": "University of Toronto",
        "name": "MSc in Applied Computing (Data Science & AI)",
        "degree": "master",
        "field": "Data Science",
        "country": "Canada",
        "tuition_annual": 29500,
        "duration_months": 16,
        "min_gpa": 3.5,
        "min_ielts": 7.0,
        "min_toefl": 93,
        "min_gre_quant": 160,
        "deadline": "December 15",
        "rank": 21,
        "scholarship_available": True,
        "research_areas": ["Applied Machine Learning", "Computational Biology", "Computer Systems"]
    },
    {
        "id": "prog_tudelft_cs",
        "university_id": "uni_tudelft",
        "university_name": "TU Delft",
        "name": "MSc Computer Science (Data Science & Technology)",
        "degree": "master",
        "field": "Data Science",
        "country": "Netherlands",
        "tuition_annual": 11500,
        "duration_months": 24,
        "min_gpa": 3.2,
        "min_ielts": 6.5,
        "min_toefl": 90,
        "min_gre_quant": 155,
        "deadline": "January 15",
        "rank": 47,
        "scholarship_available": True,
        "research_areas": ["Data Science", "Web Information Systems", "Pattern Recognition", "Distributed Systems"]
    },
    {
        "id": "prog_melb_cs",
        "university_id": "uni_melbourne",
        "university_name": "University of Melbourne",
        "name": "Master of Computer Science",
        "degree": "master",
        "field": "Computer Science",
        "country": "Australia",
        "tuition_annual": 33000,
        "duration_months": 24,
        "min_gpa": 3.2,
        "min_ielts": 6.5,
        "min_toefl": 79,
        "min_gre_quant": 152,
        "deadline": "March 1",
        "rank": 14,
        "scholarship_available": True,
        "research_areas": ["Software Systems", "Knowledge & Data Analytics", "Distributed Computing"]
    }
]

INITIAL_SCHOLARSHIPS = [
    {
        "id": "sch_daad",
        "name": "DAAD Master Studies Scholarships",
        "country": "Germany",
        "funding_type": "Full Tuition + €934/month stipend + health insurance",
        "amount_usd": 22000,
        "deadline": "October 31",
        "degree": "Master",
        "eligibility": "Bachelor degree completed within the last 6 years, GPA >= 3.3/4.0",
        "url": "https://www.daad.de/en/"
    },
    {
        "id": "sch_fulbright",
        "name": "Fulbright Foreign Student Program",
        "country": "USA",
        "funding_type": "Full Tuition + living stipend + airfare + health insurance",
        "amount_usd": 65000,
        "deadline": "October 15",
        "degree": "Master / PhD",
        "eligibility": "Outstanding academic record, leadership potential, home country return commitment",
        "url": "https://foreign.fulbrightonline.org/"
    },
    {
        "id": "sch_eth_excellence",
        "name": "ETH Excellence Scholarship & Opportunity Programme (ESOP)",
        "country": "Switzerland",
        "funding_type": "Full study & living costs (CHF 12,000/semester) + tuition waiver",
        "amount_usd": 28000,
        "deadline": "December 15",
        "degree": "Master",
        "eligibility": "Top 10% of undergraduate cohort (Grade A/GPA >= 3.8)",
        "url": "https://ethz.ch/students/en/studies/financial/scholarships/excellence.html"
    },
    {
        "id": "sch_holland",
        "name": "NL Scholarship (formerly Holland Scholarship)",
        "country": "Netherlands",
        "funding_type": "€5,000 in the first year of studies",
        "amount_usd": 5500,
        "deadline": "February 1",
        "degree": "Bachelor / Master",
        "eligibility": "Non-EEA student applying to participating Dutch research universities",
        "url": "https://www.studyinnl.org/finances/nl-scholarship"
    },
    {
        "id": "sch_australia_awards",
        "name": "Australia Awards Scholarships",
        "country": "Australia",
        "funding_type": "Full tuition fees + return air travel + establishment allowance + living allowance (CLE)",
        "amount_usd": 48000,
        "deadline": "April 30",
        "degree": "Master / PhD",
        "eligibility": "Citizens of participating Indo-Pacific countries with 2+ years work experience",
        "url": "https://www.dfat.gov.au/people-to-people/australia-awards"
    },
    {
        "id": "sch_singapore_singa",
        "name": "Singapore International Graduate Award (SINGA)",
        "country": "Singapore",
        "funding_type": "Full tuition fees + monthly stipend of S$2,700 to S$3,200 + airfare + settling allowance",
        "amount_usd": 36000,
        "deadline": "June 1",
        "degree": "PhD",
        "eligibility": "International graduates with passion for biomedical, physical, or computational sciences research",
        "url": "https://www.a-star.edu.sg/Scholarships/for-graduate-studies/singapore-international-graduate-award-singa"
    }
]


def seed_vector_store_if_empty():
    """Seeds FAISS vector store with top universities, programs, and scholarships."""
    try:
        uni_stats = vector_store.universities.stats()
        if uni_stats.get("total_vectors", 0) == 0:
            logger.info("⚡ Seeding FAISS vector store with curated premier global universities...")
            texts = [
                f"{u['name']} in {u['city']}, {u['country']}. Rank #{u['world_rank']}. "
                f"Fields: {', '.join(u['popular_fields'])}. Min GPA: {u['min_gpa']}, IELTS: {u['min_ielts']}. {u['description']}"
                for u in INITIAL_UNIVERSITIES
            ]
            vector_store.universities.add(texts=texts, metadatas=INITIAL_UNIVERSITIES)
            logger.info(f"✅ Indexed {len(INITIAL_UNIVERSITIES)} universities into FAISS.")

        prog_stats = vector_store.programs.stats()
        if prog_stats.get("total_vectors", 0) == 0:
            logger.info("⚡ Seeding FAISS vector store with top academic programs...")
            p_texts = [
                f"{p['name']} at {p['university_name']}, {p['country']}. {p['degree']} in {p['field']}. "
                f"Tuition: ${p['tuition_annual']}/yr. Min GPA: {p['min_gpa']}, IELTS: {p['min_ielts']}. "
                f"Research: {', '.join(p['research_areas'])}"
                for p in INITIAL_PROGRAMS
            ]
            vector_store.programs.add(texts=p_texts, metadatas=INITIAL_PROGRAMS)
            logger.info(f"✅ Indexed {len(INITIAL_PROGRAMS)} programs into FAISS.")

        sch_stats = vector_store.scholarships.stats()
        if sch_stats.get("total_vectors", 0) == 0:
            logger.info("⚡ Seeding FAISS vector store with global scholarship opportunities...")
            s_texts = [
                f"{s['name']} for study in {s['country']}. Degree: {s['degree']}. "
                f"Funding: {s['funding_type']}. Value: ${s['amount_usd']}. Eligibility: {s['eligibility']}"
                for s in INITIAL_SCHOLARSHIPS
            ]
            vector_store.scholarships.add(texts=s_texts, metadatas=INITIAL_SCHOLARSHIPS)
            logger.info(f"✅ Indexed {len(INITIAL_SCHOLARSHIPS)} scholarships into FAISS.")
    except Exception as e:
        logger.error(f"Error seeding vector store: {e}")
