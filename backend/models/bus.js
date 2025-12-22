const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: String,
  from: String,
  to: String,
  departureTime: String,
  arrivalTime: String,
  price: Number,

  totalSeats: {
    type: Number,
    default: 40   // ✅ important
  },

  bookedSeats: {
    type: [Number],
    default: []   // ✅ important
  }
});

module.exports = mongoose.model('Bus', busSchema);
