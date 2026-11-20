"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/#steps", label: "4 steps" },
  { href: "/#faq", label: "FAQ" },
  { href: "/about", label: "About Jeff" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Give the bar a paper background once the page scrolls, so the logo never
  // sits on top of headings.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="pwp"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        paddingTop: scrolled ? 4 : 16,
        paddingBottom: scrolled ? 4 : 0,
        background: scrolled ? "rgba(253,251,249,0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(8px)" : "none",
        boxShadow: scrolled ? "0 1px 0 var(--pwp-line)" : "none",
        transition: "background 0.2s ease, padding 0.2s ease, box-shadow 0.2s ease",
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
          <Link href="/copy" className="pwp-btn pwp-btn--sm pwp-btn--orange pwp-nav-cta">
            <span className="pwp-btn-inner">Start drawing</span>
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
            href="/copy"
            onClick={() => setOpen(false)}
            className="pwp-btn pwp-btn--orange"
            style={{ alignSelf: "flex-start" }}
          >
            <span className="pwp-btn-inner">Start drawing</span>
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
