"use client";
import { useEffect, useRef, useState } from "react";

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
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const outer = outerRef.current!;
    const inner = innerRef.current!;
    if (!outer || !inner) return;

    function onScroll() {
      const rect = outer.getBoundingClientRect();
      const vh = window.innerHeight;
      // progress while the section is in view
      //   const visible = Math.min(
      //     vh,
      //     Math.max(0, vh - Math.abs(rect.top - vh * 0.4))
      //   );
      const progress = Math.max(
        0,
        Math.min(1, (vh - rect.top) / (vh + rect.height))
      );
      const maxScroll = inner.scrollHeight - inner.clientHeight;
      inner.scrollTop = progress * maxScroll;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        setReady(e.isIntersecting);
      },
      { threshold: [0, 1] }
    );

    io.observe(outer);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };

    // I also not sure what ready is for, can delete next time
    if (ready) {
      onScroll();
    }
  }, []);

  return (
    <section id="moments" className="wrap">
      <h2>My Gallery</h2>
      <h2>Sketching strangers & moments</h2>
      <div className="stage">
        {/* Background layer - hand + phone image */}
        <div className="background-layer">
          <img
            src="/sketch/phone.png"
            className="hand-img"
            alt=""
            aria-hidden
          />
        </div>

        {/* Content layer - phone screen positioned relative to background */}
        <div className="content-layer phone-content" ref={outerRef}>
          <div className="screen" ref={innerRef}>
            {FEED.map((item, i) => (
              <div key={i} className="feed-item">
                <img src={item.image} alt={item.title} />
                <div className="feed-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .wrap {
          padding: 10px;
          padding-top: 60px;
        }
        h2 {
          text-align: center;
          margin-bottom: 18px;
          transform: rotate(-1deg);
          font-family: "Caveat", cursive;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          color: #1f1f1f;
          text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.1),
            4px 4px 0px rgba(0, 0, 0, 0.05);
          letter-spacing: 1px;
          position: relative;
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
          min-height: 60vh;
        }

        /* Background layer */
        .background-layer {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .hand-img {
          width: 100%;
          object-fit: contain;
          pointer-events: none;
          opacity: 0.95;
        }

        /* Content layer */
        .content-layer {
          position: absolute;
          z-index: 2;
          pointer-events: auto;
        }

        .phone-content {
          top: 11%;
          left: 60%;
          width: 37%;
          aspect-ratio: 2/3.5;
          transform: translate(-50%, 0) rotate(25deg);
        }
        .screen {
          position: relative;
          aspect-ratio: 2/3.5;
          overflow: hidden auto;
          border-radius: 24px;
          background: #fff;
          scrollbar-width: thin;
          scrollbar-color: #ccc transparent;
        }

        .screen::-webkit-scrollbar {
          width: 4px;
        }

        .screen::-webkit-scrollbar-track {
          background: transparent;
        }

        .screen::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 2px;
        }

        .screen::-webkit-scrollbar-thumb:hover {
          background: #999;
        }
        .feed-item {
          width: 100%;
          margin-bottom: 1rem;
        }

        .feed-item img {
          width: 100%;
          display: block;
          object-fit: cover;
          aspect-ratio: 1/1;
        }

        .feed-content {
          padding: 0.5rem;
          background: #fff;
        }

        .feed-content h3 {
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
        .frame {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        @media (max-width: 768px) {
          .stage {
            aspect-ratio: 4/3;
            min-height: 50vh;
          }

          .phone-content {
            top: 8%;
            width: 30%;
            aspect-ratio: 2/3.5;
            transform: translate(-50%, 0) rotate(25deg);
          }

          .hand-img {
            max-width: 600px;
          }
        }

        @media (max-width: 555px) {
          .wrap {
            padding: 5vw;
            padding-top: 150px;
          }
          .phone-content {
            top: 7%;
            width: 36.5%;
            transform: translate(-50%, 0) rotate(25deg);
          }
        }
      `}</style>
    </section>
  );
}
