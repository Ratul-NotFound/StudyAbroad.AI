"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const HERO_BACKGROUNDS = [
  "/hero-campus.jpg",
  "/destination-usa.jpg",
  "/library-study.jpg",
  "/destination-switzerland.jpg",
  "/destination-germany.jpg",
  "/destination-singapore.jpg",
];

const AGENTS = [
  { icon: "🎓", name: "Profile Analyzer", desc: "Scores your GPA, GRE, IELTS and finds gaps instantly" },
  { icon: "🏛️", name: "University Matcher", desc: "Semantic AI matching across 10,000+ universities worldwide" },
  { icon: "✍️", name: "SOP Writer", desc: "Generates personalized Statements of Purpose with LLMs" },
  { icon: "💰", name: "Scholarship Hunter", desc: "Finds scholarships you qualify for — daily scraping" },
  { icon: "🛂", name: "Visa Guide", desc: "Step-by-step visa checklist & document requirements" },
  { icon: "📅", name: "Deadline Tracker", desc: "Never miss a deadline — AI-driven alerts & reminders" },
  { icon: "💬", name: "Interview Coach", desc: "Mock interviews with AI feedback for visa & admissions" },
  { icon: "📊", name: "Cost Estimator", desc: "Full cost breakdown: tuition, living, scholarship offsets" },
  { icon: "📝", name: "LOR Advisor", desc: "Guides professors on writing strong recommendation letters" },
  { icon: "🏠", name: "Housing Scout", desc: "Finds student housing options near your target university" },
  { icon: "✈️", name: "Pre-Departure Planner", desc: "Checklist, flight booking tips & first-week essentials" },
  { icon: "🤝", name: "Alumni Connector", desc: "Connects you with alumni from your target universities" },
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
    tuition: "€0 - €1,500/yr (Tuition-Free)",
    stayBack: "18-Month Job Seeker Visa",
    tag: "High ROI & Engineering",
  },
  {
    country: "Switzerland",
    flag: "🇨🇭",
    img: "/destination-switzerland.jpg",
    unis: "ETH Zurich, EPFL Lausanne",
    tuition: "CHF 1,600/yr (~Free)",
    stayBack: "6-Month Post-Study Visa",
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

const STATS = [
  { value: "10,000+", label: "Universities Indexed" },
  { value: "50,000+", label: "Scholarships Tracked" },
  { value: "12", label: "AI Agents Working 24/7" },
  { value: "$0", label: "Cost to Get Started" },
];

const STEPS = [
  { step: "01", title: "Build Your Profile", desc: "Enter your GPA, test scores, work experience, and target countries. Takes 3 minutes." },
  { step: "02", title: "AI Analyzes & Matches", desc: "12 agents simultaneously analyze your profile against 10,000+ programs using semantic search." },
  { step: "03", title: "Get Your Action Plan", desc: "Receive university list (reach/match/safe), SOP drafts, scholarship matches & visa guide — all at once." },
];

export default function HomePage() {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* ── Navbar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        borderBottom: "1px solid var(--border)",
        background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)",
      }}>
        <div className="container flex-between" style={{ height: 64 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20 }}>
              <span className="gradient-text">StudyAbroad</span>
              <span style={{ color: "var(--text-secondary)" }}>.AI</span>
            </span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
            <Link href="/universities" className="btn btn-ghost btn-sm">Universities</Link>
            <Link href="/profile" className="btn btn-primary btn-sm">Start Free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        paddingTop: 170,
        paddingBottom: 110,
        position: "relative",
        overflow: "hidden",
      }}>
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
              transform: bgIndex === idx ? "scale(1.04)" : "scale(1)",
              transition: "opacity 1.5s ease-in-out, transform 6s ease-out",
              zIndex: 0,
            }}
          />
        ))}

        {/* Dark Vignette Overlay for Crisp Typography Legibility */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(10,10,15,0.72) 0%, rgba(10,10,15,0.88) 60%, var(--bg-primary) 100%)",
          zIndex: 1,
        }} />

        {/* Ambient subtle glow */}
        <div style={{
          position: "absolute", top: "25%", left: "50%", transform: "translate(-50%,-50%)",
          width: 800, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
        }} />

        <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{ marginBottom: 24 }}>
            <span className="badge badge-accent">🚀 Autonomous Study Abroad Intelligence</span>
          </div>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(40px, 6vw, 76px)", fontWeight: 800, lineHeight: 1.1,
            marginBottom: 24, letterSpacing: "-2px",
          }}>
            Your AI-Powered<br />
            <span className="gradient-text">Study Abroad Advisor</span>
          </h1>
          <p style={{
            fontSize: 20, color: "var(--text-secondary)", maxWidth: 640,
            margin: "0 auto 40px", lineHeight: 1.7,
          }}>
            12 specialized AI agents working together to handle every step of your international education journey —
            from profile evaluation to university matching, SOP drafting, and scholarship hunter.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/profile" className="btn btn-primary btn-lg">
              ✨ Evaluate My Profile Free
            </Link>
            <Link href="/universities" className="btn btn-outline btn-lg">
              🏛️ Explore Top Universities
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24,
            marginTop: 80, maxWidth: 720, margin: "80px auto 0",
          }}>
            {STATS.map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 32, fontWeight: 800, color: "var(--accent-light)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Study Abroad Destinations (Real Photography) ── */}
      <section style={{ padding: "90px 0", borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
              Global Higher Education Hubs
            </div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 38, fontWeight: 800, marginBottom: 12 }}>
              Explore Top Study Destinations
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 600, margin: "0 auto" }}>
              Tailored admission requirements, verified tuition ranges, and post-study work rights for every country.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}>
            {DESTINATIONS.map((dest) => (
              <div key={dest.country} className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border)" }}>
                <div style={{ position: "relative", height: 180, width: "100%" }}>
                  <img
                    src={dest.img}
                    alt={dest.country}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{
                    position: "absolute", top: 12, left: 12,
                    background: "rgba(10,10,15,0.85)", backdropFilter: "blur(8px)",
                    borderRadius: "var(--radius-sm)", padding: "4px 10px", fontSize: 12, fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span>{dest.flag}</span> {dest.country}
                  </div>
                  <div style={{
                    position: "absolute", bottom: 12, right: 12,
                    background: "rgba(99,102,241,0.9)", color: "#fff",
                    borderRadius: "var(--radius-sm)", padding: "3px 8px", fontSize: 11, fontWeight: 600,
                  }}>
                    {dest.tag}
                  </div>
                </div>
                <div style={{ padding: "20px 22px" }}>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>
                    Top Hubs: <strong style={{ color: "var(--text-primary)" }}>{dest.unis}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12 }}>
                    <div>
                      <span style={{ color: "var(--text-muted)", fontSize: 11, display: "block" }}>Avg Tuition</span>
                      <strong>{dest.tuition}</strong>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: 11, display: "block" }}>Work Rights</span>
                      <strong style={{ color: "var(--accent-light)" }}>{dest.stayBack}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Library & Student Experience Spotlight (Real Photography) ── */}
      <section style={{ padding: "90px 0", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-light)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>
                Autonomous Academic Excellence
              </div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>
                World-Class Admissions Advisory Without Consultant Fees
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.7, marginBottom: 24 }}>
                Traditional study abroad agencies charge thousands of dollars for manual university recommendations and generic SOP templates. StudyAbroad.AI uses cutting-edge vector search and local intelligence to tailor your complete application package in minutes.
              </p>
              <div style={{ display: "grid", gap: 14, marginBottom: 30 }}>
                {[
                  { title: "Precision Match Scoring", desc: "Analyzes GPA scales, GRE percentiles, and language benchmarks against historical applicant pools." },
                  { title: "Personalized SOP Writing Engine", desc: "Crafts bespoke essays linking your projects and research directly to faculty labs and course syllabi." },
                  { title: "Automated Scholarship Tracker", desc: "Scrapes global university and government endowment funds worth up to 100% full tuition coverage." },
                ].map((item) => (
                  <div key={item.title} style={{ display: "flex", gap: 14 }}>
                    <span style={{ color: "#10b981", fontSize: 18, fontWeight: 800 }}>✓</span>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{item.title}</h4>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/profile" className="btn btn-primary">
                Build My Action Plan →
              </Link>
            </div>

            <div style={{ position: "relative" }}>
              <div style={{
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                border: "1px solid var(--border)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              }}>
                <img
                  src="/library-study.jpg"
                  alt="Students studying in historic collegiate university library"
                  style={{ width: "100%", height: 380, objectFit: "cover" }}
                />
              </div>
              {/* Floating Badge */}
              <div style={{
                position: "absolute", bottom: -20, left: 24,
                background: "rgba(18,18,26,0.95)", backdropFilter: "blur(16px)",
                border: "1px solid var(--border-accent)", borderRadius: "var(--radius)",
                padding: "16px 20px", display: "flex", alignItems: "center", gap: 14,
                boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
              }}>
                <div style={{ fontSize: 32 }}>🏛️</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>10,000+ Global Programs</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Indexed across 30+ countries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 12 Agents Grid ── */}
      <section style={{ padding: "80px 0", borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 40, fontWeight: 800, marginBottom: 12 }}>
              12 Specialized AI Agents,{" "}
              <span className="gradient-text">One Mission</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 18 }}>
              Every agent runs autonomously, coordinated by a supervisor that routes tasks intelligently.
            </p>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}>
            {AGENTS.map((agent) => (
              <div key={agent.name} className="card" style={{ cursor: "default" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{agent.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{agent.name}</h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{agent.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: "80px 0", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 40, fontWeight: 800, marginBottom: 12 }}>
              How It Works
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 18 }}>
              From zero to complete study abroad action plan in under 5 minutes.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32, maxWidth: 900, margin: "0 auto" }}>
            {STEPS.map((step) => (
              <div key={step.step} style={{ textAlign: "center" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px", fontSize: 16, fontWeight: 800,
                  boxShadow: "0 0 32px var(--accent-glow)",
                }}>
                  {step.step}
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 18 }}>{step.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Student Success / Outcome Showcase ── */}
      <section style={{ padding: "80px 0", borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <div className="container">
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center",
            background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))",
            borderRadius: "var(--radius-lg)", border: "1px solid var(--border-accent)",
            padding: "40px", overflow: "hidden",
          }}>
            <div style={{ borderRadius: "var(--radius)", overflow: "hidden" }}>
              <img
                src="/graduation-success.jpg"
                alt="International graduate students celebrating academic success"
                style={{ width: "100%", height: 280, objectFit: "cover" }}
              />
            </div>
            <div>
              <span className="badge badge-success" style={{ marginBottom: 12 }}>🎓 Global Success</span>
              <h3 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 12 }}>
                Empowering Students Worldwide to Reach Top Global Universities
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
                Whether you are aiming for tuition-free master&apos;s degrees in Germany, Ivy League research programs in the USA, or high-scholarship opportunities in Switzerland and Singapore, our AI advisor helps you build a winning application package.
              </p>
              <Link href="/profile" className="btn btn-primary">
                Start Your Free Profile Evaluation →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section style={{ padding: "60px 0", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ color: "var(--text-muted)", fontSize: 13, textTransform: "uppercase", letterSpacing: 2, marginBottom: 20 }}>
              Production Architecture
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              {[
                "Python FastAPI", "Next.js 16", "TypeScript", "Groq LLama 3.3",
                "Google Gemini", "OpenRouter", "FAISS", "Turso LibSQL", "MongoDB Atlas", "Puppeteer Stealth",
              ].map((tech) => (
                <span key={tech} className="badge badge-accent" style={{ fontSize: 13, padding: "6px 14px" }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "100px 0", borderTop: "1px solid var(--border)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div className="card" style={{
            maxWidth: 680, margin: "0 auto", padding: "60px 40px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))",
            borderColor: "var(--border-accent)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🎓</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
              Ready to Start Your<br />
              <span className="gradient-text">Study Abroad Journey?</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: 17 }}>
              Join thousands of students who let AI do the heavy lifting.
              Build your profile in 3 minutes.
            </p>
            <Link href="/profile" className="btn btn-primary btn-lg" style={{ fontSize: 18, padding: "16px 40px" }}>
              Get Started — It&apos;s Free ✨
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 0" }}>
        <div className="container flex-between">
          <span style={{ color: "var(--text-muted)", fontSize: 14 }}>
            © 2024 StudyAbroad.AI — Built with ❤️ for students worldwide
          </span>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/dashboard" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none" }}>Dashboard</Link>
            <Link href="/universities" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none" }}>Universities</Link>
            <Link href="/sop" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none" }}>SOP Generator</Link>
            <Link href="/api/docs" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none" }}>API Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
