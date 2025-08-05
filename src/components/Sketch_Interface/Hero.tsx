"use client";

import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  const handleWorldClick = () => {
    router.push("/world");
  };

  return (
    <section className="hero">
      <div className="content">
        <img
          className="title-image"
          src="/sketch/jeff_e_roaming_artist.png"
          alt="Jeff E Roaming Artist"
        />
      </div>

      {/* background blob top-left - now clickable */}
      <div className="world-container">
        <img
          className="bg world-button"
          src="/sketch/world.png"
          alt="World"
          onClick={handleWorldClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleWorldClick();
            }
          }}
        />
        {/* Tooltip positioned relative to the world image */}
        <div className="tooltip">
          <span>enter my world</span>
        </div>
      </div>

      {/* mural button - clickable */}
      <div className="mural-container">
        <img
          className="mural-button"
          src="/sketch/mural.png"
          alt="Mural"
          onClick={() => router.push("/mural")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push("/mural");
            }
          }}
        />
        {/* Tooltip for mural button */}
        <div className="mural-tooltip">
          <span>view my murals</span>
        </div>
      </div>

      {/* portrait right */}
      <img className="portrait" src="/sketch/face.png" alt="Sketch portrait" />

      {/* hand-drawn note + arrow bottom-right */}
      <div className="note">
        <span>Scroll ↓</span>
        <img src="/arrow.svg" alt="" />
      </div>

      <style jsx>{`
        .hero {
          margin-top: 8vh;
          position: relative;
          min-height: 70vh;
          padding: 10vh 5vw;
          overflow: hidden;
        }
        .content {
          position: absolute;
          bottom: 5vh;
          right: 30%;
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
        .title-image {
          max-width: 100%;
          height: auto;
          transform: rotate(-1deg);
          position: relative;
          display: inline-block;
          filter: drop-shadow(2px 2px 0px rgba(0, 0, 0, 0.1))
            drop-shadow(4px 4px 0px rgba(0, 0, 0, 0.05));
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

        .world-container {
          position: absolute;
          top: 15%;
          left: 0;
          width: calc(100% - min(40vw, 520px));
          height: auto;
        }

        .mural-container {
          position: absolute;
          bottom: 7%;
          width: 300px;
          left: 5%;
          height: auto;
          z-index: 10;
        }

        .bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          max-height: 400px;
          align-self: left;
          object-fit: contain;
          opacity: 0.6;
          pointer-events: none;
        }

        .world-button {
          pointer-events: auto !important;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .world-button:hover {
          opacity: 0.8 !important;
          transform: scale(1.02);
          filter: brightness(1.1) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
        }

        .world-button:active {
          transform: scale(0.98);
        }

        .mural-button {
          width: 100%;
          height: auto;
          cursor: pointer;
          transition: all 0.3s ease;
          opacity: 0.8;
        }

        .mural-button:hover {
          opacity: 1;
          transform: scale(1.05);
          filter: brightness(1.1) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
        }

        .mural-button:active {
          transform: scale(0.98);
        }

        .tooltip {
          position: absolute;
          bottom: -80px;
          left: 15%;
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid #333;
          border-radius: 50px;
          padding: 12px 20px;
          font-family: "Comic Sans MS", "Bradley Hand", cursive;
          font-size: 16px;
          font-weight: bold;
          color: #333;
          white-space: nowrap;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          animation: subtleFloat 3s ease-in-out infinite;
          pointer-events: none;
        }

        .tooltip::before {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 20%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          transform: rotate(180deg);
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-bottom: 8px solid #333;
        }

        .mural-tooltip {
          position: absolute;
          bottom: -50px;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid #333;
          border-radius: 50px;
          padding: 10px 16px;
          font-family: "Comic Sans MS", "Bradley Hand", cursive;
          font-size: 14px;
          font-weight: bold;
          color: #333;
          white-space: nowrap;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          animation: subtleFloat 3s ease-in-out infinite;
          pointer-events: none;
        }

        .mural-tooltip::before {
          content: "";
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-bottom: 8px solid #333;
        }

        @keyframes subtleFloat {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
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
            left: 10%;
            width: 50%;
            text-align: center;
            max-width: 90vw;
          }
          .portrait {
            width: 70vw;
            margin: 24px 0 0;
            right: 0;
          }
          .world-container {
            width: 100%;
            top: 0;
            left: 0;
          }
          .bg {
            width: 100%;
            height: auto;
            top: 0;
            left: 0;
          }
          .mural-container {
            position: relative;
            bottom: -7rem;
            left: -10;
            width: 150px;
          }
          .hero {
            padding-bottom: 4rem;
          }
        }
      `}</style>
    </section>
  );
}
