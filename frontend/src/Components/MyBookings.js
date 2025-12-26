import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/MyBookings.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * MyBookings Component
 * Displays all confirmed bookings for the logged-in user
 * Shows bus details, seat numbers, and booking status
 */
function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // Show all status by default
  const [sortBy, setSortBy] = useState('recent'); // Sort by recent/oldest

  const filterAndSortBookings = useCallback(() => {
    let filtered = bookings.filter(b => !statusFilter || b.status === statusFilter);

    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    console.log('🔍 Filtered bookings:', filtered.length, 'from', bookings.length);
    setFilteredBookings(filtered);
  }, [bookings, statusFilter, sortBy]);

  useEffect(() => {
    console.log('🔄 MyBookings component mounted');
    fetchBookings();
  }, []);

  useEffect(() => {
    filterAndSortBookings();
  }, [filterAndSortBookings]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view your bookings');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_URL}/user/bookings`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('📥 API Response:', response.data);

      if (response.data.success) {
        console.log('✅ Bookings data:', response.data.data);
        setBookings(response.data.data || []);
      } else {
        setError(response.data.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching bookings');
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return '#27ae60'; // Green
      case 'PENDING':
        return '#f39c12'; // Orange
      case 'FAILED':
        return '#e74c3c'; // Red
      case 'CANCELLED':
        return '#95a5a6'; // Gray
      default:
        return '#3498db'; // Blue
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return '✓';
      case 'PENDING':
        return '⏳';
      case 'FAILED':
        return '✕';
      case 'CANCELLED':
        return '−';
      default:
        return '•';
    }
  };

  if (loading) {
    return (
      <div className="my-bookings-container">
        <div className="header">
          <h1>📋 My Bookings</h1>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-container">
      <div className="header">
        <h1>📋 My Bookings</h1>
        <button className="btn-refresh" onClick={fetchBookings} title="Refresh bookings">
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Debug Info */}
      <div style={{ background: '#fff3cd', padding: '15px', margin: '10px', fontSize: '14px', borderRadius: '4px', border: '2px solid #ffc107' }}>
        <strong>🔍 DEBUG INFO:</strong><br/>
        📊 Total Bookings from API: <strong>{bookings.length}</strong><br/>
        📊 Filtered Bookings: <strong>{filteredBookings.length}</strong><br/>
        🏷️ Status Filter: <strong>"{statusFilter}" (empty = all)</strong><br/>
        {filteredBookings.length === 0 && bookings.length > 0 && <span style={{color: 'red'}}>⚠️ Filter is hiding all bookings!</span>}
      </div>

      {/* Filters and Sort */}
      {bookings.length > 0 && (
        <div className="controls">
          <div className="filter-group">
            <label>Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="CONFIRMED">✓ Confirmed</option>
              <option value="PENDING">⏳ Pending</option>
              <option value="FAILED">✕ Failed</option>
              <option value="CANCELLED">− Cancelled</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <div className="count">
            {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h2>No Bookings Found</h2>
          <p>
            {bookings.length === 0
              ? "You haven't made any bookings yet."
              : `You don't have any ${statusFilter} bookings.`}
          </p>
        </div>
      ) : (
        <div className="bookings-list">
          {console.log('🎫 Rendering', filteredBookings.length, 'bookings')}
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              {/* Status Badge */}
              <div
                className="status-badge"
                style={{ backgroundColor: getStatusBadgeColor(booking.status) }}
              >
                <span className="status-icon">{getStatusIcon(booking.status)}</span>
                <span className="status-text">{booking.status}</span>
              </div>

              {/* Booking Header */}
              <div className="booking-header">
                <div className="route-info">
                  <div className="location from">{booking.from}</div>
                  <div className="arrow">→</div>
                  <div className="location to">{booking.to}</div>
                </div>
                <div className="booking-id">
                  <small>Booking ID: {booking.id}</small>
                </div>
              </div>

              {/* Bus Details */}
              <div className="bus-details">
                <div className="detail-row">
                  <span className="label">Bus Number:</span>
                  <span className="value">{booking.busNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Departure:</span>
                  <span className="value">
                    {new Date(booking.departureTime).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Arrival:</span>
                  <span className="value">
                    {new Date(booking.arrivalTime).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Seats Information */}
              <div className="seats-section">
                <h4>Seat Numbers</h4>
                <div className="seats-display">
                  {booking.seatsBooked && booking.seatsBooked.length > 0 ? (
                    <div className="seats-list">
                      {booking.seatsBooked.sort((a, b) => a - b).map((seat) => (
                        <span key={seat} className="seat-badge">
                          {seat}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="no-seats">No seats information available</p>
                  )}
                  <div className="seats-count">
                    Total: <strong>{booking.numberOfSeats}</strong> seat{booking.numberOfSeats !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Price Information */}
              <div className="price-section">
                <div className="price-row">
                  <span>Price per Seat:</span>
                  <span className="price">₹{booking.pricePerSeat.toFixed(2)}</span>
                </div>
                <div className="price-row total">
                  <span>Total Price:</span>
                  <span className="price">₹{booking.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Booking Date */}
              <div className="booking-date">
                <small>
                  Booked on: {booking.bookingDate} at {booking.bookingTime}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;
