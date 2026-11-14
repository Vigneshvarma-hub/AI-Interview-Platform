import { useEffect, useState } from "react";

function Recommendations() {

  // Stores recommendations received from the backend.
  const [recommendations, setRecommendations] = useState([]);

  // Controls loading state.
  const [loading, setLoading] = useState(true);

  // Stores API error messages.
  const [error, setError] = useState("");


  // Get JWT token from localStorage.
  function getToken() {

    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    // Remove "Bearer " if it already exists.
    return token.startsWith("Bearer ")
      ? token.substring(7)
      : token;
  }


  // Fetch personalized recommendations from Spring Boot.
  async function fetchRecommendations() {

    try {

      setLoading(true);
      setError("");

      const token = getToken();

      // JWT is required for this API.
      if (!token) {
        throw new Error(
          "JWT token not found. Please login again."
        );
      }


      // Call Recommendations API.
      const response = await fetch(
        "http://localhost:8080/api/recommendations/my",
        {
          method: "GET",

          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );


      // Read backend response.
      const responseText = await response.text();

      console.log(
        "Recommendations status:",
        response.status
      );

      console.log(
        "Recommendations response:",
        responseText
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


      // Handle other HTTP errors.
      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}`
        );
      }


      // Backend should not return an empty response.
      if (!responseText.trim()) {
        throw new Error(
          "Backend returned an empty response."
        );
      }


      // Convert JSON string into JavaScript object.
      const data = JSON.parse(responseText);


      // Store recommendations.
      setRecommendations(
        data.recommendations || []
      );

    } catch (err) {

      console.error(
        "Recommendations error:",
        err
      );

      setError(err.message);

    } finally {

      setLoading(false);
    }
  }


  // Fetch recommendations when page opens.
  useEffect(() => {

    fetchRecommendations();

  }, []);


  // Loading screen.
  if (loading) {

    return (
      <div className="card">

        <h2>Recommendations</h2>

        <p>
          Analyzing your interview performance
          and preparing personalized recommendations...
        </p>

      </div>
    );
  }


  // Error screen.
  if (error) {

    return (
      <div className="card">

        <h2>Recommendations</h2>

        <p style={{ color: "red" }}>
          Error: {error}
        </p>

      </div>
    );
  }


  // Main Recommendations page.
  return (
    <div>

      {/* Page introduction */}
      <div className="card">

        <h2>
          Personalized Recommendations
        </h2>

        <p>
          Improve your weak skills using
          personalized learning recommendations
          based on your interview performance.
        </p>

      </div>


      {/* Display message when there are no weak skills. */}
      {recommendations.length === 0 && (

        <div
          className="card"
          style={{ marginTop: "20px" }}
        >

          <h2>
            You're doing well! 🎉
          </h2>

          <p>
            No weak skills were detected.
            Continue practicing to maintain
            your performance.
          </p>

        </div>
      )}


      {/* Display personalized recommendations. */}
      {recommendations.length > 0 && (

        <div
          style={{
            display: "grid",
            gap: "20px",
            marginTop: "20px",
          }}
        >

          {recommendations.map(
            (item, index) => (

              <div
                className="card"
                key={`${item.skill}-${index}`}
              >

                {/* Skill name */}
                <h2>
                  {item.skill}
                </h2>


                {/* Current score */}
                <p>
                  <strong>
                    Current Score:
                  </strong>{" "}
                  {item.score}/10
                </p>


                {/* Priority */}
                <p>
                  <strong>
                    Priority:
                  </strong>{" "}

                  <span
                    style={{
                      fontWeight: "bold",
                      color:
                        item.priority === "HIGH"
                          ? "red"
                          : "orange",
                    }}
                  >
                    {item.priority}
                  </span>
                </p>


                {/* Score progress bar */}
                <div
                  style={{
                    width: "100%",
                    height: "10px",
                    background: "#e5e7eb",
                    borderRadius: "10px",
                    overflow: "hidden",
                    marginTop: "10px",
                    marginBottom: "20px",
                  }}
                >

                  <div
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          (Number(item.score) / 10) * 100
                        )
                      )}%`,
                      height: "100%",
                      background: "#7c3aed",
                      borderRadius: "10px",
                    }}
                  />

                </div>


                {/* Learning recommendation */}
                <div
                  style={{
                    padding: "15px",
                    borderRadius: "8px",
                    background: "#f5f3ff",
                  }}
                >

                  <strong>
                    What to practice:
                  </strong>

                  <p>
                    {item.recommendation}
                  </p>

                </div>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}


// IMPORTANT:
// Export the component as the default export.
export default Recommendations;