"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/#work", label: "Work" },
  { href: "/#services", label: "Services" },
  { href: "/#play", label: "Play" },
  { href: "/#about", label: "About" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="pwp"
      style={{
        position: "fixed",
        top: 16,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "transparent",
        pointerEvents: "none",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          margin: "0 8px",
          gap: 16,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="pwp-script"
          style={{
            pointerEvents: "auto",
            textDecoration: "none",
            color: "var(--pwp-ink)",
            fontSize: 30,
            lineHeight: 1,
            filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.15))",
            whiteSpace: "nowrap",
          }}
        >
          playing with pencil ✏️
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 24, pointerEvents: "auto" }}>
          {/* Desktop links */}
          <div className="pwp-nav-links" style={{ display: "flex", gap: 24 }}>
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  textDecoration: "none",
                  color: "var(--pwp-muted)",
                  fontWeight: 500,
                  fontSize: 16,
                  fontFamily: "var(--pwp-font-body)",
                  textShadow: "0px 1px 1px rgba(255,255,255,0.6)",
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA — superr-style pill */}
          <Link href="/#contact" className="pwp-btn pwp-btn--sm pwp-nav-cta">
            <span className="pwp-btn-inner">Work with me</span>
          </Link>

          {/* Mobile toggle */}
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="pwp-btn pwp-btn--sm pwp-nav-toggle"
            style={{ display: "none" }}
          >
            <span className="pwp-btn-inner" style={{ padding: "7px 12px" }}>
              ☰
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div
          className="pwp-panel"
          style={{
            margin: "4px 16px 0",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            pointerEvents: "auto",
          }}
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="pwp-display"
              style={{
                textDecoration: "none",
                color: "var(--pwp-ink)",
                fontSize: 22,
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            onClick={() => setOpen(false)}
            className="pwp-btn"
            style={{ alignSelf: "flex-start" }}
          >
            <span className="pwp-btn-inner">Work with me</span>
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .pwp-nav-links { display: none !important; }
          .pwp-nav-cta { display: none !important; }
          .pwp-nav-toggle { display: inline-block !important; }
        }
      `}</style>
    </header>
  );
}
