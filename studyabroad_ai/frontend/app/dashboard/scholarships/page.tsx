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

const SCHOLARSHIPS_DATA = [
  {
    id: 1,
    name: "DAAD Master Studies Scholarships",
    country: "Germany",
    flag: "🇩🇪",
    amount: "$22,000/yr",
    coverage: "Full Tuition + €934/mo + Insurance",
    deadline: "Oct 31, 2025",
    degree: "Master",
    matchScore: 94,
    status: "Matched",
    eligibility: "GPA >= 3.3/4.0, Bachelor within 6 yrs",
    tags: ["Merit-Based", "Govt Funded", "Full Ride"],
  },
  {
    id: 2,
    name: "Fulbright Foreign Student Program",
    country: "USA",
    flag: "🇺🇸",
    amount: "$65,000/yr",
    coverage: "Full Tuition + Living + Airfare",
    deadline: "Oct 15, 2025",
    degree: "Master / PhD",
    matchScore: 88,
    status: "Eligible",
    eligibility: "Top academic standing, leadership record",
    tags: ["Prestigious", "Govt Funded", "Full Ride"],
  },
  {
    id: 3,
    name: "ETH Zurich ESOP Excellence Scholarship",
    country: "Switzerland",
    flag: "🇨🇭",
    amount: "$28,000/yr",
    coverage: "Tuition Waiver + CHF 12,000/sem",
    deadline: "Dec 15, 2025",
    degree: "Master",
    matchScore: 91,
    status: "Matched",
    eligibility: "Top 10% of undergrad class (GPA >= 3.8)",
    tags: ["University Funded", "STEM Focus"],
  },
  {
    id: 4,
    name: "NL Scholarship (Holland)",
    country: "Netherlands",
    flag: "🇳🇱",
    amount: "$5,500",
    coverage: "First-year study contribution",
    deadline: "Feb 01, 2026",
    degree: "Bachelor / Master",
    matchScore: 96,
    status: "High Chance",
    eligibility: "Non-EEA student applying to Dutch research unis",
    tags: ["Partial Tuition", "Fast Processing"],
  },
  {
    id: 5,
    name: "Australia Awards Scholarships",
    country: "Australia",
    flag: "🇦🇺",
    amount: "$48,000/yr",
    coverage: "100% Tuition + Travel + Monthly CLE",
    deadline: "Apr 30, 2026",
    degree: "Master / PhD",
    matchScore: 85,
    status: "Eligible",
    eligibility: "2+ years professional work experience",
    tags: ["Development Focus", "Govt Funded"],
  },
  {
    id: 6,
    name: "SINGA Graduate Award",
    country: "Singapore",
    flag: "🇸🇬",
    amount: "$36,000/yr",
    coverage: "Tuition + S$3,200/mo + Airfare Grant",
    deadline: "Jun 01, 2026",
    degree: "PhD",
    matchScore: 82,
    status: "Eligible",
    eligibility: "Strong STEM research interest & skills",
    tags: ["PhD Fellowship", "A*STAR Labs"],
  },
];

export default function ScholarshipsPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");

  const filtered = SCHOLARSHIPS_DATA.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.country.toLowerCase().includes(search.toLowerCase());
    const matchCountry = selectedCountry === "All" || s.country === selectedCountry;
    return matchSearch && matchCountry;
  });

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
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>💰 AI Scholarship Hunter</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
              Matched <strong>{filtered.length} funding opportunities</strong> worth over $250,000+
            </p>
          </div>
          <button className="btn btn-primary">⚡ Scan New Scholarships</button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
          <input
            className="input"
            placeholder="🔍 Search scholarships by name or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 360 }}
          />
          <select
            className="input"
            style={{ width: "auto" }}
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <option value="All">All Countries</option>
            <option value="Germany">Germany 🇩🇪</option>
            <option value="USA">USA 🇺🇸</option>
            <option value="Switzerland">Switzerland 🇨🇭</option>
            <option value="Netherlands">Netherlands 🇳🇱</option>
            <option value="Australia">Australia 🇦🇺</option>
            <option value="Singapore">Singapore 🇸🇬</option>
          </select>
        </div>

        {/* Scholarship Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))", gap: 20 }}>
          {filtered.map((item) => (
            <div key={item.id} className="card" style={{ padding: "24px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 22 }}>{item.flag}</span>
                    <h3 style={{ fontSize: 17, fontWeight: 800 }}>{item.name}</h3>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    {item.country} • {item.degree} Program
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#10b981", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {item.amount}
                  </div>
                  <span className="badge badge-success" style={{ marginTop: 4 }}>
                    {item.matchScore}% Match
                  </span>
                </div>
              </div>

              <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: "12px 14px", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-light)", marginBottom: 4 }}>
                  🛡️ Coverage: {item.coverage}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  📋 Eligibility: {item.eligibility}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  ⏰ Deadline: <strong style={{ color: "var(--text-primary)" }}>{item.deadline}</strong>
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href="/sop" className="btn btn-outline btn-sm">Generate Essay</Link>
                  <button className="btn btn-primary btn-sm">Apply Guide →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
