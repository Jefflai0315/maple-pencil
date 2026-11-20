"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "motion/react";

const ROMANS = ["I", "II", "III", "IV", "V"];

/* ============================================================
   HERO — pinned to the screen; sketched portraits pop in
   behind Jeff as you scroll (superr.ai-style scrub).
   ============================================================ */

const PORTRAITS = [
  {
    src: "/home/portrait-1.png",
    alt: "Sketch of a smiling uncle in a flat cap",
    style: { left: "8%", top: "12%" },
    rotate: -8,
    range: [0.06, 0.2] as [number, number],
  },
  {
    src: "/home/portrait-2.png",
    alt: "Sketch of a laughing woman",
    style: { right: "9%", top: "10%" },
    rotate: 7,
    range: [0.22, 0.36] as [number, number],
  },
  {
    src: "/home/portrait-3.png",
    alt: "Sketch of a kid hugging a cat",
    style: { left: "16%", bottom: "10%" },
    rotate: 5,
    range: [0.38, 0.52] as [number, number],
  },
  {
    src: "/home/portrait-4.png",
    alt: "Sketch of a happy couple",
    style: { right: "15%", bottom: "12%" },
    rotate: -6,
    range: [0.54, 0.68] as [number, number],
  },
];

function PortraitSticker({
  progress,
  src,
  alt,
  style,
  rotate,
  range,
}: {
  progress: MotionValue<number>;
  src: string;
  alt: string;
  style: React.CSSProperties;
  rotate: number;
  range: [number, number];
}) {
  const raw = useTransform(progress, range, [0, 1]);
  const pop = useSpring(raw, { stiffness: 220, damping: 18 });
  const scale = useTransform(pop, [0, 1], [0.3, 1]);
  const rot = useTransform(pop, [0, 1], [rotate * 3, rotate]);
  const opacity = useTransform(raw, [0, 0.4], [0, 1]);

  return (
    <motion.img
      src={src}
      alt={alt}
      className="pwp-story-portrait"
      style={{
        position: "absolute",
        width: "clamp(96px, 15vw, 210px)",
        borderRadius: 4,
        border: "5px solid #fdfbf9",
        boxShadow: "0px 2px 8px rgba(0,0,0,0.18)",
        scale,
        rotate: rot,
        opacity,
        ...style,
      }}
      draggable={false}
    />
  );
}

function StoryHero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const punchlineOpacity = useTransform(scrollYProgress, [0.7, 0.82], [0, 1]);
  const punchlineY = useTransform(scrollYProgress, [0.7, 0.82], [16, 0]);

  return (
    <div ref={trackRef} style={{ height: "280vh", position: "relative" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        {/* Headline */}
        <div
          style={{
            position: "absolute",
            top: "14vh",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 3,
            padding: "0 24px",
          }}
        >
          <p
            className="pwp-script"
            style={{
              fontSize: "clamp(24px, 3vw, 34px)",
              margin: 0,
              transform: "rotate(-2deg)",
              display: "inline-block",
            }}
          >
            Dear beautiful strangers,
          </p>
          <h1
            className="pwp-display"
            style={{
              fontSize: "clamp(40px, 6.5vw, 76px)",
              margin: "8px 0 0",
              lineHeight: 1.08,
            }}
          >
            I&apos;m Jeff. I draw{" "}
            <span style={{ color: "var(--pwp-orange)" }}>people</span>.
          </h1>

          {/* Punchline that fades in once the wall of faces is up */}
          <motion.p
            className="pwp-hand"
            style={{
              fontSize: "clamp(17px, 2vw, 22px)",
              color: "var(--pwp-muted)",
              margin: "16px 0 0",
              opacity: punchlineOpacity,
              y: punchlineY,
            }}
          >
            …and everyone leaves with a smile (and a portrait).
          </motion.p>

          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: 24,
            }}
          >
            <Link href="/about#contact" className="pwp-btn">
              <span className="pwp-btn-inner">Work with me</span>
            </Link>
            <Link href="/about#work" className="pwp-btn">
              <span className="pwp-btn-inner">See my work</span>
            </Link>
          </div>
        </div>

        {/* Portraits popping in behind Jeff */}
        {PORTRAITS.map((p) => (
          <PortraitSticker key={p.src} progress={scrollYProgress} {...p} />
        ))}

        {/* Jeff */}
        <motion.img
          src="/home/hero-jeff.png"
          alt="Sketch of Jeff waving with a sketchbook"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            position: "relative",
            zIndex: 2,
            height: "min(58vh, 560px)",
            width: "auto",
            pointerEvents: "none",
          }}
          draggable={false}
        />

        {/* Scroll hint */}
        <motion.div
          className="pwp-script"
          style={{
            position: "absolute",
            bottom: 20,
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 22,
            color: "var(--pwp-muted)",
            opacity: hintOpacity,
            zIndex: 3,
          }}
        >
          scroll to meet everyone ↓
        </motion.div>
      </div>
    </div>
  );
}

/* ============================================================
   FEATURE PANELS — full-screen sections, illustration with
   scroll parallax + superr-style bordered card with roman list.
   ============================================================ */

interface Feature {
  id: string;
  image: string;
  alt: string;
  accent: string;
  titlePlain: string;
  titleColored: string;
  coloredFirst?: boolean;
  items: string[];
  ctaHref: string;
  ctaLabel: string;
  flip?: boolean;
}

const FEATURES: Feature[] = [
  {
    id: "live",
    image: "/home/section-live.png",
    alt: "Sketch of a live event drawing booth with a happy queue of guests",
    accent: "var(--pwp-green)",
    titlePlain: "Live sketching that",
    titleColored: "actually wows",
    items: [
      "Weddings & dinner parties",
      "Corporate events & festivals",
      "Every guest takes home a portrait",
      "Fast, warm and fun",
      "A moment, not just a favour",
    ],
    ctaHref: "/services/live-events",
    ctaLabel: "Book live sketching",
  },
  {
    id: "commission",
    image: "/home/section-portraits.png",
    alt: "Sketch of hands holding a framed family portrait",
    accent: "var(--pwp-blue)",
    titlePlain: "Portraits people",
    titleColored: "keep forever",
    items: [
      "People, pets & moments",
      "Quick sketches to detailed pieces",
      "Gifts that actually land",
      "Traditional & digital",
      "Drawn with care, every time",
    ],
    ctaHref: "/services/commissions",
    ctaLabel: "Commission a portrait",
    flip: true,
  },
  {
    id: "arttech",
    image: "/home/section-arttech.png",
    alt: "Sketch of a whimsical photobooth that draws people instead of photographing them",
    accent: "var(--pwp-pink)",
    titlePlain: "Art & tech,",
    titleColored: "playing together",
    items: [
      "Playing with Photo — the sketch photobooth",
      "AI sketch experiences for events",
      "Interactive installations",
      "Custom builds for brands & spaces",
      "If you can imagine it, let's talk",
    ],
    ctaHref: "/services/art-tech",
    ctaLabel: "Explore art & tech",
  },
];

function FeaturePanel({ feature }: { feature: Feature }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["7%", "-7%"]);
  const imgScale = useTransform(scrollYProgress, [0, 0.45], [0.94, 1]);

  return (
    <section
      ref={ref}
      id={feature.id === "live" ? "services" : undefined}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "80px 24px",
        scrollMarginTop: 80,
        overflow: "hidden",
      }}
    >
      <div
        className="pwp-feature-grid"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          flexDirection: feature.flip ? "row-reverse" : "row",
          alignItems: "center",
          gap: "clamp(32px, 5vw, 72px)",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* Illustration with parallax */}
        <motion.img
          src={feature.image}
          alt={feature.alt}
          style={{
            y: imgY,
            scale: imgScale,
            flex: "1 1 480px",
            minWidth: 0,
            maxWidth: 660,
            width: "100%",
            height: "auto",
            mixBlendMode: "multiply",
          }}
          draggable={false}
        />

        {/* superr-style bordered card */}
        <motion.div
          className="pwp-panel"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{
            flex: "0 1 420px",
            padding: "24px 0 20px",
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          <h2
            className="pwp-display"
            style={{
              fontSize: "clamp(26px, 2.6vw, 36px)",
              lineHeight: 1.2,
              margin: 0,
              padding: "0 32px",
            }}
          >
            <span>{feature.titlePlain} </span>
            <span style={{ color: feature.accent }}>
              {feature.titleColored}
            </span>
          </h2>

          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {feature.items.map((item, i) => (
              <li key={item}>
                <hr className="pwp-line-div" style={{ margin: "10px 0" }} />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "2px 32px",
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 17,
                      fontWeight: i === 0 ? 500 : 400,
                      color: i === 0 ? feature.accent : "var(--pwp-ink)",
                    }}
                  >
                    {item}
                  </span>
                  <span
                    className="pwp-display"
                    style={{
                      fontSize: 17,
                      opacity: i === 0 ? 1 : 0.7,
                      width: 32,
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                  >
                    {ROMANS[i]}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div style={{ padding: "0 32px" }}>
            <Link href={feature.ctaHref} className="pwp-btn pwp-btn--sm">
              <span className="pwp-btn-inner">{feature.ctaLabel}</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function ScrollStory() {
  return (
    <>
      <StoryHero />
      {FEATURES.map((f) => (
        <FeaturePanel key={f.id} feature={f} />
      ))}
      <style>{`
        @media (max-width: 720px) {
          .pwp-story-portrait { width: clamp(80px, 24vw, 120px) !important; }
        }
      `}</style>
    </>
  );
}
