import { useEffect, useState } from "react";
import "./App.css";

import Login from "./Login";
import StartInterview from "./StartInterview";
import MyInterviews from "./MyInterviews";
import SkillAnalysis from "./SkillAnalysis";
import Recommendations from "./Recommendations";
import AIInterview from "./AIInterview";
import SkillScore from "./SkillScore";
import SkillGap from "./SkillGap";
import AssessmentHistory from "./AssessmentHistory";
import UserManagement from "./UserManagement";
import Chatbot from "./Chatbot";
import ContactUs from "./ContactUs";
import ContactMessages from "./ContactMessages";
import Subscription from "./Subscription";
import TestCenter from "./TestCenter";

// Read the token saved after a successful login.
function getToken() {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("jwtToken") ||
    localStorage.getItem("authToken");

  if (!token) return null;
  return token.startsWith("Bearer ") ? token.substring(7) : token;
}

// Reusable dashboard statistic card.
function StatCard({ icon, title, value, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-card-heading">
        <span className="stat-icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      <h2>{value}</h2>
      <span className="stat-subtitle">{subtitle}</span>
    </div>
  );
}

// Public landing page shown before a user signs in.
function LandingPage({ onSignIn, onSignUp }) {
  const features = [
    {
      icon: "✦",
      title: "AI Mock Interviews",
      text: "Practice interview questions and build confidence before the real interview.",
    },
    {
      icon: "▤",
      title: "Resume Skill Analysis",
      text: "Upload your resume, identify skills, and connect them with your target role.",
    },
    {
      icon: "⌘",
      title: "MCQ & Coding Assessments",
      text: "Test your technical knowledge and evaluate your preparation.",
    },
    {
      icon: "▥",
      title: "Skill Gap Analysis",
      text: "Understand which skills need more attention and focus your preparation.",
    },
    {
      icon: "◎",
      title: "Personalized Feedback",
      text: "Use your assessment results and recommendations to guide your next steps.",
    },
    {
      icon: "↗",
      title: "Progress Tracking",
      text: "Review interview history, skill scores, and your improvement over time.",
    },
  ];

  return (
    <div className="landing-page">
      <header className="landing-header">
        <button
          className="landing-brand"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
        >
          <span className="brand-mark">N</span>
          <span>
            NexPrep<span className="brand-purple"> AI</span>
          </span>
        </button>

        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#benefits">Benefits</a>
          <a href="#contact">Contact Us</a>
        </nav>

        <div className="landing-auth-actions">
          <button className="signin-button" onClick={onSignIn}>
            Sign In
          </button>
          <button className="signup-button" onClick={onSignUp}>
            Sign Up
          </button>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <span className="hero-eyebrow">
              YOUR AI-POWERED CAREER PREPARATION PARTNER
            </span>
            <h1>
              Prepare smarter.
              <br />
              <span>Ace your next interview.</span>
            </h1>
            <p>
              Practice interviews, assess your skills, understand your
              strengths, and prepare for your dream role with one intelligent
              platform.
            </p>

            <div className="hero-actions">
              <button className="hero-primary-button" onClick={onSignUp}>
                Get Started Free <span aria-hidden="true">→</span>
              </button>
              <a className="hero-secondary-button" href="#features">
                Explore Features
              </a>
            </div>

            <div className="hero-trust-note">
              <span className="trust-check">✓</span>
              Resume analysis
              <span className="trust-separator">•</span>
              Mock interviews
              <span className="trust-separator">•</span>
              Skill assessments
            </div>
          </div>

          <div
            className="hero-visual"
            aria-label="Interview preparation overview"
          >
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />
            <div className="visual-main-card">
              <div className="visual-card-top">
                <div className="visual-avatar">AI</div>
                <div>
                  <strong>Interview Practice</strong>
                  <span>Your preparation workspace</span>
                </div>
                <span className="live-indicator">●</span>
              </div>

              <div className="visual-question">
                <span className="visual-label">
                  SAMPLE INTERVIEW QUESTION
                </span>
                <h3>
                  Tell me about a challenging problem you solved.
                </h3>
                <p>
                  Structure your answer, explain your approach, and highlight
                  the result.
                </p>
              </div>

              <div className="visual-feedback">
                <div className="feedback-icon">✦</div>
                <div>
                  <strong>Improve with practice</strong>
                  <span>Build confidence one answer at a time.</span>
                </div>
              </div>

              <div className="visual-progress">
                <div className="progress-title">
                  <span>Preparation journey</span>
                  <span>Keep going</span>
                </div>
                <div className="visual-progress-track">
                  <span />
                </div>
              </div>
            </div>

            <div className="floating-chip chip-top">
              <span>✧</span> AI-powered practice
            </div>
            <div className="floating-chip chip-bottom">
              <span>✓</span> Personalized feedback
            </div>
          </div>
        </section>

        <section className="landing-benefit-strip" id="benefits">
          <div>
            <span className="benefit-icon">◈</span>
            <div>
              <strong>Prepare with direction</strong>
              <span>Focus on the skills your role needs.</span>
            </div>
          </div>
          <div>
            <span className="benefit-icon">◎</span>
            <div>
              <strong>Practice at your pace</strong>
              <span>Build confidence with repeated practice.</span>
            </div>
          </div>
          <div>
            <span className="benefit-icon">↗</span>
            <div>
              <strong>Track your progress</strong>
              <span>Use results to guide your next steps.</span>
            </div>
          </div>
        </section>

        <section className="landing-section features-section" id="features">
          <div className="landing-section-heading">
            <span className="section-kicker">ALL THE TOOLS YOU NEED</span>
            <h2>Everything you need to prepare with confidence</h2>
            <p>
              From understanding your current skills to practicing interviews,
              keep your preparation in one place.
            </p>
          </div>

          <div className="landing-feature-grid">
            {features.map((feature) => (
              <article className="landing-feature-card" key={feature.title}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
                <a
                  href="#how-it-works"
                  aria-label={`Learn how ${feature.title} fits into the process`}
                >
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-how-section" id="how-it-works">
          <div className="landing-section-heading">
            <span className="section-kicker">SIMPLE PROCESS</span>
            <h2>Your interview preparation, step by step</h2>
            <p>
              Follow a clear process from assessment to focused practice.
            </p>
          </div>

          <div className="how-steps">
            <article className="how-step">
              <span className="step-number">01</span>
              <div className="step-icon">♙</div>
              <h3>Set your goal</h3>
              <p>
                Create an account and choose the role you want to prepare for.
              </p>
            </article>
            <article className="how-step">
              <span className="step-number">02</span>
              <div className="step-icon">▤</div>
              <h3>Assess your skills</h3>
              <p>
                Use your resume and assessments to understand your current
                level.
              </p>
            </article>
            <article className="how-step">
              <span className="step-number">03</span>
              <div className="step-icon">✦</div>
              <h3>Practice and improve</h3>
              <p>
                Practice interviews, review feedback, and work on skill gaps.
              </p>
            </article>
          </div>
        </section>

        <section className="landing-cta">
          <div>
            <span className="section-kicker">
              YOUR NEXT OPPORTUNITY STARTS HERE
            </span>
            <h2>
              Ready to feel more confident in your next interview?
            </h2>
            <p>
              Start preparing with tools designed to support your career
              journey.
            </p>
          </div>
          <button className="hero-primary-button" onClick={onSignUp}>
            Create Your Account <span aria-hidden="true">→</span>
          </button>
        </section>

        {/* Public contact form; submits to the backend contact API. */}
        <ContactUs />
      </main>

      <footer className="landing-footer">
        <button
          className="landing-brand footer-brand"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
        >
          <span className="brand-mark">N</span>
          <span>
            NexPrep<span className="brand-purple"> AI</span>
          </span>
        </button>
        <p>Prepare Smarter. Interview Better.</p>
        <span>© {new Date().getFullYear()} NexPrep AI</span>
      </footer>
      <Chatbot />
    </div>
  );
}

function App() {
  // A saved token opens the private application; otherwise show the landing page.
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getToken()));
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [userRole, setUserRole] = useState(
    localStorage.getItem("role") || ""
  );
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || ""
  );
  const [activeMenu, setActiveMenu] = useState(
    localStorage.getItem("role") === "ADMIN"
      ? "Admin Dashboard"
      : "Dashboard"
  );
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [assessmentData, setAssessmentData] = useState([]);
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [error, setError] = useState("");
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessmentError, setAssessmentError] = useState("");

  // Horizontal navigation keeps each preparation workflow separate.
  const userMenuItems = [
    { label: "Dashboard", icon: "⌂" },
    { label: "Resume & Skills", icon: "▤" },
    { label: "Assessments", icon: "✓" },
    { label: "Interview Tests", icon: "◷" },
    { label: "Test Center", icon: "▣" },
    { label: "AI Interview", icon: "◎" },
    { label: "Reports", icon: "↗" },
  ];

  const adminMenuItems = [
    { label: "Admin Dashboard", icon: "⌂" },
    { label: "User Management", icon: "♙" },
    { label: "Assessment Monitoring", icon: "▤" },
    { label: "Contact Messages", icon: "✉" },
  ];

  const menuItems = userRole === "ADMIN" ? adminMenuItems : userMenuItems;

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    if (userRole === "ADMIN") fetchAdminData();
    else fetchDashboardData();
    // Data is loaded when authentication or role changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, userRole]);

  useEffect(() => {
    if (
      isAuthenticated &&
      userRole === "ADMIN" &&
      activeMenu === "Assessment Monitoring"
    ) {
      fetchAssessmentData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, userRole, activeMenu]);

  // Load the logged-in user's dashboard data.
  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      if (!token) throw new Error("JWT token not found. Please sign in again.");

      const response = await fetch("http://localhost:8080/api/dashboard/me", {
        method: "GET",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));

        if (response.status === 401) {
          throw new Error(
            errorBody.message || "Session expired. Please sign in again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            errorBody.message || "Access denied. Check your account role or status."
          );
        }

        throw new Error(
          errorBody.message || "Dashboard data could not be loaded."
        );
      }

      setDashboardData(await response.json());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Unexpected dashboard error.");
    } finally {
      setLoading(false);
    }
  }

  // Load admin dashboard data.
  async function fetchAdminData() {
    try {
      setLoading(true);
      setError("");
      const token = getToken();
      if (!token) throw new Error("JWT token not found. Please sign in again.");

      const response = await fetch("http://localhost:8080/api/admin/dashboard", {
        method: "GET",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Session expired. Please sign in again.");
        if (response.status === 403) throw new Error("Admin access denied.");
        throw new Error("Admin dashboard data could not be loaded.");
      }

      setAdminData(await response.json());
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      setError(err.message || "Unexpected admin dashboard error.");
    } finally {
      setLoading(false);
    }
  }

  // Load assessments for the admin monitoring page.
  async function fetchAssessmentData() {
    try {
      setAssessmentLoading(true);
      setAssessmentError("");
      const token = getToken();
      if (!token) throw new Error("JWT token not found. Please sign in again.");

      const response = await fetch("http://localhost:8080/api/admin/assessments", {
        method: "GET",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Session expired. Please sign in again.");
        if (response.status === 403) throw new Error("Admin access denied.");
        throw new Error("Assessment data could not be loaded.");
      }

      const data = await response.json();
      setAssessmentData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Assessment monitoring fetch error:", err);
      setAssessmentError(err.message || "Unexpected assessment error.");
    } finally {
      setAssessmentLoading(false);
    }
  }

  // Clear authentication details and return to the public landing page.
  function handleLogout() {
    [
      "token",
      "jwtToken",
      "authToken",
      "role",
      "userId",
      "userName",
      "userEmail",
    ].forEach((key) => localStorage.removeItem(key));

    setIsAuthenticated(false);
    setShowAuth(false);
    setAuthMode("login");
    setUserRole("");
    setUserName("");
    setDashboardData(null);
    setAdminData(null);
    setAssessmentData([]);
    setActiveMenu("Dashboard");
    setError("");
    setAssessmentError("");
  }

  // Called by Login after successful authentication.
  function handleLoginSuccess(role) {
    const savedRole = role || localStorage.getItem("role") || "USER";
    setUserRole(savedRole);
    setUserName(localStorage.getItem("userName") || "");
    setActiveMenu(savedRole === "ADMIN" ? "Admin Dashboard" : "Dashboard");
    setShowAuth(false);
    setIsAuthenticated(true);
    setLoading(true);
  }

  function openSignIn() {
    setAuthMode("login");
    setShowAuth(true);
  }

  function openSignUp() {
    setAuthMode("register");
    setShowAuth(true);
  }

  // Standalone Test Center routes render without the dashboard/sidebar.
  // The exam payload is restored by TestCenter from same-origin localStorage.
  const testCenterUrlParams = new URLSearchParams(window.location.search);
  const standaloneExamKey = testCenterUrlParams.get("testCenterExam");
  const standaloneTestSetup =
    testCenterUrlParams.get("testCenterSetup") === "1";

  if (standaloneExamKey || standaloneTestSetup) {
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          background: "#f7f8fc",
        }}
      >
        <TestCenter
          standaloneExamKey={standaloneExamKey}
          standaloneSetup={standaloneTestSetup}
        />
      </div>
    );
  }

  // Public visitors stay on the landing page; authentication opens as an overlay.
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onSignIn={openSignIn} onSignUp={openSignUp} />
        {showAuth && (
          <div
            className="auth-modal-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setShowAuth(false);
            }}
          >
            <section
              className="auth-modal-dialog"
              role="dialog"
              aria-modal="true"
              aria-label={authMode === "register" ? "Create your NexPrep AI account" : "Sign in to NexPrep AI"}
            >
              <button
                className="auth-modal-close"
                type="button"
                onClick={() => setShowAuth(false)}
                aria-label="Close authentication dialog"
              >
                ×
              </button>
              <Login
                onLoginSuccess={handleLoginSuccess}
                initialMode={authMode}
              />
            </section>
          </div>
        )}
        <Chatbot />
      </>
    );
  }

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <h2>Loading your dashboard...</h2>
        <p>Please wait a moment.</p>
        <Chatbot />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
        <button className="primary-button" onClick={handleLogout}>
          Return to Sign In
        </button>
        <Chatbot />
      </div>
    );
  }

  const categoryScores = dashboardData?.categoryScores || {};
  const weakSkills = Array.isArray(dashboardData?.weakSkills)
    ? dashboardData.weakSkills
    : [];
  const totalInterviews = dashboardData?.totalInterviews ?? 0;
  const averageScore = Number(dashboardData?.averageScore ?? 0).toFixed(2);

  return (
    <div className="dashboard">
      <header className="app-navbar">
        <button
          className="logo app-navbar-brand"
          type="button"
          onClick={() => setActiveMenu(userRole === "ADMIN" ? "Admin Dashboard" : "Dashboard")}
          aria-label="Go to dashboard"
        >
          <span className="brand-mark">N</span>
          <span>NexPrep <span className="logo-accent">AI</span></span>
        </button>

        <nav className="sidebar-menu horizontal-nav" aria-label="Application navigation">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`menu-item horizontal-menu-item ${
                activeMenu === item.label ? "active" : ""
              }`}
              onClick={() => {
                setActiveMenu(item.label);
                setProfileMenuOpen(false);
              }}
              aria-current={activeMenu === item.label ? "page" : undefined}
            >
              <span className="menu-icon">{item.icon}</span>
              <span>{item.label}</span>
              {activeMenu === item.label && <span className="menu-indicator" />}
            </button>
          ))}
        </nav>

        <div className="navbar-profile-area">
          <button
            type="button"
            className="profile-chip profile-menu-trigger"
            onClick={() => setProfileMenuOpen((open) => !open)}
            aria-expanded={profileMenuOpen}
            aria-haspopup="menu"
          >
            <div className="avatar">
              {(userName || "U").charAt(0).toUpperCase()}
            </div>
            <div className="profile-chip-copy">
              <strong>{userName || "User"}</strong>
              <span>{userRole === "ADMIN" ? "Admin" : "Candidate"}</span>
            </div>
            <span className="profile-chevron">⌄</span>
          </button>

          {profileMenuOpen && (
            <div className="profile-dropdown" role="menu">
              <div className="profile-dropdown-heading">
                <strong>{userName || "User"}</strong>
                <span>{localStorage.getItem("userEmail") || "Signed in"}</span>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActiveMenu("Subscription & Plans");
                  setProfileMenuOpen(false);
                }}
              >
                <span>♛</span> Subscription & Plans
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActiveMenu(userRole === "ADMIN" ? "Admin Dashboard" : "Dashboard");
                  setProfileMenuOpen(false);
                }}
              >
                <span>⌂</span> Dashboard
              </button>
              <button
                type="button"
                role="menuitem"
                className="profile-logout"
                onClick={handleLogout}
              >
                <span>↪</span> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-heading">
            <p className="eyebrow">NEXPREP AI • INTERVIEW & SKILL ASSESSMENT</p>
            <h1>
              {activeMenu === "Dashboard"
                ? `Good to see you, ${userName || "Candidate"}`
                : activeMenu}
            </h1>
            <p className="topbar-description">
              {userRole === "ADMIN"
                ? "Manage users and monitor platform activity."
                : activeMenu === "Dashboard"
                  ? "Track your progress and prepare for your next interview."
                  : `Manage your ${activeMenu.toLowerCase()} activities.`}
            </p>
          </div>
        </header>

        {/* Admin dashboard */}
        {userRole === "ADMIN" && activeMenu === "Admin Dashboard" && (
          <>
            <section className="stats-grid">
              <StatCard
                icon="♙"
                title="Total Users"
                value={adminData?.totalUsers ?? 0}
                subtitle="Registered users"
              />
              <StatCard
                icon="▤"
                title="Total Assessments"
                value={adminData?.totalAssessments ?? 0}
                subtitle="All assessments"
              />
              <StatCard
                icon="✓"
                title="Completed Assessments"
                value={adminData?.completedAssessments ?? 0}
                subtitle="Successfully completed"
              />
              <StatCard
                icon="◷"
                title="Pending Assessments"
                value={adminData?.pendingAssessments ?? 0}
                subtitle="Not yet completed"
              />
              <StatCard
                icon="✎"
                title="Total Answers"
                value={adminData?.totalAnswers ?? 0}
                subtitle="Submitted answers"
              />
              <StatCard
                icon="★"
                title="Average Score"
                value={Number(adminData?.averageScore ?? 0).toFixed(2)}
                subtitle="Overall assessment score"
              />
            </section>

            <section className="content-grid">
              <div className="card">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">PLATFORM</p>
                    <h2>Platform Overview</h2>
                  </div>
                  <span className="section-icon">▦</span>
                </div>
                <p className="muted-text">
                  Monitor registered users, assessments, submitted answers,
                  and overall performance.
                </p>
                <button className="primary-button" onClick={fetchAdminData}>
                  Refresh Statistics
                </button>
              </div>
            </section>
          </>
        )}

        {userRole === "ADMIN" && activeMenu === "User Management" && (
          <section className="module-container">
            <UserManagement />
          </section>
        )}

        {userRole === "ADMIN" && activeMenu === "Assessment Monitoring" && (
          <section className="card monitoring-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">ADMINISTRATION</p>
                <h2>Assessment Monitoring</h2>
                <p className="muted-text">
                  View and monitor assessments conducted on the platform.
                </p>
              </div>
              <button
                className="primary-button"
                onClick={fetchAssessmentData}
                disabled={assessmentLoading}
              >
                {assessmentLoading
                  ? "Refreshing..."
                  : "Refresh Assessments"}
              </button>
            </div>

            <div className="table-summary">
              Total Assessments: {assessmentData.length}
            </div>
            {assessmentLoading && (
              <p className="muted-text">Loading assessments...</p>
            )}
            {assessmentError && (
              <div className="error-banner">
                <strong>Error:</strong> {assessmentError}
                <button
                  className="primary-button"
                  onClick={fetchAssessmentData}
                >
                  Try Again
                </button>
              </div>
            )}

            {!assessmentLoading && !assessmentError && (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      {[
                        "ID",
                        "User Name",
                        "Email",
                        "Technology",
                        "Difficulty",
                        "Status",
                        "Score",
                        "Created At",
                        "Completed At",
                      ].map((heading) => (
                        <th key={heading}>{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assessmentData.length ? (
                      assessmentData.map((assessment) => (
                        <tr key={assessment.id}>
                          <td>{assessment.id}</td>
                          <td>{assessment.userName || "N/A"}</td>
                          <td>{assessment.userEmail || "N/A"}</td>
                          <td>{assessment.technology || "N/A"}</td>
                          <td>{assessment.difficulty || "N/A"}</td>
                          <td>
                            <span
                              className={`status-badge ${
                                assessment.status?.toUpperCase() ===
                                "COMPLETED"
                                  ? "status-completed"
                                  : "status-pending"
                              }`}
                            >
                              {assessment.status || "PENDING"}
                            </span>
                          </td>
                          <td>{assessment.score ?? 0}</td>
                          <td>
                            {assessment.createdAt
                              ? new Date(
                                  assessment.createdAt
                                ).toLocaleString()
                              : "N/A"}
                          </td>
                          <td>
                            {assessment.completedAt
                              ? new Date(
                                  assessment.completedAt
                                ).toLocaleString()
                              : "Not completed"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="empty-table">
                          No assessments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Admin Contact Messages inbox: keep this outside Assessment Monitoring. */}
        {userRole === "ADMIN" && activeMenu === "Contact Messages" && (
          <section className="module-container">
            <ContactMessages />
          </section>
        )}

        {/* Candidate dashboard — focused overview with real API data only. */}
        {userRole !== "ADMIN" && activeMenu === "Dashboard" && (
          <section className="candidate-dashboard">
            <div className="candidate-welcome">
              <div className="candidate-welcome-copy">
                <span className="candidate-kicker">YOUR PREPARATION OVERVIEW</span>
                <h2>Make every practice session count.</h2>
                <p>Review your performance, identify what needs work, and take the next step toward your goal.</p>
              </div>
              <button className="candidate-primary-action" onClick={() => setActiveMenu("Test Center")}>
                <span>Start practising</span><span aria-hidden="true">→</span>
              </button>
              <div className="candidate-orb candidate-orb-one" />
              <div className="candidate-orb candidate-orb-two" />
            </div>

            <div className="candidate-stats-grid">
              <article className="candidate-stat-card stat-violet">
                <div className="candidate-stat-top"><span className="candidate-stat-icon">▤</span><span className="candidate-stat-label">INTERVIEW ATTEMPTS</span></div>
                <strong>{totalInterviews}</strong><span className="candidate-stat-note">Completed interview activity</span>
              </article>
              <article className="candidate-stat-card stat-blue">
                <div className="candidate-stat-top"><span className="candidate-stat-icon">★</span><span className="candidate-stat-label">AVERAGE SCORE</span></div>
                <strong>{averageScore}<small> / 10</small></strong><span className="candidate-stat-note">Across your recorded interviews</span>
              </article>
              <article className="candidate-stat-card stat-cyan">
                <div className="candidate-stat-top"><span className="candidate-stat-icon">◎</span><span className="candidate-stat-label">SKILLS EVALUATED</span></div>
                <strong>{Object.keys(categoryScores).length}</strong><span className="candidate-stat-note">Skill areas with recorded scores</span>
              </article>
              <article className="candidate-stat-card stat-rose">
                <div className="candidate-stat-top"><span className="candidate-stat-icon">↗</span><span className="candidate-stat-label">SKILL GAPS</span></div>
                <strong>{weakSkills.length}</strong><span className="candidate-stat-note">Areas flagged for improvement</span>
              </article>
            </div>

            <div className="candidate-section-heading">
              <div><span className="candidate-kicker">YOUR PERFORMANCE</span><h2>Progress at a glance</h2></div>
              <button className="candidate-text-action" onClick={() => setActiveMenu("Reports")}>View reports <span aria-hidden="true">→</span></button>
            </div>

            <div className="candidate-panels-grid">
              <section className="candidate-panel candidate-performance-panel">
                <div className="candidate-panel-heading"><div><h3>Skill performance</h3><p>Your latest recorded category scores</p></div><span className="candidate-panel-symbol">▥</span></div>
                {Object.entries(categoryScores).length ? (
                  <div className="candidate-skill-list">
                    {Object.entries(categoryScores).map(([category, score]) => {
                      const percentage = Math.min(100, Math.max(0, Number(score) * 10));
                      return <div className="candidate-skill-row" key={category}><div className="candidate-skill-meta"><span>{category}</span><strong>{percentage.toFixed(1)}%</strong></div><div className="candidate-skill-track"><span style={{ width: `${percentage}%` }} /></div></div>;
                    })}
                  </div>
                ) : (
                  <div className="candidate-empty-state"><span>✦</span><strong>Your skill insights will appear here</strong><p>Complete an interview to see scores for your evaluated skill areas.</p></div>
                )}
                <button className="candidate-outline-action" onClick={() => setActiveMenu("Resume & Skills")}>Explore skill analysis <span aria-hidden="true">→</span></button>
              </section>

              <section className="candidate-panel candidate-gaps-panel">
                <div className="candidate-panel-heading"><div><h3>Focus areas</h3><p>Skills identified as needing attention</p></div><span className="candidate-panel-symbol">✧</span></div>
                {weakSkills.length ? (
                  <ul className="candidate-gap-list">{weakSkills.slice(0, 5).map((skill) => <li key={skill}><span className="candidate-gap-dot" />{skill}</li>)}</ul>
                ) : (
                  <div className="candidate-empty-state"><span>✓</span><strong>No skill gaps are currently listed</strong><p>Keep practising. New insights appear as you complete interviews.</p></div>
                )}
                <button className="candidate-outline-action" onClick={() => setActiveMenu("Reports")}>Review recommendations <span aria-hidden="true">→</span></button>
              </section>
            </div>

            <section className="candidate-next-step">
              <div><span className="candidate-kicker">WHAT WOULD YOU LIKE TO DO NEXT?</span><h3>Keep your momentum going.</h3><p>Choose a focused activity and continue preparing.</p></div>
              <div className="candidate-action-list">
                <button onClick={() => setActiveMenu("Test Center")}><span className="candidate-action-icon">⌘</span><span><strong>Take an assessment</strong><small>Test your technical knowledge</small></span><b>→</b></button>
                <button onClick={() => setActiveMenu("AI Interview")}><span className="candidate-action-icon">✦</span><span><strong>Start an AI interview</strong><small>Practise answering interview questions</small></span><b>→</b></button>
                <button onClick={() => setActiveMenu("Interview Tests")}><span className="candidate-action-icon">◷</span><span><strong>Review interview tests</strong><small>Revisit your previous attempts</small></span><b>→</b></button>
              </div>
            </section>
          </section>
        )}

        {/* Subscription and free-trial management for regular users. */}
        {userRole !== "ADMIN" &&
          activeMenu === "Subscription & Plans" && (
            <section className="module-container">
              <Subscription />
            </section>
          )}

        {/* Existing user feature pages are kept intact. */}
        {userRole !== "ADMIN" && activeMenu === "Start Interview" && (
          <section className="module-container">
            <StartInterview />
          </section>
        )}
        {userRole !== "ADMIN" && activeMenu === "Interview Tests" && (
          <section className="module-container">
            <MyInterviews />
          </section>
        )}
        {userRole !== "ADMIN" && activeMenu === "Assessments" && (
          <section className="module-container">
            <AssessmentHistory />
          </section>
        )}
        {userRole !== "ADMIN" && activeMenu === "Resume & Skills" && (
          <section className="module-container">
            <SkillAnalysis />
          </section>
        )}
        {userRole !== "ADMIN" && activeMenu === "Reports" && (
          <section className="module-container">
            <div className="reports-grid">
              <SkillScore />
              <SkillGap />
              <Recommendations />
            </div>
          </section>
        )}
        {userRole !== "ADMIN" && activeMenu === "Test Center" && (
          <section className="module-container">
            <TestCenter />
          </section>
        )}
        {userRole !== "ADMIN" && activeMenu === "AI Interview" && (
          <section className="module-container">
            <AIInterview
              onOpenPlans={() => setActiveMenu("Subscription & Plans")}
            />
          </section>
        )}
        {userRole !== "ADMIN" && activeMenu === "Skill Score" && (
          <section className="module-container">
            <SkillScore />
          </section>
        )}
        {userRole !== "ADMIN" && activeMenu === "Skill Gap" && (
          <section className="module-container">
            <SkillGap />
          </section>
        )}
        {userRole !== "ADMIN" && activeMenu === "Skill Analysis" && (
          <section className="module-container">
            <SkillAnalysis />
          </section>
        )}
        {userRole !== "ADMIN" && activeMenu === "Recommendations" && (
          <section className="module-container">
            <Recommendations />
          </section>
        )}

        <footer className="dashboard-footer">
          <span>NexPrep AI • AI-Powered Interview & Skill Assessment</span>
          <span>Prepare Smarter. Interview Better.</span>
        </footer>
      </main>
      <Chatbot />
    </div>
  );
}

export default App;
