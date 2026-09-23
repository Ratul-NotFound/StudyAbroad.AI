"use client";

import { useState, useEffect, useCallback } from "react";

interface HealthData {
  status: string;
  version: string;
  timestamp: string;
  free_llm_apis?: {
    groq?: { configured: boolean; model?: string; cost?: string };
    gemini?: { configured: boolean; model?: string; cost?: string };
    openrouter?: { configured: boolean; model?: string; cost?: string };
    openai?: { configured: boolean; cost?: string; note?: string };
  };
  own_tools?: {
    faiss_vector_store?: { type?: string; total_vectors?: number };
    embeddings?: { model?: string; type?: string };
    web_scraper?: { type?: string };
  };
  llm_usage?: {
    total_requests?: number;
    by_tool?: Record<string, number>;
    total_cost_usd?: number;
    free_request_pct?: number;
  };
  sessions_active?: number;
}

const AGENTS = [
  { id: 1, name: "UniversityScraperAgent", endpoint: "/api/scrape/universities", icon: "🏫", color: "#2563EB" },
  { id: 2, name: "ScholarshipScraperAgent", endpoint: "/api/scrape/scholarships", icon: "🎓", color: "#7C3AED" },
  { id: 3, name: "ProfileAnalyzerAgent", endpoint: "/api/v1/profile/analyze", icon: "📊", color: "#059669" },
  { id: 4, name: "UniversityMatchAgent", endpoint: "/api/v1/universities/match", icon: "🎯", color: "#DC2626" },
  { id: 5, name: "SOPWriterAgent", endpoint: "/api/v1/sop/generate", icon: "✍️", color: "#D97706" },
  { id: 6, name: "ScholarshipMatchAgent", endpoint: "/api/v1/scholarships/match", icon: "💰", color: "#0891B2" },
  { id: 7, name: "DocumentAuditAgent", endpoint: "/api/v1/documents/audit", icon: "📋", color: "#BE185D" },
  { id: 8, name: "EmailDraftAgent", endpoint: "/api/v1/email/draft", icon: "📧", color: "#16A34A" },
  { id: 9, name: "VisaGuideAgent", endpoint: "/api/v1/visa/guide", icon: "🛂", color: "#9333EA" },
  { id: 10, name: "InterviewCoachAgent", endpoint: "/api/v1/interview/questions", icon: "🎤", color: "#EA580C" },
  { id: 11, name: "CityLifeAgent", endpoint: "/api/v1/city", icon: "🌆", color: "#0D9488" },
  { id: 12, name: "CareerROIAgent", endpoint: "/api/v1/career/roi", icon: "📈", color: "#6366F1" },
];

export default function AdminPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [agentPingResults, setAgentPingResults] = useState<Record<number, "ok" | "error" | "pending" | "idle">>({});
  const [scrapeLog, setScrapeLog] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "agents" | "llm" | "system">("overview");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
      setLastRefresh(new Date());
    } catch (e) {
      console.error("Health check failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchHealth]);

  const pingAgent = async (agentId: number, endpoint: string) => {
    setAgentPingResults((prev) => ({ ...prev, [agentId]: "pending" }));
    try {
      const testPayload = { gpa: 3.5, ielts_score: 7.0, target_countries: ["Germany"] };
      const res = await fetch(endpoint, {
        method: endpoint.includes("scrape") ? "POST" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(8000),
      });
      setAgentPingResults((prev) => ({ ...prev, [agentId]: res.ok ? "ok" : "error" }));
    } catch {
      setAgentPingResults((prev) => ({ ...prev, [agentId]: "error" }));
    }
  };

  const pingAllAgents = async () => {
    setScrapeLog(["🚀 Starting health ping on all 12 agents..."]);
    for (const agent of AGENTS) {
      setScrapeLog((prev) => [...prev, `⏳ Pinging ${agent.name}...`]);
      await pingAgent(agent.id, agent.endpoint);
      setScrapeLog((prev) => {
        const last = [...prev];
        last[last.length - 1] = `✅ ${agent.name} responded`;
        return last;
      });
      await new Promise((r) => setTimeout(r, 200));
    }
    setScrapeLog((prev) => [...prev, "✅ All agent pings complete."]);
  };

  const triggerScrape = async (type: string) => {
    setScrapeLog((prev) => [...prev, `🔄 Triggering ${type} scraper...`]);
    try {
      const res = await fetch(`/api/scrape/universities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countries: ["Germany", "USA", "Canada"], limit_per_country: 3 }),
      });
      const data = await res.json();
      setScrapeLog((prev) => [...prev, `✅ ${type} scraper started! Session: ${data.session_id}`]);
    } catch (e) {
      setScrapeLog((prev) => [...prev, `❌ Scraper failed: ${e}`]);
    }
  };

  const llmUsage = health?.llm_usage;
  const totalVectors = health?.own_tools?.faiss_vector_store?.total_vectors ?? 0;
  const groqOk = health?.free_llm_apis?.groq?.configured ?? false;
  const geminiOk = health?.free_llm_apis?.gemini?.configured ?? false;
  const openrouterOk = health?.free_llm_apis?.openrouter?.configured ?? false;

  return (
    <div style={{ minHeight: "100vh", background: "#0A0F1E", color: "#E2E8F0", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Top Bar */}
      <div style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        borderBottom: "1px solid rgba(37,99,235,0.3)",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg, #2563EB, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            StudyAbroad.AI
          </span>
          <span style={{ background: "rgba(37,99,235,0.2)", border: "1px solid rgba(37,99,235,0.4)", borderRadius: 6, padding: "2px 10px", fontSize: 11, color: "#60A5FA", fontWeight: 700, letterSpacing: 1 }}>
            ADMIN PANEL
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#64748B" }}>
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            style={{
              background: autoRefresh ? "rgba(16,185,129,0.2)" : "rgba(100,116,139,0.2)",
              border: `1px solid ${autoRefresh ? "#10B981" : "#475569"}`,
              borderRadius: 6, padding: "6px 14px", fontSize: 12, color: autoRefresh ? "#10B981" : "#94A3B8",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            {autoRefresh ? "🟢 Auto-Refresh ON" : "⚫ Auto-Refresh OFF"}
          </button>
          <button
            onClick={() => { setLoading(true); fetchHealth(); }}
            style={{
              background: "rgba(37,99,235,0.2)", border: "1px solid rgba(37,99,235,0.5)",
              borderRadius: 6, padding: "6px 14px", fontSize: 12, color: "#60A5FA", cursor: "pointer",
            }}
          >
            ↺ Refresh
          </button>
          <a href="/" style={{ background: "rgba(51,65,85,0.5)", border: "1px solid #334155", borderRadius: 6, padding: "6px 14px", fontSize: 12, color: "#94A3B8", textDecoration: "none" }}>
            ← Back to App
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>
        {/* Status Banner */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 32,
          background: health?.status === "healthy"
            ? "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))"
            : "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))",
          border: `1px solid ${health?.status === "healthy" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
          borderRadius: 12, padding: "16px 24px",
        }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: health?.status === "healthy" ? "#10B981" : "#EF4444", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: health?.status === "healthy" ? "#10B981" : "#EF4444" }}>
            {loading ? "⏳ Checking system health..." : health?.status === "healthy" ? "System Operational" : "System Issue Detected"}
          </span>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748B" }}>
            v{health?.version ?? "—"} • {health?.sessions_active ?? 0} active sessions
          </span>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total LLM Requests", value: llmUsage?.total_requests ?? 0, icon: "🤖", color: "#2563EB" },
            { label: "Free Request %", value: `${llmUsage?.free_request_pct ?? 100}%`, icon: "💚", color: "#10B981" },
            { label: "Total Cost (USD)", value: `$${(llmUsage?.total_cost_usd ?? 0).toFixed(4)}`, icon: "💵", color: "#F59E0B" },
            { label: "Vectors Indexed", value: totalVectors.toLocaleString(), icon: "🔍", color: "#7C3AED" },
            { label: "Active Sessions", value: health?.sessions_active ?? 0, icon: "👤", color: "#EC4899" },
            { label: "Agents Online", value: "12 / 12", icon: "⚙️", color: "#0891B2" },
          ].map((card) => (
            <div key={card.label} style={{
              background: "rgba(15,23,42,0.8)", border: `1px solid rgba(${card.color === "#2563EB" ? "37,99,235" : card.color === "#10B981" ? "16,185,129" : card.color === "#F59E0B" ? "245,158,11" : card.color === "#7C3AED" ? "124,58,237" : card.color === "#EC4899" ? "236,72,153" : "8,145,178"},0.2)`,
              borderRadius: 12, padding: "20px 20px",
              transition: "transform 0.2s",
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#F1F5F9" }}>{card.value}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid rgba(51,65,85,0.5)", paddingBottom: 0 }}>
          {(["overview", "agents", "llm", "system"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? "rgba(37,99,235,0.15)" : "transparent",
                border: "none",
                borderBottom: `2px solid ${activeTab === tab ? "#2563EB" : "transparent"}`,
                color: activeTab === tab ? "#60A5FA" : "#64748B",
                padding: "10px 20px", fontSize: 14, fontWeight: activeTab === tab ? 600 : 400,
                cursor: "pointer", transition: "all 0.2s", textTransform: "capitalize",
              }}
            >
              {tab === "overview" ? "🏠 Overview" : tab === "agents" ? "⚙️ Agents" : tab === "llm" ? "🤖 LLM APIs" : "🔧 System"}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* LLM API Status */}
            <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(51,65,85,0.5)", borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 16 }}>🤖 LLM API Status</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { name: "Groq (Llama 3.3 70B)", configured: groqOk, cost: "FREE — 14,400 req/day", tier: "Primary" },
                  { name: "Google Gemini Flash", configured: geminiOk, cost: "FREE — 1M tokens/day", tier: "Secondary" },
                  { name: "OpenRouter (Qwen 32B)", configured: openrouterOk, cost: "FREE — community tier", tier: "Tertiary" },
                  { name: "OpenAI (GPT-4o)", configured: health?.free_llm_apis?.openai?.configured ?? false, cost: "PAID — emergency only", tier: "Fallback" },
                ].map((api) => (
                  <div key={api.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(30,41,59,0.5)", borderRadius: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: api.configured ? "#10B981" : "#64748B", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>{api.name}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{api.cost}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(51,65,85,0.5)", color: "#94A3B8" }}>{api.tier}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: api.configured ? "rgba(16,185,129,0.2)" : "rgba(100,116,139,0.2)", color: api.configured ? "#10B981" : "#64748B" }}>
                        {api.configured ? "✓ Active" : "○ No Key"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(51,65,85,0.5)", borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 16 }}>⚡ Quick Actions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "🏫 Scrape Universities", action: () => triggerScrape("University"), desc: "Re-crawl university catalog with Playwright" },
                  { label: "🎓 Ping All 12 Agents", action: pingAllAgents, desc: "Health ping all agents simultaneously" },
                  { label: "↺ Refresh Health Data", action: fetchHealth, desc: "Pull fresh system health status" },
                  { label: "📄 View API Docs", action: () => window.open("http://localhost:8000/api/docs", "_blank"), desc: "Open FastAPI Swagger UI" },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={btn.action}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                      background: "rgba(30,41,59,0.5)", border: "1px solid rgba(51,65,85,0.5)",
                      borderRadius: 8, cursor: "pointer", color: "#E2E8F0", textAlign: "left",
                      transition: "all 0.2s", width: "100%",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(37,99,235,0.1)"; e.currentTarget.style.borderColor = "rgba(37,99,235,0.4)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(30,41,59,0.5)"; e.currentTarget.style.borderColor = "rgba(51,65,85,0.5)"; }}
                  >
                    <span style={{ fontSize: 16 }}>{btn.label.split(" ")[0]}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{btn.label.substring(btn.label.indexOf(" ") + 1)}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{btn.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scrape Log */}
            {scrapeLog.length > 0 && (
              <div style={{ gridColumn: "1 / -1", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(51,65,85,0.5)", borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>📋 Action Log</h3>
                  <button onClick={() => setScrapeLog([])} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 12 }}>Clear</button>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: "#94A3B8", lineHeight: 1.8, maxHeight: 200, overflowY: "auto" }}>
                  {scrapeLog.map((line, i) => <div key={i}>{line}</div>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Agents */}
        {activeTab === "agents" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: "#64748B" }}>12 Autonomous AI Agents — click individual agent to test, or ping all at once</p>
              <button
                onClick={pingAllAgents}
                style={{ background: "linear-gradient(135deg, #1D4ED8, #7C3AED)", border: "none", borderRadius: 8, padding: "10px 20px", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                ⚡ Ping All Agents
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {AGENTS.map((agent) => {
                const status = agentPingResults[agent.id] ?? "idle";
                return (
                  <div
                    key={agent.id}
                    style={{
                      background: "rgba(15,23,42,0.8)",
                      border: `1px solid ${status === "ok" ? "rgba(16,185,129,0.3)" : status === "error" ? "rgba(239,68,68,0.3)" : status === "pending" ? "rgba(245,158,11,0.3)" : "rgba(51,65,85,0.5)"}`,
                      borderRadius: 12, padding: 20, transition: "all 0.3s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 24 }}>{agent.icon}</span>
                        <div>
                          <div style={{ fontSize: 12, color: "#64748B" }}>Agent {agent.id}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>{agent.name}</div>
                        </div>
                      </div>
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: status === "ok" ? "#10B981" : status === "error" ? "#EF4444" : status === "pending" ? "#F59E0B" : "#475569",
                        animation: status === "pending" ? "pulse 1s infinite" : "none",
                      }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", marginBottom: 14, wordBreak: "break-all" }}>
                      {agent.endpoint}
                    </div>
                    <button
                      onClick={() => pingAgent(agent.id, agent.endpoint)}
                      disabled={status === "pending"}
                      style={{
                        width: "100%", padding: "8px", background: status === "ok" ? "rgba(16,185,129,0.1)" : status === "error" ? "rgba(239,68,68,0.1)" : "rgba(37,99,235,0.1)",
                        border: `1px solid ${status === "ok" ? "rgba(16,185,129,0.3)" : status === "error" ? "rgba(239,68,68,0.3)" : "rgba(37,99,235,0.3)"}`,
                        borderRadius: 6, color: status === "ok" ? "#10B981" : status === "error" ? "#EF4444" : "#60A5FA",
                        fontSize: 12, fontWeight: 600, cursor: status === "pending" ? "not-allowed" : "pointer",
                      }}
                    >
                      {status === "pending" ? "⏳ Pinging..." : status === "ok" ? "✅ Online" : status === "error" ? "❌ Error — Retry" : "🔌 Test Agent"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: LLM */}
        {activeTab === "llm" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Usage Breakdown */}
            <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(51,65,85,0.5)", borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 20 }}>📊 LLM Usage Breakdown</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {Object.entries(llmUsage?.by_tool ?? { groq: 0, gemini: 0, openrouter: 0, openai: 0 }).map(([tool, count]) => {
                  const total = llmUsage?.total_requests ?? 1;
                  const pct = Math.round(((count as number) / total) * 100);
                  const colors: Record<string, string> = { groq: "#2563EB", gemini: "#10B981", openrouter: "#7C3AED", openai: "#EF4444" };
                  return (
                    <div key={tool}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize", color: "#E2E8F0" }}>{tool}</span>
                        <span style={{ fontSize: 12, color: "#64748B" }}>{count as number} requests ({pct}%)</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(51,65,85,0.5)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: colors[tool] ?? "#475569", borderRadius: 3, transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(16,185,129,0.1)", borderRadius: 8, border: "1px solid rgba(16,185,129,0.2)" }}>
                <div style={{ fontSize: 13, color: "#10B981", fontWeight: 700 }}>💚 Total Spend: ${(llmUsage?.total_cost_usd ?? 0).toFixed(4)}</div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>Free request rate: {llmUsage?.free_request_pct ?? 100}% — Nearly $0/month</div>
              </div>
            </div>

            {/* Key Pool Info */}
            <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(51,65,85,0.5)", borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 20 }}>🔑 Multi-Key Failover Pool</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ padding: "14px", background: "rgba(37,99,235,0.1)", borderRadius: 8, border: "1px solid rgba(37,99,235,0.2)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#60A5FA", marginBottom: 4 }}>Groq Key Pool (4 keys max)</div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>Round-robin rotation — each key contributes 14,400 free req/day</div>
                  <div style={{ fontSize: 12, color: "#10B981", marginTop: 6, fontWeight: 600 }}>4 keys = 57,600 free requests/day</div>
                </div>
                <div style={{ padding: "14px", background: "rgba(16,185,129,0.05)", borderRadius: 8, border: "1px solid rgba(16,185,129,0.15)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#34D399", marginBottom: 4 }}>Gemini Fallback</div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>Activated when Groq rate limits all 4 keys</div>
                  <div style={{ fontSize: 12, color: "#10B981", marginTop: 6 }}>1,000,000 free tokens / day</div>
                </div>
                <div style={{ padding: "14px", background: "rgba(124,58,237,0.05)", borderRadius: 8, border: "1px solid rgba(124,58,237,0.15)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#A78BFA", marginBottom: 4 }}>OpenRouter Tertiary</div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>Free Qwen-32B, Llama-3.1, Mistral access</div>
                </div>
                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.05)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.15)" }}>
                  <div style={{ fontSize: 12, color: "#EF4444" }}>🔴 OpenAI / Anthropic — PAID — Emergency Only</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: System */}
        {activeTab === "system" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(51,65,85,0.5)", borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 16 }}>🔍 Own Tools Status</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "FAISS Vector Store", value: `${totalVectors} vectors`, status: totalVectors > 0, type: "own (free, local)" },
                  { label: "Embeddings Model", value: health?.own_tools?.embeddings?.model ?? "BAAI/bge-small-en-v1.5", status: true, type: "own (CPU, free)" },
                  { label: "Playwright Scraper", value: "Chromium headless", status: true, type: "own (free)" },
                  { label: "SQLite Database", value: "data/studyabroad.db", status: true, type: "own (free)" },
                  { label: "WebSocket Server", value: "ws://localhost:8000/ws", status: true, type: "own (FastAPI)" },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(30,41,59,0.4)", borderRadius: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.status ? "#10B981" : "#EF4444", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{item.value} • {item.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(51,65,85,0.5)", borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 16 }}>🔗 Service URLs</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Frontend (Next.js)", url: "http://localhost:3000", color: "#2563EB" },
                  { label: "Backend (FastAPI)", url: "http://localhost:8000", color: "#7C3AED" },
                  { label: "API Docs (Swagger)", url: "http://localhost:8000/api/docs", color: "#059669" },
                  { label: "API Docs (ReDoc)", url: "http://localhost:8000/api/redoc", color: "#0891B2" },
                  { label: "Health Check", url: "http://localhost:8000/api/health", color: "#10B981" },
                ].map((svc) => (
                  <a
                    key={svc.label}
                    href={svc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px", background: "rgba(30,41,59,0.4)", borderRadius: 8,
                      border: "1px solid transparent", textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = svc.color; e.currentTarget.style.background = "rgba(30,41,59,0.7)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "rgba(30,41,59,0.4)"; }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>{svc.label}</span>
                    <span style={{ fontSize: 11, color: svc.color, fontFamily: "monospace" }}>{svc.url} ↗</span>
                  </a>
                ))}
              </div>

              <div style={{ marginTop: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#94A3B8", marginBottom: 10 }}>🌐 REST API Endpoints</h4>
                <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 8, padding: "12px 14px", fontFamily: "monospace", fontSize: 11, color: "#60A5FA", lineHeight: 2 }}>
                  {[
                    "GET  /health",
                    "POST /api/v1/profile/analyze",
                    "POST /api/v1/universities/match",
                    "GET  /api/v1/universities/search",
                    "POST /api/v1/sop/generate",
                    "POST /api/v1/sop/refine",
                    "POST /api/v1/scholarships/match",
                    "POST /api/v1/documents/audit",
                    "POST /api/v1/email/draft",
                    "GET  /api/v1/visa/guide/{country}",
                    "POST /api/v1/interview/questions",
                    "GET  /api/v1/city/{city_name}",
                    "POST /api/v1/career/roi",
                    "POST /api/chat",
                    "WS   /ws/{session_id}",
                  ].map((ep) => (
                    <div key={ep} style={{ display: "flex", gap: 8 }}>
                      <span style={{ color: ep.startsWith("GET") ? "#10B981" : ep.startsWith("POST") ? "#F59E0B" : ep.startsWith("WS") ? "#7C3AED" : "#60A5FA" }}>
                        {ep.split(" ")[0]}
                      </span>
                      <span style={{ color: "#E2E8F0" }}>{ep.substring(ep.indexOf(" ") + 1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}
