import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchBus() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!from.trim()) newErrors.from = 'Departure city is required';
    if (!to.trim()) newErrors.to = 'Destination city is required';
    if (!date) newErrors.date = 'Date is required';
    if (from === to) newErrors.to = 'Departure and destination must be different';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    const params = new URLSearchParams({ from, to, date });
    navigate(`/buses?${params.toString()}`);
  };

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <>
      <div className="header">
        <h1>🔍 Search Buses</h1>
      </div>
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="card">
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-row" style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
              gap: "12px",
              position: "relative"
            }}>
              <div className="form-group">
                <label>📍 From</label>
                <input 
                  className="input" 
                  placeholder="e.g., Delhi"
                  value={from}
                  onChange={(e) => { setFrom(e.target.value); setErrors({...errors, from: ''}) }}
                  required
                />
                {errors.from && <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>⚠️ {errors.from}</span>}
              </div>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleSwap}
                  title="Swap locations"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'white',
                    border: '2px solid #d63031',
                    color: '#d63031',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    zIndex: 10,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#d63031';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'translateX(-50%) rotate(90deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#d63031';
                    e.target.style.transform = 'translateX(-50%) rotate(0deg)';
                  }}
                >
                  ⇄
                </button>
              </div>

              <div className="form-group">
                <label>📍 To</label>
                <input 
                  className="input" 
                  placeholder="e.g., Mumbai"
                  value={to}
                  onChange={(e) => { setTo(e.target.value); setErrors({...errors, to: ''}) }}
                  required
                />
                {errors.to && <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>⚠️ {errors.to}</span>}
              </div>

              <div className="form-group">
                <label>📅 Date</label>
                <input 
                  className="input" 
                  type="date"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setErrors({...errors, date: ''}) }}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.date && <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px' }}>⚠️ {errors.date}</span>}
              </div>
            </div>

            <button className="btn" type="submit" style={{ width: "100%", marginTop: "8px" }}>
              🔍 Search Buses
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default SearchBus;
