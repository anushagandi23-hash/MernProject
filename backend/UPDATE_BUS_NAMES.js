require('dotenv').config();
const Bus = require('./models/bus');
const sequelize = require('./config/database');

const BUS_NAMES = [
  'Sai Travels',
  'Sky Express',
  'Royal Coaches',
  'Premier Travels',
  'Star Deluxe',
  'Fast Track',
  'Golden Journey',
  'Swift Express',
  'Elite Coaches',
  'Comfort Plus'
];

async function updateBusNames() {
  try {
    console.log('🚀 Starting bus name update...');
    
    // Sync database first
    await sequelize.sync();
    
    const buses = await Bus.findAll();
    console.log(`📊 Found ${buses.length} buses`);

    for (let i = 0; i < buses.length; i++) {
      const bus = buses[i];
      if (!bus.busName || bus.busName === 'Standard Bus') {
        const busName = BUS_NAMES[i % BUS_NAMES.length];
        await bus.update({ busName });
        console.log(`✅ Updated Bus ${bus.id} (${bus.busNumber}) → ${busName}`);
      } else {
        console.log(`⏭️ Bus ${bus.id} (${bus.busNumber}) already has name: ${bus.busName}`);
      }
    }

    console.log('✅ All buses updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateBusNames();
