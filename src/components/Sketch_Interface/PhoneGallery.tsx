"use client";
import { useRef } from "react";
import ScrollFloat from "../ScrollFloat";

const FEED = [
  {
    image: "/gallery/quick/Com_8.jpg",
    title: "Father's Day Celebration",
    description:
      "A heartfelt sketch of tender moment between a father and his newborn",
  },
  {
    image: "/gallery/wood/3.jpg",
    title: "Coffee Shop Regular",
    description: "A daily customer who became a friend through art",
  },
  {
    image: "/gallery/quick/Com_5.jpg",
    title: "Street Musician",
    description: "Capturing the soul of Singapore's street performers",
  },
  {
    image: "/gallery/big/1.jpg",
    title: "Wedding Day Joy",
    description: "Live sketching at a beautiful Singapore wedding",
  },
  {
    image: "/gallery/big/2.jpg",
    title: "National's spirit",
    description: "A detailed portrait of Singapore best - celebrating family",
  },
  {
    image: "/gallery/wood/1.jpg",
    title: "Hawker Center Stories",
    description: "Wood sketch series featuring local food heroes",
  },
];

export default function PhoneGallery() {
  const screenRef = useRef<HTMLDivElement>(null);

  return (
    <section id="portfolio" className="portfolio-container">
      <div className="wrap">
        <ScrollFloat
          animationDuration={2}
          ease="back.inOut(4)"
          scrollStart="center bottom+=20%"
          scrollEnd="bottom bottom-=40%"
          stagger={0.06}
        >
          My Gallery
        </ScrollFloat>
        <h3>Sketching strangers & moments</h3>
        <div className="stage">
          {/* Phone and screen share the same wrapper so they stay aligned */}
          <div className="phone-wrapper">
            <img
              src="/sketch/phone.png"
              className="hand-img"
              alt=""
              aria-hidden
            />

            {/* Screen overlay precisely positioned in phone frame */}
            <div className="screen" ref={screenRef}>
              <div className="screen-scroll">
                {FEED.map((item, i) => (
                  <div key={i} className="feed-item">
                    <img src={item.image} alt={item.title} />
                    <div className="feed-content">
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="screen-fade top" aria-hidden />
              <div className="screen-fade bottom" aria-hidden />
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

        .portfolio-container {
          position: relative;
          width: 100%;
          overflow: visible; /* Allow ScrollFloat animation to extend beyond bounds */
          background: linear-gradient(
            to bottom,
            #fefefe 0%,
            #f8f8f8 50%,
            #fefefe 100%
          );
          margin-bottom: 2rem; /* Ensure separation from next section */
        }

        .wrap {
          padding: 10px;
          padding-top: 60px;
          padding-bottom: 4rem; /* Ensure proper bottom spacing */
          --header-height: clamp(80px, 15vh, 100px);
          --header-spacing: clamp(2rem, 4vh, 3rem);
          --stage-height: clamp(
            60vh,
            100vh,
            120vh
          ); /* Increased height to show full content */
          --phone-width: 90%;
          min-height: calc(
            var(--header-height) + var(--header-spacing) + var(--stage-height) +
              6rem /* Increased bottom padding */
          );
          position: relative; /* Ensure proper positioning context */
        }
        h2 {
          text-align: center;
          margin-bottom: 18px;
          transform: rotate(-1deg);
          font-family: "Brushed", "Caveat", cursive;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          color: #1f1f1f;
          text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.1),
            4px 4px 0px rgba(0, 0, 0, 0.05);
          letter-spacing: 1px;
          position: relative;
          animation: portfolioTitleSlide 1s ease-out;
          transition: all 0.3s ease;
        }

        h2:hover {
          transform: rotate(-1deg) scale(1.05);
          color: #000;
        }
        h3 {
          font-family: "Caveat", cursive;
          font-size: clamp(1.5rem, 3vw, 2rem);
          text-align: center;
          font-weight: 700;
          color: #1f1f1f;
          text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.1);
          animation: portfolioSubtitleFade 1.2s ease-out 0.3s both;
          transition: all 0.3s ease;
        }

        h3:hover {
          color: #000;
          transform: scale(1.02);
        }

        h2::before {
          content: "";
          position: absolute;
          top: -5px;
          left: -10px;
          right: -10px;
          bottom: -5px;
          background: linear-gradient(
            45deg,
            transparent 30%,
            rgba(0, 0, 0, 0.03) 50%,
            transparent 70%
          );
          border-radius: 50%;
          z-index: -1;
        }
        .stage {
          position: relative;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          aspect-ratio: 16/10;
          min-height: 80vh; /* Increased to show more content */
          height: auto; /* Allow height to grow with content */
        }

        /* Shared wrapper keeps image and screen in perfect sync */
        .phone-wrapper {
          --screen-top: 10.5%;
          --screen-left: 33%;
          --screen-width: 35%;
          --screen-height: 55%;
          --fade-size: 8%;

          position: absolute;
          top: 15%;
          left: 51%;
          width: var(--phone-width, 36%);
          transform: translate(-50%, 0);
          transform-origin: center;
          pointer-events: none; /* default off; screen turns its own on */
        }

        .hand-img {
          width: 100%;
          height: auto;
          object-fit: contain;
          max-width: 100%;
          filter: none;
          opacity: 0.95;
          display: block;
          pointer-events: none;
          animation: phoneFloat 6s ease-in-out infinite;
          transition: all 0.3s ease;
        }

        .hand-img:hover {
          transform: scale(1.02);
          opacity: 1;
        }

        /* Screen positioned relative to the phone-wrapper (same transform) */
        .screen {
          position: absolute;
          top: var(--screen-top);
          left: var(--screen-left);
          width: var(--screen-width);
          height: var(--screen-height);
          border-radius: 14px;
          background: #fff;
          z-index: 2;
          /* rotation inherited from wrapper */
          transform: rotate(25deg);
          pointer-events: auto; /* re-enable interactions only on screen */
          overflow: hidden; /* clip fades */
        }

        .screen-scroll {
          position: absolute;
          inset: 0;
          overflow: auto;
          border-radius: inherit;
          scrollbar-width: thin;
          scrollbar-color: #ccc transparent;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          touch-action: pan-y;
        }

        .screen-fade {
          position: absolute;
          left: 0;
          right: 0;
          height: var(--fade-size);
          z-index: 3;
          pointer-events: none;
          border-radius: inherit;
        }
        .screen-fade.top {
          top: 0;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.5) 20%,
            transparent 100%
          );
        }
        .screen-fade.bottom {
          bottom: 0;
          background: linear-gradient(
            to top,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.5) 20%,
            transparent 100%
          );
        }

        .feed-item {
          width: 100%;
          margin-bottom: 1rem;
          animation: feedItemSlide 0.8s ease-out;
          animation-fill-mode: both;
          transition: all 0.3s ease;
        }

        .feed-item:nth-child(1) {
          animation-delay: 0.1s;
        }
        .feed-item:nth-child(2) {
          animation-delay: 0.2s;
        }
        .feed-item:nth-child(3) {
          animation-delay: 0.3s;
        }
        .feed-item:nth-child(4) {
          animation-delay: 0.4s;
        }
        .feed-item:nth-child(5) {
          animation-delay: 0.5s;
        }
        .feed-item:nth-child(6) {
          animation-delay: 0.6s;
        }

        .feed-item:hover {
          transform: scale(1.02);
        }

        .feed-item img {
          width: 100%;
          display: block;
          object-fit: cover;
          aspect-ratio: 1/1;
          transition: all 0.3s ease;
          border-radius: 8px;
        }

        .feed-item:hover img {
          transform: scale(1.05);
          filter: brightness(1.1);
        }

        .feed-content {
          padding: 0.5rem;
          background: #fff;
        }

        .feed-content h4 {
          font-size: 0.8rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: #1f1f1f;
        }

        .feed-content p {
          font-size: 0.7rem;
          line-height: 1.3;
          margin: 0;
          color: #666;
        }

        @media (max-width: 768px) {
          .stage {
            aspect-ratio: 4/3;
            min-height: 70vh; /* Increased for mobile too */
          }
          .phone-wrapper {
            top: 10%;
            --phone-width: 120%;
            width: var(--phone-width, 36%);
            left: 50.5%;
            transform: translate(-50%, 0);
            /* Override screen box if needed for mobile */
          }
        }

        @media (max-width: 555px) {
          .wrap {
            padding: 5vw;
            padding-top: 60px;
            --stage-height: clamp(
              50vh,
              60vh,
              70vh
            ); /* Increased for small screens */
          }
        }

        @keyframes portfolioTitleSlide {
          0% {
            opacity: 0;
            transform: rotate(-1deg) translateY(-30px);
          }
          100% {
            opacity: 1;
            transform: rotate(-1deg) translateY(0);
          }
        }

        @keyframes portfolioSubtitleFade {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes phoneFloat {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(1deg);
          }
        }

        @keyframes feedItemSlide {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}
