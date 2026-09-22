"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "../../lib/theme";
import { DashboardLayout } from "../../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Search, Bookmark, BookmarkCheck, Sparkles, 
  CheckCircle2, X, GraduationCap, MapPin, TrendingUp, ShieldCheck 
} from "lucide-react";
import { getBookmarks, toggleBookmark } from "../../lib/store";

interface University {
  id: number;
  name: string;
  short: string;
  country: string;
  flag: string;
  img: string;
  rank: number;
  match: number;
  tier: "Reach" | "Match" | "Safe";
  tuition: number;
  livingCost: string;
  acceptanceRate: string;
  gpa_req: number;
  ielts_req: number;
  program: string;
  degree: string;
  deadline: string;
  scholarship: boolean;
  stemDesignated: boolean;
  workVisa: string;
  topFaculty: string;
  overview: string;
}

const UNIVERSITIES: University[] = [
  {
    id: 1,
    name: "Massachusetts Institute of Technology",
    short: "MIT",
    country: "USA",
    flag: "🇺🇸",
    img: "/destination-usa.jpg",
    rank: 1,
    match: 78,
    tier: "Reach",
    tuition: 57986,
    livingCost: "$2,200/mo",
    acceptanceRate: "4.1%",
    gpa_req: 3.9,
    ielts_req: 7.5,
    program: "MSc Computer Science & Artificial Intelligence",
    degree: "Master's",
    deadline: "December 01, 2025",
    scholarship: true,
    stemDesignated: true,
    workVisa: "3-Year STEM OPT",
    topFaculty: "CSAIL (Computer Science and Artificial Intelligence Lab)",
    overview: "Global #1 ranked institution pioneering AI, quantum architectures, and distributed systems. Generous RA/TA funding available for admitted research scholars."
  },
  {
    id: 2,
    name: "ETH Zurich",
    short: "ETH Zurich",
    country: "Switzerland",
    flag: "🇨🇭",
    img: "/destination-switzerland.jpg",
    rank: 7,
    match: 86,
    tier: "Match",
    tuition: 1600,
    livingCost: "CHF 1,800/mo",
    acceptanceRate: "27%",
    gpa_req: 3.6,
    ielts_req: 7.0,
    program: "MSc Computer Science",
    degree: "Master's",
    deadline: "December 15, 2025",
    scholarship: true,
    stemDesignated: true,
    workVisa: "6-Month Post-Study Job Search",
    topFaculty: "ETH AI Center & Systems Group",
    overview: "Continental Europe's premier technical university. World-class computer science curriculum with virtually zero tuition costs and ESOP merit grants."
  },
  {
    id: 3,
    name: "Technical University of Munich",
    short: "TU Munich",
    country: "Germany",
    flag: "🇩🇪",
    img: "/destination-germany.jpg",
    rank: 28,
    match: 94,
    tier: "Safe",
    tuition: 350,
    livingCost: "€950/mo",
    acceptanceRate: "38%",
    gpa_req: 3.3,
    ielts_req: 6.5,
    program: "MSc Informatics",
    degree: "Master's",
    deadline: "January 15, 2026",
    scholarship: false,
    stemDesignated: true,
    workVisa: "18-Month German Job Seeker Visa",
    topFaculty: "Munich Data Science Institute",
    overview: "Germany's University of Excellence with tuition-free education for EU/international students. Unmatched direct industrial ties with BMW, Siemens, and Google Munich."
  },
  {
    id: 4,
    name: "National University of Singapore",
    short: "NUS",
    country: "Singapore",
    flag: "🇸🇬",
    img: "/destination-singapore.jpg",
    rank: 8,
    match: 89,
    tier: "Match",
    tuition: 18500,
    livingCost: "S$1,600/mo",
    acceptanceRate: "12%",
    gpa_req: 3.7,
    ielts_req: 6.5,
    program: "MSc Computer Science",
    degree: "Master's",
    deadline: "January 01, 2026",
    scholarship: true,
    stemDesignated: true,
    workVisa: "1 to 3-Year Long Term Visit Pass",
    topFaculty: "NUS School of Computing & A*STAR Labs",
    overview: "Asia's leading technological institute positioned at the gateway of global tech venture funding, offering Singapore Service Obligation tuition discounts."
  },
  {
    id: 5,
    name: "University of Oxford",
    short: "Oxford",
    country: "UK",
    flag: "🇬🇧",
    img: "/destination-uk.jpg",
    rank: 3,
    match: 75,
    tier: "Reach",
    tuition: 36000,
    livingCost: "£1,400/mo",
    acceptanceRate: "8%",
    gpa_req: 3.85,
    ielts_req: 7.5,
    program: "MSc Advanced Computer Science",
    degree: "Master's",
    deadline: "January 10, 2026",
    scholarship: true,
    stemDesignated: true,
    workVisa: "2-Year UK Graduate Visa",
    topFaculty: "Department of Computer Science & Clarendon Fund",
    overview: "Centuries of academic prestige combined with bleeding-edge AI and algorithmic verification research. 1-year intensive master's format."
  },
  {
    id: 6,
    name: "Delft University of Technology",
    short: "TU Delft",
    country: "Netherlands",
    flag: "🇳🇱",
    img: "/library-study.jpg",
    rank: 48,
    match: 92,
    tier: "Safe",
    tuition: 18700,
    livingCost: "€1,100/mo",
    acceptanceRate: "45%",
    gpa_req: 3.25,
    ielts_req: 6.5,
    program: "MSc Data Science & Artificial Intelligence",
    degree: "Master's",
    deadline: "January 31, 2026",
    scholarship: true,
    stemDesignated: true,
    workVisa: "1-Year Dutch Search Year (Zoekjaar)",
    topFaculty: "Delft AI Cluster",
    overview: "World-renowned Dutch engineering faculty with high English fluency across campus and rapid visa processing for international postgraduates."
  },
  {
    id: 7,
    name: "Carnegie Mellon University",
    short: "CMU",
    country: "USA",
    flag: "🇺🇸",
    img: "/hero-campus.jpg",
    rank: 2,
    match: 72,
    tier: "Reach",
    tuition: 52788,
    livingCost: "$1,800/mo",
    acceptanceRate: "6.2%",
    gpa_req: 3.9,
    ielts_req: 7.5,
    program: "MSc Machine Learning & Systems",
    degree: "Master's",
    deadline: "December 08, 2025",
    scholarship: false,
    stemDesignated: true,
    workVisa: "3-Year STEM OPT",
    topFaculty: "School of Computer Science & Language Technologies Institute",
    overview: "The world's highest concentrated computer science research power, producing top-tier AI researchers and Silicon Valley engineering leaders."
  },
  {
    id: 8,
    name: "University of Melbourne",
    short: "UniMelb",
    country: "Australia",
    flag: "🇦🇺",
    img: "/graduation-success.jpg",
    rank: 33,
    match: 90,
    tier: "Safe",
    tuition: 38800,
    livingCost: "A$2,200/mo",
    acceptanceRate: "52%",
    gpa_req: 3.3,
    ielts_req: 6.5,
    program: "Master of Information Technology (Computing)",
    degree: "Master's",
    deadline: "March 01, 2026",
    scholarship: true,
    stemDesignated: true,
    workVisa: "3 to 4-Year Post-Study Work Stream",
    topFaculty: "Melbourne School of Engineering",
    overview: "Australia's #1 ranked university offering flexible degree accreditations, extensive post-study work rights, and Australian Government Research Training Program grants."
  },
];

const TIERS = ["All", "Reach", "Match", "Safe"];
const COUNTRIES_FILTER = ["All", "USA", "Switzerland", "Germany", "Singapore", "UK", "Netherlands", "Australia"];

function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, string> = { Reach: "badge-danger", Match: "badge-accent", Safe: "badge-success" };
  return <span className={`badge ${map[tier] || "badge-accent"}`}>{tier}</span>;
}

export default function UniversitiesPage() {
  const [tierFilter, setTierFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"match" | "rank" | "tuition">("match");
  const [selectedUni, setSelectedUni] = useState<University | null>(null);
  const [savedIds, setSavedIds] = useState<number[]>([2, 3]);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const b = getBookmarks();
    if (b && b.length > 0) {
      setSavedIds(b);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const toggleSave = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const added = toggleBookmark(id);
    setSavedIds(getBookmarks());
    showToast(added ? "Added to shortlisted programs! ⭐" : "Removed from shortlist");
  };

  const filtered = UNIVERSITIES
    .filter((u) => tierFilter === "All" || u.tier === tierFilter)
    .filter((u) => countryFilter === "All" || u.country === countryFilter)
    .filter((u) => 
      u.name.toLowerCase().includes(search.toLowerCase()) || 
      u.program.toLowerCase().includes(search.toLowerCase()) ||
      u.country.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "match") return b.match - a.match;
      if (sortBy === "rank") return a.rank - b.rank;
      return a.tuition - b.tuition;
    });

  return (
    <DashboardLayout
      title="University Matches & Admissions Radar"
      subtitle={`AI matched ${filtered.length} target programs based on your academic profile, tests & preferences`}
      actionButton={
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-card)", padding: "4px 12px", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: "#ef4444" }}>{UNIVERSITIES.filter(u => u.tier === "Reach").length}</span>
            <span style={{ fontSize: 10.5, color: "var(--text-secondary)", fontWeight: 600, marginLeft: 4 }}>Reach</span>
          </div>
          <div style={{ width: 1, height: 14, background: "var(--border)" }} />
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: "var(--accent-light)" }}>{UNIVERSITIES.filter(u => u.tier === "Match").length}</span>
            <span style={{ fontSize: 10.5, color: "var(--text-secondary)", fontWeight: 600, marginLeft: 4 }}>Match</span>
          </div>
          <div style={{ width: 1, height: 14, background: "var(--border)" }} />
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: "#10b981" }}>{UNIVERSITIES.filter(u => u.tier === "Safe").length}</span>
            <span style={{ fontSize: 10.5, color: "var(--text-secondary)", fontWeight: 600, marginLeft: 4 }}>Safe</span>
          </div>
        </div>
      }
    >
      <div style={{ maxWidth: 1320, margin: "0 auto", width: "100%" }}>
        {/* Interactive Filters Strip */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 24 }}>
            <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 340 }}>
              <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input
                className="input"
                placeholder="Search university, program or country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 34, fontSize: 13 }}
              />
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              {TIERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTierFilter(t)}
                  className={`filter-pill ${tierFilter === t ? "active" : ""}`}
                  style={{ fontSize: 12.5, padding: "6px 13px" }}
                >
                  {t}
                </button>
              ))}
            </div>

            <select
              className="input"
              style={{ width: "auto", fontSize: 12.5 }}
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
            >
              {COUNTRIES_FILTER.map((c) => <option key={c} value={c}>{c === "All" ? "All Countries" : c}</option>)}
            </select>

            <select
              className="input"
              style={{ width: "auto", fontSize: 12.5 }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "match" | "rank" | "tuition")}
            >
              <option value="match">Sort: Highest Match Score</option>
              <option value="rank">Sort: QS World Rank</option>
              <option value="tuition">Sort: Lowest Tuition</option>
            </select>
          </div>
        </div>

      {/* ── Main Universities Cards Grid ── */}
      <div className="dashboard-main" style={{ maxWidth: 1320, margin: "0 auto" }}>
        <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: 18 }} className="unis-grid">
          <AnimatePresence>
            {filtered.map((uni) => {
              const isSaved = savedIds.includes(uni.id);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  key={uni.id}
                  className="card card-alive"
                  onClick={() => setSelectedUni(uni)}
                  style={{
                    padding: 0,
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid var(--border)",
                  }}
                >
                  {/* Image Banner with Match Score Badge */}
                  <div className="card-img-wrapper" style={{ height: 150, width: "100%" }}>
                    <img
                      src={uni.img}
                      alt={uni.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {/* Top Bar on Image */}
                    <div style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      right: 10,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <span style={{
                        background: "var(--nav-bg)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid var(--border)",
                        borderRadius: "100px",
                        padding: "3px 10px",
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: 5
                      }}>
                        <span>{uni.flag}</span>
                        <span>{uni.country}</span>
                      </span>

                      <button
                        onClick={(e) => toggleSave(uni.id, e)}
                        style={{
                          background: isSaved ? "var(--accent)" : "rgba(0,0,0,0.55)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "50%",
                          width: 30,
                          height: 30,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                      </button>
                    </div>

                    {/* Bottom Match Pill */}
                    <div style={{
                      position: "absolute",
                      bottom: 10,
                      right: 10,
                      background: "var(--bg-card)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid var(--border-accent)",
                      borderRadius: "6px",
                      padding: "3px 8px",
                      textAlign: "right",
                      boxShadow: "var(--shadow-sm)"
                    }}>
                      <div style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: uni.match >= 85 ? "#10b981" : uni.match >= 75 ? "var(--accent-light)" : "var(--warning)",
                        lineHeight: 1.1
                      }}>
                        {uni.match}%
                      </div>
                      <div style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
                        AI Match
                      </div>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                      <h3 style={{ fontWeight: 800, fontSize: 16, color: "var(--text-primary)", margin: 0 }}>
                        {uni.short}
                      </h3>
                      <TierBadge tier={uni.tier} />
                      {uni.scholarship && <span className="badge badge-cyan" style={{ fontSize: 9.5 }}>💰 Scholarship</span>}
                    </div>

                    <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 6 }}>
                      {uni.name}
                    </p>

                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-light)", marginBottom: 12 }}>
                      {uni.program}
                    </p>

                    {/* Progress Match Bar */}
                    <div className="progress" style={{ marginBottom: 14, height: 5 }}>
                      <div className="progress-bar progress-accent" style={{ width: `${uni.match}%` }} />
                    </div>

                    {/* 4-Stat Metric Box */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 14 }}>
                      <div style={{ textAlign: "center", padding: "7px 3px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-primary)" }}>#{uni.rank}</div>
                        <div style={{ fontSize: 9.5, color: "var(--text-muted)", marginTop: 1, whiteSpace: "nowrap" }}>QS Rank</div>
                      </div>
                      <div style={{ textAlign: "center", padding: "7px 3px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-primary)" }}>
                          {uni.tuition === 350 ? "~Free" : `$${(uni.tuition / 1000).toFixed(0)}K`}
                        </div>
                        <div style={{ fontSize: 9.5, color: "var(--text-muted)", marginTop: 1, whiteSpace: "nowrap" }}>Tuition/yr</div>
                      </div>
                      <div style={{ textAlign: "center", padding: "7px 3px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-primary)" }}>{uni.gpa_req}+</div>
                        <div style={{ fontSize: 9.5, color: "var(--text-muted)", marginTop: 1, whiteSpace: "nowrap" }}>Min GPA</div>
                      </div>
                      <div style={{ textAlign: "center", padding: "7px 3px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-primary)" }}>{uni.ielts_req}</div>
                        <div style={{ fontSize: 9.5, color: "var(--text-muted)", marginTop: 1, whiteSpace: "nowrap" }}>IELTS</div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 12, flexWrap: "wrap", gap: 8 }}>
                      <span style={{ fontSize: 11.5, color: "var(--text-secondary)", flex: "1 1 auto" }}>
                        📅 Deadline: <strong style={{ color: "var(--text-primary)" }}>{uni.deadline.split(",")[0]}</strong>
                      </span>

                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <Link
                          href={`/sop?uni=${encodeURIComponent(uni.short)}&prog=${encodeURIComponent(uni.program)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: 11.5, padding: "4px 10px" }}
                        >
                          Write SOP
                        </Link>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedUni(uni); }}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: 11.5, padding: "4px 10px" }}
                        >
                          Details →
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Detailed University Modal ── */}
      {selectedUni && (
        <div className="modal-overlay" onClick={() => setSelectedUni(null)}>
          <div
            className="modal-card"
            style={{ width: "100%", maxWidth: 640, padding: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Image Header */}
            <div style={{ height: 180, position: "relative" }}>
              <img
                src={selectedUni.img}
                alt={selectedUni.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                onClick={() => setSelectedUni(null)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "rgba(0,0,0,0.6)",
                  border: "none",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
              >
                <X size={16} />
              </button>
              <div style={{
                position: "absolute",
                bottom: 12,
                left: 16,
                background: "var(--bg-card)",
                padding: "5px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: 7,
                boxShadow: "var(--shadow)"
              }}>
                <span style={{ fontSize: 16 }}>{selectedUni.flag}</span>
                <span style={{ fontWeight: 800, fontSize: 14 }}>{selectedUni.name}</span>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
                    {selectedUni.program}
                  </h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: 12.5, marginTop: 3 }}>
                    {selectedUni.country} • World Rank #{selectedUni.rank} • Degree: {selectedUni.degree}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#10b981" }}>
                    {selectedUni.match}%
                  </div>
                  <span className="badge badge-success" style={{ fontSize: 10 }}>Profile Match</span>
                </div>
              </div>

              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 18 }}>
                {selectedUni.overview}
              </p>

              {/* Breakdown Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div style={{ background: "var(--bg-secondary)", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>Financials</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 3, color: "var(--text-primary)" }}>
                    Tuition: ${selectedUni.tuition.toLocaleString()}/yr
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 2 }}>
                    Est. Living Cost: {selectedUni.livingCost}
                  </div>
                </div>

                <div style={{ background: "var(--bg-secondary)", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>Admissions Benchmark</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 3, color: "var(--text-primary)" }}>
                    Min GPA: {selectedUni.gpa_req} / 4.0
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 2 }}>
                    IELTS: {selectedUni.ielts_req} (Acceptance: {selectedUni.acceptanceRate})
                  </div>
                </div>

                <div style={{ background: "var(--bg-secondary)", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>Post-Study Visa Rights</div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 3, color: "var(--text-primary)" }}>
                    {selectedUni.workVisa}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 2 }}>
                    STEM Extension: {selectedUni.stemDesignated ? "Yes (3 Years)" : "Standard"}
                  </div>
                </div>

                <div style={{ background: "var(--bg-secondary)", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>Faculty & Lab Hub</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, marginTop: 3, color: "var(--text-primary)" }}>
                    {selectedUni.topFaculty}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <Link
                  href={`/sop?uni=${encodeURIComponent(selectedUni.short)}&prog=${encodeURIComponent(selectedUni.program)}`}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center", padding: "10px", fontWeight: 700, fontSize: 13.5 }}
                >
                  <Sparkles size={15} />
                  <span>Generate SOP for {selectedUni.short}</span>
                </Link>
                <button
                  onClick={() => toggleSave(selectedUni.id)}
                  className="btn btn-outline"
                  style={{ padding: "10px 16px", fontSize: 13 }}
                >
                  {savedIds.includes(selectedUni.id) ? "★ Shortlisted" : "☆ Shortlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        {toastMessage && (
          <div className="toast-bubble">
            <CheckCircle2 size={16} color="#10b981" />
            <span>{toastMessage}</span>
          </div>
        )}
    </DashboardLayout>
  );
}
