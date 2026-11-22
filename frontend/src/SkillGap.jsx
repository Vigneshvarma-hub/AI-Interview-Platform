import { useCallback, useEffect, useState } from "react";

const INTERVIEWS_API = "http://localhost:8080/api/interviews/my";
const SKILL_GAP_API = "http://localhost:8080/api/skill-gaps/interview";

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

async function readJsonResponse(response, fallbackMessage) {
  const responseText = await response.text();

  if (response.status === 401 || response.status === 403) {
    throw new Error("Your session is not authorized. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error(
      responseText || `${fallbackMessage} (error ${response.status}).`
    );
  }

  if (!responseText.trim()) return null;

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error("The server returned an invalid response. Please try again.");
  }
}

function getGapLevel(score) {
  if (score < 5) return "High gap";
  if (score < 7) return "Medium gap";
  return "Low gap";
}

function getGapMessage(score) {
  if (score < 5) {
    return "Prioritize this area. Revisit the fundamentals and practise regularly.";
  }

  if (score < 7) {
    return "You have a foundation here. Focused practice can help you improve.";
  }

  return "You are performing well in this area. Keep your knowledge sharp.";
}

function getGapClass(score) {
  if (score < 5) return "high";
  if (score < 7) return "medium";
  return "low";
}

function SkillGap() {
  const [skillGap, setSkillGap] = useState(null);
  const [interviewId, setInterviewId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSkillGap = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const interviewResponse = await fetch(INTERVIEWS_API, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const interviews = await readJsonResponse(
        interviewResponse,
        "Unable to load your interviews"
      );

      const completedInterviews = Array.isArray(interviews)
        ? interviews.filter(
            (interview) =>
              String(interview.status || "").toUpperCase() === "COMPLETED"
          )
        : [];

      if (completedInterviews.length === 0) {
        setInterviewId(null);
        setSkillGap(null);
        throw new Error("No completed interview found. Complete an interview first.");
      }

      // Select the most recent completed interview when date fields are available.
      completedInterviews.sort((a, b) => {
        const dateA = new Date(a.completedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.completedAt || b.createdAt || 0).getTime();
        return (Number.isFinite(dateB) ? dateB : 0) -
          (Number.isFinite(dateA) ? dateA : 0);
      });

      const latestInterview = completedInterviews[0];
      const latestId = latestInterview.id || latestInterview.interviewId;

      if (!latestId) {
        throw new Error("The latest completed interview has no valid ID.");
      }

      setInterviewId(latestId);

      const gapResponse = await fetch(
        `${SKILL_GAP_API}/${latestId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const gapData = await readJsonResponse(
        gapResponse,
        "Unable to load skill-gap analysis"
      );

      setSkillGap(gapData);
    } catch (err) {
      console.error("Skill Gap error:", err);
      setError(err.message || "Something went wrong while loading your skill gaps.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSkillGap();
  }, [loadSkillGap]);

  const categoryScores = skillGap?.categoryScores &&
    typeof skillGap.categoryScores === "object"
    ? Object.entries(skillGap.categoryScores)
    : [];

  const weakSkills = Array.isArray(skillGap?.weakSkills)
    ? skillGap.weakSkills
    : [];

  const highGapCount = categoryScores.filter(
    ([, score]) => Number(score) < 5
  ).length;

  return (
    <section className="nexprep-page nexprep-skill-gap">
      <style>{`
        .nexprep-page{width:100%;color:#edf1ff}
        .nexprep-page *{box-sizing:border-box}
        .nexprep-page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:23px}
        .nexprep-kicker{margin:0 0 8px;color:#a995ff;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase}
        .nexprep-page-head h2{margin:0;font-size:clamp(25px,3vw,32px);letter-spacing:-.8px}
        .nexprep-page-head p{margin:8px 0 0;color:#aab4cc;font-size:14px}
        .nexprep-refresh{border:1px solid rgba(167,139,250,.35);background:rgba(124,92,220,.13);color:#d7ccff;border-radius:11px;padding:10px 15px;font-weight:700;cursor:pointer}
        .nexprep-refresh:hover{background:rgba(124,92,220,.24)}
        .nexprep-gap-overview{display:grid;grid-template-columns:minmax(0,1.2fr) repeat(2,minmax(130px,.55fr));gap:13px;margin-bottom:22px}
        .nexprep-gap-hero,.nexprep-gap-stat{padding:20px;background:linear-gradient(145deg,rgba(30,39,70,.96),rgba(21,29,54,.96));border:1px solid rgba(145,158,205,.18);border-radius:15px;box-shadow:0 12px 30px rgba(3,7,18,.18)}
        .nexprep-gap-hero{background:linear-gradient(125deg,rgba(42,43,91,.98) 0%,rgba(29,42,76,.98) 100%);border-color:rgba(167,139,250,.28)}
        .nexprep-gap-label{display:block;color:#aab6d2;font-size:12px;font-weight:650}
        .nexprep-gap-hero strong{display:block;margin:10px 0 4px;color:#f4f6ff;font-size:31px;letter-spacing:-.8px}
        .nexprep-gap-hero p,.nexprep-gap-stat p{margin:5px 0 0;color:#9daac6;font-size:11px;line-height:1.5}
        .nexprep-gap-stat strong{display:block;margin-top:13px;color:#f4f6ff;font-size:27px}
        .nexprep-gap-section-title{margin:0 0 13px;color:#edf1ff;font-size:18px}
        .nexprep-gap-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}
        .nexprep-gap-card{padding:18px;background:linear-gradient(145deg,rgba(29,38,68,.96),rgba(20,28,52,.96));border:1px solid rgba(145,158,205,.18);border-radius:14px;box-shadow:0 8px 24px rgba(3,7,18,.13);transition:border-color .18s ease,transform .18s ease}
        .nexprep-gap-card:hover{transform:translateY(-2px);border-color:rgba(167,139,250,.55)}
        .nexprep-gap-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}
        .nexprep-gap-card h3{margin:0;color:#edf1ff;font-size:15px}
        .nexprep-gap-score{color:#b9a5ff;font-size:17px;font-weight:800;white-space:nowrap}
        .nexprep-gap-track{height:8px;overflow:hidden;border-radius:99px;background:rgba(177,190,225,.17)}
        .nexprep-gap-track span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#8b5cf6,#38bdf8)}
        .nexprep-gap-card-bottom{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px}
        .nexprep-gap-badge{display:inline-flex;padding:6px 9px;border-radius:99px;font-size:10px;font-weight:800}
        .nexprep-gap-badge.high{background:rgba(248,113,113,.16);color:#fca5a5}
        .nexprep-gap-badge.medium{background:rgba(251,191,36,.15);color:#fcd34d}
        .nexprep-gap-badge.low{background:rgba(52,211,153,.15);color:#6ee7b7}
        .nexprep-gap-card p{margin:11px 0 0;color:#aab6d2;font-size:12px;line-height:1.55}
        .nexprep-gap-interview{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;padding:14px 17px;background:linear-gradient(145deg,rgba(30,39,70,.96),rgba(21,29,54,.96));border:1px solid rgba(145,158,205,.18);border-radius:13px;box-shadow:0 8px 24px rgba(3,7,18,.13)}
        .nexprep-gap-interview span{display:block;color:#9daac6;font-size:11px}
        .nexprep-gap-interview strong{display:block;margin-top:4px;color:#edf1ff;font-size:14px}
        .nexprep-gap-empty,.nexprep-gap-message{padding:36px 22px;background:linear-gradient(145deg,rgba(30,39,70,.96),rgba(21,29,54,.96));border:1px solid rgba(145,158,205,.18);border-radius:15px;text-align:center;box-shadow:0 12px 30px rgba(3,7,18,.16)}
        .nexprep-gap-empty h3,.nexprep-gap-message h3{margin:0 0 7px;color:#f1f4ff;font-size:17px}
        .nexprep-gap-empty p,.nexprep-gap-message p{margin:0;color:#aab6d2;font-size:13px;line-height:1.6}
        .nexprep-retry{margin-top:16px;border:0;border-radius:10px;background:linear-gradient(100deg,#7c3aed,#4f8df7);color:#fff;padding:10px 16px;font-weight:700;cursor:pointer}
        @media(max-width:760px){.nexprep-gap-overview{grid-template-columns:1fr 1fr}.nexprep-gap-hero{grid-column:1/-1}.nexprep-gap-grid{grid-template-columns:1fr}}
        @media(max-width:430px){.nexprep-page-head{align-items:flex-start}.nexprep-gap-interview{align-items:flex-start;flex-direction:column}}
      `}</style>

      <div className="nexprep-page-head">
        <div>
          <p className="nexprep-kicker">Know what to improve next</p>
          <h2>Skill Gap Analysis</h2>
          <p>Find the skills that need attention based on your latest completed interview.</p>
        </div>
        <button className="nexprep-refresh" type="button" onClick={loadSkillGap}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="nexprep-gap-message" role="status">
          <h3>Reviewing your skill performance</h3>
          <p>Loading your latest interview and skill-gap results.</p>
        </div>
      ) : error ? (
        <div className="nexprep-gap-message" role="alert">
          <h3>Skill-gap report unavailable</h3>
          <p>{error}</p>
          <button className="nexprep-retry" type="button" onClick={loadSkillGap}>
            Try again
          </button>
        </div>
      ) : skillGap ? (
        <>
          <div className="nexprep-gap-interview">
            <div>
              <span>Based on latest completed interview</span>
              <strong>Interview #{skillGap.interviewId || interviewId}</strong>
            </div>
            <div>
              <span>Overall interview score</span>
              <strong>{skillGap.overallScore ?? "—"} / 10</strong>
            </div>
          </div>

          <div className="nexprep-gap-overview">
            <article className="nexprep-gap-hero">
              <span className="nexprep-gap-label">Skills evaluated</span>
              <strong>{categoryScores.length}</strong>
              <p>Skill areas included in this report</p>
            </article>
            <article className="nexprep-gap-stat">
              <span className="nexprep-gap-label">High-priority gaps</span>
              <strong>{highGapCount}</strong>
              <p>Scores below 5/10</p>
            </article>
            <article className="nexprep-gap-stat">
              <span className="nexprep-gap-label">Weak skills flagged</span>
              <strong>{weakSkills.length}</strong>
              <p>Identified by the assessment</p>
            </article>
          </div>

          <h3 className="nexprep-gap-section-title">Skill-by-skill breakdown</h3>

          {categoryScores.length === 0 ? (
            <div className="nexprep-gap-empty">
              <h3>No category scores available</h3>
              <p>This interview does not contain a skill breakdown yet.</p>
            </div>
          ) : (
            <div className="nexprep-gap-grid">
              {categoryScores.map(([skill, rawScore]) => {
                const score = Number(rawScore);
                const validScore = Number.isFinite(score);
                const safeScore = validScore ? score : 0;
                const percentage = Math.min(100, Math.max(0, safeScore * 10));
                const gapClass = getGapClass(safeScore);
                const isWeak = weakSkills.includes(skill);

                return (
                  <article className="nexprep-gap-card" key={skill}>
                    <div className="nexprep-gap-card-top">
                      <h3>{skill}</h3>
                      <span className="nexprep-gap-score">
                        {validScore ? `${safeScore.toFixed(2)}/10` : "—"}
                      </span>
                    </div>

                    <div className="nexprep-gap-track">
                      <span style={{ width: `${percentage}%` }} />
                    </div>

                    <div className="nexprep-gap-card-bottom">
                      <span className={`nexprep-gap-badge ${gapClass}`}>
                        {validScore ? getGapLevel(safeScore) : "Not scored"}
                      </span>
                      {isWeak && (
                        <span className="nexprep-gap-badge high">Needs focus</span>
                      )}
                    </div>

                    <p>
                      {validScore
                        ? getGapMessage(safeScore)
                        : "A score is not available for this skill yet."}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="nexprep-gap-empty">
          <h3>No skill-gap report available</h3>
          <p>Complete an interview to generate your first skill-gap report.</p>
        </div>
      )}
    </section>
  );
}

export default SkillGap;
