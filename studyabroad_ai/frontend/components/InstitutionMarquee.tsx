"use client";

import React from "react";
import Image from "next/image";

interface LogoItem {
  name: string;
  file: string;
  width: number;
  height: number;
  link?: string;
}

const UNIVERSITIES: LogoItem[] = [
  { name: "Harvard University", file: "/logos/harvard.svg", width: 140, height: 44 },
  { name: "MIT", file: "/logos/mit.svg", width: 68, height: 36 },
  { name: "Stanford University", file: "/logos/stanford.svg", width: 42, height: 44 },
  { name: "University of Oxford", file: "/logos/oxford.svg", width: 44, height: 44 },
  { name: "University of Cambridge", file: "/logos/cambridge.svg", width: 44, height: 44 },
  { name: "ETH Zürich", file: "/logos/eth.svg", width: 110, height: 38 },
  { name: "TU Munich", file: "/logos/tum.svg", width: 80, height: 38 },
  { name: "Imperial College London", file: "/logos/imperial.svg", width: 130, height: 40 },
  { name: "UC Berkeley", file: "/logos/berkeley.svg", width: 46, height: 46 },
  { name: "NUS Singapore", file: "/logos/nus.svg", width: 130, height: 42 },
];

const SCHOLARSHIPS: LogoItem[] = [
  { name: "DAAD Germany", file: "/logos/daad.svg", width: 120, height: 40 },
  { name: "Erasmus+", file: "/logos/erasmus.svg", width: 125, height: 38 },
  { name: "Fulbright Program", file: "/logos/fulbright.svg", width: 135, height: 38 },
  { name: "Chevening Scholarships", file: "/logos/chevening.svg", width: 155, height: 42 },
  { name: "Gates Cambridge", file: "/logos/gates.svg", width: 150, height: 40 },
  { name: "Rhodes Trust", file: "/logos/rhodes.svg", width: 145, height: 40 },
  { name: "Swiss Govt Excellence", file: "/logos/swiss.svg", width: 160, height: 42 },
  { name: "MEXT Japan", file: "/logos/mext.svg", width: 145, height: 40 },
  { name: "Australia Awards", file: "/logos/australia.svg", width: 150, height: 38 },
];

export default function InstitutionMarquee() {
  return (
    <section
      aria-label="Official Partner Institutions and Scholarships"
      style={{
        width: "100%",
        padding: "52px 0 60px",
        background: "transparent",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Kicker Header */}
      <div className="container" style={{ textAlign: "center", marginBottom: 30 }}>
        <p
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "2.4px",
            color: "var(--text-tertiary)",
            margin: 0,
            opacity: 0.8,
          }}
        >
          Direct Pathways to 10,000+ World-Class Universities & Top 50,000 Global Scholarships
        </p>
      </div>

      {/* Row 1: Official University Logos (Scrolling Left) */}
      <div className="brand-marquee-container" style={{ marginBottom: 28 }}>
        <div className="brand-marquee-track brand-marquee-left">
          {[...UNIVERSITIES, ...UNIVERSITIES].map((item, idx) => (
            <div
              key={`univ-${idx}`}
              className="official-logo-wrapper"
              title={item.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.file}
                alt={item.name}
                style={{
                  height: item.height,
                  width: "auto",
                  maxWidth: 160,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Official Scholarship Logos (Scrolling Right) */}
      <div className="brand-marquee-container">
        <div className="brand-marquee-track brand-marquee-right">
          {[...SCHOLARSHIPS, ...SCHOLARSHIPS].map((item, idx) => (
            <div
              key={`sch-${idx}`}
              className="official-logo-wrapper"
              title={item.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.file}
                alt={item.name}
                style={{
                  height: item.height,
                  width: "auto",
                  maxWidth: 170,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
