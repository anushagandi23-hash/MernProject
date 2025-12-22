import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import API_URL from "../config/api";

function SeatBooking() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [availableSeats, setAvailableSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalSeats, setTotalSeats] = useState(0);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/buses/${id}/seats`)
      .then(res => {
        setAvailableSeats(res.data.availableSeats);
        setBookedSeats(res.data.bookedSeats);
        setTotalSeats(res.data.totalSeats || 0);
        setLoading(false);
      })
      .catch(err => {
        setMessage("Failed to load seats");
        setMsgType("error");
        setLoading(false);
      });
  }, [id]);

  const toggleSeat = (seat) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats(prev =>
      prev.includes(seat)
        ? prev.filter(s => s !== seat)
        : [...prev, seat]
    );
  };

  const bookSeats = async () => {
    if (selectedSeats.length === 0) return;
    setBookingLoading(true);
    setMessage("");
    
    try {
      await axios.post(
        `${API_URL}/buses/${id}/book`,
        { seats: selectedSeats },
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      
      setMessage("Booking successful! Redirecting...");
      setMsgType("success");
      
      setTimeout(() => {
        navigate("/booking-success", {
          state: { busId: id, seats: selectedSeats }
        });
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed. Please try again.");
      setMsgType("error");
      setBookingLoading(false);
    }
  };

  const occupancyRate = ((bookedSeats.length / totalSeats) * 100).toFixed(0);

  if (loading) {
    return (
      <>
        <div className="header"><h1>⏳ Loading Seats...</h1></div>
        <div className="container" style={{ textAlign: "center" }}>
          <div className="card" style={{ padding: "40px" }}>
            <div style={{ fontSize: "24px", animation: "pulse 1.5s infinite" }}>🚌</div>
            <p style={{ marginTop: "16px", color: "#636e72" }}>Fetching available seats...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="header">
        <h1>🪑 Select Your Seats</h1>
      </div>
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="card">
          {/* Stats Section */}
          <div className="stats">
            <div className="stat-item">
              <div className="stat-value">{availableSeats.length}</div>
              <div className="stat-label">Available</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: "#27ae60" }}>{selectedSeats.length}</div>
              <div className="stat-label">Selected</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: "#e74c3c" }}>{bookedSeats.length}</div>
              <div className="stat-label">Booked</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{occupancyRate}%</div>
              <div className="stat-label">Occupied</div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ 
            display: "flex", 
            gap: "20px", 
            marginBottom: "24px", 
            flexWrap: "wrap",
            padding: "14px",
            background: "#f8f9fa",
            borderRadius: "8px",
            fontSize: "13px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "32px", height: "32px", background: "white", border: "2px solid #dfe6e9", borderRadius: "6px" }}></div>
              <span style={{ fontWeight: "600" }}>Available</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "32px", height: "32px", background: "#5cb85c", borderRadius: "6px" }}></div>
              <span style={{ fontWeight: "600" }}>Selected</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "32px", height: "32px", background: "#d9534f", borderRadius: "6px" }}></div>
              <span style={{ fontWeight: "600" }}>Booked</span>
            </div>
          </div>

          {/* Seats Grid */}
          <div className="seats-grid">
            {Array.from({ length: totalSeats || 40 }, (_, i) => i + 1).map((seat) => {
              const isBooked = bookedSeats.includes(seat);
              const isSelected = selectedSeats.includes(seat);
              return (
                <button
                  key={seat}
                  onClick={() => toggleSeat(seat)}
                  disabled={isBooked}
                  className="seat-btn"
                  title={isBooked ? "Seat unavailable" : isSelected ? "Click to deselect" : "Click to select"}
                  style={{
                    backgroundColor: isBooked ? "#d9534f" : isSelected ? "#5cb85c" : "white",
                    color: isBooked || isSelected ? "white" : "#333",
                    borderColor: isSelected ? "#5cb85c" : "#dfe6e9",
                  }}
                >
                  {seat}
                </button>
              );
            })}
          </div>

          {/* Selected Seats Summary */}
          <div style={{ 
            marginTop: "24px", 
            padding: "16px", 
            background: "#f8f9fa", 
            borderRadius: "8px",
            border: "1px solid #dfe6e9"
          }}>
            <h4 style={{ marginBottom: "8px", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Selected Seats
            </h4>
            <p style={{ 
              fontSize: "18px", 
              color: selectedSeats.length === 0 ? "#636e72" : "#d63031", 
              fontWeight: "800"
            }}>
              {selectedSeats.length === 0 ? "No seats selected yet" : selectedSeats.sort((a, b) => a - b).join(", ")}
            </p>
          </div>

          {message && (
            <div className={`message ${msgType}`} style={{ marginTop: "16px" }}>
              {msgType === "success" ? "✓" : "✕"} {message}
            </div>
          )}

          <button
            className="btn"
            onClick={bookSeats}
            disabled={selectedSeats.length === 0 || bookingLoading}
            style={{ 
              width: "100%", 
              marginTop: "20px", 
              padding: "14px",
              fontSize: "15px",
              fontWeight: "700"
            }}
          >
            {bookingLoading ? "Processing..." : `Confirm Booking • ${selectedSeats.length} Seat${selectedSeats.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </>
  );
}

export default SeatBooking;
