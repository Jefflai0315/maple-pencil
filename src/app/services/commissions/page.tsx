"use client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Sketch_Interface/Navbar";
import Footer from "@/components/Sketch_Interface/Footer";
import Sketchbook from "@/components/Sketch_Interface/Sketchbook";
import Link from "next/link";

export default function CommissionsServicePage() {
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
              <img src="/sketch/face.png" alt="Commission Sketches" />
            </div>
            <div className="hero-text">
              <h1>Commission Sketches</h1>
              <p className="tagline">Personal portraits & artwork</p>
              <p className="intro">
                Get a unique hand-drawn portrait or custom artwork. Perfect for
                gifts, keepsakes, or personal collections. Available in various
                styles and sizes to suit your needs.
              </p>
            </div>
          </div>
        </section>
        <Sketchbook />

        <section className="details-section">
          <div className="content-wrapper">
            <div className="section-block">
              <h2>What You Receive</h2>
              <p>
                A unique, hand-crafted artwork created specifically for you.
                Each commission is an original piece tailored to your
                vision—perfect as a heartfelt gift, personal keepsake, or
                meaningful addition to your collection.
              </p>
            </div>

            <div className="section-block">
              <h2>Your Options</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <h3>⚡ Quick Sketch Portrait</h3>
                  <p>
                    <strong>You receive:</strong> An expressive, loose-style
                    sketch capturing personality and energy—perfect for casual
                    gifts or fun keepsakes
                    <br />
                    <em>Delivered in 5-10 minutes per sketch</em>
                  </p>
                </div>
                <div className="feature-card">
                  <h3>✨ Detailed Portrait</h3>
                  <p>
                    <strong>You receive:</strong> A refined, carefully shaded
                    portrait with texture and finishing touches—premium quality
                    for special occasions
                    <br />
                    <em>Delivered in 30+ minutes per portrait</em>
                  </p>
                </div>
                <div className="feature-card">
                  <h3>🐾 Pet Portrait</h3>
                  <p>
                    <strong>You receive:</strong> A charming sketch capturing
                    your pet&apos;s unique personality and spirit—a treasure for
                    any pet lover
                    <br />
                    <em>Delivered in 20-40 minutes</em>
                  </p>
                </div>
                <div className="feature-card">
                  <h3>🎨 Custom Illustration</h3>
                  <p>
                    <strong>You receive:</strong> Original artwork for any
                    purpose—logos, book covers, invitations, or personal
                    projects
                    <br />
                    <em>Timeline varies by complexity</em>
                  </p>
                </div>
                <div className="feature-card">
                  <h3>📱 Flexible Delivery</h3>
                  <p>
                    <strong>You receive:</strong> High-resolution digital files,
                    physical prints, or both—with optional professional framing
                  </p>
                </div>
              </div>
            </div>

            <div className="section-block">
              <h2>How It Works</h2>
              <div className="process-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Share Your Vision</h3>
                    <p>
                      Send me reference photos and tell me about the style,
                      size, and purpose of your commission.
                    </p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Get a Quote</h3>
                    <p>
                      I&apos;ll provide a timeline and pricing based on your
                      requirements.
                    </p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>I Create Your Art</h3>
                    <p>
                      Once confirmed, I&apos;ll start sketching. You&apos;ll get
                      progress updates along the way.
                    </p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h3>Receive Your Artwork</h3>
                    <p>
                      Get your finished piece delivered digitally or physically,
                      ready to display or gift!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="cta-section">
              <h2>Ready to Commission Your Portrait?</h2>
              <p>
                Let&apos;s create something special together. Reach out to get
                started!
              </p>

              <a className="cta-button">
                <Link href="/#contact" className="cta-button">
                  Request a Commission →
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

        .process-steps {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-top: 2rem;
        }

        .step {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }

        .step-number {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #fff4cc 0%, #ffe9a3 100%);
          border: 2px solid #1f1f1f;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Brushed", "Georgia", serif;
          font-size: 1.5rem;
          font-weight: bold;
          color: #1f1f1f;
        }

        .step-content h3 {
          font-family: "Comic Sans MS", cursive;
          font-size: 1.3rem;
          margin: 0 0 0.5rem 0;
          color: #1f1f1f;
        }

        .step-content p {
          font-size: 1rem;
          line-height: 1.6;
          color: #666;
          margin: 0;
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
