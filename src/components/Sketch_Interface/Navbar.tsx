"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import rough from "roughjs";

declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params: Record<string, unknown>
    ) => void;
  }
}

import { Gamepad2, Palette, X, Menu } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
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
  // Check if we're on the home page
  const isHomePage = () => {
    return typeof window !== "undefined" && window.location.pathname === "/";
  };

  // Scroll to section
  const scrollToSection = useCallback((sectionId: string) => {
    if (isHomePage()) {
      // If on home page, scroll directly to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setActiveSection(sectionId);
        setIsMenuOpen(false);
      }
    } else {
      // If not on home page, navigate to home page with hash
      window.location.href = `/#${sectionId}`;
    }
  }, []);

  // Handle hash navigation when coming from other pages
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash.substring(1); // Remove the # symbol
      if (hash && isHomePage()) {
        // Small delay to ensure page is fully loaded
        setTimeout(() => {
          scrollToSection(hash);
        }, 100);
      }
    };

    // Handle initial load
    handleHashNavigation();

    // Handle browser back/forward
    window.addEventListener("hashchange", handleHashNavigation);

    return () => {
      window.removeEventListener("hashchange", handleHashNavigation);
    };
  }, [scrollToSection]);

  // Handle scroll for active section and nav visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const sections = ["services", "portfolio", "contact", "casestudy"];
      const scrollPosition = currentScrollY + 100;

      // Handle navigation visibility
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and not at the top
        setIsNavVisible(false);
      } else {
        // Scrolling up or at the top
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);

      // Handle active section
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header className="nav">
      <canvas
        ref={canvasRef}
        className="rough-border"
        width={typeof window !== "undefined" ? window.innerWidth : 1200}
        height={4}
      />
      <nav
        className={`organic-nav px-4 py-4 transition-transform duration-300 ${
          isNavVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-6xl mx-auto px-2 flex items-center justify-between">
          <div className="font-handwritten text-3xl font-bold text-charcoal logo-animated">
            Playing with Pencil
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {["services", "portfolio", "contact", "casestudy"].map(
              (section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`font-sketch text-lg capitalize transition-all duration-300 nav-item ${
                    activeSection === section
                      ? "text-charcoal font-bold sketch-heading"
                      : "text-charcoal-medium hover:text-charcoal"
                  }`}
                >
                  {section === "casestudy" ? "Case Studies" : section}
                </button>
              )
            )}
            <Link
              href="/world"
              className="font-sketch text-lg text-charcoal-medium hover:text-charcoal transition-all duration-300 flex items-center gap-2 nav-item"
            >
              <Gamepad2 size={18} />
              World
            </Link>

            <Link
              href="/sembawang-mural"
              className="font-sketch text-lg text-charcoal-medium hover:text-charcoal transition-all duration-300 flex items-center gap-2 nav-item"
            >
              <Palette size={18} />
              Mural
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-charcoal"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute  top-full left-0 right-0 border-t-2 border-sketch-gray">
            <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg border-b-2 border-charcoal-light">
              {["services", "portfolio", "contact", "casestudy"].map(
                (section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className="font-sketch text-lg capitalize text-left text-charcoal-medium hover:text-charcoal"
                  >
                    {section === "casestudy" ? "Case Studies" : section}
                  </button>
                )
              )}
              <Link
                href="/world"
                className="font-sketch text-lg text-left text-charcoal-medium hover:text-charcoal flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Gamepad2 size={18} />
                World
              </Link>
              <Link
                href="/sembawang-mural"
                className="font-sketch text-lg text-left text-charcoal-medium hover:text-charcoal flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Palette size={18} />
                Mural
              </Link>
            </div>
          </div>
        )}
      </nav>
      <style jsx>{`
        .nav {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(6px);
          background-color: rgb(255, 207, 65);
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

        .logo-animated {
          animation: logoBounce 2s ease-in-out infinite;
          transition: all 0.3s ease;
        }

        .logo-animated:hover {
          animation-play-state: paused;
          transform: scale(1.05);
        }

        .nav-item {
          position: relative;
          animation: navItemSlide 0.6s ease-out;
          animation-fill-mode: both;
        }

        .nav-item:nth-child(1) {
          animation-delay: 0.1s;
        }
        .nav-item:nth-child(2) {
          animation-delay: 0.2s;
        }
        .nav-item:nth-child(3) {
          animation-delay: 0.3s;
        }
        .nav-item:nth-child(4) {
          animation-delay: 0.4s;
        }
        .nav-item:nth-child(5) {
          animation-delay: 0.5s;
        }
        .nav-item:nth-child(6) {
          animation-delay: 0.6s;
        }

        .nav-item:hover {
          transform: translateY(-2px);
        }

        .nav-item::after {
          content: "";
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 2px;
          background: #1f1f1f;
          transition: width 0.3s ease;
        }

        .nav-item:hover::after {
          width: 100%;
        }

        @keyframes logoBounce {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes navItemSlide {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}
