import Link from "next/link";
import ReelVideo from "./ReelVideo";

/* Homepage in Jeff's portrait-lesson style (the /eyes page and the Eyes
   Practice PDF): warm paper, Playfair Display headings, handwritten Caveat
   notes, gold buttons with an ink outline and offset shadow, sienna accents,
   and workbook pieces: "STEP 1" labels, a sage "Your goal" box and
   "Reference photo | Draw here" frames. Built on the real 4-step eye reel. */

const EYE = "/home/eye";

const STEPS = [
  {
    n: 1,
    title: "Box it",
    goal: "Draw a box around it. Split it in half, then half again.",
    img: `${EYE}/step-1.jpg`,
  },
  {
    n: 2,
    title: "Lines, not curves",
    goal: "Straight lines first, light pressure. Curves come later.",
    img: `${EYE}/step-2.jpg`,
  },
  {
    n: 3,
    title: "Map 4 tones",
    goal: "Light, mid, dark-mid, shadow. Label the shapes like a map.",
    img: `${EYE}/step-3.jpg`,
    tones: true,
  },
  {
    n: 4,
    title: "Blend, then details",
    goal: "Tissue to blend, then lashes, iris and brow.",
    img: `${EYE}/step-4.jpg`,
  },
];

const TONES = [
  { name: "Light", short: "L", c: "#f4f1ea" },
  { name: "Mid", short: "M", c: "#c9c3b8" },
  { name: "Dark-mid", short: "DM", c: "#8d877d" },
  { name: "Shadow", short: "S", c: "#3a3631" },
];

const FAQ = [
  {
    q: "I can't draw. Is this for me?",
    a: "Yes, that's exactly who it's for. You're not drawing an eye, you're drawing a box, some straight lines and four tones. The trace tool helps you put them in the right place.",
  },
  {
    q: "Is it free? Do I need an app?",
    a: "Free, no sign-up, nothing to install. It runs in your phone's browser on iPhone (Safari) and Android (Chrome). You can add it to your home screen.",
  },
  {
    q: "How does the trace tool work?",
    a: "Rest your phone above your paper. Pick a photo and it appears over the camera view, see-through, so you can trace the big shapes. Tap Shapes to see it as 2, 3 or 4 flat tones.",
  },
  {
    q: "Are my photos uploaded?",
    a: "No. Your picture and your camera view stay on your phone.",
  },
];

function Label({ children }: { children: React.ReactNode }) {
  return <span className="hl-label">{children}</span>;
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="hl-note">{children}</p>;
}

export default function HomeLanding() {
  return (
    <main className="hl">
      {/* ---------- Hero: the real reel ---------- */}
      <section className="hl-hero">
        <div className="hl-hero-a">
          <Note>a free drawing tool from Jeff</Note>
          <h1 className="hl-serif hl-h1">
            Drawing is just <span className="hl-mark">shapes</span>.
          </h1>
        </div>
        <div className="hl-hero-c">
          <p className="hl-lead">
            Box it. Lines, not curves. Four tones. Blend. That&apos;s how I draw a real eye, and how you can
            too. Watch the steps, then trace along with your phone.
          </p>
          <div className="hl-ctas">
            <Link href="/copy" className="hl-btn hl-btn-gold">
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
        <Link href="/copy" className="hl-btn hl-btn-gold">
          Start drawing, free
        </Link>
      </div>

      {/* ---------- The 4 steps, as workbook pages ---------- */}
      <section id="steps" className="hl-section">
        <div className="hl-wrap hl-head">
          <Note>the engineer way</Note>
          <h2 className="hl-serif hl-h2">A real eye in 4 steps</h2>
          <p className="hl-sub">Every picture is real pencil on paper.</p>
        </div>
        <div className="hl-steps" role="list">
          {STEPS.map((s) => (
            <article key={s.n} className="hl-card" role="listitem">
              <div className="hl-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt={`Step ${s.n}: ${s.title}`} width={800} height={552} loading="lazy" />
              </div>
              <div className="hl-card-body">
                <Label>Step {s.n} of 4</Label>
                <h3 className="hl-serif hl-h3">{s.title}</h3>
                <div className="hl-goal">
                  <span className="hl-goal-title">Your goal</span>
                  {s.goal}
                </div>
                {s.tones && (
                  <div className="hl-tones" aria-label="The four tones">
                    {TONES.map((t) => (
                      <span key={t.name}>
                        <i style={{ background: t.c }} />
                        <b>{t.short}</b>
                        {t.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
        <div className="hl-ctas hl-center hl-steps-cta">
          <Link href="/copy?course=eye" className="hl-btn hl-btn-gold">
            Draw this eye with me
          </Link>
          <Link href="/eyes" className="hl-btn hl-btn-ghost">
            Free eye practice sheets
          </Link>
        </div>
      </section>

      {/* ---------- Reference | drawing, like the practice sheets ---------- */}
      <section className="hl-section hl-band">
        <div className="hl-wrap">
          <div className="hl-head">
            <Note>see like an artist</Note>
            <h2 className="hl-serif hl-h2">Stop drawing an eye. Draw the shapes.</h2>
            <p className="hl-sub">Squint at the reference: big shapes of light and dark. That&apos;s all you copy.</p>
          </div>
          <div className="hl-compare">
            <figure>
              <figcaption>
                <Label>Reference photo</Label>
              </figcaption>
              <div className="hl-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="hl-gray"
                  src={`${EYE}/reference.jpg`}
                  alt="Reference photo of an eye"
                  width={500}
                  height={360}
                  loading="lazy"
                />
              </div>
            </figure>
            <figure>
              <figcaption>
                <Label>My drawing · pencil, 4 steps</Label>
              </figcaption>
              <div className="hl-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${EYE}/result.jpg`}
                  alt="The finished pencil drawing of the eye"
                  width={900}
                  height={621}
                  loading="lazy"
                />
              </div>
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
              <img className="hl-view-overlay" src={`${EYE}/reference-shapes.png`} alt="" />
            </div>
            <div className="hl-view-switch">
              <span>Photo</span>
              <span>Lines</span>
              <span className="on">Shapes</span>
            </div>
          </div>
          <div>
            <Note>your phone helps</Note>
            <h2 className="hl-serif hl-h2 hl-left">Your phone places the shapes for you</h2>
            <ol className="hl-list">
              <li>
                <b>Prop your phone</b> about 30 cm above your paper, on a glass or a stack of books.
              </li>
              <li>
                <b>Pick any photo.</b> It shows up over your paper, see-through. Tap <b>Shapes</b> to see it as
                2, 3 or 4 flat tones, like step 3.
              </li>
              <li>
                <b>Trace the big shapes</b>, then put the phone down and shade the tones yourself.
              </li>
            </ol>
            <Link href="/copy" className="hl-btn hl-btn-gold">
              Open the trace tool
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="hl-section hl-band">
        <div className="hl-wrap hl-narrow">
          <div className="hl-head">
            <h2 className="hl-serif hl-h2">Questions</h2>
          </div>
          {FAQ.map((f, i) => (
            <details key={f.q} className="hl-faq" open={i === 0}>
              <summary className="hl-serif">{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="hl-section hl-final">
        <Note>try it tonight</Note>
        <h2 className="hl-serif hl-h1">Grab a pencil. Draw along.</h2>
        <div className="hl-ctas hl-center">
          <Link href="/copy" className="hl-btn hl-btn-gold">
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
  --paper: #f6f0e4;
  --paper-deep: #efe6d4;
  --card: #fffdf8;
  --ink: #2c2416;
  --muted: #5e5548;
  --faint: #8a7f6e;
  --gold: #ffcf41;
  --gold-deep: #e6b52a;
  --sienna: #b56b3a;
  --sage: #6b7f6e;
  --line: rgba(44, 36, 22, 0.18);
  background:
    radial-gradient(circle at 12% 8%, rgba(44, 36, 22, 0.035) 1px, transparent 1px),
    radial-gradient(circle at 80% 40%, rgba(44, 36, 22, 0.03) 1px, transparent 1px),
    linear-gradient(180deg, #fff6d6 0%, var(--paper) 360px, var(--paper) 100%);
  background-size: 28px 28px, 42px 42px, auto;
  color: var(--ink);
  font-family: Inter, "Segoe UI", system-ui, -apple-system, sans-serif;
  overflow-x: clip;
  -webkit-font-smoothing: antialiased;
}
.hl a { color: inherit; }
.hl-serif { font-family: "Playfair Display", Georgia, serif; font-weight: 600; letter-spacing: -0.02em; }
.hl-note { font-family: "Caveat", "Kalam", cursive; font-size: 24px; line-height: 1; color: var(--sienna); margin: 0 0 6px; }
.hl-mark {
  background: linear-gradient(transparent 62%, rgba(255, 207, 65, 0.85) 62%, rgba(255, 207, 65, 0.85) 90%, transparent 90%);
  padding: 0 0.06em;
}
.hl-label {
  display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--faint);
}
.hl-wrap { max-width: 1120px; margin: 0 auto; padding: 0 20px; }
.hl-narrow { max-width: 720px; }
.hl-head { text-align: center; }
.hl-section { padding: 64px 0; }
.hl-band { background: rgba(255, 255, 255, 0.45); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.hl-h1 { font-size: clamp(40px, 9vw, 72px); line-height: 1.05; margin: 0; }
.hl-h2 { font-size: clamp(30px, 6vw, 46px); line-height: 1.12; margin: 0 0 10px; }
.hl-left { text-align: left; }
.hl-h3 { font-size: 26px; line-height: 1.15; margin: 6px 0 12px; }
.hl-sub { color: var(--muted); font-size: 17px; line-height: 1.5; margin: 0 auto 30px; max-width: 560px; }
.hl-lead { font-size: 18px; line-height: 1.6; color: var(--muted); margin: 0 0 24px; max-width: 520px; }
.hl-small { font-size: 14px; color: var(--faint); margin: 14px 0 0; }
.hl-small a { text-decoration: underline; text-decoration-color: var(--gold-deep); text-underline-offset: 3px; }
.hl-ctas { display: flex; flex-wrap: wrap; gap: 14px; }
.hl-center { justify-content: center; }

/* Buttons: the /eyes gold button, hand-drawn edge and offset shadow */
.hl-btn {
  display: inline-flex; align-items: center; justify-content: center;
  min-height: 52px; padding: 0 26px;
  font-family: "Caveat", "Kalam", cursive; font-size: 24px; font-weight: 700; line-height: 1;
  text-decoration: none; color: var(--ink) !important;
  border: 2.5px solid var(--ink);
  transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
  -webkit-tap-highlight-color: transparent;
}
.hl-btn-gold {
  background: var(--gold);
  border-radius: 40px 34px 42px 36px / 36px 42px 34px 40px;
  box-shadow: 4px 4px 0 var(--ink);
}
.hl-btn-gold:hover { transform: translate(-1px, -1px); box-shadow: 6px 6px 0 var(--ink); background: #ffe06a; }
.hl-btn-gold:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 var(--ink); }
.hl-btn-ghost {
  background: rgba(255, 255, 255, 0.55);
  border-radius: 28px 22px 30px 24px / 24px 30px 22px 28px;
}
.hl-btn-ghost:hover { background: #fff; }

/* Hero */
.hl-hero {
  max-width: 1120px; margin: 0 auto; padding: 96px 20px 32px;
  display: grid; gap: 20px; align-items: center;
  grid-template-areas: "a" "b" "c";
}
.hl-hero-a { grid-area: a; }
.hl-hero-b { grid-area: b; }
.hl-hero-c { grid-area: c; }
.hl-reel {
  position: relative; width: min(340px, 78vw); aspect-ratio: 9 / 16; margin: 0 auto;
  border-radius: 22px; overflow: hidden; background: var(--paper-deep);
  border: 2.5px solid var(--ink); box-shadow: 6px 6px 0 var(--ink);
}
.hl-reel video { width: 100%; height: 100%; object-fit: cover; display: block; cursor: pointer; }
.hl-reel-btn {
  position: absolute; right: 12px; top: 12px; width: 40px; height: 40px; border-radius: 999px;
  border: none; background: rgba(0,0,0,.45); color: #fff; font-size: 13px; cursor: pointer;
}
.hl-sticky {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 900;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(246,240,228,0) 0%, rgba(246,240,228,.96) 40%);
}
.hl-sticky .hl-btn { width: 100%; }
/* keep the footer's last line clear of the pinned button on phones */
.hl ~ footer { padding-bottom: 84px; }

/* Step cards: workbook pages */
.hl-steps {
  display: grid; grid-auto-flow: column; grid-auto-columns: min(82vw, 340px);
  gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory;
  padding: 4px 20px 22px; scrollbar-width: none; align-items: start;
}
.hl-steps::-webkit-scrollbar { display: none; }
.hl-card {
  scroll-snap-align: center; background: var(--card); border: 1.5px solid var(--line);
  border-radius: 6px; padding: 14px; box-shadow: 0 12px 30px rgba(44, 36, 22, 0.08);
}
.hl-frame { border: 1px solid var(--line); background: #fff; line-height: 0; }
.hl-frame img { width: 100%; height: auto; display: block; }
.hl-card .hl-frame img { aspect-ratio: 800 / 552; object-fit: cover; }
.hl-card-body { padding: 14px 2px 2px; }
.hl-goal {
  background: var(--sage); color: #fff; border-radius: 8px; padding: 12px 14px;
  font-size: 15px; line-height: 1.5;
}
.hl-goal-title { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; opacity: .85; margin-bottom: 4px; }
.hl-tones { display: flex; gap: 12px; margin-top: 14px; flex-wrap: wrap; }
.hl-tones span { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 11px; color: var(--muted); }
.hl-tones i { width: 32px; height: 32px; border-radius: 4px; border: 1.5px solid var(--ink); display: block; margin-bottom: 2px; }
.hl-tones b { font-family: "Caveat", cursive; font-size: 18px; color: var(--ink); line-height: 1; }
.hl-steps-cta { margin-top: 18px; padding: 0 20px; }

/* Reference | drawing */
.hl-compare { display: grid; gap: 22px; }
.hl-compare figure { margin: 0; }
.hl-compare figcaption { margin-bottom: 8px; }
.hl-compare .hl-frame { padding: 8px; box-shadow: 0 10px 26px rgba(44, 36, 22, 0.1); }
.hl-gray { filter: grayscale(1) contrast(1.05); }

/* Tool */
.hl-tool { display: grid; gap: 36px; align-items: center; }
.hl-view {
  width: 100%; max-width: 520px; margin: 0 auto; border-radius: 18px; overflow: hidden;
  background: #111; border: 2.5px solid var(--ink); box-shadow: 6px 6px 0 var(--ink);
}
.hl-view-screen { position: relative; aspect-ratio: 800 / 552; }
.hl-view-cam { display: block; width: 100%; height: 100%; object-fit: cover; }
.hl-view-overlay {
  position: absolute; left: 12%; top: 4%; width: 76%; height: auto; opacity: .55;
  border: 2px dashed rgba(25,118,210,.9); border-radius: 2px;
}
.hl-view-switch {
  display: flex; gap: 4px; margin: 10px; padding: 3px; border-radius: 999px; background: rgba(255,255,255,.1);
}
.hl-view-switch span { flex: 1; text-align: center; font-size: 13px; font-weight: 600; color: rgba(255,255,255,.85); padding: 7px 0; border-radius: 999px; }
.hl-view-switch span.on { background: #fff; color: #111; }
.hl-list { margin: 16px 0 26px; padding-left: 22px; font-size: 17px; line-height: 1.6; color: var(--muted); list-style: decimal; }
.hl-list li { margin-bottom: 10px; padding-left: 4px; }
.hl-list li::marker { font-family: "Playfair Display", serif; font-weight: 600; color: var(--sienna); }
.hl-list b { color: var(--ink); }

/* FAQ: ruled like the practice sheets */
.hl-faq { border-bottom: 1px solid var(--line); padding: 4px 2px; }
.hl-faq:first-of-type { border-top: 1px solid var(--line); }
.hl-faq summary { font-size: 20px; padding: 16px 0; cursor: pointer; list-style: revert; }
.hl-faq p { margin: 0 0 18px; color: var(--muted); font-size: 16px; line-height: 1.65; }

.hl-final { text-align: center; padding: 72px 20px 120px; }
.hl-final .hl-h1 { margin-bottom: 26px; }

@media (min-width: 900px) {
  .hl-hero { grid-template-columns: 1.15fr 0.85fr; grid-template-areas: "a b" "c b"; padding-top: 136px; column-gap: 56px; row-gap: 20px; align-items: end; }
  .hl-hero-c { align-self: start; }
  .hl-sticky { display: none; }
  .hl ~ footer { padding-bottom: 0; }
  .hl-final { padding-bottom: 96px; }
  .hl-steps { grid-auto-flow: row; grid-template-columns: repeat(4, 1fr); grid-auto-columns: auto;
    overflow: visible; max-width: 1120px; margin: 0 auto; padding: 4px 20px 22px; }
  .hl-compare { grid-template-columns: 1fr 1.25fr; align-items: end; }
  .hl-tool { grid-template-columns: 1fr 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .hl-btn { transition: none; }
}
`;
