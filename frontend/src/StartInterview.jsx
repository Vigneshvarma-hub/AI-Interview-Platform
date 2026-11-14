import { useState } from "react";

function StartInterview() {
  // Selected technology
  const [technology, setTechnology] = useState("Java");

  // Selected difficulty
  const [difficulty, setDifficulty] = useState("Easy");

  // API loading state
  const [loading, setLoading] = useState(false);

  // Error message
  const [error, setError] = useState("");

  // Successful interview response
  const [interview, setInterview] = useState(null);

  // Get JWT token from browser localStorage
  function getToken() {
    const token = localStorage.getItem("token");

    // Token not available
    if (!token) {
      return null;
    }

    // If token already contains Bearer prefix, remove it
    if (token.startsWith("Bearer ")) {
      return token.substring(7);
    }

    return token;
  }

  // Start interview API call
  async function handleStartInterview(event) {
    // Prevent page refresh
    event.preventDefault();

    // Clear previous state
    setLoading(true);
    setError("");
    setInterview(null);

    try {
      // Retrieve JWT token
      const token = getToken();

      // Stop if token is missing
      if (!token) {
        throw new Error("JWT token not found. Please login again.");
      }

      // Send request to backend
      const response = await fetch(
        "http://localhost:8080/api/interviews/start",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",

            // Send JWT token to backend
            Authorization: `Bearer ${token}`,
          },

          // Request body
          body: JSON.stringify({
            technology: technology,
            difficulty: difficulty,
          }),
        }
      );

      // Read response as text first
      const responseText = await response.text();

      // Console logs for debugging
      console.log("Start Interview status:", response.status);
      console.log("Start Interview response:", responseText);

      // Handle unauthorized request
      if (response.status === 401) {
        throw new Error(
          "401 Unauthorized: Please logout and login again."
        );
      }

      // Handle forbidden request
      if (response.status === 403) {
        throw new Error(
          "403 Forbidden: Backend rejected your role or JWT token. " +
            "Check backend logs and user role."
        );
      }

      // Handle empty response
      if (!responseText.trim()) {
        throw new Error(
          `Backend returned an empty response. HTTP status: ${response.status}`
        );
      }

      // Convert response text into JSON
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        throw new Error(
          `Backend returned invalid JSON response: ${responseText}`
        );
      }

      // Handle other unsuccessful responses
      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Unable to start interview. HTTP status: ${response.status}`
        );
      }

      // Save successful interview response
      setInterview(data);

      console.log("Interview started successfully:", data);
    } catch (err) {
      // Print error in browser console
      console.error("Start interview error:", err);

      // Display error in UI
      setError(err.message);
    } finally {
      // Stop loading
      setLoading(false);
    }
  }

  return (
    <div className="card">
      {/* Page heading */}
      <h2>Start New Interview</h2>

      {/* Page description */}
      <p>
        Select your technology and difficulty level to begin the interview.
      </p>

      {/* Start interview form */}
      <form onSubmit={handleStartInterview}>
        {/* Technology selection */}
        <div className="form-group">
          <label htmlFor="technology">Technology</label>

          <select
            id="technology"
            value={technology}
            onChange={(event) => setTechnology(event.target.value)}
          >
            <option value="Java">Java</option>
            <option value="Spring Boot">Spring Boot</option>
            <option value="Python">Python</option>
            <option value="JavaScript">JavaScript</option>
            <option value="SQL">SQL</option>
          </select>
        </div>

        {/* Difficulty selection */}
        <div className="form-group">
          <label htmlFor="difficulty">Difficulty</label>

          <select
            id="difficulty"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="primary-button"
          disabled={loading}
        >
          {loading ? "Starting Interview..." : "Start Interview"}
        </button>
      </form>

      {/* Display error message */}
      {error && (
        <p
          style={{
            color: "red",
            marginTop: "20px",
            whiteSpace: "pre-wrap",
          }}
        >
          Error: {error}
        </p>
      )}

      {/* Display successful interview details */}
      {interview && (
        <div style={{ marginTop: "25px" }}>
          <h3>Interview Started Successfully</h3>

          <p>
            <strong>Interview ID:</strong> {interview.id}
          </p>

          <p>
            <strong>Technology:</strong> {interview.technology}
          </p>

          <p>
            <strong>Difficulty:</strong> {interview.difficulty}
          </p>

          <p>
            <strong>Status:</strong> {interview.status}
          </p>

          <h3>Questions</h3>

          {interview.questions &&
          interview.questions.length > 0 ? (
            <ol>
              {interview.questions.map((question) => (
                <li key={question.id}>
                  {question.questionText}
                </li>
              ))}
            </ol>
          ) : (
            <p>No questions available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default StartInterview;