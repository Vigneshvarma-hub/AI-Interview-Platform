import { useState } from "react";
import "./ContactUs.css";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("http://localhost:8080/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to submit your message. Please try again."
        );
      }

      setFeedback({
        type: "success",
        text: result.message || "Your message has been received.",
      });

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error.message ||
          "Unable to connect to the server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="contact-us" id="contact">
      <div className="contact-us-container">
        <div className="contact-us-heading">
          <span className="contact-us-label">WE'RE HERE TO HELP</span>
          <h2>Let’s talk.</h2>
          <p>
            Have a question about NexPrep AI? Tell us what you need and our
            team will get back to you.
          </p>
        </div>

        <div className="contact-us-layout">
          <aside className="contact-us-intro">
            <div className="contact-us-orb" aria-hidden="true">
              <span>✦</span>
            </div>
            <p className="contact-us-eyebrow">NEXPREP AI SUPPORT</p>
            <h3>Every great career move starts with a conversation.</h3>
            <p className="contact-us-intro-copy">
              Share your question, feedback, or issue. We’re listening.
            </p>
            <div className="contact-us-points">
              <div className="contact-us-point">
                <span className="contact-us-point-icon">✉</span>
                <span>
                  <strong>Questions & feedback</strong>
                  <small>We value what you have to say.</small>
                </span>
              </div>
              <div className="contact-us-point">
                <span className="contact-us-point-icon">↗</span>
                <span>
                  <strong>Product support</strong>
                  <small>Tell us where you need a hand.</small>
                </span>
              </div>
            </div>
          </aside>

          <form className="contact-us-form" onSubmit={handleSubmit}>
            <div className="contact-us-form-heading">
              <h3>Send us a message</h3>
              <p>Fill in the details below and we’ll take it from there.</p>
            </div>

            <div className="contact-us-field">
              <label htmlFor="contact-name">Full name</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                maxLength={100}
                autoComplete="name"
                required
              />
            </div>

            <div className="contact-us-field">
              <label htmlFor="contact-email">Email address</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                maxLength={150}
                autoComplete="email"
                required
              />
            </div>

            <div className="contact-us-field">
              <label htmlFor="contact-subject">Subject</label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                placeholder="What can we help you with?"
                value={formData.subject}
                onChange={handleChange}
                maxLength={200}
                required
              />
            </div>

            <div className="contact-us-field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                placeholder="Add a few details so we can help..."
                value={formData.message}
                onChange={handleChange}
                maxLength={5000}
                rows={5}
                required
              />
              <span className="contact-us-character-count">
                {formData.message.length}/5000
              </span>
            </div>

            {feedback && (
              <p
                className={`contact-us-feedback ${feedback.type}`}
                role="status"
                aria-live="polite"
              >
                {feedback.text}
              </p>
            )}

            <button
              className="contact-us-submit"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? "Sending your message..." : "Send message"}</span>
              {!loading && <span aria-hidden="true">↗</span>}
            </button>
            <p className="contact-us-privacy">
              Your details are used only to respond to your message.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
