"use client";
import React, { useState, useRef } from "react";

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
            <div className="features">
              <div className="feature">✓ Live sketching</div>
              <div className="feature">✓ Event coverage</div>
              <div className="feature">✓ Reaction content</div>
            </div>
          </div>
        </div>
        te
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
        .sketch-services {
          padding: 2rem;
          font-family: "Georgia", serif;
        }

        .sketchbook-bg-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .header h2 {
          font-size: clamp(2rem, 5vw, 3.5rem);
          color: #2c2c2c;
          margin: 0;
          transform: rotate(-1deg);
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }

        .caption {
          display: inline-block;
          background: #d4af37;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
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
          top: 20%;
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
          top: 22%;
          left: 48%;
          width: 30%;
          height: 40%;
          padding: 1rem;
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.9);
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
          background: rgba(255, 255, 255, 0.9);
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
        }

        .nav-btn {
          background: none;
          border: none;
          font-size: 0.8rem;
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
          font-size: 0.6rem;
          color: #666;
          white-space: nowrap;
        }

        /* Text content styles */
        .service-description {
          font-family: "Courier New", monospace;
          font-size: 0.75rem;
          color: #555;
          line-height: 1.3;
        }

        .service-description h3 {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          color: #333;
          transform: rotate(-0.3deg);
        }

        .service-description p {
          margin: 0 0 0.8rem 0;
          font-size: 0.65rem;
          font-style: italic;
        }

        .features {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .feature {
          font-size: 0.6rem;
          color: #666;
        }

        /* Tab buttons */
        .tab-btn {
          flex: 1;
          background: rgba(240, 240, 240, 0.8);
          border: 1px solid #ccc;
          font-size: 0.6rem;
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
          .sketchbook-container {
            overflow-y: hidden;
            aspect-ratio: 4/3;
            margin-top: 5vh;
          }

          .service-description {
            font-size: 0.65rem;
          }

          .service-description h3 {
            font-size: 0.8rem;
          }

          .service-description p {
            font-size: 0.7rem;
          }

          .feature {
            font-size: 0.65rem;
          }

          .tab-btn {
            font-size: 0.5rem;
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
            font-size: 0.55rem;
          }

          .service-description h3 {
            font-size: 0.7rem;
          }

          .counter {
            font-size: 0.5rem;
          }
        }
        @media (max-width: 600px) {
          .sketch-services {
            height: 80vh;
            overflow: hidden; /* Prevent horizontal scroll */
          }
          .sketchbook-container {
            top: 100%;
            position: absolute;
            width: 150vw; /* Use viewport width instead of height */
            height: 70vh;
            left: 50%;
            transform: translateX(-55%); /* Center properly */
          }

          /* Rotate only the background image */
          .background-layer {
            transform: rotate(90deg);
            width: 100%;
            height: 100%;
            left: 0;
            object-fit: cover;
          }

          /* Keep content layers upright but reposition them */
          .picture-content {
            top: 13%;
            left: 40%;
            width: 35%;
          }

          .text-content {
            top: 55%;
            left: 40%;
            height: 20%;
            width: 35%;
          }

          .image-container {
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
