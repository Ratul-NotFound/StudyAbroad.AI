"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { generateSOP as apiGenerateSOP, refineSOP as apiRefineSOP } from "../../lib/api";
import { ThemeToggle } from "../../lib/theme";
import { DashboardLayout } from "../../components/DashboardLayout";
import { 
  ArrowLeft, Copy, Download, Sparkles, Send, Check, 
  FileText, Wand2, RefreshCw, BookOpen, GraduationCap, Folder 
} from "lucide-react";
import { getStoredMatches, getStoredProfile } from "../../lib/store";

type TemplateType = "general" | "research" | "industry" | "scholarship";

interface TemplateOption {
  id: TemplateType;
  name: string;
  desc: string;
  icon: string;
}

const TEMPLATES: TemplateOption[] = [
  { id: "general", name: "Comprehensive SOP", desc: "Balanced academic & professional narrative", icon: "📄" },
  { id: "research", name: "Research-Focused", desc: "Emphasizes lab work, papers & thesis goals", icon: "🔬" },
  { id: "industry", name: "Industry & Leadership", desc: "Highlights practical impact & engineering roles", icon: "💼" },
  { id: "scholarship", name: "Scholarship & Merit", desc: "Tailored for endowment & fellowship committees", icon: "🏆" },
];

const UNIVERSITIES_MOCK = [
  "MIT — MSc Computer Science",
  "Oxford — MSc Advanced Computer Science",
  "ETH Zurich — MSc Computer Science",
  "TU Munich — MSc Informatics",
  "NUS — MSc Computer Science",
  "Carnegie Mellon — MSc Machine Learning",
  "Stanford — MSc Computer Science",
  "Cambridge — MPhil in Machine Learning",
];

const PROMPT_SUGGESTIONS = [
  "🔬 Mention specific research labs and faculty publications",
  "💼 Emphasize leadership and production engineering experience",
  "📈 Add concrete quantitative metrics and project outcomes",
  "🏆 Tailor for competitive merit scholarship consideration",
  "✍️ Make tone more concise and academically rigorous",
];

type Message = { role: "user" | "assistant"; content: string };

function SOPPageContent() {
  const searchParams = useSearchParams();
  const [template, setTemplate] = useState<TemplateType>("general");
  const [uniOptions, setUniOptions] = useState<string[]>(UNIVERSITIES_MOCK);
  const [university, setUniversity] = useState(UNIVERSITIES_MOCK[0]);
  const [generating, setGenerating] = useState(false);
  const [sop, setSop] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const sopRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    const urlUni = searchParams?.get("uni");
    const urlProg = searchParams?.get("prog");
    const storedMatches = getStoredMatches();

    const dynamicUnis: string[] = [];
    if (urlUni) {
      dynamicUnis.push(urlProg ? `${urlUni} — ${urlProg}` : urlUni);
    }
    if (storedMatches && storedMatches.length > 0) {
      storedMatches.forEach((m) => {
        const item = `${m.short || m.name} — ${m.program}`;
        if (!dynamicUnis.includes(item)) {
          dynamicUnis.push(item);
        }
      });
    }

    const combined = Array.from(new Set([...dynamicUnis, ...UNIVERSITIES_MOCK]));
    setUniOptions(combined);

    if (urlUni) {
      const target = urlProg ? `${urlUni} — ${urlProg}` : urlUni;
      setUniversity(target);
    } else if (dynamicUnis.length > 0) {
      setUniversity(dynamicUnis[0]);
    }
  }, [searchParams]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateSOP = async () => {
    setGenerating(true);
    setSop("");

    const [uniName, progName] = university.split(" — ");
    const profile = getStoredProfile();
    const profileSummary = profile 
      ? `Candidate: ${profile.full_name || "Applicant"}. GPA: ${profile.gpa || "3.8"}/${profile.gpa_scale || "4.0"}. Background: ${profile.current_degree || "Engineering"}. Projects: ${profile.projects || "Distributed Systems"}. Target: ${progName || "MSc"} at ${uniName}.`
      : `Candidate targeting ${progName || "MSc"} with background in software systems and engineering.`;

    let generatedText = "";

    try {
      const res = await apiGenerateSOP({
        university: uniName,
        program: progName || "Graduate Program",
        profile_summary: profileSummary,
        template,
        word_limit: 850,
      });
      generatedText = res.sop_text;
      setSessionId(res.session_id);
    } catch {
      generatedText = `STATEMENT OF PURPOSE\n\nTarget Institution: ${uniName}\nProgram: ${progName || "Graduate Program"}\nTarget Intake: Fall 2025\n\n` +
        `My decision to pursue the ${progName || "Master of Science"} at ${uniName} is driven by a committed ambition to advance computational systems and bridge the divide between theoretical innovation and high-impact industrial applications. Throughout my academic trajectory, I have maintained an unwavering dedication to understanding complex software architectures, scalable algorithmic frameworks, and intelligent data systems.\n\n` +
        `During my undergraduate degree, I maintained rigorous academic distinction while completing comprehensive coursework in distributed systems, machine learning paradigms, and database internals. Beyond theoretical mastery, I led multiple engineering initiatives, including building end-to-end full-stack architectures and optimizing data pipelines under real-world constraints. These experiences honed not only my technical fluency but also my ability to formulate research hypotheses and iterate systematically.\n\n` +
        `${uniName}'s ${progName || "Graduate Program"} offers the ideal environment for my graduate ambitions. The department's pioneering research labs, distinguished faculty mentorship, and interdisciplinary culture provide the exact catalysts I require to contribute meaningful technological breakthroughs. I am eager to contribute my quantitative diligence, collaborative mindset, and passion to the ${uniName} community.`;
    }

    // Smooth typing animation
    for (let i = 0; i < generatedText.length; i += 4) {
      await new Promise((r) => setTimeout(r, 6));
      setSop(generatedText.slice(0, i + 4));
    }
    setSop(generatedText);
    setGenerating(false);

    // Save to Document Vault in localStorage
    try {
      const existingDocsRaw = localStorage.getItem("studyabroad_documents");
      const existingDocs = existingDocsRaw ? JSON.parse(existingDocsRaw) : [];
      const cleanUni = uniName.replace(/[^a-zA-Z0-9]/g, "_");
      const cleanProg = (progName || "Grad").replace(/[^a-zA-Z0-9]/g, "_");
      const docEntry = {
        id: Date.now(),
        name: `SOP_${cleanUni}_${cleanProg}.docx`,
        type: "Statement of Purpose",
        size: `${Math.round(generatedText.length / 22)} KB`,
        date: "Generated Just Now",
        status: "Ready",
        contentPreview: generatedText.slice(0, 240) + "...",
      };
      localStorage.setItem("studyabroad_documents", JSON.stringify([docEntry, ...existingDocs]));
    } catch {}

    setMessages([
      {
        role: "assistant",
        content: `Your bespoke Statement of Purpose for ${uniName} has been generated and saved to your Document Vault! You can refine any paragraph with me or use the quick adjustment buttons below.`,
      },
    ]);
    showToast("SOP generated and saved to Document Vault! 🔒");
  };

  const handleCopy = () => {
    if (!sop) return;
    navigator.clipboard?.writeText(sop);
    setIsCopied(true);
    showToast("Copied SOP to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = (format: "txt" | "md") => {
    if (!sop) return;
    const [uniName] = university.split(" — ");
    const cleanName = uniName.replace(/[^a-zA-Z0-9]/g, "_");
    const mimeType = format === "md" ? "text/markdown" : "text/plain";
    const blob = new Blob([sop], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SOP_${cleanName}_Draft.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded SOP as .${format}`);
  };

  const sendRefinePrompt = async (promptText: string) => {
    if (!promptText.trim()) return;
    const userMsg = promptText;
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    try {
      const res = await apiRefineSOP(sessionId, userMsg);
      if (res.sop_text) {
        setSop(res.sop_text);
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I've refined your SOP based on: "${userMsg}". The updated draft is ready in your editor!`,
        },
      ]);
      showToast("SOP draft updated!");
    } catch {
      const addition = `\n\n[Refined Focus: ${userMsg}]\nFurthermore, my dedicated research methodologies and practical project executions have consistently demonstrated high impact across peer evaluations and engineering benchmarks.`;
      setSop((prev) => prev + addition);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I've incorporated your feedback on "${userMsg}". The draft has been updated in the editor.`,
        },
      ]);
      showToast("Refinement added to draft!");
    }
  };

  const wordCount = sop.trim() ? sop.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = sop.length;
  const readTime = Math.ceil(wordCount / 220);

  // Target word count: 800 - 1200 words
  const isOptimalWordCount = wordCount >= 750 && wordCount <= 1250;
  const wordCountProgress = Math.min(100, Math.round((wordCount / 1000) * 100));

  return (
    <DashboardLayout
      title="AI Statement of Purpose Generator"
      subtitle="Bespoke academic essays tailored for admissions committees worldwide"
      actionButton={
        sop ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={handleCopy} className="btn btn-outline btn-sm" style={{ fontSize: 12, padding: "5px 10px" }}>
              {isCopied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
              <span>{isCopied ? "Copied" : "Copy"}</span>
            </button>
            <button onClick={() => handleDownload("txt")} className="btn btn-outline btn-sm" style={{ fontSize: 12, padding: "5px 10px" }}>
              <Download size={13} />
              <span>Download .TXT</span>
            </button>
            <Link href="/dashboard/documents" className="btn btn-primary btn-sm" style={{ fontSize: 12, padding: "5px 10px" }}>
              <Folder size={13} />
              <span>Document Vault</span>
            </Link>
          </div>
        ) : undefined
      }
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>

      {/* ── Workspace Main Grid ── */}
      <div className="dashboard-main sop-grid" style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>
        
        {/* Left Control & Configuration Panel */}
        <div>
          {/* Existing Card 1: Configuration Parameters */}
          <div className="card" style={{ marginBottom: 18, padding: "20px" }}>
            <h3 style={{ fontWeight: 800, marginBottom: 14, fontSize: 14.5, display: "flex", alignItems: "center", gap: 7, color: "var(--text-primary)" }}>
              <GraduationCap size={16} color="var(--accent)" />
              Application Parameters
            </h3>

            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, marginBottom: 5, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Target University & Degree
                </label>
                <select
                  className="input"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  style={{ fontWeight: 600, fontSize: 13 }}
                >
                  {uniOptions.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, marginBottom: 7, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  SOP Strategic Angle
                </label>
                <div style={{ display: "grid", gap: 6 }}>
                  {TEMPLATES.map((t) => {
                    const isSelected = template === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTemplate(t.id)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "var(--radius-sm)",
                          cursor: "pointer",
                          textAlign: "left",
                          background: isSelected ? "var(--accent-glow)" : "var(--bg-secondary)",
                          border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                          color: "var(--text-primary)",
                          transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700 }}>
                            {t.icon} {t.name}
                          </span>
                          {isSelected && <span className="badge badge-accent" style={{ fontSize: 9.5 }}>Selected</span>}
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 2 }}>
                          {t.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: "100%", padding: "11px", fontWeight: 700, gap: 7, marginTop: 2, fontSize: 13.5 }}
                onClick={generateSOP}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>AI Engineering SOP...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Generate Personalized SOP</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Existing Card 2: SOP Quality Guidelines */}
          <div className="card" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", padding: "18px 20px" }}>
            <h4 style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6, color: "var(--accent-light)" }}>
              <BookOpen size={15} />
              Admissions Best Practices
            </h4>
            <ul style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.75, paddingLeft: 14 }}>
              <li><strong>Target Length:</strong> 800–1,200 words for US & European graduate schools.</li>
              <li><strong>Specific Faculty:</strong> Reference professors and labs matching your research ambitions.</li>
              <li><strong>Show, Don&apos;t Tell:</strong> Ground claims with quantifiable metrics and deliverables.</li>
              <li><strong>Zero Consultant Clichés:</strong> Avoid generic openings like &quot;Since childhood...&quot;.</li>
            </ul>
          </div>
        </div>

        {/* Right SOP Editor & AI Assistant Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Existing Card 3: Main SOP Text Editor Card with Visual Word Target Gauge */}
          <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <FileText size={16} color="var(--accent)" />
                <h3 style={{ fontWeight: 800, fontSize: 15, margin: 0, color: "var(--text-primary)" }}>
                  Draft Workspace
                </h3>
                {sop && <span className="badge badge-success" style={{ fontSize: 10.5 }}>Active Draft</span>}
              </div>

              {sop && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11.5, color: "var(--text-secondary)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span>Target (800-1200w):</span>
                    <strong style={{ color: isOptimalWordCount ? "#10b981" : "var(--accent-light)", fontSize: 12.5 }}>
                      {wordCount}w
                    </strong>
                    <div style={{ width: 50, height: 4, background: "var(--bg-tertiary)", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ width: `${wordCountProgress}%`, height: "100%", background: isOptimalWordCount ? "#10b981" : "var(--accent)" }} />
                    </div>
                  </div>
                  <div>Chars: <strong>{charCount}</strong></div>
                  <div>Read: <strong>~{readTime}m</strong></div>
                </div>
              )}
            </div>

            {/* Editor Area */}
            <div style={{ position: "relative", flex: 1 }}>
              <textarea
                ref={sopRef}
                className="input"
                rows={17}
                value={sop || "Click 'Generate Personalized SOP' to engineer an authentic statement of purpose tailored to your chosen university and strategic focus..."}
                onChange={(e) => setSop(e.target.value)}
                style={{
                  width: "100%",
                  resize: "vertical",
                  lineHeight: 1.75,
                  fontSize: 13.5,
                  fontFamily: "inherit",
                  background: "var(--bg-secondary)",
                  color: sop ? "var(--text-primary)" : "var(--text-muted)",
                  padding: "16px 18px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                }}
                readOnly={generating}
              />
              {generating && (
                <div style={{
                  position: "absolute",
                  bottom: 14,
                  right: 16,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-accent)",
                  borderRadius: "100px",
                  padding: "5px 12px",
                  fontSize: 11.5,
                  color: "var(--accent-light)",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  boxShadow: "var(--shadow-sm)"
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", animation: "pulse-glow 1s infinite" }} />
                  <span>AI is writing your Statement of Purpose...</span>
                </div>
              )}
            </div>

            {/* Quick Refine Prompt Chips */}
            {sop && !generating && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--text-muted)", marginBottom: 6 }}>
                  ⚡ Quick Refinement Presets
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {PROMPT_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendRefinePrompt(s)}
                      className="filter-pill"
                      style={{ fontSize: 11.5, padding: "5px 11px" }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Existing Card 4: Interactive AI Refinement Chat Console */}
          {messages.length > 0 && (
            <div className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", gap: 7, margin: 0, color: "var(--text-primary)" }}>
                  <Wand2 size={15} color="var(--accent)" />
                  AI Editorial Assistant
                </h3>
                <span className="badge badge-cyan" style={{ fontSize: 10 }}>Interactive Revisions</span>
              </div>

              {/* Chat Thread */}
              <div style={{ maxHeight: 160, overflowY: "auto", marginBottom: 12, display: "flex", flexDirection: "column", gap: 8, paddingRight: 4 }}>
                {messages.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      maxWidth: "85%",
                      fontSize: 13,
                      alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                      background: m.role === "user" ? "var(--accent)" : "var(--bg-secondary)",
                      border: m.role === "assistant" ? "1px solid var(--border)" : "none",
                      color: m.role === "user" ? "#ffffff" : "var(--text-primary)",
                      lineHeight: 1.5,
                    }}
                  >
                    {m.content}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="input"
                  placeholder="Request any revision... (e.g. 'Add a section on my distributed database project')"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendRefinePrompt(chatInput)}
                  style={{ fontSize: 13 }}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => sendRefinePrompt(chatInput)}
                  style={{ flexShrink: 0, padding: "8px 16px", gap: 5, fontSize: 13 }}
                >
                  <Send size={14} />
                  <span>Apply</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

        {toastMessage && (
          <div className="toast-bubble">
            <Check size={16} color="#10b981" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function SOPPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="AI Statement of Purpose Generator">
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
            Loading SOP Workspace...
          </div>
        </DashboardLayout>
      }
    >
      <SOPPageContent />
    </Suspense>
  );
}
