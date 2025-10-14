"use client";

export default function Socials() {
  return (
    <section className="socials" aria-label="Social links">
      <a
        href="https://www.instagram.com/playingwithpencil"
        target="_blank"
        rel="noreferrer"
      >
        <img src="/sketch/ig.png" alt="Instagram" />
      </a>
      <a href="https://www.tiktok.com/@jeffandpencil">
        <img src="/sketch/tt.png" alt="Tiktok" />
      </a>
      <a
        href="https://www.threads.com/@playingwithpencil"
        target="_blank"
        rel="noreferrer"
      >
        <img src="/sketch/thread.png" alt="Threads" />
      </a>
      <a
        href="https://www.linkedin.com/in/pin-nean-lai/"
        target="_blank"
        rel="noreferrer"
      >
        <img src="/sketch/in.png" alt="Linkedin" />
      </a>
      <a
        href="https://www.playingwithpencil.art"
        target="_blank"
        rel="noreferrer"
      >
        <img src="/sketch/website.png" alt="Website" />
      </a>
      {/* add more as needed */}
      <style jsx>{`
        .socials {
          display: flex;
          gap: 20px;
          align-items: center;
          justify-content: center;
          padding: 4rem 5vw; /* Increased padding for better separation */
          margin-top: 2rem; /* Additional margin from previous section */
          background: #fefefe; /* Ensure clean background */
          position: relative; /* Ensure proper positioning */
          z-index: 10; /* Ensure it stays above any background elements */
          animation: socialsFadeIn 1s ease-out 0.5s both;
        }
        img {
          width: 56px;
          height: 56px;
          filter: drop-shadow(0 1px 0 #00000010);
          transition: all 0.3s ease;
        }

        a {
          transform: rotate(-2deg);
          transition: all 0.3s ease;
          animation: socialIconFloat 3s ease-in-out infinite;
          display: inline-block;
        }

        a:nth-child(1) {
          animation-delay: 0s;
        }
        a:nth-child(2) {
          animation-delay: 0.2s;
        }
        a:nth-child(3) {
          animation-delay: 0.4s;
        }
        a:nth-child(4) {
          animation-delay: 0.6s;
        }
        a:nth-child(5) {
          animation-delay: 0.8s;
        }

        a:hover {
          transform: rotate(2deg) scale(1.15);
          animation-play-state: paused;
        }

        a:hover img {
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2)) brightness(1.1);
        }

        a:active {
          transform: rotate(1deg) scale(1.05);
        }

        @keyframes socialsFadeIn {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes socialIconFloat {
          0%,
          100% {
            transform: rotate(-2deg) translateY(0px);
          }
          50% {
            transform: rotate(-2deg) translateY(-5px);
          }
        }
      `}</style>
    </section>
  );
}
