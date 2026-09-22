"use client";

import React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import ChatbotWidget from "./ChatbotWidget";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

/**
 * Universal Application Shell (Layout Pattern)
 * Encapsulates the Master Top Navbar, Page Sub-Toolbar, Content, and Master Footer.
 * Follows Single Responsibility and DRY (Don't Repeat Yourself) OOP principles.
 */
export function DashboardLayout({
  children,
  title,
  subtitle,
  actionButton,
}: DashboardLayoutProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--bg-primary)",
      }}
    >
      {/* ── 1. Master Top Global Navigation Bar ── */}
      <Navbar />

      {/* ── 2. Contextual Page Header / Sub-Toolbar (When provided) ── */}
      {(title || actionButton) && (
        <section
          style={{
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-secondary)",
            padding: "16px 0",
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              {title && (
                <h1
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    margin: 0,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {title}
                </h1>
              )}
              {subtitle && (
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "13px",
                    margin: "3px 0 0",
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {actionButton && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                {actionButton}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 3. Main Content Container with Motion Entrance ── */}
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{
          flex: 1,
          padding: "28px 0 48px",
          width: "100%",
        }}
      >
        <div className="container">{children}</div>
      </motion.main>

      {/* ── 4. Interactive Floating AI Admissions Chatbot ── */}
      <ChatbotWidget />

      {/* ── 5. Master Universal SaaS Footer ── */}
      <Footer />
    </div>
  );
}
