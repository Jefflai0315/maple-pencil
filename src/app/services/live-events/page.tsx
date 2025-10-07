"use client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Sketch_Interface/Navbar";
import Footer from "@/components/Sketch_Interface/Footer";
import Link from "next/link";

export default function LiveEventsServicePage() {
  const router = useRouter();

  return (
    <>
      <Navbar />
      <main className="service-detail-page">
        <button className="back-button" onClick={() => router.push("/")}>
          ← Back to Home
        </button>

        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-image">
              <img src="/NPC/easel.png" alt="Live Event Sketch Booth" />
            </div>
            <div className="hero-text">
              <h1>Live Event Sketch Booth</h1>
              <p className="tagline">Capture moments in real-time</p>
              <p className="intro">
                Transform your events into unforgettable experiences. I set up
                live sketch booths and run engaging workshops where guests get
                personalized sketches and create lasting memories.
              </p>
            </div>
          </div>
        </section>

        <section className="details-section">
          <div className="content-wrapper">
            <div className="section-block">
              <h2>What Your Guests Experience</h2>
              <p>
                Unforgettable entertainment that doubles as a personalized
                keepsake. Your guests walk away with custom hand-drawn
                portraits, creating lasting memories and giving your event that
                special touch everyone will talk about.
              </p>
            </div>

            <div className="section-block">
              <h2>Perfect For These Events</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <h3>🎉 Corporate Events & Parties</h3>
                  <p>
                    <strong>Your guests receive:</strong> Personalized portraits
                    as unique party favors that promote your brand and create
                    social buzz
                  </p>
                </div>
                <div className="feature-card">
                  <h3>💒 Wedding Entertainment</h3>
                  <p>
                    <strong>Your guests receive:</strong> Beautiful keepsakes
                    from your special day, complete with date and custom details
                  </p>
                </div>
                <div className="feature-card">
                  <h3>🤝 Team-Building Workshops</h3>
                  <p>
                    <strong>Your team receives:</strong> A fun, creative bonding
                    experience with personal sketches to commemorate the session
                  </p>
                </div>
                <div className="feature-card">
                  <h3>🎪 Festival Activations</h3>
                  <p>
                    <strong>Attendees receive:</strong> Quick sketch portraits
                    that draw crowds and create shareable moments for your brand
                  </p>
                </div>
                <div className="feature-card">
                  <h3>📸 Custom Themed Setups</h3>
                  <p>
                    <strong>Your guests receive:</strong> Sketches with custom
                    backdrops, props, and styling that match your event theme
                  </p>
                </div>
              </div>
            </div>

            <div className="section-block">
              <h2>What&apos;s Included in Your Package</h2>
              <ul className="audience-list">
                <li>
                  Complete setup: easel, materials, seating area, and signage
                </li>
                <li>
                  Choice of quick sketches (5-10 min) or detailed portraits
                  (15-30 min)
                </li>
                <li>Each guest takes home their original hand-drawn artwork</li>
                <li>Flexible time slots and packages for any event size</li>
                <li>
                  Friendly, engaging artist who makes everyone feel comfortable
                </li>
                <li>Pre-event consultation to customize the experience</li>
              </ul>
            </div>

            <div className="cta-section">
              <h2>Ready to Make Your Event Memorable?</h2>
              <p>
                Let&apos;s chat about your event and create something special
                together.
              </p>
              <a className="cta-button">
                <Link href="/#contact" className="cta-button">
                  Book a Consultation →
                </Link>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <style jsx>{`
        @font-face {
          font-family: "Brushed";
          src: url("/BRUSHED.TTF") format("truetype");
          font-weight: normal;
          font-style: normal;
        }

        .service-detail-page {
          min-height: 100vh;
          background: linear-gradient(
            to bottom,
            #fefefe 0%,
            #f8f8f8 50%,
            #fefefe 100%
          );
          font-family: "Courier New", monospace;
        }

        .back-button {
          position: fixed;
          top: 100px;
          left: 2rem;
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid #1f1f1f;
          border-radius: 50px;
          padding: 0.75rem 1.5rem;
          font-family: "Comic Sans MS", cursive;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 100;
          box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.1);
        }

        .back-button:hover {
          transform: translateX(-4px);
          box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.2);
        }

        .hero-section {
          padding: clamp(8rem, 15vh, 12rem) 5vw clamp(4rem, 8vh, 6rem);
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-image {
          width: 100%;
          max-width: 300px;
          margin: 0 auto;
        }

        .hero-image img {
          width: 100%;
          height: auto;
          filter: drop-shadow(4px 4px 8px rgba(0, 0, 0, 0.15));
        }

        .hero-text h1 {
          font-family: "Brushed", "Georgia", serif;
          font-size: clamp(2.5rem, 6vw, 4rem);
          color: #1f1f1f;
          margin: 0 0 1rem 0;
          transform: rotate(-1deg);
        }

        .tagline {
          font-family: "Comic Sans MS", cursive;
          font-size: 1.3rem;
          color: #666;
          font-style: italic;
          margin: 0 0 2rem 0;
        }

        .intro {
          font-size: 1.2rem;
          line-height: 1.8;
          color: #555;
        }

        .details-section {
          background: white;
          border-top: 3px solid #1f1f1f;
          padding: clamp(4rem, 8vh, 8rem) 5vw;
        }

        .content-wrapper {
          max-width: 1000px;
          margin: 0 auto;
        }

        .section-block {
          margin-bottom: 4rem;
        }

        .section-block h2 {
          font-family: "Brushed", "Georgia", serif;
          font-size: 2rem;
          color: #1f1f1f;
          margin: 0 0 1.5rem 0;
          transform: rotate(-0.5deg);
        }

        .section-block p {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #555;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .feature-card {
          background: linear-gradient(135deg, #fef9e6 0%, #fff5d6 100%);
          border: 2px solid #1f1f1f;
          border-radius: 8px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.15);
        }

        .feature-card h3 {
          font-family: "Comic Sans MS", cursive;
          font-size: 1.2rem;
          margin: 0 0 0.75rem 0;
          color: #1f1f1f;
        }

        .feature-card p {
          font-size: 0.95rem;
          line-height: 1.5;
          color: #666;
          margin: 0;
        }

        .audience-list {
          list-style: none;
          padding: 0;
          margin: 1.5rem 0 0 0;
        }

        .audience-list li {
          font-size: 1.1rem;
          line-height: 2;
          color: #555;
          padding-left: 1.5rem;
          position: relative;
        }

        .audience-list li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #16a34a;
          font-weight: bold;
          font-size: 1.2rem;
        }

        .cta-section {
          text-align: center;
          padding: 3rem 2rem;
          background: linear-gradient(135deg, #fff4cc 0%, #ffe9a3 100%);
          border: 3px solid #1f1f1f;
          border-radius: 12px;
          margin-top: 4rem;
        }

        .cta-section h2 {
          font-family: "Brushed", "Georgia", serif;
          font-size: 2rem;
          margin: 0 0 1rem 0;
        }

        .cta-section p {
          font-size: 1.1rem;
          margin: 0 0 2rem 0;
          color: #555;
        }

        .cta-button {
          display: inline-block;
          background: #1f1f1f;
          color: #fff;
          padding: 1rem 2.5rem;
          border-radius: 50px;
          font-family: "Comic Sans MS", cursive;
          font-size: 1.1rem;
          font-weight: bold;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.2);
        }

        .cta-button:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 900px) {
          .back-button {
            top: 80px;
            left: 1rem;
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
          }

          .hero-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .hero-image {
            max-width: 200px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
