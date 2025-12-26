import React, { createContext, useContext, useState, ReactNode } from 'react';
import api from '../config/api';
import { Booking, BookingStatus, BookingContextType } from '../types';
import { useAuth } from './AuthContext';

const BookingContext = createContext<BookingContextType | undefined>(undefined);

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState<number | null>(null);

  const toggleSeat = (seatNumber: number): void => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber].sort((a, b) => a - b)
    );
  };

  const clearSelectedSeats = (): void => {
    setSelectedSeats([]);
  };

  const createBooking = async (busId: number, seats: number[]): Promise<{ bookingId: number }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/buses/${busId}/book`, { seats });

      if (response.data.success) {
        const bookingId = response.data.booking.id;
        setCurrentBookingId(bookingId);
        setBookingStatus(response.data.booking.status);
        clearSelectedSeats();
        return { bookingId };
      } else {
        const errorMsg = response.data.error || 'Booking failed';
        setError(errorMsg);
        setBookingStatus('FAILED');
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Booking failed';
      setError(errorMsg);
      setBookingStatus('FAILED');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = async (bookingId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/bookings/${bookingId}/confirm`);

      if (response.data.success) {
        setBookingStatus('CONFIRMED');
        setCurrentBookingId(bookingId);
        // Update bookings list with new status
        await fetchUserBookings();
      } else {
        const errorMsg = response.data.error || 'Confirmation failed';
        setError(errorMsg);
        setBookingStatus('FAILED');
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Confirmation failed';
      setError(errorMsg);
      setBookingStatus('FAILED');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/bookings/${bookingId}/cancel`);

      if (response.data.success) {
        setBookingStatus('FAILED');
        setCurrentBookingId(null);
        // Update bookings list
        await fetchUserBookings();
      } else {
        const errorMsg = response.data.error || 'Cancellation failed';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Cancellation failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async (): Promise<void> => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/user/bookings');
      if (response.data.success) {
        setBookings(response.data.data);
      } else {
        setError(response.data.error || 'Failed to fetch bookings');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const getBookingDetails = async (bookingId: number): Promise<Booking | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      if (response.data.success) {
        return response.data.data;
      } else {
        setError(response.data.error || 'Failed to fetch booking');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch booking');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        selectedSeats,
        loading,
        error,
        bookingStatus,
        currentBookingId,
        toggleSeat,
        clearSelectedSeats,
        createBooking,
        confirmBooking,
        cancelBooking,
        fetchUserBookings
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};
