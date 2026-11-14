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
          <span className="brand-mark">AI</span>
          <span>
            Interview<span className="brand-purple">Pro</span>
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
          <span className="brand-mark">AI</span>
          <span>
            Interview<span className="brand-purple">Pro</span>
          </span>
        </button>
        <p>Practice • Improve • Succeed</p>
        <span>© {new Date().getFullYear()} AI Interview Platform</span>
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

  const [dashboardData, setDashboardData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [assessmentData, setAssessmentData] = useState([]);
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [error, setError] = useState("");
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessmentError, setAssessmentError] = useState("");

  // Simplified navigation for regular users.
  const userMenuItems = [
    { label: "Dashboard", icon: "⌂" },
    { label: "Test Center", icon: "📝" },
    { label: "AI Interview", icon: "◎" },
    { label: "Subscription & Plans", icon: "♛" },
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

  // Public visitors see the landing page. Login.jsx is used for sign-in/register.
  if (!isAuthenticated) {
    if (!showAuth) {
      return <LandingPage onSignIn={openSignIn} onSignUp={openSignUp} />;
    }

    return (
      <div className="auth-screen">
        <button
          className="auth-back-button"
          onClick={() => setShowAuth(false)}
          type="button"
        >
          ← Back to home
        </button>
        <Login
          onLoginSuccess={handleLoginSuccess}
          initialMode={authMode}
        />
        <Chatbot />
      </div>
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
      <aside className="sidebar">
        <div className="logo">
          <span>AI</span>
          <span className="logo-accent">Interview</span>
        </div>
        <div className="sidebar-caption">INTERVIEW PREPARATION</div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`menu-item ${
                activeMenu === item.label ? "active" : ""
              }`}
              onClick={() => setActiveMenu(item.label)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span>{item.label}</span>
              {activeMenu === item.label && (
                <span className="menu-indicator" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="avatar">
              {(userName || "U").charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <strong>{userName || "User"}</strong>
              <span>
                {userRole === "ADMIN" ? "Administrator" : "Candidate"}
              </span>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <span>↪</span> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-heading">
            <p className="eyebrow">AI INTERVIEW & SKILL ASSESSMENT</p>
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
          <div className="topbar-actions">
            <div className="profile-chip">
              <div className="avatar">
                {(userName || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <strong>{userName || "User"}</strong>
                <span>
                  {userRole === "ADMIN" ? "Admin" : "Candidate"}
                </span>
              </div>
            </div>
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

        {/* User dashboard */}
        {userRole !== "ADMIN" && activeMenu === "Dashboard" && (
          <>
            <section className="stats-grid">
              <StatCard
                icon="▤"
                title="Total Interviews"
                value={totalInterviews}
                subtitle="All interviews"
              />
              <StatCard
                icon="★"
                title="Average Score"
                value={averageScore}
                subtitle="Overall performance"
              />
              <StatCard
                icon="◎"
                title="Skills Evaluated"
                value={Object.keys(categoryScores).length}
                subtitle="Skill areas"
              />
              <StatCard
                icon="↗"
                title="Weak Skills"
                value={weakSkills.length}
                subtitle="Needs improvement"
              />
            </section>

            <section className="welcome-banner">
              <div className="welcome-banner-content">
                <span className="banner-label">YOUR CAREER JOURNEY</span>
                <h2>Build confidence. Ace your next interview.</h2>
                <p>
                  Practice interviews, evaluate your skills, and discover
                  where you can improve.
                </p>
              </div>
              <button
                className="banner-button"
                onClick={() => setActiveMenu("Test Center")}
              >
                Start an Interview <span>→</span>
              </button>
            </section>

            <section className="content-grid">
              <div className="card performance-card">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">YOUR PROGRESS</p>
                    <h2>Skill Performance</h2>
                  </div>
                  <span className="section-icon">▥</span>
                </div>

                {Object.entries(categoryScores).length ? (
                  <div className="skill-performance-list">
                    {Object.entries(categoryScores).map(
                      ([category, score]) => {
                        const percentage = Math.min(
                          100,
                          Math.max(0, Number(score) * 10)
                        );

                        return (
                          <div className="progress-item" key={category}>
                            <div className="progress-header">
                              <span>{category}</span>
                              <strong>{percentage.toFixed(1)}%</strong>
                            </div>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">▥</div>
                    <h3>Your skill journey starts here</h3>
                    <p>
                      Complete an interview to see your skill performance and
                      progress.
                    </p>
                  </div>
                )}

                <button
                  className="primary-button"
                  onClick={() => setActiveMenu("Test Center")}
                >
                  Start New Interview <span>→</span>
                </button>
              </div>

              <div className="card weak-skills-card">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">IMPROVE YOUR SKILLS</p>
                    <h2>Weak Skills</h2>
                  </div>
                  <span className="section-icon">↗</span>
                </div>

                {weakSkills.length ? (
                  <ul className="skill-list">
                    {weakSkills.map((skill) => (
                      <li key={skill}>
                        <span className="skill-dot" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-state compact">
                    <div className="empty-state-icon">✓</div>
                    <h3>No weak skills found</h3>
                    <p>
                      Complete an interview to identify areas for improvement.
                    </p>
                  </div>
                )}

                <button
                  className="secondary-button"
                  onClick={() => setActiveMenu("Recommendations")}
                >
                  View Recommendations <span>→</span>
                </button>
              </div>
            </section>

            <section className="quick-actions-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">KEEP LEARNING</p>
                  <h2>Quick Actions</h2>
                </div>
              </div>

              <div className="quick-actions-grid">
                <button
                  className="quick-action-card"
                  onClick={() => setActiveMenu("Test Center")}
                >
                  <span className="quick-action-icon">✦</span>
                  <strong>Start Interview</strong>
                  <span>Practice your interview skills</span>
                  <span className="action-arrow">→</span>
                </button>
                <button
                  className="quick-action-card"
                  onClick={() => setActiveMenu("Assessment History")}
                >
                  <span className="quick-action-icon">◷</span>
                  <strong>Assessment History</strong>
                  <span>Review your past assessments</span>
                  <span className="action-arrow">→</span>
                </button>
                <button
                  className="quick-action-card"
                  onClick={() => setActiveMenu("Skill Analysis")}
                >
                  <span className="quick-action-icon">▥</span>
                  <strong>Skill Analysis</strong>
                  <span>Understand your strengths</span>
                  <span className="action-arrow">→</span>
                </button>
              </div>
            </section>
          </>
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
        {userRole !== "ADMIN" && activeMenu === "My Interviews" && (
          <section className="module-container">
            <MyInterviews />
          </section>
        )}
        {userRole !== "ADMIN" && activeMenu === "Assessment History" && (
          <section className="module-container">
            <AssessmentHistory />
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
          <span>AI Interview & Skill Assessment Platform</span>
          <span>Practice • Improve • Succeed</span>
        </footer>
      </main>
      <Chatbot />
    </div>
  );
}

export default App;
