"use client";

import ImageCarousel from "./ImageCarousel";

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

export default function Sketchbook() {
  return (
    <section id="services" className="wrap">
      <header className="header">
        <h2>My Sketch Services</h2>
        <span className="caption">open for job</span>
      </header>

      <div className="book">
        <img className="frame" src="/sketch/sketchbook.png" alt="Open book" />

        {/* page */}
        <div className="page">
          <ImageCarousel
            items={PAGES.map((page, index) => ({
              id: index,
              image: page,
              alt: `Quick sketch ${index + 1}`,
            }))}
            title="Quick Sketch Services"
            description="Capturing moments in 5-15 minutes. From street portraits to event sketching, each quick sketch tells a unique story."
            features={[
              "Street portraits",
              "Event sketching",
              "Spontaneous moments",
            ]}
          />
        </div>
        {/* <button className="nav left" onClick={prev} aria-label="Previous page">
          ‹
        </button>
        <button className="nav right" onClick={next} aria-label="Next page">
          ›
        </button> */}
      </div>

      <style jsx>{`
        .wrap {
          padding: 60px 5vw;
        }
        .header {
          display: grid;
          place-items: center;
          gap: 6px;
          margin-bottom: 18px;
        }
        .icon {
          width: 48px;
          height: auto;
          opacity: 0.8;
        }
        h2 {
          font-size: clamp(28px, 4.2vw, 48px);
          margin: 0;
          transform: rotate(-1.5deg);
        }
        .caption {
          font-weight: 700;
          color: #2a6;
        }
        .book {
          position: relative;
          width: min(900px, 92vw);
          margin: 0 auto;
          aspect-ratio: 16/10;
        }
        .frame {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
          margin: auto;
        }
        .page {
          position: absolute;
          top: 8%;
          bottom: 32%;
          left: 16%;
          right: 24%;
          overflow: hidden;
          perspective: 800px;
          background-color: #fff;
          border-radius: 8px;
          transform: rotate(-0.8deg);
        }
        .page :global(.carousel-container) {
          grid-template-columns: 1fr;
          gap: 1rem;
          padding: 1rem;
          min-height: auto;
        }

        .page :global(.image-section) {
          order: 1;
        }

        .page :global(.text-section) {
          order: 2;
          padding: 0.5rem;
        }

        .page :global(.carousel-title) {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .page :global(.carousel-description) {
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .page :global(.features-list) {
          gap: 0.5rem;
        }

        .page :global(.feature-item) {
          font-size: 0.8rem;
        }

        @media (max-width: 768px) {
          .wrap {
            padding: 60px 5vw;
            min-height: calc(100vh - 1rem);
          }
          .book {
            aspect-ratio: 3/4;
            max-width: 1000px;
            min-height: calc(100vh - 25rem);
          }

          .frame {
            transform: rotate(90deg);
            position: relative;

            min-width: calc(100vw + 23rem);
            height: auto;
            left: 50%;
            top: 50%;
            transform: translate(-55%, -40%) rotate(90deg);
          }

          .page {
            top: 16%;
            bottom: 15%;
            left: 25%;
            right: 16%;
            transform: rotate(0deg);
          min-height: calc(100vh - 35rem);
          }

          .page :global(.carousel-container) {
            flex-direction: column;
            gap: 1rem;
            padding: 0.5rem;
            align-items: center;
          }

          .page :global(.image-section) {
            order: 1;
            width: 100%;
            display: flex;
            justify-content: center;
          }

          .page :global(.text-section) {
            order: 2;
            padding: 0.5rem;
            text-align: center;
            width: 100%;
          }

          .page :global(.carousel-title) {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
          }

          .page :global(.carousel-description) {
            font-size: 0.8rem;
            margin-bottom: 0.5rem;
          }

          .page :global(.features-list) {
            gap: 0.3rem;
          }

          .page :global(.feature-item) {
            font-size: 0.7rem;
          }

          .page :global(.image-wrapper) {
            max-width: 100%;
            aspect-ratio: 1/1;
          }
        }
        .nav {
          position: absolute;
          top: 50%;
          translate: 0 -50%;
          background: #fff;
          border: 2px solid #111;
          width: 44px;
          height: 44px;
          border-radius: 999px;
          font-size: 24px;
          line-height: 0;
        }
        .left {
          left: -10px;
        }
        .right {
          right: -10px;
        }
        @keyframes flip {
          from {
            transform: rotateY(-20deg) rotate(-3deg);
            opacity: 0.2;
          }
          to {
            transform: rotateY(0) rotate(-0.8deg);
            opacity: 1;
          }
        }
        @media (max-width: 555px) {
          .page {
          top: 24%;
          bottom: 5%;
          left: 16%;
          right: 5%;
          min-height: calc(100vh - 24rem);
          border-radius: 50;
        }
        .frame {
          position: relative;

          min-width: calc(100vw + 30rem);
          height: auto;
          left: 50%;
          top: 50%;
          transform: translate(-55%, -20%) rotate(90deg);
        }
      `}</style>
    </section>
  );
}
