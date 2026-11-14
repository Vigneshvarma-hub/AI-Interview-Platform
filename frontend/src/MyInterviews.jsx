import { useEffect, useState } from "react";

function MyInterviews() {
  // User interviews
  const [interviews, setInterviews] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Error message
  const [error, setError] = useState("");

  // JWT token retrieve cheyyadaniki
  function getToken() {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    return token.startsWith("Bearer ")
      ? token.substring(7)
      : token;
  }

  // My Interviews API call
  async function fetchMyInterviews() {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      // Token lekapothe error
      if (!token) {
        throw new Error(
          "JWT token not found. Please login again."
        );
      }

      // Backend API call
      const response = await fetch(
        "http://localhost:8080/api/interviews/my",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Response first text ga read chestam
      const responseText = await response.text();

      console.log(
        "My Interviews status:",
        response.status
      );

      console.log(
        "My Interviews response:",
        responseText
      );

      // Unauthorized
      if (response.status === 401) {
        throw new Error(
          "Unauthorized. Please login again."
        );
      }

      // Forbidden
      if (response.status === 403) {
        throw new Error(
          "Access denied. Please login again."
        );
      }

      // Empty response
      if (!responseText.trim()) {
        throw new Error(
          "Backend returned an empty response."
        );
      }

      // Convert response to JSON
      const data = JSON.parse(responseText);

      // Save interviews
      setInterviews(data);
    } catch (err) {
      console.error(
        "My Interviews error:",
        err
      );

      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Component load ayinappudu API call
  useEffect(() => {
    fetchMyInterviews();
  }, []);

  // Loading
  if (loading) {
    return (
      <div className="card">
        <h2>My Interviews</h2>
        <p>Loading your interviews...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="card">
        <h2>My Interviews</h2>

        <p
          style={{
            color: "red",
          }}
        >
          Error: {error}
        </p>
      </div>
    );
  }

  // No interviews
  if (interviews.length === 0) {
    return (
      <div className="card">
        <h2>My Interviews</h2>

        <p>
          You have not completed any interviews yet.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>My Interviews</h2>

      <p>
        Here you can view your previous interviews.
      </p>

      {/* Interviews list */}
      <div
        style={{
          display: "grid",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        {interviews.map((interview) => (
          <div
            key={interview.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <h3>
              Interview #{interview.id}
            </h3>

            <p>
              <strong>Technology:</strong>{" "}
              {interview.technology}
            </p>

            <p>
              <strong>Difficulty:</strong>{" "}
              {interview.difficulty}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {interview.status}
            </p>

            <p>
              <strong>Score:</strong>{" "}
              {interview.score ?? 0}/10
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyInterviews;