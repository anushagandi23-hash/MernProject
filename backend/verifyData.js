const sequelize = require('./config/database');
const User = require('./models/User');
const Bus = require('./models/Bus');
const Trip = require('./models/Trip');
const { Seat } = require('./models/Seat');

async function verifyData() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    const userCount = await User.count();
    const busCount = await Bus.count();
    const tripCount = await Trip.count();
    const seatCount = await Seat.count();

    console.log('📊 Database Record Counts:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Buses: ${busCount}`);
    console.log(`   Trips: ${tripCount}`);
    console.log(`   Seats: ${seatCount}`);

    if (busCount > 0) {
      const bus = await Bus.findOne();
      console.log('\n📌 Sample Bus:');
      console.log(`   Number: ${bus.busNumber}`);
      console.log(`   Name: ${bus.busName || 'N/A'}`);
      console.log(`   From: ${bus.from}`);
      console.log(`   To: ${bus.to}`);
    }

    if (tripCount > 0) {
      const trip = await Trip.findOne();
      console.log('\n📌 Sample Trip:');
      console.log(`   BusId: ${trip.busId}`);
      console.log(`   BusName: ${trip.busName}`);
      console.log(`   From: ${trip.from} → To: ${trip.to}`);
      console.log(`   CreatedBy: ${trip.createdBy}`);
    }

    console.log('\n✅ Data verification complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyData();
