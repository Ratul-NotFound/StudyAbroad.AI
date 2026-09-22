"use client";
import { useState } from "react";
import Link from "next/link";

const UNIVERSITIES = [
  { id: 1, name: "Massachusetts Institute of Technology", short: "MIT", country: "USA", flag: "🇺🇸", rank: 1, match: 78, tier: "Reach", tuition: 57986, gpa_req: 3.9, ielts_req: 7.0, program: "MSc Computer Science", deadline: "Dec 1, 2024", scholarship: true },
  { id: 2, name: "ETH Zurich", short: "ETH Zurich", country: "Switzerland", flag: "🇨🇭", rank: 7, match: 85, tier: "Match", tuition: 1500, gpa_req: 3.6, ielts_req: 7.0, program: "MSc Computer Science", deadline: "Dec 15, 2024", scholarship: true },
  { id: 3, name: "Technical University of Munich", short: "TU Munich", country: "Germany", flag: "🇩🇪", rank: 32, match: 92, tier: "Safe", tuition: 350, gpa_req: 3.3, ielts_req: 6.5, program: "MSc Informatics", deadline: "Jan 15, 2025", scholarship: false },
  { id: 4, name: "National University of Singapore", short: "NUS", country: "Singapore", flag: "🇸🇬", rank: 8, match: 88, tier: "Match", tuition: 17650, gpa_req: 3.7, ielts_req: 6.5, program: "MSc Computer Science", deadline: "Jan 1, 2025", scholarship: true },
  { id: 5, name: "University of Toronto", short: "U of T", country: "Canada", flag: "🇨🇦", rank: 21, match: 82, tier: "Match", tuition: 28820, gpa_req: 3.6, ielts_req: 6.5, program: "MSc Computer Science", deadline: "Dec 15, 2024", scholarship: false },
  { id: 6, name: "Delft University of Technology", short: "TU Delft", country: "Netherlands", flag: "🇳🇱", rank: 57, match: 94, tier: "Safe", tuition: 11000, gpa_req: 3.2, ielts_req: 6.5, program: "MSc Data Science", deadline: "Jan 31, 2025", scholarship: false },
  { id: 7, name: "Carnegie Mellon University", short: "CMU", country: "USA", flag: "🇺🇸", rank: 2, match: 72, tier: "Reach", tuition: 52788, gpa_req: 3.9, ielts_req: 7.5, program: "MSc Machine Learning", deadline: "Dec 8, 2024", scholarship: false },
  { id: 8, name: "University of Melbourne", short: "UniMelb", country: "Australia", flag: "🇦🇺", rank: 33, match: 90, tier: "Safe", tuition: 38800, gpa_req: 3.3, ielts_req: 6.5, program: "MSc Computer Science", deadline: "Mar 1, 2025", scholarship: true },
];

const TIERS = ["All", "Reach", "Match", "Safe"];
const COUNTRIES_FILTER = ["All", "USA", "Germany", "Switzerland", "Singapore", "Canada", "Netherlands", "Australia"];

function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, string> = { Reach: "badge-danger", Match: "badge-accent", Safe: "badge-success" };
  return <span className={`badge ${map[tier] || "badge-accent"}`}>{tier}</span>;
}

export default function UniversitiesPage() {
  const [tierFilter, setTierFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"match" | "rank" | "tuition">("match");

  const filtered = UNIVERSITIES
    .filter((u) => tierFilter === "All" || u.tier === tierFilter)
    .filter((u) => countryFilter === "All" || u.country === countryFilter)
    .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.program.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "match" ? b.match - a.match : sortBy === "rank" ? a.rank - b.rank : a.tuition - b.tuition);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)", padding: "24px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ marginBottom: 12 }}>← Dashboard</Link>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 28 }}>🏛️ University Matches</h1>
              <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>
                {filtered.length} universities matched to your profile
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#ef4444" }}>{UNIVERSITIES.filter(u => u.tier === "Reach").length}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Reach</div>
              </div>
              <div style={{ width: 1, background: "var(--border)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent-light)" }}>{UNIVERSITIES.filter(u => u.tier === "Match").length}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Match</div>
              </div>
              <div style={{ width: 1, background: "var(--border)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#10b981" }}>{UNIVERSITIES.filter(u => u.tier === "Safe").length}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Safe</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <input
              className="input"
              placeholder="🔍 Search universities or programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 280 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              {TIERS.map((t) => (
                <button key={t} onClick={() => setTierFilter(t)} className={`btn btn-sm ${tierFilter === t ? "btn-primary" : "btn-outline"}`}>
                  {t}
                </button>
              ))}
            </div>
            <select className="input" style={{ width: "auto" }} value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
              {COUNTRIES_FILTER.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select className="input" style={{ width: "auto" }} value={sortBy} onChange={(e) => setSortBy(e.target.value as "match" | "rank" | "tuition")}>
              <option value="match">Sort: Best Match</option>
              <option value="rank">Sort: World Rank</option>
              <option value="tuition">Sort: Lowest Tuition</option>
            </select>
          </div>
        </div>
      </div>

      {/* University cards */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(520px, 1fr))", gap: 20 }}>
          {filtered.map((uni) => (
            <div key={uni.id} className="card" style={{ padding: "24px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 20 }}>{uni.flag}</span>
                    <h3 style={{ fontWeight: 800, fontSize: 17 }}>{uni.short}</h3>
                    <TierBadge tier={uni.tier} />
                    {uni.scholarship && <span className="badge badge-cyan">💰 Scholarship</span>}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{uni.name}</p>
                  <p style={{ fontSize: 13, color: "var(--accent-light)", marginTop: 4, fontWeight: 500 }}>{uni.program}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: uni.match >= 88 ? "#10b981" : uni.match >= 75 ? "var(--accent-light)" : "var(--warning)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {uni.match}%
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>match score</div>
                </div>
              </div>

              <div className="progress" style={{ marginBottom: 16 }}>
                <div className="progress-bar progress-accent" style={{ width: `${uni.match}%` }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "World Rank", val: `#${uni.rank}` },
                  { label: "Tuition/yr", val: uni.tuition === 350 ? "~Free" : `$${(uni.tuition / 1000).toFixed(0)}K` },
                  { label: "Min GPA", val: `${uni.gpa_req}/4.0` },
                  { label: "IELTS Min", val: `${uni.ielts_req}` },
                ].map((item) => (
                  <div key={item.label} style={{ textAlign: "center", padding: "10px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)" }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{item.val}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{item.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  📅 Deadline: <strong style={{ color: "var(--text-primary)" }}>{uni.deadline}</strong>
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href="/sop" className="btn btn-outline btn-sm">✍️ Write SOP</Link>
                  <button className="btn btn-primary btn-sm">Apply →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
