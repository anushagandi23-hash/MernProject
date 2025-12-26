const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
   role: {                          // ✅ ADD THIS
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'USER'
  }
}, {
  timestamps: true,
  tableName: 'Users'
});

module.exports = User;

