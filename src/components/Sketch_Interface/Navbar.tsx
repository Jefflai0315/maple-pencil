"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import rough from "roughjs";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rc = rough.canvas(canvas);

      // Clear canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw rough line
        rc.line(0, canvas.height - 2, canvas.width, canvas.height - 2, {
          stroke: "#1f1f1f",
          strokeWidth: 2,
          roughness: 1.5,
          seed: Math.random() * 1000,
        });
      }
    }
  }, []);

  return (
    <header className="nav">
      <canvas
        ref={canvasRef}
        className="rough-border"
        width={typeof window !== "undefined" ? window.innerWidth : 1200}
        height={4}
      />
      <div className="inner">
        <Link
          className="logo font-handwritten text-3xl font-bold text-charcoal"
          href="/"
        >
          {/* Swap this for your SVG or <img src="/logo.svg" /> */}
          <span>PWP</span>
        </Link>
        <button
          className="hamburger"
          aria-label="Menu"
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      {open && (
        <nav className="drawer">
          <a href="#services">Services</a>
          <a href="#moments">Moments</a>
          <a href="#contact">Contact</a>
        </nav>
      )}
      <style jsx>{`
        .nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: #faf7f2cc;
          backdrop-filter: blur(6px);
        }
        .rough-border {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 4px;
          pointer-events: none;
        }
        .inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 40px;
          min-height: 70px;
        }
        .logo {
          font-family: ui-rounded, system-ui, sans-serif;
          font-weight: 700;
          text-decoration: none;
          color: inherit;
        }
        .hamburger {
          background: transparent;
          border: 0;
          padding: 6px;
          display: grid;
          gap: 4px;
        }
        .hamburger span {
          width: 24px;
          height: 2px;
          background: #111;
          display: block;
        }
        .drawer {
          display: grid;
          gap: 8px;
          padding: 12px 20px 20px;
        }
        .drawer a {
          text-decoration: none;
          color: #111;
          font-weight: 600;
        }
        @media (max-width: 768px) {
          .inner {
            padding: 12px 20px;
            min-height: 50px;
          }
        }
      `}</style>
    </header>
  );
}
