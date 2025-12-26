const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Seat Status: AVAILABLE, BOOKED, RESERVED
const SEAT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  BOOKED: 'BOOKED',
  RESERVED: 'RESERVED'
};

const Seat = sequelize.define('Seat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  busId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Buses',
      key: 'id'
    }
  },
  tripId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Trips',
      key: 'id'
    }
  },
  seatNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(...Object.values(SEAT_STATUS)),
    defaultValue: SEAT_STATUS.AVAILABLE
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Bookings',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'Seats',
  indexes: [
    {
      unique: true,
      fields: ['tripId', 'seatNumber']
    }
  ]
});

module.exports = { Seat, SEAT_STATUS };
