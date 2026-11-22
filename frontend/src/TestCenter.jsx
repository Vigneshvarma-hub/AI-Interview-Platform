import React, { useCallback, useEffect, useRef, useState } from "react";
import "./TestCenter.css";

// Backend API
const API_BASE = "http://localhost:8080/api/test-center";

// All-rounder subjects
const SUBJECTS = [
  "Java",
  "Python",
  "C",
  "C++",
  "JavaScript",
  "SQL",
  "Spring Boot",
  "DBMS",
  "Operating Systems",
  "Computer Networks",
  "OOP",
  "DSA",
  "Software Engineering",
  "Artificial Intelligence",
  "Machine Learning",
  "Cybersecurity",
  "Electrical Engineering",
  "Power Systems",
  "Electrical Machines",
  "Power Electronics",
  "Control Systems",
  "Electronics Engineering",
  "Digital Electronics",
  "Analog Electronics",
  "VLSI",
  "Embedded Systems",
  "Mathematics",
  "Calculus",
  "Algebra",
  "Statistics",
  "Probability",
  "Physics",
  "Mechanics",
  "Thermodynamics",
  "Optics",
  "Mechanical Engineering",
  "Fluid Mechanics",
  "Manufacturing Technology",
  "Strength of Materials",
  "General Knowledge",
  "Indian History",
  "Geography",
  "Indian Constitution",
  "Current Affairs",
  "Economics",
  "Quantitative Aptitude",
  "Logical Reasoning",
  "Verbal Ability",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const INTERVIEW_TIPS = [
  "Understand the concept instead of memorizing the answer.",
  "Read every question carefully before selecting an option.",
  "Eliminate incorrect options before choosing your final answer.",
  "Manage your time and avoid spending too long on one question.",
  "Practice explaining technical concepts in simple language.",
  "Review your mistakes after every assessment.",
  "Focus on fundamentals before moving to advanced concepts.",
  "Stay calm and think logically when solving difficult problems.",
];

function getToken() {
  return localStorage.getItem("token");
}

async function apiRequest(url, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body.message || body.error || `Request failed (${response.status})`
    );
  }

  return body;
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function getInitialAnswers(questions) {
  const initial = {};

  questions.forEach((question) => {
    initial[question.questionId] = {
      selectedOptions: [],
      markedForReview: false,
      saved: true,
    };
  });

  return initial;
}

export default function TestCenter({
  standaloneExamKey = null,
  standaloneSetup = false,
}) {
  const standaloneMode = Boolean(standaloneExamKey || standaloneSetup);

  const [screen, setScreen] = useState("setup");
  const [technology, setTechnology] = useState("Java");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(30);

  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preparationMessage, setPreparationMessage] = useState("");
  const [preparationStatus, setPreparationStatus] = useState("IDLE");
  const [showSubmitConfirmation, setShowSubmitConfirmation] =
    useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const submittingRef = useRef(false);

  // Keep track of answer requests so submission waits until the latest
  // selection for every question has been saved by the backend.
  const pendingAnswerSavesRef = useRef(new Map());

  // Prevent repeated automatic submissions after the timer expires.
  // If the automatic request fails, the user can still retry manually.
  const autoSubmitAttemptedRef = useRef(false);

  const preparationRef = useRef({
    key: "",
    status: "IDLE",
    promise: null,
  });

  const questions = test?.questions || [];
  const currentQuestion = questions[currentIndex];

  const currentAnswer = currentQuestion
    ? answers[currentQuestion.questionId] || {
        selectedOptions: [],
        markedForReview: false,
        saved: true,
      }
    : null;

  const answeredCount = questions.filter(
    (question) =>
      (answers[question.questionId]?.selectedOptions || []).length > 0
  ).length;

  const markedCount = questions.filter(
    (question) => answers[question.questionId]?.markedForReview
  ).length;

  const unansweredCount = questions.length - answeredCount;

  const configKey = `${technology}|${difficulty}|${questionCount}`;

  // Restore standalone exam session.
  useEffect(() => {
    if (!standaloneExamKey) return;

    try {
      const storageKey = `tc-exam-${standaloneExamKey}`;
      const savedPayload = localStorage.getItem(storageKey);

      if (!savedPayload) {
        setError("The exam session could not be found. Please start a new test.");
        setScreen("setup");
        return;
      }

      const payload = JSON.parse(savedPayload);

      if (!payload?.test?.testId || !Array.isArray(payload.test.questions)) {
        throw new Error("The saved exam session is invalid.");
      }

      setTest(payload.test);
      submittingRef.current = false;
      autoSubmitAttemptedRef.current = false;
      setAnswers(payload.answers || getInitialAnswers(payload.test.questions));
      setCurrentIndex(0);
      setResult(null);

      setRemainingSeconds(
        Math.max(
          0,
          Math.ceil(
            (new Date(payload.test.expiresAt).getTime() - Date.now()) / 1000
          )
        )
      );

      setScreen("exam");
    } catch (restoreError) {
      console.error("Could not restore standalone test:", restoreError);
      setError(restoreError.message || "Could not restore the exam.");
      setScreen("setup");
    }
  }, [standaloneExamKey]);

  // Fullscreen state.
  useEffect(() => {
    const updateFullscreenState = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener("fullscreenchange", updateFullscreenState);

    return () =>
      document.removeEventListener("fullscreenchange", updateFullscreenState);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      setNotice(
        "Fullscreen was blocked by the browser. Use the browser's fullscreen option if needed."
      );
    }
  };

  // Rotate useful tips while preparing questions.
  useEffect(() => {
    if (screen !== "preparing") return;

    const tipTimer = window.setInterval(() => {
      setTipIndex((previous) => (previous + 1) % INTERVIEW_TIPS.length);
    }, 7000);

    return () => window.clearInterval(tipTimer);
  }, [screen]);

  // Automatically prepare questions when subject, difficulty or count changes.
  useEffect(() => {
    if (standaloneMode || screen !== "setup") return;

    let cancelled = false;

    const currentKey = `${technology}|${difficulty}|${questionCount}`;

    if (
      preparationRef.current.key === currentKey &&
      ["PREPARING", "READY"].includes(preparationRef.current.status)
    ) {
      return;
    }

    preparationRef.current = {
      key: currentKey,
      status: "PREPARING",
      promise: null,
    };

    setPreparationStatus("PREPARING");
    setPreparationMessage("Preparing questions in the background...");
    setError("");

    const requestBody = {
      technology,
      difficulty,
      questionCount: Number(questionCount),
      durationMinutes: Number(durationMinutes),
    };

    const prepareQuestions = async () => {
      try {
        const preparePromise = apiRequest("/prepare", {
          method: "POST",
          body: JSON.stringify(requestBody),
        });

        preparationRef.current.promise = preparePromise;

        const preparation = await preparePromise;

        let status = String(preparation.status || "PREPARING").toUpperCase();

        preparationRef.current.status = status;

        while (status !== "READY") {
          if (cancelled) return;

          if (status === "FAILED") {
            throw new Error(
              preparation.message || "Question preparation failed."
            );
          }

          await new Promise((resolve) => window.setTimeout(resolve, 1500));

          const statusResponse = await apiRequest("/preparation-status", {
            method: "POST",
            body: JSON.stringify(requestBody),
          });

          status = String(statusResponse.status || "").toUpperCase();

          preparationRef.current.status = status;

          if (status === "FAILED") {
            throw new Error(
              statusResponse.message || "Question preparation failed."
            );
          }

          if (status === "NOT_STARTED") {
            throw new Error("Question preparation was not found.");
          }
        }

        if (cancelled) return;

        setPreparationStatus("READY");
        setPreparationMessage("Your questions are ready. Start whenever you are!");

      } catch (prepareError) {
        if (cancelled) return;

        preparationRef.current.status = "FAILED";
        setPreparationStatus("FAILED");
        setPreparationMessage(
          prepareError.message || "Question preparation failed."
        );
      }
    };

    prepareQuestions();

    return () => {
      cancelled = true;
    };
  }, [technology, difficulty, questionCount, standaloneMode, screen]);

  // Timer starts only after the test has been created.
  useEffect(() => {
    if (screen !== "exam" || !test?.expiresAt) return;

    const updateTimer = () => {
      const seconds = Math.max(
        0,
        Math.ceil((new Date(test.expiresAt).getTime() - Date.now()) / 1000)
      );

      setRemainingSeconds(seconds);

      if (seconds <= 0 && !autoSubmitAttemptedRef.current) {
        autoSubmitAttemptedRef.current = true;
        handleAutoSubmit();
      }
    };

    updateTimer();

    const timerId = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(timerId);
  }, [screen, test?.expiresAt]);

  // Start the test using prepared questions.
  const startTest = async (event) => {
    event.preventDefault();

    // Open the exam tab immediately during the user's click.
    // Opening it after the async API calls may be blocked by the browser.
    const examWindow = standaloneMode ? null : window.open("about:blank", "_blank");

    if (!standaloneMode && !examWindow) {
      setError("Your browser blocked the exam tab. Allow pop-ups for this site and try again.");
      return;
    }

    setError("");
    setNotice("");
    setLoading(true);
    setScreen("preparing");
    submittingRef.current = false;
    autoSubmitAttemptedRef.current = false;

    try {
      const requestBody = {
        technology,
        difficulty,
        questionCount: Number(questionCount),
        durationMinutes: Number(durationMinutes),
      };

      let status = String(
        preparationRef.current.status || "IDLE"
      ).toUpperCase();

      if (
        preparationRef.current.key !== configKey ||
        status === "IDLE" ||
        status === "FAILED"
      ) {
        preparationRef.current = {
          key: configKey,
          status: "PREPARING",
          promise: null,
        };

        const preparePromise = apiRequest("/prepare", {
          method: "POST",
          body: JSON.stringify(requestBody),
        });

        preparationRef.current.promise = preparePromise;

        const preparation = await preparePromise;

        status = String(preparation.status || "PREPARING").toUpperCase();
        preparationRef.current.status = status;
      } else if (preparationRef.current.promise) {
        await preparationRef.current.promise;
        status = preparationRef.current.status;
      }

      const startedAt = Date.now();
      const timeoutMs = 4 * 60 * 1000;

      while (status !== "READY") {
        if (status === "FAILED") {
          throw new Error(
            "AI question generation failed. Please try again."
          );
        }

        if (Date.now() - startedAt >= timeoutMs) {
          throw new Error(
            "Question generation is taking longer than expected. Please try again."
          );
        }

        setPreparationStatus("PREPARING");
        setPreparationMessage("Gemini is preparing your questions...");

        await new Promise((resolve) => window.setTimeout(resolve, 1500));

        const statusResponse = await apiRequest("/preparation-status", {
          method: "POST",
          body: JSON.stringify(requestBody),
        });

        status = String(statusResponse.status || "").toUpperCase();
        preparationRef.current.status = status;

        if (status === "FAILED") {
          throw new Error(
            statusResponse.message || "Question generation failed."
          );
        }

        if (status === "NOT_STARTED") {
          throw new Error(
            "Question preparation was not found. Please try again."
          );
        }
      }

      setPreparationStatus("READY");
      setPreparationMessage("Questions are ready. Opening your exam...");

      const response = await apiRequest("/start", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (!response.questions?.length) {
        throw new Error("No questions were returned for this test.");
      }

      const initialAnswers = getInitialAnswers(response.questions);

      if (standaloneMode) {
        setTest(response);
        setAnswers(initialAnswers);
        setCurrentIndex(0);
        setResult(null);

        const expiry = new Date(response.expiresAt).getTime();

        setRemainingSeconds(
          Math.max(0, Math.ceil((expiry - Date.now()) / 1000))
        );

        setScreen("exam");
      } else {
        const examKey = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

        localStorage.setItem(
          `tc-exam-${examKey}`,
          JSON.stringify({
            test: response,
            answers: initialAnswers,
          })
        );

        const examUrl =
          `${window.location.origin}/?testCenterExam=${encodeURIComponent(
            examKey
          )}`;

        // Load the standalone exam in the tab opened at the start of this click.
        examWindow.location.replace(examUrl);

        // Keep the original tab on Test Center setup instead of leaving it
        // stuck on the preparation screen.
        setScreen("setup");
        setNotice("Your exam has opened in a new tab. You can return here to start another test.");
      }

      preparationRef.current = {
        key: "",
        status: "IDLE",
        promise: null,
      };

    } catch (err) {
      // Close the unused blank tab if question generation or test creation fails.
      if (examWindow && !examWindow.closed) {
        examWindow.close();
      }

      setError(err.message || "Unable to prepare your test.");
      setPreparationMessage("");
      setScreen("setup");

    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = useCallback(
    async (question, selectedOptions, markedForReview) => {
      if (!question || !test || submittingRef.current) return;

      const questionId = question.questionId;
      const optionsToSave = [...selectedOptions];

      // Update the screen immediately while the backend request is running.
      setAnswers((previous) => ({
        ...previous,
        [questionId]: {
          selectedOptions: optionsToSave,
          markedForReview,
          saved: false,
        },
      }));

      // Serialize saves for the same question. This prevents an older request
      // from finishing after a newer request and overwriting the latest answer.
      const previousSave =
        pendingAnswerSavesRef.current.get(questionId) || Promise.resolve(true);

      const savePromise = previousSave
        .catch(() => false)
        .then(async () => {
          try {
            await apiRequest(`/${test.testId}/answer`, {
              method: "PUT",
              body: JSON.stringify({
                questionId,
                selectedOptions: optionsToSave,
                markedForReview,
              }),
            });

            if (standaloneExamKey) {
              const storageKey = `tc-exam-${standaloneExamKey}`;
              const savedPayload = JSON.parse(
                localStorage.getItem(storageKey) || "{}"
              );

              savedPayload.answers = {
                ...(savedPayload.answers || {}),
                [questionId]: {
                  selectedOptions: optionsToSave,
                  markedForReview,
                  saved: true,
                },
              };

              localStorage.setItem(storageKey, JSON.stringify(savedPayload));
            }

            // Mark as saved only if this response still represents the
            // latest selection currently displayed for this question.
            setAnswers((previous) => {
              const current = previous[questionId];
              const sameSelection =
                JSON.stringify(current?.selectedOptions || []) ===
                  JSON.stringify(optionsToSave) &&
                current?.markedForReview === markedForReview;

              if (!sameSelection) return previous;

              return {
                ...previous,
                [questionId]: {
                  ...current,
                  saved: true,
                },
              };
            });

            return true;
          } catch (err) {
            setError(`Answer could not be saved: ${err.message}`);
            return false;
          }
        });

      pendingAnswerSavesRef.current.set(questionId, savePromise);

      // Remove only this request if it is still the latest tracked request.
      savePromise.then(() => {
        if (pendingAnswerSavesRef.current.get(questionId) === savePromise) {
          pendingAnswerSavesRef.current.delete(questionId);
        }
      });

      return savePromise;
    },
    [test, standaloneExamKey]
  );

  const toggleOption = (option) => {
    if (!currentQuestion || !currentAnswer) return;

    const isMultiple = currentQuestion.questionType === "MSQ";
    const selected = currentAnswer.selectedOptions || [];

    const nextSelected = isMultiple
      ? selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option]
      : selected.includes(option)
        ? []
        : [option];

    setError("");

    saveAnswer(
      currentQuestion,
      nextSelected,
      currentAnswer.markedForReview
    );
  };

  const toggleReview = () => {
    if (!currentQuestion || !currentAnswer) return;

    saveAnswer(
      currentQuestion,
      currentAnswer.selectedOptions || [],
      !currentAnswer.markedForReview
    );
  };

  const submitTest = useCallback(async () => {
    if (!test || submittingRef.current) return;

    submittingRef.current = true;
    setLoading(true);
    setError("");
    setShowSubmitConfirmation(false);

    try {
      // Wait for all outstanding answer saves before asking the backend to
      // grade the test. Each tracked promise represents the latest save for
      // its question, including any earlier save chained before it.
      const pendingSaves = Array.from(
        pendingAnswerSavesRef.current.values()
      );
      const saveResults = await Promise.all(pendingSaves);

      if (saveResults.some((saved) => !saved)) {
        throw new Error(
          "One or more answers could not be saved. Please check your connection and submit again."
        );
      }

      const response = await apiRequest(`/${test.testId}/submit`, {
        method: "POST",
      });

      setResult(response);
      setScreen("result");

    } catch (err) {
      submittingRef.current = false;
      setError(err.message || "Unable to submit the test.");

    } finally {
      setLoading(false);
    }
  }, [test]);

  const handleAutoSubmit = useCallback(() => {
    if (!submittingRef.current) {
      submitTest();
    }
  }, [submitTest]);

  const goToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  const restart = () => {
    if (standaloneExamKey) {
      localStorage.removeItem(`tc-exam-${standaloneExamKey}`);

      window.location.replace(
        `${window.location.origin}/?testCenterSetup=1`
      );

      return;
    }

    setTest(null);
    setAnswers({});
    setResult(null);
    setCurrentIndex(0);
    setRemainingSeconds(0);
    setError("");
    setNotice("");
    setPreparationMessage("");
    setPreparationStatus("IDLE");
    setShowSubmitConfirmation(false);

    preparationRef.current = {
      key: "",
      status: "IDLE",
      promise: null,
    };

    submittingRef.current = false;
    autoSubmitAttemptedRef.current = false;
    setScreen("setup");
  };

  const standalonePageStyle = standaloneMode
    ? {
        width: "100%",
        maxWidth: "none",
        minHeight: "100vh",
        margin: 0,
        padding: "24px",
        boxSizing: "border-box",
      }
    : undefined;

  // --------------------------------------------------
  // FULL-PAGE AI QUESTION PREPARATION SCREEN
  // --------------------------------------------------

  if (screen === "preparing") {
    return (
      <div
        className={`tc-page tc-preparing-page ${
          standaloneMode ? "tc-standalone-page" : ""
        }`}
        style={standalonePageStyle}
      >
        <section className="tc-preparing-screen">
          <header className="tc-preparing-heading">
            <span className="tc-eyebrow">AI ASSESSMENT CENTER</span>
            <h1>Your Test Is Getting Ready!</h1>
            <p>
              Our AI is preparing your personalized questions. Get comfortable
              while we get your assessment ready.
            </p>
          </header>

          <div className="tc-rocket-track" aria-label="Loading animation">
            <span className="tc-rocket" aria-hidden="true">🚀</span>
          </div>

          <div className="tc-preparing-details">
            <div>
              <span>Subject</span>
              <strong>{technology}</strong>
            </div>
            <div>
              <span>Difficulty</span>
              <strong>{difficulty}</strong>
            </div>
            <div>
              <span>Questions</span>
              <strong>{questionCount}</strong>
            </div>
            <div>
              <span>Duration</span>
              <strong>{durationMinutes} min</strong>
            </div>
          </div>

          <div className="tc-preparing-status" role="status" aria-live="polite">
            <span className="tc-loading-indicator" aria-hidden="true" />
            <div>
              <strong>
                {preparationStatus === "READY"
                  ? "Your questions are ready!"
                  : "Generating your questions..."}
              </strong>
              <p>
                {preparationMessage ||
                  "Please wait while AI prepares your assessment."}
              </p>
            </div>
          </div>

          <section className="tc-wait-instructions">
            <h2>📋 While You Wait — Test Instructions</h2>
            <div className="tc-instruction-grid">
              <div>
                <span>01</span>
                <p>Read every question carefully before selecting an answer.</p>
              </div>
              <div>
                <span>02</span>
                <p>MCQ questions allow only one correct answer.</p>
              </div>
              <div>
                <span>03</span>
                <p>MSQ questions may have multiple correct answers.</p>
              </div>
              <div>
                <span>04</span>
                <p>Use Mark for Review to revisit difficult questions.</p>
              </div>
              <div>
                <span>05</span>
                <p>Your answers are saved as you progress through the test.</p>
              </div>
              <div>
                <span>06</span>
                <p>Your exam timer starts only after your test opens.</p>
              </div>
            </div>
          </section>

          <div className="tc-preparing-tip">
            <span aria-hidden="true">💡</span>
            <div>
              <strong>Interview Tip</strong>
              <p>{INTERVIEW_TIPS[tipIndex]}</p>
            </div>
          </div>

          {error && (
            <div className="tc-error" role="alert">
              {error}
              <button
                type="button"
                className="tc-secondary-btn"
                onClick={() => {
                  setScreen("setup");
                  setError("");
                }}
              >
                Back to Setup
              </button>
            </div>
          )}

          <p className="tc-preparing-footer">
            Please keep this page open. Your exam will open automatically when
            question preparation is complete. Your exam timer has not started.
          </p>
        </section>
      </div>
    );
  }

  // --------------------------------------------------
  // TEST SETUP SCREEN
  // --------------------------------------------------

  if (screen === "setup") {
    return (
      <div
        className={`tc-page ${
          standaloneMode ? "tc-standalone-page" : ""
        }`}
        style={standalonePageStyle}
      >
        <div className="tc-setup-grid">
          <form className="tc-card tc-setup-form" onSubmit={startTest}>
            <h2>Configure your test</h2>

            <label htmlFor="tc-subject">Subject</label>

            <select
              id="tc-subject"
              value={technology}
              onChange={(event) => {
                setTechnology(event.target.value);
                setError("");
              }}
            >
              {SUBJECTS.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            <label htmlFor="tc-difficulty">Difficulty</label>

            <select
              id="tc-difficulty"
              value={difficulty}
              onChange={(event) => {
                setDifficulty(event.target.value);
                setError("");
              }}
            >
              {DIFFICULTIES.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <div className="tc-form-row">
              <div>
                <label htmlFor="tc-count">Questions</label>

                <select
                  id="tc-count"
                  value={questionCount}
                  onChange={(event) =>
                    setQuestionCount(Number(event.target.value))
                  }
                >
                  {[10, 15, 20, 30, 50].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tc-duration">Duration</label>

                <select
                  id="tc-duration"
                  value={durationMinutes}
                  onChange={(event) =>
                    setDurationMinutes(Number(event.target.value))
                  }
                >
                  {[10, 15, 20, 30, 45, 60, 90, 120].map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes} min
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="tc-error" role="alert">
                {error}
              </div>
            )}

            {preparationMessage && (
              <div
                className={
                  preparationStatus === "FAILED"
                    ? "tc-error"
                    : "tc-notice"
                }
                role="status"
                aria-live="polite"
              >
                {preparationStatus === "READY"
                  ? "✓ Questions are ready. You can start your test."
                  : preparationMessage}
              </div>
            )}

            <button
              className="tc-primary-btn"
              type="submit"
              disabled={loading}
            >
              Start Test
            </button>
          </form>

          <aside className="tc-card tc-instructions">
            <h2>Before you begin</h2>

            <div className="tc-instruction-item">
              <span>01</span>
              <div>
                <strong>Manage your time</strong>
                <p>
                  The countdown starts when the server creates your test.
                </p>
              </div>
            </div>

            <div className="tc-instruction-item">
              <span>02</span>
              <div>
                <strong>Review your answers</strong>
                <p>
                  Mark difficult questions and return to them later.
                </p>
              </div>
            </div>

            <div className="tc-instruction-item">
              <span>03</span>
              <div>
                <strong>MCQ and MSQ</strong>
                <p>
                  MCQ allows one answer. MSQ allows multiple selections.
                </p>
              </div>
            </div>

            <div className="tc-instruction-item">
              <span>04</span>
              <div>
                <strong>Final submission</strong>
                <p>
                  Your score and answer explanations appear after submission.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // RESULT SCREEN
  // --------------------------------------------------

  if (screen === "result" && result) {
    return (
      <div
        className={`tc-page ${
          standaloneMode ? "tc-standalone-page" : ""
        }`}
        style={standalonePageStyle}
      >
        <header className="tc-header">
          <div>
            <span className="tc-eyebrow">TEST COMPLETED</span>
            <h1>Your Test Result</h1>
            <p>
              {result.technology} · {result.difficulty}
            </p>
          </div>

          {/* Return to the main application homepage after reviewing the result. */}
          <button
            className="tc-secondary-btn"
            onClick={() => {
              window.location.href = window.location.origin;
            }}
          >
            Go to Homepage
          </button>
        </header>

        <section className="tc-result-grid">
          <div className="tc-card tc-score-card">
            <span>Final percentage</span>
            <strong>
              {Number(result.percentage || 0).toFixed(1)}%
            </strong>
            <p>
              {result.correctAnswers || 0} correct out of{" "}
              {result.totalQuestions || 0}
            </p>
          </div>

          <div className="tc-card tc-stat-card">
            <span>Answered</span>
            <strong>{result.answeredQuestions ?? 0}</strong>
          </div>

          <div className="tc-card tc-stat-card">
            <span>Incorrect</span>
            <strong>{result.incorrectAnswers ?? 0}</strong>
          </div>

          <div className="tc-card tc-stat-card">
            <span>For review</span>
            <strong>{result.markedForReviewCount ?? 0}</strong>
          </div>
        </section>

        <section className="tc-card tc-performance">
          <h2>Performance overview</h2>

          <div className="tc-performance-grid">
            <div>
              <span>Total score</span>
              <strong>{result.totalScore ?? 0}</strong>
            </div>

            <div>
              <span>Average score</span>
              <strong>
                {Number(result.averageScore || 0).toFixed(1)}
              </strong>
            </div>

            <div>
              <span>Highest score</span>
              <strong>
                {Number(result.highestScore || 0).toFixed(1)}
              </strong>
            </div>
          </div>

          <h3>Topic-wise performance</h3>

          {Object.entries(result.topicScores || {}).length === 0 ? (
            <p className="tc-muted">
              Topic-wise scores are not available for this test.
            </p>
          ) : (
            Object.entries(result.topicScores).map(([topic, score]) => (
              <div className="tc-topic-row" key={topic}>
                <div>
                  <span>{topic}</span>
                  <strong>{Number(score).toFixed(1)}%</strong>
                </div>

                <div className="tc-progress-track">
                  <div
                    className="tc-progress-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, Number(score))
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </section>

        <section className="tc-card tc-analysis">
          <h2>Question-by-question analysis</h2>

          {(result.analysis || []).map((item, index) => (
            <article className="tc-analysis-item" key={item.questionId}>
              <div className="tc-analysis-heading">
                <strong>Question {index + 1}</strong>

                <span
                  className={
                    item.correct ? "tc-status-correct" : "tc-status-wrong"
                  }
                >
                  {item.correct
                    ? "Correct"
                    : item.answered
                      ? "Incorrect"
                      : "Unanswered"}
                </span>
              </div>

              <p className="tc-question-text">{item.questionText}</p>

              <p>
                <strong>Your answer:</strong>{" "}
                {item.userAnswer || "Not answered"}
              </p>

              <p>
                <strong>Correct answer:</strong>{" "}
                {item.correctAnswer || "Not available"}
              </p>

              {item.explanation && (
                <p className="tc-explanation">
                  <strong>Explanation:</strong> {item.explanation}
                </p>
              )}
            </article>
          ))}

          {/* Open the main homepage instead of returning to Test Center setup. */}
          <button
            className="tc-primary-btn tc-new-test-btn"
            onClick={() => {
              window.location.href = window.location.origin;
            }}
          >
            Go to Homepage
          </button>
        </section>
      </div>
    );
  }

  // --------------------------------------------------
  // EXAM SCREEN
  // --------------------------------------------------

  return (
    <div
      className={`tc-page ${
        standaloneMode ? "tc-standalone-page" : ""
      }`}
      style={standalonePageStyle}
    >
      <header className="tc-exam-header">
        <div>
          <span className="tc-eyebrow">TEST IN PROGRESS</span>
          <h1>{test?.technology || "Test"} Assessment</h1>
          <p>
            {test?.difficulty} · {questions.length} questions
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          {standaloneMode && (
            <button
              type="button"
              className="tc-secondary-btn"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
            </button>
          )}

          <div
            className={`tc-timer ${
              remainingSeconds <= 60 ? "tc-timer-warning" : ""
            }`}
          >
            <span>Time remaining</span>
            <strong>{formatTime(remainingSeconds)}</strong>
          </div>
        </div>
      </header>

      <div className="tc-exam-layout">
        <main className="tc-card tc-question-panel">
          {currentQuestion ? (
            <>
              <div className="tc-question-topline">
                <span>
                  Question {currentIndex + 1} of {questions.length}
                </span>

                <span className="tc-type-label">
                  {currentQuestion.questionType || "MCQ"}
                </span>
              </div>

              <div className="tc-question-progress">
                <div
                  style={{
                    width: `${
                      ((currentIndex + 1) / questions.length) * 100
                    }%`,
                  }}
                />
              </div>

              <h2 className="tc-question-text">
                {currentQuestion.questionText}
              </h2>

              <p className="tc-muted">
                {currentQuestion.questionType === "MSQ"
                  ? "Select all correct options."
                  : "Select one correct option."}
              </p>

              <div className="tc-options">
                {["A", "B", "C", "D"].map((letter) => {
                  const optionText = currentQuestion[`option${letter}`];

                  if (!optionText) return null;

                  const selected =
                    currentAnswer?.selectedOptions?.includes(letter);

                  return (
                    <button
                      type="button"
                      key={letter}
                      className={`tc-option ${
                        selected ? "tc-option-selected" : ""
                      }`}
                      onClick={() => toggleOption(letter)}
                      aria-pressed={selected}
                    >
                      <span className="tc-option-letter">{letter}</span>
                      <span>{optionText}</span>

                      {selected && (
                        <span className="tc-selected-check">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="tc-question-actions">
                <button
                  className="tc-secondary-btn"
                  onClick={() => goToQuestion(currentIndex - 1)}
                  disabled={currentIndex === 0}
                >
                  Previous
                </button>

                <button className="tc-review-btn" onClick={toggleReview}>
                  {currentAnswer?.markedForReview
                    ? "Remove Review Mark"
                    : "Mark for Review"}
                </button>

                <button
                  className="tc-primary-btn tc-next-btn"
                  onClick={() => goToQuestion(currentIndex + 1)}
                  disabled={currentIndex === questions.length - 1}
                >
                  Next
                </button>
              </div>

              <div className="tc-save-state">
                {currentAnswer?.saved
                  ? "Answer saved"
                  : "Saving answer..."}
              </div>
            </>
          ) : (
            <p>No question is available.</p>
          )}
        </main>

        <aside className="tc-card tc-palette">
          <h2>Question palette</h2>

          <div className="tc-count-grid">
            <div>
              <strong>{answeredCount}</strong>
              <span>Answered</span>
            </div>

            <div>
              <strong>{unansweredCount}</strong>
              <span>Unanswered</span>
            </div>

            <div>
              <strong>{markedCount}</strong>
              <span>Review</span>
            </div>
          </div>

          <div className="tc-palette-grid">
            {questions.map((question, index) => {
              const answer = answers[question.questionId];

              const isAnswered =
                (answer?.selectedOptions || []).length > 0;

              return (
                <button
                  type="button"
                  key={question.questionId}
                  onClick={() => goToQuestion(index)}
                  className={[
                    "tc-palette-number",
                    isAnswered ? "tc-palette-answered" : "",
                    answer?.markedForReview ? "tc-palette-review" : "",
                    index === currentIndex ? "tc-palette-current" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={`Go to question ${index + 1}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <div className="tc-palette-legend">
            <span>
              <i className="tc-legend-answered" /> Answered
            </span>
            <span>
              <i className="tc-legend-review" /> Review
            </span>
            <span>
              <i className="tc-legend-empty" /> Unanswered
            </span>
          </div>

          {error && (
            <div className="tc-error" role="alert">
              {error}
            </div>
          )}

          {notice && <div className="tc-notice">{notice}</div>}

          <button
            className="tc-primary-btn tc-submit-btn"
            onClick={() => setShowSubmitConfirmation(true)}
            disabled={loading}
          >
            Submit Test
          </button>
        </aside>
      </div>

      {showSubmitConfirmation && (
        <div className="tc-modal-backdrop" role="presentation">
          <section
            className="tc-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tc-submit-title"
          >
            <h2 id="tc-submit-title">Submit your test?</h2>

            <p>
              You have answered {answeredCount} of {questions.length} questions.
            </p>

            {unansweredCount > 0 && (
              <p className="tc-error-text">
                {unansweredCount} question(s) are unanswered.
              </p>
            )}

            <div className="tc-modal-actions">
              <button
                className="tc-secondary-btn"
                onClick={() => setShowSubmitConfirmation(false)}
              >
                Continue Test
              </button>

              <button
                className="tc-primary-btn"
                onClick={submitTest}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Confirm Submit"}
              </button>
            </div>
          </section>
        </div>
      )}

      {loading && (
        <div className="tc-loading-note">
          Processing your test...
        </div>
      )}
    </div>
  );
}