import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";

function BusList() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const from = params.get('from') || '';
    const to = params.get('to') || '';

    // Search for Trips (which are created by admins) instead of Buses
    const url = (from && to) 
      ? `${API_URL}/trips?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}` 
      : `${API_URL}/trips`;

    setLoading(true);
    axios.get(url)
      .then(res => setBuses(res.data?.data || []))
      .catch((err) => {
        console.error('Error fetching trips:', err);
        setBuses([]);
      })
      .finally(() => setLoading(false));
  }, [location.search]);

  const sortedBuses = [...buses].sort((a, b) => {
    if (sortBy === 'price') return a.pricePerSeat - b.pricePerSeat;
    if (sortBy === 'departure') return new Date(a.startTime) - new Date(b.startTime);
    if (sortBy === 'availability') return b.availableSeats - a.availableSeats;
    return 0;
  });

  if (loading) {
    return (
      <>
        <div className="header"><h1>⏳ Loading Buses...</h1></div>
        <div className="container">
          <div className="card" style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "32px", animation: "pulse 1.5s infinite" }}>🚌</div>
            <p style={{ marginTop: "16px", color: "#636e72", fontWeight: "500" }}>Finding buses for you...</p>
          </div>
        </div>
      </>
    );
  }

  if (buses.length === 0) {
    return (
      <>
        <div className="header"><h1>🚌 Available Buses</h1></div>
        <div className="container">
          <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>😕</div>
            <h2 style={{ marginBottom: "8px" }}>No Buses Found</h2>
            <p style={{ color: "#636e72", marginBottom: "24px" }}>We couldn't find any buses for your search. Try different dates or routes.</p>
            <button className="btn" onClick={() => navigate("/search")}>🔍 Search Again</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="header">
        <h1>🚌 Available Buses</h1>
      </div>
      <div className="container">
        {/* Filter/Sort Bar */}
        <div className="card" style={{ marginBottom: "20px", padding: "14px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontWeight: "700", fontSize: "13px", textTransform: "uppercase" }}>Sort By:</span>
            {['price', 'departure', 'availability'].map(option => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                style={{
                  padding: "8px 14px",
                  border: "2px solid " + (sortBy === option ? "#d63031" : "#dfe6e9"),
                  background: sortBy === option ? "#d63031" : "white",
                  color: sortBy === option ? "white" : "#636e72",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "12px",
                  transition: "all 0.3s ease",
                  textTransform: "capitalize"
                }}
              >
                {option === 'price' && '💰'} {option === 'departure' && '⏰'} {option === 'availability' && '🪑'} {option}
              </button>
            ))}
            <span style={{ marginLeft: "auto", fontSize: "12px", color: "#636e72", fontWeight: "600" }}>
              {buses.length} bus{buses.length !== 1 ? 'es' : ''} found
            </span>
          </div>
        </div>

        {/* Buses List */}
        <div className="list">
          {sortedBuses.map((bus, idx) => {
            const available = bus.availableSeats || 0;
            const booked = bus.totalSeats - available;
            const occupancyPercent = ((booked / bus.totalSeats) * 100).toFixed(0);
            
            return (
              <div key={bus.id} className="card" style={{ animation: `slideInUp 0.5s ease-out ${idx * 0.1}s both` }}>
                <div className="row">
                  <div style={{ flex: 1 }}>
                    <p className="route">
                      {bus.from} <span style={{ color: "#d63031", fontSize: "16px" }}>→</span> {bus.to}
                    </p>
                    <p className="time">⏰ {new Date(bus.startTime).toLocaleString()} to {new Date(bus.endTime).toLocaleString()}</p>
                    
                    {/* Availability Bar */}
                    <div style={{ marginTop: "10px", display: "flex", gap: "8px", alignItems: "center" }}>
                      <div style={{
                        flex: 1,
                        height: "6px",
                        background: "#e9ecef",
                        borderRadius: "3px",
                        overflow: "hidden"
                      }}>
                        <div style={{
                          width: `${occupancyPercent}%`,
                          height: "100%",
                          background: occupancyPercent > 80 ? "#e74c3c" : occupancyPercent > 50 ? "#f39c12" : "#27ae60",
                          transition: "width 0.3s ease"
                        }}></div>
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#636e72", minWidth: "50px" }}>
                        {available}/{bus.totalSeats}
                      </span>
                    </div>
                  </div>
                  <div className="meta">
                    <p className="price">₹{bus.pricePerSeat}</p>
                    <button
                      className="btn"
                      onClick={() => navigate(`/booking/${bus.id}`)}
                      style={{
                        padding: "9px 14px",
                        fontSize: "13px",
                        opacity: available > 0 ? 1 : 0.6,
                        pointerEvents: available > 0 ? "auto" : "none"
                      }}
                    >
                      {available > 0 ? "🪑 Select Seats" : "Full"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default BusList;
