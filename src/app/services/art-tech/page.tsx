"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Sketch_Interface/Navbar";
import Footer from "@/components/Sketch_Interface/Footer";

export default function ArtTechServicePage() {
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
              <img src="/NPC/Camera.png" alt="Art & Tech Services" />
            </div>
            <div className="hero-text">
              <h1>Art & Tech Services</h1>
              <p className="tagline">Creative digital solutions</p>
              <p className="intro">
                Bridging creativity and technology. From interactive
                installations to digital art experiences, I create innovative
                solutions that engage and inspire audiences.
              </p>
            </div>
          </div>
        </section>

        <section className="details-section">
          <div className="content-wrapper">
            <div className="section-block">
              <h2>What You Get</h2>
              <p>
                A one-of-a-kind digital experience that captivates your audience
                and sets you apart. From concept to deployment, you receive
                fully custom solutions that blend art and technology seamlessly.
              </p>
            </div>

            <div className="section-block">
              <h2>Your Deliverables</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <h3>🎨 Interactive Installations</h3>
                  <p>
                    <strong>You receive:</strong> Fully functional
                    motion-responsive art, touch interfaces, and immersive
                    exhibits ready to engage visitors
                  </p>
                </div>

                <div className="feature-card">
                  <h3>💻 Digital AI Art & Animation</h3>
                  <p>
                    <strong>You receive:</strong> High-resolution generative
                    art, data visualizations, and animations in your preferred
                    format
                  </p>
                </div>
                <div className="feature-card">
                  <h3>🌐 Custom Web Experiences</h3>
                  <p>
                    <strong>You receive:</strong> A fully responsive,
                    interactive website with hosting guidance and maintenance
                    instructions
                  </p>
                </div>
              </div>
            </div>

            <div className="section-block">
              <h2>What&apos;s Included</h2>
              <ul className="audience-list">
                <li>
                  Initial consultation to understand your vision and goals
                </li>
                <li>Concept sketches and prototypes for feedback</li>
                <li>Fully developed and tested final product</li>
                <li>Complete source code and assets</li>
                <li>Branding and design compliance</li>
                <li>Post-launch support and troubleshooting</li>
              </ul>
            </div>

            <div className="cta-section">
              <h2>Ready to Create Something Unique?</h2>
              <p>
                Let&apos;s discuss your project and bring your vision to life.
              </p>
              <a className="cta-button">
                <Link href="/#contact" className="cta-button">
                  Get in Touch →
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
