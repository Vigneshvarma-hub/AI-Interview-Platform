import React, { useState } from "react";

const API_BASE_URL = "http://localhost:8080/api/auth";

async function readResponse(response) {
  const text = await response.text();
  if (!text.trim()) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function EmailVerification({ email, onVerificationSuccess, onBackToLogin }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/email/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await readResponse(response);
      if (!response.ok) {
        throw new Error(data.message || data.error || "OTP verification failed.");
      }

      setMessage(
        data.message || "Email verified successfully. You can now log in."
      );
      setOtp("");
      window.setTimeout(() => onVerificationSuccess?.(), 1500);
    } catch (err) {
      setError(err.message || "Unable to verify email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setMessage("");
    setError("");

    try {
      setResending(true);
      const response = await fetch(`${API_BASE_URL}/email/resend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await readResponse(response);
      if (!response.ok) {
        throw new Error(data.message || data.error || "Unable to resend OTP.");
      }

      setMessage(data.message || "A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.message || "Unable to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card} aria-labelledby="verification-title">
        <div style={styles.brandMark} aria-hidden="true">
          <span style={styles.brandBolt}>ϟ</span>
        </div>

        <p style={styles.brandName}>NexPrep <span style={styles.brandAI}>AI</span></p>
        <p style={styles.tagline}>Prepare Smarter. Interview Better.</p>

        <div style={styles.iconCircle} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="27" height="27" fill="none">
            <path d="M4 7.5 12 13l8-5.5M5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-11A1.5 1.5 0 0 1 5.5 5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 id="verification-title" style={styles.heading}>Verify your email</h1>
        <p style={styles.description}>
          We sent a 6-digit verification code to
        </p>
        <p style={styles.email}>{email}</p>

        <form onSubmit={handleVerify}>
          <label htmlFor="verification-otp" style={styles.label}>Verification code</label>
          <input
            id="verification-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(event) => {
              setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            style={styles.otpInput}
            required
            aria-describedby={error ? "verification-error" : undefined}
          />

          {error && <p id="verification-error" role="alert" style={styles.error}>{error}</p>}
          {message && <p role="status" style={styles.success}>{message}</p>}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            style={{
              ...styles.primaryButton,
              opacity: loading || otp.length !== 6 ? 0.58 : 1,
              cursor: loading || otp.length !== 6 ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <div style={styles.resendArea}>
          <span style={styles.mutedText}>Didn't receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || loading}
            style={styles.textButton}
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
        </div>

        <button
          type="button"
          onClick={onBackToLogin}
          style={styles.backButton}
          disabled={loading || resending}
        >
          <span aria-hidden="true">←</span> Back to login
        </button>
      </section>
      <p style={styles.footer}>© {new Date().getFullYear()} NexPrep AI. All rights reserved.</p>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    boxSizing: "border-box",
    padding: "32px 18px",
    background: "radial-gradient(circle at 15% 10%, rgba(124, 58, 237, 0.12), transparent 32%), #f7f6fb",
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "430px",
    boxSizing: "border-box",
    padding: "34px 36px 30px",
    border: "1px solid #ece8f5",
    borderRadius: "22px",
    background: "#ffffff",
    boxShadow: "0 18px 55px rgba(31, 20, 61, 0.09)",
    textAlign: "center",
  },
  brandMark: {
    width: "46px",
    height: "46px",
    margin: "0 auto 10px",
    display: "grid",
    placeItems: "center",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #9333ea, #5b4bea)",
    boxShadow: "0 7px 18px rgba(108, 76, 255, 0.25)",
  },
  brandBolt: { color: "#fff", fontSize: "30px", lineHeight: 1, fontWeight: 800 },
  brandName: { margin: 0, color: "#17142b", fontSize: "21px", fontWeight: 800, letterSpacing: "-0.6px" },
  brandAI: { color: "#7c3aed" },
  tagline: { margin: "5px 0 25px", color: "#858096", fontSize: "11px", letterSpacing: "0.35px" },
  iconCircle: {
    width: "58px",
    height: "58px",
    margin: "0 auto 17px",
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    color: "#7045df",
    background: "#f1ebff",
  },
  heading: { margin: "0 0 9px", color: "#19162b", fontSize: "25px", fontWeight: 750, letterSpacing: "-0.7px" },
  description: { margin: 0, color: "#777387", fontSize: "14px", lineHeight: 1.6 },
  email: { margin: "7px 0 25px", color: "#4f32b7", fontSize: "14px", fontWeight: 700, overflowWrap: "anywhere" },
  label: { display: "block", marginBottom: "9px", color: "#383449", textAlign: "left", fontSize: "13px", fontWeight: 650 },
  otpInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 12px",
    border: "1px solid #dcd6eb",
    borderRadius: "11px",
    outlineColor: "#7c3aed",
    background: "#fdfcff",
    color: "#211b36",
    fontSize: "22px",
    fontWeight: 700,
    letterSpacing: "10px",
    textAlign: "center",
  },
  primaryButton: {
    width: "100%",
    marginTop: "17px",
    padding: "14px 16px",
    border: "none",
    borderRadius: "11px",
    background: "linear-gradient(100deg, #713be5, #5c4be8)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 700,
    boxShadow: "0 8px 18px rgba(108, 76, 255, 0.2)",
  },
  error: { margin: "12px 0 0", color: "#c62828", fontSize: "13px", lineHeight: 1.5, textAlign: "left" },
  success: { margin: "12px 0 0", color: "#16834a", fontSize: "13px", lineHeight: 1.5, textAlign: "left" },
  resendArea: { display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "5px", marginTop: "22px" },
  mutedText: { color: "#777387", fontSize: "13px" },
  textButton: { padding: "3px 4px", border: "none", background: "transparent", color: "#6738d4", fontSize: "13px", fontWeight: 700, cursor: "pointer" },
  backButton: { marginTop: "22px", padding: "8px 12px", border: "none", background: "transparent", color: "#686477", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
  footer: { margin: "18px 0 0", color: "#9a96a8", fontSize: "11px", textAlign: "center" },
};

export default EmailVerification;
