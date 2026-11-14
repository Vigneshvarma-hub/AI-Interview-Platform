
import React, { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/api";

function McqAssessment() {
  const [technology, setTechnology] = useState("Java");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [amount, setAmount] = useState(5);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");

  const [interviewId, setInterviewId] = useState(null);
  const [result, setResult] = useState(null);

  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Retrieve JWT token
  const token = localStorage.getItem("token");

  // Common request headers
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  // ==========================================
  // START MCQ ASSESSMENT
  // ==========================================

  const startAssessment = async () => {
    setError("");

    if (!token) {
      setError("Please login again. Authentication token not found.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create MCQ-specific interview
      const response = await fetch(
        `${API_URL}/interviews/start-mcq?amount=${amount}`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            technology: technology,
            difficulty: difficulty,
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || "Unable to create MCQ interview."
        );
      }

      const interview = await response.json();

      console.log("Created MCQ Interview:", interview);

      if (!interview.id) {
        throw new Error(
          "Interview ID was not received from the server."
        );
      }

      // Step 2: Read questions assigned to this interview
      const assignedQuestions = interview.questions || [];

      if (
        !Array.isArray(assignedQuestions) ||
        assignedQuestions.length === 0
      ) {
        throw new Error(
          "No questions were assigned to this interview. Please check the backend question data."
        );
      }

      // Step 3: Convert backend questions into frontend format
      const mcqQuestions = assignedQuestions
        .filter(
          (question) =>
            question.optionA &&
            question.optionB &&
            question.optionC &&
            question.optionD
        )
        .map((question) => ({
          questionId: question.id,
          questionText: question.questionText,
          optionA: question.optionA,
          optionB: question.optionB,
          optionC: question.optionC,
          optionD: question.optionD,
        }));

      if (mcqQuestions.length === 0) {
        throw new Error(
          "The assigned questions do not contain valid MCQ options."
        );
      }

      // Step 4: Initialize assessment
      setInterviewId(interview.id);
      setQuestions(mcqQuestions);
      setCurrentIndex(0);
      setSelectedOption("");
      setResult(null);
      setCompleted(false);
      setStarted(true);
    } catch (err) {
      console.error("Start assessment error:", err);
      setError(err.message || "Unable to start assessment.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SUBMIT ANSWER
  // ==========================================

  const submitAnswer = async () => {
    setError("");

    if (!selectedOption) {
      setError("Please select an option before continuing.");
      return;
    }

    if (!interviewId) {
      setError(
        "Interview ID is missing. Please restart the assessment."
      );
      return;
    }

    const currentQuestion = questions[currentIndex];

    if (!currentQuestion || !currentQuestion.questionId) {
      setError(
        "Question ID is missing. Please restart the assessment."
      );
      return;
    }

    setLoading(true);

    try {
      // Submit answer to backend
      const response = await fetch(`${API_URL}/mcq/submit`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          interviewId: interviewId,
          questionId: currentQuestion.questionId,
          selectedOption: selectedOption,
        }),
      });

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message ||
            `Answer submission failed. Status: ${response.status}`
        );
      }

      const answerData = await response.json();

      console.log("Answer submitted:", answerData);

      // Move to next question
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((previousIndex) => previousIndex + 1);
        setSelectedOption("");
      } else {
        // All answers submitted. Fetch final result.
        const resultResponse = await fetch(
          `${API_URL}/mcq/result/${interviewId}`,
          {
            method: "GET",
            headers: getHeaders(),
          }
        );

        if (!resultResponse.ok) {
          const message = await resultResponse.text();

          throw new Error(
            message || "Unable to fetch final assessment result."
          );
        }

        const resultData = await resultResponse.json();

        console.log("Final MCQ Result:", resultData);

        setResult({
          totalQuestions: resultData.totalQuestions ?? 0,
          correctAnswers: resultData.correctAnswers ?? 0,
          incorrectAnswers: resultData.incorrectAnswers ?? 0,
          score: resultData.score ?? resultData.totalScore ?? 0,
          percentage: resultData.percentage ?? 0,
        });

        setCompleted(true);
      }
    } catch (err) {
      console.error("Submit answer error:", err);
      setError(err.message || "Unable to submit answer.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESTART ASSESSMENT
  // ==========================================

  const restartAssessment = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedOption("");
    setInterviewId(null);
    setResult(null);
    setStarted(false);
    setCompleted(false);
    setLoading(false);
    setError("");
  };

  // ==========================================
  // INITIAL SCREEN
  // ==========================================

  if (!started) {
    return (
      <div className="mcq-container">
        <div className="mcq-card">
          <h2>MCQ Skill Assessment</h2>

          <p>
            Test your technical knowledge and evaluate your
            skills through multiple-choice questions.
          </p>

          <div className="mcq-form">
            <label>
              Technology

              <select
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
              >
                <option value="Java">Java</option>
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
                <option value="C">C</option>
                <option value="C++">C++</option>
                <option value="SQL">SQL</option>
              </select>
            </label>

            <label>
              Difficulty

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </label>

            <label>
              Number of Questions

              <select
                value={amount}
                onChange={(e) =>
                  setAmount(Number(e.target.value))
                }
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </label>

            <button
              onClick={startAssessment}
              disabled={loading}
            >
              {loading
                ? "Starting..."
                : "Start MCQ Assessment"}
            </button>
          </div>

          {error && (
            <p className="mcq-error">
              Error: {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // FINAL RESULT SCREEN
  // ==========================================

  if (completed && result) {
    return (
      <div className="mcq-container">
        <div className="mcq-card">
          <h2>Assessment Completed!</h2>

          <div className="mcq-result">
            <h3>Your Result</h3>

            <p>
              Total Questions: {result.totalQuestions}
            </p>

            <p>
              Correct Answers: {result.correctAnswers}
            </p>

            <p>
              Incorrect Answers: {result.incorrectAnswers}
            </p>

            <p>
              Score: {result.score}
            </p>

            <h2>
              {Number(result.percentage).toFixed(2)}%
            </h2>

            <p>Final Percentage</p>
          </div>

          <button onClick={restartAssessment}>
            Take Another Assessment
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // CURRENT QUESTION
  // ==========================================

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <div className="mcq-container">
        <div className="mcq-card">
          <p>No question available.</p>

          <button onClick={restartAssessment}>
            Restart
          </button>
        </div>
      </div>
    );
  }

  // Prepare options
  const options = [
    {
      key: "A",
      value: currentQuestion.optionA,
    },
    {
      key: "B",
      value: currentQuestion.optionB,
    },
    {
      key: "C",
      value: currentQuestion.optionC,
    },
    {
      key: "D",
      value: currentQuestion.optionD,
    },
  ].filter((option) => option.value != null);

  // ==========================================
  // QUESTION DISPLAY
  // ==========================================

  return (
    <div className="mcq-container">
      <div className="mcq-card">
        <h2>MCQ Skill Assessment</h2>

        <p>
          Test your technical knowledge and evaluate your
          skills through multiple-choice questions.
        </p>

        {/* Progress */}
        <div className="mcq-progress">
          <h3>
            Question {currentIndex + 1} of {questions.length}
          </h3>

          <div className="mcq-progress-track">
            <div
              className="mcq-progress-fill"
              style={{
                width: `${
                  ((currentIndex + 1) / questions.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Question text */}
        <h3 className="mcq-question">
          {currentQuestion.questionText}
        </h3>

        {/* Answer options */}
        <div className="mcq-options">
          {options.map((option) => (
            <label
              key={option.key}
              className={`mcq-option ${
                selectedOption === option.key ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion.questionId}`}
                value={option.key}
                checked={selectedOption === option.key}
                onChange={() =>
                  setSelectedOption(option.key)
                }
              />

              <span>
                <strong>{option.key}.</strong>{" "}
                {option.value}
              </span>
            </label>
          ))}
        </div>

        {/* Submit button */}
        <button
          onClick={submitAnswer}
          disabled={loading || !selectedOption}
        >
          {loading
            ? "Submitting..."
            : currentIndex === questions.length - 1
            ? "Submit & Finish"
            : "Submit & Next"}
        </button>

        {/* Error message */}
        {error && (
          <p className="mcq-error">
            Error: {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default McqAssessment;