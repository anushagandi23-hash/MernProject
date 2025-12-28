const sequelize = require('./config/database');
const Trip = require('./models/Trip');

async function checkTrips() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected\n');

    const trips = await Trip.findAll({
      limit: 5,
      order: [['startTime', 'ASC']],
      attributes: ['id', 'from', 'to', 'startTime', 'busName']
    });

    console.log('📋 Sample Trips:');
    trips.forEach(t => {
      const date = new Date(t.startTime);
      console.log(`   ID: ${t.id}, Date: ${date.toISOString().split('T')[0]}, ${t.from} → ${t.to}, Bus: ${t.busName}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTrips();
