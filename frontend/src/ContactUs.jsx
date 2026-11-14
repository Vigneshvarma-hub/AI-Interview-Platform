
import { useState } from "react";
import "./ContactUs.css";

export default function ContactUs() {
  // Store all contact form fields in one state object.
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Update the field that the user edits.
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Submit the form to the Spring Boot backend.
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

      // Clear the form after successful submission.
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
          <span className="contact-us-label">GET IN TOUCH</span>
          <h2>Contact Us</h2>
          <p>
            Have a question about NexPrep AI? Send us a message and
            we will get back to you.
          </p>
        </div>

        <form className="contact-us-form" onSubmit={handleSubmit}>
          <div className="contact-us-field">
            <label htmlFor="contact-name">Full Name</label>
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
            <label htmlFor="contact-email">Email Address</label>
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
              placeholder="How can we help?"
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
              placeholder="Write your message here..."
              value={formData.message}
              onChange={handleChange}
              maxLength={5000}
              rows={5}
              required
            />
          </div>

          {feedback && (
            <p
              className={`contact-us-feedback ${feedback.type}`}
              role="status"
            >
              {feedback.text}
            </p>
          )}

          <button
            className="contact-us-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}
