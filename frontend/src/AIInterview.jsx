import { useEffect, useRef, useState } from "react";
// Parent dashboard nunchi Subscription page open cheyyadaniki callback.
function AIInterview({ onOpenPlans }) {

  // Keep the camera/microphone stream while the interview is active.
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Camera and microphone permission state.
  const [mediaReady, setMediaReady] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState("");

  // Stop camera and microphone tracks when this page is unmounted.
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  // Request both camera and microphone permission from the browser.
  async function enableCameraAndMicrophone() {
    setMediaLoading(true);
    setMediaError("");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera and microphone access is unavailable. Use HTTPS or localhost in a supported browser."
        );
      }

      // Request video and audio together because camera is mandatory.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      // Stop any previously opened stream before storing the new one.
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      mediaStreamRef.current = stream;
      setMediaReady(true);
    } catch (err) {
      console.error("Camera/microphone permission error:", err);

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMediaError(
          "Camera and microphone permissions are required. Allow both permissions in your browser settings, then try again."
        );
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setMediaError(
          "A camera or microphone was not found. Connect both devices and try again."
        );
      } else {
        setMediaError(err.message || "Unable to access your camera and microphone.");
      }

      setMediaReady(false);
    } finally {
      setMediaLoading(false);
    }
  }

  // Stop media devices after the interview is completed.
  function stopCameraAndMicrophone() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setMediaReady(false);
  }

  // Store selected technology.
  const [technology, setTechnology] = useState("Java");

  // Store selected difficulty.
  const [difficulty, setDifficulty] = useState("MEDIUM");

  // Store the currently displayed interview question.
  const [interview, setInterview] = useState(null);

  // Store all questions belonging to the current interview.
  const [questions, setQuestions] = useState([]);

  // Store the candidate's current answer.
  const [answer, setAnswer] = useState("");

  // Store evaluation of the most recently submitted answer.
  const [evaluation, setEvaluation] = useState(null);

  // Store the detailed question-wise evaluation.
  const [detailedEvaluation, setDetailedEvaluation] = useState([]);

  // Loading state while starting an interview.
  const [loading, setLoading] = useState(false);

  // Loading state while submitting an answer.
  const [submitting, setSubmitting] = useState(false);

  // Loading state while loading detailed evaluation.
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);

  // Store whether the interview has been completed.
  const [completed, setCompleted] = useState(false);

  // Store the final interview result.
  const [finalResult, setFinalResult] = useState(null);

  // Store error messages.
  const [error, setError] = useState("");

  // User subscription plan issue valla plans page ki vellalsi unte
// ee state button ni display chesthundi.
const [showPlansButton, setShowPlansButton] = useState(false);


  // Attach the camera stream after the setup or interview preview is rendered.
  // This effect is declared after interview state to avoid a temporal-dead-zone error.
  useEffect(() => {
    if (videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [mediaReady, interview]);


// Backend error response ni readable message ga convert chesthundi.
function getApiErrorMessage(responseText, fallbackMessage) {
  if (!responseText || !responseText.trim()) {
    return fallbackMessage;
  }

  try {
    const data = JSON.parse(responseText);

    return (
      data.message ||
      data.error ||
      data.detail ||
      fallbackMessage
    );
  } catch {
    return responseText;
  }
}

// Backend nunchi subscription limit error vasthe
// Subscription & Plans button chupistham.
function handleSubscriptionError(message) {
  const text = (message || "").toLowerCase();

  const isPlanError =
    text.includes("free ai interview answers") ||
    text.includes("free interview answers") ||
    text.includes("upgrade to premium") ||
    text.includes("trial interview has already been used") ||
    text.includes("subscription plan") ||
    text.includes("trial has expired");

  setShowPlansButton(isPlanError);
}


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


  // Convert common backend error payloads into readable messages.
  function getApiErrorMessage(responseText, fallbackMessage) {
    if (!responseText || !responseText.trim()) {
      return fallbackMessage;
    }

    try {
      const payload = JSON.parse(responseText);
      if (typeof payload === "string") return payload;
      return (
        payload.message ||
        payload.error ||
        payload.detail ||
        payload.description ||
        fallbackMessage
      );
    } catch {
      return responseText;
    }
  }

  // Redirect only when the backend explicitly reports a plan/usage restriction.
  // A generic 403 (for example, an AI provider error) must not send the user to plans.
  function handleSubscriptionRestriction(message) {
    const normalizedMessage = String(message || "").toLowerCase();
    const isSubscriptionRestriction = [
      "subscription",
      "free plan",
      "answer limit",
      "interview limit",
      "trial expired",
      "trial has expired",
      "premium plan",
      "upgrade your plan",
      "subscription expired",
      "limit reached",
      "free ai interview answers",
      "free interview answers",
      "trial interview has already been used",
      "trial has expired",
      "upgrade to premium",
      "upgrade your plan",
      "your plan does not allow",
    ].some((keyword) => normalizedMessage.includes(keyword));

    // Keep the candidate on the AI Interview page and show a Plans button.
    // App.jsx passes onOpenPlans to navigate to the Subscription & Plans page.
    setShowPlansButton(isSubscriptionRestriction);
  }

  // Start a new AI interview.
  async function startInterview() {

    // Do not start an interview until camera and microphone are both enabled.
    if (
      !mediaReady ||
      !mediaStreamRef.current ||
      !mediaStreamRef.current.getVideoTracks().some((track) => track.readyState === "live") ||
      !mediaStreamRef.current.getAudioTracks().some((track) => track.readyState === "live")
    ) {
      setError("Please enable your camera and microphone before starting the interview.");
      setMediaReady(false);
      return;
    }

    try {

      // Start loading.
      setLoading(true);

      // Clear previous error.
      setError("");

      // Clear previous interview.
      setInterview(null);

      // Clear previous questions.
      setQuestions([]);

      // Clear previous answer.
      setAnswer("");

      // Clear previous evaluation.
      setEvaluation(null);

      // Clear detailed evaluation.
      setDetailedEvaluation([]);

      // Clear final result.
      setFinalResult(null);

      // Mark interview as not completed.
      setCompleted(false);


      // Get JWT token.
      const token = getToken();

      if (!token) {
        throw new Error(
          "JWT token not found. Please login again."
        );
      }


      // Call backend to start the AI interview.
      const response = await fetch(
        "http://localhost:8080/api/ai-interviews/start",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },

          body: JSON.stringify({
            technology: technology,
            difficulty: difficulty,
          }),
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


      // Handle forbidden and other failed requests using the backend's message.
      if (!response.ok) {
        const message = getApiErrorMessage(
          responseText,
          response.status === 403
            ? "Access denied. Check your account permissions or subscription."
            : "Failed to start AI interview."
        );

        handleSubscriptionRestriction(message);
        throw new Error(message);
      }


      // Make sure backend returned data.
      if (!responseText.trim()) {
        throw new Error(
          "Backend returned an empty response."
        );
      }


      // Convert response into JSON.
      const data =
        JSON.parse(responseText);


      // Store first question.
      setInterview(data);


      // Fetch all questions for this interview.
      // Question IDs are needed when submitting answers.
      const questionsResponse =
        await fetch(
          `http://localhost:8080/api/interviews/${data.interviewId}/questions`,
          {
            method: "GET",

            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );


      // Read questions response.
      const questionsText =
        await questionsResponse.text();


      // Handle question loading errors.
      if (!questionsResponse.ok) {
        throw new Error(
          questionsText ||
          "Failed to load interview questions."
        );
      }


      // Convert questions response into JSON.
      const questionData =
        JSON.parse(questionsText);


      // Store all interview questions.
      setQuestions(questionData);


    } catch (err) {

      // Print error in browser console.
      console.error(
        "AI Interview error:",
        err
      );

      // Display error on screen.
      setError(err.message);


    } finally {

      // Stop loading.
      setLoading(false);
    }
  }


  // Submit the candidate's current answer.
  async function submitAnswer() {

    try {

      // Start submitting state.
      setSubmitting(true);

      // Clear old error.
      setError("");


      // Get JWT token.
      const token = getToken();

      if (!token) {
        throw new Error(
          "JWT token not found. Please login again."
        );
      }


      // Make sure an interview exists.
      if (!interview) {
        throw new Error(
          "Interview information not found."
        );
      }


      // Validate answer.
      if (!answer.trim()) {
        throw new Error(
          "Please enter an answer."
        );
      }


      // Get current question number.
      const currentQuestionNumber =
        interview.questionNumber;


      // Get the current question.
      const currentQuestion =
        questions[currentQuestionNumber - 1];


      // Make sure the question exists.
      if (!currentQuestion) {
        throw new Error(
          "Current question ID not found."
        );
      }


      // Submit answer to backend.
      const response = await fetch(
        `http://localhost:8080/api/ai-interviews/${interview.interviewId}/answer`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },

          body: JSON.stringify({
            questionId: currentQuestion.id,
            answerText: answer,
          }),
        }
      );


      // Read backend response.
      const responseText =
        await response.text();


      // Log answer API response.
      console.log(
        "Answer API status:",
        response.status
      );

      console.log(
        "Answer API response:",
        responseText
      );


      // Handle unauthorized request.
      if (response.status === 401) {
        throw new Error(
          "Unauthorized. Please login again."
        );
      }


      // Handle forbidden and other failed requests using the backend's message.
      if (!response.ok) {
        const message = getApiErrorMessage(
          responseText,
          response.status === 403
            ? "Access denied. Check your account permissions or subscription."
            : "Failed to submit answer."
        );

        handleSubscriptionRestriction(message);
        throw new Error(message);
      }


      // Make sure response is not empty.
      if (!responseText.trim()) {
        throw new Error(
          "Backend returned an empty response."
        );
      }


      // Convert answer evaluation into JSON.
      const result =
        JSON.parse(responseText);


      // Display current answer evaluation.
      setEvaluation(result);


      // Clear answer box.
      setAnswer("");


      // Check if another question exists.
      if (result.hasNextQuestion) {

        // Calculate next question number.
        const nextQuestionNumber =
          result.questionNumber + 1;


        // Fetch next question.
        const nextResponse =
          await fetch(
            `http://localhost:8080/api/ai-interviews/${interview.interviewId}/question?questionNumber=${nextQuestionNumber}`,
            {
              method: "GET",

              headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`,
              },
            }
          );


        // Read next question response.
        const nextText =
          await nextResponse.text();


        // Handle next question error.
        if (!nextResponse.ok) {
          throw new Error(
            nextText ||
            "Failed to load next question."
          );
        }


        // Convert next question into JSON.
        const nextQuestion =
          JSON.parse(nextText);


        // Display next question.
        setInterview(nextQuestion);


        // Clear previous question evaluation.
        setEvaluation(null);


      } else {

        // This was the final question.
        console.log(
          "Final answer submitted."
        );


        // Complete the interview.
        const completeResponse =
          await fetch(
            `http://localhost:8080/api/ai-interviews/${interview.interviewId}/complete`,
            {
              method: "POST",

              headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`,
              },
            }
          );


        // Read completion response.
        const completeText =
          await completeResponse.text();


        // Log completion response.
        console.log(
          "Complete interview status:",
          completeResponse.status
        );

        console.log(
          "Complete interview response:",
          completeText
        );


        // Handle completion error.
        if (!completeResponse.ok) {
          throw new Error(
            completeText ||
            "Failed to complete interview."
          );
        }


        // The AI interview completion endpoint returns the final result directly.
        // Do not call the generic /api/interviews/{id}/result endpoint here.
        if (!completeText.trim()) {
          throw new Error("Interview completion returned an empty response.");
        }

        // Convert completion response into the final result object.
        const finalData = JSON.parse(completeText);

        // Log the final result for debugging.
        console.log("FINAL RESULT OBJECT:", finalData);
        console.log("FINAL SCORE:", finalData.score ?? finalData.finalScore);

        // Store the final result for the result screen.
        setFinalResult(finalData);

        // ------------------------------------------------
        // Fetch detailed question-wise evaluation.
        // ------------------------------------------------

        // Show loading state for detailed evaluation.
        setLoadingEvaluation(true);


        try {

          // Call detailed evaluation API.
          const evaluationResponse =
            await fetch(
              `http://localhost:8080/api/ai-interviews/${interview.interviewId}/evaluation`,
              {
                method: "GET",

                headers: {
                  "Accept": "application/json",
                  "Authorization": `Bearer ${token}`,
                },
              }
            );


          // Read evaluation response.
          const evaluationText =
            await evaluationResponse.text();


          // Log evaluation API response.
          console.log(
            "Detailed evaluation status:",
            evaluationResponse.status
          );

          console.log(
            "Detailed evaluation response:",
            evaluationText
          );


          // Handle unauthorized request.
          if (evaluationResponse.status === 401) {
            throw new Error(
              "Unauthorized while loading detailed evaluation."
            );
          }


          // Handle forbidden request.
          if (evaluationResponse.status === 403) {
            throw new Error(
              "Access denied while loading detailed evaluation."
            );
          }


          // Handle other errors.
          if (!evaluationResponse.ok) {
            throw new Error(
              evaluationText ||
              "Failed to load detailed evaluation."
            );
          }


          // Make sure response is not empty.
          if (!evaluationText.trim()) {

            // If no evaluation exists,
            // use an empty list.
            setDetailedEvaluation([]);

          } else {

            // Convert evaluation into JSON.
            const evaluationData =
              JSON.parse(evaluationText);


            // Store question-wise evaluation.
            setDetailedEvaluation(
              Array.isArray(evaluationData)
                ? evaluationData
                : []
            );
          }


        } catch (evaluationError) {

          // Log evaluation-specific error.
          console.error(
            "Detailed evaluation error:",
            evaluationError
          );

          // Show error without losing
          // the already available final result.
          setError(
            evaluationError.message
          );


          // Keep evaluation list empty
          // if API fails.
          setDetailedEvaluation([]);

        } finally {

          // Stop evaluation loading.
          setLoadingEvaluation(false);
        }


        // Mark interview as completed and release camera/microphone devices.
        stopCameraAndMicrophone();
        setCompleted(true);


        // Clear current interview.
        setInterview(null);


        // Clear question list.
        setQuestions([]);
      }


    } catch (err) {

      // Print submit error.
      console.error(
        "Submit answer error:",
        err
      );

      // Display error.
      setError(err.message);


    } finally {

      // Stop submitting state.
      setSubmitting(false);
    }
  }


  // Start a completely new interview.
  function startNewInterview() {

    // Clear current interview.
    setInterview(null);

    // Clear questions.
    setQuestions([]);

    // Clear answer.
    setAnswer("");

    // Clear current evaluation.
    setEvaluation(null);

    // Clear detailed evaluation.
    setDetailedEvaluation([]);

    // Clear final result.
    setFinalResult(null);

    // Mark interview as not completed.
    setCompleted(false);

    // Clear error.
    setError("");
  }


  return (
    <div className="card">

      {/* Main AI Interview heading. */}
      <h2>
        AI Interview
      </h2>


      {/* Short description. */}
      <p>
        Practice technical interview questions
        with our AI-powered interview system.
      </p>


      {/* Display errors. */}
      {error && (
        <div
          style={{
            color: "#991b1b",
            background: "#fee2e2",
            padding: "12px",
            borderRadius: "8px",
            marginTop: "15px",
            marginBottom: "15px",
          }}
        >
          {error}
        </div>
      )}

      {/* Show this only when the backend reports a plan/usage restriction. */}
      {showPlansButton && (
        <button
          type="button"
          onClick={() => {
            if (typeof onOpenPlans === "function") {
              onOpenPlans();
            } else {
              setError(
                "Please open Subscription & Plans from the sidebar to upgrade your plan."
              );
            }
          }}
          style={{
            marginTop: "8px",
            marginBottom: "16px",
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "600",
            background: "#6d28d9",
            color: "#ffffff",
          }}
        >
          View Subscription & Plans
        </button>
      )}


      {/* --------------------------------------------- */}
      {/* Interview selection screen.                   */}
      {/* --------------------------------------------- */}

      {!interview && !completed && (
        <div
          style={{
            marginTop: "25px",
          }}
        >

          {/* Mandatory camera and microphone setup. */}
          <section
            style={{
              marginBottom: "24px",
              padding: "18px",
              border: "1px solid #d8d2f2",
              borderRadius: "12px",
              background: "#faf9ff",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "8px" }}>
              Camera & Microphone Setup
            </h3>
            <p style={{ marginTop: 0, color: "#555", lineHeight: "1.5" }}>
              Camera and microphone access are required before you can start an AI interview.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                alignItems: "start",
              }}
            >
              <div>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  aria-label="Your camera preview"
                  style={{
                    width: "100%",
                    minHeight: "170px",
                    maxHeight: "240px",
                    objectFit: "cover",
                    background: "#171717",
                    borderRadius: "10px",
                    display: "block",
                  }}
                />
                <p style={{ marginBottom: 0, fontSize: "14px" }}>
                  Camera: {mediaReady ? "Enabled" : "Not enabled"}
                </p>
              </div>

              <div style={{ padding: "8px 0" }}>
                <p style={{ marginTop: 0 }}>
                  <strong>Camera:</strong> Required
                </p>
                <p>
                  <strong>Microphone:</strong> {mediaReady ? "Enabled" : "Not enabled"}
                </p>
                <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.5" }}>
                  Click the button below and allow camera and microphone access in your browser.
                </p>
                <button
                  type="button"
                  onClick={enableCameraAndMicrophone}
                  disabled={mediaLoading || mediaReady}
                  style={{
                    padding: "11px 18px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: mediaLoading || mediaReady ? "not-allowed" : "pointer",
                    background: mediaReady ? "#15803d" : "#6d28d9",
                    color: "#fff",
                    fontWeight: "600",
                  }}
                >
                  {mediaLoading
                    ? "Requesting permissions..."
                    : mediaReady
                      ? "Camera & Microphone Ready"
                      : "Enable Camera & Microphone"}
                </button>

                {mediaReady && (
                  <button
                    type="button"
                    onClick={stopCameraAndMicrophone}
                    style={{
                      display: "block",
                      marginTop: "10px",
                      padding: "8px 12px",
                      border: "1px solid #aaa",
                      borderRadius: "8px",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Turn Off Devices
                  </button>
                )}
              </div>
            </div>

            {mediaError && (
              <p
                role="alert"
                style={{
                  color: "#991b1b",
                  background: "#fee2e2",
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: 0,
                }}
              >
                {mediaError}
              </p>
            )}
          </section>

          {/* Technology label. */}
          <label>
            <strong>
              Technology
            </strong>
          </label>


          {/* Technology dropdown. */}
          <select
            value={technology}
            onChange={(event) =>
              setTechnology(
                event.target.value
              )
            }
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "20px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          >

            <option value="Java">
              Java
            </option>

            <option value="Spring Boot">
              Spring Boot
            </option>

            <option value="Python">
              Python
            </option>

            <option value="JavaScript">
              JavaScript
            </option>

            <option value="SQL">
              SQL
            </option>

          </select>


          {/* Difficulty label. */}
          <label>
            <strong>
              Difficulty
            </strong>
          </label>


          {/* Difficulty dropdown. */}
          <select
            value={difficulty}
            onChange={(event) =>
              setDifficulty(
                event.target.value
              )
            }
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "20px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          >

            <option value="EASY">
              Easy
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HARD">
              Hard
            </option>

          </select>


          {/* Start interview button. */}
          <button
            onClick={startInterview}
            disabled={loading || !mediaReady}
            style={{
              padding: "12px 25px",
              border: "none",
              borderRadius: "8px",
              cursor: loading || !mediaReady
                ? "not-allowed"
                : "pointer",
              opacity: !mediaReady ? 0.55 : 1,
              fontSize: "16px",
            }}
          >

            {loading
              ? "Starting Interview..."
              : !mediaReady
                ? "Enable Camera & Microphone First"
                : "Start AI Interview"}

          </button>

        </div>
      )}


      {/* --------------------------------------------- */}
      {/* Final result screen.                           */}
      {/* --------------------------------------------- */}

      {completed && finalResult && (
        <div
          style={{
            marginTop: "25px",
            padding: "30px",
            background: "#ffffff",
            border: "1px solid #d1d5db",
            borderRadius: "12px",
            color: "#111827",
          }}
        >

          {/* Completion heading. */}
          <div
            style={{
              textAlign: "center",
            }}
          >

            <h2
              style={{
                color: "#111827",
                fontSize: "28px",
                marginBottom: "12px",
              }}
            >
              🎉 Interview Completed!
            </h2>

            <p
              style={{
                color: "#374151",
                fontSize: "17px",
              }}
            >
              Your AI interview has been
              successfully completed.
            </p>

          </div>


          {/* ----------------------------------------- */}
          {/* Overall final score.                      */}
          {/* ----------------------------------------- */}

          <div
            style={{
              marginTop: "25px",
              marginBottom: "25px",
              padding: "20px",
              background: "#f3f4f6",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >

            {/* 
              Backend returns finalScore.
              The fallback to score protects
              against older API responses.
            */}
            <h1
              style={{
                fontSize: "52px",
                fontWeight: "700",
                color: "#111827",
                margin: "5px 0",
              }}
            >
              {finalResult?.finalScore ??
                finalResult?.score ??
                0} / 10
            </h1>

            <p
              style={{
                color: "#4b5563",
                fontSize: "16px",
                fontWeight: "600",
                margin: "5px 0",
              }}
            >
              Final Score
            </p>

          </div>


          {/* ----------------------------------------- */}
          {/* Interview summary.                        */}
          {/* ----------------------------------------- */}

          <div
            style={{
              textAlign: "center",
              fontSize: "17px",
              lineHeight: "1.8",
              color: "#111827",
            }}
          >

            <p>
              <strong>
                Technology:
              </strong>{" "}
              {finalResult.technology}
            </p>

            <p>
              <strong>
                Difficulty:
              </strong>{" "}
              {finalResult.difficulty}
            </p>

            <p>
              <strong>
                Total Questions:
              </strong>{" "}
              {finalResult.totalQuestions}
            </p>

            <p>
              <strong>
                Answered Questions:
              </strong>{" "}
              {finalResult.answeredQuestions}
            </p>

            <p>
              <strong>
                Status:
              </strong>{" "}

              <span
                style={{
                  fontWeight: "700",
                  color: "#166534",
                }}
              >
                {finalResult.status}
              </span>
            </p>

          </div>


          {/* ----------------------------------------- */}
          {/* Detailed evaluation heading.              */}
          {/* ----------------------------------------- */}

          <div
            style={{
              marginTop: "40px",
              marginBottom: "20px",
            }}
          >

            <h2
              style={{
                color: "#111827",
                marginBottom: "8px",
              }}
            >
              Question-wise Evaluation
            </h2>

            <p
              style={{
                color: "#4b5563",
              }}
            >
              Review your answer, score and feedback
              for each question.
            </p>

          </div>


          {/* ----------------------------------------- */}
          {/* Detailed evaluation loading state.        */}
          {/* ----------------------------------------- */}

          {loadingEvaluation && (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                background: "#f9fafb",
                borderRadius: "10px",
                color: "#374151",
              }}
            >
              Loading detailed evaluation...
            </div>
          )}


          {/* ----------------------------------------- */}
          {/* Question-wise evaluation cards.           */}
          {/* ----------------------------------------- */}

          {!loadingEvaluation &&
            detailedEvaluation.length > 0 && (

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >

                {detailedEvaluation.map(
                  (item, index) => (

                    <div
                      key={
                        item.questionId ||
                        index
                      }
                      style={{
                        border: "1px solid #d1d5db",
                        borderRadius: "12px",
                        padding: "22px",
                        background: "#ffffff",
                      }}
                    >

                      {/* Question number. */}
                      <h3
                        style={{
                          color: "#111827",
                          marginTop: "0",
                          marginBottom: "15px",
                        }}
                      >
                        Question {index + 1}
                      </h3>


                      {/* Question text. */}
                      <div
                        style={{
                          marginBottom: "18px",
                        }}
                      >

                        <p
                          style={{
                            fontWeight: "700",
                            color: "#111827",
                            marginBottom: "8px",
                          }}
                        >
                          Question:
                        </p>

                        <p
                          style={{
                            color: "#374151",
                            lineHeight: "1.6",
                          }}
                        >
                          {item.questionText}
                        </p>

                      </div>


                      {/* Candidate answer. */}
                      <div
                        style={{
                          marginBottom: "18px",
                          padding: "15px",
                          background: "#f9fafb",
                          borderRadius: "8px",
                        }}
                      >

                        <p
                          style={{
                            fontWeight: "700",
                            color: "#111827",
                            marginTop: "0",
                          }}
                        >
                          Your Answer:
                        </p>

                        <p
                          style={{
                            color: "#374151",
                            lineHeight: "1.6",
                            whiteSpace: "pre-wrap",
                            marginBottom: "0",
                          }}
                        >
                          {item.answerText}
                        </p>

                      </div>


                      {/* Question score. */}
                      <div
                        style={{
                          marginBottom: "18px",
                        }}
                      >

                        <p
                          style={{
                            fontWeight: "700",
                            color: "#111827",
                            marginBottom: "5px",
                          }}
                        >
                          Score:
                        </p>

                        <p
                          style={{
                            fontSize: "22px",
                            fontWeight: "700",
                            color: "#111827",
                            marginTop: "5px",
                          }}
                        >
                          {item.score ?? 0} / 10
                        </p>

                      </div>


                      {/* Feedback. */}
                      <div>

                        <p
                          style={{
                            fontWeight: "700",
                            color: "#111827",
                            marginBottom: "8px",
                          }}
                        >
                          Feedback:
                        </p>

                        <p
                          style={{
                            color: "#374151",
                            lineHeight: "1.7",
                            whiteSpace: "pre-wrap",
                            marginBottom: "0",
                          }}
                        >
                          {item.feedback ||
                            "No feedback available."}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>
            )}


          {/* ----------------------------------------- */}
          {/* No detailed evaluation available.         */}
          {/* ----------------------------------------- */}

          {!loadingEvaluation &&
            detailedEvaluation.length === 0 && (

              <div
                style={{
                  padding: "20px",
                  background: "#f9fafb",
                  borderRadius: "10px",
                  color: "#374151",
                  textAlign: "center",
                }}
              >
                Detailed evaluation is not
                available for this interview.
              </div>
            )}


          {/* ----------------------------------------- */}
          {/* Start new interview button.               */}
          {/* ----------------------------------------- */}

          <div
            style={{
              textAlign: "center",
              marginTop: "30px",
            }}
          >

            <button
              onClick={startNewInterview}
              style={{
                padding: "12px 25px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
                background: "#111827",
                color: "#ffffff",
              }}
            >
              Start New Interview
            </button>

          </div>

        </div>
      )}


      {/* --------------------------------------------- */}
      {/* Current interview question screen.            */}
      {/* --------------------------------------------- */}

      {interview && !completed && (
        <div
          style={{
            marginTop: "25px",
          }}
        >

          {/* Keep the mandatory camera preview visible during the interview. */}
          <div
            style={{
              marginBottom: "20px",
              maxWidth: "420px",
              padding: "10px",
              border: "1px solid #d8d2f2",
              borderRadius: "12px",
              background: "#faf9ff",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              aria-label="Your live interview camera preview"
              style={{
                width: "100%",
                maxHeight: "260px",
                objectFit: "cover",
                display: "block",
                borderRadius: "8px",
                background: "#171717",
              }}
            />
            <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#166534" }}>
              Camera and microphone are enabled for this interview.
            </p>
          </div>

          {/* Interview information. */}
          <div
            style={{
              background: "#f5f3ff",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >

            <p>
              <strong>
                Technology:
              </strong>{" "}
              {interview.technology}
            </p>

            <p>
              <strong>
                Difficulty:
              </strong>{" "}
              {interview.difficulty}
            </p>

            <p>
              <strong>
                Question:
              </strong>{" "}
              {interview.questionNumber}
              {" / "}
              {interview.totalQuestions}
            </p>

          </div>


          {/* Current question. */}
          <div
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >

            <h3>
              Question {interview.questionNumber}
            </h3>

            <p
              style={{
                fontSize: "18px",
                lineHeight: "1.6",
              }}
            >
              {interview.question}
            </p>

          </div>


          {/* Previous answer evaluation. */}
          {evaluation && (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >

              <h3>
                Answer Evaluation
              </h3>

              <p>
                <strong>
                  Score:
                </strong>{" "}
                {evaluation.score ?? 0}/10
              </p>

              <p>
                <strong>
                  Feedback:
                </strong>
              </p>

              <p
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.6",
                }}
              >
                {evaluation.feedback}
              </p>

            </div>
          )}


          {/* Answer label. */}
          <label>
            <strong>
              Your Answer
            </strong>
          </label>


          {/* Candidate answer textarea. */}
          <textarea
            value={answer}
            onChange={(event) =>
              setAnswer(
                event.target.value
              )
            }
            placeholder="Type your answer here..."
            rows="7"
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />


          {/* Submit answer button. */}
          <button
            onClick={submitAnswer}
            disabled={
              submitting ||
              !answer.trim()
            }
            style={{
              marginTop: "15px",
              padding: "12px 25px",
              border: "none",
              borderRadius: "8px",
              cursor:
                submitting ||
                !answer.trim()
                  ? "not-allowed"
                  : "pointer",
              fontSize: "16px",
            }}
          >

            {submitting
              ? "Evaluating..."
              : interview.questionNumber ===
                interview.totalQuestions
                ? "Submit Final Answer"
                : "Submit Answer"}

          </button>

        </div>
      )}

    </div>
  );
}

export default AIInterview;