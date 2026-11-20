"use client";

import { useEffect, useRef, useState } from "react";

/* The real "draw an eye in 4 steps" reel. Plays muted and looping like a
   short (captions are burned in). Respects "reduce motion": then it waits for
   a tap instead of autoplaying. */
export default function ReelVideo({
  src,
  poster,
  label,
}: {
  src: string;
  poster: string;
  label: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      video.pause();
      setPaused(true);
      return;
    }
    video.play().catch(() => setPaused(true));
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  return (
    <div className="hl-reel">
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onClick={toggle}
      />
      <button
        type="button"
        className="hl-reel-btn"
        onClick={toggle}
        aria-label={paused ? "Play video" : "Pause video"}
      >
        {paused ? "▶" : "❚❚"}
      </button>
    </div>
  );
}
