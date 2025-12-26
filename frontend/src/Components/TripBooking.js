import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/TripBooking.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * TripBooking Component
 * Allows users to select seats and book a trip
 * Implements seat selection with real-time availability
 */
const TripBooking = ({ trip, token, onBookingSuccess, onCancel }) => {
  const [tripDetails, setTripDetails] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch trip details with seat information
  useEffect(() => {
    const fetchTripDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/trips/${trip.id}`
        );
        if (response.data.success) {
          setTripDetails(response.data.data);
          setError('');
        } else {
          setError('Failed to fetch trip details');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Error fetching trip details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [trip.id]);

  // Handle seat selection
  const toggleSeat = (seatNumber) => {
    const seatInfo = tripDetails.seatMap[seatNumber];
    
    // Cannot select booked or reserved seats
    if (seatInfo.booked || seatInfo.reserved) {
      return;
    }

    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(s => s !== seatNumber);
      } else {
        return [...prev, seatNumber];
      }
    });
  };

  // Calculate total price
  const totalPrice = selectedSeats.length * parseFloat(trip.pricePerSeat);

  // Handle booking submission
  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    setBooking(true);
    setError('');

    try {
      // Step 1: Create the booking (PENDING status)
      const response = await axios.post(
        `${API_BASE_URL}/trips/${trip.id}/book`,
        {
          seats: selectedSeats.sort((a, b) => a - b)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Booking failed');
      }

      const bookingId = response.data.booking.id;

      // Step 2: Immediately confirm the booking to mark seats as BOOKED
      const confirmResponse = await axios.post(
        `${API_BASE_URL}/bookings/${bookingId}/confirm`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (confirmResponse.data.success) {
        setSuccessMessage(`Booking confirmed! Booking ID: ${bookingId}`);
        setTimeout(() => {
          onBookingSuccess({
            id: bookingId,
            tripId: trip.id,
            status: 'CONFIRMED',
            seatsBooked: selectedSeats,
            totalPrice: response.data.booking.totalPrice
          });
        }, 2000);
      } else {
        throw new Error(confirmResponse.data.error || 'Failed to confirm booking');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error during booking');
      console.error('Error:', err);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="trip-booking-container">
        <div className="loading">Loading trip details...</div>
      </div>
    );
  }

  if (!tripDetails) {
    return (
      <div className="trip-booking-container">
        <div className="error-message">Failed to load trip details</div>
        <button className="btn btn-secondary" onClick={onCancel}>Back</button>
      </div>
    );
  }

  // Create seat grid (e.g., 10 columns)
  const seatsPerRow = 10;
  const seatGrid = [];
  for (let i = 1; i <= tripDetails.totalSeats; i++) {
    seatGrid.push(i);
  }

  return (
    <div className="trip-booking-container">
      <div className="booking-header">
        <h2>Book Seats - {tripDetails.busName}</h2>
        <button className="btn-close" onClick={onCancel}>✕</button>
      </div>

      <div className="booking-info">
        <div className="route-info">
          <div className="route">
            <span className="location">{tripDetails.from}</span>
            <span className="arrow">→</span>
            <span className="location">{tripDetails.to}</span>
          </div>
          <div className="datetime">
            <span>{new Date(tripDetails.startTime).toLocaleString()}</span>
          </div>
        </div>

        <div className="seat-stats">
          <div className="stat">
            <label>Total:</label>
            <span>{tripDetails.totalSeats}</span>
          </div>
          <div className="stat">
            <label>Available:</label>
            <span>{tripDetails.availableSeats}</span>
          </div>
          <div className="stat">
            <label>Price/Seat:</label>
            <span>₹{parseFloat(tripDetails.pricePerSeat).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {/* Seat Selection */}
      <div className="seats-section">
        <div className="legend">
          <div className="legend-item">
            <div className="seat-box available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="seat-box booked"></div>
            <span>Booked</span>
          </div>
          <div className="legend-item">
            <div className="seat-box selected"></div>
            <span>Selected</span>
          </div>
        </div>

        <div className="seats-grid">
          {seatGrid.map((seatNum) => {
            const seatInfo = tripDetails.seatMap[seatNum];
            const isSelected = selectedSeats.includes(seatNum);
            const isBooked = seatInfo.booked;
            const isReserved = seatInfo.reserved;

            return (
              <button
                key={seatNum}
                className={`seat ${
                  isBooked || isReserved ? 'booked' : ''
                } ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleSeat(seatNum)}
                disabled={isBooked || isReserved}
                title={`Seat ${seatNum}${isBooked ? ' (Booked)' : ''}`}
              >
                {seatNum}
              </button>
            );
          })}
        </div>
      </div>

      {/* Booking Summary */}
      <div className="booking-summary">
        <div className="summary-section">
          <h3>Selected Seats</h3>
          {selectedSeats.length === 0 ? (
            <p className="no-selection">No seats selected</p>
          ) : (
            <div className="selected-seats">
              {selectedSeats.sort((a, b) => a - b).join(', ')}
            </div>
          )}
        </div>

        <div className="summary-section">
          <div className="summary-row">
            <span>Number of Seats:</span>
            <strong>{selectedSeats.length}</strong>
          </div>
          <div className="summary-row">
            <span>Price per Seat:</span>
            <strong>₹{parseFloat(trip.pricePerSeat).toFixed(2)}</strong>
          </div>
          <div className="summary-row total">
            <span>Total Price:</span>
            <strong>₹{totalPrice.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="booking-actions">
        <button 
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={booking}
        >
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleBooking}
          disabled={selectedSeats.length === 0 || booking}
        >
          {booking ? 'Processing...' : 'Confirm Booking'}
        </button>
      </div>

      {/* Booking Confirmation Info */}
      <div className="booking-note">
        <p>
          <strong>Note:</strong> Your booking will be held for 2 minutes. 
          Please complete the payment within this time to confirm your seats.
        </p>
      </div>
    </div>
  );
};

export default TripBooking;
