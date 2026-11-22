import { useEffect, useState } from "react";
import "./Subscription.css";

// Backend API base URL.
const API_URL = "http://localhost:8080/api/subscription";

// Read the JWT saved after login.
function getToken() {
  const storedToken =
    localStorage.getItem("token") ||
    localStorage.getItem("jwtToken") ||
    localStorage.getItem("authToken");

  if (!storedToken) return null;

  return storedToken.startsWith("Bearer ")
    ? storedToken.substring(7)
    : storedToken;
}

export default function Subscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingTrial, setStartingTrial] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch the logged-in user's subscription from the backend.
  async function fetchSubscription() {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Your session was not found. Please log in again.");
      }

      const response = await fetch(`${API_URL}/status`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load subscription.");
      }

      setSubscription(data);
    } catch (err) {
      setError(err.message || "Unable to load subscription details.");
    } finally {
      setLoading(false);
    }
  }

  // Load the current subscription when the page opens.
  useEffect(() => {
    fetchSubscription();
  }, []);

  // Request a trial for the currently authenticated user.
  async function handleStartTrial() {
    setStartingTrial(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please log in again to start your trial.");
      }

      const response = await fetch(`${API_URL}/start-trial`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not start your free trial.");
      }

      setSubscription(data);
      setSuccess("Your 7-day Premium trial has started!");
    } catch (err) {
      setError(err.message || "Unable to start the free trial.");
    } finally {
      setStartingTrial(false);
    }
  }

  // Display saved dates in the user's local timezone.
  function formatDate(value) {
    if (!value) return "Not started";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "Unavailable"
      : date.toLocaleString();
  }

  if (loading) {
    return (
      <section className="subscription-page">
        <div className="subscription-card">
          <p>Loading your subscription...</p>
        </div>
      </section>
    );
  }

  const plan = subscription?.plan || "FREE";
  const trialUsed = subscription?.trialUsed === true;
  const isTrial = plan === "TRIAL";
  const isPremium = plan === "PREMIUM";

  return (
    <section className="subscription-page">
      <div className="subscription-heading">
        <p className="subscription-eyebrow">NEXPREP AI MEMBERSHIP</p>
        <h1 className="subscription-brand-title">NexPrep AI</h1>
        <p className="subscription-brand-tagline">
          Prepare Smarter. Interview Better.
        </p>
        <h2>Subscription &amp; Plans</h2>
        <p>Choose the preparation experience that supports your next career step.</p>
      </div>

      {error && (
        <div className="subscription-alert subscription-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="subscription-alert subscription-success" role="status">
          {success}
        </div>
      )}

      <div className="subscription-current-card">
        <div>
          <span className="subscription-label">CURRENT PLAN</span>
          <h3>{plan === "TRIAL" ? "Premium Free Trial" : `${plan} Plan`}</h3>
          <p>
            {isTrial
              ? "You currently have trial access."
              : isPremium
                ? "Your paid Premium plan is active."
                : "You are currently using the Free plan."}
          </p>
        </div>

        <span className={`subscription-badge ${plan.toLowerCase()}`}>
          {plan}
        </span>
      </div>

      {isTrial && (
        <div className="subscription-details-card">
          <h3>Your trial details</h3>
          <div className="subscription-detail-row">
            <span>Trial started</span>
            <strong>{formatDate(subscription?.trialStartDate)}</strong>
          </div>
          <div className="subscription-detail-row">
            <span>Trial expires</span>
            <strong>{formatDate(subscription?.trialEndDate)}</strong>
          </div>
          <p className="subscription-note">
            Your trial is scheduled to end on the date shown above.
          </p>
        </div>
      )}

      <div className="subscription-plan-grid">
        <article className="subscription-plan-card">
          <span className="subscription-label">GET STARTED</span>
          <h3>Free</h3>
          <p className="subscription-price">₹0</p>

          <ul>
            <li>Resume skill analysis</li>
            <li>MCQ and coding assessments</li>
            <li>Skill gaps and recommendations</li>
            <li>Limited text practice</li>
          </ul>

          {plan === "FREE" && (
            <span className="subscription-current-label">Your current plan</span>
          )}
        </article>

        <article className="subscription-plan-card premium-plan">
          <span className="subscription-label">LEVEL UP YOUR PREPARATION</span>
          <h3>Premium</h3>
          <p className="subscription-price">Free trial</p>
          <p className="subscription-duration">7 days for eligible users</p>

          <ul>
            <li>AI mock interview practice</li>
            <li>Voice-based interview practice</li>
            <li>Resume and project-tailored questions</li>
            <li>Detailed feedback and analytics</li>
          </ul>

          {isTrial || isPremium ? (
            <span className="subscription-current-label">
              {isTrial ? "Trial active" : "Premium active"}
            </span>
          ) : (
            <button
              className="subscription-trial-button"
              onClick={handleStartTrial}
              disabled={startingTrial || trialUsed}
              type="button"
            >
              {startingTrial
                ? "Starting trial..."
                : trialUsed
                  ? "Free trial already used"
                  : "Start 7-Day Free Trial"}
            </button>
          )}

          <p className="subscription-note">
            No payment is collected by this trial button.
          </p>
        </article>
      </div>
    </section>
  );
}
