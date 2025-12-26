const Trip = require('../models/Trip');
const { Seat, SEAT_STATUS } = require('../models/Seat');
const Bus = require('../models/bus');
const sequelize = require('../config/database');
const { Sequelize } = require('sequelize');

/**
 * Trip Service - Handles trip creation and management
 */
class TripService {
  /**
   * Create a new trip with seat initialization
   * @param {number} busId - Bus ID
   * @param {string} busName - Bus name
   * @param {Date} startTime - Trip start time
   * @param {Date} endTime - Trip end time
   * @param {string} from - Origin location
   * @param {string} to - Destination location
   * @param {number} totalSeats - Total seats for this trip
   * @param {number} pricePerSeat - Price per seat
   * @param {number} createdBy - User ID of admin creating trip
   * @returns {object} Created trip with details
   */
  // static async createTrip(busId, busName, startTime, endTime, from, to, totalSeats, pricePerSeat, createdBy) {
  static async createTrip(data) {
    const {
  busId,
  busName,
  startTime,
  endTime,
  from,
  to,
  totalSeats,
  pricePerSeat,
  createdBy
} = data;
    const transaction = await sequelize.transaction({
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    });

    try {
      console.log(`[TripService] Starting trip creation for bus ${busId}`);
      
      // Validate bus exists
      const bus = await Bus.findByPk(busId, { transaction });
      if (!bus) {
        throw new Error(`Bus not found with ID: ${busId}`);
      }
      console.log(`[TripService] Bus found: ${bus.busNumber}`);

      // Validate seats
      if (totalSeats < 1 || totalSeats > 200) {
        throw new Error('Total seats must be between 1 and 200');
      }
      console.log(`[TripService] Seat count valid: ${totalSeats}`);

      // Validate times
      if (new Date(startTime) >= new Date(endTime)) {
        throw new Error('Start time must be before end time');
      }
      console.log(`[TripService] Time validation passed`);

      // Create trip
      const trip = await Trip.create(
        {
          busId,
          busName,
          startTime,
          endTime,
          from,
          to,
          totalSeats,
          pricePerSeat,
          availableSeats: totalSeats,
          createdBy,
          status: 'ACTIVE'
        },
        { transaction }
      );
      console.log(`[TripService] Trip record created with ID: ${trip.id}`);

      // Initialize seats for this trip
      const seatsToCreate = Array.from({ length: totalSeats }, (_, i) => ({
        busId,
        seatNumber: i + 1,
        status: SEAT_STATUS.AVAILABLE,
        tripId: trip.id
      }));
      
      console.log(`[TripService] Attempting to create ${seatsToCreate.length} seats. Sample:`, seatsToCreate[0]);

      await Seat.bulkCreate(seatsToCreate, { transaction });
      console.log(`[TripService] Created ${totalSeats} seats for trip`);

      await transaction.commit();
      console.log(`[TripService] Transaction committed successfully`);

      return {
        success: true,
        message: 'Trip created successfully',
        trip: {
          id: trip.id,
          busId: trip.busId,
          busName: trip.busName,
          startTime: trip.startTime,
          endTime: trip.endTime,
          from: trip.from,
          to: trip.to,
          totalSeats: trip.totalSeats,
          availableSeats: trip.availableSeats,
          pricePerSeat: trip.pricePerSeat,
          status: trip.status
        }
      };
    } catch (error) {
      console.error(`[TripService] Error during trip creation:`, error.message);
      console.error(`[TripService] Full error details:`, JSON.stringify(error, null, 2));
      if (error.errors) {
        console.error(`[TripService] Validation errors:`, error.errors);
      }
      await transaction.rollback();
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get all available trips with filtering
   * @param {object} filters - Filter object (from, to, date, etc)
   * @returns {array} List of trips
   */
  static async getAvailableTrips(filters = {}) {
    const whereClause = {
      status: 'ACTIVE'
    };

    // Filter by from location
    if (filters.from) {
      whereClause.from = sequelize.where(
        sequelize.fn('LOWER', sequelize.col('from')),
        'LIKE',
        `%${filters.from.toLowerCase()}%`
      );
    }

    // Filter by to location
    if (filters.to) {
      whereClause.to = sequelize.where(
        sequelize.fn('LOWER', sequelize.col('to')),
        'LIKE',
        `%${filters.to.toLowerCase()}%`
      );
    }

    // Filter by date range
    if (filters.startDate && filters.endDate) {
      whereClause.startTime = {
        [Sequelize.Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
      };
    }

    // Only show trips with available seats
    if (filters.onlyAvailable !== false) {
      whereClause.availableSeats = {
        [Sequelize.Op.gt]: 0
      };
    }

    const trips = await Trip.findAll({
      where: whereClause,
      order: [['startTime', 'ASC']],
      attributes: [
        'id', 'busId', 'busName', 'startTime', 'endTime', 
        'from', 'to', 'totalSeats', 'availableSeats', 'pricePerSeat', 'status'
      ]
    });

    return trips;
  }

  /**
   * Get trip details with seat information
   * @param {number} tripId - Trip ID
   * @returns {object} Trip details with seat map
   */
  static async getTripDetails(tripId) {
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    const seats = await Seat.findAll({
      where: { 
        tripId: tripId, // ✅ Query by tripId, not busId
        seatNumber: { [Sequelize.Op.lte]: trip.totalSeats }
      },
      attributes: ['seatNumber', 'status', 'bookingId'],
      order: [['seatNumber', 'ASC']]
    });

    const seatMap = seats.reduce((acc, seat) => {
      acc[seat.seatNumber] = {
        status: seat.status,
        booked: seat.status === SEAT_STATUS.BOOKED,
        reserved: seat.status === SEAT_STATUS.RESERVED
      };
      return acc;
    }, {});

    return {
      id: trip.id,
      busId: trip.busId,
      busName: trip.busName,
      startTime: trip.startTime,
      endTime: trip.endTime,
      from: trip.from,
      to: trip.to,
      totalSeats: trip.totalSeats,
      availableSeats: trip.availableSeats,
      pricePerSeat: trip.pricePerSeat,
      status: trip.status,
      seatMap: seatMap
    };
  }

  /**
   * Update available seats count
   * @param {number} tripId - Trip ID
   * @param {number} seatsToReduce - Number of seats to reduce
   */
  static async updateAvailableSeats(tripId, seatsToReduce) {
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    const newAvailable = Math.max(0, trip.availableSeats - seatsToReduce);
    await trip.update({ availableSeats: newAvailable });
  }

  /**
   * Get all trips for admin dashboard
   * @returns {array} All trips
   */
  static async getAllTripsForAdmin() {
    const trips = await Trip.findAll({
      order: [['startTime', 'DESC']],
      attributes: [
        'id', 'busId', 'busName', 'startTime', 'endTime',
        'from', 'to', 'totalSeats', 'availableSeats', 'pricePerSeat', 'status', 'createdAt'
      ]
    });

    return trips;
  }
}

module.exports = TripService;
