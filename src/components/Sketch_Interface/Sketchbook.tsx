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

  return (
    <div className="carousel-content">
      <div className="image-container">
        <img
          src={items[currentIndex]?.image || "/api/placeholder/120/150"}
          alt={items[currentIndex]?.alt || "Sketch"}
          className="sketch-image rounded-lg aspect-square object-cover"
        />
        <div className="nav-controls">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="nav-btn prev"
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
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

const PAGES = [
  "/gallery/quick/Com_1.jpg",
  "/gallery/quick/Com_2.jpg",
  "/gallery/quick/Com_3.jpg",
  "/gallery/quick/Com_4.jpg",
  "/gallery/quick/Com_5.jpg",
  "/gallery/quick/Com_6.jpg",
  "/gallery/quick/Com_7.jpg",
  "/gallery/quick/Com_8.jpg",
];

export default function ClippathSketchbook() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
        {/* Method 1: Using your actual sketchbook image as background */}
        <div className="background-layer">
          <img
            src="/sketch/sketchbook.png"
            alt="Sketchbook"
            className="sketchbook-bg-image overflow-x-hidden"
          />
        </div>
        {/* Content layers with precise positioning */}
        <div className="content-layer picture-content">
          <ImageCarousel
            items={PAGES.map((page, index) => ({
              id: index,
              image: page,
              alt: `Quick sketch ${index + 1}`,
            }))}
            title="Sketches"
            description="Quick portraits"
            features={["5-15 min", "Live drawing", "Digital copy"]}
          />
        </div>
        <div className="content-layer text-content">
          <div className="service-description">
            <h3>Quick Sketch Services</h3>
            <p>
              Professional portrait sketching for events, parties, and personal
              sessions.
            </p>
            {!isMobile && (
              <div className="features">
                <div className="feature">✓ Live sketching</div>
                <div className="feature">✓ Event coverage</div>
                <div className="feature">✓ Reaction content</div>
              </div>
            )}
          </div>
        </div>
        {/* <div className="content-layer tabs-content">
          <button className="tab-btn tab-1" title="Quick sketches">
            QUICK
          </button>
          <button className="tab-btn tab-2" title="Detailed portraits">
            DETAIL
          </button>
          <button className="tab-btn tab-3" title="Live events">
            LIVE
          </button>
          <button className="tab-btn tab-4" title="Digital copies">
            COPY
          </button>
        </div> */}
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
          --header-spacing: clamp(3rem, 8vh, 6rem); /* Responsive spacing */
          --header-height: clamp(
            100px,
            15vh,
            150px
          ); /* Responsive header height */
          overflow-x: hidden; /* Prevent horizontal scroll */
          max-width: 100vw; /* Ensure container doesn't exceed viewport */
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
          font-size: clamp(2.5rem, 5vw, 2rem); /* Responsive font size */
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

        /* Mock sketchbook design (replace with your image) */
        .mock-sketchbook {
          width: 100%;
          height: 100%;
          background: #f8f8f0;
          border-radius: 8px;
          position: relative;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }

        .spiral-binding {
          position: absolute;
          left: 5%;
          top: 15%;
          bottom: 15%;
          width: 3%;
          background: repeating-linear-gradient(
            to bottom,
            #666 0px,
            #666 8px,
            transparent 8px,
            transparent 16px
          );
        }

        .spiral-binding::before {
          content: "";
          position: absolute;
          left: -30%;
          top: 0;
          bottom: 0;
          width: 20%;
          background: #444;
        }

        .page-area {
          position: absolute;
          top: 15%;
          left: 12%;
          right: 8%;
          bottom: 15%;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .picture-frame {
          position: absolute;
          top: 20%;
          left: 15%;
          width: 25%;
          height: 45%;
          border: 2px solid #666;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.8);
        }

        .text-lines {
          position: absolute;
          top: 25%;
          left: 45%;
          right: 15%;
          height: 40%;
          background: repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 18px,
            #ddd 19px,
            #ddd 20px
          );
        }

        .tabs {
          position: absolute;
          top: 20%;
          right: 5%;
          width: 12%;
          height: 50%;
          background: repeating-linear-gradient(
            to bottom,
            #f0f0f0 0%,
            #f0f0f0 22%,
            #e0e0e0 22%,
            #e0e0e0 25%
          );
          border: 1px solid #ccc;
          border-radius: 0 4px 4px 0;
        }

        .pencil {
          position: absolute;
          bottom: 15%;
          left: 30%;
          width: 15%;
          height: 2%;
          background: linear-gradient(
            to right,
            #f4d03f 0%,
            #f4d03f 80%,
            #e8b4cb 80%,
            #e8b4cb 90%,
            #2c3e50 90%
          );
          border-radius: 2px;
          transform: rotate(-10deg);
        }

        /* Content positioning - adjust these percentages to match your image */
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

        .tabs-content {
          top: 20%;
          right: 5%;
          width: 12%;
          height: 50%;
          display: flex;
          flex-direction: column;
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
          overflow: hidden; /* ✅ enable clipping */
          border-radius: 16px; /* ✅ round the frame */
          aspect-ratio: 2 / 3; /* ✅ control the frame’s shape */
        }

        .sketch-image {
          width: 100%;
          height: 100%;
          object-fit: cover; /* Fills container properly */
          border-radius: 16px; /* Matches container */
          max-height: 100%;
          filter: sepia(15%) contrast(1.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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
        }

        .nav-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          transition: background 0.2s;
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

        /* Tab buttons */
        .tab-btn {
          flex: 1;
          background: rgba(240, 240, 240, 0.8);
          border: 1px solid #ccc;
          font-weight: bold;
          color: #666;
          cursor: pointer;
          transition: all 0.3s;
          border-radius: 0;
        }

        .tab-btn:first-child {
          border-top-right-radius: 4px;
        }

        .tab-btn:last-child {
          border-bottom-right-radius: 4px;
        }

        .tab-btn:hover {
          background: rgba(212, 175, 55, 0.3);
          transform: translateX(2px);
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

          .service-description {
          }

          .service-description h3 {
          }

          .service-description p {
          }

          .feature {
          }

          .tab-btn {
          }
        }

        @media (max-width: 480px) {
          .picture-content {
            padding: 0.25rem;
          }

          .text-content {
            padding: 0.5rem;
          }

          .service-description {
          }

          .service-description h3 {
          }

          .counter {
          }
        }
        @media (max-width: 600px) {
          .sketch-services {
            height: 90vh;
            overflow: hidden; /* Prevent horizontal scroll */
            position: relative;
            --mobile-header-total: calc(
              var(--header-height) + var(--header-spacing) + 3rem
            ); /* Total header space needed */
          }
          .sketchbook-container {
            top: var(--mobile-header-total); /* Use calculated header space */
            position: absolute;
            width: 100vw; /* Use full viewport width */
            height: 70vh;
            left: 50%;
            transform: translateX(-50%); /* Center properly */
          }

          /* Rotate only the background image */
          .background-layer {
            transform: rotate(90deg);
            width: 150%;
            height: 100%;
            left: -35%;
            top: 0; /* Ensure it starts from the container top */
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
            aspect-ratio: 3 / 4; /* pick the portrait frame you want on mobile */
          }

          .sketch-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transform-origin: center center; /* keep it centered */
          }
        }
      `}</style>
    </section>
  );
}
