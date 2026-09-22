"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronUp,
  Cpu,
  Globe,
  Zap,
  Mail,
  Lock,
  Heart,
  FileText,
  Compass,
  Award,
} from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      style={{
        position: "relative",
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border)",
        overflow: "hidden",
        marginTop: "auto",
      }}
    >
      {/* Subtle top ambient glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, var(--accent-light) 50%, transparent 100%)",
          opacity: 0.6,
        }}
      />

      {/* Decorative blurred backdrop glow */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "10%",
          width: "350px",
          height: "350px",
          background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1, padding: "56px 24px 28px" }}>
        {/* ── Top Grid: Brand & Intelligence Digest ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "36px",
            paddingBottom: "44px",
            borderBottom: "1px solid var(--border)",
            marginBottom: "44px",
            alignItems: "start",
          }}
        >
          {/* Brand Info */}
          <div>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                textDecoration: "none",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, var(--accent), var(--accent3))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "var(--shadow-accent)",
                }}
              >
                <GraduationCap size={22} color="#ffffff" />
              </div>
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "20px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  color: "var(--text-primary)",
                }}
              >
                StudyAbroad<span className="gradient-text">.AI</span>
              </span>
            </Link>

            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "14px",
                lineHeight: "1.6",
                maxWidth: "380px",
                marginBottom: "20px",
              }}
            >
              The world&apos;s first fully autonomous AI study abroad platform. Powered by 12 specialized agents and free cloud LLM intelligence to eliminate $5,000 consultant fees.
            </p>

            {/* Live Telemetry Health Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                padding: "6px 14px",
                borderRadius: "100px",
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              <span className="live-pulse" />
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                All 12 AI Agents Operational
              </span>
              <span style={{ color: "var(--text-muted)" }}>•</span>
              <span style={{ color: "#10b981", fontWeight: 700, fontFamily: "monospace" }}>
                99.98% Free Uptime
              </span>
            </div>
          </div>

          {/* Newsletter / Admissions Digest Box */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "24px 28px",
              boxShadow: "var(--shadow-sm)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Sparkles size={16} style={{ color: "var(--accent-light)" }} />
              <h4
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  margin: 0,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Global Admissions & Scholarship Radar
              </h4>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.5", marginBottom: "16px" }}>
              Get autonomous weekly briefings on newly opened fully funded scholarships, deadline alerts, and admission trends.
            </p>

            {subscribed ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "var(--radius)",
                  padding: "12px 16px",
                  color: "#10b981",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={16} />
                <span>You&apos;re subscribed to real-time admission intel!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                  <Mail
                    size={15}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                    }}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Enter your student email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 36px",
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      color: "var(--text-primary)",
                      fontSize: "13px",
                      outline: "none",
                      transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: "10px 18px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderRadius: "var(--radius)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Join Radar
                  <ArrowRight size={13} />
                </button>
              </form>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "12px", fontSize: "11.5px", color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Lock size={12} /> Zero spam guarantee
              </span>
              <span>•</span>
              <span>Unsubscribe anytime</span>
            </div>
          </div>
        </div>

        {/* ── Middle Columns: Deep Navigation Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "32px",
            paddingBottom: "44px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {/* Col 1: AI Agent Suite */}
          <div>
            <h5
              style={{
                fontSize: "12px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "var(--text-primary)",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Cpu size={14} style={{ color: "var(--accent-light)" }} />
              AI Agent Engine
            </h5>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Profile Analyzer", href: "/profile" },
                { label: "University Matcher", href: "/universities" },
                { label: "AI SOP Generator", href: "/sop" },
                { label: "Scholarship Hunter", href: "/dashboard/scholarships" },
                { label: "Deadline Radar", href: "/dashboard/deadlines" },
                { label: "Document AI Audit", href: "/dashboard/documents" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "13.5px",
                      textDecoration: "none",
                      transition: "color 0.15s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2: Platform Discovery */}
          <div>
            <h5
              style={{
                fontSize: "12px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "var(--text-primary)",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Compass size={14} style={{ color: "var(--accent2)" }} />
              Platform Hub
            </h5>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Student Dashboard", href: "/dashboard" },
                { label: "10,000+ Universities", href: "/universities" },
                { label: "Fully Funded Grants", href: "/dashboard/scholarships" },
                { label: "Applicant Readiness Score", href: "/profile" },
                { label: "FAISS Vector Search", href: "/universities" },
                { label: "Live System Health", href: "/api/health" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "13.5px",
                      textDecoration: "none",
                      transition: "color 0.15s ease",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Knowledge & Guides */}
          <div>
            <h5
              style={{
                fontSize: "12px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "var(--text-primary)",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FileText size={14} style={{ color: "var(--warning)" }} />
              Resources & Intel
            </h5>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Fall 2026 Admissions Guide", href: "/universities" },
                { label: "SOP Architect Framework", href: "/sop" },
                { label: "DAAD / German TU9 Pathway", href: "/universities" },
                { label: "US F-1 Visa & I-20 Checklist", href: "/dashboard" },
                { label: "FastAPI Developer Docs", href: "http://localhost:8000/docs", external: true },
                { label: "Zero-Compute Architecture", href: "https://github.com", external: true },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "13.5px",
                      textDecoration: "none",
                      transition: "color 0.15s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")}
                  >
                    {item.label}
                    {item.external && <ArrowUpRight size={12} style={{ color: "var(--text-muted)" }} />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Trust & Verification */}
          <div>
            <h5
              style={{
                fontSize: "12px",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "var(--text-primary)",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <ShieldCheck size={14} style={{ color: "#10b981" }} />
              Trust & Ethics
            </h5>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "100% Free Cloud LLMs", href: "/" },
                { label: "Zero Data Sale Policy", href: "/" },
                { label: "256-Bit Client Encryption", href: "/" },
                { label: "Anti-Consultant Guarantee", href: "/" },
                { label: "Privacy Policy", href: "/" },
                { label: "Terms of Service", href: "/" },
              ].map((item) => (
                <li key={item.label}>
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "13.5px",
                      cursor: "default",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar: Copyright & Global Badges ── */}
        <div
          style={{
            paddingTop: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              © {new Date().getFullYear()} StudyAbroad.AI Platform.
            </span>
            <span style={{ color: "var(--border-accent)" }}>|</span>
            <span style={{ color: "var(--text-secondary)", fontSize: "12.5px" }}>
              Empowering global scholars with zero consultant fees.
            </span>
          </div>

          {/* Infrastructure & Scroll Top Pill */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              <Zap size={13} style={{ color: "var(--accent-light)" }} />
              <span>Groq (Llama 3.3 70B) & Gemini 1.5 Flash</span>
            </div>

            <button
              onClick={scrollToTop}
              title="Back to Top"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget;
                btn.style.color = "var(--text-primary)";
                btn.style.borderColor = "var(--border-accent)";
                btn.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget;
                btn.style.color = "var(--text-secondary)";
                btn.style.borderColor = "var(--border)";
                btn.style.transform = "translateY(0)";
              }}
            >
              <ChevronUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
