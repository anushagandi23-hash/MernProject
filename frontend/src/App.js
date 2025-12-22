import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/Login';
import Signup from './Components/Signup';
import Dashboard from './Components/Dashboard';
import BusList from './Components/BusList';
import SearchBus from './Components/SearchBus';
import SeatBooking from './Components/SeatBooking';
import BookingSuccess from './Components/BookingSuccess';
import AdminDashboard from './Components/AdminDashboard';

// Protected Route component
const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem('token');
  return token ? element : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/buses" element={<ProtectedRoute element={<BusList />} />} />
        <Route path="/search" element={<ProtectedRoute element={<SearchBus />} />} />
        <Route path="/seats/:id" element={<ProtectedRoute element={<SeatBooking />} />} />
        <Route path="/booking-success" element={<ProtectedRoute element={<BookingSuccess />} />} />
        <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
