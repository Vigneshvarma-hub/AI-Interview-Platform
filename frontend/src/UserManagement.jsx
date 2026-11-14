
import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/admin/users";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // Common function for authenticated API requests.
  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Fetch all registered users.
  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users (${response.status})`);
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  // Load users when the component first appears.
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch complete details for a selected user.
  const viewUserDetails = async (userId) => {
    setDetailsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/${userId}`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch user details (${response.status})`
        );
      }

      const data = await response.json();
      setSelectedUser(data);
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError(err.message || "Unable to load user details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  // Activate or deactivate a user.
  const toggleUserStatus = async (user) => {
    const newStatus = !user.active;

    const action = newStatus ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name}?`
    );

    if (!confirmed) return;

    setUpdatingUserId(user.id);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/${user.id}/status?active=${newStatus}`,
        {
          method: "PUT",
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || `Failed to ${action} user (${response.status})`
        );
      }

      // Refresh the user list after successful status update.
      await fetchUsers();

      // Refresh the details panel if the same user is open.
      if (selectedUser?.id === user.id) {
        await viewUserDetails(user.id);
      }
    } catch (err) {
      console.error("Error updating user status:", err);
      setError(err.message || "Unable to update user status.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Filter users by name, email, or role.
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();

    return (
      String(user.name || "").toLowerCase().includes(search) ||
      String(user.email || "").toLowerCase().includes(search) ||
      String(user.role || "").toLowerCase().includes(search)
    );
  });

  const isAdmin = (role) => {
    const normalizedRole = String(role || "").toUpperCase();

    return normalizedRole === "ADMIN" ||
      normalizedRole === "ROLE_ADMIN";
  };

  return (
    <div className="admin-user-management">
      <div className="admin-page-header">
        <div>
          <h2>User Management</h2>
          <p>View and manage registered users on the platform.</p>
        </div>

        <button
          className="admin-refresh-button"
          onClick={fetchUsers}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Users"}
        </button>
      </div>

      <div className="admin-user-card">
        <div className="admin-user-toolbar">
          <div>
            <h3>Registered Users</h3>
            <p>
              Total Users: <strong>{users.length}</strong>
            </p>
          </div>

          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {error && (
          <div className="admin-error-message">
            {error}
          </div>
        )}

        {loading && users.length === 0 ? (
          <p className="admin-loading-message">
            Loading users...
          </p>
        ) : (
          <div className="admin-table-container">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name || "N/A"}</td>
                      <td>{user.email || "N/A"}</td>

                      <td>
                        <span
                          className={`admin-role-badge ${
                            isAdmin(user.role)
                              ? "admin-role"
                              : "user-role"
                          }`}
                        >
                          {user.role || "USER"}
                        </span>
                      </td>

                      <td>
                        <span
                          style={{
                            color: user.active
                              ? "#16a34a"
                              : "#dc2626",
                            fontWeight: 600,
                          }}
                        >
                          {user.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => viewUserDetails(user.id)}
                            disabled={detailsLoading}
                          >
                            View Details
                          </button>

                          {!isAdmin(user.role) && (
                            <button
                              type="button"
                              onClick={() => toggleUserStatus(user)}
                              disabled={
                                updatingUserId === user.id
                              }
                              style={{
                                background: user.active
                                  ? "#dc2626"
                                  : "#16a34a",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "7px 10px",
                                cursor: "pointer",
                              }}
                            >
                              {updatingUserId === user.id
                                ? "Updating..."
                                : user.active
                                  ? "Deactivate"
                                  : "Activate"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="admin-empty-message"
                    >
                      {searchTerm
                        ? "No users match your search."
                        : "No users found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User details modal */}
      {(selectedUser || detailsLoading) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "var(--card-bg, #ffffff)",
              color: "var(--text-color, #111827)",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "700px",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <h2>User Details</h2>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>

            {detailsLoading ? (
              <p>Loading user details...</p>
            ) : selectedUser ? (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "14px",
                    marginTop: "16px",
                  }}
                >
                  <div>
                    <strong>User ID</strong>
                    <p>{selectedUser.id}</p>
                  </div>

                  <div>
                    <strong>Name</strong>
                    <p>{selectedUser.name || "N/A"}</p>
                  </div>

                  <div>
                    <strong>Email</strong>
                    <p>{selectedUser.email || "N/A"}</p>
                  </div>

                  <div>
                    <strong>Role</strong>
                    <p>{selectedUser.role || "USER"}</p>
                  </div>

                  <div>
                    <strong>Account Status</strong>
                    <p>
                      {selectedUser.active
                        ? "Active"
                        : "Inactive"}
                    </p>
                  </div>
                </div>

                <hr />

                <h3>Assessment Summary</h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "12px",
                  }}
                >
                  <div>
                    <strong>Total Assessments</strong>
                    <h2>{selectedUser.totalAssessments}</h2>
                  </div>

                  <div>
                    <strong>Completed</strong>
                    <h2>{selectedUser.completedAssessments}</h2>
                  </div>

                  <div>
                    <strong>Average Score</strong>
                    <h2>
                      {Number(
                        selectedUser.averageScore || 0
                      ).toFixed(2)}
                    </h2>
                  </div>
                </div>

                <hr />

                <h3>Assessment History</h3>

                {selectedUser.assessments?.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <table className="admin-users-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Technology</th>
                          <th>Difficulty</th>
                          <th>Status</th>
                          <th>Score</th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedUser.assessments.map(
                          (assessment) => (
                            <tr key={assessment.id}>
                              <td>{assessment.id}</td>
                              <td>
                                {assessment.technology || "N/A"}
                              </td>
                              <td>
                                {assessment.difficulty || "N/A"}
                              </td>
                              <td>
                                {assessment.status || "N/A"}
                              </td>
                              <td>
                                {assessment.score ?? "N/A"}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No assessments found for this user.</p>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;  