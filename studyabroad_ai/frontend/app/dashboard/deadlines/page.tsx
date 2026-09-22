"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "../../../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, CheckCircle2, Clock, Plus, Trash2, 
  AlertCircle, X, CheckSquare, Sparkles 
} from "lucide-react";
import { getStoredMatches } from "../../../lib/store";

interface DeadlineItem {
  id: number;
  target: string;
  type: string;
  country: string;
  flag: string;
  deadline: string;
  daysLeft: number;
  status: "Urgent" | "In Progress" | "Upcoming";
  checklist: { task: string; done: boolean }[];
}

const INITIAL_DEADLINES: DeadlineItem[] = [
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
      { task: "Finalize Statement of Purpose (SOP) Draft v2", done: true },
      { task: "Request 3 Faculty Letters of Recommendation", done: true },
      { task: "Upload Official University Transcripts", done: false },
      { task: "Submit Official GRE & TOEFL Scores", done: false },
      { task: "Pay $75 USD Application Fee", done: false },
    ],
  },
  {
    id: 2,
    target: "ETH Zurich — MSc Computer Science",
    type: "Regular Application & ESOP Grant",
    country: "Switzerland",
    flag: "🇨🇭",
    deadline: "December 15, 2025",
    daysLeft: 61,
    status: "In Progress",
    checklist: [
      { task: "Draft Pre-Study Course Description (Curricular Form)", done: false },
      { task: "ESOP Excellence Scholarship Special Essay", done: false },
      { task: "Academic CV in EuroPass Format", done: true },
      { task: "Certified English Translation of Degree Certificate", done: true },
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
      { task: "Uni-Assist VPD Preliminary Review Documentation", done: true },
      { task: "Complete TUM Curricular Analysis Form", done: false },
      { task: "Submit Proof of English Language Proficiency", done: true },
    ],
  },
  {
    id: 4,
    target: "NUS Singapore — MSc Computing",
    type: "Round 1 Priority Admissions",
    country: "Singapore",
    flag: "🇸🇬",
    deadline: "January 31, 2026",
    daysLeft: 108,
    status: "Upcoming",
    checklist: [
      { task: "Financial Proof & Bank Solvency Statement", done: false },
      { task: "Online Portal Form Submission & Identity Verification", done: false },
    ],
  },
];

export default function DeadlinesPage() {
  const [items, setItems] = useState<DeadlineItem[]>(INITIAL_DEADLINES);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [newTarget, setNewTarget] = useState("");
  const [newCountry, setNewCountry] = useState("USA");
  const [newType, setNewType] = useState("Regular Application");
  const [newDeadline, setNewDeadline] = useState("2026-02-01");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("studyabroad_deadlines");
      if (raw) {
        const stored = JSON.parse(raw);
        if (Array.isArray(stored) && stored.length > 0) {
          const storedIds = new Set(stored.map((s: any) => s.id));
          const defaults = INITIAL_DEADLINES.filter((d) => !storedIds.has(d.id));
          setItems([...stored, ...defaults]);
        }
      }
    } catch {}
  }, []);

  const syncStorage = (newItems: DeadlineItem[]) => {
    try {
      localStorage.setItem("studyabroad_deadlines", JSON.stringify(newItems));
    } catch {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const toggleTask = (itemId: number, taskIdx: number) => {
    setItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id !== itemId) return item;
        const newChecklist = [...item.checklist];
        newChecklist[taskIdx].done = !newChecklist[taskIdx].done;
        return { ...item, checklist: newChecklist };
      });
      syncStorage(updated);
      return updated;
    });
  };

  const handleAddProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarget.trim()) return;

    const flagMap: Record<string, string> = {
      USA: "🇺🇸",
      UK: "🇬🇧",
      Germany: "🇩🇪",
      Switzerland: "🇨🇭",
      Singapore: "🇸🇬",
      Canada: "🇨🇦",
      Australia: "🇦🇺",
      Netherlands: "🇳🇱",
    };

    const newItem: DeadlineItem = {
      id: Date.now(),
      target: newTarget,
      type: newType,
      country: newCountry,
      flag: flagMap[newCountry] || "🏛️",
      deadline: newDeadline,
      daysLeft: Math.max(15, Math.floor((new Date(newDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      status: "Upcoming",
      checklist: [
        { task: "Prepare tailored Statement of Purpose", done: false },
        { task: "Upload academic transcripts and grading scale", done: false },
        { task: "Request letters of recommendation", done: false },
        { task: "Submit official test score reports", done: false },
      ],
    };

    const updated = [newItem, ...items];
    setItems(updated);
    syncStorage(updated);
    setIsModalOpen(false);
    setNewTarget("");
    showToast(`Added ${newTarget} to your application tracker! 🎯`);
  };

  const handleDeleteItem = (id: number) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    syncStorage(updated);
    showToast("Program removed from tracker");
  };

  const filteredItems = items.filter((item) => {
    if (filterStatus === "All") return true;
    if (filterStatus === "Urgent") return item.daysLeft <= 60;
    if (filterStatus === "In Progress") return item.checklist.some((c) => c.done) && !item.checklist.every((c) => c.done);
    if (filterStatus === "Ready") return item.checklist.every((c) => c.done);
    return true;
  });

  return (
    <DashboardLayout
      title="Application Deadlines & Milestones"
      subtitle="Automated countdown timers and bespoke admissions checklists for every target school"
      actionButton={
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-sm"
          style={{ fontWeight: 600, gap: 5, padding: "7px 14px", fontSize: 13 }}
        >
          <Plus size={15} />
          <span>Add Target School</span>
        </button>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Filter Pills Strip */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {["All", "Urgent", "In Progress", "Ready"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`filter-pill ${filterStatus === status ? "active" : ""}`}
              style={{ fontSize: 12.5, padding: "6px 14px" }}
            >
              {status === "All" && "All Programs"}
              {status === "Urgent" && "⏰ Urgent (< 60 Days)"}
              {status === "In Progress" && "🔄 In Progress"}
              {status === "Ready" && "✓ 100% Ready"}
            </button>
          ))}
        </div>

        {/* Existing Deadline Cards with Precision Visual Scaling */}
        <motion.div layout style={{ display: "grid", gap: 16 }}>
          <AnimatePresence>
            {filteredItems.map((item) => {
              const completedCount = item.checklist.filter((c) => c.done).length;
              const progress = Math.round((completedCount / item.checklist.length) * 100);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ y: -3, scale: 1.005 }}
                  key={item.id}
                  className="card card-alive"
                  style={{ padding: "20px 24px" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 20 }}>{item.flag}</span>
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.3px" }}>
                          {item.target}
                        </h3>
                        <span className={`badge ${item.daysLeft <= 50 ? "badge-danger" : "badge-accent"}`} style={{ fontSize: 10.5, whiteSpace: "nowrap" }}>
                          {item.daysLeft} days left
                        </span>
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                        {item.type} • Target: <strong style={{ color: "var(--text-primary)" }}>{item.deadline}</strong>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: progress === 100 ? "#10b981" : "var(--accent-light)" }}>
                          {completedCount}/{item.checklist.length} Requirements Ready
                        </div>
                        <div className="progress" style={{ width: 130, marginTop: 5, height: 5 }}>
                          <div
                            className="progress-bar progress-accent"
                            style={{
                              width: `${progress}%`,
                              background: progress === 100 ? "#10b981" : undefined,
                            }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: "var(--text-muted)", padding: "5px" }}
                        title="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Application Checklist Container */}
                  <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: "14px 18px", marginTop: 8 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: "var(--text-muted)", marginBottom: 10 }}>
                      Application Requirements Checklist
                    </div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {item.checklist.map((task, idx) => (
                        <label
                          key={task.task}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            cursor: "pointer",
                            fontSize: 13,
                            userSelect: "none",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={task.done}
                            onChange={() => toggleTask(item.id, idx)}
                            style={{
                              accentColor: "var(--accent)",
                              width: 15,
                              height: 15,
                              cursor: "pointer",
                            }}
                          />
                          <span
                            style={{
                              textDecoration: task.done ? "line-through" : "none",
                              color: task.done ? "var(--text-muted)" : "var(--text-primary)",
                              fontWeight: task.done ? 400 : 500,
                            }}
                          >
                            {task.task}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Add Target School Modal ── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-card"
            style={{ width: "100%", maxWidth: 500, padding: "24px 28px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Sparkles size={16} color="var(--accent)" />
                <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>Add Application Target</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddProgram} style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, marginBottom: 5, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  University & Degree Program
                </label>
                <input
                  className="input"
                  placeholder="e.g. Stanford University — MSc Computer Science"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, marginBottom: 5, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                    Destination Country
                  </label>
                  <select
                    className="input"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                  >
                    <option value="USA">USA 🇺🇸</option>
                    <option value="UK">UK 🇬🇧</option>
                    <option value="Germany">Germany 🇩🇪</option>
                    <option value="Switzerland">Switzerland 🇨🇭</option>
                    <option value="Singapore">Singapore 🇸🇬</option>
                    <option value="Canada">Canada 🇨🇦</option>
                    <option value="Australia">Australia 🇦🇺</option>
                    <option value="Netherlands">Netherlands 🇳🇱</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, marginBottom: 5, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                    Application Round
                  </label>
                  <select
                    className="input"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  >
                    <option value="Early Round">Early Round</option>
                    <option value="Regular Application">Regular Application</option>
                    <option value="Scholarship Priority">Scholarship Priority</option>
                    <option value="Rolling Intake">Rolling Intake</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, marginBottom: 5, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                  Application Deadline Date
                </label>
                <input
                  className="input"
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center", fontWeight: 700 }}
                >
                  Add Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-bubble">
          <CheckCircle2 size={16} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}
    </DashboardLayout>
  );
}
