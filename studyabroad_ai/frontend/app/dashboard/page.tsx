"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const SIDEBAR_ITEMS = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/profile", icon: "👤", label: "My Profile" },
  { href: "/universities", icon: "🏛️", label: "Universities" },
  { href: "/sop", icon: "✍️", label: "SOP Generator" },
  { href: "/dashboard/scholarships", icon: "💰", label: "Scholarships" },
  { href: "/dashboard/deadlines", icon: "📅", label: "Deadlines" },
  { href: "/dashboard/documents", icon: "📁", label: "Documents" },
];

const QUICK_STATS = [
  { label: "Profile Score", value: "87%", icon: "⭐", change: "+5%", color: "var(--accent-light)" },
  { label: "Universities Matched", value: "23", icon: "🏛️", change: "+3 new", color: "var(--accent2)" },
  { label: "Scholarships Found", value: "14", icon: "💰", change: "+2 today", color: "#10b981" },
  { label: "Days to Deadline", value: "47", icon: "⏰", change: "MIT Early", color: "var(--warning)" },
];

const RECENT_AGENTS = [
  { agent: "Profile Analyzer", status: "completed", time: "2 min ago", result: "GPA: 90/100, IELTS: 85/100" },
  { agent: "University Matcher", status: "completed", time: "5 min ago", result: "23 universities matched (Reach: 8, Match: 10, Safe: 5)" },
  { agent: "Scholarship Hunter", status: "running", time: "now", result: "Scanning 50K+ scholarships..." },
  { agent: "SOP Writer", status: "queued", time: "next", result: "Waiting for profile finalization" },
];

const UNIVERSITIES_PREVIEW = [
  { name: "MIT", country: "🇺🇸 USA", match: 78, tier: "Reach", program: "MSc Computer Science", deadline: "Dec 1" },
  { name: "ETH Zurich", country: "🇨🇭 Switzerland", match: 85, tier: "Match", program: "MSc Computer Science", deadline: "Dec 15" },
  { name: "TU Munich", country: "🇩🇪 Germany", match: 92, tier: "Safe", program: "MSc Informatics", deadline: "Jan 15" },
  { name: "NUS Singapore", country: "🇸🇬 Singapore", match: 88, tier: "Match", program: "MSc Computer Science", deadline: "Jan 1" },
];

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; label: string }> = {
    completed: { cls: "badge-success", label: "✓ Done" },
    running: { cls: "badge-accent", label: "⟳ Running" },
    queued: { cls: "badge-warning", label: "◷ Queued" },
  };
  const c = cfg[status] || cfg.queued;
  return <span className={`badge ${c.cls}`}>{c.label}</span>;
}

function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, string> = { Reach: "badge-danger", Match: "badge-accent", Safe: "badge-success" };
  return <span className={`badge ${map[tier] || "badge-accent"}`}>{tier}</span>;
}

export default function DashboardPage() {
  const pathname = usePathname();
  const [agentRunning, setAgentRunning] = useState(false);

  const runAgents = () => {
    setAgentRunning(true);
    setTimeout(() => setAgentRunning(false), 3000);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, flexShrink: 0,
        borderRight: "1px solid var(--border)",
        background: "var(--bg-secondary)",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh",
      }}>
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18 }}>
              <span className="gradient-text">StudyAbroad</span>
              <span style={{ color: "var(--text-secondary)" }}>.AI</span>
            </span>
          </Link>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: "var(--radius-sm)", marginBottom: 4, textDecoration: "none",
                background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
                color: isActive ? "var(--accent-light)" : "var(--text-secondary)",
                fontSize: 14, fontWeight: 500, transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border)" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))",
            border: "1px solid var(--border-accent)", borderRadius: "var(--radius)",
            padding: "16px",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Profile Complete</div>
            <div className="progress" style={{ marginBottom: 8 }}>
              <div className="progress-bar progress-accent" style={{ width: "87%" }} />
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>87% — Add GRE score to reach 95%</div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        {/* Header */}
        <div style={{
          padding: "20px 32px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, background: "rgba(10,10,15,0.85)",
          backdropFilter: "blur(20px)", zIndex: 50,
        }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Dashboard</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Your AI agents are working for you 24/7</p>
          </div>
          <button
            onClick={runAgents}
            className="btn btn-primary"
            style={{ animation: agentRunning ? "pulse-glow 1s ease-in-out infinite" : "none" }}
            disabled={agentRunning}
          >
            {agentRunning ? "⟳ Agents Running..." : "🚀 Run All Agents"}
          </button>
        </div>

        <div style={{ padding: "32px" }}>
          {/* Quick Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 32 }}>
            {QUICK_STATS.map((stat) => (
              <div key={stat.label} className="card" style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{stat.icon}</span>
                  <span className="badge badge-success" style={{ fontSize: 11 }}>{stat.change}</span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: stat.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Agent Status */}
            <div className="card">
              <h2 style={{ fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                🤖 Agent Activity
                <span className="badge badge-success" style={{ fontSize: 11 }}>Live</span>
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {RECENT_AGENTS.map((a) => (
                  <div key={a.agent} style={{
                    padding: "14px 16px", borderRadius: "var(--radius-sm)",
                    background: "var(--bg-secondary)", border: "1px solid var(--border)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{a.agent}</span>
                      <StatusBadge status={a.status} />
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{a.result}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{a.time}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* University Matches */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontWeight: 700 }}>🏛️ Top Matches</h2>
                <Link href="/universities" className="btn btn-ghost btn-sm">View All →</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {UNIVERSITIES_PREVIEW.map((uni) => (
                  <div key={uni.name} style={{
                    padding: "14px 16px", borderRadius: "var(--radius-sm)",
                    background: "var(--bg-secondary)", border: "1px solid var(--border)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 15 }}>{uni.name}</span>
                        <TierBadge tier={uni.tier} />
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {uni.country} • {uni.program}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        Deadline: {uni.deadline}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: uni.match >= 85 ? "#10b981" : "var(--accent-light)" }}>
                        {uni.match}%
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>match</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SOP Quick Launch */}
          <div className="card" style={{
            marginTop: 24, padding: "28px 32px",
            background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.05))",
            borderColor: "var(--border-accent)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>✍️ Generate Your SOP Now</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                AI-powered Statement of Purpose tailored to each university. Replaces $200-500 consultant services.
              </p>
            </div>
            <Link href="/sop" className="btn btn-primary btn-lg">Generate SOP →</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
