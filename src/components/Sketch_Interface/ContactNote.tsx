"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";

export default function ContactNote() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    mobile: "",
    couponCode: "",
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
        couponCode: formData.couponCode || "None",
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

  // Function to submit via email using EmailJS
  const submitViaEmail = async () => {
    try {
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
        mobile: formData.mobile || "Not provided",
        coupon_code: formData.couponCode || "None",
        source: "ContactNote - Home Page",
      };

      const emailResult = await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_USER_ID!
      );

      if (emailResult.status !== 200) {
        throw new Error("Email submission failed");
      }

      return true;
    } catch (error) {
      console.error("Error submitting via email:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({
      submitted: false,
      success: false,
      message: "",
    });
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

      // Submit to Google Sheets and Email
      const submissionSuccess = await submitToGoogleSheets();
      const emailSuccess = await submitViaEmail();

      if (submissionSuccess && emailSuccess) {
        // Reset form on success
        setFormData({
          name: "",
          email: "",
          message: "",
          mobile: "",
          couponCode: "",
        });

        // Set success message
        setFormStatus({
          submitted: true,
          success: true,
          message: "Sent! I will get back to you soon.",
        });
      } else {
        // Set error message if submission fails
        let errorMsg = "Failed to send your message. ";
        if (!submissionSuccess && !emailSuccess) {
          errorMsg += "Both Google Sheets and email submission failed.";
        } else if (!submissionSuccess) {
          errorMsg += "Google Sheets submission failed, but email was sent.";
        } else if (!emailSuccess) {
          errorMsg += "Email submission failed, but saved to Google Sheets.";
        }
        errorMsg += " Please try again or contact me directly.";

        setFormStatus({
          submitted: false,
          success: false,
          message: errorMsg,
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
      <div className="header">
        <h2>Contact Me</h2>
        <div className="underline-sketch">
          <svg viewBox="0 0 200 10" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 5 5 Q 50 2, 100 5 T 195 5"
              stroke="#2c2c2c"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

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
            <input
              name="couponCode"
              type="text"
              value={formData.couponCode}
              onChange={handleInputChange}
              placeholder="Coupon code (optional)"
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
              className={`send-button ${isSubmitting ? "sending" : ""}`}
            >
              {isSubmitting ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span className="sending-text">Sending...</span>
                </div>
              ) : (
                <img
                  src="/sketch/send_a_note.png"
                  alt="Send note"
                  className="send-icon"
                />
              )}
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

          font-family: "Caveat", cursive;
          --note-height: clamp(600px, 70vh, 800px);
          --info-height: clamp(120px, 15vh, 200px);
          min-height: calc(var(--note-height) + var(--info-height) + 4rem);
          position: relative;
        }
        .header {
          font-size: 2rem;
          align-self: center;
          font-family: "Brushed", "Georgia", serif;
          overflow-x: hidden;
          text-align: center;
        }
        .note-container {
          position: relative;
          width: min(780px, 90vw);
          margin: 0 auto;
          min-height: var(--note-height);
          --note-width: min(1000px, 90vw);
          --send-button-size: calc(var(--note-width) - 50vw);
        }
        .underline-sketch {
          width: clamp(150px, 30vw, 300px);
          margin: 0.5rem auto 0;
          opacity: 0.6;
        }
        .note-background {
          position: absolute;
          inset: 0;
          z-index: 1;
          width: calc(100% + 250px);
          left: -80px;
          top: -65px;
          transform: rotate(10deg);
        }
        .note-background img {
          width: 100%;
          max-width: 1200px;
          height: auto;
          display: block;
          filter: drop-shadow(0 8px 24px #0001);
          object-fit: contain;
          margin-top: 10vh;
        }
        .form-content {
          width: 70%;
          top: 18%;
          left: 8%;
          position: relative;
          z-index: 10;
          align-self: flex-start;
          border-radius: 16px;
          transform: rotate(0deg);
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
          margin-top: 30rem;
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
          gap: 1rem;
        }
        input,
        textarea {
          width: 100%;
          border: 2px solid #1f1f1f;
          border-radius: 8px;
          padding: 1rem 1.25rem;
          background: #fff;
          font-family: inherit;
          font-size: 1.1rem;
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
          min-height: 150px;
          line-height: 1.6;
        }
        .send-button {
          position: absolute;
          bottom: calc(-1 * var(--send-button-size) * 1.1);
          left: calc(-1 * var(--send-button-size) * 0.1);
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
          background-color: hsl(0, 0%, 100%);
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

        /* Loading state - clearer, centered, bigger */
        .send-button.sending {
          background: #fff;
        }
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 70%;
        }
        .spinner {
          width: 40%;
          aspect-ratio: 1 / 1;
          border: 6px solid #e5e7eb; /* light gray */
          border-top-color: #1f1f1f; /* brand/dark */
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
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
        /* When inside the button during sending, use centered bigger text */
        .send-button.sending .sending-text {
          position: static;
          transform: none;
          font-size: clamp(16px, 2.2vw, 22px);
          font-weight: 700;
        }

        .send-tooltip {
          position: absolute;
          bottom: calc(-1 * var(--send-button-size) * 1.1);
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
            --note-height: clamp(400px, 60vh, 500px);
            --info-height: clamp(100px, 12vh, 150px);
            gap: 10rem;
            margin-top: 5rem;
          }
          .form-content {
            width: 80%;
            top: 10%;
          }
        }
        @media (max-width: 500px) {
          .wrap {
            --note-height: clamp(350px, 50vh, 400px);
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
