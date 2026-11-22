import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/recommendations/my";

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

function getPriorityClass(priority) {
  const normalized = String(priority || "").toUpperCase();

  if (normalized === "HIGH") return "high";
  if (normalized === "MEDIUM") return "medium";
  if (normalized === "LOW") return "low";

  return "normal";
}

function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecommendations = useCallback(async () => {
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
        throw new Error(`Unable to load recommendations (error ${response.status}).`);
      }

      if (!responseText.trim()) {
        setRecommendations([]);
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("The server returned an invalid response. Please try again.");
      }

      setRecommendations(
        Array.isArray(data?.recommendations) ? data.recommendations : []
      );
    } catch (err) {
      console.error("Recommendations error:", err);
      setError(err.message || "Something went wrong while loading recommendations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return (
    <section className="nexprep-page nexprep-recommendations">
      <style>{`
        .nexprep-recommendations {
          width: 100%;
          color: #eef0ff;
          color-scheme: dark;
        }
        .nexprep-recommendations,
        .nexprep-recommendations * {
          box-sizing: border-box;
        }
        .nexprep-recommendations .nexprep-page-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 23px;
        }
        .nexprep-recommendations .nexprep-kicker {
          margin: 0 0 8px;
          color: #b69aff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .nexprep-recommendations .nexprep-page-head h2 {
          margin: 0;
          color: #f2f0ff;
          font-size: clamp(25px, 3vw, 32px);
          letter-spacing: -.8px;
        }
        .nexprep-recommendations .nexprep-page-head p:last-child {
          margin: 8px 0 0;
          color: #aab3cc;
          font-size: 14px;
          line-height: 1.6;
        }
        .nexprep-recommendations .nexprep-refresh {
          flex-shrink: 0;
          border: 1px solid rgba(163, 132, 255, .32);
          background: rgba(115, 75, 210, .16);
          color: #d7c8ff;
          border-radius: 11px;
          padding: 10px 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background .18s ease, transform .18s ease;
        }
        .nexprep-recommendations .nexprep-refresh:hover {
          background: rgba(132, 91, 235, .28);
          transform: translateY(-1px);
        }
        .nexprep-recommendations .nexprep-recommendation-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .nexprep-recommendations .nexprep-recommendation-card {
          min-width: 0;
          padding: 19px;
          background: linear-gradient(145deg, rgba(31, 42, 72, .96), rgba(20, 28, 51, .96));
          border: 1px solid rgba(133, 151, 205, .2);
          border-radius: 15px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, .14);
          transition: transform .18s ease, border-color .18s ease;
        }
        .nexprep-recommendations .nexprep-recommendation-card:hover {
          transform: translateY(-2px);
          border-color: rgba(157, 125, 255, .48);
        }
        .nexprep-recommendations .nexprep-recommendation-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 17px;
        }
        .nexprep-recommendations .nexprep-recommendation-card h3 {
          margin: 0;
          color: #f0efff;
          font-size: 17px;
        }
        .nexprep-recommendations .nexprep-recommendation-subtitle {
          display: block;
          margin-top: 5px;
          color: #9ca8c4;
          font-size: 11px;
        }
        .nexprep-recommendations .nexprep-priority {
          flex-shrink: 0;
          padding: 6px 9px;
          border-radius: 99px;
          font-size: 10px;
          font-weight: 800;
          text-transform: capitalize;
        }
        .nexprep-recommendations .nexprep-priority.high {
          background: rgba(248, 113, 113, .14);
          color: #ffaaa4;
        }
        .nexprep-recommendations .nexprep-priority.medium {
          background: rgba(245, 183, 75, .14);
          color: #ffd18a;
        }
        .nexprep-recommendations .nexprep-priority.low {
          background: rgba(52, 211, 153, .13);
          color: #83e8bd;
        }
        .nexprep-recommendations .nexprep-priority.normal {
          background: rgba(148, 163, 184, .14);
          color: #c0c9da;
        }
        .nexprep-recommendations .nexprep-recommendation-score {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 9px;
        }
        .nexprep-recommendations .nexprep-recommendation-score span {
          color: #aab4cd;
          font-size: 12px;
        }
        .nexprep-recommendations .nexprep-recommendation-score strong {
          color: #c5aaff;
          font-size: 16px;
        }
        .nexprep-recommendations .nexprep-recommendation-track {
          height: 7px;
          overflow: hidden;
          border-radius: 99px;
          background: rgba(137, 151, 190, .22);
        }
        .nexprep-recommendations .nexprep-recommendation-track span {
          display: block;
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #8b5cf6, #38bdf8);
        }
        .nexprep-recommendations .nexprep-practice-box {
          margin-top: 17px;
          padding: 14px 15px;
          border: 1px solid rgba(153, 125, 238, .16);
          border-radius: 11px;
          background: rgba(113, 76, 190, .13);
        }
        .nexprep-recommendations .nexprep-practice-box strong {
          display: block;
          margin-bottom: 6px;
          color: #cbb8ff;
          font-size: 12px;
        }
        .nexprep-recommendations .nexprep-practice-box p {
          margin: 0;
          color: #c0c8dc;
          font-size: 13px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }
        .nexprep-recommendations .nexprep-recommendation-empty,
        .nexprep-recommendations .nexprep-recommendation-message {
          padding: 36px 22px;
          background: linear-gradient(145deg, rgba(31, 42, 72, .96), rgba(20, 28, 51, .96));
          border: 1px solid rgba(133, 151, 205, .2);
          border-radius: 15px;
          text-align: center;
        }
        .nexprep-recommendations .nexprep-recommendation-empty-icon {
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          margin: 0 auto 13px;
          border-radius: 14px;
          background: rgba(52, 211, 153, .13);
          color: #75e0b2;
          font-size: 22px;
        }
        .nexprep-recommendations .nexprep-recommendation-empty h3,
        .nexprep-recommendations .nexprep-recommendation-message h3 {
          margin: 0 0 7px;
          color: #f0efff;
          font-size: 17px;
        }
        .nexprep-recommendations .nexprep-recommendation-empty p,
        .nexprep-recommendations .nexprep-recommendation-message p {
          margin: 0;
          color: #aab4cd;
          font-size: 13px;
          line-height: 1.6;
        }
        .nexprep-recommendations .nexprep-retry {
          margin-top: 16px;
          border: 0;
          border-radius: 10px;
          background: linear-gradient(110deg, #8b5cf6, #536dfe);
          color: #fff;
          padding: 10px 16px;
          font-weight: 700;
          cursor: pointer;
        }
        @media (max-width: 760px) {
          .nexprep-recommendations .nexprep-recommendation-list {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 430px) {
          .nexprep-recommendations .nexprep-page-head {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="nexprep-page-head">
        <div>
          <p className="nexprep-kicker">Your next steps</p>
          <h2>Personalized Recommendations</h2>
          <p>Focus your practice on the areas that can improve your interview performance.</p>
        </div>
        <button className="nexprep-refresh" type="button" onClick={fetchRecommendations}>
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div className="nexprep-recommendation-message" role="status">
          <h3>Preparing your recommendations</h3>
          <p>Reviewing your available skill insights.</p>
        </div>
      ) : error ? (
        <div className="nexprep-recommendation-message" role="alert">
          <h3>We couldn't load your recommendations</h3>
          <p>{error}</p>
          <button className="nexprep-retry" type="button" onClick={fetchRecommendations}>
            Try again
          </button>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="nexprep-recommendation-empty">
          <div className="nexprep-recommendation-empty-icon">✓</div>
          <h3>No priority areas identified</h3>
          <p>Your current report has no recommendations to show. Keep practising and check back after your next assessment.</p>
        </div>
      ) : (
        <div className="nexprep-recommendation-list">
          {recommendations.map((item, index) => {
            const score = Number(item.score);
            const hasScore = Number.isFinite(score);
            const percentage = hasScore
              ? Math.min(100, Math.max(0, score * 10))
              : 0;
            const priorityClass = getPriorityClass(item.priority);

            return (
              <article
                className="nexprep-recommendation-card"
                key={`${item.skill || "skill"}-${index}`}
              >
                <div className="nexprep-recommendation-top">
                  <div>
                    <h3>{item.skill || "Skill to practise"}</h3>
                    <span className="nexprep-recommendation-subtitle">
                      Suggested focus area
                    </span>
                  </div>
                  <span className={`nexprep-priority ${priorityClass}`}>
                    {String(item.priority || "Normal").toLowerCase()} priority
                  </span>
                </div>

                <div className="nexprep-recommendation-score">
                  <span>Current skill score</span>
                  <strong>{hasScore ? `${score.toFixed(1)} / 10` : "Not available"}</strong>
                </div>

                <div className="nexprep-recommendation-track">
                  <span style={{ width: `${percentage}%` }} />
                </div>

                <div className="nexprep-practice-box">
                  <strong>Recommended practice</strong>
                  <p>{item.recommendation || "Continue practising this skill and review your next assessment feedback."}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Recommendations;
