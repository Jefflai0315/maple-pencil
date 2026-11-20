import Link from "next/link";
import ReelVideo from "./ReelVideo";

/* Homepage built on Jeff's real "draw a real eye in 4 steps" reel.
   Idea (from "it's all just shapes"): drawing is boxes, lines and tones, and
   the phone trace tool helps you place them. Visual language copies the reel:
   cream paper, white step cards, red STEP pills, hand-lettered titles. */

const EYE = "/home/eye";

const STEPS = [
  {
    n: 1,
    title: "Box it",
    body: "Draw a box around it. Split it in half, then half again.",
    img: `${EYE}/step-1.jpg`,
  },
  {
    n: 2,
    title: "Lines, not curves",
    body: "Straight lines first. Curves come later.",
    img: `${EYE}/step-2.jpg`,
  },
  {
    n: 3,
    title: "Map 4 tones",
    body: "Light, mid, dark-mid, shadow. Label the shapes like a map. (The trace tool's Shapes button does this for any photo.)",
    img: `${EYE}/step-3.jpg`,
    tones: true,
  },
  {
    n: 4,
    title: "Blend, then details",
    body: "Tissue to blend, then lashes, iris and brow.",
    img: `${EYE}/step-4.jpg`,
  },
];

const TONES = [
  { name: "Light", c: "#f4f1ea" },
  { name: "Mid", c: "#c9c3b8" },
  { name: "Dark-mid", c: "#8d877d" },
  { name: "Shadow", c: "#3a3631" },
];

const FAQ = [
  {
    q: "I can't draw. Is this for me?",
    a: "Yes, that's exactly who it's for. You're not drawing an eye, you're drawing a box, some straight lines and four tones. The trace tool helps you put them in the right place.",
  },
  {
    q: "Is it free? Do I need an app?",
    a: "Free, no sign-up, nothing to install. It runs in your phone's browser on iPhone (Safari) and Android (Chrome).",
  },
  {
    q: "How does the trace tool work?",
    a: "Rest your phone above your paper. Pick a photo and it appears over the camera view, see-through, so you can trace the big shapes onto your paper.",
  },
  {
    q: "Are my photos uploaded?",
    a: "No. Your picture and your camera view stay on your phone.",
  },
];

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="hl-pill">{children}</span>;
}

function Dashes({ n, of = 4 }: { n: number; of?: number }) {
  return (
    <span className="hl-dashes" aria-hidden>
      {Array.from({ length: of }, (_, i) => (
        <span key={i} className={i < n ? "on" : ""} />
      ))}
    </span>
  );
}

export default function HomeLanding() {
  return (
    <main className="hl">
      {/* ---------- Hero: the real reel ---------- */}
      <section className="hl-hero">
        <div className="hl-hero-a">
          <Pill>The engineer way</Pill>
          <h1 className="hl-hand hl-h1">
            Drawing is just <span className="hl-red">shapes</span>.
          </h1>
        </div>
        <div className="hl-hero-c">
          <p className="hl-lead">
            Box it. Lines, not curves. Four tones. Blend. That&apos;s how anyone can draw a real eye. Watch
            how, then try it with your phone. Free.
          </p>
          <div className="hl-ctas">
            <Link href="/copy" className="hl-btn hl-btn-red">
              Start drawing, free
            </Link>
            <a href="#steps" className="hl-btn hl-btn-ghost">
              See the 4 steps
            </a>
          </div>
          <p className="hl-small">Works on iPhone &amp; Android · nothing to install</p>
        </div>
        <div className="hl-hero-b">
          <ReelVideo
            src={`${EYE}/reel.mp4`}
            poster={`${EYE}/reel-poster.jpg`}
            label="Jeff drawing a realistic eye in four steps with a pencil"
          />
        </div>
      </section>

      {/* Phones: the main action is always one tap away. */}
      <div className="hl-sticky">
        <Link href="/copy" className="hl-btn hl-btn-red">
          Start drawing, free
        </Link>
      </div>

      {/* ---------- The 4 steps, as reel cards ---------- */}
      <section id="steps" className="hl-section">
        <div className="hl-wrap">
          <h2 className="hl-hand hl-h2">A real eye in 4 steps</h2>
          <p className="hl-sub">Every picture is real pencil on paper.</p>
        </div>
        <div className="hl-steps" role="list">
          {STEPS.map((s) => (
            <article key={s.n} className="hl-card" role="listitem">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.img} alt={`Step ${s.n}: ${s.title}`} width={800} height={552} loading="lazy" />
              <div className="hl-card-head">
                <Pill>
                  Step {s.n} / 4
                </Pill>
                <h3 className="hl-hand hl-h3">{s.title}</h3>
                <p className="hl-card-body">{s.body}</p>
                {s.tones && (
                  <div className="hl-tones">
                    {TONES.map((t) => (
                      <span key={t.name}>
                        <i style={{ background: t.c }} />
                        {t.name}
                      </span>
                    ))}
                  </div>
                )}
                <Dashes n={s.n} />
              </div>
            </article>
          ))}
        </div>
        <div className="hl-ctas hl-center hl-steps-cta">
          <Link href="/copy?course=eye" className="hl-btn hl-btn-red">
            Draw this eye with me
          </Link>
          <Link href="/eyes" className="hl-btn hl-btn-ghost">
            Free eye practice sheets
          </Link>
        </div>
      </section>

      {/* ---------- Side by side, like the short ---------- */}
      <section className="hl-section hl-compare-sec">
        <div className="hl-wrap">
          <h2 className="hl-hand hl-h2">See like an artist</h2>
          <p className="hl-sub">Stop looking at an eye. Look at the shapes of light and dark.</p>
          <div className="hl-compare">
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${EYE}/reference.jpg`} alt="Reference photo of an eye" width={500} height={360} loading="lazy" />
              <figcaption>
                <Pill>Reference</Pill>
              </figcaption>
            </figure>
            <span className="hl-arrow" aria-hidden>
              →
            </span>
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${EYE}/result.jpg`} alt="The finished pencil drawing of the eye" width={900} height={621} loading="lazy" />
              <figcaption>
                <Pill>Pencil · 4 steps</Pill>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ---------- The tool ---------- */}
      <section className="hl-section">
        <div className="hl-wrap hl-tool">
          <div className="hl-view" aria-hidden>
            <div className="hl-view-screen">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hl-view-cam" src={`${EYE}/step-2.jpg`} alt="" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="hl-view-overlay" src={`${EYE}/reference.jpg`} alt="" />
            </div>
            <div className="hl-view-bar">
              <span>Photo</span>
              <span>Sketch</span>
              <span className="on">Lock</span>
              <span>More</span>
            </div>
          </div>
          <div>
            <Pill>Your phone helps</Pill>
            <h2 className="hl-hand hl-h2 hl-left">Your phone places the shapes for you</h2>
            <ol className="hl-list">
              <li>
                <b>Prop your phone</b> about 30 cm above your paper, on a glass or a stack of books.
              </li>
              <li>
                <b>Pick any photo.</b> It shows up over your paper, see-through. Tap <b>Shapes</b> to see it
                as 2, 3 or 4 flat tones, like step 3.
              </li>
              <li>
                <b>Trace the big shapes</b>, then put the phone down and shade the tones yourself.
              </li>
            </ol>
            <Link href="/copy" className="hl-btn hl-btn-red">
              Open the trace tool
            </Link>
          </div>
        </div>
      </section>


      {/* ---------- FAQ ---------- */}
      <section id="faq" className="hl-section">
        <div className="hl-wrap hl-narrow">
          <h2 className="hl-hand hl-h2">Questions</h2>
          {FAQ.map((f, i) => (
            <details key={f.q} className="hl-faq" open={i === 0}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="hl-section hl-final">
        <Pill>Try it tonight</Pill>
        <h2 className="hl-hand hl-h1">Grab a pencil. Draw along.</h2>
        <div className="hl-ctas hl-center">
          <Link href="/copy" className="hl-btn hl-btn-red">
            Start drawing, free
          </Link>
          <a
            href="https://instagram.com/playingwithpencil"
            className="hl-btn hl-btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            More reels @playingwithpencil
          </a>
        </div>
        <p className="hl-small">
          Made by Jeff in Singapore. <Link href="/about">Meet Jeff</Link>
        </p>
      </section>

      <style>{CSS}</style>
    </main>
  );
}

const CSS = `
.hl {
  --cream: #f3eee5;
  --card: #ffffff;
  --ink: #1f1b16;
  --muted: #6f675d;
  --red: #e0473c;
  --line: #e4ddd1;
  background: var(--cream);
  color: var(--ink);
  font-family: var(--font-geist-sans), system-ui, -apple-system, sans-serif;
  overflow-x: clip;
  -webkit-font-smoothing: antialiased;
}
.hl a { color: inherit; }
.hl-hand { font-family: "Shantell Sans", "Comic Sans MS", cursive; font-weight: 600; letter-spacing: -0.01em; }
.hl-red { color: var(--red); }
.hl-wrap { max-width: 1120px; margin: 0 auto; padding: 0 20px; }
.hl-narrow { max-width: 720px; }
.hl-section { padding: 64px 0; }
.hl-pill {
  display: inline-block; background: var(--red); color: #fff;
  font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  padding: 4px 10px; border-radius: 999px; line-height: 1.4;
}
.hl-h1 { font-size: clamp(40px, 9vw, 72px); line-height: 1.02; margin: 14px 0 16px; }
.hl-h2 { font-size: clamp(30px, 6vw, 46px); line-height: 1.1; margin: 10px 0 8px; text-align: center; }
.hl-left { text-align: left; }
.hl-pill-row { text-align: center; }
.hl-h3 { font-size: 28px; line-height: 1.1; margin: 10px 0 6px; }
.hl-sub { text-align: center; color: var(--muted); font-size: 17px; margin: 0 0 28px; }
.hl-lead { font-size: 18px; line-height: 1.55; color: var(--muted); margin: 0 0 24px; max-width: 520px; }
.hl-small { font-size: 14px; color: var(--muted); margin: 14px 0 0; }
.hl-small a { text-decoration: underline; text-underline-offset: 3px; }
.hl-ctas { display: flex; flex-wrap: wrap; gap: 12px; }
.hl-center { justify-content: center; }
.hl-steps-cta { margin-top: 18px; padding: 0 20px; }
.hl-btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 52px; padding: 0 24px; border-radius: 999px;
  font-size: 17px; font-weight: 700; text-decoration: none;
  transition: transform .15s ease, box-shadow .15s ease;
  -webkit-tap-highlight-color: transparent;
}
.hl-btn:active { transform: scale(0.98); }
.hl-btn-red { background: var(--red); color: #fff !important; box-shadow: 0 6px 18px rgba(224,71,60,.3); }
.hl-btn-ghost { background: var(--card); color: var(--ink); box-shadow: 0 1px 0 var(--line), 0 4px 14px rgba(0,0,0,.06); }

/* Hero */
.hl-hero {
  max-width: 1120px; margin: 0 auto; padding: 96px 20px 32px;
  display: grid; gap: 20px; align-items: center;
  grid-template-areas: "a" "b" "c";
}
.hl-hero-a { grid-area: a; }
.hl-hero-b { grid-area: b; }
.hl-hero-c { grid-area: c; }
.hl-hero .hl-h1 { margin-bottom: 0; }
/* sticky "Start drawing" bar on phones */
.hl-sticky {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 900;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(243,238,229,0) 0%, rgba(243,238,229,.95) 35%);
}
.hl-sticky .hl-btn { width: 100%; }
.hl-final { padding-bottom: 120px !important; }
.hl-reel {
  position: relative; width: min(340px, 78vw); aspect-ratio: 9 / 16; margin: 0 auto;
  border-radius: 28px; overflow: hidden; background: #ddd5c8;
  box-shadow: 0 30px 60px rgba(60,40,20,.22);
}
.hl-reel video { width: 100%; height: 100%; object-fit: cover; display: block; cursor: pointer; }
.hl-reel-btn {
  position: absolute; right: 12px; top: 12px; width: 40px; height: 40px; border-radius: 999px;
  border: none; background: rgba(0,0,0,.45); color: #fff; font-size: 13px; cursor: pointer;
}

/* Step cards (swipe on phones) */
.hl-steps {
  display: grid; grid-auto-flow: column; grid-auto-columns: min(82vw, 340px);
  gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory;
  padding: 4px 20px 18px; scrollbar-width: none; align-items: start;
}
.hl-steps::-webkit-scrollbar { display: none; }
.hl-card {
  scroll-snap-align: center; background: var(--card); border-radius: 20px; overflow: hidden;
  box-shadow: 0 10px 30px rgba(60,40,20,.08); display: flex; flex-direction: column;
}
.hl-card-head { padding: 16px 18px 18px; }
.hl-card-body { font-size: 15px; line-height: 1.5; color: var(--muted); margin: 0; }
.hl-card img { width: 100%; height: auto; display: block; aspect-ratio: 800 / 552; object-fit: cover; }
.hl-dashes { display: flex; gap: 6px; margin-top: 14px; }
.hl-dashes span { width: 22px; height: 4px; border-radius: 2px; background: #eadfd6; }
.hl-dashes span.on { background: var(--red); }
.hl-tones { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
.hl-tones span { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 11px; color: var(--muted); }
.hl-tones i { width: 30px; height: 30px; border-radius: 6px; border: 1.5px solid #d7cfc3; display: block; }

/* Compare */
.hl-compare { display: grid; gap: 12px; align-items: center; }
.hl-compare figure { margin: 0; position: relative; }
.hl-compare img { width: 100%; height: auto; display: block; border-radius: 18px; box-shadow: 0 10px 30px rgba(60,40,20,.12); }
.hl-compare figcaption { position: absolute; left: 12px; top: 12px; }
.hl-arrow { justify-self: center; font-size: 32px; color: var(--red); transform: rotate(90deg); }

/* Tool */
.hl-tool { display: grid; gap: 36px; align-items: center; }
.hl-view {
  position: relative; width: 100%; max-width: 520px; margin: 0 auto; border-radius: 22px; overflow: hidden;
  background: #111; box-shadow: 0 30px 60px rgba(60,40,20,.22); border: 8px solid #151515;
}
/* the camera view: the real sheet of paper with the box drawn on it */
.hl-view-screen { position: relative; aspect-ratio: 800 / 552; }
.hl-view-cam { display: block; width: 100%; height: 100%; object-fit: cover; }
/* the chosen picture floats over the paper, see-through, lined up with the box */
.hl-view-overlay {
  position: absolute; left: 12%; top: 4%; width: 76%; height: auto; opacity: .5;
  border: 2px dashed rgba(25,118,210,.9); border-radius: 2px;
}
.hl-view-bar { padding: 10px 8px 12px; background: #111; display: flex; justify-content: space-around; }
.hl-view-bar span { color: #fff; font-size: 10px; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.hl-view-bar span::before { content: ""; width: 24px; height: 24px; border-radius: 999px; border: 1.5px solid rgba(255,255,255,.35); }
.hl-view-bar span.on::before { border-color: #ff6f1e; background: rgba(255,111,30,.25); }
.hl-list { margin: 16px 0 24px; padding-left: 22px; font-size: 17px; line-height: 1.55; color: var(--muted); list-style: decimal; }
.hl-list li { margin-bottom: 10px; padding-left: 4px; }
.hl-list b { color: var(--ink); }


/* FAQ */
.hl-faq { background: var(--card); border-radius: 16px; padding: 4px 18px; margin-bottom: 10px; box-shadow: 0 4px 14px rgba(60,40,20,.05); }
.hl-faq summary { font-weight: 600; font-size: 17px; padding: 14px 0; cursor: pointer; list-style: revert; }
.hl-faq p { margin: 0 0 16px; color: var(--muted); font-size: 16px; line-height: 1.6; }

.hl-final { text-align: center; padding: 72px 20px 96px; }

@media (min-width: 900px) {
  .hl-hero { grid-template-columns: 1.15fr 0.85fr; grid-template-areas: "a b" "c b"; padding-top: 136px; column-gap: 48px; row-gap: 20px; align-items: end; }
  .hl-hero-c { align-self: start; }
  .hl-hero .hl-h1 { margin-bottom: 0; }
  .hl-sticky { display: none; }
  .hl-final { padding-bottom: 96px !important; }
  .hl-steps { grid-auto-flow: row; grid-template-columns: repeat(4, 1fr); grid-auto-columns: auto;
    overflow: visible; max-width: 1120px; margin: 0 auto; padding: 4px 20px 18px; }
  .hl-compare { grid-template-columns: 1fr auto 1.25fr; }
  .hl-arrow { transform: none; }
  .hl-tool { grid-template-columns: 1fr 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .hl-btn { transition: none; }
}
`;
