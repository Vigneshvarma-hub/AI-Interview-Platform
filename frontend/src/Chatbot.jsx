
import { useEffect, useRef, useState } from "react";
import "./Chatbot.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const quickOptions = [
  {
    label: "Java Interview",
    message:
      "Help me prepare for Java technical interviews. Give me important topics and questions.",
    icon: "☕",
  },
  {
    label: "Resume Preparation",
    message:
      "How can I create a professional resume for a fresher software developer?",
    icon: "📄",
  },
  {
    label: "Coding Practice",
    message:
      "Give me beginner-friendly Java coding problems with explanations.",
    icon: "💻",
  },
  {
    label: "Skill Assessment",
    message:
      "Explain how skill assessments work and how I can improve my scores.",
    icon: "📊",
  },
  {
    label: "AI Mock Interview",
    message:
      "How does the AI mock interview work? Help me practise an interview.",
    icon: "🎤",
  },
  {
    label: "Platform Help",
    message:
      "Explain the main features of this AI Interview and Skill Assessment Platform.",
    icon: "🤖",
  },
];

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  // Quick options appear only after the user sends a greeting.
  const [showQuickOptions, setShowQuickOptions] = useState(false);

  // No automatic welcome message when the chatbot opens.
  const [messages, setMessages] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesContainerRef = useRef(null);
  const activeControllerRef = useRef(null);

  // Scroll chatbot messages to the latest message.
  useEffect(() => {
    const container = messagesContainerRef.current;

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isLoading, error, showQuickOptions]);

  // Cancel an active request when the component unmounts.
  useEffect(() => {
    return () => {
      activeControllerRef.current?.abort();
    };
  }, []);

  async function handleSendMessage(event, predefinedMessage) {
    event?.preventDefault();

    const userMessage = (predefinedMessage ?? message).trim();

    if (!userMessage || isLoading) return;

    // Detect simple greetings without calling Gemini.
    const normalizedMessage = userMessage
      .toLowerCase()
      .replace(/[!.,?]+$/g, "")
      .trim();

    const greetingWords = [
      "hi",
      "hello",
      "hey",
      "hai",
      "good morning",
      "good afternoon",
      "good evening",
    ];

    const isGreeting = greetingWords.includes(normalizedMessage);

    // Display greeting response instantly.
    if (isGreeting) {
      setMessages((previous) => [
        ...previous,
        {
          role: "user",
          text: userMessage,
        },
        {
          role: "assistant",
          text: "How can I help you today?",
        },
      ]);

      setMessage("");
      setError("");
      setShowQuickOptions(true);

      return;
    }

    // Hide quick options when the user asks another question
    // or selects one of the predefined topics.
    setShowQuickOptions(false);

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: userMessage,
      },
    ]);

    setMessage("");
    setError("");
    setIsLoading(true);

    const controller = new AbortController();
    activeControllerRef.current = controller;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 45000);

    try {
      const response = await fetch(
        "http://localhost:8080/api/chatbot/message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
          }),
          signal: controller.signal,
        }
      );

      const responseText = await response.text();

      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          "Invalid response received from the backend."
        );
      }

      // Handle HTTP errors.
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Your session has expired. Please log in again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You do not have permission to access the chatbot."
          );
        }

        if (response.status === 429) {
          throw new Error(
            "Too many requests. Please try again later."
          );
        }

        throw new Error(
          data.message ||
            data.error ||
            `Request failed (${response.status}).`
        );
      }

      // Validate the AI response.
      if (
        typeof data.answer !== "string" ||
        !data.answer.trim()
      ) {
        throw new Error(
          "The AI returned an empty response. Please try again."
        );
      }

      // Display Gemini response.
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: data.answer.trim(),
        },
      ]);
    } catch (err) {
      console.error("Chatbot API error:", err);

      if (err.name === "AbortError") {
        setError(
          "The AI response took too long. Please try again."
        );
      } else if (err instanceof TypeError) {
        setError(
          "Cannot connect to the backend. Check whether Spring Boot is running."
        );
      } else {
        setError(
          err.message || "Something went wrong. Please try again."
        );
      }
    } finally {
      clearTimeout(timeoutId);

      if (activeControllerRef.current === controller) {
        activeControllerRef.current = null;
      }

      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Floating chatbot button */}
      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={
          isOpen ? "Close AI assistant" : "Open AI assistant"
        }
        aria-expanded={isOpen}
      >
        {isOpen ? "×" : "✦"}

        {!isOpen && (
          <span className="chatbot-toggle-label">
            Ask AI
          </span>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <section
          className="chatbot-panel"
          aria-label="AI Interview Assistant"
        >
          {/* Header */}
          <header className="chatbot-header">
            <div className="chatbot-header-avatar">
              AI
            </div>

            <div className="chatbot-header-info">
              <strong>Interview Assistant</strong>

              <span>
                <span className="chatbot-online-dot" />
                AI assistant
              </span>
            </div>

            <button
              type="button"
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          {/* Messages area */}
          <div
            className="chatbot-messages"
            ref={messagesContainerRef}
            aria-live="polite"
          >
            <div className="chatbot-date-label">
              YOUR AI ASSISTANT
            </div>

            {/* Display messages */}
            {messages.map((item, index) => (
              <div
                key={`${index}-${item.role}`}
                className={`chatbot-message-row ${
                  item.role === "user"
                    ? "user-message-row"
                    : ""
                }`}
              >
                {item.role === "assistant" && (
                  <span className="chatbot-message-avatar">
                    AI
                  </span>
                )}

                <div
  className={`chatbot-message ${
    item.role === "user"
      ? "user-message"
      : "assistant-message"
  }`}
>
  {item.role === "assistant" ? (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {item.text}
    </ReactMarkdown>
  ) : (
    item.text
  )}
</div>
              </div>
            ))}

            {/* Quick options appear only after a greeting */}
            {showQuickOptions && (
              <div className="chatbot-quick-options">
                <p className="chatbot-options-heading">
                  What would you like help with?
                </p>

                <div className="chatbot-options-grid">
                  {quickOptions.map((option) => (
                    <button
                      type="button"
                      className="chatbot-option-button"
                      key={option.label}
                      disabled={isLoading}
                      onClick={() =>
                        handleSendMessage(
                          null,
                          option.message
                        )
                      }
                    >
                      <span>{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="chatbot-message-row">
                <span className="chatbot-message-avatar">
                  AI
                </span>

                <div className="chatbot-message assistant-message chatbot-typing">
                  Thinking...
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="chatbot-error">
                <span>{error}</span>

                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* User input */}
          <form
            className="chatbot-input-area"
            onSubmit={(event) =>
              handleSendMessage(event)
            }
          >
            <input
              type="text"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Ask me anything..."
              aria-label="Type your message"
              maxLength={4000}
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              aria-label="Send message"
            >
              ➤
            </button>
          </form>

          <p className="chatbot-footer-note">
            Powered by AI · Verify important information
          </p>
        </section>
      )}
    </>
  );
}

export default Chatbot;
