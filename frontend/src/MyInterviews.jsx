import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:8080/api/interviews/my";

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

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function getStatus(status) {
  const normalized = String(status || "UNKNOWN").toUpperCase();

  if (normalized === "COMPLETED") return "completed";
  if (normalized === "IN_PROGRESS" || normalized === "STARTED") return "in-progress";
  if (normalized === "PENDING") return "pending";
  return "unknown";
}

function MyInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyInterviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();
      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await response.text();

      if (response.status === 401 || response.status === 403) {
        throw new Error("Your session is not authorized. Please sign in again.");
      }

      if (!response.ok) {
        throw new Error(`Unable to load interviews (error ${response.status}).`);
      }

      if (!responseText.trim()) {
        setInterviews([]);
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("The server returned an invalid response. Please try again.");
      }

      setInterviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("My Interviews error:", err);
      setError(err.message || "Something went wrong while loading your interviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyInterviews();
  }, [fetchMyInterviews]);

  const sortedInterviews = useMemo(() => {
    return [...interviews].sort((a, b) => {
      const dateA = new Date(a.completedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.completedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [interviews]);

  const completedCount = interviews.filter(
    (item) => String(item.status || "").toUpperCase() === "COMPLETED"
  ).length;

  const inProgressCount = interviews.filter((item) => {
    const status = String(item.status || "").toUpperCase();
    return status === "IN_PROGRESS" || status === "STARTED";
  }).length;

  return (
    <section className="nexprep-page nexprep-interviews">
      <style>{`
        .nexprep-interviews {
          --ni-bg: #0b1020;
          --ni-panel: rgba(19, 27, 49, .82);
          --ni-border: rgba(151, 164, 205, .15);
          --ni-muted: #9aa7c2;
          --ni-text: #f3f5ff;
          --ni-purple: #a78bfa;
          width: 100%;
          min-height: 100%;
          color: var(--ni-text);
        }
        .nexprep-interviews * { box-sizing: border-box; }
        .nexprep-interviews .nexprep-page-head {
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 16px; margin-bottom: 24px;
        }
        .nexprep-interviews .nexprep-kicker {
          margin: 0 0 8px; color: #b49aff; font-size: 11px; font-weight: 800;
          letter-spacing: 1.7px; text-transform: uppercase;
        }
        .nexprep-interviews .nexprep-page-head h2 {
          margin: 0; color: #f7f7ff; font-size: clamp(25px, 3vw, 33px);
          letter-spacing: -.9px; font-weight: 800;
        }
        .nexprep-interviews .nexprep-page-head p:not(.nexprep-kicker) {
          margin: 8px 0 0; color: var(--ni-muted); font-size: 14px; line-height: 1.6;
        }
        .nexprep-interviews .nexprep-refresh {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid rgba(167,139,250,.35);
          background: rgba(124, 92, 220, .13); color: #d8ccff;
          border-radius: 11px; padding: 10px 15px; font-size: 13px;
          font-weight: 750; cursor: pointer; transition: .2s ease;
        }
        .nexprep-interviews .nexprep-refresh:hover {
          background: rgba(124, 92, 220, .25); border-color: rgba(167,139,250,.65);
          transform: translateY(-1px);
        }
        .nexprep-interviews .nexprep-interview-summary {
          display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px; margin-bottom: 17px;
        }
        .nexprep-interviews .nexprep-summary-item {
          position: relative; overflow: hidden; padding: 16px 18px;
          border: 1px solid var(--ni-border); border-radius: 15px;
          background: linear-gradient(135deg, rgba(27,37,66,.94), rgba(17,24,45,.9));
        }
        .nexprep-interviews .nexprep-summary-item:after {
          content: ""; position: absolute; width: 90px; height: 90px;
          right: -35px; top: -48px; border-radius: 50%;
          background: rgba(139, 92, 246, .13); filter: blur(3px);
        }
        .nexprep-interviews .nexprep-summary-value {
          display: block; color: #fff; font-size: 24px; font-weight: 800;
          letter-spacing: -.6px; line-height: 1.1;
        }
        .nexprep-interviews .nexprep-summary-label {
          display: block; margin-top: 7px; color: var(--ni-muted);
          font-size: 12px; font-weight: 600;
        }
        .nexprep-interviews .nexprep-interview-list {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px;
        }
        .nexprep-interviews .nexprep-interview-card {
          min-width: 0; padding: 19px;
          border: 1px solid var(--ni-border); border-radius: 16px;
          background: linear-gradient(145deg, rgba(22,31,56,.96), rgba(15,22,42,.96));
          box-shadow: 0 8px 24px rgba(0,0,0,.12);
          transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
        }
        .nexprep-interviews .nexprep-interview-card:hover {
          transform: translateY(-3px); border-color: rgba(167,139,250,.42);
          box-shadow: 0 14px 30px rgba(0,0,0,.2), 0 0 24px rgba(124,92,220,.07);
        }
        .nexprep-interviews .nexprep-interview-card-top {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
        }
        .nexprep-interviews .nexprep-interview-id {
          margin: 0 0 7px; color: #8997b6; font-size: 10px; font-weight: 800;
          letter-spacing: 1.2px; text-transform: uppercase;
        }
        .nexprep-interviews .nexprep-interview-card h3 {
          margin: 0; color: #f3f5ff; font-size: 17px; font-weight: 750;
          overflow-wrap: anywhere;
        }
        .nexprep-interviews .nexprep-status {
          flex-shrink: 0; padding: 6px 9px; border: 1px solid transparent;
          border-radius: 999px; font-size: 10px; font-weight: 800;
          letter-spacing: .35px; text-transform: capitalize;
        }
        .nexprep-interviews .nexprep-status.completed {
          color: #7ee4b0; background: rgba(34,197,94,.11); border-color: rgba(74,222,128,.2);
        }
        .nexprep-interviews .nexprep-status.pending {
          color: #f8d58a; background: rgba(245,158,11,.11); border-color: rgba(245,158,11,.2);
        }
        .nexprep-interviews .nexprep-status.in-progress {
          color: #91c5ff; background: rgba(59,130,246,.12); border-color: rgba(96,165,250,.22);
        }
        .nexprep-interviews .nexprep-status.unknown {
          color: #b7c0d3; background: rgba(148,163,184,.1); border-color: rgba(148,163,184,.18);
        }
        .nexprep-interviews .nexprep-interview-details {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px 13px; margin-top: 19px; padding-top: 15px;
          border-top: 1px solid rgba(151,164,205,.12);
        }
        .nexprep-interviews .nexprep-detail-label {
          display: block; margin-bottom: 5px; color: #8794af;
          font-size: 11px; font-weight: 600;
        }
        .nexprep-interviews .nexprep-detail-value {
          display: block; color: #e0e6f5; font-size: 13px; font-weight: 700;
          overflow-wrap: anywhere;
        }
        .nexprep-interviews .nexprep-score { color: #c4b5fd; font-size: 16px; }
        .nexprep-interviews .nexprep-empty,
        .nexprep-interviews .nexprep-message {
          padding: 38px 22px; border: 1px solid var(--ni-border);
          border-radius: 16px; text-align: center;
          background: linear-gradient(145deg, rgba(22,31,56,.96), rgba(15,22,42,.96));
        }
        .nexprep-interviews .nexprep-empty-icon {
          display: grid; place-items: center; width: 48px; height: 48px;
          margin: 0 auto 14px; border-radius: 15px;
          background: linear-gradient(135deg, rgba(139,92,246,.24), rgba(56,189,248,.14));
          color: #d6c7ff; font-size: 22px;
        }
        .nexprep-interviews .nexprep-empty h3,
        .nexprep-interviews .nexprep-message h3 {
          margin: 0 0 7px; color: #f3f5ff; font-size: 17px;
        }
        .nexprep-interviews .nexprep-empty p,
        .nexprep-interviews .nexprep-message p {
          margin: 0; color: var(--ni-muted); font-size: 13px; line-height: 1.65;
        }
        .nexprep-interviews .nexprep-retry {
          margin-top: 16px; border: 0; border-radius: 10px;
          background: linear-gradient(100deg, #7652dc, #477fe8);
          color: #fff; padding: 10px 16px; font-weight: 750; cursor: pointer;
        }
        .nexprep-interviews .nexprep-retry:hover { filter: brightness(1.1); }
        .nexprep-interviews .nexprep-loading-dot {
          display: inline-block; width: 7px; height: 7px; margin: 0 3px;
          border-radius: 50%; background: #a78bfa; animation: ni-pulse 1s infinite alternate;
        }
        .nexprep-interviews .nexprep-loading-dot:nth-child(2) { animation-delay: .2s; }
        .nexprep-interviews .nexprep-loading-dot:nth-child(3) { animation-delay: .4s; }
        @keyframes ni-pulse { from { opacity: .3; transform: translateY(0); } to { opacity: 1; transform: translateY(-4px); } }
        @media(max-width:760px) {
          .nexprep-interviews .nexprep-interview-list { grid-template-columns: 1fr; }
          .nexprep-interviews .nexprep-page-head { align-items: flex-start; }
        }
        @media(max-width:520px) {
          .nexprep-interviews .nexprep-page-head { flex-direction: column; }
          .nexprep-interviews .nexprep-refresh { align-self: flex-start; }
          .nexprep-interviews .nexprep-interview-summary { gap: 8px; }
          .nexprep-interviews .nexprep-summary-item { padding: 14px 12px; }
          .nexprep-interviews .nexprep-summary-value { font-size: 21px; }
          .nexprep-interviews .nexprep-summary-label { font-size: 11px; }
          .nexprep-interviews .nexprep-interview-card { padding: 16px; }
        }
      `}</style>

      <div className="nexprep-page-head">
        <div>
          <p>Review your interview attempts, results and completion status.</p>
        </div>
        <button className="nexprep-refresh" type="button" onClick={fetchMyInterviews}>
          <span aria-hidden="true">↻</span> Refresh
        </button>
      </div>

      {loading ? (
        <div className="nexprep-message" role="status">
          <h3>Loading your interviews</h3>
          <p>Please wait while we retrieve your interview activity.</p>
          <div aria-hidden="true" style={{ marginTop: 15 }}>
            <span className="nexprep-loading-dot" />
            <span className="nexprep-loading-dot" />
            <span className="nexprep-loading-dot" />
          </div>
        </div>
      ) : error ? (
        <div className="nexprep-message" role="alert">
          <h3>We couldn't load your interviews</h3>
          <p>{error}</p>
          <button className="nexprep-retry" type="button" onClick={fetchMyInterviews}>
            Try again
          </button>
        </div>
      ) : interviews.length === 0 ? (
        <div className="nexprep-empty">
          <div className="nexprep-empty-icon">✦</div>
          <h3>Your interview history starts here</h3>
          <p>Once you start an interview test, its activity and results will appear here.</p>
        </div>
      ) : (
        <>
          <div className="nexprep-interview-summary">
            <div className="nexprep-summary-item">
              <span className="nexprep-summary-value">{interviews.length}</span>
              <span className="nexprep-summary-label">Total interviews</span>
            </div>
            <div className="nexprep-summary-item">
              <span className="nexprep-summary-value">{completedCount}</span>
              <span className="nexprep-summary-label">Completed</span>
            </div>
            <div className="nexprep-summary-item">
              <span className="nexprep-summary-value">{inProgressCount}</span>
              <span className="nexprep-summary-label">In progress</span>
            </div>
          </div>

          <div className="nexprep-interview-list">
            {sortedInterviews.map((interview, index) => {
              const statusClass = getStatus(interview.status);
              const score = interview.score;
              const interviewId = interview.id ?? interview.interviewId ?? index;

              return (
                <article className="nexprep-interview-card" key={interviewId}>
                  <div className="nexprep-interview-card-top">
                    <div>
                      <p className="nexprep-interview-id">Interview #{interviewId}</p>
                      <h3>{interview.technology || "Technical Interview"}</h3>
                    </div>
                    <span className={`nexprep-status ${statusClass}`}>
                      {String(interview.status || "Unknown").replaceAll("_", " ").toLowerCase()}
                    </span>
                  </div>

                  <div className="nexprep-interview-details">
                    <div>
                      <span className="nexprep-detail-label">Difficulty</span>
                      <span className="nexprep-detail-value">
                        {interview.difficulty || "Not specified"}
                      </span>
                    </div>
                    <div>
                      <span className="nexprep-detail-label">Score</span>
                      <span className="nexprep-detail-value nexprep-score">
                        {score === null || score === undefined ? "Not evaluated" : `${score}/10`}
                      </span>
                    </div>
                    <div>
                      <span className="nexprep-detail-label">Started</span>
                      <span className="nexprep-detail-value">
                        {formatDate(interview.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="nexprep-detail-label">Completed</span>
                      <span className="nexprep-detail-value">
                        {formatDate(interview.completedAt)}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

export default MyInterviews;
