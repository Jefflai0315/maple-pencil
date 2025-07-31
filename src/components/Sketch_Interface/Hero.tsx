"use client";

export default function Hero() {
  return (
    <section className="hero">
      <div className="content">
        <h1 className="title">Hand-Drawn Stories</h1>
        <p className="subtitle">
          Faces, hands, and little moments—sketched with heart.
        </p>
      </div>

      {/* background blob top-left */}
      <img className="bg" src="/sketch/world.png" alt="" aria-hidden />

      {/* portrait right */}
      <img className="portrait" src="/sketch/face.png" alt="Sketch portrait" />

      {/* hand-drawn note + arrow bottom-right */}
      <div className="note">
        <span>Scroll ↓</span>
        <img src="/arrow.svg" alt="" />
      </div>

      <style jsx>{`
        .hero {
          position: relative;
          min-height: 70vh;
          padding: 10vh 5vw;
          overflow: hidden;
        }
        .content {
          position: absolute;
          bottom: 5vh;
          left: 5vw;
          max-width: 620px;
          z-index: 10;
        }
        .title-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
        }
        .title {
          font-size: clamp(36px, 6vw, 72px);
          line-height: 1;
          margin: 0 0 10px;
          bottom: 10%;
          font-family: "Caveat", "Comic Sans MS", "Bradley Hand", cursive;
          font-weight: 700;
          color: #1f1f1f;
          text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.1),
            4px 4px 0px rgba(0, 0, 0, 0.05);
          transform: rotate(-1deg);
          letter-spacing: -0.02em;
          position: relative;
          display: inline-block;
        }
        .title::before {
          content: "";
          position: absolute;
          top: -8px;
          left: -15px;
          right: -15px;
          bottom: -8px;
          background: rgba(255, 255, 255, 0.9);
          border: 3px solid #1f1f1f;
          border-radius: 12px;
          transform: rotate(2deg);
          z-index: -1;
          box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1);
        }
        .subtitle {
          font-size: 18px;
          opacity: 0.8;
          font-family: "Caveat", "Comic Sans MS", "Bradley Hand", cursive;
          font-weight: 600;
          transform: rotate(0.5deg);
          color: #333;
        }
        .bg {
          position: absolute;
          top: 15%;
          left: 0;
          width: calc(100% - min(40vw, 520px));
          height: auto;
          object-fit: contain;
          opacity: 0.6;
          pointer-events: none;
        }
        .portrait {
          position: absolute;
          right: 3vw;
          bottom: 0;
          width: min(40vw, 520px);
          height: auto;
          object-fit: contain;
        }
        .note {
          position: absolute;
          right: 2vw;
          bottom: 2vh;
          display: grid;
          place-items: center;
          gap: 4px;
          transform: rotate(-5deg);
        }
        .note span {
          font-family: "Comic Sans MS", "Bradley Hand", system-ui;
          font-weight: 700;
        }
        .note img {
          width: 90px;
          height: auto;
        }
        @media (max-width: 900px) {
          .content {
            position: absolute;
            top: 5vh;
            left: 50%;
            transform: translateX(-50%);
            bottom: auto;
            text-align: center;
            max-width: 90vw;
          }
          .portrait {
            width: 70vw;
            margin: 24px 0 0;
            right: 0;
          }
          .bg {
            width: 100%;
            height: auto;
            top: 0;
            left: 0;
          }
          .hero {
            padding-bottom: 4rem;
          }
        }
      `}</style>
    </section>
  );
}
