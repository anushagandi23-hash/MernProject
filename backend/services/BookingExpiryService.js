const { Booking, BOOKING_STATUS } = require('../models/Booking');
const { Seat, SEAT_STATUS } = require('../models/Seat');
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Booking Expiry Service - Handles automatic booking expiry
 * Marks bookings as FAILED if they remain PENDING for more than 2 minutes
 */
class BookingExpiryService {
  /**
   * Check and expire old pending bookings
   * Runs every minute to check for expired bookings
   */
  static async checkAndExpireBookings() {
    const transaction = await sequelize.transaction({
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    });

    try {
      // Get all pending bookings that have expired (> 2 minutes old)
      const expiryTime = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago

      const expiredBookings = await Booking.findAll({
        where: {
          status: BOOKING_STATUS.PENDING,
          createdAt: {
            [Sequelize.Op.lte]: expiryTime
          }
        },
        transaction
      });

      if (expiredBookings.length === 0) {
        await transaction.commit();
        return {
          success: true,
          expiredCount: 0,
          message: 'No bookings to expire'
        };
      }

      // Process each expired booking
      for (const booking of expiredBookings) {
        // Update booking status to FAILED
        await booking.update(
          {
            status: BOOKING_STATUS.FAILED,
            expiredAt: new Date()
          },
          { transaction }
        );

        // Release booked seats back to AVAILABLE
        await Seat.update(
          {
            status: SEAT_STATUS.AVAILABLE,
            bookingId: null
          },
          {
            where: {
              bookingId: booking.id
            },
            transaction
          }
        );

        console.log(`✅ Booking #${booking.id} marked as FAILED due to expiry`);
      }

      await transaction.commit();

      return {
        success: true,
        expiredCount: expiredBookings.length,
        message: `${expiredBookings.length} bookings marked as FAILED`
      };
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error expiring bookings:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Set expiry time for a new booking (2 minutes from now)
   * @param {number} bookingId - Booking ID
   * @returns {Date} Expiry time
   */
  static setBookingExpiry(bookingId) {
    const expiryTime = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now
    return expiryTime;
  }

  /**
   * Cancel a pending booking manually
   * @param {number} bookingId - Booking ID
   * @returns {object} Result
   */
  static async cancelPendingBooking(bookingId) {
    const transaction = await sequelize.transaction({
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    });

    try {
      const booking = await Booking.findByPk(bookingId, { transaction });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== BOOKING_STATUS.PENDING) {
        throw new Error(`Cannot cancel ${booking.status} booking`);
      }

      // Update booking status
      await booking.update(
        {
          status: BOOKING_STATUS.FAILED,
          expiredAt: new Date()
        },
        { transaction }
      );

      // Release seats
      await Seat.update(
        {
          status: SEAT_STATUS.AVAILABLE,
          bookingId: null
        },
        {
          where: {
            bookingId: booking.id
          },
          transaction
        }
      );

      await transaction.commit();

      return {
        success: true,
        message: 'Booking cancelled successfully',
        bookingId: booking.id
      };
    } catch (error) {
      await transaction.rollback();
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Confirm a pending booking (after payment succeeds)
   * Updates booking status from PENDING -> CONFIRMED
   * Updates seats from RESERVED -> BOOKED
   * @param {number} bookingId - Booking ID
   * @returns {object} Result
   */
  static async confirmBooking(bookingId) {
    const transaction = await sequelize.transaction({
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    });

    try {
      const booking = await Booking.findByPk(bookingId, { transaction });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== BOOKING_STATUS.PENDING) {
        throw new Error(`Cannot confirm ${booking.status} booking`);
      }

      // Check if booking has expired
      const now = new Date();
      if (booking.expiryTime && new Date(booking.expiryTime) <= now) {
        throw new Error('Booking has expired');
      }

      // Update booking status to CONFIRMED
      await booking.update(
        {
          status: BOOKING_STATUS.CONFIRMED
        },
        { transaction }
      );

      // Update seats from RESERVED -> BOOKED
      await Seat.update(
        {
          status: SEAT_STATUS.BOOKED
        },
        {
          where: {
            bookingId: booking.id,
            status: SEAT_STATUS.RESERVED
          },
          transaction
        }
      );

      await transaction.commit();

      console.log(`✅ Booking #${booking.id} confirmed - Seats updated to BOOKED`);

      return {
        success: true,
        message: 'Booking confirmed successfully',
        bookingId: booking.id,
        status: BOOKING_STATUS.CONFIRMED
      };
    } catch (error) {
      await transaction.rollback();
      console.error(`❌ Error confirming booking:`, error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get booking expiry status
   * @param {number} bookingId - Booking ID
   * @returns {object} Expiry status
   */
  static async getBookingExpiryStatus(bookingId) {
    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== BOOKING_STATUS.PENDING) {
      return {
        status: booking.status,
        willExpire: false,
        message: `Booking is ${booking.status}`
      };
    }

    const now = new Date();
    const expiryTime = booking.expiryTime ? new Date(booking.expiryTime) : null;
    const timeRemaining = expiryTime ? expiryTime - now : null;

    return {
      status: booking.status,
      willExpire: true,
      expiryTime: expiryTime,
      timeRemainingSeconds: timeRemaining ? Math.ceil(timeRemaining / 1000) : null,
      hasExpired: timeRemaining ? timeRemaining <= 0 : false
    };
  }
}

module.exports = BookingExpiryService;
