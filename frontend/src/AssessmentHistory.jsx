
import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api";

function AssessmentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    const storedToken =
      localStorage.getItem("token") ||
      localStorage.getItem("jwtToken") ||
      localStorage.getItem("authToken");

    if (!storedToken) return null;

    return storedToken.startsWith("Bearer ")
      ? storedToken.substring(7)
      : storedToken;
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
        `${API_URL}/interviews/history`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Unable to fetch assessment history. Status: ${response.status}`
        );
      }

      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Assessment history error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Loading assessment history...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>Unable to Load History</h2>
        <p>{error}</p>
        <button
          className="primary-button"
          onClick={fetchHistory}
        >
          Try Again
        </button>
      </div>
    );
  }

  const completedAssessments = history.filter(
    (item) =>
      item.status?.toUpperCase() === "COMPLETED"
  );

  const validScores = completedAssessments
    .map((item) => Number(item.score))
    .filter((score) => Number.isFinite(score));

  const averageScore =
    validScores.length > 0
      ? (
          validScores.reduce(
            (total, score) => total + score,
            0
          ) / validScores.length
        ).toFixed(2)
      : "0.00";

  // Sort completed assessments from oldest to newest
  const progressData = [...completedAssessments]
    .filter((item) => Number.isFinite(Number(item.score)))
    .sort((a, b) => {
      const dateA = new Date(a.completedAt || a.createdAt).getTime();
      const dateB = new Date(b.completedAt || b.createdAt).getTime();

      return dateA - dateB;
    })
    .slice(-8);

  // Compare latest score with previous completed score
  const latestScore =
    progressData.length > 0
      ? Number(progressData[progressData.length - 1].score)
      : null;

  const previousScore =
    progressData.length > 1
      ? Number(progressData[progressData.length - 2].score)
      : null;

  const scoreDifference =
    latestScore !== null && previousScore !== null
      ? latestScore - previousScore
      : null;

  const highestScore =
    progressData.length > 0
      ? Math.max(
          ...progressData.map((item) => Number(item.score))
        )
      : 0;

  const lowestScore =
    progressData.length > 0
      ? Math.min(
          ...progressData.map((item) => Number(item.score))
        )
      : 0;

  if (history.length === 0) {
    return (
      <div className="card">
        <h2>Assessment History</h2>
        <p>
          You haven't completed any assessments yet.
          Start an assessment to track your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="assessment-history">

      {/* Summary cards */}
      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Assessments</h3>
          <h2>{history.length}</h2>
          <span>All attempts</span>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <h2>{completedAssessments.length}</h2>
          <span>Finished assessments</span>
        </div>

        <div className="stat-card">
          <h3>Average Score</h3>
          <h2>{averageScore}</h2>
          <span>Completed assessments</span>
        </div>

      </div>

      {/* Progress tracking */}
      <div className="card progress-tracking-card">

        <div className="history-heading">
          <div>
            <h2>Performance Progress</h2>
            <p>
              Compare your latest completed assessment scores.
            </p>
          </div>
        </div>

        {progressData.length === 0 ? (

          <div className="progress-empty">
            <h3>No completed assessments yet</h3>
            <p>
              Complete an assessment to see your performance trend.
            </p>
          </div>

        ) : (

          <>
            <div className="progress-insights">

              <div className="progress-insight">
                <span>Latest Score</span>
                <strong>{latestScore}</strong>
              </div>

              <div className="progress-insight">
                <span>Highest Score</span>
                <strong>{highestScore}</strong>
              </div>

              <div className="progress-insight">
                <span>Lowest Score</span>
                <strong>{lowestScore}</strong>
              </div>

              <div className="progress-insight">
                <span>Change from Previous</span>
                <strong
                  className={
                    scoreDifference > 0
                      ? "score-improved"
                      : scoreDifference < 0
                      ? "score-declined"
                      : ""
                  }
                >
                  {scoreDifference === null
                    ? "N/A"
                    : scoreDifference > 0
                    ? `+${scoreDifference.toFixed(2)}`
                    : scoreDifference.toFixed(2)}
                </strong>
              </div>

            </div>

            <div className="progress-chart">

              <div className="progress-chart-title">
                <h3>Recent Assessment Scores</h3>
                <span>Oldest → Newest</span>
              </div>

              <div className="progress-bars">

                {progressData.map((item, index) => {
                  const score = Number(item.score);

                  const barHeight =
                    highestScore > 0
                      ? Math.max(
                          8,
                          (score / highestScore) * 100
                        )
                      : 8;

                  return (
                    <div
                      className="progress-bar-item"
                      key={item.interviewId}
                      title={`Assessment #${item.interviewId}: ${score}`}
                    >

                      <strong className="progress-bar-value">
                        {score}
                      </strong>

                      <div className="progress-bar-track">

                        <div
                          className="progress-bar-fill"
                          style={{
                            height: `${barHeight}%`,
                          }}
                        />

                      </div>

                      <span className="progress-bar-label">
                        #{item.interviewId}
                      </span>

                    </div>
                  );
                })}

              </div>

              <p className="progress-chart-note">
                Bars show relative scores among your recent
                completed assessments. The chart displays up
                to 8 attempts.
              </p>

            </div>
          </>
        )}

      </div>

      {/* Assessment history table */}
      <div className="card">

        <div className="history-heading">
          <h2>Assessment History</h2>

          <button
            className="primary-button"
            onClick={fetchHistory}
          >
            Refresh
          </button>
        </div>

        <div className="history-table-wrapper">

          <table className="history-table">

            <thead>
              <tr>
                <th>Assessment ID</th>
                <th>Technology</th>
                <th>Difficulty</th>
                <th>Score</th>
                <th>Status</th>
                <th>Started At</th>
                <th>Completed At</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item) => (
                <tr key={item.interviewId}>

                  <td>#{item.interviewId}</td>
                  <td>{item.technology || "-"}</td>
                  <td>{item.difficulty || "-"}</td>
                  <td>{item.score ?? 0}</td>

                  <td>
                    <span
                      className={`history-status ${
                        item.status?.toUpperCase() === "COMPLETED"
                          ? "completed"
                          : "started"
                      }`}
                    >
                      {item.status || "UNKNOWN"}
                    </span>
                  </td>

                  <td>{formatDate(item.createdAt)}</td>
                  <td>{formatDate(item.completedAt)}</td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default AssessmentHistory;