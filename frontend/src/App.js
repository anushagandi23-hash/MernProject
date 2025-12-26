import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BusProvider } from './contexts/BusContext';
import { BookingProvider } from './contexts/BookingContext';
import Login from './Components/Login';
import Signup from './Components/Signup';
import Dashboard from './Components/Dashboard';
import BusList from './Components/BusList';
import SearchBus from './Components/SearchBus';
import SeatBooking from './Components/SeatBooking';
import BookingSuccess from './Components/BookingSuccess';
import MyBookings from './Components/MyBookings';
import AdminDashboard from './Components/AdminDashboard';
import './App.css';

// Protected Route component - requires authentication
interface ProtectedRouteProps {
  element: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/" />;
};

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
      <Route path="/buses" element={<ProtectedRoute element={<BusList />} />} />
      <Route path="/search" element={<ProtectedRoute element={<SearchBus />} />} />
      <Route path="/booking/:id" element={<ProtectedRoute element={<SeatBooking />} />} />
      <Route path="/booking-success" element={<ProtectedRoute element={<BookingSuccess />} />} />
      <Route path="/my-bookings" element={<ProtectedRoute element={<MyBookings />} />} />
      <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BusProvider>
        <BookingProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </BookingProvider>
      </BusProvider>
    </AuthProvider>
  );
}

export default App;

