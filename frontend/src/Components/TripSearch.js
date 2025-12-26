import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/TripSearch.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * TripSearch Component
 * Allows users to search and filter available trips
 */
const TripSearch = ({ onTripSelect }) => {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    startDate: '',
    endDate: ''
  });

  // Fetch all available trips
  const fetchTrips = async (filterParams = {}) => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (filterParams.from) queryParams.append('from', filterParams.from);
      if (filterParams.to) queryParams.append('to', filterParams.to);
      if (filterParams.startDate) queryParams.append('startDate', filterParams.startDate);
      if (filterParams.endDate) queryParams.append('endDate', filterParams.endDate);
      queryParams.append('onlyAvailable', 'true');

      const response = await axios.get(
        `${API_BASE_URL}/trips?${queryParams.toString()}`
      );

      if (response.data.success) {
        setTrips(response.data.data);
        setFilteredTrips(response.data.data);
      } else {
        setError('Failed to fetch trips');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching trips');
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTrips();
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters
  const handleSearch = (e) => {
    e.preventDefault();
    fetchTrips(filters);
  };

  // Reset filters
  const handleReset = () => {
    setFilters({
      from: '',
      to: '',
      startDate: '',
      endDate: ''
    });
    fetchTrips();
  };

  return (
    <div className="trip-search-container">
      <h2>Search Trips</h2>

      {error && <div className="error-message">{error}</div>}

      {/* Filter Form */}
      <form className="search-form" onSubmit={handleSearch}>
        <div className="form-row">
          <div className="form-group">
            <label>From</label>
            <input
              type="text"
              name="from"
              value={filters.from}
              onChange={handleFilterChange}
              placeholder="Origin city"
            />
          </div>
          <div className="form-group">
            <label>To</label>
            <input
              type="text"
              name="to"
              value={filters.to}
              onChange={handleFilterChange}
              placeholder="Destination city"
            />
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <div className="button-group">
          <button type="submit" className="btn btn-primary">Search</button>
          <button type="button" className="btn btn-secondary" onClick={handleReset}>Reset</button>
        </div>
      </form>

      {/* Trips List */}
      <div className="trips-container">
        {loading && <div className="loading">Loading trips...</div>}
        
        {!loading && filteredTrips.length === 0 && (
          <div className="no-results">No trips found matching your criteria</div>
        )}

        {!loading && filteredTrips.length > 0 && (
          <div>
            <p className="trip-count">Found {filteredTrips.length} trip(s)</p>
            <div className="trips-grid">
              {filteredTrips.map(trip => (
                <div key={trip.id} className="trip-card">
                  <div className="trip-header">
                    <h3>{trip.busName}</h3>
                    <span className="status-badge">{trip.status}</span>
                  </div>
                  
                  <div className="trip-details">
                    <div className="route">
                      <span className="location-from">{trip.from}</span>
                      <span className="route-arrow">→</span>
                      <span className="location-to">{trip.to}</span>
                    </div>

                    <div className="time-info">
                      <div className="time">
                        <label>Departure:</label>
                        <span>{new Date(trip.startTime).toLocaleString()}</span>
                      </div>
                      <div className="time">
                        <label>Arrival:</label>
                        <span>{new Date(trip.endTime).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="seats-info">
                      <div className="seat-stat">
                        <label>Total Seats:</label>
                        <span>{trip.totalSeats}</span>
                      </div>
                      <div className="seat-stat">
                        <label>Available:</label>
                        <span className="available">{trip.availableSeats}</span>
                      </div>
                      <div className="seat-stat">
                        <label>Booked:</label>
                        <span className="booked">{trip.totalSeats - trip.availableSeats}</span>
                      </div>
                    </div>

                    <div className="price">
                      <label>Price per Seat:</label>
                      <span className="price-value">₹{parseFloat(trip.pricePerSeat).toFixed(2)}</span>
                    </div>
                  </div>

                  <button 
                    className="btn btn-select"
                    onClick={() => onTripSelect(trip)}
                    disabled={trip.availableSeats === 0}
                  >
                    {trip.availableSeats === 0 ? 'Fully Booked' : 'Book Trip'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripSearch;
