const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Trip Model - Represents a bus trip/route
 * Admin can create multiple trips for the same bus
 */
const Trip = sequelize.define('Trip', {
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
  busName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  from: {
    type: DataTypes.STRING,
    allowNull: false
  },
  to: {
    type: DataTypes.STRING,
    allowNull: false
  },
  totalSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 40,
    validate: {
      min: 1,
      max: 200
    }
  },
  pricePerSeat: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 100
  },
  availableSeats: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'ACTIVE'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'Trips',
  indexes: [
    {
      fields: ['busId', 'startTime']
    },
    {
      fields: ['from', 'to']
    }
  ]
});

module.exports = Trip;
