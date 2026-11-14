import React, { useState } from "react";

function EmailVerification({
  email,
  onVerificationSuccess,
  onBackToLogin,
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Verify the OTP entered by the user.
  const handleVerify = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    // OTP must contain exactly 6 digits.
    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8080/api/auth/email/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            otp: otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "OTP verification failed."
        );
      }

      // Verification successful.
      setMessage(
        data.message ||
          "Email verified successfully. You can now log in."
      );

      setOtp("");

      // Wait for a short moment and return to login.
      setTimeout(() => {
        onVerificationSuccess();
      }, 1500);

    } catch (error) {
      setError(
        error.message ||
          "Unable to verify email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend a new OTP to the user's email.
  const handleResend = async () => {
    setMessage("");
    setError("");

    try {
      setResending(true);

      const response = await fetch(
        "http://localhost:8080/api/auth/email/resend",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to resend OTP."
        );
      }

      setMessage(
        data.message ||
          "A new OTP has been sent to your email."
      );

    } catch (error) {
      setError(
        error.message ||
          "Unable to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        background: "#f5f7fb",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          background: "#ffffff",
          padding: "35px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Page heading */}
        <h2
          style={{
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Verify Your Email
        </h2>

        {/* Description */}
        <p
          style={{
            textAlign: "center",
            color: "#666",
            lineHeight: "1.6",
            marginBottom: "25px",
          }}
        >
          We have sent a 6-digit verification OTP to:
        </p>

        {/* User email */}
        <p
          style={{
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: "25px",
            wordBreak: "break-word",
          }}
        >
          {email}
        </p>

        {/* OTP form */}
        <form onSubmit={handleVerify}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
            }}
          >
            Enter OTP
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength="6"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(event) => {
              // Allow only numbers.
              const value = event.target.value.replace(
                /\D/g,
                ""
              );

              setOtp(value);
              setError("");
            }}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "18px",
              textAlign: "center",
              letterSpacing: "5px",
              outline: "none",
              marginBottom: "15px",
            }}
            required
          />

          {/* Error message */}
          {error && (
            <p
              style={{
                color: "#d93025",
                fontSize: "14px",
                marginBottom: "15px",
              }}
            >
              {error}
            </p>
          )}

          {/* Success message */}
          {message && (
            <p
              style={{
                color: "#188038",
                fontSize: "14px",
                marginBottom: "15px",
              }}
            >
              {message}
            </p>
          )}

          {/* Verify button */}
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              background:
                loading || otp.length !== 6
                  ? "#aaa"
                  : "#2563eb",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "600",
              cursor:
                loading || otp.length !== 6
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {/* Resend OTP */}
        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          <p
            style={{
              marginBottom: "8px",
              color: "#666",
              fontSize: "14px",
            }}
          >
            Didn't receive the OTP?
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            style={{
              border: "none",
              background: "transparent",
              color: "#2563eb",
              fontWeight: "600",
              cursor: resending
                ? "not-allowed"
                : "pointer",
              fontSize: "14px",
            }}
          >
            {resending ? "Sending..." : "Resend OTP"}
          </button>
        </div>

        {/* Back to login */}
        <div
          style={{
            textAlign: "center",
            marginTop: "25px",
          }}
        >
          <button
            type="button"
            onClick={onBackToLogin}
            style={{
              border: "none",
              background: "transparent",
              color: "#555",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailVerification;