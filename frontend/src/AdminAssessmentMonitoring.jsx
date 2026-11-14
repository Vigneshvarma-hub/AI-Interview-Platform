import React, { useEffect, useState } from "react";
import "./AdminAssessmentMonitoring.css";

const API_BASE_URL = "http://localhost:8080/api/admin";

function AdminAssessmentMonitoring() {
    // Store all assessments received from the backend.
    const [assessments, setAssessments] = useState([]);

    // Track loading state while fetching data.
    const [loading, setLoading] = useState(false);

    // Store API error messages.
    const [error, setError] = useState("");

    // Fetch assessments from the backend.
    const fetchAssessments = async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/assessments`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to fetch assessments. Status: ${response.status}`
                );
            }

            const data = await response.json();

            // Ensure the response is an array before updating state.
            setAssessments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching assessments:", err);
            setError(
                "Unable to load assessments. Please check the backend connection."
            );
        } finally {
            setLoading(false);
        }
    };

    // Load assessments when the component is first rendered.
    useEffect(() => {
        fetchAssessments();
    }, []);

    // Format date values safely.
    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "—";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleString();
    };

    // Return a CSS class based on assessment status.
    const getStatusClass = (status) => {
        if (!status) {
            return "status-default";
        }

        const normalizedStatus = status.toUpperCase();

        if (
            normalizedStatus === "COMPLETED" ||
            normalizedStatus === "FINISHED"
        ) {
            return "status-completed";
        }

        if (
            normalizedStatus === "STARTED" ||
            normalizedStatus === "IN_PROGRESS"
        ) {
            return "status-started";
        }

        if (normalizedStatus === "CANCELLED") {
            return "status-cancelled";
        }

        return "status-default";
    };

    return (
        <div className="admin-monitoring-page">

            {/* Page heading */}
            <div className="monitoring-header">
                <div>
                    <h2>Assessment Monitoring</h2>
                    <p>
                        View and monitor all assessments conducted on the
                        platform.
                    </p>
                </div>

                <button
                    className="refresh-assessments-btn"
                    onClick={fetchAssessments}
                    disabled={loading}
                >
                    {loading ? "Refreshing..." : "Refresh Assessments"}
                </button>
            </div>

            {/* Total assessment count */}
            <div className="assessment-count">
                Total Assessments: <strong>{assessments.length}</strong>
            </div>

            {/* Error message */}
            {error && (
                <div className="monitoring-error">
                    {error}
                </div>
            )}

            {/* Assessments table */}
            <div className="assessment-table-container">
                <table className="assessment-monitoring-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User Name</th>
                            <th>Email</th>
                            <th>Technology</th>
                            <th>Difficulty</th>
                            <th>Status</th>
                            <th>Score</th>
                            <th>Created At</th>
                            <th>Completed At</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading && assessments.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="table-message">
                                    Loading assessments...
                                </td>
                            </tr>
                        ) : assessments.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="table-message">
                                    No assessments found.
                                </td>
                            </tr>
                        ) : (
                            assessments.map((assessment) => (
                                <tr key={assessment.id}>
                                    <td>{assessment.id}</td>

                                    <td>
                                        {assessment.userName || "—"}
                                    </td>

                                    <td>
                                        {assessment.userEmail || "—"}
                                    </td>

                                    <td>
                                        {assessment.technology || "—"}
                                    </td>

                                    <td>
                                        {assessment.difficulty || "—"}
                                    </td>

                                    <td>
                                        <span
                                            className={`assessment-status ${getStatusClass(
                                                assessment.status
                                            )}`}
                                        >
                                            {assessment.status || "UNKNOWN"}
                                        </span>
                                    </td>

                                    <td>
                                        {assessment.score ?? 0}
                                    </td>

                                    <td>
                                        {formatDate(assessment.createdAt)}
                                    </td>

                                    <td>
                                        {formatDate(assessment.completedAt)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>

                </table>
            </div>
        </div>
    );
}

export default AdminAssessmentMonitoring;