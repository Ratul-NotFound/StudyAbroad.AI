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

const INITIAL_DOCS = [
  { id: 1, name: "Academic_Transcript_Official.pdf", type: "Transcript", size: "2.4 MB", date: "Uploaded Sep 20", status: "Verified" },
  { id: 2, name: "IELTS_Score_Report_TRF.pdf", type: "Test Score", size: "850 KB", date: "Uploaded Sep 21", status: "Verified" },
  { id: 3, name: "SOP_MIT_Draft_v2.docx", type: "Statement of Purpose", size: "45 KB", date: "Generated Today", status: "Ready" },
  { id: 4, name: "Academic_CV_EuroPass_2025.pdf", type: "Curriculum Vitae", size: "1.1 MB", date: "Uploaded Sep 18", status: "Verified" },
  { id: 5, name: "LOR_Prof_Ahmed_CS_Dept.pdf", type: "Letter of Recommendation", size: "520 KB", date: "Received Sep 19", status: "Pending Review" },
];

export default function DocumentsPage() {
  const pathname = usePathname();
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [dragActive, setDragActive] = useState(false);

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
            <h1 style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>📁 Document Vault & Locker</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
              Secure encrypted storage for transcripts, test reports, LORs, and SOPs
            </p>
          </div>
          <button className="btn btn-primary">⬆ Upload New Document</button>
        </div>

        {/* Upload Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
          style={{
            border: `2px dashed ${dragActive ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "var(--radius)",
            padding: "36px 20px",
            textAlign: "center",
            background: dragActive ? "rgba(99,102,241,0.06)" : "var(--bg-secondary)",
            marginBottom: 32,
            transition: "all 0.2s ease",
            cursor: "pointer",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📤</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
            Drag and drop your academic documents here
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Supports PDF, DOCX, PNG up to 25 MB per file
          </div>
        </div>

        {/* Documents Table */}
        <div className="card" style={{ padding: "0" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", fontWeight: 700, fontSize: 15 }}>
            Stored Documents ({docs.length})
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 12, textTransform: "uppercase" }}>
                  <th style={{ padding: "14px 24px" }}>File Name</th>
                  <th style={{ padding: "14px 16px" }}>Category</th>
                  <th style={{ padding: "14px 16px" }}>Size</th>
                  <th style={{ padding: "14px 16px" }}>Date</th>
                  <th style={{ padding: "14px 16px" }}>Status</th>
                  <th style={{ padding: "14px 24px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "16px 24px", fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
                      <span>📄</span>
                      {d.name}
                    </td>
                    <td style={{ padding: "16px 16px", color: "var(--text-secondary)" }}>{d.type}</td>
                    <td style={{ padding: "16px 16px", color: "var(--text-secondary)" }}>{d.size}</td>
                    <td style={{ padding: "16px 16px", color: "var(--text-secondary)" }}>{d.date}</td>
                    <td style={{ padding: "16px 16px" }}>
                      <span className={`badge ${d.status === "Verified" ? "badge-success" : "badge-accent"}`}>
                        {d.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <button className="btn btn-ghost btn-sm" style={{ marginRight: 6 }}>View</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: "#ef4444" }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
