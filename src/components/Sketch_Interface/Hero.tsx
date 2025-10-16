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

      {/* CTA group: world + mural share same left gutter and scale together */}
      <div className="cta-container">
        {/* background blob top-left - now clickable */}
        <div className="world-container">
          <img
            className="bg world-button"
            src="/sketch/world_colored.png"
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
          <div
            className="tooltip"
            role="button"
            tabIndex={0}
            onClick={handleWorldClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleWorldClick();
              }
            }}
          >
            <span>enter my world</span>
          </div>
        </div>

        {/* mural button - clickable */}
        <div className="mural-container">
          <img
            className="mural-button"
            src="/sketch/mural_colored.png"
            alt="Mural"
            onClick={() => router.push("/sembawang-mural")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push("/sembawang-mural");
              }
            }}
          />
          {/* Tooltip for mural button */}
          <div
            className="mural-tooltip"
            role="button"
            tabIndex={0}
            onClick={() => router.push("/sembawang-mural")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                router.push("/sembawang-mural");
              }
            }}
          >
            <span>view my murals</span>
          </div>
        </div>
      </div>

      {/* portrait right */}
      <img
        className="portrait"
        src="/sketch/face_white.svg"
        alt="Sketch portrait"
      />

      {/* hand-drawn note + arrow bottom-right */}
      <div className="note">
        <span>Scroll ↓</span>
      </div>

      <style jsx>{`
        .hero {
          background: linear-gradient(
            to bottom,
            hsl(45, 100%, 62.7%) 0%,
            #f8f8f8 80%,
            #fefefe 100%
          );
          margin-top: 7vh;
          position: relative;
          min-height: 70vh;
          height: calc(100vh - 7vh); /* Fixed height that accounts for margin */
          padding: 10vh 5vw;
          overflow: hidden;
        }
        .content {
          position: absolute;
          bottom: 0px;
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
          animation: titleFloat 6s ease-in-out infinite;
          transition: all 0.3s ease;
        }

        .title-image:hover {
          transform: rotate(-1deg) scale(1.02);
          filter: drop-shadow(4px 4px 0px rgba(0, 0, 0, 0.15))
            drop-shadow(8px 8px 0px rgba(0, 0, 0, 0.08));
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

        /* Shared container to align world + mural and scale together */
        .cta-container {
          position: absolute;
          top: 10%;
          left: 10%;
          width: calc(100% - min(40vw, 520px));
          max-width: 900px;
          max-height: calc(
            100vh - 7vh - 25vh
          ); /* More restrictive height to prevent overflow */
          overflow: hidden; /* Hide any overflow */
          display: flex;
          flex-direction: column;
        }

        .world-container {
          position: relative;
          left: 0;
          align-self: flex-start;
          width: 100%;
          max-height: 60%; /* Limit world container height */
          overflow: hidden;
        }

        .mural-container {
          position: relative;
          margin-top: clamp(12px, 4vw, 32px);
          width: 300px;
          max-width: 540px;
          left: 0;
          height: auto;
          max-height: 30%; /* Limit mural container height */
          z-index: 10;
          align-self: flex-start;
          overflow: hidden;
        }

        .bg {
          position: relative;
          width: 100%;
          height: auto;
          object-fit: contain;
          opacity: 0.6;
          pointer-events: none;
        }

        .world-button {
          pointer-events: auto !important;
          cursor: pointer;
          transition: all 0.3s ease;
          animation: worldPulse 4s ease-in-out infinite;
        }

        .world-button:hover {
          opacity: 0.8 !important;
          transform: scale(1.05);
          filter: brightness(1.1) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
          animation-play-state: paused;
        }

        .world-button:active {
          transform: scale(0.95);
        }

        .mural-button {
          width: 100%;
          height: auto;
          cursor: pointer;
          transition: all 0.3s ease;
          opacity: 0.8;
          animation: muralBounce 3s ease-in-out infinite;
        }

        .mural-button:hover {
          opacity: 1;
          transform: scale(1.08);
          filter: brightness(1.15) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.25));
          animation-play-state: paused;
        }

        .mural-button:active {
          transform: scale(0.95);
        }

        .tooltip {
          position: absolute;
          top: calc(100% - 150px);
          left: 15%;
          background: rgba(255, 255, 255, 0.7);
          border: 2px solid #333;
          border-radius: 50px;
          padding: 12px 20px;
          font-family: "Comic Sans MS", "Bradley Hand", cursive;
          font-size: 16px;
          font-weight: bold;
          color: #333;
          white-space: nowrap;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          animation: subtleFloat 3s ease-in-out infinite;
          pointer-events: auto;
          cursor: pointer;
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
          top: calc(100% - 8vh);
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.7);
          border: 2px solid #333;
          border-radius: 50px;
          padding: 10px 16px;
          font-family: "Comic Sans MS", "Bradley Hand", cursive;
          font-size: 14px;
          font-weight: bold;
          color: #333;
          white-space: nowrap;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          animation: subtleFloat 3s ease-in-out infinite;
          pointer-events: auto;
          cursor: pointer;
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

        @keyframes titleFloat {
          0%,
          100% {
            transform: rotate(-1deg) translateY(0px);
          }
          50% {
            transform: rotate(-1deg) translateY(-8px);
          }
        }

        @keyframes worldPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.02);
            opacity: 0.7;
          }
        }

        @keyframes muralBounce {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        @keyframes portraitSway {
          0%,
          100% {
            transform: rotate(0deg) translateY(0px);
          }
          25% {
            transform: rotate(0.5deg) translateY(-2px);
          }
          75% {
            transform: rotate(-0.5deg) translateY(2px);
          }
        }

        @keyframes noteWiggle {
          0%,
          100% {
            transform: rotate(-5deg);
          }
          25% {
            transform: rotate(-3deg);
          }
          75% {
            transform: rotate(-7deg);
          }
        }

        .portrait {
          position: absolute;
          right: 3vw;
          bottom: 0;
          width: min(40vw, 520px);
          height: auto;
          object-fit: contain;
          animation: portraitSway 8s ease-in-out infinite;
          transition: all 0.3s ease;
        }

        .portrait:hover {
          transform: scale(1.02) rotate(1deg);
          filter: brightness(1.05);
        }
        .note {
          position: absolute;
          right: 2vw;
          bottom: 2vh;
          display: grid;
          place-items: center;
          gap: 4px;
          transform: rotate(-5deg);
          animation: noteWiggle 2s ease-in-out infinite;
          transition: all 0.3s ease;
        }

        .note:hover {
          transform: rotate(-3deg) scale(1.1);
          animation-play-state: paused;
        }
        .note span {
          font-family: "Comic Sans MS", "Bradley Hand", system-ui;
          font-weight: 700;
        }
        .note img {
          width: 90px;
          height: auto;
        }

        @media (max-width: 1300px) {
          .cta-container {
            left: 2%;
            max-height: calc(
              100vh - 7vh - 30vh
            ); /* Slightly more space on medium screens */
          }
        }
        @media (max-width: 900px) {
          .content {
            position: absolute;
            left: 4%;
            width: 50%;
            text-align: center;
            max-width: 90vw;
          }
          .portrait {
            width: 70vw;
            max-width: 400px;
            margin: 24px 0 0;
            right: 0;
          }
          .cta-container {
            width: 100%;
            top: 5%;
            max-height: calc(100vh - 7vh - 15vh); /* More space on mobile */
          }
          .world-container {
            width: 100%;
            max-width: 500px;
          }
          .bg {
            width: 100%;
            height: auto;
          }
          .mural-container {
            position: relative;
            margin-top: clamp(8px, 5vw, 24px);
            left: 0;
            width: 50%;
            max-width: 200px;
          }
          .hero {
            padding-bottom: 4rem;
            margin-top: 6vh;
          }
        }
        @media (max-width: 600px) {
          .world-container {
            width: 100%;
          }
          .mural-container {
            position: relative;
            margin-top: clamp(6px, 6vw, 18px);
            left: 0;
            max-width: 200px;
          }
        }
      `}</style>
    </section>
  );
}
