
import { useCallback, useEffect, useState } from "react";
import "./ContactMessages.css";

const API_URL = "http://localhost:8080/api/admin/contact-messages";

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState({
    pending: 0,
    replied: 0,
    total: 0,
  });

  const [filter, setFilter] = useState("ALL");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Stores the reply written by the admin.
  const [replyText, setReplyText] = useState("");

  // Read the JWT saved after admin login.
  function getToken() {
    const storedToken =
      localStorage.getItem("token") ||
      localStorage.getItem("jwtToken") ||
      localStorage.getItem("authToken");

    if (!storedToken) return null;

    return storedToken.startsWith("Bearer ")
      ? storedToken.substring(7)
      : storedToken;
  }

  // Load messages and inbox counts from the secured backend.
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please sign in again to access the admin inbox.");
      }

      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [messagesResponse, summaryResponse] = await Promise.all([
        fetch(API_URL, { headers }),
        fetch(`${API_URL}/summary`, { headers }),
      ]);

      if (!messagesResponse.ok || !summaryResponse.ok) {
        if (
          messagesResponse.status === 401 ||
          messagesResponse.status === 403 ||
          summaryResponse.status === 401 ||
          summaryResponse.status === 403
        ) {
          throw new Error(
            "Admin access failed. Please sign in again and check your admin role."
          );
        }

        throw new Error("Could not load contact messages from the server.");
      }

      const messagesData = await messagesResponse.json();
      const summaryData = await summaryResponse.json();

      setMessages(Array.isArray(messagesData) ? messagesData : []);
      setSummary(summaryData);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Send the admin's actual reply to the selected message's email address.
  async function sendReply() {
    if (!selectedMessage) return;

    if (!replyText.trim()) {
      setError("Please enter a reply before sending.");
      setSuccess("");
      return;
    }

    try {
      setUpdatingId(selectedMessage.id);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        throw new Error("Please sign in again.");
      }

      const response = await fetch(
        `${API_URL}/${selectedMessage.id}/reply`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            replyText: replyText.trim(),
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Admin access denied. Please sign in again.");
        }

        if (response.status === 404) {
          throw new Error("This contact message could not be found.");
        }

        if (response.status === 400) {
          throw new Error("Please enter a valid, non-empty reply.");
        }

        if (response.status === 502) {
          throw new Error(
            "The reply email could not be sent. The message status was not marked as replied. Please check the server logs."
          );
        }

        throw new Error(
          "Could not send the reply. Please check the server logs and try again."
        );
      }

      const updatedMessage = await response.json();

      // Update the selected message and clear the reply box after success.
      setSelectedMessage(updatedMessage);
      setReplyText("");
      setSuccess(`Reply email sent successfully to ${updatedMessage.email}.`);

      // Refresh the inbox and its Pending/Replied counts.
      await fetchMessages();
    } catch (err) {
      setError(err.message || "Unable to send the reply.");
    } finally {
      setUpdatingId(null);
    }
  }

  // Filter messages by their current status.
  const filteredMessages = messages.filter((message) => {
    if (filter === "PENDING") return message.status === "PENDING";
    if (filter === "REPLIED") return message.status === "REPLIED";
    return true;
  });

  return (
    <section className="contact-inbox">
      <div className="contact-inbox-header">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h2>Contact Messages</h2>
          <p className="contact-inbox-subtitle">
            Read incoming messages and reply to users by email.
          </p>
        </div>

        <button
          type="button"
          className="contact-refresh-button"
          onClick={fetchMessages}
          disabled={loading || updatingId !== null}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {/* Inbox summary cards */}
      <div className="contact-summary-grid">
        <article className="contact-summary-card">
          <span>Total Messages</span>
          <strong>{summary.total}</strong>
        </article>

        <article className="contact-summary-card pending">
          <span>Pending</span>
          <strong>{summary.pending}</strong>
        </article>

        <article className="contact-summary-card replied">
          <span>Replied</span>
          <strong>{summary.replied}</strong>
        </article>
      </div>

      <div className="contact-inbox-layout">
        {/* Left panel: message list and filters */}
        <div className="contact-message-list-panel">
          <div className="contact-filter-tabs">
            {["ALL", "PENDING", "REPLIED"].map((item) => (
              <button
                type="button"
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item === "ALL"
                  ? "All"
                  : item === "PENDING"
                    ? "Pending"
                    : "Replied"}
              </button>
            ))}
          </div>

          {error && (
            <div className="contact-inbox-error" role="alert">
              {error}
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                Dismiss
              </button>
            </div>
          )}

          {success && (
            <div className="contact-inbox-success" role="status">
              {success}
              <button
                type="button"
                onClick={() => setSuccess("")}
                aria-label="Dismiss success message"
              >
                Dismiss
              </button>
            </div>
          )}

          {loading ? (
            <p className="contact-inbox-empty">Loading messages...</p>
          ) : filteredMessages.length === 0 ? (
            <p className="contact-inbox-empty">
              No messages in this filter.
            </p>
          ) : (
            <div className="contact-message-list">
              {filteredMessages.map((message) => (
                <button
                  type="button"
                  key={message.id}
                  className={`contact-message-item ${
                    selectedMessage?.id === message.id ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedMessage(message);
                    setReplyText("");
                    setError("");
                    setSuccess("");
                  }}
                >
                  <span className="contact-message-item-top">
                    <strong>{message.name}</strong>
                    <span
                      className={`contact-status ${message.status.toLowerCase()}`}
                    >
                      {message.status}
                    </span>
                  </span>

                  <span className="contact-message-subject">
                    {message.subject}
                  </span>

                  <span className="contact-message-preview">
                    {message.message}
                  </span>

                  <span className="contact-message-date">
                    {message.createdAt
                      ? new Date(message.createdAt).toLocaleString()
                      : "Date unavailable"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right panel: selected message and reply editor */}
        <div className="contact-message-details">
          {!selectedMessage ? (
            <div className="contact-inbox-empty">
              <span className="contact-details-icon">✉</span>
              <h3>Select a message</h3>
              <p>Choose a message from the list to read and reply.</p>
            </div>
          ) : (
            <>
              <div className="contact-details-header">
                <div>
                  <p className="eyebrow">MESSAGE DETAILS</p>
                  <h3>{selectedMessage.subject}</h3>
                </div>

                <span
                  className={`contact-status ${selectedMessage.status.toLowerCase()}`}
                >
                  {selectedMessage.status}
                </span>
              </div>

              <div className="contact-sender-details">
                <div>
                  <span>From</span>
                  <strong>{selectedMessage.name}</strong>
                </div>

                <div>
                  <span>Email</span>
                  <a href={`mailto:${selectedMessage.email}`}>
                    {selectedMessage.email}
                  </a>
                </div>

                <div>
                  <span>Received</span>
                  <strong>
                    {selectedMessage.createdAt
                      ? new Date(selectedMessage.createdAt).toLocaleString()
                      : "Unavailable"}
                  </strong>
                </div>

                {selectedMessage.repliedAt && (
                  <div>
                    <span>Replied at</span>
                    <strong>
                      {new Date(selectedMessage.repliedAt).toLocaleString()}
                    </strong>
                  </div>
                )}
              </div>

              {/* Original message submitted by the user */}
              <div className="contact-message-body">
                <h4>Original Message</h4>
                <p>{selectedMessage.message}</p>
              </div>

              {/* Reply editor */}
              <div className="contact-reply-section">
                <h4>Reply to User</h4>
                <p>
                  Your reply will be sent to{" "}
                  <strong>{selectedMessage.email}</strong>.
                </p>

                <textarea
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  placeholder="Type your reply here..."
                  rows={6}
                  maxLength={5000}
                  disabled={updatingId === selectedMessage.id}
                />

                <div className="contact-reply-footer">
                  <span>{replyText.length}/5000 characters</span>

                  <button
                    type="button"
                    className="contact-mark-replied-button"
                    onClick={sendReply}
                    disabled={
                      updatingId === selectedMessage.id ||
                      !replyText.trim()
                    }
                  >
                    {updatingId === selectedMessage.id
                      ? "Sending Email..."
                      : "✉ Send Reply"}
                  </button>
                </div>

                {selectedMessage.status === "REPLIED" && (
                  <p className="contact-replied-note">
                    This message is marked as replied. Sending another reply
                    will email the user again.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
