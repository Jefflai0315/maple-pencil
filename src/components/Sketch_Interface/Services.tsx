"use client";
import { useEffect, useState } from "react";

type ServiceType = "art-tech" | "live-events" | "commissions";

interface Service {
  id: ServiceType;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  image: string;
  sketchIcon: string;
}

const SERVICES: Service[] = [
  {
    id: "art-tech",
    title: "Art & Tech Services",
    subtitle: "Creative digital solutions",
    description:
      "Bridging creativity and technology. From interactive installations to digital art experiences, I create innovative solutions that engage and inspire.",
    features: [
      "Interactive installations",
      "Live art experiences",
      "Digital art & animation",
      "Custom web experiences",
    ],
    image: "/sketch/world_colored.png",
    sketchIcon: "/NPC/Camera.png",
  },
  {
    id: "live-events",
    title: "Live Event Sketch Booth",
    subtitle: "Capture moments in real-time",
    description:
      "Transform your events into unforgettable experiences. I set up live sketch booths and run engaging workshops where guests get personalized sketches and memories.",
    features: [
      "Corporate events & parties",
      "Wedding entertainment",
      "Team-building workshops",
      "Festival activations",
      "Custom drawing photobooth setups",
    ],
    image: "/NPC/easel.png",
    sketchIcon: "/NPC/Sketch_booth.png",
  },
  {
    id: "commissions",
    title: "Commission Sketches",
    subtitle: "Personal portraits & artwork",
    description:
      "Get a unique hand-drawn portrait or custom artwork. Perfect for gifts, keepsakes, or personal collections. Available in various styles and sizes.",
    features: [
      "Quick sketch portraits (5-10 min)",
      "Detailed portraits (30+ min)",
      "Pet portraits",
      "Custom illustrations",
      "Digital or physical delivery",
    ],
    image: "/sketch/sketchbook.png",
    sketchIcon: "/sketch/face.png",
  },
];

export default function Services() {
  const [activeService, setActiveService] = useState<ServiceType>("art-tech");
  const [flippedCards, setFlippedCards] = useState<Set<ServiceType>>(new Set());

  const currentService =
    SERVICES.find((s) => s.id === activeService) || SERVICES[0];

  const toggleFlip = (serviceId: ServiceType) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  // Ensure no flipped state on desktop; clear flips when viewport > 900px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setFlippedCards(new Set());
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section id="services" className="services-section">
      <div className="header">
        <h2>What I Offer</h2>
        <div className="underline-sketch">
          <svg viewBox="0 0 200 10" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 5 5 Q 50 2, 100 5 T 195 5"
              stroke="#2c2c2c"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Service cards arranged like sticky notes - flip cards on mobile */}
      <div className="services-grid">
        {SERVICES.map((service, index) => {
          const isFlipped = flippedCards.has(service.id);
          return (
            <div
              key={service.id}
              className="flip-card-container"
              style={{
                transform: `rotate(${index % 2 === 0 ? -2 : 2}deg)`,
              }}
            >
              <div
                className={`flip-card ${isFlipped ? "flipped" : ""} ${
                  activeService === service.id ? "active" : ""
                }`}
              >
                {/* Front of card */}
                <div
                  className="card-face card-front"
                  onClick={() => {
                    // On mobile, flip the card
                    if (window.innerWidth <= 900) {
                      toggleFlip(service.id);
                    }
                    // Always set active service for detail panel
                    setActiveService(service.id);
                  }}
                >
                  <div className="card-icon">
                    <img src={service.sketchIcon} alt="" />
                  </div>
                  <h3>{service.title}</h3>
                  <p className="subtitle">{service.subtitle}</p>
                  <div className="card-hint">
                    <span className="tap-hint">tap to flip →</span>
                  </div>
                </div>

                {/* Back of card */}
                <div className="card-face card-back">
                  <button
                    className="flip-back-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFlip(service.id);
                    }}
                  >
                    ← flip back
                  </button>
                  <div className="back-content">
                    <h4>{service.title}</h4>
                    <p className="back-description">{service.description}</p>
                    <div className="back-features">
                      {service.features.map((feature, i) => (
                        <div key={i} className="back-feature-item">
                          <span className="back-checkmark">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <a href="#contact" className="back-cta">
                      Let&apos;s talk! →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed view - looks like a sketchbook page */}
      <div className="detail-panel">
        <div className="panel-inner">
          {/* Sketch doodle border */}
          <div className="sketch-border"></div>

          <div className="detail-content">
            <div className="detail-image">
              <img src={currentService.image} alt={currentService.title} />
              <div className="image-caption">
                <svg
                  viewBox="0 0 100 20"
                  xmlns="http://www.w3.org/2000/svg"
                  className="arrow-doodle"
                >
                  <path
                    d="M 5 10 L 85 10 M 75 5 L 85 10 L 75 15"
                    stroke="#666"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>That&apos;s me!</span>
              </div>
            </div>

            <div className="detail-text">
              <h3>{currentService.title}</h3>
              <p className="description">{currentService.description}</p>

              <div className="features-list">
                <h4>What&apos;s Included:</h4>
                {currentService.features.map((feature, i) => (
                  <div key={i} className="feature-item">
                    <span className="checkmark">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <a href="#contact" className="cta-button">
                <span>Let&apos;s work together!</span>
                <svg
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  className="button-arrow"
                >
                  <path
                    d="M 5 10 L 15 10 M 12 7 L 15 10 L 12 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @font-face {
          font-family: "Brushed";
          src: url("/BRUSHED.TTF") format("truetype");
          font-weight: normal;
          font-style: normal;
        }

        .services-section {
          padding: clamp(3rem, 10vh, 8rem) 5vw;
          background: linear-gradient(
            to bottom,
            #fefefe 0%,
            #f8f8f8 50%,
            #fefefe 100%
          );
          font-family: "Courier New", monospace;
          position: relative;
          overflow: hidden;
        }

        /* Subtle paper texture */
        .services-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.01) 2px,
              rgba(0, 0, 0, 0.01) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.01) 2px,
              rgba(0, 0, 0, 0.01) 4px
            );
          pointer-events: none;
          opacity: 0.3;
        }

        .header {
          text-align: center;
          margin-bottom: clamp(3rem, 8vh, 6rem);
          position: relative;
        }

        .header h2 {
          font-family: "Brushed", "Georgia", serif;
          font-size: clamp(2.5rem, 6vw, 4rem);
          color: #2c2c2c;
          margin: 0;
          transform: rotate(-1deg);
          display: inline-block;
        }

        .underline-sketch {
          width: clamp(150px, 30vw, 300px);
          margin: 0.5rem auto 0;
          opacity: 0.6;
        }

        /* Service cards grid */
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: clamp(2rem, 4vw, 3rem);
          max-width: 1200px;
          margin: 0 auto 4rem;
          padding: 0 1rem;
        }

        /* Flip card container */
        .flip-card-container {
          perspective: 1000px;
          -webkit-perspective: 1000px;
          min-height: 320px;
          transition: transform 0.3s ease;
        }

        .flip-card-container:hover {
          transform: scale(1.02) rotate(0deg) !important;
        }

        .flip-card {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 320px;
          transition: transform 0.6s;
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
        }

        .flip-card.flipped {
          transform: rotateY(180deg);
          -webkit-transform: rotateY(180deg);
        }

        /* Card faces */
        .card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden; /* Safari/iOS */
          border: 2px solid #1f1f1f;
          border-radius: 4px;
          background: linear-gradient(135deg, #fef9e6 0%, #fff5d6 100%);
          box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }

        .card-front {
          transform: rotateY(0deg);
          -webkit-transform: rotateY(0deg);
          padding: 2rem 1.5rem;
        }

        .card-front::before {
          content: "";
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 8px;
          background: rgba(255, 200, 100, 0.5);
          border-radius: 2px;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .card-back {
          transform: rotateY(180deg);
          -webkit-transform: rotateY(180deg);
          background: linear-gradient(135deg, #fff4cc 0%, #ffe9a3 100%);
          padding: 1.5rem;
          overflow-y: auto;
        }

        .flip-card.active .card-front {
          background: linear-gradient(135deg, #fff4cc 0%, #ffe9a3 100%);
          border-width: 3px;
        }

        .card-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1rem;
          opacity: 0.8;
        }

        .card-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.1));
        }

        .card-front h3 {
          font-family: "Brushed", "Georgia", serif;
          font-size: 1.5rem;
          margin: 0 0 0.5rem 0;
          color: #1f1f1f;
          text-align: center;
          line-height: 1.2;
        }

        .subtitle {
          font-family: "Comic Sans MS", cursive;
          font-size: 0.9rem;
          color: #666;
          text-align: center;
          margin: 0 0 1rem 0;
          font-style: italic;
        }

        .card-hint {
          text-align: center;
          min-height: 1.2rem;
        }

        .tap-hint {
          font-size: 0.75rem;
          color: #999;
          font-family: "Comic Sans MS", cursive;
        }

        /* Back of card styles */
        .flip-back-btn {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          background: rgba(255, 255, 255, 0.9);
          border: 2px solid #1f1f1f;
          border-radius: 20px;
          padding: 0.25rem 0.75rem;
          font-family: "Comic Sans MS", cursive;
          font-size: 0.75rem;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s ease;
        }

        .flip-back-btn:hover {
          background: #fff;
          transform: translateX(-2px);
        }

        .back-content {
          padding-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .back-content h4 {
          font-family: "Brushed", "Georgia", serif;
          font-size: 1.3rem;
          margin: 0;
          color: #1f1f1f;
          text-align: center;
          line-height: 1.2;
        }

        .back-description {
          font-size: 0.85rem;
          line-height: 1.4;
          color: #555;
          margin: 0;
        }

        .back-features {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .back-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.8rem;
          line-height: 1.3;
        }

        .back-checkmark {
          color: #16a34a;
          font-size: 1rem;
          font-weight: bold;
          flex-shrink: 0;
        }

        .back-cta {
          display: inline-block;
          text-align: center;
          background: #1f1f1f;
          color: #fff;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          font-family: "Comic Sans MS", cursive;
          font-size: 0.9rem;
          font-weight: bold;
          text-decoration: none;
          margin-top: 0.5rem;
          transition: all 0.3s ease;
          box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.2);
        }

        .back-cta:hover {
          transform: translateY(-2px);
          box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.3);
        }

        /* Detail panel */
        .detail-panel {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .panel-inner {
          background: #fff;
          border: 3px solid #1f1f1f;
          border-radius: 8px;
          padding: clamp(2rem, 5vw, 4rem);
          position: relative;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        /* Hand-drawn border effect */
        .sketch-border {
          position: absolute;
          inset: 10px;
          border: 2px dashed rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          pointer-events: none;
        }

        .detail-content {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: clamp(2rem, 5vw, 4rem);
          position: relative;
          z-index: 1;
        }

        .detail-image {
          position: relative;
          text-align: center;
        }

        .detail-image img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          filter: drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.1));
        }

        .image-caption {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
          font-family: "Comic Sans MS", cursive;
          font-size: 0.9rem;
          color: #666;
        }

        .arrow-doodle {
          width: 60px;
          height: 20px;
        }

        .detail-text h3 {
          font-family: "Brushed", "Georgia", serif;
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          color: #1f1f1f;
          margin: 0 0 1rem 0;
          transform: rotate(-0.5deg);
        }

        .description {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #555;
          margin-bottom: 2rem;
        }

        .features-list {
          margin-bottom: 2rem;
        }

        .features-list h4 {
          font-family: "Comic Sans MS", cursive;
          font-size: 1.1rem;
          margin: 0 0 1rem 0;
          color: #333;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          padding-left: 0.5rem;
        }

        .checkmark {
          color: #16a34a;
          font-size: 1.2rem;
          font-weight: bold;
          flex-shrink: 0;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: #1f1f1f;
          color: #fff;
          padding: 1rem 2rem;
          border: 3px solid #1f1f1f;
          border-radius: 50px;
          font-family: "Comic Sans MS", cursive;
          font-size: 1.1rem;
          font-weight: bold;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.2);
        }

        .cta-button:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.3);
        }

        .cta-button:active {
          transform: translate(0, 0);
          box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.2);
        }

        .button-arrow {
          width: 20px;
          height: 20px;
        }

        /* Responsive */
        @media (max-width: 900px) {
          /* Hide detail panel on mobile, rely on flip cards */
          .detail-panel {
            display: none;
          }

          .services-grid {
            margin-bottom: 2rem;
          }

          /* Allow cards to grow/shrink to content height on mobile */
          .flip-card-container {
            min-height: unset;
            height: auto;
          }

          .flip-card {
            min-height: unset;
            height: auto;
            transform: none !important; /* disable 3D flip on mobile */
          }

          .card-face {
            position: static; /* participate in normal flow */
            backface-visibility: visible; /* not needed when not 3D */
          }

          /* Reset rotations on mobile so text isn't mirrored */
          .card-front,
          .card-back {
            transform: none !important;
            -webkit-transform: none !important;
          }

          .card-back {
            display: none; /* hidden until flipped */
          }

          .flip-card.flipped .card-front {
            display: none;
          }

          .flip-card.flipped .card-back {
            display: block;
          }
        }

        @media (max-width: 600px) {
          .services-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .flip-card-container {
            transform: rotate(0deg) !important;
            min-height: unset;
            height: auto;
          }

          .flip-card {
            min-height: unset;
            height: auto;
          }

          .flip-card-container:hover {
            transform: scale(1.01) rotate(0deg) !important;
          }
        }

        @media (min-width: 901px) {
          /* On desktop, show detail panel */
          .detail-panel {
            display: block;
          }

          /* On desktop, disable flip on card click, just select */
          .flip-card {
            pointer-events: none;
          }

          .card-front {
            pointer-events: auto;
            cursor: pointer;
          }

          .flip-card-container:hover .card-front {
            transform: translateY(-4px);
          }

          /* Hide flip hints on desktop */
          .tap-hint,
          .flip-back-btn {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
