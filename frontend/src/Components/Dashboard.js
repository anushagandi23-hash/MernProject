import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail") || "User";
  const userRole = localStorage.getItem("userRole");
  const userName = userEmail.split("@")[0];
  const isAdmin = userRole === 'ADMIN' || userEmail?.includes("admin");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  return (
    <>
      <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px" }}>
        <h1>🚌 RedBus Clone</h1>
        <button className="btn" onClick={handleLogout} style={{ background: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.5)" }}>
          👋 Logout
        </button>
      </div>
      <div className="container" style={{ minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 700 }}>
          <div className="card" style={{
            background: "linear-gradient(135deg, #d63031 0%, #e17055 100%)",
            color: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(214, 48, 49, 0.3)",
            marginBottom: "24px"
          }}>
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "16px", opacity: 0.9, margin: 0 }}>
                {greeting}, 👋
              </p>
              <h2 style={{ fontSize: "36px", fontWeight: "700", margin: "8px 0 0 0" }}>
                {userName.charAt(0).toUpperCase() + userName.slice(1)}
              </h2>
            </div>
            <p style={{ fontSize: "15px", opacity: 0.95, lineHeight: "1.6" }}>
              Welcome back! Plan your next adventure and book your tickets today.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            <div className="card" style={{
              background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
              color: "white",
              textAlign: "center",
              padding: "24px",
              cursor: "pointer",
              transition: "transform 0.3s ease, box-shadow 0.3s ease"
            }}
            onClick={() => navigate("/search")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(52, 152, 219, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
            }}
            >
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600" }}>Search Buses</h3>
              <p style={{ fontSize: "13px", opacity: 0.9, margin: 0 }}>Find and book buses</p>
            </div>

            <div className="card" style={{
              background: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
              color: "white",
              textAlign: "center",
              padding: "24px",
              cursor: "pointer",
              transition: "transform 0.3s ease, box-shadow 0.3s ease"
            }}
            onClick={() => navigate("/my-bookings")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(231, 76, 60, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
            }}
            >
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>📋</div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600" }}>My Bookings</h3>
              <p style={{ fontSize: "13px", opacity: 0.9, margin: 0 }}>View confirmed bookings</p>
            </div>

            {isAdmin && (
              <div className="card" style={{
                background: "linear-gradient(135deg, #27ae60 0%, #229954 100%)",
                color: "white",
                textAlign: "center",
                padding: "24px",
                cursor: "pointer",
                transition: "transform 0.3s ease, box-shadow 0.3s ease"
              }}
              onClick={() => navigate("/admin")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(39, 174, 96, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
              }}
              >
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔧</div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600" }}>Admin Panel</h3>
                <p style={{ fontSize: "13px", opacity: 0.9, margin: 0 }}>Manage buses</p>
              </div>
            )}

            {!isAdmin && (
              <div className="card" style={{
                background: "linear-gradient(135deg, #f39c12 0%, #d68910 100%)",
                color: "white",
                textAlign: "center",
                padding: "24px"
              }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>👤</div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600" }}>Traveler</h3>
                <p style={{ fontSize: "13px", opacity: 0.9, margin: 0 }}>User account</p>
              </div>
            )}
          </div>

          <div className="card" style={{ 
            background: "#fffbeb",
            borderLeft: "4px solid #f39c12",
            padding: "20px"
          }}>
            <p style={{ fontSize: "13px", color: "#92400e", margin: 0, lineHeight: "1.6" }}>
              💡 <strong>Pro Tip:</strong> Use our search feature to explore available buses, compare prices, and book your preferred seats instantly.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
