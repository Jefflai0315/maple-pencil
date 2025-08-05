"use client";

import { useState } from "react";

export default function ContactNote() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    mobile: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{
    submitted: boolean;
    success: boolean;
    message: string;
  }>({
    submitted: false,
    success: false,
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to submit to Google Sheets
  const submitToGoogleSheets = async () => {
    try {
      const formPayload = {
        ...formData,
        source: "ContactNote",
        timestamp: new Date().toISOString(),
      };

      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Form submission error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          errorData.message ||
            `Failed to submit form: ${response.status} ${response.statusText}`
        );
      }

      return true;
    } catch (error) {
      console.error("Error submitting to Google Sheets:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.message) {
        setFormStatus({
          submitted: false,
          success: false,
          message: "Please fill in all required fields.",
        });
        return;
      }

      // Submit to Google Sheets
      const submissionSuccess = await submitToGoogleSheets();

      if (submissionSuccess) {
        // Reset form on success
        setFormData({
          name: "",
          email: "",
          message: "",
          mobile: "",
        });

        // Set success message
        setFormStatus({
          submitted: true,
          success: true,
          message: "Sent! I will get back to you soon.",
        });
      } else {
        // Set error message if submission fails
        setFormStatus({
          submitted: false,
          success: false,
          message:
            "Failed to send your message. Please try again or contact me directly.",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormStatus({
        submitted: false,
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="wrap">
      <div className="note-container">
        {/* Note background - behind */}
        <div className="note-background">
          <img src="/sketch/note.png" alt="" aria-hidden />
        </div>

        {/* Form content - in front */}
        <div className="form-content">
          <form className="form" onSubmit={handleSubmit}>
            {/* Tooltip for send button */}
            <div className="send-tooltip">
              <span>click to send!</span>
            </div>
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your name"
              required
            />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Your email"
              required
            />
            <input
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Your mobile number"
              required
            />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Tell me about your idea…"
              rows={4}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="send-button"
            >
              <img
                src="/sketch/send_a_note.png"
                alt="Send note"
                className="send-icon"
              />
              {isSubmitting && <span className="sending-text">Sending...</span>}
            </button>
          </form>

          {formStatus.message && (
            <div
              className={`status-message ${
                formStatus.success ? "success" : "error"
              }`}
            >
              {formStatus.message}
            </div>
          )}
        </div>
      </div>
      <div className="info">
        <div>
          <strong>Country:</strong> Singapore
        </div>
        <div>
          <strong>Email:</strong>{" "}
          <a href="mailto:playingwithpencil@gmail.com">
            <u>playingwithpencil@gmail.com</u>
          </a>
        </div>
        <div>
          <strong>Instagram:</strong>{" "}
          <a href="https://www.instagram.com/playingwithpencil" target="_blank">
            DM <u>@playingwithpencil</u>
          </a>
        </div>
      </div>
      <style jsx>{`
        .wrap {
          padding: 60px 5vw 100px;
          display: grid;
          gap: 20rem;
          font-family: "Caveat", cursive;
          --note-height: clamp(600px, 70vh, 800px);
          --info-height: clamp(120px, 15vh, 200px);
          min-height: calc(var(--note-height) + var(--info-height) + 4rem);
          position: relative;
        }
        .note-container {
          position: relative;
          width: min(960px, 94vw);
          margin: 0 auto;
          min-height: var(--note-height);
          --note-width: min(960px, 94vw);
          --send-button-size: calc(var(--note-width));
        }
        .note-background {
          position: absolute;
          inset: 0;
          z-index: 1;
          width: calc(100% + 250px);
          left: -80px;
          top: -65px;
        }
        .note-background img {
          width: 100%;
          max-width: 1200px;
          height: auto;
          display: block;
          filter: drop-shadow(0 8px 24px #0001);
          object-fit: contain;
        }
        .form-content {
          width: 70%;
          top: 20%;
          left: 10%;
          position: relative;
          z-index: 10;
          align-self: flex-start;
          border-radius: 16px;
          transform: rotate(-10deg);
        }
        h3 {
          margin: 0 0 1rem;
          font-family: "Caveat", cursive;
          font-size: 2rem;
          font-weight: 700;
          color: #1f1f1f;
          text-align: center;
        }
        .info {
          display: grid;
          gap: 0.5rem;
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
          color: #666;
          margin-top: 10rem;
          min-height: var(--info-height);
          align-self: end;
        }
        .info a {
          color: #1f1f1f;
          text-decoration: none;
          font-weight: 600;
        }
        .info a:hover {
          text-decoration: underline;
        }
        .form {
          display: grid;
          gap: 0.8rem;
        }
        input,
        textarea {
          width: 100%;
          border: 2px solid #1f1f1f;
          border-radius: 8px;
          padding: 0.75rem;
          background: #fff;
          font-family: inherit;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }
        input:focus,
        textarea:focus {
          outline: none;
          border-color: #ffd166;
          box-shadow: 0 0 0 3px rgba(255, 209, 102, 0.2);
          transform: translateY(-2px);
        }
        textarea {
          resize: vertical;
          min-height: 100px;
        }
        .send-button {
          position: absolute;
          bottom: calc(-1 * var(--send-button-size) * 0.9);
          left: calc(-1 * var(--send-button-size) * 0.45);
          width: var(--send-button-size);
          height: var(--send-button-size);
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(10deg);
        }

        .send-button:hover {
          transform: scale(1.1);
          filter: brightness(1.1);
        }

        .send-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .send-button:disabled:hover {
          transform: none;
          filter: none;
        }

        .send-icon {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .sending-text {
          position: absolute;
          bottom: calc(-1 * var(--send-button-size) * 0.4);
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.8rem;
          color: #1f1f1f;
          white-space: nowrap;
        }

        .send-tooltip {
          position: absolute;
          bottom: calc(-1 * var(--send-button-size) * 0.55);
          left: calc(var(--send-button-size) * 0.2);
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid #333;
          border-radius: 50px;
          padding: 8px 16px;
          font-family: "Comic Sans MS", "Bradley Hand", cursive;
          font-size: 12px;
          font-weight: bold;
          color: #333;
          white-space: nowrap;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          animation: subtleFloat 3s ease-in-out infinite;
          pointer-events: none;
        }

        .send-tooltip::before {
          content: "";
          position: absolute;
          top: -8px;
          left: 20%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-bottom: 8px solid #333;
        }

        @keyframes subtleFloat {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        .status-message {
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 8px;
          text-align: center;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .status-message.success {
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
          border: 2px solid #16a34a;
        }

        .status-message.error {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          border: 2px solid #dc2626;
        }
        @media (max-width: 700px) {
          .wrap {
            --note-height: clamp(500px, 60vh, 700px);
            --info-height: clamp(100px, 12vh, 150px);
            gap: 10rem;
          }
          .form-content {
            width: 80%;
            top: 10%;
          }
        }
        @media (max-width: 500px) {
          .wrap {
            --note-height: clamp(400px, 50vh, 600px);
            --info-height: clamp(80px, 10vh, 120px);
            gap: 5rem;
            padding: 40px 5vw 80px;
          }
          h3 {
            font-size: 1.5rem;
          }
          .form-content {
            width: 85%;
            top: 3%;
          }
        }
      `}</style>
    </section>
  );
}
