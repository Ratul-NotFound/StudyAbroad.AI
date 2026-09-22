"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeToggle } from "../lib/theme";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, ArrowRight, CheckCircle2, Sparkles, Globe, Shield, Zap, BookOpen, Users, Award, Star } from "lucide-react";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import InstitutionMarquee from "../components/InstitutionMarquee";
import ChatbotWidget from "../components/ChatbotWidget";

const HERO_BACKGROUNDS = [
  "/hero-campus.jpg",
  "/destination-usa.jpg",
  "/library-study.jpg",
  "/destination-switzerland.jpg",
  "/destination-germany.jpg",
  "/destination-singapore.jpg",
];

const AGENTS = [
  { icon: "🎓", name: "Profile Analyzer", category: "Admissions Radar", desc: "Scores your GPA, GRE, IELTS and identifies competitiveness gaps instantly" },
  { icon: "🏛️", name: "University Matcher", category: "Vector AI Search", desc: "Semantic matching across 10,000+ accredited universities worldwide" },
  { icon: "✍️", name: "SOP Writer", category: "LLM Narrative", desc: "Generates tailored Statements of Purpose linking your background to faculty labs" },
  { icon: "💰", name: "Scholarship Hunter", category: "Endowment Crawler", desc: "Scrapes 50,000+ government, university & fellowship grant opportunities" },
  { icon: "🛂", name: "Visa Guide", category: "Embassy Compliance", desc: "Step-by-step visa checklist, financial proof rules & interview preparation" },
  { icon: "📅", name: "Deadline Tracker", category: "Automated Alerts", desc: "Never miss an admissions round — automated countdowns and requirement checklists" },
  { icon: "💬", name: "Interview Coach", category: "AI Simulation", desc: "Mock interviews with personalized feedback for visa officers and admissions panels" },
  { icon: "📊", name: "Cost Estimator", category: "Financial Planner", desc: "Comprehensive cost breakdown: tuition, living expenses, and scholarship offsets" },
  { icon: "📝", name: "LOR Advisor", category: "Faculty Guidance", desc: "Guides professors with structured templates to author persuasive recommendation letters" },
  { icon: "🏠", name: "Housing Scout", category: "Accommodation", desc: "Finds verified student housing and dorm options near your target university campus" },
  { icon: "✈️", name: "Pre-Departure Planner", category: "Logistics Engine", desc: "Pre-flight checklist, packing guides, banking setup & first-week survival essentials" },
  { icon: "🤝", name: "Alumni Connector", category: "Network Hub", desc: "Connects prospective applicants with verified international alumni mentors" },
];

const DESTINATIONS = [
  {
    country: "United States",
    flag: "🇺🇸",
    img: "/destination-usa.jpg",
    unis: "MIT, Stanford, Harvard, CMU",
    tuition: "$35K - $60K/yr",
    stayBack: "3-Year STEM OPT",
    tag: "Top Research & Tech",
  },
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    img: "/destination-uk.jpg",
    unis: "Oxford, Cambridge, Imperial, UCL",
    tuition: "£22K - £38K/yr",
    stayBack: "2-Year Graduate Visa",
    tag: "1-Year Master's Degrees",
  },
  {
    country: "Germany",
    flag: "🇩🇪",
    img: "/destination-germany.jpg",
    unis: "TU Munich, Heidelberg, RWTH Aachen",
    tuition: "€0 - €1,500/yr (~Free)",
    stayBack: "18-Month Job Seeker",
    tag: "High ROI & Engineering",
  },
  {
    country: "Switzerland",
    flag: "🇨🇭",
    img: "/destination-switzerland.jpg",
    unis: "ETH Zurich, EPFL Lausanne",
    tuition: "CHF 1,600/yr (~Free)",
    stayBack: "6-Month Search Visa",
    tag: "World #7 STEM Quality",
  },
  {
    country: "Singapore",
    flag: "🇸🇬",
    img: "/destination-singapore.jpg",
    unis: "NUS, NTU, SMU",
    tuition: "S$25K - S$45K/yr",
    stayBack: "1 to 3-Year Pass",
    tag: "Asian Tech & Finance Hub",
  },
];

function AnimatedCount({
  target,
  prefix = "",
  suffix = "",
  duration = 1800,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out exponential formula
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(easeProgress * target);
      setCount(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const STATS = [
  { target: 10000, suffix: "+", prefix: "", label: "Universities Indexed" },
  { target: 50000, suffix: "+", prefix: "", label: "Scholarships Tracked" },
  { target: 12, suffix: "", prefix: "", label: "AI Agents Working 24/7" },
  { target: 0, suffix: "", prefix: "$", label: "Cost to Get Started" },
];

const STEPS = [
  { step: "01", title: "Build Your Profile", desc: "Enter your GPA, test scores, work experience, and target countries in under 3 minutes." },
  { step: "02", title: "AI Analyzes & Matches", desc: "12 agents simultaneously analyze your profile against 10,000+ programs using semantic vector search." },
  { step: "03", title: "Get Your Action Plan", desc: "Receive your tailored university list (reach/match/safe), SOP drafts, scholarship matches & deadlines." },
];

const TESTIMONIALS = [
  {
    name: "Aarav Patel",
    origin: "Mumbai, India",
    program: "MSc Computer Science",
    university: "ETH Zurich",
    flag: "🇨🇭",
    scholarship: "DAAD Full-Ride (€22,000/yr)",
    image: "/students/student-1.jpg",
    quote: "The vector matcher paired my research background with faculty labs in Zurich I wouldn't have found on my own. Secured a full grant!",
  },
  {
    name: "Elena Chen",
    origin: "Taipei, Taiwan",
    program: "MSc Financial Economics",
    university: "University of Oxford",
    flag: "🇬🇧",
    scholarship: "Rhodes Trust Fellowship",
    image: "/students/student-2.jpg",
    quote: "The SOP Writer engineered an essay linking my microfinance work to Oxford faculty research seamlessly. Interview coaching was invaluable.",
  },
  {
    name: "Marcus Vance",
    origin: "Toronto, Canada",
    program: "EECS & AI Research",
    university: "MIT",
    flag: "🇺🇸",
    scholarship: "Teaching Assistant Fellowship",
    image: "/students/student-3.jpg",
    quote: "Automated deadline tracking and faculty outreach workflows saved me over 40 hours during application crunch time.",
  },
  {
    name: "Fatima Al-Mansoor",
    origin: "Dubai, UAE",
    program: "MSc Robotics & AI",
    university: "TU Munich (TUM)",
    flag: "🇩🇪",
    scholarship: "€0 Tuition + Erasmus+ Grant",
    image: "/students/student-4.jpg",
    quote: "Navigating German APS certificates, blocked accounts, and uni-assist was completely painless with the Visa & Compliance Guide.",
  },
  {
    name: "David Adeleke",
    origin: "Lagos, Nigeria",
    program: "College of Engineering",
    university: "UC Berkeley",
    flag: "🇺🇸",
    scholarship: "Fulbright Foreign Fellow",
    image: "/students/student-5.jpg",
    quote: "The financial calculator surfaced $45,000 in fellowship grants I hadn't seen anywhere else. A game changer for international applicants.",
  },
  {
    name: "Sophie Moreau",
    origin: "Lyon, France",
    program: "MPhil Biotechnology",
    university: "University of Cambridge",
    flag: "🇬🇧",
    scholarship: "Gates Cambridge Trust",
    image: "/students/student-6.jpg",
    quote: "Having 12 specialized agents felt like having a dedicated 24/7 personal admissions committee guiding every single paragraph.",
  },
];

const MENTORS = [
  {
    name: "Dr. Katherine Howard",
    title: "Senior Admissions Strategist",
    credential: "Ex-Oxford Admissions & Cambridge Fellow",
    image: "/students/mentor-1.jpg",
    specialty: "SOP & Faculty Alignment Reviews",
    stats: "94.2% Top-20 Acceptance Rate",
  },
  {
    name: "James Wilson, LL.M",
    title: "Global Visa & Compliance Officer",
    credential: "Former Consular Visa Advisor (US/UK/EU)",
    image: "/students/mentor-2.jpg",
    specialty: "Financial Proof & Embassy Audits",
    stats: "99.4% Student Visa Approval Rate",
  },
];

// Motion animation variants for silky scroll reveals
const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    }
  }
};

export default function HomePage() {
  const [bgIndex, setBgIndex] = useState(0);
  const [destFilter, setDestFilter] = useState("All");

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* ── Master Universal Navbar ── */}
      <Navbar />

      {/* ── Hero Section ── */}
      <section style={{
        paddingTop: 130,
        paddingBottom: 85,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Animated Aurora Glow Orbs */}
        <div className="aurora-orb-1" />
        <div className="aurora-orb-2" />

        {/* Multi-image Realistic Campus Backgrounds */}
        {HERO_BACKGROUNDS.map((img, idx) => (
          <div
            key={img}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url('${img}')`,
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
              opacity: bgIndex === idx ? 1 : 0,
              transform: bgIndex === idx ? "scale(1.03)" : "scale(1)",
              transition: "opacity 1.5s ease-in-out, transform 6s ease-out",
              zIndex: 0,
            }}
          />
        ))}

        {/* Dynamic Theme Vignette Overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "var(--hero-overlay)",
          zIndex: 1,
        }} />

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="container" style={{ textAlign: "center", position: "relative", zIndex: 2 }}
        >
          <motion.h1 
            variants={fadeInUp}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "clamp(40px, 5.8vw, 76px)", fontWeight: 900, lineHeight: 1.08,
              marginBottom: 20, letterSpacing: "-1.5px", color: "var(--text-primary)"
            }}
          >
            World-Class Admissions.<br />
            <span style={{ color: "var(--accent)" }}>Zero Consultant Fees.</span>
          </motion.h1>

          <motion.p 
            variants={fadeInUp}
            style={{
              fontSize: 18, color: "var(--text-secondary)", maxWidth: 620,
              margin: "0 auto 32px", lineHeight: 1.6, fontWeight: 400
            }}
          >
            12 specialized AI agents analyze your profile, match you across 10,000+ global degree programs, and engineer bespoke application dossiers.
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/profile" className="btn btn-primary btn-lg" style={{ borderRadius: "100px", padding: "14px 32px", fontSize: 15, fontWeight: 600, gap: 7, boxShadow: "0 8px 24px var(--accent-glow)" }}>
                <span>Evaluate My Profile Free</span>
                <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/universities" className="btn btn-outline btn-lg" style={{ borderRadius: "100px", padding: "14px 32px", fontSize: 15, fontWeight: 600, border: "1px solid var(--border-accent)", color: "var(--text-primary)" }}>
                Explore Top Universities
              </Link>
            </motion.div>
          </motion.div>

          {/* Social Proof Strip with Real Student Faces */}
          <motion.div 
            variants={fadeInUp}
            whileHover={{ scale: 1.025 }}
            style={{
              marginTop: 26,
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              background: "var(--bg-card)",
              padding: "8px 20px",
              borderRadius: "100px",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
              cursor: "default"
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {[
                { src: "/students/student-1.jpg", alt: "Aarav - ETH Zurich" },
                { src: "/students/student-2.jpg", alt: "Elena - Oxford" },
                { src: "/students/student-3.jpg", alt: "Marcus - MIT" },
                { src: "/students/student-4.jpg", alt: "Fatima - TU Munich" },
                { src: "/students/student-5.jpg", alt: "David - UC Berkeley" },
              ].map((student, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <motion.img
                  key={student.src}
                  src={student.src}
                  alt={student.alt}
                  whileHover={{ scale: 1.25, zIndex: 10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid var(--bg-card)",
                    marginLeft: i === 0 ? 0 : -9,
                    cursor: "pointer"
                  }}
                />
              ))}
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.25 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#f59e0b", fontSize: 12, fontWeight: 700 }}>
                <span>★★★★★</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>4.9/5</span>
              </div>
              <span style={{ color: "var(--text-secondary)", fontSize: 11.5 }}>
                Admissions secured at <strong>MIT, Oxford, Stanford, Cambridge &amp; TUM</strong>
              </span>
            </div>
          </motion.div>

          {/* Stats Bar with Precision Metrics and Animated Count-Up */}
          <motion.div 
            variants={fadeInUp}
            className="hero-stats-grid" style={{
              marginTop: 48, maxWidth: 740, margin: "48px auto 0",
              borderTop: "1px solid var(--border)", paddingTop: 28
            }}
          >
            {STATS.map((s) => (
              <motion.div 
                key={s.label}
                whileHover={{ y: -3, scale: 1.03 }}
                transition={{ duration: 0.2 }}
                style={{ cursor: "default" }}
              >
                <div style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 900, color: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.8px" }}>
                  <AnimatedCount target={s.target} prefix={s.prefix} suffix={s.suffix} duration={1800} />
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 3, fontWeight: 500 }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Seamless Borderless Elite Institution & Scholarship Marquee ── */}
      <InstitutionMarquee />

      {/* ── Featured Study Abroad Destinations ── */}
      <section id="destinations" style={{ padding: "85px 0", borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: "center", marginBottom: 36 }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
              Global Higher Education Hubs
            </div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 34, fontWeight: 800, marginBottom: 10, letterSpacing: "-0.5px" }}>
              Explore Top Study Destinations
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 15.5, maxWidth: 580, margin: "0 auto" }}>
              Tailored admission requirements, verified tuition ranges, and post-study work rights for every country.
            </p>
          </motion.div>

          {/* Category Filter Pills */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 36, flexWrap: "wrap" }}
          >
            {["All", "Top STEM", "Tuition-Free", "Post-Study Work"].map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.04, y: -1 }}
                onClick={() => setDestFilter(cat)}
                className={`filter-pill ${destFilter === cat ? "active" : ""}`}
                style={{ fontSize: 13, padding: "7px 16px", cursor: "pointer", transition: "all 0.2s ease" }}
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>

          {/* Destination Cards Grid with Motion & Fluid Layout Physics */}
          <motion.div
            layout
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 22,
            }}
          >
            <AnimatePresence mode="popLayout">
              {DESTINATIONS.filter((d) => {
                if (destFilter === "All") return true;
                if (destFilter === "Top STEM") return d.tag.includes("STEM") || d.tag.includes("Tech");
                if (destFilter === "Tuition-Free") return d.tuition.includes("Free");
                if (destFilter === "Post-Study Work") return d.stayBack.includes("3-Year") || d.stayBack.includes("2-Year") || d.stayBack.includes("Pass") || d.stayBack.includes("18-Month");
                return true;
              }).map((dest, i) => (
                <motion.div
                  key={dest.country}
                  layout
                  initial={{ opacity: 0, scale: 0.92, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -20 }}
                  transition={{ duration: 0.45, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -8, scale: 1.025, boxShadow: "0 18px 36px rgba(0,0,0,0.14)", transition: { duration: 0.2 } }}
                  className="card"
                  style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border)", cursor: "pointer", borderRadius: "16px" }}
                >
                  <div className="card-img-wrapper" style={{ height: 165, width: "100%", overflow: "hidden", position: "relative" }}>
                    <img
                      src={dest.img}
                      alt={dest.country}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}
                    />
                    <div style={{
                      position: "absolute", top: 12, left: 12,
                      background: "var(--nav-bg)", color: "var(--text-primary)",
                      backdropFilter: "blur(10px)", border: "1px solid var(--border)",
                      borderRadius: "100px", padding: "4px 11px", fontSize: 12, fontWeight: 700,
                      display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <span>{dest.flag}</span> {dest.country}
                    </div>
                    <div style={{
                      position: "absolute", bottom: 12, right: 12,
                      background: "var(--bg-card)", color: "var(--text-primary)",
                      borderRadius: "100px", padding: "3.5px 10px", fontSize: 11, fontWeight: 600,
                      border: "1px solid var(--border)", boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    }}>
                      {dest.tag}
                    </div>
                  </div>
                  <div style={{ padding: "20px 22px" }}>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                      Top Hubs: <strong style={{ color: "var(--text-primary)" }}>{dest.unis}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12 }}>
                      <div>
                        <span style={{ color: "var(--text-muted)", fontSize: 11, display: "block" }}>Avg Tuition</span>
                        <strong style={{ color: "var(--text-primary)" }}>{dest.tuition}</strong>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: 11, display: "block" }}>Work Rights</span>
                        <strong style={{ color: "var(--accent)" }}>{dest.stayBack}</strong>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── Library & Student Experience Spotlight ── */}
      <section style={{ padding: "85px 0", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44, alignItems: "center" }}
            className="sop-grid"
          >
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
                Autonomous Academic Excellence
              </div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, letterSpacing: "-0.5px" }}>
                World-Class Admissions Advisory Without Consultant Fees
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.65, marginBottom: 20 }}>
                Traditional study abroad agencies charge thousands of dollars for manual recommendations and generic templates. StudyAbroad.AI uses cutting-edge vector search to tailor your complete application package in minutes.
              </p>
              <div style={{ display: "grid", gap: 14, marginBottom: 26 }}>
                {[
                  { title: "Precision Match Scoring", desc: "Analyzes GPA scales, GRE percentiles, and language benchmarks against historical applicant pools." },
                  { title: "Personalized SOP Writing Engine", desc: "Crafts bespoke essays linking your projects and research directly to faculty labs and course syllabi." },
                  { title: "Automated Scholarship Tracker", desc: "Scrapes global university and government endowment funds worth up to 100% full tuition coverage." },
                ].map((item, idx) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    whileHover={{ x: 6 }}
                    style={{ display: "flex", gap: 12, cursor: "default" }}
                  >
                    <span style={{ color: "#10b981", fontSize: 16, fontWeight: 800, lineHeight: 1.4 }}>✓</span>
                    <div>
                      <h4 style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 2, color: "var(--text-primary)" }}>{item.title}</h4>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: "inline-block" }}>
                <Link href="/profile" className="btn btn-primary" style={{ padding: "12px 24px", fontSize: 14, borderRadius: "100px", boxShadow: "0 6px 20px var(--accent-glow)" }}>
                  Build My Action Plan →
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02 }}
              style={{ position: "relative" }}
            >
              <div style={{
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow)",
              }}>
                <img
                  src="/library-study.jpg"
                  alt="Students studying in historic collegiate university library"
                  style={{ width: "100%", height: 360, objectFit: "cover", display: "block" }}
                />
              </div>
              {/* Floating Badge with Gentle Breathe Animation */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute", bottom: -18, left: 24,
                  background: "var(--bg-card)", color: "var(--text-primary)",
                  backdropFilter: "blur(18px)",
                  border: "1px solid var(--border-accent)", borderRadius: "16px",
                  padding: "14px 20px", display: "flex", alignItems: "center", gap: 14,
                  boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                }}
              >
                <div style={{ fontSize: 30 }}>🏛️</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>10,000+ Global Programs</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Indexed across 30+ countries</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 12 Specialized AI Agents Grid ── */}
      <section id="agents" style={{ padding: "85px 0", borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: "center", marginBottom: 44 }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
              Autonomous Multi-Agent Architecture
            </div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 34, fontWeight: 800, marginBottom: 10, letterSpacing: "-0.5px" }}>
              12 Specialized AI Agents, <span style={{ color: "var(--accent)" }}>One Mission</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
              Every agent runs autonomously, coordinated by a supervisor that routes tasks intelligently.
            </p>
          </motion.div>

          {/* 12 Agents Grid with Staggered Cascading Reveal */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            {AGENTS.map((agent) => (
              <motion.div
                key={agent.name} 
                variants={fadeInUp}
                whileHover={{ 
                  y: -6, 
                  scale: 1.02, 
                  borderColor: "var(--border-accent)", 
                  boxShadow: "0 14px 28px rgba(37, 99, 235, 0.12)",
                  transition: { duration: 0.2 } 
                }}
                className="card" 
                style={{ padding: "20px 22px", display: "flex", flexDirection: "column", cursor: "default", borderRadius: "14px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <motion.span 
                    whileHover={{ scale: 1.25, rotate: 8 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    style={{ fontSize: 26, display: "inline-block" }}
                  >
                    {agent.icon}
                  </motion.span>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)", background: "var(--bg-secondary)", padding: "2px 7px", borderRadius: 4, border: "1px solid var(--border)" }}>
                    {agent.category}
                  </span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>{agent.name}</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>{agent.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: "85px 0", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: "center", marginBottom: 48 }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
              Simple 3-Step Process
            </div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 34, fontWeight: 800, marginBottom: 10, letterSpacing: "-0.5px" }}>
              How It Works
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
              From zero to a complete study abroad action plan in under 5 minutes.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, maxWidth: 900, margin: "0 auto" }} 
            className="stats-grid"
          >
            {STEPS.map((step) => (
              <motion.div
                key={step.step} 
                variants={fadeInUp}
                whileHover={{ y: -6, scale: 1.025, boxShadow: "0 14px 28px rgba(0,0,0,0.1)" }}
                className="card"
                style={{ textAlign: "center", padding: "30px 24px", borderRadius: "16px" }}
              >
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: "var(--accent-glow)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px", fontSize: 15, fontWeight: 800,
                    border: "1px solid var(--border-accent)",
                    color: "var(--accent-light)",
                  }}
                >
                  {step.step}
                </motion.div>
                <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: 16, color: "var(--text-primary)" }}>{step.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Real Student Admissions & Scholarship Outcomes ── */}
      <section id="stories" style={{ padding: "85px 0", borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: "center", marginBottom: 48 }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>
              Real Scholars • Real Admissions
            </div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 34, fontWeight: 800, marginBottom: 10, letterSpacing: "-0.5px" }}>
              Join Thousands of Accepted International Students
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 620, margin: "0 auto" }}>
              From competitive STEM programs to prestigious full-ride scholarships, see how scholars around the globe won their dream admits.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.02, boxShadow: "0 18px 36px rgba(0,0,0,0.12)", transition: { duration: 0.2 } }}
                className="card"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background: "var(--bg-card)",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  cursor: "default",
                }}
              >
                <div>
                  {/* Top: Student Portrait & Meta */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <motion.img
                      whileHover={{ scale: 1.15 }}
                      transition={{ duration: 0.2 }}
                      src={t.image}
                      alt={t.name}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid var(--border-accent)",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>{t.name}</h4>
                        <span style={{ fontSize: 13 }}>{t.flag}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{t.origin}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>{t.program} • {t.university}</div>
                    </div>
                  </div>

                  {/* Quote */}
                  <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 16px", fontStyle: "italic" }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                {/* Bottom: Scholarship Tag */}
                <div style={{
                  paddingTop: 12,
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 12,
                }}>
                  <span style={{ fontWeight: 600, color: "#10b981", display: "flex", alignItems: "center", gap: 5 }}>
                    <CheckCircle2 size={13} />
                    {t.scholarship}
                  </span>
                  <span style={{ color: "#f59e0b", fontWeight: 700 }}>★★★★★</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Human Mentors & Peer Community ── */}
      <section id="mentors" style={{ padding: "85px 0", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 40,
            alignItems: "center",
          }} className="sop-grid">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="badge badge-accent" style={{ marginBottom: 12, fontSize: 11.5, padding: "5px 12px" }}>
                🤝 Human Experts + AI Engine
              </span>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 32, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.5px" }}>
                Built by Former Admissions Officers &amp; Global Scholars
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.65, marginBottom: 24 }}>
                Our algorithms are calibrated against verified admission committee rubrics from Harvard, Oxford, and TU Munich. You get the speed of 12 AI agents paired with the wisdom of experienced human counselors.
              </p>

              {/* Mentor Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {MENTORS.map((m, i) => (
                  <motion.div
                    key={m.name}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.12 }}
                    whileHover={{ x: 6, borderColor: "var(--border-accent)" }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "14px 18px",
                      borderRadius: "14px",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      cursor: "default",
                      transition: "border-color 0.2s ease"
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                      src={m.image}
                      alt={m.name}
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: "12px",
                        objectFit: "cover",
                        border: "1px solid var(--border)",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-primary)" }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>{m.title} — {m.credential}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 2 }}>{m.specialty} • <strong>{m.stats}</strong></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Campus Collaboration Visual */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02 }}
              style={{ position: "relative" }}
            >
              <div style={{
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow)",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/students/campus-collab.jpg"
                  alt="International students collaborating in university study hall"
                  style={{ width: "100%", height: 380, objectFit: "cover", display: "block" }}
                />
              </div>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  bottom: -16,
                  left: 20,
                  right: 20,
                  padding: "14px 20px",
                  borderRadius: "14px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🌍</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Global Peer Alumni Network</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>Direct connections with students on campus</div>
                  </div>
                </div>
                <Link href="/profile" className="btn btn-primary btn-sm" style={{ fontSize: 12, padding: "6px 14px" }}>
                  Join Network
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: "90px 0", borderTop: "1px solid var(--border)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
            className="card" 
            style={{
              maxWidth: 640, margin: "0 auto", padding: "48px 36px",
              background: "var(--bg-card)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-sm)",
              borderRadius: "20px"
            }}
          >
            <motion.div 
              whileHover={{ rotate: [0, -10, 10, -5, 5, 0], scale: 1.15 }}
              transition={{ duration: 0.5 }}
              style={{ fontSize: 40, marginBottom: 16, display: "inline-block", cursor: "pointer" }}
            >
              🎓
            </motion.div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 30, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.5px" }}>
              Ready to Start Your<br />
              <span style={{ color: "var(--accent)" }}>Study Abroad Journey?</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 15 }}>
              Join thousands of students who let AI do the heavy lifting.
              Build your complete profile in under 3 minutes.
            </p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} style={{ display: "inline-block" }}>
              <Link href="/profile" className="btn btn-primary btn-lg" style={{ fontSize: 15, padding: "13px 32px", borderRadius: "100px", boxShadow: "0 8px 24px var(--accent-glow)" }}>
                Get Started — It&apos;s Free ✨
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Interactive Floating AI Admissions Chatbot ── */}
      <ChatbotWidget />

      {/* ── Professional SaaS Footer ── */}
      <Footer />
    </div>
  );
}

