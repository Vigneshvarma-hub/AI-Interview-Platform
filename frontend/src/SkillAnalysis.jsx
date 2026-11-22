import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/skill-analysis/my";

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

function SkillAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSkillAnalysis = useCallback(async () => {
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
        throw new Error(`Unable to load skill analysis (error ${response.status}).`);
      }

      if (!responseText.trim()) {
        setAnalysis(null);
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("The server returned an invalid response. Please try again.");
      }

      setAnalysis(data);
    } catch (err) {
      console.error("Skill Analysis error:", err);
      setError(err.message || "Something went wrong while loading skill analysis.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkillAnalysis();
  }, [fetchSkillAnalysis]);

  const technologies = Array.isArray(analysis?.technologyPerformance)
    ? analysis.technologyPerformance
    : [];

  const averageScore = Number(analysis?.overallAverageScore);
  const hasAverage = Number.isFinite(averageScore);
  const averagePercent = hasAverage
    ? Math.min(100, Math.max(0, averageScore * 10))
    : 0;

  const scoredTechnologies = technologies.filter((item) =>
    Number.isFinite(Number(item.averageScore))
  );
  const strongestTechnology = scoredTechnologies.length
    ? [...scoredTechnologies].sort(
        (a, b) => Number(b.averageScore) - Number(a.averageScore)
      )[0]
    : null;

  return (
    <section className="nexprep-page nexprep-skills">
      <style>{`
        .nexprep-skills{
          --skill-bg:#0b1020;
          --skill-panel:#141b2e;
          --skill-panel-2:#18213a;
          --skill-border:rgba(166,153,220,.16);
          --skill-text:#f4f2ff;
          --skill-muted:#9ba6c0;
          --skill-purple:#9565ff;
          --skill-blue:#55a7ff;
          width:100%;
          color:var(--skill-text);
          animation:skillPageIn .45s ease both;
        }
        .nexprep-skills *{box-sizing:border-box}
        @keyframes skillPageIn{
          from{opacity:0;transform:translateY(10px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes skillShimmer{
          from{background-position:0 0}
          to{background-position:200% 0}
        }
        .nexprep-skills .nexprep-page-head{
          display:flex;align-items:center;justify-content:flex-end;
          gap:18px;margin-bottom:18px
        }
        .nexprep-skills .nexprep-kicker{
          margin:0 0 9px;color:#ad8cff;font-size:11px;font-weight:800;
          letter-spacing:1.7px;text-transform:uppercase
        }
        .nexprep-skills .nexprep-page-head h2{
          margin:0;color:#f7f5ff;font-size:clamp(26px,3vw,34px);
          letter-spacing:-.9px;font-weight:800
        }
        .nexprep-skills .nexprep-page-head p{
          margin:8px 0 0;color:var(--skill-muted);font-size:14px;line-height:1.6
        }
        .nexprep-skills .nexprep-refresh{
          display:inline-flex;align-items:center;gap:8px;flex-shrink:0;
          border:1px solid rgba(167,139,250,.3);
          background:rgba(149,101,255,.10);color:#d8c8ff;
          border-radius:11px;padding:10px 15px;font-weight:750;
          cursor:pointer;transition:.2s ease
        }
        .nexprep-skills .nexprep-refresh:hover{
          transform:translateY(-2px);background:rgba(149,101,255,.19);
          border-color:rgba(167,139,250,.6)
        }
        .nexprep-skills .nexprep-skill-overview{
          display:grid;grid-template-columns:minmax(0,1.45fr) minmax(220px,.75fr);
          gap:16px;margin-bottom:27px
        }
        .nexprep-skills .nexprep-skill-score-card,
        .nexprep-skills .nexprep-skill-focus-card{
          position:relative;overflow:hidden;min-height:170px;padding:23px;
          background:linear-gradient(145deg,rgba(25,32,55,.98),rgba(17,23,42,.98));
          border:1px solid var(--skill-border);border-radius:18px;
          box-shadow:0 14px 35px rgba(0,0,0,.13)
        }
        .nexprep-skills .nexprep-skill-score-card:after{
          content:"";position:absolute;width:220px;height:220px;right:-75px;top:-125px;
          border-radius:50%;background:rgba(130,86,255,.16);filter:blur(3px)
        }
        .nexprep-skills .nexprep-skill-card-label{
          display:block;color:#aab4cb;font-size:12px;font-weight:700;
          letter-spacing:.2px
        }
        .nexprep-skills .nexprep-skill-big-score{
          position:relative;z-index:1;display:flex;align-items:baseline;
          gap:7px;margin:13px 0 16px
        }
        .nexprep-skills .nexprep-skill-big-score strong{
          color:#fff;font-size:43px;line-height:1;font-weight:850;letter-spacing:-1.8px
        }
        .nexprep-skills .nexprep-skill-big-score span{
          color:#929db7;font-size:14px;font-weight:650
        }
        .nexprep-skills .nexprep-skill-progress,
        .nexprep-skills .nexprep-tech-bar{
          height:9px;overflow:hidden;border-radius:99px;
          background:rgba(148,163,184,.14)
        }
        .nexprep-skills .nexprep-skill-progress span{
          display:block;height:100%;border-radius:99px;
          background:linear-gradient(90deg,#8654f6,#5b9cff);
          box-shadow:0 0 16px rgba(137,91,255,.38);
          transition:width .7s cubic-bezier(.2,.8,.2,1)
        }
        .nexprep-skills .nexprep-score-caption{
          display:flex;justify-content:space-between;gap:12px;margin-top:10px;
          color:#8793ad;font-size:11px
        }
        .nexprep-skills .nexprep-skill-focus-card{
          display:flex;flex-direction:column;justify-content:center;
          background:linear-gradient(145deg,rgba(35,28,65,.95),rgba(19,29,55,.98))
        }
        .nexprep-skills .nexprep-focus-icon{
          display:grid;place-items:center;width:36px;height:36px;margin-bottom:12px;
          border-radius:11px;background:rgba(149,101,255,.17);color:#c4a8ff;
          font-size:18px
        }
        .nexprep-skills .nexprep-skill-focus-card strong{
          display:block;color:#fff;font-size:32px;line-height:1.1;font-weight:850
        }
        .nexprep-skills .nexprep-skill-focus-card p{
          margin:7px 0 0;color:#9ca8c2;font-size:12px;line-height:1.5
        }
        .nexprep-skills .nexprep-section-title{
          display:flex;align-items:flex-end;justify-content:space-between;
          gap:12px;margin:28px 0 14px
        }
        .nexprep-skills .nexprep-section-title h3{
          margin:0;color:#f2efff;font-size:18px;font-weight:800;letter-spacing:-.3px
        }
        .nexprep-skills .nexprep-section-title p{
          margin:5px 0 0;color:#929db6;font-size:12px
        }
        .nexprep-skills .nexprep-section-count{
          color:#a991ed;font-size:11px;font-weight:750;
          background:rgba(149,101,255,.12);border:1px solid rgba(149,101,255,.2);
          padding:6px 10px;border-radius:99px
        }
        .nexprep-skills .nexprep-tech-list{
          display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px
        }
        .nexprep-skills .nexprep-tech-card{
          min-width:0;padding:19px;background:linear-gradient(145deg,#151d32,#11182a);
          border:1px solid var(--skill-border);border-radius:16px;
          transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease;
          animation:skillPageIn .45s ease both
        }
        .nexprep-skills .nexprep-tech-card:hover{
          transform:translateY(-3px);border-color:rgba(157,121,255,.42);
          box-shadow:0 12px 28px rgba(0,0,0,.17)
        }
        .nexprep-skills .nexprep-tech-card-top{
          display:flex;justify-content:space-between;align-items:flex-start;
          gap:12px;margin-bottom:16px
        }
        .nexprep-skills .nexprep-tech-card h4{
          margin:0;color:#f2efff;font-size:15px;font-weight:750;
          overflow-wrap:anywhere
        }
        .nexprep-skills .nexprep-tech-count{
          display:block;margin-top:6px;color:#8793ad;font-size:11px
        }
        .nexprep-skills .nexprep-tech-score{
          color:#c4a8ff;font-size:17px;font-weight:850;white-space:nowrap
        }
        .nexprep-skills .nexprep-tech-bar span{
          display:block;height:100%;border-radius:99px;
          background:linear-gradient(90deg,#8654f6,#55a7ff);
          transition:width .7s ease
        }
        .nexprep-skills .nexprep-tech-footer{
          display:flex;justify-content:space-between;gap:10px;margin-top:11px;
          color:#8793ad;font-size:11px
        }
        .nexprep-skills .nexprep-tech-footer strong{
          color:#d5c8ff;font-weight:750
        }
        .nexprep-skills .nexprep-best-skill{
          display:inline-flex;margin-top:12px;padding:5px 8px;border-radius:7px;
          color:#9ee8ce;background:rgba(34,197,143,.10);
          border:1px solid rgba(34,197,143,.18);font-size:10px;font-weight:750
        }
        .nexprep-skills .nexprep-skill-empty,
        .nexprep-skills .nexprep-skill-message{
          padding:34px 22px;background:linear-gradient(145deg,#151d32,#11182a);
          border:1px solid var(--skill-border);border-radius:16px;text-align:center
        }
        .nexprep-skills .nexprep-skill-empty h3,
        .nexprep-skills .nexprep-skill-message h3{
          margin:0 0 8px;color:#f2efff;font-size:17px;font-weight:800
        }
        .nexprep-skills .nexprep-skill-empty p,
        .nexprep-skills .nexprep-skill-message p{
          margin:0;color:#9ba6bf;font-size:13px;line-height:1.65
        }
        .nexprep-skills .nexprep-retry{
          margin-top:16px;border:0;border-radius:10px;
          background:linear-gradient(100deg,#8050ed,#596dff);
          color:#fff;padding:10px 16px;font-weight:750;cursor:pointer
        }
        @media(max-width:760px){
          .nexprep-skills .nexprep-skill-overview{grid-template-columns:1fr}
          .nexprep-skills .nexprep-tech-list{grid-template-columns:1fr}
        }
        @media(max-width:480px){
          .nexprep-skills .nexprep-refresh{width:auto;justify-content:center}
          .nexprep-skills .nexprep-skill-score-card,
          .nexprep-skills .nexprep-skill-focus-card{padding:19px}
        }
      `}</style>

      <div className="nexprep-page-head">
        <button
          className="nexprep-refresh"
          type="button"
          onClick={fetchSkillAnalysis}
          disabled={loading}
        >
          <span aria-hidden="true">↻</span>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="nexprep-skill-message" role="status">
          <h3>Loading your skill insights</h3>
          <p>Your latest performance data is being retrieved.</p>
        </div>
      ) : error ? (
        <div className="nexprep-skill-message" role="alert">
          <h3>We couldn't load your skill analysis</h3>
          <p>{error}</p>
          <button className="nexprep-retry" type="button" onClick={fetchSkillAnalysis}>
            Try again
          </button>
        </div>
      ) : !analysis ? (
        <div className="nexprep-skill-empty">
          <h3>Your skill profile is waiting to be built</h3>
          <p>Complete an interview to generate your first skill performance report.</p>
        </div>
      ) : (
        <>
          <div className="nexprep-skill-overview">
            <article className="nexprep-skill-score-card">
              <span className="nexprep-skill-card-label">Overall skill score</span>
              <div className="nexprep-skill-big-score">
                <strong>{hasAverage ? averageScore.toFixed(2) : "—"}</strong>
                <span>/ 10</span>
              </div>
              <div
                className="nexprep-skill-progress"
                role="progressbar"
                aria-label="Overall skill score"
                aria-valuemin="0"
                aria-valuemax="10"
                aria-valuenow={hasAverage ? averageScore : 0}
              >
                <span style={{ width: `${averagePercent}%` }} />
              </div>
              <div className="nexprep-score-caption">
                <span>Overall performance</span>
                <span>{hasAverage ? `${averagePercent.toFixed(0)}%` : "No score"}</span>
              </div>
            </article>

            <article className="nexprep-skill-focus-card">
              <span className="nexprep-focus-icon" aria-hidden="true">✦</span>
              <span className="nexprep-skill-card-label">Skill areas evaluated</span>
              <strong>{technologies.length}</strong>
              <p>
                {technologies.length === 1
                  ? "Technology area with recorded performance"
                  : "Technology areas with recorded performance"}
              </p>
            </article>
          </div>

          <div className="nexprep-section-title">
            <div>
              <h3>Technology performance</h3>
              <p>Average score across your interview technologies</p>
            </div>
            <span className="nexprep-section-count">
              {technologies.length} {technologies.length === 1 ? "area" : "areas"}
            </span>
          </div>

          {technologies.length === 0 ? (
            <div className="nexprep-skill-empty">
              <h3>Technology results will appear here</h3>
              <p>Complete an interview to see your score breakdown by technology.</p>
            </div>
          ) : (
            <div className="nexprep-tech-list">
              {technologies.map((item) => {
                const score = Number(item.averageScore);
                const validScore = Number.isFinite(score);
                const percentage = validScore
                  ? Math.min(100, Math.max(0, score * 10))
                  : 0;
                const isStrongest =
                  strongestTechnology &&
                  strongestTechnology.technology === item.technology;

                return (
                  <article className="nexprep-tech-card" key={item.technology}>
                    <div className="nexprep-tech-card-top">
                      <div>
                        <h4>{item.technology || "Technology"}</h4>
                        <span className="nexprep-tech-count">
                          {item.interviewCount ?? 0} interview
                          {Number(item.interviewCount) === 1 ? "" : "s"}
                        </span>
                        {isStrongest && (
                          <span className="nexprep-best-skill">Top performing area</span>
                        )}
                      </div>
                      <span className="nexprep-tech-score">
                        {validScore ? `${score.toFixed(2)}/10` : "—"}
                      </span>
                    </div>
                    <div
                      className="nexprep-tech-bar"
                      role="progressbar"
                      aria-label={`${item.technology || "Technology"} performance`}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-valuenow={percentage}
                    >
                      <span style={{ width: `${percentage}%` }} />
                    </div>
                    <div className="nexprep-tech-footer">
                      <span>Performance</span>
                      <strong>{validScore ? `${percentage.toFixed(0)}%` : "No score"}</strong>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default SkillAnalysis;
