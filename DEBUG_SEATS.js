/**
 * DEBUG SCRIPT - Seat Booking Issues
 * Run with: node DEBUG_SEATS.js
 */

const sequelize = require('./config/database');
const { Seat, SEAT_STATUS } = require('./models/Seat');
const { Booking, BOOKING_STATUS } = require('./models/Booking');
const Bus = require('./models/bus');
const BookingService = require('./services/BookingService');

async function debugSeats() {
  try {
    // Sync database
    await sequelize.sync();
    console.log('✅ Database synced\n');

    // Get first bus
    const bus = await Bus.findOne();
    if (!bus) {
      console.log('❌ No buses found. Create a bus first');
      await sequelize.close();
      return;
    }

    console.log('🚌 Bus:', {
      id: bus.id,
      busNumber: bus.busNumber,
      totalSeats: bus.totalSeats
    });
    console.log('\n' + '='.repeat(60) + '\n');

    // Check seat count
    const seatCount = await Seat.count({ where: { busId: bus.id } });
    console.log(`🪑 Seats in database: ${seatCount}`);
    if (seatCount === 0) {
      console.log('⚠️  No seats found! Initializing...');
      await BookingService.initializeSeats(bus.id, bus.totalSeats);
      console.log('✅ Seats initialized\n');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Get seat breakdown
    const seatInfo = await BookingService.getAvailableSeats(bus.id);
    console.log('📊 Seat Status Breakdown:');
    console.log(`   Total: ${seatInfo.totalSeats}`);
    console.log(`   Available: ${seatInfo.availableCount}`);
    console.log(`   Reserved: ${seatInfo.reservedCount}`);
    console.log(`   Booked: ${seatInfo.bookedCount}`);
    console.log(`   Occupancy: ${seatInfo.occupancyPercentage}%`);

    console.log('\n' + '='.repeat(60) + '\n');

    // Show raw seats
    const allSeats = await Seat.findAll({
      where: { busId: bus.id },
      order: [['seatNumber', 'ASC']],
      raw: true
    });

    if (allSeats.length > 0) {
      console.log('📋 Sample Seats (first 10):');
      allSeats.slice(0, 10).forEach(seat => {
        const icon = seat.status === SEAT_STATUS.AVAILABLE ? '✅' 
                   : seat.status === SEAT_STATUS.RESERVED ? '⏳' 
                   : '❌';
        console.log(`   Seat ${seat.seatNumber}: ${icon} ${seat.status}`);
      });
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Show all bookings for this bus
    const bookings = await Booking.findAll({
      where: { busId: bus.id },
      order: [['createdAt', 'DESC']],
      limit: 5,
      raw: true
    });

    console.log(`📅 Recent Bookings (${bookings.length} total):`);
    if (bookings.length === 0) {
      console.log('   (None yet)');
    } else {
      bookings.forEach(booking => {
        const icon = booking.status === BOOKING_STATUS.PENDING ? '⏳'
                   : booking.status === BOOKING_STATUS.CONFIRMED ? '✅'
                   : '❌';
        console.log(`   ${icon} ID:${booking.id} Status:${booking.status} Seats:[${booking.seatsBooked}] Price:${booking.totalPrice}`);
      });
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Verify database tables exist
    const tables = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log('✅ Tables in database:', tables[0].map(t => t.table_name).sort());

    console.log('\n✅ Debug complete\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

debugSeats();
