/**
 * TypeScript Interfaces and Types
 * Defines all data structures used in the application
 */

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Bus {
  id: number;
  busNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  totalSeats: number;
  availableSeatsCount: number;
  occupancyPercentage: number;
}

export interface BusDetails {
  id: number;
  busNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  totalSeats: number;
  availableSeatsCount: number;
  occupancyPercentage: number;
  availableSeats: number[];
  reservedSeats?: number[];
  bookedSeats: number[];
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

export interface Booking {
  id: number;
  busId: number;
  busNumber: string;
  from: string;
  to: string;
  seatsBooked: number[];
  status: BookingStatus;
  totalPrice: number;
  createdAt: string;
}

export interface SeatInfo {
  totalSeats: number;
  availableCount: number;
  bookedCount: number;
  reservedCount: number;
  availableSeats: number[];
  bookedSeats: number[];
  reservedSeats: number[];
  occupancyPercentage: number;
  comment?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface BookingResponse {
  success: boolean;
  message?: string;
  booking?: {
    id: number;
    status: BookingStatus;
    seatsBooked: number[];
    totalPrice: number;
  };
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface BusContextType {
  buses: Bus[];
  filteredBuses: Bus[];
  selectedBus: BusDetails | null;
  seatInfo: SeatInfo | null;
  loading: boolean;
  error: string | null;
  fetchBuses: () => Promise<void>;
  searchBuses: (from: string, to: string) => Promise<void>;
  getBusDetails: (id: number) => Promise<void>;
}

export interface BookingContextType {
  bookings: Booking[];
  selectedSeats: number[];
  loading: boolean;
  error: string | null;
  bookingStatus: BookingStatus | null;
  currentBookingId: number | null;
  toggleSeat: (seatNumber: number) => void;
  clearSelectedSeats: () => void;
  createBooking: (busId: number, seats: number[]) => Promise<{ bookingId: number }>;
  confirmBooking: (bookingId: number) => Promise<void>;
  cancelBooking: (bookingId: number) => Promise<void>;
  fetchUserBookings: () => Promise<void>;
}
