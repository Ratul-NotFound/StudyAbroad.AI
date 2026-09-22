"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const TEMPLATES = [
  { id: "general", name: "General SOP", desc: "Versatile template for most programs" },
  { id: "research", name: "Research-Focused", desc: "Emphasizes research experience & publications" },
  { id: "industry", name: "Industry Experience", desc: "For candidates with work experience" },
  { id: "scholarship", name: "Scholarship SOP", desc: "Tailored for scholarship applications" },
];

const UNIVERSITIES_MOCK = ["MIT — MSc Computer Science", "ETH Zurich — MSc CS", "TU Munich — MSc Informatics", "NUS — MSc CS", "CMU — MSc ML"];

type Message = { role: "user" | "assistant"; content: string };

export default function SOPPage() {
  const [template, setTemplate] = useState("general");
  const [university, setUniversity] = useState(UNIVERSITIES_MOCK[0]);
  const [generating, setGenerating] = useState(false);
  const [sop, setSop] = useState("");
  const [chatMode, setChatMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const sopRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateSOP = async () => {
    setGenerating(true);
    setSop("");

    // Simulate streaming generation
    const mockSOP = `Statement of Purpose — ${university.split(" — ")[0]}

My journey in Computer Science began not in a classroom, but in a small room with a single computer and an insatiable curiosity about how software could solve real-world problems. This curiosity has driven me through my undergraduate studies, research experiences, and professional work—and it now compels me to pursue graduate studies at ${university.split(" — ")[0]}.

During my undergraduate studies, I maintained a GPA of 3.85/4.0 while conducting research in machine learning optimization. My research on attention mechanisms in transformer models led to a publication at an international conference, where I presented findings on reducing computational complexity by 23% while maintaining model accuracy.

My professional experience at a leading technology company gave me exposure to production AI systems at scale—systems serving millions of users daily. I observed firsthand the gap between academic research and industrial application, and I am determined to bridge this gap through graduate research at ${university.split(" — ")[0]}.

The ${university.split(" — ")[1]} program's focus on [research area] aligns precisely with my academic interests. I am particularly drawn to [Professor Name]'s work on [research topic], and I believe my background in [specific area] would allow me to contribute meaningfully to this research group.

Beyond research, I hope to leverage ${university.split(" — ")[0]}'s exceptional industry connections and alumni network to eventually build AI solutions that have meaningful global impact.

I am confident that my technical foundation, research experience, and passion for innovation make me a strong candidate for your program. I look forward to the opportunity to contribute to and learn from your academic community.`;

    // Stream character by character
    for (let i = 0; i < mockSOP.length; i++) {
      await new Promise((r) => setTimeout(r, 8));
      setSop((prev) => prev + mockSOP[i]);
    }
    setGenerating(false);
    setChatMode(true);
    setMessages([{ role: "assistant", content: "Your SOP has been generated! I can help you refine it. Ask me to make it more research-focused, add specific details, change the tone, or target a specific professor. What would you like to improve?" }]);
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    // Mock AI response
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `Got it! I've noted your request to "${userMsg}". In a live environment, the AI agent would refine the SOP based on this feedback. The updated draft would appear in the editor. For now, you can manually edit the SOP above while your backend API key is being configured.`,
      }]);
    }, 1200);
  };

  const wordCount = sop.trim().split(/\s+/).filter(Boolean).length;
  const charCount = sop.length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)", padding: "20px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ marginBottom: 8 }}>← Dashboard</Link>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 26 }}>✍️ SOP Generator</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>AI-powered Statement of Purpose — replaces $200-500 consultants</p>
          </div>
          {sop && (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => navigator.clipboard?.writeText(sop)}>📋 Copy</button>
              <button className="btn btn-primary btn-sm" onClick={() => {
                const blob = new Blob([sop], { type: "text/plain" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `SOP_${university.split(" — ")[0].replace(/\s+/g, "_")}.txt`;
                a.click();
              }}>⬇ Download</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px", display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
        {/* Config Panel */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Configuration</h3>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>TARGET UNIVERSITY</label>
                <select className="input" value={university} onChange={(e) => setUniversity(e.target.value)}>
                  {UNIVERSITIES_MOCK.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)" }}>SOP TEMPLATE</label>
                <div style={{ display: "grid", gap: 8 }}>
                  {TEMPLATES.map((t) => (
                    <button key={t.id} onClick={() => setTemplate(t.id)} style={{
                      padding: "12px", borderRadius: "var(--radius-sm)", cursor: "pointer", textAlign: "left",
                      background: template === t.id ? "rgba(99,102,241,0.12)" : "var(--bg-secondary)",
                      border: `1px solid ${template === t.id ? "var(--accent)" : "var(--border)"}`,
                      color: "var(--text-primary)", transition: "all 0.15s",
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ justifyContent: "center" }}
                onClick={generateSOP}
                disabled={generating}
              >
                {generating ? "🤖 Generating..." : "🚀 Generate SOP"}
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="card" style={{ padding: "16px 20px", background: "rgba(6,182,212,0.05)", borderColor: "rgba(6,182,212,0.2)" }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "var(--accent2)" }}>💡 Pro Tips</h4>
            <ul style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7, paddingLeft: 16 }}>
              <li>Keep SOP between 800-1200 words</li>
              <li>Mention specific professors you want to work with</li>
              <li>Connect your past experience to future goals</li>
              <li>Customize for each university — no copy-paste!</li>
            </ul>
          </div>
        </div>

        {/* Editor + Chat */}
        <div>
          {/* SOP Editor */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15 }}>📄 Generated SOP</h3>
              {sop && (
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-secondary)" }}>
                  <span>Words: <strong style={{ color: wordCount >= 800 && wordCount <= 1200 ? "#10b981" : "var(--warning)" }}>{wordCount}</strong></span>
                  <span>Characters: <strong>{charCount}</strong></span>
                </div>
              )}
            </div>
            <textarea
              ref={sopRef}
              className="input"
              rows={20}
              value={sop || "Click 'Generate SOP' to create your personalized statement of purpose using AI..."}
              onChange={(e) => setSop(e.target.value)}
              style={{
                resize: "vertical", lineHeight: 1.8, fontSize: 14,
                color: sop ? "var(--text-primary)" : "var(--text-muted)",
              }}
              readOnly={generating}
            />
            {generating && (
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--accent-light)", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: "pulse-glow 1s infinite" }} />
                AI is writing your SOP...
              </div>
            )}
          </div>

          {/* AI Chat for refinement */}
          {chatMode && (
            <div className="card">
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
                🤖 Refine with AI Chat
                <span className="badge badge-success" style={{ marginLeft: 8, fontSize: 11 }}>Active</span>
              </h3>
              <div style={{ height: 200, overflowY: "auto", marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{
                    padding: "10px 14px", borderRadius: "var(--radius-sm)", maxWidth: "85%", fontSize: 14,
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    background: m.role === "user" ? "var(--accent)" : "var(--bg-secondary)",
                    border: m.role === "assistant" ? "1px solid var(--border)" : "none",
                    color: m.role === "user" ? "#fff" : "var(--text-primary)",
                  }}>
                    {m.content}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="input"
                  placeholder="Ask AI to refine your SOP... (e.g. 'Make it more research-focused')"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                />
                <button className="btn btn-primary" onClick={sendChat}>Send →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
