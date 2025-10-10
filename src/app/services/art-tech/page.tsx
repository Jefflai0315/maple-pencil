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

            <div className="section-block">
              <div id="casestudy" className="case-studies-section">
                <h2>🎯 Case Studies</h2>
                <p className="case-studies-intro">
                  Real projects showcasing how art and technology come together
                  to create memorable experiences for clients and participants.
                </p>
                <div className="case-study-item bazgym-card">
                  <h3>✨ BazGym Interactive Art Experience</h3>
                  <p className="case-study-intro">
                    Transforming gym workouts into digital art masterpieces!
                    Members strike their best poses, bring sketches to life with
                    colors, and walk away with personalized animated keepsakes
                    that celebrate their fitness journey.
                  </p>

                  <div className="event-poster">
                    <img
                      src="/Bazgym/poster.jpg"
                      alt="BazGym Interactive Art Experience Event Poster"
                      className="poster-image"
                    />
                  </div>

                  <div className="case-study-content">
                    <div className="event-gallery">
                      <h3>📸 Behind the Scenes</h3>
                      <div className="gallery-grid">
                        <div className="gallery-item">
                          <img
                            src="/Bazgym/highlight1.jpg"
                            alt="Setup and scene preparation"
                          />
                          <p>Setting the stage for creativity</p>
                        </div>
                        <div className="gallery-item">
                          <img
                            src="/Bazgym/highlight2.jpg"
                            alt="Reaction to the animation"
                          />
                          <p>Pure joy and amazement</p>
                        </div>
                        <div className="gallery-item">
                          <img
                            src="/Bazgym/highlight3.jpg"
                            alt="Creative coloring session"
                          />
                          <p>Artistry in action</p>
                        </div>
                        <div className="gallery-item">
                          <img
                            src="/Bazgym/highlight4.jpg"
                            alt="Participants with their digital animations"
                          />
                          <p>Proud creators with their masterpieces</p>
                        </div>
                      </div>
                    </div>

                    <div className="sample-work">
                      <h3>🎬 Animation Showcase</h3>
                      <div className="work-stripe">
                        <div className="work-item">
                          <img
                            src="/Bazgym/sample1.gif"
                            alt="Sample animation 1"
                          />
                        </div>
                        <div className="work-item">
                          <img
                            src="/Bazgym/sample2.gif"
                            alt="Sample animation 2"
                          />
                        </div>
                        <div className="work-item">
                          <img
                            src="/Bazgym/sample3.gif"
                            alt="Sample animation 3"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>{" "}
                {/* End case-study-item */}
                {/* Future case studies - use different card styles:
                  <div className="case-study-item corporate-card">
                  <div className="case-study-item creative-card">
                  <div className="case-study-item tech-card">
                  <div className="case-study-item event-card">
              */}
              </div>
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

        /* Case Studies Styles */
        .case-studies-section {
          margin: 4rem 0;
          scroll-margin-top: 100px; /* Account for sticky navbar */
        }

        .case-studies-intro {
          font-size: 1.2rem;
          line-height: 1.8;
          color: #555;
          text-align: center;
          margin-bottom: 3rem;
          font-style: italic;
        }

        .case-study-item {
          background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
          border: 3px solid #1f1f1f;
          border-radius: 12px;
          padding: 4rem;
          margin: 3rem 0;
        }

        .case-study-item h3 {
          font-family: "Brushed", "Georgia", serif;
          font-size: 1.8rem;
          color: #1f1f1f;
          margin: 0 0 1.5rem 0;
          transform: rotate(-0.5deg);
        }

        /* Different Card Styles for Different Case Studies */
        .bazgym-card {
          background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
          border: 3px solid #1f1f1f;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
        }

        .bazgym-card::before {
          content: "💪";
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 2rem;
          opacity: 0.3;
        }

        /* Future case study card styles */
        .corporate-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 3px solid #495057;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
        }

        .corporate-card::before {
          content: "🏢";
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 2rem;
          opacity: 0.3;
        }

        .creative-card {
          background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
          border: 3px solid #e53e3e;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
        }

        .creative-card::before {
          content: "🎨";
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 2rem;
          opacity: 0.3;
        }

        .tech-card {
          background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
          border: 3px solid #38a169;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }

        .tech-card::before {
          content: "⚡";
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 2rem;
          opacity: 0.3;
        }

        .event-card {
          background: linear-gradient(135deg, #fef5e7 0%, #fbd38d 100%);
          border: 3px solid #dd6b20;
          border-radius: 24px;
          position: relative;
          overflow: hidden;
        }

        .event-card::before {
          content: "🎉";
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 2rem;
          opacity: 0.3;
        }

        .case-study-intro {
          font-size: 1.2rem;
          line-height: 1.8;
          color: #555;
          text-align: left;
          margin-bottom: 2rem;
          font-style: italic;
        }

        .event-poster {
          text-align: center;
          margin: 2rem 0 3rem 0;
          /* center the children */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .poster-image {
          max-width: 100%;
          max-height: 500px;
          width: auto;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          border: 3px solid #1f1f1f;
          transition: transform 0.3s ease;
        }

        .poster-image:hover {
          transform: scale(1.02);
        }

        .process-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .step {
          text-align: center;
          background: white;
          border: 2px solid #1f1f1f;
          border-radius: 8px;
          padding: 2rem 1rem;
          transition: all 0.3s ease;
        }

        .step:hover {
          transform: translateY(-4px);
          box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.15);
        }

        .step-number {
          width: 50px;
          height: 50px;
          background: #1f1f1f;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Comic Sans MS", cursive;
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0 auto 1rem;
        }

        .step h3 {
          font-family: "Comic Sans MS", cursive;
          font-size: 1.3rem;
          margin: 0 0 0.75rem 0;
          color: #1f1f1f;
        }

        .step p {
          font-size: 0.95rem;
          line-height: 1.5;
          color: #666;
          margin: 0;
        }

        .event-gallery {
          margin-bottom: 4rem;
        }

        .event-gallery h3,
        .sample-work h3 {
          font-family: "Brushed", "Georgia", serif;
          font-size: 1.8rem;
          color: #1f1f1f;
          margin: 0 0 2rem 0;
          text-align: center;
          transform: rotate(-0.5deg);
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .gallery-item {
          background: white;
          border: 2px solid #1f1f1f;
          border-radius: 8px;
          padding: 1rem;
          transition: all 0.3s ease;
        }

        .gallery-item:hover {
          transform: translateY(-4px);
          box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.15);
        }

        .gallery-item img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 4px;
          margin-bottom: 0.75rem;
        }

        .gallery-item p {
          font-size: 0.9rem;
          color: #666;
          text-align: center;
          margin: 0;
          font-family: "Comic Sans MS", cursive;
        }

        .sample-work {
          background: white;
          border: 2px solid #1f1f1f;
          border-radius: 8px;
          padding: 2rem;
        }

        .work-stripe {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .work-item {
          aspect-ratio: 1;
          overflow: hidden;
          border-radius: 4px;
          border: 1px solid #ddd;
        }

        .work-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .work-item:hover img {
          transform: scale(1.05);
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

          .case-study-section {
            padding: 2rem 1rem;
            margin: 2rem 0;
          }
          .case-study-item {
            padding: 2rem;
          }

          .process-steps {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .gallery-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
          }

          .work-stripe {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </>
  );
}
