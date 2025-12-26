const sequelize = require('./config/database');
const { Seat } = require('./models/Seat');

async function check() {
  try {
    await sequelize.sync();
    
    const seats = await Seat.findAll({
      attributes: ['seatNumber', 'status', 'bookingId'],
      order: [['seatNumber', 'ASC']],
      raw: true
    });

    console.log('\n📊 COMPLETE SEAT STATUS\n');
    console.log('Seat# | Status     | BookingId');
    console.log('-----|------------|----------');
    
    let avail = 0, reserved = 0, booked = 0;
    seats.forEach(s => {
      const status = s.status.padEnd(10);
      const bid = s.bookingId || '-';
      console.log(`${s.seatNumber.toString().padEnd(5)} | ${status} | ${bid}`);
      
      if (s.status === 'AVAILABLE') avail++;
      else if (s.status === 'RESERVED') reserved++;
      else if (s.status === 'BOOKED') booked++;
    });
    
    console.log('-----|------------|----------');
    console.log(`\n✅ Available: ${avail}`);
    console.log(`🔒 Reserved: ${reserved}`);
    console.log(`✔️  Booked: ${booked}`);
    console.log(`📊 Occupancy: ${Math.round((booked / seats.length) * 100)}%\n`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

check();
