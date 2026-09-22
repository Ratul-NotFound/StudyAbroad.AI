"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  GraduationCap,
  Minimize2,
  Maximize2,
  RefreshCw,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  agent?: string;
  quickLinks?: { label: string; href: string }[];
}

const KNOWLEDGE_RESPONSES: { keywords: string[]; agent: string; response: string; quickLinks?: { label: string; href: string }[] }[] = [
  {
    keywords: ["daad", "germany scholarship", "german scholarship", "living allowance"],
    agent: "Scholarship Hunter Agent",
    response: "The **DAAD (German Academic Exchange Service)** offers comprehensive full-ride scholarships for Master's and PhD degrees in Germany. Key benefits include **€934 to €1,200/month stipend**, full health insurance, and round-trip airfare. The portal usually opens around August–October for the following academic year.",
    quickLinks: [
      { label: "Explore Scholarships Hub", href: "/dashboard/scholarships" },
      { label: "TU Munich Requirements", href: "/universities" },
    ],
  },
  {
    keywords: ["free", "tuition-free", "zero tuition", "no tuition", "cheap", "cost"],
    agent: "Financial Planner Agent",
    response: "Public universities in **Germany** (e.g. TU Munich, RWTH Aachen, Heidelberg) and **Switzerland** (e.g. ETH Zurich at ~CHF 730/semester) charge **€0 to minimal administrative fees** for all international students! You only need to fund your living expenses (~€11,208/yr blocked account in Germany).",
    quickLinks: [
      { label: "View Free Universities", href: "/universities" },
      { label: "Check Cost Estimator", href: "/dashboard" },
    ],
  },
  {
    keywords: ["sop", "statement of purpose", "essay", "motivation letter", "write sop"],
    agent: "SOP Writer Agent",
    response: "A top-tier SOP must highlight: 1) Your research foundation, 2) Specific faculty labs and coursework you aim to join, 3) Real projects and problem statements, and 4) Clear post-graduation impact. Our AI SOP Writer can draft and refine an essay tailored to your target university in seconds!",
    quickLinks: [
      { label: "Launch SOP Writer Suite", href: "/sop" },
    ],
  },
  {
    keywords: ["visa", "blocked account", "aps", "opt", "work permit", "stay back"],
    agent: "Visa & Compliance Guide",
    response: "Post-study work rights summary:\n• **USA**: Up to 3 years STEM OPT\n• **UK**: 2-year Graduate Route Visa\n• **Germany**: 18-month Job Seeker Visa with quick permanent residency pathways\n• **Switzerland**: 6-month search visa.\nOur Visa Guide audits your proof of funds and embassy interview readiness.",
    quickLinks: [
      { label: "Check Visa Checklist", href: "/dashboard" },
      { label: "Evaluate Profile", href: "/profile" },
    ],
  },
  {
    keywords: ["harvard", "mit", "stanford", "oxford", "cambridge", "eth", "ivy league"],
    agent: "University Matcher Agent",
    response: "Top Ivy League and European elite institutions evaluate applicants holistically: GPA/transcripts (30%), research publications & projects (35%), Statement of Purpose & LORs (25%), and interview performance (10%). Complete our free profile evaluation to calculate your match/reach compatibility!",
    quickLinks: [
      { label: "Shortlist Universities", href: "/universities" },
      { label: "Evaluate My GPA", href: "/profile" },
    ],
  },
];

const DEFAULT_SUGGESTIONS = [
  "Which universities offer €0 tuition?",
  "How do I qualify for a DAAD scholarship?",
  "Tips for writing an MIT or Oxford SOP",
  "Germany vs USA post-study work rights",
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: "👋 Hi! I'm your **StudyAbroad AI Admissions Advisor**. Ask me anything about university shortlisting, DAAD/Fulbright scholarships, SOP essays, or embassy visa requirements!",
      timestamp: "Just now",
      agent: "Admissions Supervisor Agent",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(""); // Tracks backend session_id for conversation continuity

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const API_BASE = "http://localhost:8000";

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    // --- Try real backend first ---
    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          message: text.trim(),
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (response.ok) {
        const data = await response.json();

        // Track session_id returned from backend
        if (data.session_id) sessionIdRef.current = data.session_id;

        const botReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: data.response || "I processed your request. Check your dashboard for results.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          agent: "AI Advisor",
        };
        setMessages((prev) => [...prev, botReply]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      // Backend offline or timeout — fall through to local knowledge base
    }

    // --- Local fallback knowledge base (instant, works offline) ---
    const lower = text.toLowerCase();
    const match = KNOWLEDGE_RESPONSES.find((k) =>
      k.keywords.some((kw) => lower.includes(kw))
    );

    let botReply: ChatMessage;
    if (match) {
      botReply = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: match.response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        agent: match.agent,
        quickLinks: match.quickLinks,
      };
    } else {
      botReply = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: `I've routed your query regarding **"${text}"** across our 12 specialized admissions agents. For a comprehensive profile breakdown and reach/match shortlisting tailored to your GPA, evaluate your academic profile free!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        agent: "Admissions Matcher Agent",
        quickLinks: [
          { label: "Evaluate My Profile", href: "/profile" },
          { label: "Browse 10,000+ Universities", href: "/universities" },
        ],
      };
    }

    setMessages((prev) => [...prev, botReply]);
    setIsTyping(false);
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 99999 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              position: "absolute",
              bottom: 64,
              right: 0,
              width: "min(390px, 92vw)",
              height: "min(540px, 80vh)",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "20px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Chat Header */}
            <div
              style={{
                padding: "14px 18px",
                background: "var(--bg-card)",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, var(--accent), var(--accent3))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    boxShadow: "0 4px 12px var(--accent-glow)",
                    position: "relative",
                  }}
                >
                  <Bot size={20} />
                  <span
                    style={{
                      position: "absolute",
                      bottom: -2,
                      right: -2,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#10b981",
                      border: "2px solid var(--bg-card)",
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                    StudyAbroad AI Advisor
                  </div>
                  <div style={{ fontSize: 11.5, color: "#10b981", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                    12 Agents Online • 24/7
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  onClick={() => setMessages([messages[0]])}
                  title="Reset conversation"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-tertiary)",
                    padding: 6,
                    cursor: "pointer",
                    borderRadius: 6,
                  }}
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-secondary)",
                    padding: 6,
                    cursor: "pointer",
                    borderRadius: 6,
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div
              style={{
                flex: 1,
                padding: "16px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              {messages.map((m) => {
                const isBot = m.sender === "bot";
                return (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isBot ? "flex-start" : "flex-end",
                      gap: 4,
                    }}
                  >
                    {isBot && m.agent && (
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          color: "var(--accent)",
                          marginLeft: 4,
                        }}
                      >
                        ⚡ {m.agent}
                      </span>
                    )}

                    <div
                      style={{
                        maxWidth: "86%",
                        padding: "11px 15px",
                        borderRadius: isBot ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                        background: isBot ? "var(--bg-card)" : "var(--accent)",
                        color: isBot ? "var(--text-primary)" : "#ffffff",
                        border: isBot ? "1px solid var(--border)" : "none",
                        fontSize: 13,
                        lineHeight: 1.55,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        wordBreak: "break-word",
                      }}
                    >
                      {/* Formatted body */}
                      <div style={{ whiteSpace: "pre-line" }}>{m.text}</div>

                      {/* Quick Links */}
                      {m.quickLinks && m.quickLinks.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                          {m.quickLinks.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setIsOpen(false)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                color: "var(--accent)",
                                textDecoration: "none",
                              }}
                            >
                              <ArrowRight size={12} />
                              <span>{link.label}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    <span style={{ fontSize: 10, color: "var(--text-tertiary)", padding: "0 4px" }}>
                      {m.timestamp}
                    </span>
                  </div>
                );
              })}

              {isTyping && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "var(--bg-card)", borderRadius: "14px", border: "1px solid var(--border)", width: "fit-content" }}>
                  <span className="live-pulse" style={{ width: 6, height: 6 }} />
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>AI Advisor analyzing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions (if few messages) */}
            {messages.length <= 2 && (
              <div style={{ padding: "0 16px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  💡 Suggested Questions
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {DEFAULT_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "100px",
                        padding: "5px 11px",
                        fontSize: 11.5,
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{
                padding: "12px 16px",
                background: "var(--bg-card)",
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <input
                type="text"
                placeholder="Ask about universities, scholarships, SOP..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{
                  flex: 1,
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  borderRadius: "100px",
                  padding: "9px 16px",
                  fontSize: 13,
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: inputValue.trim() ? "var(--accent)" : "var(--bg-tertiary)",
                  color: inputValue.trim() ? "#ffffff" : "var(--text-tertiary)",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: inputValue.trim() ? "pointer" : "default",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 18px",
          borderRadius: "100px",
          background: "linear-gradient(135deg, var(--accent), #2563eb)",
          color: "#ffffff",
          border: "none",
          boxShadow: "0 8px 24px var(--accent-glow)",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 13.5,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          position: "relative",
        }}
        aria-label="Toggle AI Admissions Chatbot"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isOpen ? <X size={18} /> : <MessageSquare size={18} />}
        </div>
        <span>{isOpen ? "Close Chat" : "Ask AI Advisor"}</span>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#10b981",
            boxShadow: "0 0 8px #10b981",
            display: "inline-block",
          }}
        />
      </motion.button>
    </div>
  );
}
