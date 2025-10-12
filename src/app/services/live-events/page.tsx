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

            <div className="section-block">
              <div id="casestudy" className="case-studies-section">
                <h2>🎯 Case Studies</h2>
                <p className="case-studies-intro">
                  Real events showcasing how live sketch booths create memorable
                  experiences for communities and special occasions.
                </p>
                <div className="case-study-item event-card">
                  <h3>🌙 Lakepoint Condo Mid-Autumn Festival</h3>
                  <p className="case-study-intro">
                    A heartwarming community event at Singapore&apos;s oldest
                    condominium, where I spent 2 hours capturing the joy and
                    spirit of residents celebrating Mid-Autumn Festival
                    together, including some surprise VIP guests!
                  </p>

                  <div className="case-study-content">
                    <div className="event-gallery">
                      <h3>📸 Community Moments</h3>
                      <div className="gallery-grid">
                        <div className="gallery-item">
                          <img
                            src="/Lakepoint/drawing_little_one.jpg"
                            alt="Drawing a little one at the festival"
                          />
                          <p>Drawing a little one at the festival</p>
                        </div>
                        <div className="gallery-item">
                          <img
                            src="/Lakepoint/drawing_resident.jpg"
                            alt="Residents enjoying the sketching experience"
                          />
                          <p>Residents getting their portraits done</p>
                        </div>
                        <div className="gallery-item">
                          <img
                            src="/Lakepoint/surprise_vip.jpg"
                            alt="Surprise VIP guest at the event"
                          />
                          <p>Surprise VIP guest appearance!</p>
                        </div>
                        <div className="gallery-item">
                          <img
                            src="/Lakepoint/surprise_family.jpg"
                            alt="Community celebrating together"
                          />
                          <p>Community celebrating together</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3>🎬 VIP Guest Special Moment</h3>
                      <p className="vip-intro">
                        The surprise VIP guest was such a hit! Here&apos;s the
                        live sketch process and the final animated result that
                        had everyone amazed.
                      </p>
                      <div className="vip-media-container">
                        <div className="vip-video">
                          <h4>📹 Live Sketching Process</h4>
                          <video
                            controls
                            autoPlay
                            muted
                            loop
                            className="vip-video-player"
                            poster="/Lakepoint/surprise_vip.jpg"
                          >
                            <source
                              src="/Lakepoint/surprise_vip.mov"
                              type="video/mp4"
                            />
                            <source
                              src="/Lakepoint/surprise_vip.mov"
                              type="video/quicktime"
                            />
                            Your browser does not support the video tag.
                          </video>
                          <p>
                            Watch the live sketching process of our surprise VIP
                            guest
                          </p>
                        </div>
                        <div className="vip-gif">
                          <h4>✨ Animated Result</h4>
                          <img
                            src="/Lakepoint/surprise_vip_sketch.gif"
                            alt="Animated sketch of surprise VIP guest"
                            className="vip-gif-image"
                          />
                          <p>
                            The final animated sketch that delighted everyone!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="sample-work">
                      <h3>🎨 Live Sketch Collection</h3>
                      <div className="work-stripe">
                        <div className="work-item">
                          <img
                            src="/Lakepoint/sample1.jpg"
                            alt="Resident portrait sketch 1"
                          />
                        </div>
                        <div className="work-item">
                          <img
                            src="/Lakepoint/sample2.jpg"
                            alt="Resident portrait sketch 2"
                          />
                        </div>
                        <div className="work-item">
                          <img
                            src="/Lakepoint/sample3.jpg"
                            alt="Resident portrait sketch 3"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="event-details">
                      <h3>🏘️ Event Highlights</h3>
                      <div className="details-grid">
                        <div className="detail-item">
                          <h4>📍 Location</h4>
                          <p>
                            Lakepoint Condo - Singapore&apos;s Oldest
                            Condominium
                          </p>
                        </div>
                        <div className="detail-item">
                          <h4>⏰ Duration</h4>
                          <p>2 Hours of Live Sketching</p>
                        </div>
                        <div className="detail-item">
                          <h4>👥 Participants</h4>
                          <p>Residents + Surprise VIP Guests</p>
                        </div>
                        <div className="detail-item">
                          <h4>🎊 Occasion</h4>
                          <p>Mid-Autumn Festival Community Celebration</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>{" "}
                {/* End Lakepoint case-study-item */}
              </div>
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
          background: linear-gradient(135deg, #fef5e7 0%, #fbd38d 100%);
          border: 3px solid #dd6b20;
          border-radius: 24px;
          padding: 3rem;
          margin: 3rem 0;
          position: relative;
          overflow: hidden;
        }

        .case-study-item::before {
          content: "🎉";
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 2rem;
          opacity: 0.3;
        }

        .case-study-item h3 {
          font-family: "Brushed", "Georgia", serif;
          font-size: 1.8rem;
          color: #1f1f1f;
          margin: 0 0 1.5rem 0;
          transform: rotate(-0.5deg);
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

        .event-gallery {
          margin-bottom: 4rem;
        }

        .event-gallery h3,
        .sample-work h3,
        .event-details h3 {
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

        .event-details {
          background: white;
          border: 2px solid #1f1f1f;
          border-radius: 8px;
          padding: 2rem;
          margin-top: 2rem;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .detail-item {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .detail-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .detail-item h4 {
          font-family: "Comic Sans MS", cursive;
          font-size: 1.1rem;
          color: #1f1f1f;
          margin: 0 0 0.5rem 0;
          font-weight: bold;
        }

        .detail-item p {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
          line-height: 1.4;
        }

        /* VIP Highlight Section */

        .vip-highlight::before {
          content: "⭐";
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 2rem;
          opacity: 0.3;
        }

        .vip-highlight h3 {
          font-family: "Brushed", "Georgia", serif;
          font-size: 1.8rem;
          color: #1f1f1f;
          margin: 0 0 1rem 0;
          text-align: center;
          transform: rotate(-0.5deg);
        }

        .vip-intro {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #555;
          text-align: center;
          margin-bottom: 2rem;
          font-style: italic;
        }

        .vip-media-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: start;
        }

        .vip-video,
        .vip-gif {
          background: white;
          border: 2px solid #1f1f1f;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .vip-video h4,
        .vip-gif h4 {
          font-family: "Comic Sans MS", cursive;
          font-size: 1.2rem;
          color: #1f1f1f;
          margin: 0 0 1rem 0;
          font-weight: bold;
        }

        .vip-video-player {
          width: 100%;
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          border: 1px solid #ddd;
          margin-bottom: 1rem;
        }

        .vip-gif-image {
          width: 100%;
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          border: 1px solid #ddd;
          margin-bottom: 1rem;
        }

        .vip-video p,
        .vip-gif p {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
          font-style: italic;
        }

        @media (max-width: 900px) {
          .vip-media-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        @media (max-width: 900px) {
          .case-study-item {
            padding: 1.5rem;
          }
          .work-stripe {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
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
