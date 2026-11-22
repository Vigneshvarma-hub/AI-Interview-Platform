import { useEffect, useRef, useState } from "react";
// Parent dashboard nunchi Subscription page open cheyyadaniki callback.
function AIInterview({ onOpenPlans }) {

  // Keep the camera/microphone stream while the interview is active.
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const spokenAnswerRef = useRef("");
  const speechModeRef = useRef("idle");
  const silenceTimerRef = useRef(null);
  const speechQueueRef = useRef([]);
  const speechRequestIdRef = useRef(0);
  const [voiceStatus, setVoiceStatus] = useState("Preparing interview...");
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [liveTranscript, setLiveTranscript] = useState("");

  // Camera and microphone permission state.
  const [mediaReady, setMediaReady] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState("");

  // Stop camera and microphone tracks when this page is unmounted.
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      speechRequestIdRef.current += 1;
      speechQueueRef.current = [];
      window.speechSynthesis?.cancel();
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

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      mediaStreamRef.current = stream;
      setMediaReady(true);
      return stream;
    } catch (err) {
      console.error("Camera/microphone permission error:", err);

      let message;
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        message =
          "Camera and microphone permissions are required. Allow both permissions in your browser settings, then try again.";
      } else if (
        err.name === "NotFoundError" ||
        err.name === "DevicesNotFoundError"
      ) {
        message =
          "A camera or microphone was not found. Connect both devices and try again.";
      } else {
        message =
          err.message || "Unable to access your camera and microphone.";
      }

      setMediaError(message);
      setMediaReady(false);
      throw new Error(message);
    } finally {
      setMediaLoading(false);
    }
  }

  // Pick the clearest available English female voice in the browser.
  // Voice names vary by Windows/browser, so use a preference list and a safe fallback.
  function getPreferredInterviewerVoice() {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const englishVoices = voices.filter((voice) => /^en(-|_)/i.test(voice.lang));
    const femaleNamePattern = /female|aria|jenny|sonia|libby|hazel|heera|priya|neerja|samantha|zira|eva|natasha|sara|google uk english female/i;
    const maleNamePattern = /male|david|mark|guy|ryan|george|james|christopher/i;

    const femaleVoices = englishVoices.filter((voice) => femaleNamePattern.test(voice.name));
    const preferredFemale =
      femaleVoices.find((voice) => /^en-IN/i.test(voice.lang)) ||
      femaleVoices.find((voice) => /^en-GB/i.test(voice.lang)) ||
      femaleVoices.find((voice) => /^en-US/i.test(voice.lang)) ||
      femaleVoices[0];

    if (preferredFemale) return preferredFemale;

    // If the system does not expose a recognisably female voice, prefer a clear
    // English India/UK voice rather than selecting an arbitrary voice.
    return (
      englishVoices.find((voice) => /^en-IN/i.test(voice.lang) && !maleNamePattern.test(voice.name)) ||
      englishVoices.find((voice) => /^en-GB/i.test(voice.lang) && !maleNamePattern.test(voice.name)) ||
      englishVoices.find((voice) => /^en-US/i.test(voice.lang) && !maleNamePattern.test(voice.name)) ||
      englishVoices[0] ||
      null
    );
  }

  // Speak the complete interviewer prompt in one utterance. This avoids
  // sentence-to-sentence gaps and reduces the chance of queue interruptions.
  function speakCurrentQuestion(questionText) {
    if (!questionText || !("speechSynthesis" in window)) {
      setVoiceStatus("Audio output is unavailable in this browser.");
      return;
    }

    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }

    const requestId = ++speechRequestIdRef.current;
    speechQueueRef.current = [];
    speechModeRef.current = "speaking";
    setVoiceStatus("AI interviewer is speaking...");

    // Cancel any stale utterance before scheduling the new prompt.
    window.speechSynthesis.cancel();

    const beginPlayback = () => {
      if (requestId !== speechRequestIdRef.current || speechModeRef.current !== "speaking") return;

      const voice = getPreferredInterviewerVoice();

      // Keep the candidate's correct spelling in the UI and backend, but use a
      // phonetic hint for browser speech synthesis because some voices read
      // "Vignesh" as "Vinesh" and drop the hard G sound.
      const speechText = questionText
        .replace(/\bVignesh\s+Varma\b/gi, "Vig-nesh Varma")
        .replace(/\bVignesh\b/gi, "Vig-nesh")
        // Spell out resume initials for TTS: "BK Jaydev" -> "B K Jaydev".
        // The visible greeting and stored resume name remain unchanged.
        .replace(/\b([A-Z]{1,3})\s+([A-Z][a-z][\p{L}.'-]*)/gu, (_, initials, surname) =>
          `${initials.split("").join(" ")} ${surname}`
        );
      const utterance = new SpeechSynthesisUtterance(speechText.trim());
      utterance.lang = voice?.lang || "en-IN";
      utterance.rate = 1.02;
      utterance.pitch = 1.06;
      utterance.volume = 1;
      if (voice) utterance.voice = voice;

      utterance.onstart = () => {
        if (requestId === speechRequestIdRef.current) {
          speechModeRef.current = "speaking";
          setVoiceStatus("AI interviewer is speaking...");
        }
      };

      utterance.onend = () => {
        if (requestId !== speechRequestIdRef.current || speechModeRef.current !== "speaking") return;
        window.setTimeout(() => {
          if (requestId === speechRequestIdRef.current && speechModeRef.current === "speaking") {
            startVoiceRecognition();
          }
        }, 120);
      };

      // Chrome can pause long speech-synthesis utterances unexpectedly.
      // Resume only the currently active interviewer utterance.
      utterance.onpause = () => {
        window.setTimeout(() => {
          if (
            requestId === speechRequestIdRef.current &&
            speechModeRef.current === "speaking" &&
            window.speechSynthesis.speaking
          ) {
            window.speechSynthesis.resume();
          }
        }, 250);
      };

      utterance.onerror = (event) => {
        if (requestId !== speechRequestIdRef.current) return;
        // 'interrupted' can be emitted by Chrome when cancel() replaces an
        // older utterance; ignore it if a newer prompt is already active.
        if (event.error === "interrupted" && requestId !== speechRequestIdRef.current) return;
        console.error("Speech synthesis error:", event);
        speechModeRef.current = "idle";
        setVoiceStatus("Voice playback stopped. Press Speak to hear the question again.");
      };

      window.speechSynthesis.speak(utterance);
    };

    // Chrome sometimes needs a short tick after cancel() before speak().
    window.setTimeout(beginPlayback, 100);
  }

  // Listen to the candidate's spoken answer. The recognized transcript is
  // submitted directly to the existing answer API and is never shown onscreen.
  function startVoiceRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      setVoiceStatus("Voice recognition is not supported. Use the latest Chrome browser.");
      return;
    }

    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    spokenAnswerRef.current = "";
    setLiveTranscript("");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    speechModeRef.current = "listening";
    setVoiceStatus("Listening...");

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        if (event.results[index].isFinal) {
          finalTranscript += event.results[index][0].transcript + " ";
        } else {
          interimTranscript += event.results[index][0].transcript + " ";
        }
      }
      const preview = [spokenAnswerRef.current, finalTranscript, interimTranscript]
        .filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
      setLiveTranscript(preview);
      if (finalTranscript.trim()) {
        spokenAnswerRef.current = (
          spokenAnswerRef.current + " " + finalTranscript
        ).trim();

        // Automatically submit after a natural pause; no Finish Answer button.
        if (silenceTimerRef.current) {
          window.clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = window.setTimeout(() => {
          if (speechModeRef.current === "listening" && recognitionRef.current === recognition) {
            speechModeRef.current = "submitting";
            setVoiceStatus("Answer captured. Processing...");
            try {
              recognition.stop();
            } catch (stopError) {
              console.warn("Could not stop recognition after silence:", stopError);
            }
          }
        }, 1400);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setVoiceStatus("Microphone access denied. Allow microphone access and reload.");
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setVoiceStatus("Microphone recognition error. Please try again.");
      }
    };

    recognition.onend = () => {
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (recognitionRef.current !== recognition) return;
      recognitionRef.current = null;

      const finalTranscript = spokenAnswerRef.current.trim();
      if (
        finalTranscript &&
        (speechModeRef.current === "listening" || speechModeRef.current === "submitting")
      ) {
        speechModeRef.current = "submitting";
        setVoiceStatus("Processing your answer...");
        submitAnswer(finalTranscript);
      } else if (speechModeRef.current === "submitting") {
        speechModeRef.current = "idle";
        setVoiceStatus("I couldn't hear an answer. Press Speak to try again.");
      } else if (speechModeRef.current === "listening") {
        // Chrome may end a recognition session after a short silence.
        setVoiceStatus("Listening... Please speak clearly.");
        window.setTimeout(() => {
          if (speechModeRef.current === "listening" && !recognitionRef.current) {
            startVoiceRecognition();
          }
        }, 350);
      }
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Speech recognition start error:", error);
      setVoiceStatus("Could not start microphone recognition. Try again.");
    }
  }

  function finishSpokenAnswer() {
    if (!recognitionRef.current || speechModeRef.current !== "listening") return;
    speechModeRef.current = "submitting";
    setVoiceStatus("Processing your answer...");
    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error("Could not stop speech recognition:", error);
    }
  }

  function stopVoiceConversation() {
    speechRequestIdRef.current += 1;
    speechQueueRef.current = [];
    speechModeRef.current = "idle";
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    window.speechSynthesis?.cancel();
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
  }

  // Stop media devices after the interview is completed.
  function stopCameraAndMicrophone() {
    stopVoiceConversation();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setMediaReady(false);

    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch((fullscreenError) => {
        console.warn("Could not exit fullscreen:", fullscreenError);
      });
    }
  }

  // Resume upload and Gemini analysis state.
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState("");

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
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Store error messages.
  const [error, setError] = useState("");

  // User subscription plan issue valla plans page ki vellalsi unte
// ee state button ni display chesthundi.
const [showPlansButton, setShowPlansButton] = useState(false);


  // Speak each newly loaded question automatically.
  useEffect(() => {
    if (interview?.question && !completed) {
      // speakCurrentQuestion safely cancels any previous prompt before speaking.
      speakCurrentQuestion(interview.question);
    }
    // Question changes only when a new interview question is loaded.
  }, [interview?.question, completed]);

  // Attach the camera stream after the setup or interview preview is rendered.
  // This effect is declared after interview state to avoid a temporal-dead-zone error.
  useEffect(() => {
    if (videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [mediaReady, interview]);


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

  // Upload the selected PDF/DOCX resume.
  // Resume extraction and Gemini analysis remain on the backend.
  async function uploadResume() {
    if (!resumeFile) {
      setResumeError("Please select your resume first.");
      return;
    }

    const allowedExtensions = [".pdf", ".docx"];
    const fileName = resumeFile.name.toLowerCase();
    if (!allowedExtensions.some((extension) => fileName.endsWith(extension))) {
      setResumeError("Only PDF and DOCX resume files are supported.");
      return;
    }

    if (resumeFile.size > 5 * 1024 * 1024) {
      setResumeError("Resume file size must be 5 MB or less.");
      return;
    }

    const token = getToken();
    if (!token) {
      setResumeError("JWT token not found. Please login again.");
      return;
    }

    setResumeLoading(true);
    setResumeError("");
    setError("");
    setResumeUploaded(false);

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);

      const response = await fetch(
        "http://localhost:8080/api/resumes/upload",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(responseText, "Resume upload failed.")
        );
      }

      if (!responseText.trim()) {
        throw new Error("Resume upload returned an empty response.");
      }

      // Do not display extracted resume data or analysis to the candidate.
      // The backend stores extracted text and analyzes it when the interview starts.
      setResumeUploaded(true);
    } catch (err) {
      console.error("Resume upload error:", err);
      setResumeError(err.message || "Unable to upload resume.");
      setResumeUploaded(false);
    } finally {
      setResumeLoading(false);
    }
  }

  // Start a new AI interview with the human-style introduction stage.
  async function startInterview() {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request was not granted:", err);
      });
    }

    try {
      setLoading(true);
      setError("");
      setMediaError("");
      setShowPlansButton(false);
      setInterview(null);
      setQuestions([]);
      setAnswer("");
      setEvaluation(null);
      setDetailedEvaluation([]);
      setFinalResult(null);
      setCompleted(false);

      if (!resumeUploaded) {
        throw new Error("Please upload your resume before starting the interview.");
      }

      const token = getToken();
      if (!token) throw new Error("JWT token not found. Please login again.");

      let stream = mediaStreamRef.current;
      const hasLiveVideo = stream?.getVideoTracks().some(track => track.readyState === "live");
      const hasLiveAudio = stream?.getAudioTracks().some(track => track.readyState === "live");

      if (!hasLiveVideo || !hasLiveAudio) {
        await enableCameraAndMicrophone();
        stream = mediaStreamRef.current;
      }

      if (!stream
          || !stream.getVideoTracks().some(track => track.readyState === "live")
          || !stream.getAudioTracks().some(track => track.readyState === "live")) {
        throw new Error("Both camera and microphone permissions are required to start the interview.");
      }

      const response = await fetch("http://localhost:8080/api/ai-interviews/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const responseText = await response.text();
      if (response.status === 401) throw new Error("Unauthorized. Please login again.");
      if (!response.ok) {
        const message = getApiErrorMessage(responseText, "Failed to start AI interview.");
        handleSubscriptionRestriction(message);
        throw new Error(message);
      }
      if (!responseText.trim()) throw new Error("Backend returned an empty response.");

      const data = JSON.parse(responseText);
      if (!data.interviewId || !data.interviewerMessage) {
        throw new Error("Backend returned incomplete interview information.");
      }

      // The first spoken line is the interviewer's greeting, not a scored question.
      setQuestions([]);
      setInterview({
        ...data,
        stage: data.stage || "GREETING",
        questionNumber: 0,
        question: data.interviewerMessage,
      });
      setVoiceStatus("Your interviewer is greeting you...");
    } catch (err) {
      console.error("AI Interview error:", err);
      setError(err.message || "Unable to start the AI interview.");
      setInterview(null);
      setQuestions([]);
      stopCameraAndMicrophone();
    } finally {
      setLoading(false);
    }
  }


  // Submit the candidate's current answer.
  async function submitAnswer(spokenAnswer = null) {

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
      const answerToSubmit = (spokenAnswer ?? answer).trim();
      if (!answerToSubmit) {
        setVoiceStatus("I did not hear an answer. Please speak again.");
        speechModeRef.current = "listening";
        startVoiceRecognition();
        return;
      }


      // Introduction conversation is not submitted to the technical answer/evaluation API.
      if (interview.stage !== "TECHNICAL") {
        const conversationResponse = await fetch(
          `http://localhost:8080/api/ai-interviews/${interview.interviewId}/conversation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ candidateResponse: answerToSubmit }),
          }
        );

        const conversationText = await conversationResponse.text();
        if (!conversationResponse.ok) {
          throw new Error(getApiErrorMessage(
            conversationText,
            "Unable to continue the interview conversation."
          ));
        }
        if (!conversationText.trim()) {
          throw new Error("The server returned an empty conversation response.");
        }

        const conversationData = JSON.parse(conversationText);
        setAnswer("");
        setEvaluation(null);

        if (conversationData.technicalInterviewStarted) {
          const questionsResponse = await fetch(
            `http://localhost:8080/api/interviews/${interview.interviewId}/questions`,
            {
              method: "GET",
              headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`,
              },
            }
          );
          const questionsText = await questionsResponse.text();
          if (!questionsResponse.ok) {
            throw new Error(getApiErrorMessage(
              questionsText,
              "Failed to load the first technical question."
            ));
          }
          if (!questionsText.trim()) throw new Error("The question list was empty.");

          const questionData = JSON.parse(questionsText);
          if (!Array.isArray(questionData) || questionData.length === 0) {
            throw new Error("The first technical question was not created.");
          }

          setQuestions(questionData);
          const firstTechnicalQuestion = questionData[0];
          const firstQuestionText =
            conversationData.interviewerMessage ||
            conversationData.question ||
            firstTechnicalQuestion.questionText ||
            firstTechnicalQuestion.question ||
            firstTechnicalQuestion.text ||
            "The first technical question could not be read. Please check the interview questions and try again.";

          setInterview({
            ...conversationData,
            stage: "TECHNICAL",
            questionNumber: 1,
            question: firstQuestionText,
          });
          setVoiceStatus("Technical interview is starting...");
        } else {
          const nextPrompt = conversationData.interviewerMessage || conversationData.question;
          if (!nextPrompt) {
            throw new Error("The interviewer response did not contain a message. Please try speaking again.");
          }
          setInterview({
            ...conversationData,
            stage: conversationData.stage,
            questionNumber: 0,
            question: nextPrompt,
          });
          setVoiceStatus("Interviewer is responding...");
        }
        return;
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
            answerText: answerToSubmit,
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


        // Refresh the question list because the backend generates questions dynamically.
        const refreshedQuestionsResponse = await fetch(
          `http://localhost:8080/api/interviews/${interview.interviewId}/questions`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const refreshedQuestionsText = await refreshedQuestionsResponse.text();

        if (!refreshedQuestionsResponse.ok) {
          throw new Error(
            getApiErrorMessage(
              refreshedQuestionsText,
              "Failed to refresh interview questions."
            )
          );
        }

        if (!refreshedQuestionsText.trim()) {
          throw new Error("The backend returned an empty question list.");
        }

        const refreshedQuestions = JSON.parse(refreshedQuestionsText);

        if (
          !Array.isArray(refreshedQuestions) ||
          refreshedQuestions.length < nextQuestionNumber
        ) {
          throw new Error("Next question ID was not found.");
        }

        // Update the question list and display the newly generated question.
        setQuestions(refreshedQuestions);
        setInterview({ ...nextQuestion, stage: "TECHNICAL" });


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

        // Backend emails the score and detailed evaluation. Never expose marks in the UI.
        const finalData = JSON.parse(completeText);
        setFinalResult(finalData);
        setDetailedEvaluation([]);
        setFeedbackRating(0);
        setFeedbackText("");
        setFeedbackSubmitted(false);

        stopCameraAndMicrophone();
        stopVoiceConversation();
        setVoiceStatus("Interview completed.");
        setCompleted(true);
        setInterview(null);
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


  // End the live call and finalize the interview from the backend.
  async function endInterview() {
    if (!interview || submitting) return;
    const confirmed = window.confirm("End this interview now?");
    if (!confirmed) return;

    try {
      setSubmitting(true);
      setError("");
      setVoiceStatus("Completing your interview and emailing your evaluation...");
      stopVoiceConversation();

      const token = getToken();
      if (!token) throw new Error("Session expired. Please sign in again.");

      const response = await fetch(
        `http://localhost:8080/api/ai-interviews/${interview.interviewId}/complete`,
        {
          method: "POST",
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        }
      );
      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(getApiErrorMessage(responseText, "Could not end the interview."));
      }
      if (!responseText.trim()) throw new Error("The server returned an empty completion response.");

      const completion = JSON.parse(responseText);
      setFinalResult(completion);
      setDetailedEvaluation([]);
      setFeedbackRating(0);
      setFeedbackText("");
      setFeedbackSubmitted(false);
      setCompleted(true);
      setInterview(null);
      setQuestions([]);
      setVoiceStatus("Interview completed.");
      stopCameraAndMicrophone();
    } catch (err) {
      console.error("End interview error:", err);
      setError(err.message || "Unable to end the interview.");
      setVoiceStatus("Unable to end the interview.");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitInterviewFeedback() {
    if (!finalResult?.interviewId || feedbackRating < 1 || !feedbackText.trim()) {
      setError("Please select a rating and enter your feedback.");
      return;
    }
    try {
      setFeedbackLoading(true);
      setError("");
      const token = getToken();
      const response = await fetch(
        `http://localhost:8080/api/ai-interviews/${finalResult.interviewId}/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating: feedbackRating, feedback: feedbackText.trim() }),
        }
      );
      const responseText = await response.text();
      if (!response.ok) throw new Error(getApiErrorMessage(responseText, "Could not submit feedback."));
      setFeedbackSubmitted(true);
    } catch (err) {
      setError(err.message || "Unable to submit feedback.");
    } finally {
      setFeedbackLoading(false);
    }
  }

  // Start a completely new interview.
  function startNewInterview() {
    stopVoiceConversation();

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

    // Clear final result and post-interview feedback.
    setFinalResult(null);
    setFeedbackRating(0);
    setFeedbackText("");
    setFeedbackSubmitted(false);

    // Mark interview as not completed.
    setCompleted(false);

    // Clear error.
    setError("");
  }


  return (
    <>
      <style>{`
        body:has(.ai-interview-root.is-active) { overflow: hidden !important; }
        body:has(.ai-interview-root.is-active) .sidebar,
        body:has(.ai-interview-root.is-active) .topbar,
        body:has(.ai-interview-root.is-active) .dashboard-footer,
        body:has(.ai-interview-root.is-active) .chatbot-widget,
        body:has(.ai-interview-root.is-active) .chatbot-container,
        body:has(.ai-interview-root.is-active) .dashboard > *:last-child { display: none !important; }
        body:has(.ai-interview-root.is-active) .dashboard,
        body:has(.ai-interview-root.is-active) .main-content,
        body:has(.ai-interview-root.is-active) .module-container { width:100% !important; max-width:none !important; min-height:100vh !important; margin:0 !important; padding:0 !important; }
        .ai-interview-root { width:100%; min-height:100vh; box-sizing:border-box; }
        .ai-interview-root:not(.is-active) { padding:clamp(22px,3vw,42px) !important; border:1px solid rgba(148,163,184,.13) !important; border-radius:26px !important; color:#eef2ff !important; background:radial-gradient(ellipse at 8% 0%,rgba(109,40,217,.23),transparent 38%),radial-gradient(ellipse at 95% 15%,rgba(14,165,233,.15),transparent 34%),linear-gradient(145deg,#0b1020 0%,#111a30 54%,#0b1224 100%) !important; box-shadow:0 24px 70px rgba(15,23,42,.22) !important; }
        .ai-prep-header { display:flex; justify-content:space-between; align-items:flex-start; gap:24px; margin-bottom:30px; }
        .ai-prep-eyebrow { color:#b9a4ff; font-size:11px; letter-spacing:2px; font-weight:900; text-transform:uppercase; margin-bottom:12px; }
        .ai-prep-title { color:#fff; font-size:clamp(30px,4vw,46px); line-height:1.08; letter-spacing:-1.5px; margin:0 0 12px; }
        .ai-prep-subtitle { color:#aab7d0; font-size:16px; line-height:1.65; margin:0; max-width:650px; }
        .ai-prep-pill { white-space:nowrap; border:1px solid rgba(167,139,250,.3); background:rgba(124,58,237,.13); color:#d8ccff; padding:10px 14px; border-radius:999px; font-size:12px; font-weight:800; }
        .ai-prep-grid { display:grid; grid-template-columns:minmax(0,1.45fr) minmax(260px,.8fr); gap:20px; align-items:stretch; }
        .ai-upload-card,.ai-guide-card { border:1px solid rgba(148,163,184,.18); border-radius:22px; background:rgba(15,23,42,.72); box-shadow:0 16px 40px rgba(0,0,0,.16); }
        .ai-upload-card { padding:clamp(20px,2.5vw,30px); }
        .ai-guide-card { padding:26px; background:linear-gradient(155deg,rgba(91,33,182,.22),rgba(15,23,42,.82) 58%); }
        .ai-card-kicker { color:#9caed0; font-size:11px; letter-spacing:1.6px; font-weight:900; text-transform:uppercase; }
        .ai-card-heading { color:#f8fafc; font-size:22px; margin:9px 0 8px; }
        .ai-card-copy { color:#9eacc6; font-size:14px; line-height:1.65; margin:0 0 22px; }
        .ai-dropzone { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; min-height:190px; padding:24px; box-sizing:border-box; border:1.5px dashed rgba(167,139,250,.55); border-radius:18px; background:linear-gradient(135deg,rgba(124,58,237,.12),rgba(14,165,233,.07)); cursor:pointer; transition:border-color .2s ease,background .2s ease,transform .2s ease; }
        .ai-dropzone:hover { border-color:#a78bfa; background:rgba(124,58,237,.17); transform:translateY(-1px); }
        .ai-upload-icon { display:grid; place-items:center; width:54px; height:54px; border-radius:17px; margin-bottom:14px; color:#e9ddff; font-size:25px; background:linear-gradient(135deg,#7c3aed,#2563eb); box-shadow:0 10px 28px rgba(109,40,217,.32); }
        .ai-drop-title { color:#f8fafc; font-weight:800; font-size:16px; margin-bottom:7px; }
        .ai-drop-hint { color:#94a3b8; font-size:12px; }
        .ai-file-input { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
        .ai-file-selected { margin-top:14px; padding:12px 14px; display:flex; align-items:center; gap:10px; border:1px solid rgba(52,211,153,.24); border-radius:12px; color:#bbf7d0; background:rgba(16,185,129,.09); font-size:13px; overflow-wrap:anywhere; }
        .ai-prep-actions { display:flex; flex-wrap:wrap; gap:12px; margin-top:20px; }
        .ai-prep-btn { min-height:46px; padding:12px 20px; border-radius:12px; font-weight:800; font-size:14px; cursor:pointer; transition:transform .2s ease,opacity .2s ease,box-shadow .2s ease; }
        .ai-prep-btn:hover:not(:disabled) { transform:translateY(-2px); }
        .ai-prep-btn:disabled { cursor:not-allowed; opacity:.42; }
        .ai-prep-btn-secondary { border:1px solid rgba(167,139,250,.55); color:#d8ccff; background:rgba(124,58,237,.12); }
        .ai-prep-btn-primary { border:0; color:#fff; background:linear-gradient(100deg,#7c3aed,#4f46e5 58%,#0284c7); box-shadow:0 10px 26px rgba(79,70,229,.28); }
        .ai-guide-list { display:grid; gap:19px; margin-top:24px; }
        .ai-guide-item { display:flex; gap:13px; align-items:flex-start; color:#dbe5f7; font-size:13px; line-height:1.55; }
        .ai-guide-number { flex:0 0 30px; height:30px; display:grid; place-items:center; border-radius:10px; color:#ddd6fe; background:rgba(139,92,246,.2); font-weight:900; }
        .ai-guide-item strong { display:block; color:#fff; font-size:14px; margin-bottom:3px; }
        .ai-tech-note { margin-top:24px; padding:14px 15px; border-radius:14px; border:1px solid rgba(56,189,248,.2); color:#a5dff8; background:rgba(14,165,233,.08); font-size:12px; line-height:1.6; }
        .ai-prep-error { padding:12px 15px; margin:16px 0; border:1px solid rgba(248,113,113,.3); border-radius:12px; color:#fecaca; background:rgba(127,29,29,.2); font-size:13px; }
        @media (max-width:850px) { .ai-prep-grid { grid-template-columns:1fr; } .ai-prep-header { flex-direction:column; } }
        @media (max-width:560px) { .ai-interview-root:not(.is-active) { padding:18px !important; border-radius:18px !important; } .ai-prep-actions { flex-direction:column; } .ai-prep-btn { width:100%; } }
        .ai-interview-root.is-active { position:fixed !important; inset:0 !important; z-index:999999 !important; width:100vw !important; height:100vh !important; height:100dvh !important; min-height:0 !important; margin:0 !important; padding:0 !important; border:0 !important; border-radius:0 !important; box-shadow:none !important; background:#080b16 !important; overflow:hidden !important; }
        .ai-interview-root.is-active .ai-interview-stage { position:absolute; inset:0; width:100%; height:100%; min-height:0 !important; display:grid !important; grid-template-columns:1fr 1fr !important; gap:0 !important; }
        .ai-interview-root.is-active .ai-panel { min-width:0; min-height:0 !important; height:100%; border-radius:0 !important; }
        .ai-interview-root.is-active .candidate-panel video { width:100%; height:100% !important; min-height:0 !important; object-fit:cover; }
        .ai-interview-root.is-active .ai-orb { transition: transform .25s ease, box-shadow .25s ease; }
        .ai-interview-root.is-active .ai-wave span { display:block; width:5px; height:9px; border-radius:8px; background:#c4b5fd; opacity:.55; }
        .ai-interview-root.is-active .ai-wave.is-speaking span { animation: aiWave 760ms ease-in-out infinite; }
        .ai-interview-root.is-active .ai-wave.is-speaking span:nth-child(2n) { animation-delay:110ms; }
        .ai-interview-root.is-active .ai-wave.is-speaking span:nth-child(3n) { animation-delay:220ms; }
        .ai-interview-root.is-active .ai-orb.is-speaking { animation: aiPulse 2s ease-in-out infinite; }
        .ai-interview-root.is-active .ai-orb.is-listening { animation: aiListen 1.8s ease-in-out infinite; }
        .ai-interview-root.is-active .ai-wave.is-listening span { width:7px; height:7px; border-radius:50%; opacity:.85; animation: aiListenDots 1.25s ease-in-out infinite; }
        .ai-interview-root.is-active .ai-wave.is-listening span:nth-child(2n) { animation-delay:160ms; }
        .ai-interview-root.is-active .ai-wave.is-listening span:nth-child(3n) { animation-delay:320ms; }
        .ai-interview-root.is-active .ai-wave.is-idle span { height:5px; width:5px; opacity:.35; }
        @keyframes aiPulse { 0%,100% { transform:scale(1); box-shadow:0 0 0 16px rgba(196,181,253,.08),0 0 55px rgba(167,139,250,.25); } 50% { transform:scale(1.045); box-shadow:0 0 0 25px rgba(196,181,253,.04),0 0 85px rgba(167,139,250,.55); } }
        @keyframes aiListen { 0%,100% { transform:scale(1); box-shadow:0 0 0 12px rgba(74,222,128,.06),0 0 40px rgba(74,222,128,.12); } 50% { transform:scale(1.025); box-shadow:0 0 0 28px rgba(74,222,128,.04),0 0 65px rgba(74,222,128,.3); } }
        @keyframes aiWave { 0%,100% { height:9px; opacity:.55; } 50% { height:34px; opacity:1; } }
        @keyframes aiListenDots { 0%,100% { transform:scale(.8); opacity:.45; } 50% { transform:scale(1.35); opacity:1; } }
        .ai-end-call { position:fixed; right:30px; bottom:26px; z-index:1000001; border:0; border-radius:999px; padding:15px 24px; color:#fff; background:#dc2626; font-size:15px; font-weight:800; box-shadow:0 12px 35px rgba(220,38,38,.35); cursor:pointer; }
        .ai-end-call:disabled { opacity:.6; cursor:wait; }
        @media (max-width:760px) { .ai-interview-root.is-active .ai-interview-stage { grid-template-columns:1fr !important; grid-template-rows:1fr 1fr !important; } .ai-end-call { right:18px; bottom:18px; } }
      `}</style>
      <div className={`card ai-interview-root ${interview && !completed ? "is-active" : ""}`}>

      {!interview && !completed && (
        <header className="ai-prep-header">
          <div>
            <div className="ai-prep-eyebrow">NexPrep AI · Voice-powered mock interview</div>
            <h1 className="ai-prep-title">Your next interview starts here.</h1>
            <p className="ai-prep-subtitle">Practice with an AI interviewer that uses your resume to guide the conversation and assess your technical skills.</p>
          </div>
          <div className="ai-prep-pill">✦ AI MOCK INTERVIEW</div>
        </header>
      )}


      {/* Display errors. */}
      {error && (
        <div
          className="ai-prep-error"
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
            marginTop: "8px", marginBottom: "16px", padding: "12px 20px",
            border: "1px solid rgba(196,181,253,.4)", borderRadius: "12px",
            cursor: "pointer", fontSize: "14px", fontWeight: "800",
            background: "linear-gradient(100deg,#7c3aed,#4f46e5)", color: "#ffffff",
          }}
        >
          View Subscription & Plans
        </button>
      )}


      {/* --------------------------------------------- */}
      {/* Interview selection screen.                   */}
      {/* --------------------------------------------- */}

      {!interview && !completed && (
        <div className="ai-prep-grid">
          <section className="ai-upload-card">
            <div className="ai-card-kicker">Step 01 · Resume upload</div>
            <h2 className="ai-card-heading">Build your interview around your experience</h2>
            <p className="ai-card-copy">Upload your latest resume. NexPrep AI will use it as context for a more relevant interview. PDF and DOCX files up to 5 MB are supported.</p>

            <label className="ai-dropzone" htmlFor="ai-interview-resume">
              <span className="ai-upload-icon" aria-hidden="true">⇧</span>
              <span className="ai-drop-title">{resumeFile ? "Choose a different resume" : "Choose your resume file"}</span>
              <span className="ai-drop-hint">Click to browse · PDF or DOCX · Max 5 MB</span>
            </label>
            <input
              id="ai-interview-resume"
              className="ai-file-input"
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => {
                setResumeFile(event.target.files?.[0] || null);
                setResumeUploaded(false);
                setResumeError("");
                setError("");
              }}
              disabled={resumeLoading || loading}
            />

            {resumeFile && (
              <div className="ai-file-selected" role="status">
                <span aria-hidden="true">✓</span>
                <span>{resumeFile.name}</span>
              </div>
            )}
            {resumeError && <p className="ai-prep-error" role="alert">{resumeError}</p>}
            {resumeUploaded && <p className="ai-file-selected" role="status">✓ Resume uploaded successfully. You are ready to start.</p>}

            <div className="ai-prep-actions">
              <button
                type="button"
                className="ai-prep-btn ai-prep-btn-secondary"
                onClick={uploadResume}
                disabled={!resumeFile || resumeLoading || loading}
              >
                {resumeLoading ? "Uploading resume..." : resumeUploaded ? "Upload another resume" : "Upload Resume"}
              </button>
              <button
                type="button"
                className="ai-prep-btn ai-prep-btn-primary"
                onClick={startInterview}
                disabled={loading || mediaLoading || resumeLoading || !resumeUploaded}
              >
                {loading || mediaLoading ? "Preparing interview..." : "Start AI Interview →"}
              </button>
            </div>
          </section>

          <aside className="ai-guide-card">
            <div className="ai-card-kicker">Before you begin</div>
            <h2 className="ai-card-heading">Set yourself up to succeed</h2>
            <p className="ai-card-copy">A few quick checks make the interview smoother.</p>
            <div className="ai-guide-list">
              <div className="ai-guide-item"><span className="ai-guide-number">1</span><div><strong>Allow camera access</strong>Keep your face visible and position your camera at eye level.</div></div>
              <div className="ai-guide-item"><span className="ai-guide-number">2</span><div><strong>Allow microphone access</strong>Use a quiet room and speak clearly in a natural voice.</div></div>
              <div className="ai-guide-item"><span className="ai-guide-number">3</span><div><strong>Answer in your own words</strong>Listen to each question and explain your thinking step by step.</div></div>
            </div>
            <div className="ai-tech-note">ⓘ Camera and microphone permissions are requested when you start the interview. Use the latest Google Chrome for the best speech-recognition support.</div>
          </aside>
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


          <div style={{
            marginTop: "25px", marginBottom: "25px", padding: "24px",
            background: "#f3f4f6", borderRadius: "12px", textAlign: "center"
          }}>
            <h2 style={{ margin: "0 0 10px", color: "#111827" }}>Your interview evaluation is being sent</h2>
            <p style={{ color: "#374151", fontSize: "16px", lineHeight: 1.6, margin: 0 }}>
              Your score and detailed interview feedback will be sent to your registered email address.
            </p>
            {finalResult?.resultEmail && (
              <p style={{ color: "#4f46e5", fontWeight: 700, marginBottom: 0 }}>{finalResult.resultEmail}</p>
            )}
            <p style={{ color: "#64748b", fontSize: "13px", marginBottom: 0 }}>
              {finalResult?.emailSent === false
                ? "Email delivery could not be confirmed. Please check your mail settings or contact support."
                : "Please check your inbox and spam folder."}
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


          <section style={{ marginTop: "32px", padding: "24px", border: "1px solid #e5e7eb", borderRadius: "12px" }}>
            <h2 style={{ marginTop: 0, color: "#111827" }}>How was your interview experience?</h2>
            <p style={{ color: "#4b5563" }}>Your feedback helps us improve the AI interviewer.</p>
            {feedbackSubmitted ? (
              <p role="status" style={{ color: "#15803d", fontWeight: 700 }}>Thank you for sharing your feedback!</p>
            ) : (
              <>
                <div style={{ display: "flex", gap: "10px", margin: "16px 0" }}>
                  {[1,2,3,4,5].map((star) => (
                    <button key={star} type="button" onClick={() => setFeedbackRating(star)} aria-label={`${star} star rating`}
                      style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "9px 13px", cursor: "pointer", background: feedbackRating >= star ? "#fef3c7" : "#fff", color: feedbackRating >= star ? "#b45309" : "#374151", fontSize: "20px" }}>★</button>
                  ))}
                </div>
                <textarea value={feedbackText} onChange={(event) => setFeedbackText(event.target.value)} rows={4}
                  placeholder="Tell us what went well and what we should improve..."
                  style={{ width: "100%", boxSizing: "border-box", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", font: "inherit" }} />
                <button type="button" onClick={submitInterviewFeedback} disabled={feedbackLoading}
                  style={{ marginTop: "14px", padding: "12px 20px", border: 0, borderRadius: "8px", background: "#6d28d9", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  {feedbackLoading ? "Submitting..." : "Submit Feedback"}
                </button>
              </>
            )}
          </section>

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

      )}


      {/* Full-screen virtual interview: AI left, candidate camera right. */}
      {interview && !completed && (
        <>
          <div className="ai-interview-stage">
            <section
              className="ai-panel"
              style={{
                background: "radial-gradient(circle at 50% 42%, #30205f 0%, #17152f 42%, #090d19 100%)",
                color: "#ffffff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "clamp(20px, 4vw, 64px)",
                boxSizing: "border-box",
                textAlign: "center",
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", top: "28px", left: "34px", color: "#c4b5fd", fontSize: "13px", letterSpacing: "2px", fontWeight: 800 }}>AI INTERVIEWER</div>
              <div className={`ai-orb ${voiceStatus.toLowerCase().includes("speaking") ? "is-speaking" : voiceStatus.toLowerCase().includes("listening") ? "is-listening" : ""}`} style={{ width: "clamp(150px, 19vw, 260px)", height: "clamp(150px, 19vw, 260px)", borderRadius: "50%", display: "grid", placeItems: "center", background: "radial-gradient(circle, #d9ccff 0%, #9b6aff 42%, #5521a8 72%, #25134d 100%)", marginBottom: "26px" }}>
                <div style={{ width: "58%", height: "58%", borderRadius: "50%", background: "linear-gradient(145deg,#fff,#c4b5fd)", color: "#4c1d95", display: "grid", placeItems: "center", fontSize: "clamp(42px,5vw,68px)", fontWeight: 900, letterSpacing: "-3px" }}>AI</div>
              </div>
              <div style={{ fontSize: "clamp(22px,2.3vw,32px)", fontWeight: 800, marginBottom: "14px" }}>AI Interviewer</div>
              <div role="status" aria-live="polite" style={{ color: "#ddd6fe", fontSize: "clamp(14px,1.2vw,18px)", minHeight: "26px" }}>{voiceStatus}</div>
              <div style={{ width: "min(100%, 720px)", maxHeight: "min(24vh, 210px)", overflowY: "auto", marginTop: "20px", padding: "18px 22px", borderRadius: "16px", border: "1px solid rgba(196,181,253,.24)", background: "rgba(15, 12, 35, .58)", color: "#f5f3ff", textAlign: "left", lineHeight: 1.65, fontSize: "clamp(14px,1.15vw,17px)", boxSizing: "border-box" }}>
                <div style={{ color: "#c4b5fd", fontSize: "11px", fontWeight: 800, letterSpacing: "1.5px", marginBottom: "8px" }}>CURRENT QUESTION</div>
                {interview.question || "Your interviewer is preparing the next question..."}
                {liveTranscript && (
                  <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid rgba(196,181,253,.18)", color: "#a7f3d0", fontSize: "13px" }}>
                    <strong style={{ color: "#6ee7b7" }}>YOUR RESPONSE:</strong> {liveTranscript}
                  </div>
                )}
              </div>
              <div className={`ai-wave ${voiceStatus.toLowerCase().includes("speaking") ? "is-speaking" : voiceStatus.toLowerCase().includes("listening") ? "is-listening" : "is-idle"}`} aria-hidden="true" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", height: "42px", marginTop: "26px" }}>
                {Array.from({ length: 9 }, (_, index) => <span key={index} />)}
              </div>
              <div style={{ position: "absolute", bottom: "34px", color: "#a5a0bd", fontSize: "13px" }}>Please answer naturally. Your response is captured automatically.</div>
            </section>

            <section className="ai-panel candidate-panel" style={{ background: "#05070d", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <video ref={videoRef} autoPlay muted playsInline aria-label="Your live camera" style={{ width: "100%", height: "100%", minHeight: 0, objectFit: "cover", display: "block", background: "#05070d" }} />
              <div style={{ position: "absolute", top: "28px", left: "30px", padding: "9px 14px", borderRadius: "20px", background: "rgba(0,0,0,.58)", color: "#fff", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80" }} /> Camera on
              </div>
              <div style={{ position: "absolute", top: "28px", right: "30px", padding: "9px 14px", borderRadius: "20px", background: "rgba(0,0,0,.58)", color: "#fff", fontSize: "13px" }}>Live interview</div>
            </section>
          </div>
          <button className="ai-end-call" type="button" onClick={endInterview} disabled={submitting}>
            {submitting ? "Ending..." : "End Call"}
          </button>
          {!voiceSupported && (
            <div role="alert" style={{ position: "fixed", left: "50%", bottom: "28px", transform: "translateX(-50%)", zIndex: 1000000, color: "#991b1b", background: "#fee2e2", padding: "12px 16px", borderRadius: "8px" }}>
              Voice recognition is not supported. Please use the latest Google Chrome.
            </div>
          )}
        </>
      )}

      </div>
    </>
  );
}

export default AIInterview;