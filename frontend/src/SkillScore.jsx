import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:8080/api/skill-scores/my";

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

function getScoreLabel(score) {
  if (score >= 8) return "Strong";
  if (score >= 6) return "Good";
  if (score >= 4) return "Needs improvement";
  return "Needs practice";
}

function SkillScore() {
  const [skillScores, setSkillScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSkillScores = useCallback(async () => {
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
        throw new Error(
          responseText || `Unable to load skill scores (error ${response.status}).`
        );
      }

      if (!responseText.trim()) {
        setSkillScores([]);
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("The server returned an invalid response. Please try again.");
      }

      setSkillScores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Skill score error:", err);
      setError(err.message || "Something went wrong while loading skill scores.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkillScores();
  }, [fetchSkillScores]);

  const overallScore = useMemo(() => {
    if (skillScores.length === 0) return 0;

    const scores = skillScores
      .map((skill) => Number(skill.score))
      .filter((score) => Number.isFinite(score));

    if (scores.length === 0) return 0;

    return Math.round(
      (scores.reduce((total, score) => total + score, 0) / scores.length) * 100
    ) / 100;
  }, [skillScores]);

  const strongSkills = skillScores.filter(
    (skill) => Number(skill.score) >= 8
  ).length;

  return (
    <section className="nexprep-page nexprep-skill-score">
      <style>{`
        .nexprep-page{width:100%;color:#edf1ff}
        .nexprep-page *{box-sizing:border-box}
        .nexprep-page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:23px}
        .nexprep-kicker{margin:0 0 8px;color:#a995ff;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase}
        .nexprep-page-head h2{margin:0;font-size:clamp(25px,3vw,32px);letter-spacing:-.8px}
        .nexprep-page-head p{margin:8px 0 0;color:#aab4cc;font-size:14px}
        .nexprep-refresh{border:1px solid rgba(167,139,250,.35);background:rgba(124,92,220,.13);color:#d7ccff;border-radius:11px;padding:10px 15px;font-weight:700;cursor:pointer}
        .nexprep-refresh:hover{background:rgba(124,92,220,.24)}
        .nexprep-score-overview{display:grid;grid-template-columns:minmax(0,1.2fr) repeat(2,minmax(130px,.55fr));gap:13px;margin-bottom:22px}
        .nexprep-score-hero,.nexprep-score-stat{padding:20px;background:linear-gradient(145deg,rgba(30,39,70,.96),rgba(21,29,54,.96));border:1px solid rgba(145,158,205,.18);border-radius:15px;box-shadow:0 12px 30px rgba(3,7,18,.18)}
        .nexprep-score-hero{background:linear-gradient(125deg,rgba(42,43,91,.98) 0%,rgba(29,42,76,.98) 100%);border-color:rgba(167,139,250,.28)}
        .nexprep-score-label{display:block;color:#aab6d2;font-size:12px;font-weight:650}
        .nexprep-score-number{display:flex;align-items:baseline;gap:5px;margin:10px 0 13px}
        .nexprep-score-number strong{color:#f4f6ff;font-size:37px;line-height:1;letter-spacing:-1.4px}
        .nexprep-score-number span{color:#aab4cc;font-size:14px}
        .nexprep-score-track{height:8px;overflow:hidden;border-radius:99px;background:rgba(177,190,225,.17)}
        .nexprep-score-track span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#8b5cf6,#38bdf8)}
        .nexprep-score-stat strong{display:block;margin-top:13px;color:#f4f6ff;font-size:27px}
        .nexprep-score-stat p{margin:5px 0 0;color:#9daac6;font-size:11px}
        .nexprep-section-title{margin:0 0 13px;color:#edf1ff;font-size:18px}
        .nexprep-skill-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}
        .nexprep-skill-card{padding:18px;background:linear-gradient(145deg,rgba(29,38,68,.96),rgba(20,28,52,.96));border:1px solid rgba(145,158,205,.18);border-radius:14px;box-shadow:0 8px 24px rgba(3,7,18,.13);transition:border-color .18s ease,transform .18s ease}
        .nexprep-skill-card:hover{transform:translateY(-2px);border-color:rgba(167,139,250,.55)}
        .nexprep-skill-card-top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}
        .nexprep-skill-card h3{margin:0;color:#edf1ff;font-size:15px}
        .nexprep-skill-value{color:#b9a5ff;font-size:17px;font-weight:800;white-space:nowrap}
        .nexprep-skill-track{height:8px;overflow:hidden;border-radius:99px;background:rgba(177,190,225,.17)}
        .nexprep-skill-track span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#8b5cf6,#38bdf8)}
        .nexprep-skill-card-bottom{display:flex;justify-content:space-between;gap:10px;margin-top:11px;color:#9daac6;font-size:11px}
        .nexprep-skill-card-bottom strong{color:#c9d3ec;font-weight:700}
        .nexprep-skill-empty,.nexprep-skill-message{padding:36px 22px;background:linear-gradient(145deg,rgba(30,39,70,.96),rgba(21,29,54,.96));border:1px solid rgba(145,158,205,.18);border-radius:15px;text-align:center;box-shadow:0 12px 30px rgba(3,7,18,.16)}
        .nexprep-skill-empty-icon{display:grid;place-items:center;width:46px;height:46px;margin:0 auto 13px;border-radius:14px;background:rgba(139,92,246,.18);color:#c4b5fd;font-size:22px}
        .nexprep-skill-empty h3,.nexprep-skill-message h3{margin:0 0 7px;color:#f1f4ff;font-size:17px}
        .nexprep-skill-empty p,.nexprep-skill-message p{margin:0;color:#aab6d2;font-size:13px;line-height:1.6}
        .nexprep-retry{margin-top:16px;border:0;border-radius:10px;background:linear-gradient(100deg,#7c3aed,#4f8df7);color:#fff;padding:10px 16px;font-weight:700;cursor:pointer}
        @media(max-width:760px){.nexprep-score-overview{grid-template-columns:1fr 1fr}.nexprep-score-hero{grid-column:1/-1}.nexprep-skill-grid{grid-template-columns:1fr}}
        @media(max-width:430px){.nexprep-page-head{align-items:flex-start}.nexprep-score-overview{grid-template-columns:1fr 1fr}.nexprep-score-hero{grid-column:1/-1}}
      `}</style>

      <div className="nexprep-page-head">
        <div>
          <p className="nexprep-kicker">Your strengths at a glance</p>
          <h2>Skill Score</h2>
          <p>See how you are performing across the skills assessed in your interviews.</p>
        </div>
        <button className="nexprep-refresh" type="button" onClick={fetchSkillScores}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="nexprep-skill-message" role="status">
          <h3>Loading your skill scores</h3>
          <p>Your assessed skills will appear here in a moment.</p>
        </div>
      ) : error ? (
        <div className="nexprep-skill-message" role="alert">
          <h3>We couldn't load your skill scores</h3>
          <p>{error}</p>
          <button className="nexprep-retry" type="button" onClick={fetchSkillScores}>
            Try again
          </button>
        </div>
      ) : skillScores.length === 0 ? (
        <div className="nexprep-skill-empty">
          <div className="nexprep-skill-empty-icon">✦</div>
          <h3>Your skill report is not ready yet</h3>
          <p>Complete an interview to generate scores for the skills you have demonstrated.</p>
        </div>
      ) : (
        <>
          <div className="nexprep-score-overview">
            <article className="nexprep-score-hero">
              <span className="nexprep-score-label">Overall skill score</span>
              <div className="nexprep-score-number">
                <strong>{overallScore.toFixed(2)}</strong>
                <span>/ 10</span>
              </div>
              <div className="nexprep-score-track">
                <span style={{ width: `${Math.min(100, Math.max(0, overallScore * 10))}%` }} />
              </div>
            </article>

            <article className="nexprep-score-stat">
              <span className="nexprep-score-label">Skills assessed</span>
              <strong>{skillScores.length}</strong>
              <p>Recorded skill areas</p>
            </article>

            <article className="nexprep-score-stat">
              <span className="nexprep-score-label">Strong skills</span>
              <strong>{strongSkills}</strong>
              <p>Scores of 8 or higher</p>
            </article>
          </div>

          <h3 className="nexprep-section-title">Your skill breakdown</h3>

          <div className="nexprep-skill-grid">
            {skillScores.map((skill, index) => {
              const score = Number(skill.score);
              const validScore = Number.isFinite(score);
              const safeScore = validScore ? score : 0;
              const percentage = Math.min(100, Math.max(0, safeScore * 10));

              return (
                <article className="nexprep-skill-card" key={skill.skill || index}>
                  <div className="nexprep-skill-card-top">
                    <h3>{skill.skill || "Unnamed skill"}</h3>
                    <span className="nexprep-skill-value">
                      {validScore ? `${safeScore.toFixed(2)}/10` : "—"}
                    </span>
                  </div>

                  <div className="nexprep-skill-track">
                    <span style={{ width: `${percentage}%` }} />
                  </div>

                  <div className="nexprep-skill-card-bottom">
                    <strong>{validScore ? getScoreLabel(safeScore) : "Not scored"}</strong>
                    <span>{skill.totalQuestions ?? 0} questions assessed</span>
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

export default SkillScore;
