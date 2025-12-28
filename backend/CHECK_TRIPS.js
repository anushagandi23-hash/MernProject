require('dotenv').config();
const Trip = require('./models/Trip');
const Bus = require('./models/bus');
const sequelize = require('./config/database');

async function checkTrips() {
  try {
    console.log('🚀 Checking trips in database...');
    
    const trips = await Trip.findAll({
      attributes: ['id', 'busId', 'busName', 'from', 'to', 'startTime', 'status', 'availableSeats']
    });
    
    console.log(`📊 Found ${trips.length} trips:\n`);
    trips.forEach(trip => {
      console.log(`Trip ${trip.id}:`);
      console.log(`  busName: ${trip.busName}`);
      console.log(`  busId: ${trip.busId}`);
      console.log(`  from: ${trip.from} → to: ${trip.to}`);
      console.log(`  startTime: ${trip.startTime}`);
      console.log(`  status: ${trip.status}`);
      console.log(`  availableSeats: ${trip.availableSeats}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTrips();
