
import { useState } from "react";

function StartInterview() {

  // API loading state.
  const [loading, setLoading] = useState(false);

  // Error message.
  const [error, setError] = useState("");

  // Successful interview response.
  const [interview, setInterview] = useState(null);

  // Retrieve JWT token.
  function getToken() {

    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    return token.startsWith("Bearer ")
      ? token.substring(7)
      : token;
  }

  // Start resume-based AI interview.
  async function handleStartInterview(event) {

    event.preventDefault();

    setLoading(true);
    setError("");
    setInterview(null);

    try {

      // 1. Retrieve authentication token.
      const token = getToken();

      if (!token) {
        throw new Error(
          "JWT token not found. Please login again."
        );
      }

      // 2. Call the correct AI interview endpoint.
      const response = await fetch(
        "http://localhost:8080/api/ai-interviews/start",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },

          // The backend generates technology and difficulty
          // from the uploaded resume.
          body: JSON.stringify({}),
        }
      );

      // 3. Read response.
      const responseText = await response.text();

      console.log(
        "AI Interview Status:",
        response.status
      );

      console.log(
        "AI Interview Response:",
        responseText
      );

      if (!responseText.trim()) {
        throw new Error(
          `Empty backend response. Status: ${response.status}`
        );
      }

      // 4. Parse JSON.
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Backend returned an invalid JSON response."
        );
      }

      // 5. Handle authentication errors.
      if (response.status === 401) {
        throw new Error(
          "Session expired. Please login again."
        );
      }

      // 6. Handle subscription and permission errors.
      if (response.status === 403) {
        throw new Error(
          data.message ||
          "You are not allowed to start this interview."
        );
      }

      // 7. Handle other unsuccessful responses.
      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Unable to start AI interview."
        );
      }

      // 8. Validate the response.
      if (!data.interviewId || !data.question) {
        throw new Error(
          "Interview started, but the backend returned incomplete interview details."
        );
      }

      // 9. Save interview details.
      setInterview(data);

      console.log(
        "AI Interview Started Successfully:",
        data
      );

    } catch (err) {

      console.error(
        "AI Interview Error:",
        err
      );

      setError(
        err.message ||
        "Something went wrong. Please try again."
      );

    } finally {

      setLoading(false);

    }
  }

  return (
    <div className="card">

      {/* Page heading */}
      <h2>Start AI Mock Interview</h2>

      <p>
        Start a personalized technical interview
        based on your uploaded resume.
      </p>

      {/* Interview information */}
      <div
        style={{
          padding: "15px",
          background: "#f3f4f6",
          borderRadius: "10px",
          marginBottom: "20px",
          color: "#333",
        }}
      >
        <h4>Before you begin</h4>

        <ul>
          <li>Upload your resume before starting.</li>
          <li>AI analyzes your technical skills and projects.</li>
          <li>Questions are generated dynamically.</li>
          <li>Follow-up questions depend on your answers.</li>
          <li>Your interview performance is evaluated.</li>
        </ul>
      </div>

      {/* Start interview form */}
      <form onSubmit={handleStartInterview}>

        <button
          type="submit"
          className="primary-button"
          disabled={loading}
        >
          {loading
            ? "Preparing Your AI Interview..."
            : "Start AI Interview"}
        </button>

      </form>

      {/* Loading message */}
      {loading && (
        <p style={{ marginTop: "15px" }}>
          AI is analyzing your resume and preparing
          your first interview question...
        </p>
      )}

      {/* Error message */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "8px",
            whiteSpace: "pre-wrap",
          }}
        >
          <strong>Interview Error</strong>
          <p>{error}</p>
        </div>
      )}

      {/* Successful interview */}
      {interview && (
        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "12px",
          }}
        >

          <h3>AI Interview Started Successfully!</h3>

          <p>
            <strong>Interview ID:</strong>{" "}
            {interview.interviewId}
          </p>

          <p>
            <strong>Technology:</strong>{" "}
            {interview.technology}
          </p>

          <p>
            <strong>Difficulty:</strong>{" "}
            {interview.difficulty}
          </p>

          <p>
            <strong>Question:</strong>{" "}
            {interview.questionNumber}
          </p>

          <p>
            <strong>Question Limit:</strong>{" "}
            {interview.totalQuestions}
          </p>

          <hr />

          <h3>Your First Interview Question</h3>

          <div
            style={{
              background: "#eff6ff",
              padding: "20px",
              borderRadius: "10px",
              marginTop: "15px",
            }}
          >
            <p
              style={{
                fontSize: "18px",
                fontWeight: "600",
                lineHeight: "1.6",
              }}
            >
              {interview.question}
            </p>
          </div>

          <p
            style={{
              color: "#15803d",
              marginTop: "15px",
            }}
          >
            Your personalized interview has been
            successfully created.
          </p>

        </div>
      )}

    </div>
  );
}

export default StartInterview;
