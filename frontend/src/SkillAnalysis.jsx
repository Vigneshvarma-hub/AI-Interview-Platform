import { useEffect, useState } from "react";

function SkillAnalysis() {
  // Stores the skill analysis received from the backend.
  const [analysis, setAnalysis] = useState(null);

  // Controls the loading state.
  const [loading, setLoading] = useState(true);

  // Stores any API error.
  const [error, setError] = useState("");

  // Get JWT token from localStorage.
  function getToken() {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    // Remove "Bearer " if it was already stored with the token.
    return token.startsWith("Bearer ")
      ? token.substring(7)
      : token;
  }

  // Fetch skill analysis from Spring Boot backend.
  async function fetchSkillAnalysis() {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      // JWT is required for this protected endpoint.
      if (!token) {
        throw new Error("JWT token not found. Please login again.");
      }

      const response = await fetch(
        "http://localhost:8080/api/skill-analysis/my",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Read response as text first so that
      // empty or non-JSON backend responses don't crash the page.
      const responseText = await response.text();

      console.log(
        "Skill Analysis status:",
        response.status
      );

      console.log(
        "Skill Analysis response:",
        responseText
      );

      // Handle authentication failure.
      if (response.status === 401) {
        throw new Error(
          "Unauthorized. Please login again."
        );
      }

      // Handle authorization failure.
      if (response.status === 403) {
        throw new Error(
          "Access denied. Please login again."
        );
      }

      // Handle other backend errors.
      if (!response.ok) {
        throw new Error(
          `Skill Analysis request failed with status ${response.status}`
        );
      }

      // Make sure backend returned something.
      if (!responseText.trim()) {
        throw new Error(
          "Backend returned an empty response."
        );
      }

      // Convert JSON response into JavaScript object.
      const data = JSON.parse(responseText);

      // Store the analysis data.
      setAnalysis(data);

    } catch (err) {
      console.error(
        "Skill Analysis error:",
        err
      );

      setError(err.message);

    } finally {
      setLoading(false);
    }
  }

  // Fetch analysis when the component is loaded.
  useEffect(() => {
    fetchSkillAnalysis();
  }, []);

  // Loading screen.
  if (loading) {
    return (
      <div className="card">
        <h2>Skill Analysis</h2>
        <p>Loading your skill analysis...</p>
      </div>
    );
  }

  // Error screen.
  if (error) {
    return (
      <div className="card">
        <h2>Skill Analysis</h2>

        <p style={{ color: "red" }}>
          Error: {error}
        </p>
      </div>
    );
  }

  // Safety check if backend returned no data.
  if (!analysis) {
    return (
      <div className="card">
        <h2>Skill Analysis</h2>
        <p>No skill analysis data available.</p>
      </div>
    );
  }

  return (
    <div>

      {/* Page heading */}
      <div className="card">
        <h2>Skill Analysis</h2>

        <p>
          Track your interview performance
          and technology-wise skills.
        </p>
      </div>

      {/* Overall performance cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(200px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >

        {/* Completed interviews */}
        <div className="card">
          <h3>Completed Interviews</h3>

          <p
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              margin: "10px 0",
            }}
          >
            {analysis.totalInterviews}
          </p>
        </div>

        {/* Overall score */}
        <div className="card">
          <h3>Overall Average Score</h3>

          <p
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              margin: "10px 0",
            }}
          >
            {analysis.overallAverageScore}/10
          </p>
        </div>
      </div>

      {/* Technology-wise performance */}
      <div
        className="card"
        style={{ marginTop: "20px" }}
      >
        <h2>Technology Performance</h2>

        {/* No technology data */}
        {(!analysis.technologyPerformance ||
          analysis.technologyPerformance.length === 0) && (
          <p>
            Complete an interview to see
            technology-wise performance.
          </p>
        )}

        {/* Technology performance list */}
        {analysis.technologyPerformance &&
          analysis.technologyPerformance.length > 0 && (

            <div
              style={{
                display: "grid",
                gap: "15px",
                marginTop: "20px",
              }}
            >

              {analysis.technologyPerformance.map(
                (item) => (

                  <div
                    key={item.technology}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "10px",
                      padding: "20px",
                    }}
                  >

                    <h3>
                      {item.technology}
                    </h3>

                    <p>
                      <strong>
                        Interviews:
                      </strong>{" "}
                      {item.interviewCount}
                    </p>

                    <p>
                      <strong>
                        Average Score:
                      </strong>{" "}
                      {item.averageScore}/10
                    </p>

                    {/* Simple visual score bar */}
                    <div
                      style={{
                        width: "100%",
                        height: "10px",
                        background: "#e5e7eb",
                        borderRadius: "10px",
                        overflow: "hidden",
                        marginTop: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: `${
                            (item.averageScore / 10) * 100
                          }%`,
                          height: "100%",
                          background:
                            "#7c3aed",
                          borderRadius: "10px",
                        }}
                      />
                    </div>

                  </div>
                )
              )}

            </div>
          )}

      </div>

    </div>
  );
}

export default SkillAnalysis;