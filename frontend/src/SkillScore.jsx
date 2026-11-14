import { useEffect, useState } from "react";

function SkillScore() {

  // Store all skill scores returned by the backend.
  const [skillScores, setSkillScores] = useState([]);

  // Store loading state.
  const [loading, setLoading] = useState(true);

  // Store error message.
  const [error, setError] = useState("");


  // Get JWT token from localStorage.
  function getToken() {

    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    // Remove "Bearer " if it is already stored.
    return token.startsWith("Bearer ")
      ? token.substring(7)
      : token;
  }


  // Fetch skill scores from backend.
  async function fetchSkillScores() {

    try {

      // Start loading.
      setLoading(true);

      // Clear previous error.
      setError("");

      // Get JWT token.
      const token = getToken();

      // Stop if token is missing.
      if (!token) {
        throw new Error(
          "JWT token not found. Please login again."
        );
      }


      // Call Skill Score API.
      const response = await fetch(
        "http://localhost:8080/api/skill-scores/my",
        {
          method: "GET",

          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );


      // Read backend response.
      const responseText =
        await response.text();


      // Handle unauthorized request.
      if (response.status === 401) {
        throw new Error(
          "Unauthorized. Please login again."
        );
      }


      // Handle forbidden request.
      if (response.status === 403) {
        throw new Error(
          "Access denied. Please login again."
        );
      }


      // Handle other API errors.
      if (!response.ok) {
        throw new Error(
          responseText ||
          "Failed to load skill scores."
        );
      }


      // Make sure response contains data.
      if (!responseText.trim()) {
        setSkillScores([]);
        return;
      }


      // Convert response to JSON.
      const data =
        JSON.parse(responseText);


      // Store skill scores.
      setSkillScores(
        Array.isArray(data)
          ? data
          : []
      );


    } catch (err) {

      // Print error in browser console.
      console.error(
        "Skill score error:",
        err
      );

      // Display error.
      setError(err.message);


    } finally {

      // Stop loading.
      setLoading(false);
    }
  }


  // Fetch skill scores when the page opens.
  useEffect(() => {
    fetchSkillScores();
  }, []);


  // Calculate overall skill score.
  function calculateOverallScore() {

    if (skillScores.length === 0) {
      return 0;
    }

    let total = 0;

    for (const skill of skillScores) {
      total += Number(skill.score) || 0;
    }

    const average =
      total / skillScores.length;

    return Math.round(
      average * 100
    ) / 100;
  }


  // Get score-based label.
  function getScoreLabel(score) {

    if (score >= 8) {
      return "Strong";
    }

    if (score >= 6) {
      return "Good";
    }

    if (score >= 4) {
      return "Needs Improvement";
    }

    return "Needs Practice";
  }


  // Overall score.
  const overallScore =
    calculateOverallScore();


  return (
    <div className="card">

      {/* Page heading. */}
      <h2>
        Skill Score
      </h2>


      {/* Page description. */}
      <p>
        View your skill-wise performance based
        on your completed interviews.
      </p>


      {/* ----------------------------------------- */}
      {/* Error message.                            */}
      {/* ----------------------------------------- */}

      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "14px",
            borderRadius: "8px",
            background: "#fee2e2",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}


      {/* ----------------------------------------- */}
      {/* Loading message.                          */}
      {/* ----------------------------------------- */}

      {loading && (
        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          Loading skill scores...
        </div>
      )}


      {/* ----------------------------------------- */}
      {/* Overall score.                            */}
      {/* ----------------------------------------- */}

      {!loading &&
        !error &&
        skillScores.length > 0 && (

          <div
            style={{
              marginTop: "25px",
              padding: "25px",
              borderRadius: "12px",
              background: "#f3f4f6",
              textAlign: "center",
            }}
          >

            <h3
              style={{
                marginBottom: "10px",
                color: "#111827",
              }}
            >
              Overall Skill Score
            </h3>

            <div
              style={{
                fontSize: "42px",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              {overallScore} / 10
            </div>

            <p
              style={{
                color: "#4b5563",
                marginBottom: "0",
              }}
            >
              Based on your assessed skills
            </p>

          </div>
        )}


      {/* ----------------------------------------- */}
      {/* Skill cards.                              */}
      {/* ----------------------------------------- */}

      {!loading &&
        !error &&
        skillScores.length > 0 && (

          <div
            style={{
              marginTop: "30px",
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px",
            }}
          >

            {skillScores.map(
              (skill, index) => {

                // Convert score into a number.
                const score =
                  Number(skill.score) || 0;

                // Convert score into percentage
                // for the progress bar.
                const percentage =
                  Math.min(
                    Math.max(score * 10, 0),
                    100
                  );


                return (
                  <div
                    key={
                      skill.skill ||
                      index
                    }
                    style={{
                      padding: "22px",
                      border: "1px solid #d1d5db",
                      borderRadius: "12px",
                      background: "#ffffff",
                    }}
                  >

                    {/* Skill name. */}
                    <h3
                      style={{
                        marginTop: "0",
                        color: "#111827",
                      }}
                    >
                      {skill.skill}
                    </h3>


                    {/* Score. */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >

                      <span
                        style={{
                          color: "#4b5563",
                        }}
                      >
                        Score
                      </span>

                      <strong
                        style={{
                          fontSize: "20px",
                          color: "#111827",
                        }}
                      >
                        {score} / 10
                      </strong>

                    </div>


                    {/* Progress bar background. */}
                    <div
                      style={{
                        width: "100%",
                        height: "10px",
                        background: "#e5e7eb",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >

                      {/* Progress bar. */}
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: "100%",
                          background: "#6366f1",
                          borderRadius: "10px",
                        }}
                      />

                    </div>


                    {/* Score label. */}
                    <p
                      style={{
                        marginTop: "12px",
                        marginBottom: "8px",
                        fontWeight: "600",
                        color: "#374151",
                      }}
                    >
                      {getScoreLabel(score)}
                    </p>


                    {/* Number of questions. */}
                    <p
                      style={{
                        marginBottom: "0",
                        color: "#6b7280",
                      }}
                    >
                      Questions assessed:{" "}
                      {skill.totalQuestions}
                    </p>

                  </div>
                );
              }
            )}

          </div>
        )}


      {/* ----------------------------------------- */}
      {/* No skill data.                            */}
      {/* ----------------------------------------- */}

      {!loading &&
        !error &&
        skillScores.length === 0 && (

          <div
            style={{
              marginTop: "25px",
              padding: "25px",
              textAlign: "center",
              background: "#f9fafb",
              borderRadius: "10px",
              color: "#374151",
            }}
          >

            <h3>
              No Skill Scores Yet
            </h3>

            <p>
              Complete an interview to generate
              your skill scores.
            </p>

          </div>
        )}

    </div>
  );
}

export default SkillScore;