"use client";
import Link from "next/link";

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
      <section style={{ paddingTop: 160, paddingBottom: 100, position: "relative", overflow: "hidden" }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
          width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div className="container" style={{ textAlign: "center", position: "relative" }}>
          <div style={{ marginBottom: 24 }}>
            <span className="badge badge-accent">🚀 Production-Grade AI Platform</span>
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
            fontSize: 20, color: "var(--text-secondary)", maxWidth: 620,
            margin: "0 auto 40px", lineHeight: 1.7,
          }}>
            12 specialized AI agents working together to handle every step of your study abroad journey —
            from profile analysis to visa guidance. No consultants. No fees.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/profile" className="btn btn-primary btn-lg">
              ✨ Analyze My Profile — Free
            </Link>
            <Link href="/universities" className="btn btn-outline btn-lg">
              🏛️ Browse Universities
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

      {/* ── 12 Agents Grid ── */}
      <section style={{ padding: "80px 0", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 40, fontWeight: 800, marginBottom: 12 }}>
              12 AI Agents,{" "}
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
            <Link href="/profile" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none" }}>Profile</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
