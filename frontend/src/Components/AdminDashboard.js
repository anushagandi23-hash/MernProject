import React from "react";
import { useNavigate } from "react-router-dom";
import AdminTripManagement from "./AdminTripManagement";

function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const adminEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");
  const isAdmin = userRole === 'ADMIN' || adminEmail?.includes("admin");

  if (!isAdmin || !token) {
    return (
      <>
        <div className="header">
          <h1>🚌 RedBus Clone</h1>
        </div>
        <div className="container" style={{ minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center" }}>
          <div className="card" style={{ backgroundColor: "#fee2e2", borderColor: "#fecaca", maxWidth: 500 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔒</div>
              <h3 style={{ color: "#c53030", marginBottom: "8px" }}>Access Denied</h3>
              <p style={{ color: "#636e72", marginBottom: "20px" }}>Only admin accounts can access this area. Log in with an admin account (with 'admin' in email).</p>
              <button className="btn" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Render the Trip Management interface
  return <AdminTripManagement token={token} />;
}

export default AdminDashboard;
