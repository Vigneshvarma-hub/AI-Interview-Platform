
import { useState } from "react";
import EmailVerification from "./EmailVerification";

const API_BASE_URL = "http://localhost:8080/api/auth";

function Login({ onLoginSuccess, initialMode = "login" }) {
  const authStyles = '\n.auth-container {\n  position: relative; isolation: isolate; overflow: hidden;\n  min-height: 100vh; width: 100%; display:flex; align-items:center; justify-content:center;\n  padding: 36px 20px; box-sizing:border-box;\n  background: radial-gradient(ellipse at 18% 18%, rgba(117,75,255,.24), transparent 38%),\n              radial-gradient(ellipse at 82% 78%, rgba(56,217,255,.13), transparent 34%),\n              linear-gradient(135deg,#080a18 0%,#11102a 48%,#090b1b 100%);\n}\n.auth-container::before,.auth-container::after {\n  content:""; position:absolute; z-index:-1; width:430px; height:430px; border-radius:50%;\n  filter:blur(85px); opacity:.34; pointer-events:none; animation:authFloat 13s ease-in-out infinite alternate;\n}\n.auth-container::before { background:#713dff; top:-190px; left:-120px; }\n.auth-container::after { background:#1d9ed0; right:-180px; bottom:-220px; animation-delay:-6s; }\n.auth-card {\n  position:relative; z-index:1; width:390px; max-width:100%; padding:38px 34px;\n  border:1px solid rgba(255,255,255,.13); border-radius:22px;\n  background:linear-gradient(145deg,rgba(30,27,58,.91),rgba(17,19,39,.88));\n  box-shadow:0 24px 80px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.08);\n  backdrop-filter:blur(22px); -webkit-backdrop-filter:blur(22px);\n  text-align:center; box-sizing:border-box; animation:authEnter .7s cubic-bezier(.2,.8,.2,1) both;\n}\n.auth-card h2 { color:#f4f2ff; font-size:20px; margin:8px 0 22px; font-weight:650; }\n.auth-card input {\n  color:#f8f7ff !important; background:rgba(255,255,255,.075) !important;\n  border:1px solid rgba(190,178,255,.22) !important; border-radius:10px !important;\n  outline:none; transition:border-color .22s,box-shadow .22s,background .22s,transform .22s;\n}\n.auth-card input::placeholder { color:#aaa8c5; }\n.auth-card input:focus { border-color:#9b7cff !important; background:rgba(255,255,255,.105) !important;\n  box-shadow:0 0 0 3px rgba(117,75,255,.2),0 0 22px rgba(117,75,255,.12); transform:translateY(-1px); }\n.auth-primary {\n  position:relative; overflow:hidden; font-weight:700; letter-spacing:.2px;\n  background:linear-gradient(105deg,#6745f5,#9557ff 55%,#5b6bff) !important;\n  box-shadow:0 9px 24px rgba(108,76,255,.28); transition:transform .2s,box-shadow .2s,filter .2s;\n}\n.auth-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 13px 30px rgba(108,76,255,.4); filter:brightness(1.08); }\n.auth-primary:disabled { cursor:not-allowed; }\n.auth-secondary {\n  color:#d2c8ff !important; border-color:rgba(160,135,255,.48) !important;\n  border-radius:10px !important; transition:background .2s,border-color .2s,transform .2s;\n}\n.auth-secondary:hover:not(:disabled) { background:rgba(117,75,255,.13) !important; border-color:#a78bfa !important; transform:translateY(-1px); }\n.auth-brand {\n  margin:0 0 7px; font-size:34px; font-weight:850; letter-spacing:-1.3px;\n  background:linear-gradient(110deg,#fff 4%,#c8b8ff 42%,#8b6aff 75%,#64dfff);\n  -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;\n  filter:drop-shadow(0 4px 18px rgba(139,106,255,.24));\n}\n.auth-tagline { margin:0 0 22px; color:#aaa7c8; font-size:12px; letter-spacing:1.65px; text-transform:uppercase; }\n.auth-description { color:#b9b6d0 !important; }\n.auth-switch-text { color:#c5c1d8 !important; }\n.auth-message-error { color:#ff9aab !important; }\n.auth-message-success { color:#83e8c0 !important; }\n@keyframes authEnter { from { opacity:0; transform:translateY(18px) scale(.985); } to { opacity:1; transform:translateY(0) scale(1); } }\n@keyframes authFloat { from { transform:translate3d(0,0,0) scale(1); } to { transform:translate3d(45px,35px,0) scale(1.18); } }\n@media (max-width:480px) { .auth-card { padding:30px 23px; border-radius:18px; } .auth-brand {font-size:30px;} }\n@media (prefers-reduced-motion:reduce) { .auth-container::before,.auth-container::after,.auth-card { animation:none !important; } * {scroll-behavior:auto !important; transition:none !important;} }\n';
  // Existing login, registration, and email-verification screens.
  const [isRegistering, setIsRegistering] = useState(initialMode === "register");
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
      <div className="auth-container" style={styles.container}>
        <style>{authStyles}</style>
        <form onSubmit={resetSubmitHandler} className="auth-card" style={styles.form}>
          <h1 style={styles.brandTitle} className="auth-brand">NexPrep AI</h1>
          <p className="auth-tagline">Prepare smarter. Interview better.</p>
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
            className="auth-primary"
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
            className="auth-secondary"
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
    <div className="auth-container" style={styles.container}>
        <style>{authStyles}</style>
      <form
        onSubmit={isRegistering ? handleRegister : handleLogin}
        className="auth-card"
        style={styles.form}
      >
        <h1 style={styles.brandTitle} className="auth-brand">NexPrep AI</h1>
          <p className="auth-tagline">Prepare smarter. Interview better.</p>
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
          className="auth-primary"
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
          className="auth-secondary"
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
    backgroundColor: "#090b1a",
    padding: "20px",
    boxSizing: "border-box",
  },

  form: {
    width: "390px",
    maxWidth: "100%",
    padding: "38px 34px",
    backgroundColor: "rgba(23,21,43,.92)",
    borderRadius: "22px",
    boxShadow: "0 24px 80px rgba(0,0,0,.42)",
    textAlign: "center",
    boxSizing: "border-box",
  },

  brandTitle: {
    margin: "0 0 8px",
    fontSize: "30px",
    fontWeight: 800,
    letterSpacing: "-0.8px",
    background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  description: {
    color: "#b9b6d0",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    boxSizing: "border-box",
    border: "1px solid rgba(190,178,255,.22)",
    borderRadius: "10px",
    backgroundColor: "rgba(255,255,255,.075)",
    color: "#f8f7ff",
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
    background: "linear-gradient(105deg,#6745f5,#9557ff 55%,#5b6bff)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },

  switchButton: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    backgroundColor: "transparent",
    color: "#d2c8ff",
    border: "1px solid rgba(160,135,255,.48)",
    borderRadius: "10px",
    cursor: "pointer",
  },

  switchText: {
    marginTop: "20px",
    color: "#c5c1d8",
  },

  error: {
    color: "#ff9aab",
    marginTop: "15px",
    overflowWrap: "anywhere",
  },

  success: {
    color: "#83e8c0",
    marginTop: "15px",
    overflowWrap: "anywhere",
  },
};

export default Login;
