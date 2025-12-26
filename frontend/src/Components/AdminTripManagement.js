import React, { useState, useEffect } from 'react';
import api from '../config/api';
import '../styles/AdminTripManagement.css';


/**
 * AdminTripManagement Component
 * Allows admins to create and manage bus trips
 */
const AdminTripManagement = () => {
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    busId: '',
    busName: '',
    startTime: '',
    endTime: '',
    from: '',
    to: '',
    totalSeats: '40',
    pricePerSeat: ''
  });

  // Fetch all trips
  const fetchTrips = async () => {
    setLoading(true);
    try {
      
      const response = await api.get('/trips/admin/all');

      if (response.data.success) {
        setTrips(response.data.data);
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching trips');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all buses
  const fetchBuses = async () => {
    try {
     const response = await api.get('/buses');
      if (response.data.success) {
        setBuses(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching buses:', err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTrips();
    fetchBuses();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle bus selection
  const handleBusSelect = (e) => {
    const busId = parseInt(e.target.value);
    const selectedBus = buses.find(b => b.id === busId);
    if (selectedBus) {
      setFormData(prev => ({
        ...prev,
        busId: selectedBus.id,
        busName: selectedBus.busNumber
      }));
    }
  };

  // Handle form submission
  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.busId) {
      setError('Please select a bus');
      return;
    }
    if (!formData.busName) {
      setError('Bus name is required');
      return;
    }
    if (!formData.from) {
      setError('Departure location is required');
      return;
    }
    if (!formData.to) {
      setError('Destination location is required');
      return;
    }
    if (!formData.startTime) {
      setError('Start time is required');
      return;
    }
    if (!formData.endTime) {
      setError('End time is required');
      return;
    }
    if (!formData.totalSeats || parseInt(formData.totalSeats) < 1) {
      setError('Total seats must be at least 1');
      return;
    }
    if (!formData.pricePerSeat || parseFloat(formData.pricePerSeat) < 0) {
      setError('Price per seat must be specified');
      return;
    }

    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);
    if (endDate <= startDate) {
      setError('End time must be after start time');
      return;
    }

    setCreating(true);

    try {
      const payload = {
        busId: parseInt(formData.busId),
        busName: formData.busName,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        from: formData.from,
        to: formData.to,
        totalSeats: parseInt(formData.totalSeats),
        pricePerSeat: parseFloat(formData.pricePerSeat)
      };

      console.log('Sending trip creation payload:', payload);

      const response = await api.post('/trips/create', payload);


      console.log('Trip creation response:', response);

      // Handle both successful responses and 204 No Content
      if (response.status === 201 || response.status === 204 || (response.data && response.data.success)) {
        setSuccessMessage('Trip created successfully!');
        setFormData({
          busId: '',
          busName: '',
          startTime: '',
          endTime: '',
          from: '',
          to: '',
          totalSeats: '40',
          pricePerSeat: ''
        });
        setShowCreateForm(false);
        fetchTrips();

        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Error creating trip';
      const statusCode = err.response?.status;
      setError(`Error (${statusCode}): ${errorMsg}`);
      console.error('Trip creation error:', {
        status: statusCode,
        data: err.response?.data,
        message: err.message,
        payload: {
          busId: formData.busId,
          busName: formData.busName,
          startTime: formData.startTime,
          endTime: formData.endTime,
          from: formData.from,
          to: formData.to,
          totalSeats: formData.totalSeats,
          pricePerSeat: formData.pricePerSeat
        }
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="admin-trip-management">
      <h2>Trip Management</h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {/* Create Trip Button */}
      <div className="management-toolbar">
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Create New Trip'}
        </button>
      </div>

      {/* Create Trip Form */}
      {showCreateForm && (
        <div className="create-trip-form">
          <h3>Create New Trip</h3>
          <form onSubmit={handleCreateTrip}>
            <div className="form-group">
              <label>Bus *</label>
              <select
                name="busId"
                value={formData.busId}
                onChange={handleBusSelect}
                required
              >
                <option value="">Select a bus</option>
                {buses.map(bus => (
                  <option key={bus.id} value={bus.id}>
                    {bus.busNumber} (ID: {bus.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Trip Name *</label>
              <input
                type="text"
                name="busName"
                value={formData.busName}
                onChange={handleInputChange}
                placeholder="e.g., Express 101"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>From Location *</label>
                <input
                  type="text"
                  name="from"
                  value={formData.from}
                  onChange={handleInputChange}
                  placeholder="Departure city"
                  required
                />
              </div>
              <div className="form-group">
                <label>To Location *</label>
                <input
                  type="text"
                  name="to"
                  value={formData.to}
                  onChange={handleInputChange}
                  placeholder="Destination city"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time *</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time *</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Total Seats *</label>
                <input
                  type="number"
                  name="totalSeats"
                  value={formData.totalSeats}
                  onChange={handleInputChange}
                  min="1"
                  max="200"
                  required
                />
              </div>
              <div className="form-group">
                <label>Price per Seat *</label>
                <input
                  type="number"
                  name="pricePerSeat"
                  value={formData.pricePerSeat}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="100.00"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-success"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Trip'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trips List */}
      <div className="trips-management-section">
        <h3>All Trips ({trips.length})</h3>

        {loading && <div className="loading">Loading trips...</div>}

        {!loading && trips.length === 0 && (
          <div className="no-data">No trips created yet</div>
        )}

        {!loading && trips.length > 0 && (
          <div className="trips-table-wrapper">
            <table className="trips-table">
              <thead>
                <tr>
                  <th>Trip ID</th>
                  <th>Bus Name</th>
                  <th>Route</th>
                  <th>Start Time</th>
                  <th>Total Seats</th>
                  <th>Available</th>
                  <th>Price/Seat</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {trips.map(trip => (
                  <tr key={trip.id}>
                    <td className="trip-id">#{trip.id}</td>
                    <td className="bus-name">{trip.busName}</td>
                    <td className="route">
                      {trip.from} → {trip.to}
                    </td>
                    <td className="datetime">
                      {new Date(trip.startTime).toLocaleString()}
                    </td>
                    <td className="seats-total">{trip.totalSeats}</td>
                    <td className="seats-available">
                      <span className={trip.availableSeats === 0 ? 'full' : ''}>
                        {trip.availableSeats}
                      </span>
                    </td>
                    <td className="price">
                      ₹{parseFloat(trip.pricePerSeat).toFixed(2)}
                    </td>
                    <td className="status">
                      <span className={`badge ${trip.status.toLowerCase()}`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="created">
                      {new Date(trip.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTripManagement;
