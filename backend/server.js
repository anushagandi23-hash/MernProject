require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('./config/database');
const { Op } = require('sequelize');
const User = require('./models/User');
const Bus = require('./models/bus');
const Trip = require('./models/Trip');
const { Booking, BOOKING_STATUS } = require('./models/Booking');
const { Seat, SEAT_STATUS } = require('./models/Seat');
const BookingService = require('./services/BookingService');
const TripService = require('./services/TripService');
const BookingExpiryService = require('./services/BookingExpiryService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
console.log("SERVER STARTED");
// ============================================
// MODELS ASSOCIATIONS
// ============================================
User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Trip, { foreignKey: 'createdBy' });
Trip.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Bus.hasMany(Booking, { foreignKey: 'busId' });
Booking.belongsTo(Bus, { foreignKey: 'busId' });

Bus.hasMany(Seat, { foreignKey: 'busId' });
Seat.belongsTo(Bus, { foreignKey: 'busId' });

Bus.hasMany(Trip, { foreignKey: 'busId' });
Trip.belongsTo(Bus, { foreignKey: 'busId' });

Trip.hasMany(Booking, { foreignKey: 'tripId' });
Booking.belongsTo(Trip, { foreignKey: 'tripId' });

Booking.hasMany(Seat, { foreignKey: 'bookingId' });
Seat.belongsTo(Booking, { foreignKey: 'bookingId' });

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
//comment***
// const auth = (req, res, next) => {
//   const token = req.header('Authorization');

  // if (!token) {
  //   return res.status(401).json({ 
  //     success: false, 
  //     error: 'Access denied. No token provided.' 
  //   });
  // }
  const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.'
    });
  }
   const token = authHeader.split(' ')[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;   // { userId, email, role }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }};

  // try {
  //   const verified = jwt.verify(token, process.env.JWT_SECRET);
  //   req.user = verified;
  //   next();
//   } catch (err) {
//     res.status(400).json({ 
//       success: false, 
//       error: 'Invalid or expired token' 
//     });
//   }
// };

/**
 * Admin authorization middleware
 * Check if user is admin (for now, using a simple check - in production use role-based approach)
 */
// const adminAuth = async (req, res, next) => {
  // try {
  //   const user = await User.findByPk(req.user.userId);
  //   // For demo, check if user email contains 'admin' or user ID is 1
  //   if (!user || (user.id !== 1 && !user.email.includes('admin'))) {
  //     return res.status(403).json({
  //       success: false,
  //       error: 'Admin access required'
  //     });
  //   }
  //   req.user.isAdmin = true;
  //   next();
  // } 

//   catch (error) {
//     return res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// };
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// ============================================
// AUTHENTICATION ROUTES
// ============================================

/**
 * POST /signup
 * Register new user
 */
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already registered' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      userId: user.id 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /login
 * Authenticate user and return JWT token
 */
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email , role:user.role},
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      success: true, 
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============================================
// BUS ROUTES
// ============================================

/**
 * POST /buses
 * Create a new bus (Admin)
 */
app.post('/buses', auth, async (req, res) => {
  try {
    const {
      busNumber,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      totalSeats = 40
    } = req.body;

    // Validation
    if (!busNumber || !from || !to || !departureTime || !arrivalTime || !price) {
      return res.status(400).json({ 
        success: false, 
        error: 'All bus fields are required' 
      });
    }

    if (totalSeats < 1 || totalSeats > 200) {
      return res.status(400).json({ 
        success: false, 
        error: 'Total seats must be between 1 and 200' 
      });
    }

    // Check if bus number already exists
    const existingBus = await Bus.findOne({ where: { busNumber } });
    if (existingBus) {
      return res.status(400).json({ 
        success: false, 
        error: 'Bus number already exists' 
      });
    }

    const bus = await Bus.create({
      busNumber,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      totalSeats
    });

    // Initialize seats for the bus
    await BookingService.initializeSeats(bus.id, totalSeats);

    res.status(201).json({ 
      success: true, 
      message: 'Bus created successfully',
      bus: {
        id: bus.id,
        busNumber: bus.busNumber,
        from: bus.from,
        to: bus.to,
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
        price: bus.price,
        totalSeats: bus.totalSeats
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /buses
 * Get all buses
 */
app.get('/buses', async (req, res) => {
  try {
    const buses = await Bus.findAll({
      order: [['createdAt', 'DESC']]
    });

    // Add occupancy info to each bus
    const busesWithOccupancy = await Promise.all(
      buses.map(async (bus) => {
        const seatInfo = await BookingService.getAvailableSeats(bus.id);
        return {
          id: bus.id,
          busNumber: bus.busNumber,
          busName: bus.busName,
          from: bus.from,
          to: bus.to,
          departureTime: bus.departureTime,
          arrivalTime: bus.arrivalTime,
          price: bus.price,
          totalSeats: bus.totalSeats,
          availableSeats: seatInfo.availableCount,
          occupancyPercentage: seatInfo.occupancyPercentage
        };
      })
    );

    res.json({ 
      success: true, 
      data: busesWithOccupancy 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /cities
 * Get all available cities from trips
 */
app.get('/cities', async (req, res) => {
  try {
    const trips = await Trip.findAll({
      where: { status: 'ACTIVE' },
      attributes: ['from', 'to'],
      raw: true
    });

    // Get unique cities from both 'from' and 'to'
    const citiesSet = new Set();
    trips.forEach(trip => {
      if (trip.from) citiesSet.add(trip.from);
      if (trip.to) citiesSet.add(trip.to);
    });

    const cities = Array.from(citiesSet).sort();

    res.json({
      success: true,
      data: cities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /trips/search
 * Search trips by from, to locations and travel date
 * Returns trips for a specific date with available seats
 */
app.get('/trips/search', async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to) {
      return res.status(400).json({ 
        success: false, 
        error: 'From and to locations are required' 
      });
    }

    if (!date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Travel date is required' 
      });
    }

    // Parse the date (should be in YYYY-MM-DD format)
    const travelDate = new Date(date);
    const nextDate = new Date(travelDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Find trips for the specified date
    const trips = await Trip.findAll({
      where: {
        from: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('from')),
          'LIKE',
          `%${from.toLowerCase()}%`
        ),
        to: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('to')),
          'LIKE',
          `%${to.toLowerCase()}%`
        ),
        status: 'ACTIVE',
        startTime: {
          [Op.gte]: travelDate,
          [Op.lt]: nextDate
        }
      },
      order: [['startTime', 'ASC']]
    });

    // Add seat availability info
    const tripsWithSeats = await Promise.all(
      trips.map(async (trip) => {
        const bus = await Bus.findByPk(trip.busId);
        const seatInfo = await BookingService.getAvailableSeats(trip.busId, trip.id);
        return {
          id: trip.id,
          busId: trip.busId,
          busNumber: bus?.busNumber || '',
          busName: trip.busName,
          from: trip.from,
          to: trip.to,
          startTime: trip.startTime,
          endTime: trip.endTime,
          pricePerSeat: trip.pricePerSeat,
          totalSeats: trip.totalSeats,
          availableSeats: seatInfo.availableCount,
          occupancyPercentage: seatInfo.occupancyPercentage
        };
      })
    );

    res.json({ 
      success: true, 
      count: tripsWithSeats.length,
      data: tripsWithSeats 
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /buses/search
 * Search buses by from and to locations
 */
app.get('/buses/search', async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ 
        success: false, 
        error: 'From and to locations are required' 
      });
    }

    const buses = await Bus.findAll({
      where: {
        from: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('from')),
          'LIKE',
          `%${from.toLowerCase()}%`
        ),
        to: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('to')),
          'LIKE',
          `%${to.toLowerCase()}%`
        )
      },
      order: [['departureTime', 'ASC']]
    });

    // Add occupancy info
    const busesWithOccupancy = await Promise.all(
      buses.map(async (bus) => {
        const seatInfo = await BookingService.getAvailableSeats(bus.id);
        return {
          id: bus.id,
          busNumber: bus.busNumber,
          busName: bus.busName,
          from: bus.from,
          to: bus.to,
          departureTime: bus.departureTime,
          arrivalTime: bus.arrivalTime,
          price: bus.price,
          totalSeats: bus.totalSeats,
          availableSeats: seatInfo.availableCount,
          occupancyPercentage: seatInfo.occupancyPercentage
        };
      })
    );

    res.json({ 
      success: true, 
      data: busesWithOccupancy 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /buses/:id
 * Get bus details with seat information
 */
app.get('/buses/:id', async (req, res) => {
  try {
    const bus = await Bus.findByPk(req.params.id);
    if (!bus) {
      return res.status(404).json({ 
        success: false, 
        error: 'Bus not found' 
      });
    }

    const seatInfo = await BookingService.getAvailableSeats(bus.id);

    res.json({ 
      success: true, 
      data: {
        id: bus.id,
        busNumber: bus.busNumber,
        busName: bus.busName,
        from: bus.from,
        to: bus.to,
        departureTime: bus.departureTime,
        arrivalTime: bus.arrivalTime,
        price: bus.price,
        totalSeats: bus.totalSeats,
        availableSeats: seatInfo.availableSeats,
        reservedSeats: seatInfo.reservedSeats,
        bookedSeats: seatInfo.bookedSeats,
        occupancyPercentage: seatInfo.occupancyPercentage
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /buses/:id/seats
 * Get seat availability for a bus
 */
app.get('/buses/:id/seats', async (req, res) => {
  try {
    const seatInfo = await BookingService.getAvailableSeats(req.params.id);
    res.json({ 
      success: true, 
      data: seatInfo 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============================================
// BOOKING ROUTES
// ============================================

/**
 * POST /buses/:id/book
 * Book seats on a bus - WITH CONCURRENCY CONTROL
 * Handles race conditions and prevents overbooking
 */
app.post('/buses/:id/book', auth, async (req, res) => {
  try {
    const { seats } = req.body;
    const busId = parseInt(req.params.id);
    const userId = req.user.userId;

    // Validation
    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Seats must be a non-empty array' 
      });
    }

    // Use BookingService for atomic booking with transaction
    const result = await BookingService.createBooking(userId, busId, seats);

    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        error: result.message 
      });
    }

    res.status(201).json({ 
      success: true, 
      message: result.message,
      booking: {
        id: result.bookingId,
        status: result.status,
        seatsBooked: result.seatsBooked,
        totalPrice: result.totalPrice
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /bookings/:id
 * Get booking details
 */
app.get('/bookings/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }

    // Check if user is authorized to view this booking
    if (booking.userId !== req.user.userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized to view this booking' 
      });
    }

    res.json({ 
      success: true, 
      data: {
        id: booking.id,
        busId: booking.busId,
        seatsBooked: booking.seatsBooked,
        status: booking.status,
        totalPrice: booking.totalPrice,
        createdAt: booking.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /user/bookings
 * Get all bookings for authenticated user
 */
app.get('/user/bookings', auth, async (req, res) => {
  try {
    const { status } = req.query; // Optional: filter by status (CONFIRMED, PENDING, etc.)
    
    const userId = req.user.userId;
    console.log(`📋 Fetching bookings for user ${userId} with status filter: ${status}`);

    const whereClause = { userId: userId };
    if (status) {
      whereClause.status = status;
    }

    const bookings = await Booking.findAll({
      where: whereClause,
      include: [
        {
          model: Bus,
          attributes: ['id', 'busNumber', 'busName', 'from', 'to', 'departureTime', 'arrivalTime', 'price', 'totalSeats']
        },
        {
          model: Trip,
          attributes: ['id', 'busName', 'startTime', 'endTime', 'from', 'to', 'pricePerSeat']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Found ${bookings.length} bookings for user ${userId}`);

    const bookingsData = bookings.map(b => {
      // Parse seatsBooked if it's a string (JSON)
      const seatsBooked = typeof b.seatsBooked === 'string' 
        ? JSON.parse(b.seatsBooked) 
        : (Array.isArray(b.seatsBooked) ? b.seatsBooked : []);
      
      const numberOfSeats = seatsBooked.length || 0;
      const pricePerSeat = numberOfSeats > 0 ? b.totalPrice / numberOfSeats : 0;

      return {
        id: b.id,
        busId: b.busId,
        tripId: b.tripId,
        busNumber: b.Bus?.busNumber || 'N/A',
        busName: b.Trip?.busName || b.Bus?.busName || 'N/A',
        from: b.Trip?.from || b.Bus?.from || 'N/A',
        to: b.Trip?.to || b.Bus?.to || 'N/A',
        departureTime: b.Trip?.startTime || b.Bus?.departureTime || null,
        arrivalTime: b.Trip?.endTime || b.Bus?.arrivalTime || null,
        seatsBooked: seatsBooked,
        numberOfSeats: numberOfSeats,
        status: b.status,
        totalPrice: parseFloat(b.totalPrice) || 0,
        pricePerSeat: pricePerSeat,
        createdAt: b.createdAt,
        bookingDate: new Date(b.createdAt).toLocaleDateString('en-IN'),
        bookingTime: new Date(b.createdAt).toLocaleTimeString('en-IN')
      };
    });

    console.log(`📤 Returning bookings data:`, bookingsData);

    res.json({ 
      success: true,
      count: bookingsData.length,
      data: bookingsData 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============================================
// TRIP MANAGEMENT ROUTES (Admin)
// ============================================

/**
 * POST /trips/create
 * Create a new trip (Admin only)
 * Body: { busId, busName, startTime, endTime, from, to, totalSeats, pricePerSeat }
 */
app.post('/trips/create', auth, adminAuth, async (req, res) => {
  try {
    const { busId, busName, startTime, endTime, from, to, totalSeats, pricePerSeat } = req.body;

    // Detailed validation logging for debugging
    console.log('Trip Creation Request Body:', JSON.stringify({
      busId: [busId, typeof busId, Boolean(busId)],
      busName: [busName, typeof busName, Boolean(busName)],
      startTime: [startTime, typeof startTime, Boolean(startTime)],
      endTime: [endTime, typeof endTime, Boolean(endTime)],
      from: [from, typeof from, Boolean(from)],
      to: [to, typeof to, Boolean(to)],
      totalSeats: [totalSeats, typeof totalSeats, Boolean(totalSeats)],
      pricePerSeat: [pricePerSeat, typeof pricePerSeat, Boolean(pricePerSeat)]
    }, null, 2));

    // Validation
    // if (!busId || !busName || !startTime || !endTime || !from || !to || !totalSeats || !pricePerSeat) {
    if (
  busId === undefined ||
  !busName ||
  !startTime ||
  !endTime ||
  !from ||
  !to ||
  totalSeats === undefined ||
  pricePerSeat === undefined
) {

      const missing = [];
      if (!busId) missing.push(`busId (received: ${busId})`);
      if (!busName) missing.push(`busName (received: ${busName})`);
      if (!startTime) missing.push(`startTime (received: ${startTime})`);
      if (!endTime) missing.push(`endTime (received: ${endTime})`);
      if (!from) missing.push(`from (received: ${from})`);
      if (!to) missing.push(`to (received: ${to})`);
      if (!totalSeats) missing.push(`totalSeats (received: ${totalSeats})`);
      if (!pricePerSeat) missing.push(`pricePerSeat (received: ${pricePerSeat})`);
      
      const errorMsg = `Validation error: Missing or invalid fields: ${missing.join(', ')}`;
      console.error(errorMsg);
      
      return res.status(400).json({
        success: false,
        error: errorMsg
      });
    }
const result = await TripService.createTrip({
  busId: parseInt(busId),
  busName,
  startTime: new Date(startTime),
  endTime: new Date(endTime),
  from,
  to,
  totalSeats: parseInt(totalSeats),
  pricePerSeat: parseFloat(pricePerSeat),
  createdBy: req.user.userId
});

    console.log('TripService result:', JSON.stringify(result, null, 2));

    if (!result.success) {
      console.error('Trip creation failed:', result.message);
      return res.status(400).json({
        success: false,
        error: result.message
      });
    }

    console.log('Trip created successfully:', result.trip.id);
    res.status(201).json({
      success: true,
      message: result.message,
      trip: result.trip
    });
  } catch (error) {
    console.error('Trip creation endpoint error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /trips
 * Get all available trips with optional filters
 * Query params: from, to, startDate, endDate, onlyAvailable
 */
app.get('/trips', async (req, res) => {
  try {
    const filters = {
      from: req.query.from,
      to: req.query.to,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      onlyAvailable: req.query.onlyAvailable !== 'false'
    };

    // Remove undefined values from filters
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    const trips = await TripService.getAvailableTrips(filters);
    
    console.log('✅ Trips fetched:', trips.length, 'trips');
    if (trips.length > 0) {
      console.log('📋 First trip:', {
        id: trips[0].id,
        busName: trips[0].busName,
        from: trips[0].from,
        to: trips[0].to
      });
    }

    res.json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /trips/:id
 * Get trip details with seat information
 */
app.get('/trips/:id', async (req, res) => {
  try {
    const trip = await TripService.getTripDetails(parseInt(req.params.id));

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    if (error.message === 'Trip not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /trips/:id/book
 * Book seats on a trip (with concurrency control)
 * Body: { seats: [1, 2, 3] }
 */
app.post('/trips/:id/book', auth, async (req, res) => {
  try {
    const { seats } = req.body;
    const tripId = parseInt(req.params.id);
    const userId = req.user.userId;

    // Validation
    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Seats must be a non-empty array'
      });
    }

    // Get trip details
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Use BookingService for atomic booking with transaction
    const result = await BookingService.createBooking(userId, trip.busId, seats, tripId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message
      });
    }

    // Update trip available seats
    await TripService.updateAvailableSeats(tripId, seats.length);

    res.status(201).json({
      success: true,
      message: result.message,
      booking: {
        id: result.bookingId,
        tripId: tripId,
        status: result.status,
        seatsBooked: result.seatsBooked,
        totalPrice: result.totalPrice
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /trips/admin/all
 * Get all trips for admin dashboard
 */
app.get('/trips/admin/all', auth, adminAuth, async (req, res) => {
  try {
    const trips = await TripService.getAllTripsForAdmin();

    res.json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// BOOKING EXPIRY ROUTES
// ============================================

/**
 * POST /bookings/expire-check
 * Manually trigger booking expiry check (Admin only)
 * Normally this runs on a schedule
 */
app.post('/bookings/expire-check', auth, adminAuth, async (req, res) => {
  try {
    const result = await BookingExpiryService.checkAndExpireBookings();

    res.json({
      success: result.success,
      message: result.message,
      expiredCount: result.expiredCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /bookings/:id/expiry-status
 * Get expiry status of a booking
 */
app.get('/bookings/:id/expiry-status', auth, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this booking'
      });
    }

    const expiryStatus = await BookingExpiryService.getBookingExpiryStatus(req.params.id);

    res.json({
      success: true,
      data: expiryStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /bookings/:id/confirm
 * Confirm a pending booking (after payment succeeds)
 * Changes booking status from PENDING -> CONFIRMED
 * Changes seat status from RESERVED -> BOOKED
 */
app.post('/bookings/:id/confirm', auth, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to confirm this booking'
      });
    }

    // Confirm the booking (updates PENDING -> CONFIRMED, RESERVED -> BOOKED)
    const result = await BookingExpiryService.confirmBooking(req.params.id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message
      });
    }

    res.json({
      success: true,
      message: result.message,
      booking: {
        id: result.bookingId,
        status: result.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /bookings/:id/cancel
 * Cancel a pending booking
 */
app.post('/bookings/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check authorization
    if (booking.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this booking'
      });
    }

    const result = await BookingExpiryService.cancelPendingBooking(req.params.id);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message
      });
    }

    res.json({
      success: true,
      message: result.message,
      bookingId: result.bookingId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Ticket Booking API - Backend running',
    version: '1.0.0'
  });
});

// Database & SERVER START
// ============================================
const PORT = process.env.PORT || 5000;

// Job scheduler for booking expiry (runs every 1 minute)
let expiryJobInterval;

// Use alter: true on first run to create tables, then change to alter: false to prevent duplicate constraints
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ PostgreSQL database synced');

    app.listen(PORT, () => {
      console.log(`✅ Express server running on port ${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}`);
      
      // Start booking expiry checker job every 60 seconds
      expiryJobInterval = setInterval(async () => {
        try {
          const result = await BookingExpiryService.checkAndExpireBookings();
          if (result.expiredCount > 0) {
            console.log(`⏰ Booking Expiry Job: ${result.message}`);
          }
        } catch (error) {
          console.error('❌ Error in expiry job:', error.message);
        }
      }, 60000); // Run every 60 seconds

      console.log('⏰ Booking expiry checker started (runs every 60 seconds)');
    });
  })
  .catch(err => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', () => {
  if (expiryJobInterval) {
    clearInterval(expiryJobInterval);
  }
  console.log('\n👋 Server shutting down gracefully');
  process.exit(0);
});

