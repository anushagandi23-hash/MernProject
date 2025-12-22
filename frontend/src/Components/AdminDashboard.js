import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../config/api";

function AdminDashboard() {
  const [formData, setFormData] = useState({
    busNumber: "",
    from: "",
    to: "",
    departureTime: "",
    arrivalTime: "",
    price: "",
    totalSeats: "",
  });
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const adminEmail = localStorage.getItem("userEmail");
  const isAdmin = adminEmail?.includes("admin");

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

  const validateForm = () => {
    if (!formData.busNumber.trim()) return "Bus number is required";
    if (!formData.from.trim() || !formData.to.trim()) return "From and To cities are required";
    if (formData.from === formData.to) return "From and To cities must be different";
    if (!formData.departureTime || !formData.arrivalTime) return "Departure and arrival times are required";
    if (formData.price <= 0) return "Price must be greater than 0";
    if (formData.totalSeats < 20) return "Total seats must be at least 20";
    return null;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const error = validateForm();
    if (error) {
      setMessage(error);
      setMsgType("error");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/buses`, formData, {
        headers: { Authorization: token },
      });
      setMessage("✓ Bus added successfully!");
      setMsgType("success");
      setFormData({
        busNumber: "",
        from: "",
        to: "",
        departureTime: "",
        arrivalTime: "",
        price: "",
        totalSeats: "",
      });
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setMessage(err.response?.data || "Error adding bus");
      setMsgType("error");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px" }}>
        <h1>🚌 Admin Dashboard</h1>
        <button className="btn" onClick={() => navigate("/dashboard")} style={{ background: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.5)" }}>
          ← Back
        </button>
      </div>
      <div className="container" style={{ maxWidth: 600 }}>
        <div className="card" style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ marginBottom: "8px" }}>Add New Bus</h2>
            <p style={{ fontSize: "14px", color: "#636e72" }}>Register a new bus in the system</p>
          </div>

          {message && (
            <div className={`message ${msgType}`} style={{ marginBottom: "16px", display: "flex", alignItems: "center" }}>
              {msgType === "success" ? "✅" : "❌"} {message}
            </div>
          )}

          <form className="form" onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label>Bus Number</label>
                <input
                  type="text"
                  name="busNumber"
                  placeholder="AC-101"
                  value={formData.busNumber}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-group">
                <label>Total Seats</label>
                <input
                  type="number"
                  name="totalSeats"
                  placeholder="40"
                  value={formData.totalSeats}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label>From City</label>
                <input
                  type="text"
                  name="from"
                  placeholder="Delhi"
                  value={formData.from}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-group">
                <label>To City</label>
                <input
                  type="text"
                  name="to"
                  placeholder="Mumbai"
                  value={formData.to}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="form-group">
                <label>Departure Time</label>
                <input
                  type="time"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-group">
                <label>Arrival Time</label>
                <input
                  type="time"
                  name="arrivalTime"
                  value={formData.arrivalTime}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Price per Seat (₹)</label>
              <input
                type="number"
                name="price"
                placeholder="1500"
                value={formData.price}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <button type="submit" className="btn" style={{ width: "100%", opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? "Adding Bus..." : "✓ Add Bus"}
            </button>
          </form>

          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #dfe6e9" }}>
            <p style={{ fontSize: "12px", color: "#636e72", textAlign: "center" }}>
              💡 All fields are required. Seats should be minimum 20.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
