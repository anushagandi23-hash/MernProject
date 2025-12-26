import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateEmail(email)) {
      setMessage("Please enter a valid email");
      setMsgType("error");
      return;
    }

    if (password.length < 3) {
      setMessage("Password must be at least 3 characters");
      setMsgType("error");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      setMessage("✓ Login successful! Redirecting...");
      setMsgType("success");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (error) {
      const errorMsg = error.message || "Invalid email or password";
      setMessage(errorMsg);
      setMsgType("error");
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "Inter, sans-serif" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", maxWidth: 1000, width: "100%", alignItems: "center" }}>
          {/* Left Hero Section */}
          <div style={{ color: "white", paddingRight: "40px" }}>
            <h1 style={{ fontSize: "48px", fontWeight: "700", marginBottom: "24px", lineHeight: "1.2", letterSpacing: "-0.5px" }}>
              Welcome Back to RedBus
            </h1>
            <p style={{ fontSize: "18px", opacity: 0.95, marginBottom: "40px", lineHeight: "1.7" }}>
              Book your next journey and explore the world with ease. Thousands of buses at your fingertips.
            </p>
            <div style={{ display: "flex", gap: "24px", flexDirection: "column" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "28px", minWidth: "32px" }}>✈️</span>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600" }}>Easy Booking</h3>
                  <p style={{ margin: 0, fontSize: "14px", opacity: 0.85 }}>Book your tickets in seconds</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "28px", minWidth: "32px" }}>💳</span>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600" }}>Secure Payment</h3>
                  <p style={{ margin: 0, fontSize: "14px", opacity: 0.85 }}>Safe and encrypted transactions</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "28px", minWidth: "32px" }}>🎯</span>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600" }}>Best Prices</h3>
                  <p style={{ margin: 0, fontSize: "14px", opacity: 0.85 }}>Get the best deals on your routes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="card" style={{ width: "100%", maxWidth: "420px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)", borderRadius: "16px", padding: "48px 40px", backgroundColor: "#fff" }}>
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🚌</div>
              <h2 style={{ marginBottom: "8px", fontSize: "28px", fontWeight: "700", color: "#2d3436", margin: "0 0 8px 0" }}>Welcome Back</h2>
              <p style={{ fontSize: "14px", color: "#636e72", margin: 0 }}>Sign in to your account</p>
            </div>

            {message && (
              <div className={`message ${msgType}`} style={{ marginBottom: "20px", display: "flex", alignItems: "center", padding: "12px 16px", borderRadius: "8px", fontSize: "14px" }}>
                {msgType === "success" ? "✅" : "❌"} {message}
              </div>
            )}

            <form className="form" onSubmit={handleLogin}>
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label style={{ fontWeight: "600", marginBottom: "8px", display: "block", color: "#2d3436", fontSize: "14px" }}>Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  style={{ padding: "12px 14px", border: "2px solid #e9ecef", borderRadius: "8px", fontSize: "14px", transition: "all 0.3s", width: "100%", boxSizing: "border-box" }}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                />
                <p style={{ fontSize: "12px", color: "#636e72", marginTop: "6px", marginBottom: 0 }}>
                  💡 <strong>Admin Tip:</strong> If you signed up as Admin, use your email with "admin-" prefix (e.g., admin-yourname@email.com)
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: "24px" }}>
                <label style={{ fontWeight: "600", marginBottom: "8px", display: "block", color: "#2d3436", fontSize: "14px" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    style={{ padding: "12px 14px", paddingRight: "40px", border: "2px solid #e9ecef", borderRadius: "8px", fontSize: "14px", transition: "all 0.3s", width: "100%", boxSizing: "border-box" }}
                    onFocus={(e) => e.target.style.borderColor = "#667eea"}
                    onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "18px",
                      padding: "4px"
                    }}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button type="submit" style={{ width: "100%", padding: "14px 16px", fontSize: "16px", fontWeight: "600", opacity: loading ? 0.7 : 1, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", transition: "all 0.3s ease" }} disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e9ecef", textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: "#636e72", margin: 0 }}>
                Don't have an account?{" "}
                <Link to="/signup" style={{ color: "#667eea", fontWeight: "700", textDecoration: "none", transition: "color 0.3s" }}>
                  Create one
                </Link>
              </p>
            </div>

            <div style={{ marginTop: "20px", padding: "16px", background: "#f0f4ff", borderRadius: "8px", border: "1px solid #e0e7ff" }}>
              <p style={{ fontWeight: "600", marginBottom: "8px", fontSize: "13px", color: "#667eea", margin: "0 0 8px 0" }}>🎯 Demo Credentials:</p>
              <p style={{ margin: "4px 0", fontSize: "12px", color: "#2d3436", fontFamily: "monospace" }}>test@example.com</p>
              <p style={{ margin: "4px 0", fontSize: "12px", color: "#2d3436", fontFamily: "monospace" }}>password123</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
