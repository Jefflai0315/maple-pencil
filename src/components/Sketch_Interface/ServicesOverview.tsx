"use client";
import { useRouter } from "next/navigation";

type ServiceType = "art-tech" | "live-events" | "commissions";

interface Service {
  id: ServiceType;
  title: string;
  subtitle: string;
  shortDescription: string;
  sketchIcon: string;
  route: string;
}

const SERVICES: Service[] = [
  {
    id: "art-tech",
    title: "Art & Tech Experiences",
    subtitle: "Interactive digital art",
    shortDescription:
      "Interactive installations, AI Art experiences, and Creative art solutions.",
    sketchIcon: "/NPC/Camera.png",
    route: "/services/art-tech",
  },
  {
    id: "live-events",
    title: "Live Event Sketch Booth",
    subtitle: "Capture moments in real-time",
    shortDescription:
      "Transform your events with live sketch booths and engaging workshops.",
    sketchIcon: "/NPC/Sketch_booth.png",
    route: "/services/live-events",
  },
  {
    id: "commissions",
    title: "Commission Sketches",
    subtitle: "Personal portraits & artwork",
    shortDescription:
      "Unique hand-drawn portraits and custom artwork for any occasion.",
    sketchIcon: "/sketch/face.png",
    route: "/services/commissions",
  },
];

export default function ServicesOverview() {
  const router = useRouter();

  return (
    <section id="services" className="services-overview">
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

      <div className="services-grid">
        {SERVICES.map((service, index) => (
          <div
            key={service.id}
            className="service-card"
            onClick={() => router.push(service.route)}
            style={{
              transform: `rotate(${index % 2 === 0 ? -2 : 2}deg)`,
            }}
          >
            {/* Paper tape effect */}
            <div className="tape"></div>

            <div className="card-icon">
              <img src={service.sketchIcon} alt="" />
            </div>

            <h3>{service.title}</h3>
            <p className="card-subtitle">{service.subtitle}</p>
            <p className="description">{service.shortDescription}</p>

            <div className="card-cta">
              <span>Learn more →</span>
            </div>

            {/* Hand-drawn sketch border SVG */}
            <svg
              className="sketch-border"
              viewBox="0 0 300 400"
              preserveAspectRatio="none"
            >
              <path
                d="M 5 5 Q 8 3, 15 5 T 30 5 T 60 5 T 90 5 T 120 5 T 150 5 T 180 5 T 210 5 T 240 5 T 270 5 T 295 5 
                   L 295 10 Q 297 15, 295 25 T 295 50 T 295 80 T 295 110 T 295 140 T 295 170 T 295 200 T 295 230 T 295 260 T 295 290 T 295 320 T 295 350 T 295 380 T 295 395
                   L 290 395 Q 285 397, 270 395 T 240 395 T 210 395 T 180 395 T 150 395 T 120 395 T 90 395 T 60 395 T 30 395 T 5 395
                   L 5 390 Q 3 385, 5 370 T 5 340 T 5 310 T 5 280 T 5 250 T 5 220 T 5 190 T 5 160 T 5 130 T 5 100 T 5 70 T 5 40 T 5 10 T 5 5 Z"
                fill="none"
                stroke="#1f1f1f"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />
            </svg>
          </div>
        ))}
      </div>

      <style jsx>{`
        @font-face {
          font-family: "Brushed";
          src: url("/BRUSHED.TTF") format("truetype");
          font-weight: normal;
          font-style: normal;
        }

        .services-overview {
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
          scroll-margin-top: 90px; /* prevent sticky navbar overlap on scroll */
        }

        /* Subtle paper texture */
        .services-overview::before {
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

        .subtitle {
          font-family: "Comic Sans MS", cursive;
          color: #666;
          margin-top: 1rem;
          font-size: 1rem;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: clamp(2rem, 4vw, 3rem);
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .service-card {
          background: linear-gradient(135deg, #fef9e6 0%, #fff5d6 100%);
          border: none;
          border-radius: 4px;
          padding: 2.5rem 2rem 2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1);
          min-height: 360px;
          display: flex;
          flex-direction: column;
        }

        /* Hand-drawn sketch border SVG */
        .sketch-border {
          position: absolute;
          inset: -2px;
          width: calc(100% + 4px);
          height: calc(100% + 4px);
          pointer-events: none;
          z-index: 1;
        }

        /* Paper tape effect */
        .tape {
          position: absolute;
          top: 15px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 10px;
          background: rgba(255, 200, 100, 0.5);
          border-radius: 2px;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .service-card:hover {
          transform: scale(1.05) rotate(0deg) !important;
          box-shadow: 8px 8px 0px rgba(0, 0, 0, 0.2);
        }

        .service-card:active {
          transform: scale(1.02) rotate(0deg) !important;
          box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.15);
        }

        .card-icon {
          width: 100px;
          height: 100px;
          margin: 0 auto 1.5rem;
          opacity: 0.85;
        }

        .card-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.1));
        }

        h3 {
          font-family: "Brushed", "Georgia", serif;
          font-size: 1.6rem;
          margin: 0 0 0.5rem 0;
          color: #1f1f1f;
          text-align: center;
          line-height: 1.2;
        }

        .card-subtitle {
          font-family: "Comic Sans MS", cursive;
          font-size: 0.95rem;
          color: #666;
          text-align: center;
          margin: 0 0 1rem 0;
          font-style: italic;
        }

        .description {
          font-size: 0.95rem;
          line-height: 1.5;
          color: #555;
          text-align: center;
          margin: 0 0 auto 0;
          flex-grow: 1;
        }

        .card-cta {
          text-align: center;
          padding-top: 1rem;
          margin-top: auto;
        }

        .card-cta span {
          font-family: "Comic Sans MS", cursive;
          font-size: 0.9rem;
          font-weight: bold;
          color: #1f1f1f;
          border-bottom: 2px solid #1f1f1f;
          padding-bottom: 2px;
        }

        @media (max-width: 768px) {
          .services-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .service-card {
            transform: rotate(0deg) !important;
            min-height: 320px;
          }

          .service-card:hover {
            transform: scale(1.02) rotate(0deg) !important;
          }
        }
      `}</style>
    </section>
  );
}
