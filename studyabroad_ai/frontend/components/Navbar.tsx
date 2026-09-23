"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../lib/theme";
import {
  GraduationCap,
  Menu,
  X,
  Sparkles,
  Landmark,
  PenTool,
  Award,
  BarChart2,
  Calendar,
  Folder,
  User,
  Settings,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * All 7 Primary Modules from StudyAbroad.AI SRS & Project Plan:
 * 1. Dashboard - Command Center & Agent Monitoring
 * 2. Universities - Semantic Search & Program Matching
 * 3. Scholarships - Funding Radar & Grants Vault
 * 4. SOP Writer - Voice-Preserved Document Suite
 * 5. Deadlines - Milestone Tracker & Application Checklist
 * 6. Documents - Encrypted Document Vault & Audits
 * 7. Profile - Academic Profile & Readiness Score
 */
export const ALL_FEATURES = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart2 },
  { href: "/universities", label: "Universities", icon: Landmark },
  { href: "/dashboard/scholarships", label: "Scholarships", icon: Award },
  { href: "/sop", label: "SOP Writer", icon: PenTool },
  { href: "/dashboard/deadlines", label: "Deadlines", icon: Calendar },
  { href: "/dashboard/documents", label: "Documents", icon: Folder },
  { href: "/profile", label: "Profile", icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "var(--nav-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        width: "100%",
      }}
    >
      <div
        style={{
          maxWidth: "1480px",
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
          gap: "16px",
        }}
      >
        {/* Brand Identity */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--accent), var(--accent3))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-accent)",
            }}
          >
            <GraduationCap size={20} color="#ffffff" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "18px",
                fontWeight: 800,
                letterSpacing: "-0.4px",
                color: "var(--text-primary)",
              }}
            >
              StudyAbroad<span className="gradient-text">.AI</span>
            </span>
          </div>
        </Link>

        {/* All 7 Features - Clean & Spacious Horizontal Navigation */}
        <nav
          className="nav-links-desktop"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {ALL_FEATURES.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px 13px",
                  fontSize: "13px",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  textDecoration: "none",
                  borderRadius: "var(--radius-sm)",
                  background: isActive ? "var(--bg-card)" : "transparent",
                  border: isActive ? "1px solid var(--border-accent)" : "1px solid transparent",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Tools: Admin, Theme Switcher & Mobile Menu */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {/* Admin Panel Link */}
          <Link
            href="/admin"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 600,
              color: pathname.startsWith("/admin") ? "#A78BFA" : "#7C3AED",
              textDecoration: "none",
              borderRadius: "var(--radius-sm)",
              background: pathname.startsWith("/admin") ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.3)",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            <Settings size={13} />
            <span>Admin</span>
          </Link>
          <ThemeToggle />

          {/* Mobile Drawer Trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="mobile-menu-btn"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "7px",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
            aria-label="Open Navigation Menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Responsive Drawer rendered via Portal to escape Header containing block */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0, 0, 0, 0.7)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    zIndex: 99999,
                  }}
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 26, stiffness: 320 }}
                  style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    height: "100vh",
                    width: "min(320px, 86vw)",
                    background: "var(--bg-secondary)",
                    borderLeft: "1px solid var(--border)",
                    zIndex: 100000,
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    boxShadow: "0 0 40px rgba(0,0,0,0.45)",
                    overflowY: "auto",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "7px",
                          background: "var(--accent)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <GraduationCap size={16} color="#ffffff" />
                      </div>
                      <span style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-primary)" }}>
                        Navigation Menu
                      </span>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        padding: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label="Close menu"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                    {ALL_FEATURES.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "12px 14px",
                            borderRadius: "var(--radius)",
                            color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                            textDecoration: "none",
                            fontSize: "14px",
                            fontWeight: isActive ? 700 : 500,
                            background: isActive ? "var(--bg-card)" : "transparent",
                            border: isActive ? "1px solid var(--border-accent)" : "1px solid transparent",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <Icon size={18} color={isActive ? "var(--accent-light)" : "var(--text-muted)"} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "10px 14px", borderRadius: "var(--radius)",
                        color: "#A78BFA", textDecoration: "none", fontSize: "14px", fontWeight: 600,
                        background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)",
                      }}
                    >
                      <Settings size={16} />
                      <span>Admin Panel</span>
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn btn-primary"
                      style={{ width: "100%", justifyContent: "center", fontSize: "13.5px", padding: "10px 16px" }}
                    >
                      <Sparkles size={15} />
                      <span>Evaluate My Profile</span>
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
}
