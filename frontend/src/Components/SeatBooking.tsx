import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBus } from '../contexts/BusContext';
import { useBooking } from '../contexts/BookingContext';
import '../styles/SeatBooking.css';

interface CountdownTimer {
  minutes: number;
  seconds: number;
}

const SeatBooking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBusDetails, selectedBus, seatInfo, loading: busLoading, error: busError } = useBus();
  const {
    selectedSeats,
    toggleSeat,
    clearSelectedSeats,
    createBooking,
    confirmBooking,
    loading: bookingLoading,
    error: bookingError,
    bookingStatus,
    currentBookingId
  } = useBooking();

  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [countdown, setCountdown] = useState<CountdownTimer>({ minutes: 2, seconds: 0 });
  const [isBookingCreated, setIsBookingCreated] = useState(false);

  // Load bus details on mount
  useEffect(() => {
    if (id) {
      getBusDetails(parseInt(id));
    }
  }, [id, getBusDetails]);

  // Countdown timer for pending booking
  useEffect(() => {
    if (!isBookingCreated) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev.minutes === 0 && prev.seconds === 0) {
          clearInterval(interval);
          setMessage('⏰ Booking expired! Please book again.');
          setMessageType('error');
          setIsBookingCreated(false);
          setShowConfirmation(false);
          clearSelectedSeats();
          return prev;
        }

        if (prev.seconds === 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return { minutes: prev.minutes, seconds: prev.seconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBookingCreated, clearSelectedSeats]);

  const handleBookSeats = async () => {
    if (selectedSeats.length === 0) {
      setMessage('Please select at least one seat');
      setMessageType('error');
      return;
    }

    try {
      setMessage('Creating booking...');
      setMessageType('info');
      const result = await createBooking(parseInt(id!), selectedSeats);
      
      if (result.bookingId) {
        setIsBookingCreated(true);
        setShowConfirmation(true);
        setCountdown({ minutes: 2, seconds: 0 });
        setMessage('✅ Booking created! Confirm your payment within 2 minutes.');
        setMessageType('success');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Booking failed';
      setMessage(errorMsg);
      setMessageType('error');
    }
  };

  const handleConfirmBooking = async () => {
    if (!currentBookingId) {
      setMessage('No active booking to confirm');
      setMessageType('error');
      return;
    }

    try {
      setMessage('Confirming payment...');
      setMessageType('info');
      await confirmBooking(currentBookingId);
      
      setMessage('✅ Booking confirmed! Payment successful.');
      setMessageType('success');
      setShowConfirmation(false);
      
      setTimeout(() => {
        navigate('/booking-success', {
          state: { bookingId: currentBookingId, seats: selectedSeats }
        });
      }, 1500);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Confirmation failed';
      setMessage(errorMsg);
      setMessageType('error');
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    clearSelectedSeats();
    setIsBookingCreated(false);
    setMessage('');
  };

  if (busLoading) {
    return (
      <div className="seat-booking-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading bus details...</p>
        </div>
      </div>
    );
  }

  if (busError || !selectedBus || !seatInfo) {
    return (
      <div className="seat-booking-container">
        <div className="error-state">
          <h2>⚠️ Unable to load bus</h2>
          <p>{busError || 'Please try again'}</p>
          <button onClick={() => navigate('/')}>Go Back</button>
        </div>
      </div>
    );
  }

  const occupancyPercentage = seatInfo.occupancyPercentage || 0;
  const totalBooked = seatInfo.bookedCount + seatInfo.reservedCount;
  const totalPrice = selectedSeats.length * selectedBus.price;

  return (
    <div className="seat-booking-container">
      <div className="seat-booking-header">
        <h1>🚌 {selectedBus.busNumber}</h1>
        <p className="route">
          {selectedBus.from} → {selectedBus.to}
        </p>
        <p className="time">
          {new Date(selectedBus.departureTime).toLocaleString()}
        </p>
      </div>

      <div className="seat-booking-content">
        {/* Left: Seat Grid */}
        <div className="seat-section">
          {/* Stats */}
          <div className="seat-stats">
            <div className="stat-box">
              <div className="stat-number">{seatInfo.availableCount}</div>
              <div className="stat-label">Available</div>
            </div>
            <div className="stat-box reserved">
              <div className="stat-number">{seatInfo.reservedCount}</div>
              <div className="stat-label">Reserved</div>
            </div>
            <div className="stat-box booked">
              <div className="stat-number">{seatInfo.bookedCount}</div>
              <div className="stat-label">Booked</div>
            </div>
            <div className="stat-box occupied">
              <div className="stat-number">{occupancyPercentage}%</div>
              <div className="stat-label">Occupied</div>
            </div>
          </div>

          {/* Legend */}
          <div className="seat-legend">
            <div className="legend-item">
              <div className="seat-preview available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="seat-preview selected"></div>
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <div className="seat-preview reserved"></div>
              <span>Reserved</span>
            </div>
            <div className="legend-item">
              <div className="seat-preview booked"></div>
              <span>Booked</span>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`message-box ${messageType}`}>
              <p>{message}</p>
            </div>
          )}

          {/* Seats Grid */}
          <div className="seats-grid">
            {Array.from({ length: seatInfo.totalSeats }, (_, i) => {
              const seatNum = i + 1;
              const isAvailable = seatInfo.availableSeats.includes(seatNum);
              const isReserved = seatInfo.reservedSeats?.includes(seatNum) || false;
              const isBooked = seatInfo.bookedSeats.includes(seatNum);
              const isSelected = selectedSeats.includes(seatNum);

              let seatClass = 'seat';
              if (isBooked) seatClass += ' booked';
              else if (isReserved) seatClass += ' reserved';
              else if (isSelected) seatClass += ' selected';
              else if (isAvailable) seatClass += ' available';

              return (
                <button
                  key={seatNum}
                  className={seatClass}
                  onClick={() => isAvailable && toggleSeat(seatNum)}
                  disabled={!isAvailable}
                  title={
                    isBooked ? 'Booked' :
                    isReserved ? 'Reserved (temporary hold)' :
                    isSelected ? 'Selected' :
                    isAvailable ? 'Available' :
                    'Unavailable'
                  }
                >
                  {seatNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Booking Summary */}
        <div className="booking-summary">
          <div className="summary-card">
            <h3>Booking Summary</h3>

            <div className="summary-row">
              <span>Bus:</span>
              <span className="value">{selectedBus.busNumber}</span>
            </div>

            <div className="summary-row">
              <span>Route:</span>
              <span className="value">{selectedBus.from} → {selectedBus.to}</span>
            </div>

            <div className="summary-row">
              <span>Price per Seat:</span>
              <span className="value">₹{selectedBus.price}</span>
            </div>

            <div className="divider"></div>

            <div className="summary-row">
              <span>Selected Seats:</span>
              <span className="value">
                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
              </span>
            </div>

            <div className="summary-row">
              <span>Number of Seats:</span>
              <span className="value">{selectedSeats.length}</span>
            </div>

            <div className="divider"></div>

            <div className="summary-row total">
              <span>Total Price:</span>
              <span className="value">₹{totalPrice}</span>
            </div>

            {/* Countdown Timer */}
            {isBookingCreated && (
              <div className="countdown-box">
                <p>Confirm payment in:</p>
                <div className="timer">
                  {String(countdown.minutes).padStart(2, '0')}:
                  {String(countdown.seconds).padStart(2, '0')}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="button-group">
              {!showConfirmation ? (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={handleBookSeats}
                    disabled={selectedSeats.length === 0 || bookingLoading || isBookingCreated}
                  >
                    {bookingLoading ? '⏳ Booking...' : '📝 Book Seats'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      clearSelectedSeats();
                      setMessage('');
                    }}
                  >
                    Clear Selection
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-success"
                    onClick={handleConfirmBooking}
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? '⏳ Confirming...' : '✅ Confirm Payment'}
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleCancel}
                    disabled={bookingLoading}
                  >
                    ❌ Cancel Booking
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatBooking;
