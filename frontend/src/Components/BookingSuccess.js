import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { busId, tripId, seats, bookingId } = location.state || {};
  
  // Accept either busId (old) or tripId (new)
  const id = bookingId || busId || tripId;

  useEffect(() => {
    if (!seats || !id) {
      navigate('/search');
    }
  }, [seats, id, navigate]);

  if (!seats || !id) {
    return (
      <>
        <div className="header">
          <h1>🚌 RedBus Clone</h1>
        </div>
        <div className="container" style={{ minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center" }}>
          <div className="card" style={{ backgroundColor: "#fee2e2", borderColor: "#fecaca", maxWidth: 500 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>
              <h3 style={{ color: "#c53030", marginBottom: "8px" }}>No Booking Data</h3>
              <p style={{ color: "#636e72", marginBottom: "20px" }}>Please complete a booking first</p>
              <button className="btn" onClick={() => navigate("/search")}>Search Buses</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="header">
        <h1>🚌 RedBus Clone</h1>
      </div>
      <div className="container" style={{ maxWidth: 600, minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center" }}>
        <div className="card" style={{ 
          background: "linear-gradient(135deg, #f8f9fa 0%, #fff 100%)",
          borderLeft: "5px solid #27ae60",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
        }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{
              fontSize: "60px",
              animation: "scaleIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
              marginBottom: "16px"
            }}>
              ✅
            </div>
            <h2 style={{ color: "#27ae60", marginBottom: "8px" }}>Booking Confirmed!</h2>
            <p style={{ color: "#636e72", fontSize: "14px" }}>Your tickets have been booked successfully</p>
          </div>

          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #e9ecef"
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "16px"
            }}>
              <div style={{
                padding: "16px",
                background: "#f0f4ff",
                borderRadius: "6px",
                borderLeft: "3px solid #3498db"
              }}>
                <div style={{ fontSize: "12px", color: "#636e72", marginBottom: "4px" }}>Booking ID</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#2d3436", fontFamily: "monospace" }}>
                  {id}
                </div>
              </div>

              <div style={{
                padding: "16px",
                background: "#f0fff4",
                borderRadius: "6px",
                borderLeft: "3px solid #27ae60"
              }}>
                <div style={{ fontSize: "12px", color: "#636e72", marginBottom: "4px" }}>No. of Seats</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#27ae60" }}>
                  {seats.length}
                </div>
              </div>
            </div>

            <div style={{
              padding: "16px",
              background: "#fff5f0",
              borderRadius: "6px",
              borderLeft: "3px solid #e17055"
            }}>
              <div style={{ fontSize: "12px", color: "#636e72", marginBottom: "8px" }}>Seats Booked</div>
              <div style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#2d3436",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px"
              }}>
                {seats.map((seat, idx) => (
                  <span key={idx} style={{
                    background: "#d63031",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}>
                    {seat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            background: "#fffbeb",
            padding: "16px",
            borderRadius: "6px",
            border: "1px solid #fcd34d",
            marginBottom: "20px",
            fontSize: "13px",
            color: "#92400e"
          }}>
            ℹ️ A confirmation email with your ticket details will be sent shortly.
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="btn"
            style={{ width: "100%" }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </>
  );
}

export default BookingSuccess;
