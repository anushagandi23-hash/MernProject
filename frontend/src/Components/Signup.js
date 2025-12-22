import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../config/api';

function SignupForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name.trim()) return "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords don't match";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const error = validateForm();
    if (error) {
      setMessage(error);
      setMsgType('error');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/signup`, { name, email, password });
      setMessage('✓ Signup successful! Redirecting to login...');
      setMsgType('success');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setMessage(err.response?.data || 'Signup failed. Please try again.');
      setMsgType('error');
      setLoading(false);
    }
  };

  const passwordStrength = password.length > 0 ? 
    (password.length >= 8 ? 'strong' : password.length >= 6 ? 'medium' : 'weak') : null;

  return (
    <>
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "Inter, sans-serif" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", maxWidth: 1000, width: "100%", alignItems: "center" }}>
          {/* Left Hero Section */}
          <div style={{ color: "white", paddingRight: "40px" }}>
            <h1 style={{ fontSize: "48px", fontWeight: "700", marginBottom: "24px", lineHeight: "1.2", letterSpacing: "-0.5px" }}>
              Join RedBus Today
            </h1>
            <p style={{ fontSize: "18px", opacity: 0.95, marginBottom: "40px", lineHeight: "1.7" }}>
              Create your account and start booking affordable bus tickets to your favorite destinations.
            </p>
            <div style={{ display: "flex", gap: "24px", flexDirection: "column" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "28px", minWidth: "32px" }}>🛡️</span>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600" }}>100% Safe</h3>
                  <p style={{ margin: 0, fontSize: "14px", opacity: 0.85 }}>Your data is encrypted and secure</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "28px", minWidth: "32px" }}>⚡</span>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600" }}>Instant Confirmation</h3>
                  <p style={{ margin: 0, fontSize: "14px", opacity: 0.85 }}>Get your tickets instantly</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "28px", minWidth: "32px" }}>🌍</span>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "600" }}>Travel Anywhere</h3>
                  <p style={{ margin: 0, fontSize: "14px", opacity: 0.85 }}>Thousands of routes available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="card" style={{ width: "100%", maxWidth: "420px", boxShadow: "0 25px 60px rgba(0,0,0,0.3)", borderRadius: "16px", padding: "48px 40px", backgroundColor: "#fff" }}>
            <div style={{ marginBottom: "32px" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🎫</div>
              <h2 style={{ marginBottom: "8px", fontSize: "28px", fontWeight: "700", color: "#2d3436", margin: "0 0 8px 0" }}>Create Account</h2>
              <p style={{ fontSize: "14px", color: "#636e72", margin: 0 }}>Join millions of travelers</p>
            </div>

            {message && (
              <div className={`message ${msgType}`} style={{ marginBottom: "20px", display: "flex", alignItems: "center", padding: "12px 16px", borderRadius: "8px", fontSize: "14px" }}>
                {msgType === "success" ? "✅" : "❌"} {message}
              </div>
            )}

            <form className="form" onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label style={{ fontWeight: "600", marginBottom: "8px", display: "block", color: "#2d3436", fontSize: "14px" }}>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                  style={{ padding: "12px 14px", border: "2px solid #e9ecef", borderRadius: "8px", fontSize: "14px", transition: "all 0.3s", width: "100%", boxSizing: "border-box" }}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                />
              </div>

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
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label style={{ fontWeight: "600", marginBottom: "8px", display: "block", color: "#2d3436", fontSize: "14px" }}>Password</label>
                <div style={{ position: "relative", marginBottom: "8px" }}>
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
                {passwordStrength && (
                  <div style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>Strength:</span>
                    <span style={{ 
                      fontWeight: "700",
                      color: passwordStrength === 'strong' ? '#27ae60' : passwordStrength === 'medium' ? '#f39c12' : '#e74c3c',
                      background: passwordStrength === 'strong' ? '#ecfdf5' : passwordStrength === 'medium' ? '#fffbeb' : '#fee2e2',
                      padding: "2px 8px",
                      borderRadius: "4px"
                    }}>
                      {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: "24px" }}>
                <label style={{ fontWeight: "600", marginBottom: "8px", display: "block", color: "#2d3436", fontSize: "14px" }}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  style={{ padding: "12px 14px", border: "2px solid #e9ecef", borderRadius: "8px", fontSize: "14px", transition: "all 0.3s", width: "100%", boxSizing: "border-box" }}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                />
                {confirmPassword && password !== confirmPassword && (
                  <div style={{ color: '#e74c3c', fontSize: '12px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>⚠️ Passwords don't match</div>
                )}
              </div>

              <button type="submit" style={{ width: "100%", padding: "14px 16px", fontSize: "16px", fontWeight: "600", opacity: loading ? 0.7 : 1, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", transition: "all 0.3s ease" }} disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e9ecef", textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: "#636e72", margin: 0 }}>
                Already have an account?{" "}
                <Link to="/" style={{ color: "#667eea", fontWeight: "700", textDecoration: "none", transition: "color 0.3s" }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignupForm;
