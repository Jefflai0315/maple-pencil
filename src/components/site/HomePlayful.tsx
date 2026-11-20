"use client";

import Link from "next/link";
import ScrollStory from "./ScrollStory";

const PLAY = [
  {
    emoji: "📱",
    title: "Pencil Trace",
    note: "trace anything with your phone!",
    href: "/app",
    rotate: -3,
  },
  {
    emoji: "🎮",
    title: "Game world",
    note: "a little world to explore",
    href: "/world",
    rotate: 2,
  },
  {
    emoji: "🧱",
    title: "Community mural",
    note: "kids' drawings, brought to life",
    href: "/sembawang-mural",
    rotate: -1.5,
  },
];

const FAQ = [
  {
    q: "What do you actually do at events?",
    a: "I set up a small sketch booth and draw your guests live — each one walks away with a portrait. It becomes a moment, not just a favour.",
  },
  {
    q: "How many people can you sketch in an hour?",
    a: "Quick portraits take a few minutes each. For big crowds, we plan the format together so nobody misses out.",
  },
  {
    q: "Do you do weddings and corporate events?",
    a: "Yes — weddings, dinners, product launches, festivals. Each one gets its own flavour.",
  },
  {
    q: "Can I commission a single portrait?",
    a: "Absolutely. People, pets, couples, memories — quick sketches to detailed keepsakes.",
  },
  {
    q: "What's the art-tech thing?",
    a: "Interactive installations that mix drawing with code — like AI sketch booths and playful digital walls. If you can imagine it, let's talk.",
  },
];

export default function HomePlayful() {
  return (
    <main className="pwp pwp-paper-bg" style={{ overflowX: "hidden" }}>
      {/* ---------------- SCROLL STORY: hero + 3 feature panels ---------------- */}
      <ScrollStory />

      {/* ---------------- PROOF STRIP ---------------- */}
      <section
        className="pwp-cream-bg"
        style={{ padding: "28px 24px" }}
      >
        <div
          className="pwp-hand"
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
            gap: "clamp(24px, 5vw, 64px)",
            flexWrap: "wrap",
            fontSize: 19,
            color: "var(--pwp-ink)",
          }}
        >
          <span>✏️ 500+ faces sketched</span>
          <span>💍 weddings & corporate</span>
          <span>🖥️ live & digital</span>
          <span>📍 Singapore</span>
        </div>
      </section>

      {/* ---------------- WORK ---------------- */}
      <section
        id="work"
        className="pwp-cream-bg"
        style={{ padding: "96px 24px", scrollMarginTop: 100 }}
      >
        <div style={{ maxWidth: 1160, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span
              className="pwp-script"
              style={{
                fontSize: 26,
                color: "var(--pwp-orange)",
                display: "inline-block",
                transform: "rotate(-2deg)",
              }}
            >
              soooo many faces
            </span>
            <h2
              className="pwp-display"
              style={{
                fontSize: "clamp(28px, 3.65vw, 40px)",
                margin: "4px 0 0",
              }}
            >
              A few favourite pieces
            </h2>
            <p className="pwp-muted" style={{ fontSize: 15, marginTop: 12 }}>
              (Placeholders for now — your photos drop straight in.)
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 24,
            }}
          >
            {[
              { label: "Live sketch booth", tag: "Events" },
              { label: "Portrait commission", tag: "Portrait" },
              { label: "Community mural", tag: "Mural" },
              { label: "Wedding guests", tag: "Events" },
              { label: "Pet portrait", tag: "Portrait" },
              { label: "BazGym installation", tag: "Art-tech" },
            ].map((w, i) => (
              <figure
                key={w.label}
                style={{
                  margin: 0,
                  transform: `rotate(${[-1.5, 1, -0.5, 1.5, -1, 0.5][i]}deg)`,
                }}
              >
                <div
                  style={{
                    aspectRatio: "4 / 5",
                    borderRadius: 6,
                    border: "5px solid #fdfbf9",
                    outline: "2.3px solid var(--pwp-ink)",
                    boxShadow: "0px 1px 4px 0px rgba(0,0,0,0.25)",
                    background:
                      "repeating-linear-gradient(45deg, #fffcf9 0 14px, #f7efe9 14px 28px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 40 }} aria-hidden>
                    ✏️
                  </span>
                </div>
                <figcaption
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 4px 0",
                    fontSize: 15,
                    fontWeight: 500,
                  }}
                >
                  <span>{w.label}</span>
                  <span className="pwp-muted">{w.tag}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PLAY ---------------- */}
      <section
        id="play"
        className="pwp-guides"
        style={{ padding: "96px 24px", scrollMarginTop: 100 }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <span
            className="pwp-script"
            style={{
              fontSize: 26,
              color: "var(--pwp-muted)",
              display: "inline-block",
              transform: "rotate(2deg) translateX(40px)",
            }}
          >
            and there&apos;s
          </span>
          <h2
            className="pwp-display"
            style={{
              fontSize: "clamp(28px, 3.65vw, 40px)",
              margin: "0 0 56px",
            }}
          >
            other cool stuff!
          </h2>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "clamp(20px, 4vw, 48px)",
              flexWrap: "wrap",
            }}
          >
            {PLAY.map((p) => (
              <Link
                key={p.title}
                href={p.href}
                className="pwp-panel"
                style={{
                  width: 240,
                  padding: "28px 24px",
                  textDecoration: "none",
                  color: "var(--pwp-ink)",
                  transform: `rotate(${p.rotate}deg)`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div style={{ fontSize: 44 }}>{p.emoji}</div>
                <h3
                  className="pwp-display"
                  style={{ fontSize: 24, margin: "12px 0 4px" }}
                >
                  {p.title}
                </h3>
                <p
                  className="pwp-hand pwp-muted"
                  style={{ fontSize: 16, margin: 0, lineHeight: 1.4 }}
                >
                  {p.note}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- ABOUT ---------------- */}
      <section
        id="about"
        className="pwp-cream-bg"
        style={{ padding: "96px 24px", scrollMarginTop: 100 }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <h2
            className="pwp-display"
            style={{ fontSize: "clamp(28px, 3.65vw, 40px)", margin: "0 0 24px" }}
          >
            Artist <span style={{ color: "var(--pwp-blue)" }}>&amp;</span>{" "}
            engineer
          </h2>
          <p
            className="pwp-display"
            style={{
              fontSize: "clamp(18px, 2.2vw, 24px)",
              lineHeight: 1.5,
              color: "var(--pwp-ink)",
              margin: 0,
            }}
          >
            I love the moment someone sees their own face on paper for the first
            time. Playing with Pencil mixes traditional sketching with playful
            technology — so that moment can happen anywhere.
          </p>
          <p
            className="pwp-script"
            style={{
              fontSize: 30,
              color: "var(--pwp-orange)",
              marginTop: 28,
              transform: "rotate(-2deg)",
              display: "inline-block",
            }}
          >
            — Jeff
          </p>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h2
            className="pwp-display"
            style={{
              fontSize: "clamp(24px, 3.65vw, 40px)",
              textAlign: "center",
              margin: "0 0 56px",
            }}
          >
            Questions you might have
          </h2>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {FAQ.map((f, i) => (
              <div key={f.q} style={{ paddingTop: i === 0 ? 0 : 24 }}>
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    margin: "0 0 8px",
                    color: "var(--pwp-ink)",
                  }}
                >
                  {f.q}
                </p>
                <p
                  className="pwp-muted"
                  style={{ fontSize: 16, lineHeight: 1.5, margin: "0 0 20px" }}
                >
                  {f.a}
                </p>
                {i < FAQ.length - 1 && <hr className="pwp-dash-div" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CONTACT ---------------- */}
      <section
        id="contact"
        className="pwp-guides"
        style={{
          padding: "110px 24px 130px",
          textAlign: "center",
          scrollMarginTop: 100,
        }}
      >
        <span
          className="pwp-script"
          style={{
            fontSize: 28,
            color: "var(--pwp-orange)",
            display: "inline-block",
            transform: "rotate(-2deg)",
          }}
        >
          got an idea?
        </span>
        <h2
          className="pwp-display"
          style={{
            fontSize: "clamp(32px, 4.5vw, 52px)",
            margin: "4px 0 20px",
          }}
        >
          Let&apos;s make something
          <br />
          <span style={{ color: "var(--pwp-green)" }}>together</span>
        </h2>
        <p
          className="pwp-muted"
          style={{ fontSize: 17, maxWidth: 420, margin: "0 auto 40px", lineHeight: 1.5 }}
        >
          Planning an event, a gift, or something a bit wild? Tell me about it —
          I reply personally.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="mailto:playingwithpencil@gmail.com" className="pwp-btn pwp-btn--orange">
            <span className="pwp-btn-inner">✉️ Email me</span>
          </a>
          <a
            href="https://instagram.com/playingwithpencil"
            target="_blank"
            rel="noreferrer"
            className="pwp-btn"
          >
            <span className="pwp-btn-inner">Instagram</span>
          </a>
        </div>
      </section>
    </main>
  );
}
