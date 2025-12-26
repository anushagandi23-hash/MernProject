const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Booking Status: PENDING (waiting), CONFIRMED (paid), FAILED (expired or cancelled)
const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED'
};

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
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
  busId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Buses',
      key: 'id'
    }
  },
  seatsBooked: {
    type: DataTypes.JSON, // Array of seat numbers
    allowNull: false,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM(...Object.values(BOOKING_STATUS)),
    defaultValue: BOOKING_STATUS.PENDING,
    index: true
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  expiryTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Booking expires after 2 minutes if still PENDING'
  },
  expiredAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp when booking was marked as FAILED due to expiry'
  }
}, {
  timestamps: true,
  tableName: 'Bookings',
  indexes: [
    {
      fields: ['userId', 'status']
    },
    {
      fields: ['busId', 'status']
    },
    {
      fields: ['status', 'expiryTime'],
      where: {
        status: 'PENDING'
      }
    }
  ]
});

module.exports = { Booking, BOOKING_STATUS };
