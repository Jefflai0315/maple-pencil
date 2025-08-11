"use client";
import React, { useState, useRef, useEffect } from "react";

interface CarouselItem {
  id: number;
  image: string;
  alt: string;
}

interface ImageCarouselProps {
  items: CarouselItem[];
  title?: string;
  description?: string;
  features?: string[];
}

const ImageCarousel = ({ items }: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef<number>(0);

  const hasItems = items.length > 0;

  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goNext = () =>
    setCurrentIndex((i) => Math.min(items.length - 1, i + 1));

  useEffect(() => {
    setCurrentIndex((i) => Math.min(i, Math.max(0, items.length - 1)));
  }, [items.length]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!hasItems) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!hasItems) return;
    touchStartXRef.current = event.touches[0].clientX;
    touchDeltaXRef.current = 0;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!hasItems) return;
    if (touchStartXRef.current !== null) {
      touchDeltaXRef.current =
        event.touches[0].clientX - touchStartXRef.current;
    }
  };

  const handleTouchEnd = () => {
    if (!hasItems) return;
    const deltaX = touchDeltaXRef.current;
    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
    const threshold = 40; // px swipe threshold
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        goPrev();
      } else {
        goNext();
      }
    }
  };

  const handleClickZone = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!hasItems) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    if (clickX < rect.width * 0.4) {
      goPrev();
    } else if (clickX > rect.width * 0.6) {
      goNext();
    }
  };

  return (
    <div className="carousel-content">
      <div
        className="image-container"
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClickZone}
        aria-roledescription="carousel"
        aria-label="Sketch carousel"
      >
        {hasItems && (
          <img
            src={items[currentIndex]?.image}
            alt={items[currentIndex]?.alt || "Sketch"}
            className="sketch-image rounded-lg aspect-square object-cover"
          />
        )}

        {hasItems && (
          <>
            <button
              className="tap-zone left"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous image"
              disabled={currentIndex === 0}
            />
            <button
              className="tap-zone right"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next image"
              disabled={currentIndex === items.length - 1}
            />
          </>
        )}

        {hasItems && (
          <div className="nav-controls" aria-live="polite">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="nav-btn prev"
              aria-label="Previous"
              title="Previous"
            >
              ‹
            </button>
            <span className="counter">
              {currentIndex + 1}/{items.length}
            </span>
            <button
              onClick={() =>
                setCurrentIndex(Math.min(items.length - 1, currentIndex + 1))
              }
              disabled={currentIndex === items.length - 1}
              className="nav-btn next"
              aria-label="Next"
              title="Next"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const QUICK_PAGES = [
  "/gallery/quick/Com_1.jpg",
  "/gallery/quick/Com_2.jpg",
  "/gallery/quick/Com_3.jpg",
  "/gallery/quick/Com_4.jpg",
  "/gallery/quick/Com_5.jpg",
  "/gallery/quick/Com_6.jpg",
  "/gallery/quick/Com_7.jpg",
  "/gallery/quick/Com_8.jpg",
];

const DETAILED_PAGES = [
  "/gallery/detailed/1.jpg",
  "/gallery/detailed/2.jpg",
  "/gallery/detailed/4.jpg",
  "/gallery/detailed/5.jpg",
  "/gallery/detailed/6.jpg",
  "/gallery/detailed/7.jpg",
  "/gallery/detailed/8.jpg",
  "/gallery/detailed/9.jpg",
  "/gallery/detailed/10.jpg",
  "/gallery/detailed/11.jpg",
  "/gallery/detailed/12.jpg",
];

const BIG_PAGES = ["/gallery/big/1.jpg", "/gallery/big/2.jpg"];

type Mode = "quick" | "detailed" | "big" | "comingSoon";

export default function ClippathSketchbook() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mode, setMode] = useState<Mode>("quick");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Compute tab gap relative to container size so spacing scales with the image
  useEffect(() => {
    const updateTabGap = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const base = isMobile ? rect.width : rect.height; // align with visual orientation
      const gapPx = Math.max(10, Math.min(80, base * 0.09));
      containerRef.current.style.setProperty("--tab-gap", `${gapPx}px`);
    };

    updateTabGap();
    window.addEventListener("resize", updateTabGap);
    return () => window.removeEventListener("resize", updateTabGap);
  }, [isMobile, mode]);

  const backgroundSrc =
    mode === "quick"
      ? "/sketch/sketchbook.png"
      : mode === "detailed"
      ? "/sketch/sketchbook1.png"
      : mode === "big"
      ? "/sketch/sketchbook2.png"
      : "/sketch/sketchbook3.png"; // comingSoon

  const items =
    mode === "quick"
      ? QUICK_PAGES
      : mode === "detailed"
      ? DETAILED_PAGES
      : mode === "big"
      ? BIG_PAGES
      : [];

  const carouselItems = items.map((page, index) => ({
    id: index,
    image: page,
    alt: `${mode} sketch ${index + 1}`,
  }));

  const description =
    mode === "quick"
      ? "Quick portraits"
      : mode === "detailed"
      ? "Detailed portraits"
      : mode === "big"
      ? "Large format portraits"
      : "";

  const headerTitle =
    mode === "quick"
      ? "Quick Sketch Services"
      : mode === "detailed"
      ? "Detailed Portrait Services"
      : mode === "big"
      ? "Big Portrait Services"
      : "";

  const featureList =
    mode === "quick"
      ? ["✓ Live sketching", "✓ Event coverage", "✓ Reaction content"]
      : mode === "detailed"
      ? ["✓ Premium finish", "✓ High-resolution export", "✓ Framing available"]
      : mode === "big"
      ? ["✓ Large format", "✓ High detail", "✓ Great for displays"]
      : [];

  return (
    <section className="sketch-services ">
      <header className="header">
        <h2>My Sketch Services</h2>
        <span className="caption">open for commission</span>
      </header>

      <div
        className="sketchbook-container overflow-x-hidden"
        ref={containerRef}
      >
        {/* Background */}
        <div className="background-layer">
          <img
            src={backgroundSrc}
            alt="Sketchbook"
            className="sketchbook-bg-image overflow-x-hidden"
          />
        </div>

        {/* Picture content */}
        <div className="content-layer picture-content">
          <ImageCarousel
            key={mode}
            items={carouselItems}
            title="Sketches"
            description={description}
            features={undefined}
          />
        </div>

        {/* Text content */}
        <div className="content-layer text-content">
          <div className="service-description">
            <h3>{headerTitle}</h3>
            <p>
              {mode === "comingSoon"
                ? ""
                : mode === "quick"
                ? "Professional portrait sketching for events, parties, and personal sessions."
                : mode === "detailed"
                ? "Premium detailed portraits with refined shading and finishing touches, perfect as gifts or keepsakes."
                : "Larger, more impactful portraits ideal for displays and exhibits."}
            </p>
            {!isMobile && featureList.length > 0 && (
              <div className="features">
                {featureList.map((text) => (
                  <div key={text} className="feature">
                    {text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs positioned similar to the sketchbook tabs on the image */}
        <div
          className="content-layer tabs-content"
          role="tablist"
          aria-label="Sketchbook sections"
        >
          <button
            className={`tab-btn ${mode === "quick" ? "active" : ""}`}
            role="tab"
            aria-selected={mode === "quick"}
            aria-controls="panel-quick"
            onClick={() => setMode("quick")}
            title="QUICK"
          >
            QU
          </button>
          <button
            className={`tab-btn ${mode === "detailed" ? "active" : ""}`}
            role="tab"
            aria-selected={mode === "detailed"}
            aria-controls="panel-detailed"
            onClick={() => setMode("detailed")}
            title="DETAIL"
          >
            DE
          </button>
          <button
            className={`tab-btn ${mode === "big" ? "active" : ""}`}
            role="tab"
            aria-selected={mode === "big"}
            aria-controls="panel-big"
            onClick={() => setMode("big")}
            title="BIG"
          >
            BI
          </button>
          <button
            className={`tab-btn ${mode === "comingSoon" ? "active" : ""}`}
            role="tab"
            aria-selected={mode === "comingSoon"}
            aria-controls="panel-soon"
            onClick={() => setMode("comingSoon")}
            title="SOON"
          >
            SO
          </button>
        </div>
      </div>

      <style jsx>{`
        @font-face {
          font-family: "Brushed";
          src: url("/BRUSHED.TTF") format("truetype");
          font-weight: normal;
          font-style: normal;
        }

        .sketch-services {
          padding: 2rem;
          font-family: "Brushed", "Georgia", serif;
          --header-spacing: clamp(3rem, 8vh, 6rem);
          --header-height: clamp(100px, 15vh, 150px);
          overflow-x: hidden;
          max-width: 100vw;
        }

        .sketchbook-bg-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .header {
          text-align: center;
          min-height: var(--header-height);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .header h2 {
          color: #2c2c2c;
          margin: 0;
          font-size: clamp(2.5rem, 5vw, 2rem);
          font-weight: bold;
          transform: rotate(-1deg);
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
          line-height: 1.2;
        }
        .caption {
          display: inline-block;
          background: #d4af37;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          transform: rotate(1deg);
          margin-top: 1rem;
        }

        .sketchbook-container {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
          aspect-ratio: 3/2;
          min-height: 400px;
          filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.2));
        }
        .background-layer {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        .content-layer {
          position: absolute;
          z-index: 2;
          pointer-events: auto;
        }

        /* Content positioning */
        .picture-content {
          top: 15%;
          left: 20%;
          width: 28%;
          height: 45%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          box-sizing: border-box;
        }
        .text-content {
          top: 17%;
          left: 48%;
          width: 30%;
          height: 40%;
          padding: 1rem;
          box-sizing: border-box;
        }

        /* Tabs area: row on desktop */
        .tabs-content {
          top: 13%;
          right: 5%;
          display: flex;
          flex-direction: column;
          gap: var(--tab-gap, 8px);
          align-items: center;
          justify-content: center;
        }

        /* Carousel styles */
        .carousel-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .image-container {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
          overflow: hidden;
          border-radius: 16px;
          aspect-ratio: 2 / 3;
          outline: none;
        }
        .sketch-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 16px;
          max-height: 100%;
          filter: sepia(15%) contrast(1.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          user-select: none;
          -webkit-user-drag: none;
          pointer-events: none;
        }

        .coming-soon {
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.95);
          padding: 0.2rem 0.6rem;
          border-radius: 8px;
          color: #666;
          z-index: 4;
          font-weight: 600;
        }

        .tap-zone {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 50%;
          background: transparent;
          border: none;
          cursor: pointer;
          z-index: 3;
        }
        .tap-zone.left {
          left: 0;
        }
        .tap-zone.right {
          right: 0;
        }
        .tap-zone:hover {
          background: rgba(0, 0, 0, 0.03);
        }
        .tap-zone:disabled {
          cursor: not-allowed;
          opacity: 0.3;
        }

        .nav-controls {
          position: absolute;
          bottom: -15px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          background: rgba(255, 255, 255, 0.9);
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          z-index: 4;
        }
        .nav-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          transition: background 0.2s;
          font-size: 1.25rem;
          line-height: 1;
        }
        .nav-btn:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.1);
        }
        .nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .counter {
          color: #666;
          white-space: nowrap;
        }

        /* Text content styles */
        .service-description {
          font-family: "Courier New", monospace;
          color: #555;
          line-height: 1.3;
        }
        .service-description h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
          transform: rotate(-0.3deg);
        }
        .service-description p {
          margin: 0 0 0.8rem 0;
          font-style: italic;
        }
        .features {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .feature {
          color: #666;
        }

        /* Tab button styling */
        .tab-btn {
          position: relative;
          background: transparent;
          border: none;
          color: transparent;
          cursor: pointer;
          transition: outline-color 0.15s ease, box-shadow 0.15s ease;
          border-radius: 6px;
          width: clamp(60px, 8vw, 100px);
          height: clamp(20px, 3.2vh, 40px);
          padding: 0;
          text-align: center;
          white-space: nowrap;
        }
        .tab-btn:hover {
          outline: 2px dashed rgba(212, 175, 55, 0.1);
          outline-offset: 2px;
        }
        .tab-btn:focus-visible {
          outline: 2px solid rgba(212, 175, 55, 0.1);
          outline-offset: 2px;
        }
        .tab-btn:active {
          transform: translateY(1px);
        }
        .tab-btn.active {
          outline: 2px solid rgba(212, 175, 55, 0.1);
          outline-offset: 2px;
        }
        /* Lightweight tooltip on desktop only */
        @media (hover: hover) and (pointer: fine) {
          .tab-btn::after {
            content: attr(title);
            position: absolute;
            bottom: 100%;
            right: 0;
            transform: translateY(-6px);
            font-size: 0.7rem;
            color: #555;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 6px;
            padding: 2px 6px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.15s ease;
          }
          .tab-btn:hover::after,
          .tab-btn:focus-visible::after {
            opacity: 1;
          }
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .sketch-services {
            --header-spacing: clamp(2rem, 6vh, 4rem);
            --header-height: clamp(80px, 12vh, 120px);
          }
          .sketchbook-container {
            overflow-y: hidden;
            aspect-ratio: 4/3;
          }
          .tab-btn {
            height: clamp(60px, 8vw, 100px);
            width: clamp(18px, 3.2vh, 28px);
          }
        }

        @media (max-width: 480px) {
          .picture-content {
            padding: 0.25rem;
          }
          .text-content {
            padding: 0.5rem;
          }
        }

        @media (max-width: 600px) {
          .sketch-services {
            height: 90vh;
            overflow: hidden;
            position: relative;
            --mobile-header-total: calc(
              var(--header-height) + var(--header-spacing) + 3rem
            );
          }
          .sketchbook-container {
            top: var(--mobile-header-total);
            position: absolute;
            width: 100vw;
            height: 70vh;
            left: 50%;
            transform: translateX(-50%);
          }

          /* Rotate only the background image */
          .background-layer {
            transform: rotate(90deg);
            width: 150%;
            height: 100%;
            left: -35%;
            top: 0;
            object-fit: cover;
          }

          /* Keep content layers upright but reposition them */
          .picture-content {
            top: 13%;
            left: 27%;
            width: 50%;
          }
          .text-content {
            top: 55%;
            left: 27%;
            height: 20%;
            width: 50%;
          }
          .image-container {
            gap: 0.3rem;
            aspect-ratio: 3 / 4;
          }
          .sketch-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transform-origin: center center;
          }

          /* Tabs become a column on mobile */
          .tabs-content {
            top: 82%;
            right: 22%;
            flex-direction: row-reverse;
            gap: var(--tab-gap, 6px);
            align-items: stretch;
          }

          .tap-zone:hover {
            background: transparent;
          }
        }
      `}</style>
    </section>
  );
}
