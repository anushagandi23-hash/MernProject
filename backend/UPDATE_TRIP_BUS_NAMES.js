require('dotenv').config();
const Trip = require('./models/Trip');
const Bus = require('./models/bus');
const sequelize = require('./config/database');

async function updateTripBusNames() {
  try {
    console.log('🚀 Starting trip busName update...');
    
    const trips = await Trip.findAll();
    console.log(`📊 Found ${trips.length} trips`);

    for (let i = 0; i < trips.length; i++) {
      const trip = trips[i];
      
      // Get the bus name from the bus
      const bus = await Bus.findByPk(trip.busId);
      if (bus) {
        const busName = bus.busName || bus.busNumber || 'Unknown Bus';
        
        if (trip.busName !== busName) {
          await trip.update({ busName });
          console.log(`✅ Updated Trip ${trip.id} → ${busName}`);
        } else {
          console.log(`⏭️ Trip ${trip.id} already has correct busName: ${busName}`);
        }
      } else {
        console.error(`❌ Bus ${trip.busId} not found for Trip ${trip.id}`);
      }
    }

    console.log('✅ All trips updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateTripBusNames();
