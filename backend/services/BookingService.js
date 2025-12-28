const sequelize = require('../config/database');
const { Sequelize } = require('sequelize');
const { Booking, BOOKING_STATUS } = require('../models/Booking');
const { Seat, SEAT_STATUS } = require('../models/Seat');
const Bus = require('../models/bus');

/**
 * Booking Service - Handles all booking operations with concurrency control
 * Uses database transactions and row-level locking to prevent race conditions
 * Implements booking expiry mechanism (PENDING bookings expire after 2 minutes)
 */

class BookingService {
  /**
   * Create a new booking with atomic seat assignment
   * Uses transaction and SELECT FOR UPDATE to lock seats during booking
   * Implements SERIALIZABLE isolation level for maximum consistency
   * @param {number} userId - User ID
   * @param {number} busId - Bus ID
   * @param {array} seatNumbers - Seats to book
   * @param {number} tripId - Trip ID (optional)
   * @returns {object} Booking result with status
   */
  static async createBooking(userId, busId, seatNumbers, tripId = null) {
    const transaction = await sequelize.transaction({
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    });

    try {
      // Validate bus exists
      const bus = await Bus.findByPk(busId, { transaction });
      if (!bus) {
        throw new Error('Bus not found');
      }

      // Validate seat numbers
      const invalidSeats = seatNumbers.filter(
        seat => seat < 1 || seat > bus.totalSeats
      );
      if (invalidSeats.length > 0) {
        throw new Error(`Invalid seat numbers: ${invalidSeats.join(', ')}`);
      }

      // Lock all requested seats for atomic read-check-write operation
      // This prevents race conditions during concurrent bookings
      // SELECT FOR UPDATE ensures row-level exclusive locks
      // If tripId provided, use it; otherwise use busId (backward compatibility)
      const whereClause = {
        seatNumber: seatNumbers,
        ...(tripId ? { tripId } : { busId })
      };
      
      const existingSeats = await Seat.findAll({
        where: whereClause,
        transaction,
        lock: Sequelize.Transaction.LOCK.UPDATE // Row-level exclusive lock
      });

      // Check if any seat is already booked
      const bookedSeats = existingSeats.filter(
        s => s.status === SEAT_STATUS.BOOKED
      );
      if (bookedSeats.length > 0) {
        throw new Error(
          `Seats already booked: ${bookedSeats.map(s => s.seatNumber).join(', ')}`
        );
      }

      // Check for reserved seats (prevent double booking)
      const reservedSeats = existingSeats.filter(
        s => s.status === SEAT_STATUS.RESERVED
      );
      if (reservedSeats.length > 0) {
        throw new Error(
          `Seats temporarily reserved: ${reservedSeats.map(s => s.seatNumber).join(', ')}`
        );
      }

      // Calculate total price
      const totalPrice = bus.price * seatNumbers.length;

      // Calculate expiry time (2 minutes from now)
      const expiryTime = new Date(Date.now() + 2 * 60 * 1000);

      // Create booking with PENDING status
      const booking = await Booking.create(
        {
          userId,
          busId,
          tripId, // Include tripId if provided
          seatsBooked: seatNumbers,
          status: BOOKING_STATUS.PENDING,
          totalPrice,
          expiryTime: expiryTime
        },
        { transaction }
      );

      // Update seat status to RESERVED (holding seats while user pays)
      // RESERVED = seats are held but not permanently booked yet
      // All seats updated atomically within the same transactionBuses
      for (const seatNumber of seatNumbers) {
        const updateResult = await Seat.update(
          {
            status: SEAT_STATUS.RESERVED,
            bookingId: booking.id
          },
          {
            where: { 
              seatNumber,
              ...(tripId ? { tripId } : { busId })
            },
            transaction
          }
        );
        
        // Log for debugging
        if (updateResult[0] === 0) {
          console.warn(`⚠️ Seat ${seatNumber} not found for ${tripId ? 'trip' : 'bus'} ${tripId || busId}`);
        } else {
          console.log(`✅ Seat ${seatNumber} locked to RESERVED for booking ${booking.id}`);
        }
      }

      // IMPORTANT: DO NOT auto-confirm!
      // Booking stays PENDING for 2 minutes
      // BookingExpiryService will mark as FAILED after 2 mins
      // Payment gateway will mark as CONFIRMED when payment succeeds
      // Upon confirmation, update seats from RESERVED -> BOOKED

      await transaction.commit();

      return {
        success: true,
        message: 'Seats booked successfully',
        bookingId: booking.id,
        status: booking.status,
        seatsBooked: seatNumbers,
        totalPrice
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        message: error.message,
        status: BOOKING_STATUS.FAILED
      };
    }
  }

  /**
   * Get available seats for a bus
   * CRITICAL FIX: Initialize seats if they don't exist (handles buses created before seeding)
   * @param {number} busId - Bus ID
   * @returns {object} Seat information
   */
  static async getAvailableSeats(busId, tripId = null) {
    const bus = await Bus.findByPk(busId);
    if (!bus) {
      throw new Error('Bus not found');
    }

    // Build where clause - filter by tripId if provided
    const whereClause = { busId };
    if (tripId) {
      whereClause.tripId = tripId;
    }

    // Check if seats exist for this bus/trip
    const seatCount = await Seat.count({ where: whereClause });
    
    // If no seats exist, initialize them (handles buses created before this fix)
    if (seatCount === 0) {
      await this.initializeSeats(busId, bus.totalSeats);
    }

    const seats = await Seat.findAll({
      where: whereClause,
      attributes: ['seatNumber', 'status'],
      order: [['seatNumber', 'ASC']]
    });

    const totalSeats = bus.totalSeats;
    const availableSeats = seats.filter(s => s.status === SEAT_STATUS.AVAILABLE);
    const bookedSeats = seats.filter(s => s.status === SEAT_STATUS.BOOKED);
    const reservedSeats = seats.filter(s => s.status === SEAT_STATUS.RESERVED);

    return {
      totalSeats,
      availableCount: availableSeats.length,
      bookedCount: bookedSeats.length,
      reservedCount: reservedSeats.length,
      availableSeats: availableSeats.map(s => s.seatNumber),
      bookedSeats: bookedSeats.map(s => s.seatNumber),
      reservedSeats: reservedSeats.map(s => s.seatNumber),
      occupancyPercentage: Math.round(
        ((bookedSeats.length + reservedSeats.length) / totalSeats) * 100
      ),
      comment: 'AVAILABLE = open, RESERVED = user selecting (2 min hold), BOOKED = confirmed payment'
    };
  }

  /**
   * Get booking details
   * @param {number} bookingId - Booking ID
   * @returns {object} Booking information
   */
  static async getBookingDetails(bookingId) {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    return {
      id: booking.id,
      status: booking.status,
      seatsBooked: booking.seatsBooked,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt
    };
  }

  /**
   * Initialize seats for a bus (call when creating a new bus)
   * CRITICAL: Uses findOrCreate to handle existing seats gracefully
   * @param {number} busId - Bus ID
   * @param {number} totalSeats - Total seats in bus
   */
  static async initializeSeats(busId, totalSeats) {
    const seatsToCreate = Array.from({ length: totalSeats }, (_, i) => ({
      busId,
      seatNumber: i + 1,
      status: SEAT_STATUS.AVAILABLE
    }));

    // Use bulkCreate with ignoreDuplicates to handle buses with existing seats
    // This prevents "Unique Constraint" errors if seats were already created
    try {
      await Seat.bulkCreate(seatsToCreate, {
        ignoreDuplicates: true,
        validate: false
      });
      console.log(`✅ Initialized ${totalSeats} seats for bus ${busId}`);
    } catch (error) {
      console.error(`⚠️ Seat initialization issue:`, error.message);
      // If bulk create fails, try creating individually
      for (let i = 1; i <= totalSeats; i++) {
        await Seat.findOrCreate({
          where: { busId, seatNumber: i },
          defaults: { status: SEAT_STATUS.AVAILABLE }
        });
      }
    }
  }
}

module.exports = BookingService;
