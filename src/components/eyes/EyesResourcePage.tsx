"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Navbar from "@/components/Sketch_Interface/Navbar";
import Footer from "@/components/Sketch_Interface/Footer";
import EyeStageDiagram, {
  WorksheetMockup,
  WorksheetThumbs,
  type Stage,
} from "@/components/eyes/EyeDiagrams";
import "./eyes.css";

const PDF_HREF = "/eyes/playing-with-pencil-eyes-practice.pdf";
const COURSE_HREF = "https://learn.playingwithpencil.art/beg-course";

function track(label: string) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", "click", {
      event_category: "eyes_resource",
      event_label: label,
    });
  }
}

function DownloadButton({
  className,
  children,
  id,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <a
      id={id}
      href={PDF_HREF}
      download="PlayingWithPencil-Eyes-Practice.pdf"
      className={`eyes-btn eyes-btn-primary ${className ?? ""}`}
      onClick={() => track("download_pdf")}
    >
      {children}
    </a>
  );
}

const STEPS: {
  stage: Stage;
  title: string;
  image?: { src: string; alt: string; caption: string };
  paragraphs: string[];
}[] = [
  {
    stage: 1,
    title: "Look at the angle first",
    image: {
      src: "/eyes/crops/eye-angle-main.jpg",
      alt: "A 3/4 portrait where the eyes sit on a clear tilt",
      caption: "The outer corner sits higher than the inner one here — that's the drawing.",
    },
    paragraphs: [
      "Before drawing eyelashes, pupils or details, look at the relationship between the inner and outer corners of the eye.",
      "Is one higher than the other? How much does the eye tilt?",
      "Instead of drawing the symbol of an “eye” that you already have in your head, try to draw what is actually in front of you.",
    ],
  },
  {
    stage: 2,
    title: "Simplify the eye into shapes",
    paragraphs: [
      "I like to look for the straight and angled lines hidden inside the curves.",
      "You can temporarily simplify the eye almost like a polygon.",
      "This makes it much easier to judge whether the eye is too wide, too tall, too flat or tilted incorrectly.",
      "Don't worry about making it beautiful yet. Get the structure right first.",
    ],
  },
  {
    stage: 3,
    title: "Check the proportions",
    image: {
      src: "/eyes/crops/eye-smile-pair.jpg",
      alt: "A pair of eyes from one of Jeff's pencil portraits",
      caption: "Small differences in width, height and spacing change the whole face.",
    },
    paragraphs: [
      "Before moving on, compare the width and height of the eye and the position of the corners.",
      "Small differences matter a lot in portrait drawing.",
      "An eye can be beautifully shaded and still feel wrong if the proportion underneath it is wrong.",
      "This is why observation is such an important part of drawing.",
    ],
  },
  {
    stage: 4,
    title: "Add the iris and pupil",
    image: {
      src: "/eyes/crops/eye-buns-right.jpg",
      alt: "Close-up of an iris partly covered by the eyelids",
      caption: "The iris is a circle, but the eyelids hide part of it.",
    },
    paragraphs: [
      "Once the outside structure feels right, start placing the iris and pupil.",
      "Don't treat them as separate circles floating inside the eye.",
      "Look at how much of the iris is actually visible and how the eyelids overlap it.",
      "Different people have very different relationships between their eyelids and iris — and noticing those differences is part of capturing likeness.",
    ],
  },
  {
    stage: 5,
    title: "Build the eyelids around the eye",
    image: {
      src: "/eyes/crops/eye-man-pair.jpg",
      alt: "A mature pair of eyes with heavier lids and a deeper crease",
      caption: "Look at the crease and lid thickness — they change a lot with age.",
    },
    paragraphs: [
      "The eyelid isn't just another line above the eye. Think about the form underneath it.",
      "Look at the distance between the eye and the eyelid crease, how the upper lid overlaps the eyeball, and where the shapes become softer or sharper.",
      "This becomes especially important when drawing different ages.",
      "Younger eyes tend to have softer transitions, while older eyes may have more folds and changes in form.",
    ],
  },
  {
    stage: 6,
    title: "Add light and shadow",
    image: {
      src: "/eyes/crops/eye-shade-left.jpg",
      alt: "A strongly shaded eye from one of Jeff's portraits",
      caption: "Most edges are softer than you think. Let shadow describe the form.",
    },
    paragraphs: [
      "Only now do I start thinking more seriously about shading.",
      "Instead of outlining every crease, look for areas of light and shadow.",
      "Some edges are sharp. Most are much softer than you think.",
      "Build the darker areas gradually and let softer shadows describe the form.",
      "Then add the smallest details — including eyelashes — toward the end.",
      "Structure first. Detail last.",
    ],
  },
];

export default function EyesResourcePage() {
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("eyes-hero-download");
    const course = document.getElementById("eyes-course");
    if (!hero) return;

    const update = () => {
      const heroBottom = hero.getBoundingClientRect().bottom;
      const courseTop = course?.getBoundingClientRect().top ?? 9999;
      const pastHero = heroBottom < 80;
      const beforeCourse = courseTop > window.innerHeight - 40;
      setShowSticky(pastHero && beforeCourse && window.innerWidth < 760);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="eyes-page">
      <Navbar />
      <main>
        <section className="eyes-hero">
          <div className="eyes-wrap eyes-hero-grid">
            <div className="eyes-hero-copy">
              <p className="eyes-kicker">A free worksheet from Jeff at PlayingWithPencil</p>
              <h1>Learn to Draw Eyes by Seeing the Shapes First</h1>
              <p>One of the biggest changes in my drawing happened when I stopped thinking:</p>
              <p className="eyes-quote">“How do I draw an eye?”</p>
              <p>and started asking:</p>
              <p className="eyes-quote">“What shapes and angles am I actually seeing?”</p>
              <p>
                I made this practice sheet to help you train exactly that. It breaks the eye
                down into simpler stages so you can practice the way I approach features in
                my own portraits.
              </p>
              <div className="eyes-actions">
                <DownloadButton id="eyes-hero-download">
                  Download the Free Eyes Practice PDF
                </DownloadButton>
              </div>
              <p className="eyes-fineprint">
                8-page worksheet. Instant download. No email signup.
              </p>
            </div>
            <div className="eyes-sheet-stack">
              <WorksheetMockup />
            </div>
          </div>
          <div className="eyes-wrap">
            <WorksheetThumbs />
          </div>
        </section>

        <section className="eyes-section" id="before">
          <div className="eyes-wrap eyes-split">
            <div>
              <h2>Before You Start</h2>
              <p>When people struggle with eyes, they often think the problem is the details.</p>
              <p>The eyelashes aren&apos;t right.</p>
              <p>The iris looks strange.</p>
              <p>The shading doesn&apos;t look realistic.</p>
              <p>
                But most of the time, the problem actually happened before any of those
                details were added.
              </p>
              <p>
                The basic shape, angle or proportion of the eye was already slightly off.
              </p>
              <p>
                That&apos;s why I normally build the eye from big shapes first and only add
                details later.
              </p>
              <p className="eyes-flow">Big shapes → Medium shapes → Small shapes → Details</p>
            </div>
            <figure className="eyes-visual eyes-visual-sheet">
              <img
                src="/eyes/previews/page-1.jpg"
                alt="Worksheet page 1: Block the Structure, with a light construction drawing of an eye"
              />
              <figcaption>
                Page 1 of the PDF — big shapes, angles and proportions before any shading.
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="eyes-section" id="approach">
          <div className="eyes-wrap">
            <div className="eyes-narrow">
              <h2>How I Approach Drawing an Eye</h2>
              <p>
                Use the notes beside each stage, then try it on the worksheet. The drawings
                here are from my own portraits — the same eyes I&apos;d sit down and study.
              </p>
            </div>
            <div className="eyes-steps">
              {STEPS.map((step) => (
                <article key={step.stage} className="eyes-step">
                  <div className="eyes-step-copy">
                    <header>
                      <span className="eyes-num">0{step.stage}</span>
                      <h3>{step.title}</h3>
                    </header>
                    {step.paragraphs.map((text) => (
                      <p key={text}>{text}</p>
                    ))}
                  </div>
                  <figure className="eyes-visual">
                    <EyeStageDiagram stage={step.stage} />
                    {step.image ? (
                      <>
                        <img src={step.image.src} alt={step.image.alt} />
                        <figcaption>{step.image.caption}</figcaption>
                      </>
                    ) : (
                      <figcaption>Look for the straight lines inside the curve, then check them on the worksheet.</figcaption>
                    )}
                  </figure>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="eyes-section" id="how-to-use">
          <div className="eyes-wrap eyes-split">
            <div>
              <h2>How to Use This Worksheet</h2>
              <p>Don&apos;t try to finish the whole PDF perfectly in one sitting.</p>
              <p>Use it as practice.</p>
              <div className="eyes-use">
                <div className="eyes-use-item">
                  <strong>1. Study the example first</strong>
                  <p>
                    Each step starts with a demonstration drawing. Look at the structure,
                    the value map, or the finished form before you pick up the pencil.
                  </p>
                </div>
                <div className="eyes-use-item">
                  <strong>2. Draw from the reference beside it</strong>
                  <p>
                    The next page has real eye photos and empty boxes. Draw what you see
                    using that step&apos;s method — light construction, then values, then
                    layers, then details.
                  </p>
                </div>
                <div className="eyes-use-item">
                  <strong>3. Keep structure first, details last</strong>
                  <p>
                    Don&apos;t jump to lashes. Work through the four steps in order, then
                    try the same way of looking on another face.
                  </p>
                </div>
              </div>
              <p>
                The important part isn&apos;t producing one perfect eye. It&apos;s training
                your brain to notice these things without needing someone to point them out.
              </p>
              <p>That&apos;s when drawing starts becoming much more natural.</p>
              <div className="eyes-actions">
                <DownloadButton>Download the Eyes Practice PDF</DownloadButton>
              </div>
            </div>
            <figure className="eyes-visual eyes-visual-sheet">
              <img
                src="/eyes/previews/page-2.jpg"
                alt="Practice page with a reference eye photo beside an empty drawing box"
              />
              <figcaption>
                Each practice page: a real reference on the left, and space to draw on the right.
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="eyes-section" id="why">
          <div className="eyes-wrap">
            <div className="eyes-narrow">
              <h2>Why I Teach Drawing This Way</h2>
              <p>I&apos;m Jeff, the artist behind PlayingWithPencil.</p>
              <p>
                When you watch someone draw a portrait quickly, it can look like they&apos;re
                just naturally talented.
              </p>
              <p>But there&apos;s actually a lot happening before the pencil touches the paper.</p>
              <ul className="eyes-checklist">
                <li>You&apos;re judging distances.</li>
                <li>Comparing angles.</li>
                <li>Recognising shapes.</li>
                <li>Looking at light.</li>
                <li>Making a decision.</li>
                <li>Drawing.</li>
                <li>Checking it.</li>
                <li>Adjusting it.</li>
              </ul>
              <p>
                I&apos;ve spent years doing this while sketching people in cafés, on the MRT,
                while travelling, and sometimes with only a few minutes before the person
                moves.
              </p>
              <p>
                Eventually, many of these decisions become instinctive. But they can still
                be learned. That&apos;s what I want to teach.
              </p>
            </div>
            <div className="eyes-jeff-grid">
              <figure>
                <img
                  src="/gallery/wood/1.jpg"
                  alt="Jeff holding a wood-slice portrait sketched at a Singapore bakery stall"
                />
                <figcaption>Sketched on the spot — Xing Sheng Bread, Singapore</figcaption>
              </figure>
              <figure>
                <img
                  src="/gallery/wood/3.jpg"
                  alt="A wood-slice sketch of hawker chefs held up in a busy food centre"
                />
                <figcaption>A few minutes with the pencil, then they move on</figcaption>
              </figure>
              <figure>
                <img
                  src="/gallery/quick/Com_1.jpg"
                  alt="A loose café-style portrait sketch of a child by Jeff"
                />
                <figcaption>Quick sketches train the same eye as the long ones</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="eyes-section eyes-course" id="eyes-course">
          <div className="eyes-wrap">
            <div className="eyes-course-card">
              <h2>Eyes Are Only One Part of the Portrait</h2>
              <p>
                Once you understand how to break an eye down, the same thinking starts
                appearing everywhere else.
              </p>
              <p>The nose has shapes and planes.</p>
              <p>The mouth has angles and proportions.</p>
              <p>The head has structure.</p>
              <p>Light and shadow connect all of them together.</p>
              <p>
                And eventually the goal isn&apos;t just to draw a good eye. It&apos;s to
                make all of those features work together so the portrait actually feels
                like the person you&apos;re drawing.
              </p>
              <p>
                You&apos;ve learned one small part of my process for free. If this way of
                learning makes sense to you, here&apos;s where I teach the complete process.
              </p>
              <p>
                <strong>PlayingWithPencil: The Portrait Sketching Masterclass</strong>
              </p>
              <p>
                The full course takes students through portrait drawing step by step —
                from construction and proportions to individual facial features, shading
                and complete portraits.
              </p>
              <p>
                It includes 35+ video lessons across 7 modules, guided exercises, and the
                complete facial-feature practice workbook.
              </p>
              <a
                href={COURSE_HREF}
                className="eyes-btn eyes-btn-quiet"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("course_cta")}
              >
                Learn the Full Portrait Process
              </a>
              <p className="eyes-fineprint">
                If the way I explained eyes on this page helped something click for you,
                you&apos;ll probably enjoy the rest of the course too. ✏️
              </p>
              <p className="eyes-fineprint">
                <Link href="/">← Back to Playing with Pencil</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <div className={`eyes-sticky${showSticky ? " is-visible" : ""}`}>
        <DownloadButton>Download the Free PDF</DownloadButton>
      </div>
    </div>
  );
}
