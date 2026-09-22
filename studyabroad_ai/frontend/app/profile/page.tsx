"use client";
import { useState } from "react";
import Link from "next/link";
import { analyzeProfile, type ProfileAnalysisResult } from "../../lib/api";

const COUNTRIES = ["USA", "UK", "Canada", "Germany", "Australia", "Singapore", "Netherlands", "Sweden", "Switzerland", "Japan"];
const PROGRAMS = ["Computer Science", "Data Science", "AI & ML", "Business Analytics", "Electrical Engineering", "Biotechnology", "Finance", "MBA", "Public Policy", "Architecture"];
const DEGREES = ["Bachelor's", "Master's", "PhD", "MBA"];

type FormData = {
  full_name: string;
  email: string;
  current_degree: string;
  gpa: string;
  gpa_scale: string;
  gre_verbal: string;
  gre_quant: string;
  gre_aw: string;
  ielts: string;
  toefl: string;
  work_experience_years: string;
  research_papers: string;
  projects: string;
  target_countries: string[];
  target_programs: string[];
  target_degree: string;
  budget_usd: string;
  preferred_intake: string;
  extracurriculars: string;
  achievements: string;
};

const INIT: FormData = {
  full_name: "", email: "", current_degree: "Bachelor's",
  gpa: "", gpa_scale: "4.0",
  gre_verbal: "", gre_quant: "", gre_aw: "",
  ielts: "", toefl: "",
  work_experience_years: "", research_papers: "", projects: "",
  target_countries: [], target_programs: [],
  target_degree: "Master's", budget_usd: "", preferred_intake: "Fall 2025",
  extracurriculars: "", achievements: "",
};

export default function ProfilePage() {
  const [form, setForm] = useState<FormData>(INIT);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProfileAnalysisResult | null>(null);
  const [error, setError] = useState("");
  const TOTAL_STEPS = 4;

  const update = (key: keyof FormData, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleArr = (key: "target_countries" | "target_programs", val: string) => {
    const arr = form[key] as string[];
    update(key, arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await analyzeProfile({
        gpa: parseFloat(form.gpa),
        gpa_scale: parseFloat(form.gpa_scale),
        gre_verbal: form.gre_verbal ? parseInt(form.gre_verbal) : undefined,
        gre_quant: form.gre_quant ? parseInt(form.gre_quant) : undefined,
        ielts_score: form.ielts ? parseFloat(form.ielts) : undefined,
        toefl_score: form.toefl ? parseInt(form.toefl) : undefined,
        work_experience_years: form.work_experience_years ? parseFloat(form.work_experience_years) : undefined,
        research_papers: form.research_papers ? parseInt(form.research_papers) : 0,
        target_countries: form.target_countries,
        target_programs: form.target_programs,
      });
      setResult(data);
      setStep(5);
    } catch {
      setError("Could not reach the AI backend. Make sure the Python API server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  if (step === 5 && result) {
    const scores = result.scores;
    const strengths = result.strengths;
    const weaknesses = result.weaknesses;
    const completeness = result.completeness_score;

    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ maxWidth: 760, width: "100%" }}>
          <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>← Back to Dashboard</Link>
          <div className="card" style={{ padding: "40px 48px" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 32, marginBottom: 8 }}>
                Profile Analysis Complete!
              </h1>
              <p style={{ color: "var(--text-secondary)" }}>AI has scored your profile across 6 dimensions.</p>
            </div>

            {/* Overall score */}
            <div style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))",
              border: "1px solid var(--border-accent)", borderRadius: "var(--radius-lg)",
              padding: "32px", textAlign: "center", marginBottom: 32,
            }}>
              <div style={{ fontSize: 72, fontWeight: 900, color: "var(--accent-light)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {Math.round(typeof completeness === "number" ? completeness : 0)}%
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: 18, marginTop: 4 }}>Overall Profile Score</div>
            </div>

            {/* Score breakdown */}
            {scores && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
                {Object.entries(scores).map(([key, val]) => (
                  <div key={key} style={{ padding: "16px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{key.replace(/_/g, " ")}</span>
                      <span style={{ fontWeight: 800, color: "var(--accent-light)" }}>{Math.round(val)}/100</span>
                    </div>
                    <div className="progress">
                      <div className="progress-bar progress-accent" style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Strengths & Weaknesses */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 12, color: "#10b981" }}>✓ Strengths</h3>
                {(strengths || []).map((s: string) => (
                  <div key={s} style={{ fontSize: 14, padding: "8px 0", color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>
                    {s}
                  </div>
                ))}
              </div>
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 12, color: "var(--warning)" }}>⚠ Areas to Improve</h3>
                {(weaknesses || []).map((w: string) => (
                  <div key={w} style={{ fontSize: 14, padding: "8px 0", color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>
                    {w}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <Link href="/universities" className="btn btn-primary btn-lg" style={{ flex: 1, justifyContent: "center" }}>
                🏛️ See University Matches
              </Link>
              <Link href="/sop" className="btn btn-outline btn-lg" style={{ flex: 1, justifyContent: "center" }}>
                ✍️ Generate SOP
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ maxWidth: 680, width: "100%" }}>
        <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>← Back to Dashboard</Link>

        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 28 }}>Build Your Profile</h1>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Step {step} of {TOTAL_STEPS}</span>
          </div>
          <div className="progress">
            <div className="progress-bar progress-accent" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="card" style={{ padding: "36px 40px" }}>
          {step === 1 && (
            <div>
              <h2 style={{ fontWeight: 700, marginBottom: 24, fontSize: 20 }}>👤 Personal Information</h2>
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Full Name</label>
                  <input className="input" placeholder="John Doe" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Email</label>
                  <input className="input" type="email" placeholder="john@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>GPA</label>
                    <input className="input" type="number" step="0.01" placeholder="3.75" value={form.gpa} onChange={(e) => update("gpa", e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>GPA Scale</label>
                    <select className="input" value={form.gpa_scale} onChange={(e) => update("gpa_scale", e.target.value)}>
                      <option value="4.0">4.0</option>
                      <option value="5.0">5.0</option>
                      <option value="10.0">10.0</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Current / Last Degree</label>
                  <select className="input" value={form.current_degree} onChange={(e) => update("current_degree", e.target.value)}>
                    {DEGREES.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontWeight: 700, marginBottom: 24, fontSize: 20 }}>📊 Test Scores</h2>
              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ padding: "16px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>GRE Scores (optional)</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>Verbal (130-170)</label>
                      <input className="input" type="number" placeholder="155" value={form.gre_verbal} onChange={(e) => update("gre_verbal", e.target.value)} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>Quant (130-170)</label>
                      <input className="input" type="number" placeholder="165" value={form.gre_quant} onChange={(e) => update("gre_quant", e.target.value)} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>AW (0-6)</label>
                      <input className="input" type="number" step="0.5" placeholder="4.0" value={form.gre_aw} onChange={(e) => update("gre_aw", e.target.value)} />
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>IELTS Score (1-9)</label>
                    <input className="input" type="number" step="0.5" placeholder="7.5" value={form.ielts} onChange={(e) => update("ielts", e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>TOEFL Score (0-120)</label>
                    <input className="input" type="number" placeholder="105" value={form.toefl} onChange={(e) => update("toefl", e.target.value)} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Work Experience (years)</label>
                    <input className="input" type="number" step="0.5" placeholder="2" value={form.work_experience_years} onChange={(e) => update("work_experience_years", e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Research Papers Published</label>
                    <input className="input" type="number" placeholder="1" value={form.research_papers} onChange={(e) => update("research_papers", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontWeight: 700, marginBottom: 24, fontSize: 20 }}>🌍 Target Countries</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 32 }}>
                {COUNTRIES.map((c) => (
                  <button key={c} onClick={() => toggleArr("target_countries", c)} style={{
                    padding: "8px 16px", borderRadius: "var(--radius-sm)", cursor: "pointer",
                    background: form.target_countries.includes(c) ? "var(--accent)" : "var(--bg-secondary)",
                    border: `1px solid ${form.target_countries.includes(c) ? "var(--accent)" : "var(--border)"}`,
                    color: form.target_countries.includes(c) ? "#fff" : "var(--text-secondary)",
                    fontSize: 14, fontWeight: 500, transition: "all 0.15s",
                  }}>
                    {c}
                  </button>
                ))}
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 17 }}>🎓 Target Programs</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {PROGRAMS.map((p) => (
                  <button key={p} onClick={() => toggleArr("target_programs", p)} style={{
                    padding: "8px 16px", borderRadius: "var(--radius-sm)", cursor: "pointer",
                    background: form.target_programs.includes(p) ? "var(--accent3)" : "var(--bg-secondary)",
                    border: `1px solid ${form.target_programs.includes(p) ? "var(--accent3)" : "var(--border)"}`,
                    color: form.target_programs.includes(p) ? "#fff" : "var(--text-secondary)",
                    fontSize: 14, fontWeight: 500, transition: "all 0.15s",
                  }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={{ fontWeight: 700, marginBottom: 24, fontSize: 20 }}>✨ Final Details</h2>
              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Target Degree</label>
                    <select className="input" value={form.target_degree} onChange={(e) => update("target_degree", e.target.value)}>
                      {DEGREES.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Preferred Intake</label>
                    <select className="input" value={form.preferred_intake} onChange={(e) => update("preferred_intake", e.target.value)}>
                      {["Fall 2025", "Spring 2026", "Fall 2026"].map((i) => <option key={i}>{i}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Annual Budget (USD)</label>
                  <input className="input" type="number" placeholder="30000" value={form.budget_usd} onChange={(e) => update("budget_usd", e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Extracurricular Activities</label>
                  <textarea className="input" rows={3} placeholder="Hackathons, clubs, volunteering, open-source contributions..." value={form.extracurriculars} onChange={(e) => update("extracurriculars", e.target.value)} style={{ resize: "vertical" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Key Achievements</label>
                  <textarea className="input" rows={3} placeholder="Awards, honors, publications, internships, certifications..." value={form.achievements} onChange={(e) => update("achievements", e.target.value)} style={{ resize: "vertical" }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-sm)", color: "#f87171", fontSize: 14 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            {step > 1 && (
              <button className="btn btn-outline" onClick={() => setStep(s => s - 1)}>← Back</button>
            )}
            <button
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => step < TOTAL_STEPS ? setStep(s => s + 1) : handleSubmit()}
              disabled={loading}
            >
              {loading ? "🤖 AI Analyzing..." : step < TOTAL_STEPS ? "Continue →" : "🚀 Analyze My Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
