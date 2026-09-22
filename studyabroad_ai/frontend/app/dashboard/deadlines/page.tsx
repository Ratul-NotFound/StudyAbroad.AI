"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SIDEBAR_ITEMS = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/profile", icon: "👤", label: "My Profile" },
  { href: "/universities", icon: "🏛️", label: "Universities" },
  { href: "/sop", icon: "✍️", label: "SOP Generator" },
  { href: "/dashboard/scholarships", icon: "💰", label: "Scholarships" },
  { href: "/dashboard/deadlines", icon: "📅", label: "Deadlines" },
  { href: "/dashboard/documents", icon: "📁", label: "Documents" },
];

const DEADLINES_DATA = [
  {
    id: 1,
    target: "MIT — MSc Computer Science",
    type: "Early Round Application",
    country: "USA",
    flag: "🇺🇸",
    deadline: "December 01, 2025",
    daysLeft: 47,
    status: "Urgent",
    checklist: [
      { task: "Finalize SOP Draft v2", done: true },
      { task: "Request 3 LORs", done: true },
      { task: "Upload Official Transcripts", done: false },
      { task: "Submit GRE & TOEFL Scores", done: false },
    ],
  },
  {
    id: 2,
    target: "ETH Zurich — MSc Computer Science",
    type: "Regular Application & ESOP",
    country: "Switzerland",
    flag: "🇨🇭",
    deadline: "December 15, 2025",
    daysLeft: 61,
    status: "In Progress",
    checklist: [
      { task: "Draft Pre-Study Course Description", done: false },
      { task: "ESOP Special Essay", done: false },
      { task: "Academic CV (EuroPass)", done: true },
    ],
  },
  {
    id: 3,
    target: "TU Munich — MSc Informatics",
    type: "Summer/Fall Direct Intake",
    country: "Germany",
    flag: "🇩🇪",
    deadline: "January 15, 2026",
    daysLeft: 92,
    status: "Upcoming",
    checklist: [
      { task: "Uni-Assist VPD Preliminary Evaluation", done: true },
      { task: "Curricular Analysis Form", done: false },
      { task: "Certified German Translations", done: false },
    ],
  },
  {
    id: 4,
    target: "NUS Singapore — MSc Computing",
    type: "Round 1 Priority",
    country: "Singapore",
    flag: "🇸🇬",
    deadline: "January 31, 2026",
    daysLeft: 108,
    status: "Upcoming",
    checklist: [
      { task: "Financial Proof & Bank Statements", done: false },
      { task: "Online Portal Form Submission", done: false },
    ],
  },
];

export default function DeadlinesPage() {
  const pathname = usePathname();
  const [items, setItems] = useState(DEADLINES_DATA);

  const toggleTask = (itemId: number, taskIdx: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const newChecklist = [...item.checklist];
        newChecklist[taskIdx].done = !newChecklist[taskIdx].done;
        return { ...item, checklist: newChecklist };
      })
    );
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
      </aside>

      {/* ── Main Content ── */}
      <main style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>📅 Application Deadlines & Tracker</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
              Automated deadline tracking and personalized application checklists
            </p>
          </div>
          <button className="btn btn-primary">+ Add Target Program</button>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          {items.map((item) => {
            const completedCount = item.checklist.filter((c) => c.done).length;
            const progress = Math.round((completedCount / item.checklist.length) * 100);

            return (
              <div key={item.id} className="card" style={{ padding: "24px 28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 22 }}>{item.flag}</span>
                      <h3 style={{ fontSize: 18, fontWeight: 800 }}>{item.target}</h3>
                      <span className={`badge ${item.daysLeft <= 50 ? "badge-danger" : "badge-accent"}`}>
                        {item.daysLeft} days left
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      {item.type} • Target: <strong style={{ color: "var(--text-primary)" }}>{item.deadline}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent-light)" }}>
                      {completedCount}/{item.checklist.length} Tasks Ready
                    </div>
                    <div className="progress" style={{ width: 140, marginTop: 6 }}>
                      <div className="progress-bar progress-accent" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: "14px 18px", marginTop: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--text-muted)", marginBottom: 10 }}>
                    Application Requirements Checklist
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {item.checklist.map((task, idx) => (
                      <label key={task.task} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14 }}>
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => toggleTask(item.id, idx)}
                          style={{ accentColor: "var(--accent)", width: 16, height: 16 }}
                        />
                        <span style={{ textDecoration: task.done ? "line-through" : "none", color: task.done ? "var(--text-muted)" : "var(--text-primary)" }}>
                          {task.task}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
