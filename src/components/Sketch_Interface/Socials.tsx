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
          padding: 24px 5vw;
        }
        img {
          width: 42px;
          height: 42px;
          filter: drop-shadow(0 1px 0 #00000010);
        }
        a {
          transform: rotate(-2deg);
          transition: transform 0.2s;
        }
        a:hover {
          transform: rotate(2deg) scale(1.06);
        }
      `}</style>
    </section>
  );
}
