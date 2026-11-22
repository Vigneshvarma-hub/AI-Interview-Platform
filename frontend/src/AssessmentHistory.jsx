import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:8080/api/interviews/history";

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

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusClass(status) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "COMPLETED") return "completed";
  if (normalized === "IN_PROGRESS" || normalized === "STARTED") return "in-progress";
  return "pending";
}

function AssessmentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = useCallback(async () => {
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

      if (response.status === 401 || response.status === 403) {
        throw new Error("Your session is not authorized. Please sign in again.");
      }

      if (!response.ok) {
        throw new Error(`Unable to load assessment history (error ${response.status}).`);
      }

      const responseText = await response.text();

      if (!responseText.trim()) {
        setHistory([]);
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("The server returned an invalid response. Please try again.");
      }

      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Assessment history error:", err);
      setError(err.message || "Something went wrong while loading assessment history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      const dateA = new Date(a.completedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.completedAt || b.createdAt || 0).getTime();

      return (Number.isFinite(dateB) ? dateB : 0) -
        (Number.isFinite(dateA) ? dateA : 0);
    });
  }, [history]);

  return (
    <section className="nexprep-page nexprep-assessments">
      <style>{`
        .nexprep-assessments{--a-text:#f5f3ff;--a-muted:#9da8c1;--a-border:rgba(168,151,224,.17);width:100%;color:var(--a-text);animation:assessmentEnter .45s ease both}
        .nexprep-assessments *{box-sizing:border-box}
        @keyframes assessmentEnter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .nexprep-assessments .nexprep-page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:24px}
        .nexprep-assessments .nexprep-kicker{margin:0 0 8px;color:#b596ff;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase}
        .nexprep-assessments .nexprep-page-head h2{margin:0;color:#f7f5ff;font-size:clamp(26px,3vw,34px);font-weight:820;letter-spacing:-.9px}
        .nexprep-assessments .nexprep-page-head p{margin:8px 0 0;color:var(--a-muted);font-size:14px;line-height:1.6}
        .nexprep-assessments .nexprep-refresh{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(167,139,250,.3);background:rgba(149,101,255,.11);color:#d9caff;border-radius:11px;padding:10px 15px;font-weight:750;cursor:pointer;transition:transform .2s ease,background .2s ease}
        .nexprep-assessments .nexprep-refresh:hover{transform:translateY(-2px);background:rgba(149,101,255,.2)}
        .nexprep-assessments .nexprep-assessment-list{display:grid;gap:11px}
        .nexprep-assessments .nexprep-assessment-row{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(100px,.8fr) minmax(100px,.7fr) minmax(100px,.8fr);align-items:center;gap:16px;padding:17px 19px;background:linear-gradient(145deg,rgba(24,32,55,.98),rgba(17,24,43,.98));border:1px solid var(--a-border);border-radius:15px;box-shadow:0 10px 28px rgba(0,0,0,.12);transition:border-color .2s ease,transform .2s ease,box-shadow .2s ease}
        .nexprep-assessments .nexprep-assessment-row:hover{transform:translateY(-2px);border-color:rgba(164,130,255,.42);box-shadow:0 14px 30px rgba(0,0,0,.2)}
        .nexprep-assessments .nexprep-assessment-primary{min-width:0}
        .nexprep-assessments .nexprep-assessment-id{display:block;margin-bottom:6px;color:#ae91f2;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase}
        .nexprep-assessments .nexprep-assessment-primary strong{display:block;overflow:hidden;color:#f4f1ff;font-size:15px;font-weight:750;text-overflow:ellipsis;white-space:nowrap}
        .nexprep-assessments .nexprep-assessment-meta-label{display:block;margin-bottom:5px;color:#8996b1;font-size:10px;font-weight:750;letter-spacing:.6px;text-transform:uppercase}
        .nexprep-assessments .nexprep-assessment-date{margin-top:6px;margin-bottom:0;color:#8d9ab5;font-weight:600;letter-spacing:0;text-transform:none}
        .nexprep-assessments .nexprep-assessment-meta-value{display:block;color:#c4cce0;font-size:13px;font-weight:650}
        .nexprep-assessments .nexprep-assessment-score{color:#c5aaff;font-size:16px;font-weight:850}
        .nexprep-assessments .nexprep-assessment-status{display:inline-flex;align-items:center;width:max-content;max-width:100%;padding:6px 10px;border:1px solid transparent;border-radius:999px;font-size:10px;font-weight:800;text-transform:capitalize}
        .nexprep-assessments .nexprep-assessment-status.completed{background:rgba(42,190,137,.13);border-color:rgba(75,211,166,.2);color:#8ce4c2}
        .nexprep-assessments .nexprep-assessment-status.pending{background:rgba(242,177,76,.12);border-color:rgba(242,177,76,.2);color:#f4cb82}
        .nexprep-assessments .nexprep-assessment-status.in-progress{background:rgba(82,145,255,.13);border-color:rgba(82,145,255,.2);color:#9bc4ff}
        .nexprep-assessments .nexprep-assessment-status.unknown{background:rgba(148,163,184,.12);border-color:rgba(148,163,184,.18);color:#b4bfd2}
        .nexprep-assessments .nexprep-assessment-header{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(100px,.8fr) minmax(100px,.7fr) minmax(100px,.8fr);gap:16px;padding:0 19px 10px;color:#8793ad;font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase}
        .nexprep-assessments .nexprep-assessment-empty,.nexprep-assessments .nexprep-assessment-message{padding:38px 22px;background:linear-gradient(145deg,#171f35,#11182a);border:1px solid var(--a-border);border-radius:16px;text-align:center}
        .nexprep-assessments .nexprep-assessment-empty-icon{display:grid;place-items:center;width:48px;height:48px;margin:0 auto 14px;border:1px solid rgba(167,139,250,.2);border-radius:15px;background:rgba(149,101,255,.14);color:#c4a8ff;font-size:22px}
        .nexprep-assessments .nexprep-assessment-empty h3,.nexprep-assessments .nexprep-assessment-message h3{margin:0 0 7px;color:#f2efff;font-size:17px;font-weight:800}
        .nexprep-assessments .nexprep-assessment-empty p,.nexprep-assessments .nexprep-assessment-message p{margin:0;color:#9ba6bf;font-size:13px;line-height:1.65}
        .nexprep-assessments .nexprep-retry{margin-top:16px;border:0;border-radius:10px;background:linear-gradient(100deg,#8050ed,#596dff);color:#fff;padding:10px 16px;font-weight:750;cursor:pointer}
        @media(max-width:760px){
          .nexprep-assessments .nexprep-assessment-header{display:none}
          .nexprep-assessments .nexprep-assessment-row{grid-template-columns:minmax(0,1fr) auto;gap:13px;padding:15px}
          .nexprep-assessments .nexprep-assessment-primary{grid-column:1}
          .nexprep-assessments .nexprep-assessment-status{grid-column:2;grid-row:1}
          .nexprep-assessments .nexprep-assessment-meta{grid-row:2}
        }
        @media(max-width:430px){
          .nexprep-assessments .nexprep-page-head{align-items:flex-start}
          .nexprep-assessments .nexprep-assessment-row{grid-template-columns:1fr 1fr}
          .nexprep-assessments .nexprep-assessment-primary{grid-column:1/-1}
          .nexprep-assessments .nexprep-assessment-status{grid-column:1/-1;grid-row:auto}
        }
      `}</style>

      <div className="nexprep-page-head">
        <div>
          <p>Review your assessment results and completion status.</p>
        </div>
        <button className="nexprep-refresh" type="button" onClick={fetchHistory}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="nexprep-assessment-message" role="status">
          <h3>Loading your assessments</h3>
          <p>Your assessment history will appear here in a moment.</p>
        </div>
      ) : error ? (
        <div className="nexprep-assessment-message" role="alert">
          <h3>We couldn't load your assessments</h3>
          <p>{error}</p>
          <button className="nexprep-retry" type="button" onClick={fetchHistory}>
            Try again
          </button>
        </div>
      ) : sortedHistory.length === 0 ? (
        <div className="nexprep-assessment-empty">
          <div className="nexprep-assessment-empty-icon">✓</div>
          <h3>No assessment results yet</h3>
          <p>When you complete an assessment, your result will be listed here.</p>
        </div>
      ) : (
        <>
          <div className="nexprep-assessment-header" aria-hidden="true">
            <span>Assessment</span>
            <span>Difficulty</span>
            <span>Score</span>
            <span>Status</span>
          </div>

          <div className="nexprep-assessment-list">
            {sortedHistory.map((item, index) => {
              const status = String(item.status || "UNKNOWN");
              const statusClass = getStatusClass(status);
              const assessmentId = item.interviewId ?? item.id ?? index + 1;
              const score =
                item.score === null || item.score === undefined
                  ? "Not evaluated"
                  : `${item.score}`;

              return (
                <article
                  className="nexprep-assessment-row"
                  key={assessmentId}
                >
                  <div className="nexprep-assessment-primary">
                    <span className="nexprep-assessment-id">
                      Assessment #{assessmentId}
                    </span>
                    <strong>{item.technology || "General assessment"}</strong>
                    <span className="nexprep-assessment-meta-label nexprep-assessment-date">
                      {formatDate(item.completedAt || item.createdAt)}
                    </span>
                  </div>

                  <div className="nexprep-assessment-meta">
                    <span className="nexprep-assessment-meta-label">Difficulty</span>
                    <span className="nexprep-assessment-meta-value">
                      {item.difficulty || "Not specified"}
                    </span>
                  </div>

                  <div className="nexprep-assessment-meta">
                    <span className="nexprep-assessment-meta-label">Score</span>
                    <span className="nexprep-assessment-score">{score}</span>
                  </div>

                  <div className="nexprep-assessment-meta">
                    <span className="nexprep-assessment-meta-label">Status</span>
                    <span className={`nexprep-assessment-status ${statusClass}`}>
                      {status.replaceAll("_", " ").toLowerCase()}
                    </span>
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

export default AssessmentHistory;
