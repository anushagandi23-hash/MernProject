import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function SearchBus() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState({});
  const [cities, setCities] = useState([]);
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch cities on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get(`${API_URL}/cities`);
        if (response.data.success) {
          setCities(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  // Filter cities based on search input
  const filteredFromCities = cities.filter(city =>
    city.toLowerCase().includes(fromSearch.toLowerCase())
  );

  const filteredToCities = cities.filter(city =>
    city.toLowerCase().includes(toSearch.toLowerCase())
  );

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
    setFromSearch(to);
    setToSearch(from);
  };

  const handleFromSelect = (city) => {
    setFrom(city);
    setFromSearch(city);
    setShowFromDropdown(false);
    setErrors({ ...errors, from: '' });
  };

  const handleToSelect = (city) => {
    setTo(city);
    setToSearch(city);
    setShowToDropdown(false);
    setErrors({ ...errors, to: '' });
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
              {/* From City Dropdown */}
              <div className="form-group" style={{ position: 'relative' }}>
                <label>📍 From</label>
                <input 
                  className="input" 
                  placeholder="Select or type city"
                  value={fromSearch}
                  onChange={(e) => {
                    setFromSearch(e.target.value);
                    setFrom(e.target.value);
                    setErrors({ ...errors, from: '' });
                    setShowFromDropdown(true);
                  }}
                  onFocus={() => setShowFromDropdown(true)}
                  autoComplete="off"
                />
                {showFromDropdown && filteredFromCities.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #ddd',
                    borderTop: 'none',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 100,
                    borderRadius: '0 0 4px 4px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}>
                    {filteredFromCities.map((city, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleFromSelect(city)}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          backgroundColor: from === city ? '#f0f0f0' : 'white',
                          borderBottom: '1px solid #eee',
                          fontSize: '14px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = from === city ? '#f0f0f0' : 'white'}
                      >
                        ✓ {city}
                      </div>
                    ))}
                  </div>
                )}
                {errors.from && <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>⚠️ {errors.from}</span>}
              </div>

              {/* Swap Button */}
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

              {/* To City Dropdown */}
              <div className="form-group" style={{ position: 'relative' }}>
                <label>📍 To</label>
                <input 
                  className="input" 
                  placeholder="Select or type city"
                  value={toSearch}
                  onChange={(e) => {
                    setToSearch(e.target.value);
                    setTo(e.target.value);
                    setErrors({ ...errors, to: '' });
                    setShowToDropdown(true);
                  }}
                  onFocus={() => setShowToDropdown(true)}
                  autoComplete="off"
                />
                {showToDropdown && filteredToCities.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #ddd',
                    borderTop: 'none',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 100,
                    borderRadius: '0 0 4px 4px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}>
                    {filteredToCities.map((city, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleToSelect(city)}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          backgroundColor: to === city ? '#f0f0f0' : 'white',
                          borderBottom: '1px solid #eee',
                          fontSize: '14px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = to === city ? '#f0f0f0' : 'white'}
                      >
                        ✓ {city}
                      </div>
                    ))}
                  </div>
                )}
                {errors.to && <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>⚠️ {errors.to}</span>}
              </div>

              {/* Date Input */}
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
                {errors.date && <span style={{ color: '#e74c3c', fontSize: '12px', marginTop: '4px', display: 'block' }}>⚠️ {errors.date}</span>}
              </div>
            </div>

            <button className="btn" type="submit" style={{ width: "100%", marginTop: "8px" }} disabled={loading}>
              {loading ? '⏳ Loading cities...' : '🔍 Search Buses'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default SearchBus;
