import { useEffect, useState } from "react";

function SkillGap() {

  // Store the skill-gap analysis returned by the backend.
  const [skillGap, setSkillGap] = useState(null);

  // Store the latest completed interview ID.
  const [interviewId, setInterviewId] = useState(null);

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


  // Find the latest completed interview.
  async function findLatestCompletedInterview() {

    const token = getToken();

    if (!token) {
      throw new Error(
        "JWT token not found. Please login again."
      );
    }


    // Fetch the logged-in user's interviews.
    const response = await fetch(
      "http://localhost:8080/api/interviews/my",
      {
        method: "GET",

        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );


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


    // Handle other errors.
    if (!response.ok) {
      throw new Error(
        "Failed to load your interviews."
      );
    }


    // Convert response to JSON.
    const interviews = await response.json();


    // Find the first completed interview.
    const completedInterview =
      interviews.find(
        (interview) =>
          interview.status === "COMPLETED"
      );


    // Stop if there is no completed interview.
    if (!completedInterview) {
      throw new Error(
        "No completed interview found. Complete an interview first."
      );
    }


    // Store completed interview ID.
    setInterviewId(
      completedInterview.id ||
      completedInterview.interviewId
    );


    return (
      completedInterview.id ||
      completedInterview.interviewId
    );
  }


  // Fetch skill-gap analysis for the selected interview.
  async function fetchSkillGap(id) {

    const token = getToken();

    if (!token) {
      throw new Error(
        "JWT token not found. Please login again."
      );
    }


    // Call Skill Gap API.
    const response = await fetch(
      `http://localhost:8080/api/skill-gaps/interview/${id}`,
      {
        method: "GET",

        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      }
    );


    // Handle unauthorized request.
    if (response.status === 401) {
      throw new Error(
        "Unauthorized. Please login again."
      );
    }


    // Handle forbidden request.
    if (response.status === 403) {
      throw new Error(
        "Access denied. You cannot access this interview."
      );
    }


    // Handle other API errors.
    if (!response.ok) {
      throw new Error(
        "Failed to load skill-gap analysis."
      );
    }


    // Convert response to JSON.
    const data = await response.json();


    // Store skill-gap data.
    setSkillGap(data);
  }


  // Load skill-gap information when the page opens.
  useEffect(() => {

    async function loadSkillGap() {

      try {

        // Start loading.
        setLoading(true);

        // Clear previous error.
        setError("");


        // Find latest completed interview.
        const id =
          await findLatestCompletedInterview();


        // Fetch its skill-gap analysis.
        await fetchSkillGap(id);


      } catch (err) {

        // Print error in browser console.
        console.error(
          "Skill Gap error:",
          err
        );

        // Show error to the user.
        setError(err.message);


      } finally {

        // Stop loading.
        setLoading(false);
      }
    }


    loadSkillGap();

  }, []);


  // Get a label based on the skill score.
  function getGapLevel(score) {

    if (score < 5) {
      return "High Gap";
    }

    if (score < 7) {
      return "Medium Gap";
    }

    return "Low Gap";
  }


  // Get an explanation based on the score.
  function getGapMessage(score) {

    if (score < 5) {
      return "This skill needs significant improvement and more practice.";
    }

    if (score < 7) {
      return "You have a basic understanding, but further practice is recommended.";
    }

    return "Your performance in this skill is currently strong.";
  }


  return (
    <div className="card">

      {/* Page heading. */}
      <h2>
        Skill Gap Analysis
      </h2>


      {/* Page description. */}
      <p>
        Identify your weaker skills based on your
        interview performance.
      </p>


      {/* ----------------------------------------- */}
      {/* Loading state.                            */}
      {/* ----------------------------------------- */}

      {loading && (
        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            textAlign: "center",
          }}
        >
          Analysing your skill gaps...
        </div>
      )}


      {/* ----------------------------------------- */}
      {/* Error state.                              */}
      {/* ----------------------------------------- */}

      {!loading && error && (
        <div
          style={{
            marginTop: "25px",
            padding: "16px",
            borderRadius: "8px",
            background: "#fee2e2",
            color: "#991b1b",
          }}
        >
          {error}
        </div>
      )}


      {/* ----------------------------------------- */}
      {/* Main skill-gap content.                   */}
      {/* ----------------------------------------- */}

      {!loading &&
        !error &&
        skillGap && (

          <>

            {/* Interview information. */}
            <div
              style={{
                marginTop: "25px",
                padding: "20px",
                borderRadius: "12px",
                background: "#f3f4f6",
              }}
            >

              <h3
                style={{
                  marginTop: "0",
                  color: "#111827",
                }}
              >
                Interview Performance
              </h3>

              <p
                style={{
                  color: "#374151",
                }}
              >
                Interview ID: {skillGap.interviewId}
              </p>

              <p
                style={{
                  marginBottom: "0",
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#111827",
                }}
              >
                Overall Score:{" "}
                {skillGap.overallScore} / 10
              </p>

            </div>


            {/* ------------------------------------- */}
            {/* Skill cards.                          */}
            {/* ------------------------------------- */}

            <div
              style={{
                marginTop: "25px",
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "20px",
              }}
            >

              {Object.entries(
                skillGap.categoryScores || {}
              ).map(
                ([skill, score]) => {

                  // Convert score to number.
                  const numericScore =
                    Number(score) || 0;

                  // Calculate progress percentage.
                  const percentage =
                    Math.min(
                      Math.max(
                        numericScore * 10,
                        0
                      ),
                      100
                    );


                  return (
                    <div
                      key={skill}
                      style={{
                        padding: "22px",
                        border:
                          "1px solid #d1d5db",
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
                        {skill}
                      </h3>


                      {/* Score. */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems: "center",
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
                          {numericScore} / 10
                        </strong>

                      </div>


                      {/* Progress bar. */}
                      <div
                        style={{
                          width: "100%",
                          height: "10px",
                          marginTop: "12px",
                          background: "#e5e7eb",
                          borderRadius: "10px",
                          overflow: "hidden",
                        }}
                      >

                        <div
                          style={{
                            width:
                              `${percentage}%`,
                            height: "100%",
                            background:
                              "#6366f1",
                            borderRadius: "10px",
                          }}
                        />

                      </div>


                      {/* Gap level. */}
                      <p
                        style={{
                          marginTop: "15px",
                          marginBottom: "8px",
                          fontWeight: "700",
                          color: "#374151",
                        }}
                      >
                        {getGapLevel(
                          numericScore
                        )}
                      </p>


                      {/* Gap explanation. */}
                      <p
                        style={{
                          marginTop: "0",
                          color: "#6b7280",
                          lineHeight: "1.5",
                        }}
                      >
                        {getGapMessage(
                          numericScore
                        )}
                      </p>


                      {/* Weak skill indicator. */}
                      {(
                        skillGap.weakSkills ||
                        []
                      ).includes(skill) && (

                        <div
                          style={{
                            marginTop: "12px",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            background: "#fef2f2",
                            color: "#991b1b",
                            fontWeight: "600",
                          }}
                        >
                          Weak Skill
                        </div>

                      )}

                    </div>
                  );
                }
              )}

            </div>

          </>
        )}

    </div>
  );
}

export default SkillGap;