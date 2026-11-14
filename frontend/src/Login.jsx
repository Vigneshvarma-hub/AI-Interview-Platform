
import { useState } from "react";
import EmailVerification from "./EmailVerification";

const API_BASE_URL = "http://localhost:8080/api/auth";

function Login({ onLoginSuccess }) {
  // Existing login, registration, and email-verification screens.
  const [isRegistering, setIsRegistering] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  // Forgot Password stages: email -> otp -> password.
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStage, setResetStage] = useState("email");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Existing form fields.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Error, success, and loading messages.
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Existing registration password rules.
  const passwordRules = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const passwordsMatch =
    password.length > 0 && password === confirmPassword;

  // Read the backend response safely, including non-JSON errors.
  async function readResponse(response) {
    const text = await response.text();

    if (!text.trim()) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  // Existing login functionality.
  async function handleLogin(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Login failed. Status: ${response.status}`
        );
      }

      const token = data.token || data.jwtToken;

      if (!token) {
        throw new Error("JWT token not received from backend.");
      }

      // Preserve the existing authentication storage keys.
      localStorage.setItem("token", token);

      const role = data.role || "USER";
      localStorage.setItem("role", role);

      if (data.userId !== undefined && data.userId !== null) {
        localStorage.setItem("userId", String(data.userId));
      }

      const normalizedEmail = email.trim().toLowerCase();
      const loggedInName = data.name || normalizedEmail.split("@")[0];

      localStorage.setItem("userName", loggedInName);
      localStorage.setItem(
        "userEmail",
        data.email || normalizedEmail
      );

      // Tell the parent app that login succeeded.
      onLoginSuccess(role);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Something went wrong during login.");
    } finally {
      setLoading(false);
    }
  }

  // Existing registration functionality.
  async function handleRegister(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!isPasswordValid) {
        throw new Error(
          "Password must contain at least 8 characters, including uppercase, lowercase, a number, and a special character."
        );
      }

      if (!passwordsMatch) {
        throw new Error("Password and confirm password do not match.");
      }

      const normalizedEmail = email.trim().toLowerCase();

      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: normalizedEmail,
          password,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Registration failed. Status: ${response.status}`
        );
      }

      setEmail(normalizedEmail);
      setShowEmailVerification(true);

      // Clear registration password fields after successful registration.
      setPassword("");
      setConfirmPassword("");
      setName("");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Something went wrong during registration.");
    } finally {
      setLoading(false);
    }
  }

  // Return to login after successful email verification.
  function handleVerificationSuccess() {
    setShowEmailVerification(false);
    setIsRegistering(false);
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("Email verified successfully! Please log in.");
  }

  // Return from the email-verification screen.
  function handleBackToLogin() {
    setShowEmailVerification(false);
    setIsRegistering(false);
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("Please verify your email before logging in.");
  }

  // Open the existing email-verification screen.
  function handleOpenVerification() {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your registered email first.");
      return;
    }

    setShowEmailVerification(true);
  }

  // Switch between existing login and registration screens.
  function switchForm() {
    setIsRegistering((previous) => !previous);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  }

  // Open the Forgot Password screen.
  function openForgotPassword() {
    setShowForgotPassword(true);
    setResetStage("email");
    setResetOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setError("");
    setSuccess("");
  }

  // Send a password-reset OTP to the entered email.
  async function handleForgotPassword(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to request a password reset."
        );
      }

      // Continue to OTP entry after the backend accepts the request.
      setResetStage("otp");
      setSuccess(
        data.message ||
          "If an account exists for that email, a reset OTP can be sent."
      );
    } catch (err) {
      console.error("Forgot Password error:", err);
      setError(err.message || "Could not request a reset OTP.");
    } finally {
      setLoading(false);
    }
  }

  // Verify the password-reset OTP.
  async function handleVerifyResetOtp(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_BASE_URL}/verify-reset-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp: resetOtp.trim(),
          }),
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed.");
      }

      setResetStage("password");
      setSuccess("OTP verified. Please create your new password.");
    } catch (err) {
      console.error("Reset OTP verification error:", err);
      setError(err.message || "Could not verify the OTP.");
    } finally {
      setLoading(false);
    }
  }

  // Save the new password. The backend must validate the OTP again.
  async function handleResetPassword(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (newPassword.length < 8 || newPassword.length > 72) {
      setError("Password must contain between 8 and 72 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp: resetOtp.trim(),
            newPassword,
          }),
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Password reset failed.");
      }

      // Return to login only after the backend confirms success.
      setShowForgotPassword(false);
      setResetStage("email");
      setResetOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPassword("");
      setError("");
      setSuccess(
        data.message || "Password reset successfully. Please log in."
      );
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err.message || "Could not reset the password.");
    } finally {
      setLoading(false);
    }
  }

  // Cancel the reset flow and return to login.
  function handleCancelForgotPassword() {
    setShowForgotPassword(false);
    setResetStage("email");
    setResetOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setError("");
    setSuccess("");
  }

  // Keep the existing email-verification component unchanged.
  if (showEmailVerification) {
    return (
      <EmailVerification
        email={email.trim().toLowerCase()}
        onVerificationSuccess={handleVerificationSuccess}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  // Forgot Password UI with three stages.
  if (showForgotPassword) {
    const resetSubmitHandler =
      resetStage === "email"
        ? handleForgotPassword
        : resetStage === "otp"
          ? handleVerifyResetOtp
          : handleResetPassword;

    return (
      <div style={styles.container}>
        <form onSubmit={resetSubmitHandler} style={styles.form}>
          <h1>NexPrep AI</h1>
          <h2>Forgot Password</h2>

          <p style={styles.description}>
            {resetStage === "email"
              ? "Enter your registered email to request a reset OTP."
              : resetStage === "otp"
                ? "Enter the 6-digit OTP sent to your email."
                : "Create a new password for your account."}
          </p>

          {/* Email is retained during OTP verification and reset. */}
          <input
            type="email"
            placeholder="Enter registered email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={styles.input}
            autoComplete="email"
            disabled={resetStage !== "email" || loading}
            required
          />

          {/* Stage 2: enter the reset OTP. */}
          {resetStage === "otp" && (
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={resetOtp}
              onChange={(event) =>
                setResetOtp(
                  event.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              style={styles.input}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
            />
          )}

          {/* Stage 3: choose and confirm the new password. */}
          {resetStage === "password" && (
            <>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                style={styles.input}
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
              />

              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(event) =>
                  setConfirmNewPassword(event.target.value)
                }
                style={{
                  ...styles.input,
                  border:
                    confirmNewPassword.length === 0
                      ? "1px solid #ccc"
                      : newPassword === confirmNewPassword
                        ? "1px solid #16a34a"
                        : "1px solid #dc2626",
                }}
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
              />

              {confirmNewPassword.length > 0 && (
                <p
                  style={{
                    ...styles.matchMessage,
                    color:
                      newPassword === confirmNewPassword
                        ? "#15803d"
                        : "#dc2626",
                  }}
                >
                  {newPassword === confirmNewPassword
                    ? "✓ Passwords match"
                    : "✗ Passwords do not match"}
                </p>
              )}
            </>
          )}

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
            disabled={
              loading ||
              (resetStage === "otp" && resetOtp.length !== 6) ||
              (resetStage === "password" &&
                (newPassword.length < 8 ||
                  newPassword.length > 72 ||
                  newPassword !== confirmNewPassword))
            }
          >
            {loading
              ? "Please wait..."
              : resetStage === "email"
                ? "Send Reset OTP"
                : resetStage === "otp"
                  ? "Verify OTP"
                  : "Reset Password"}
          </button>

          {/* Display backend errors and success messages. */}
          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          <button
            type="button"
            onClick={handleCancelForgotPassword}
            style={styles.switchButton}
            disabled={loading}
          >
            Back to Login
          </button>
        </form>
      </div>
    );
  }

  // Existing login and registration UI.
  return (
    <div style={styles.container}>
      <form
        onSubmit={isRegistering ? handleRegister : handleLogin}
        style={styles.form}
      >
        <h1>AI Interview</h1>
        <h2>{isRegistering ? "Create Account" : "Login"}</h2>

        {/* Name is required only during registration. */}
        {isRegistering && (
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            style={styles.input}
            autoComplete="name"
            required
          />
        )}

        {/* Existing email field. */}
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          style={styles.input}
          autoComplete="email"
          required
        />

        {/* Existing login or registration password. */}
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={styles.input}
          autoComplete={isRegistering ? "new-password" : "current-password"}
          minLength={isRegistering ? 8 : undefined}
          required
        />

        {/* Confirm password is required only during registration. */}
        {isRegistering && (
          <>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              style={{
                ...styles.input,
                border:
                  confirmPassword.length === 0
                    ? "1px solid #ccc"
                    : passwordsMatch
                      ? "1px solid #16a34a"
                      : "1px solid #dc2626",
              }}
              autoComplete="new-password"
              required
            />

            {confirmPassword.length > 0 && (
              <p
                style={{
                  ...styles.matchMessage,
                  color: passwordsMatch ? "#15803d" : "#dc2626",
                }}
              >
                {passwordsMatch
                  ? "✓ Passwords match"
                  : "✗ Passwords do not match"}
              </p>
            )}
          </>
        )}

        {/* Submit login or registration. */}
        <button
          type="submit"
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
          }}
          disabled={
            loading ||
            (isRegistering && (!isPasswordValid || !passwordsMatch))
          }
        >
          {loading
            ? "Please wait..."
            : isRegistering
              ? "Register"
              : "Login"}
        </button>

        {/* Existing Forgot Password link, shown only on login. */}
        {!isRegistering && (
          <button
            type="button"
            onClick={openForgotPassword}
            style={styles.switchButton}
            disabled={loading}
          >
            Forgot Password?
          </button>
        )}

        {/* Existing email verification shortcut. */}
        {!isRegistering && (
          <button
            type="button"
            onClick={handleOpenVerification}
            style={styles.switchButton}
            disabled={loading}
          >
            Verify Email / Enter OTP
          </button>
        )}

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <p style={styles.switchText}>
          {isRegistering
            ? "Already have an account?"
            : "Don't have an account?"}
        </p>

        <button
          type="button"
          onClick={switchForm}
          style={styles.switchButton}
          disabled={loading}
        >
          {isRegistering ? "Back to Login" : "Create Account"}
        </button>
      </form>
    </div>
  );
}

// Styles shared by login, registration, and password-reset screens.
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
    padding: "20px",
    boxSizing: "border-box",
  },

  form: {
    width: "350px",
    maxWidth: "100%",
    padding: "30px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    textAlign: "center",
    boxSizing: "border-box",
  },

  description: {
    color: "#555",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    boxSizing: "border-box",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },

  matchMessage: {
    textAlign: "left",
    fontSize: "13px",
    marginTop: "-3px",
    marginBottom: "5px",
  },

  button: {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  switchButton: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    backgroundColor: "transparent",
    color: "#2563eb",
    border: "1px solid #2563eb",
    borderRadius: "6px",
    cursor: "pointer",
  },

  switchText: {
    marginTop: "20px",
    color: "#555",
  },

  error: {
    color: "#dc2626",
    marginTop: "15px",
    overflowWrap: "anywhere",
  },

  success: {
    color: "#15803d",
    marginTop: "15px",
    overflowWrap: "anywhere",
  },
};

export default Login;
