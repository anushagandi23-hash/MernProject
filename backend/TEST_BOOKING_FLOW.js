/**
 * TEST_BOOKING_FLOW.js - Test the complete booking flow
 * Run with: node TEST_BOOKING_FLOW.js
 */

const sequelize = require('./config/database');
const { Seat, SEAT_STATUS } = require('./models/Seat');
const { Booking, BOOKING_STATUS } = require('./models/Booking');
const BookingService = require('./services/BookingService');
const BookingExpiryService = require('./services/BookingExpiryService');
const User = require('./models/User');
const Bus = require('./models/bus');

async function testBookingFlow() {
  try {
    console.log('\n🧪 TESTING BOOKING FLOW\n');
    console.log('='.repeat(60));

    // Sync database
    await sequelize.sync();
    console.log('✅ Database synced\n');

    // Get first bus
    let bus = await Bus.findOne();
    if (!bus) {
      console.log('❌ No buses found. Creating test bus...');
      bus = await Bus.create({
        busNumber: 'TEST001',
        from: 'TestCity1',
        to: 'TestCity2',
        departureTime: new Date(),
        arrivalTime: new Date(),
        price: 500,
        totalSeats: 40
      });
      await BookingService.initializeSeats(bus.id, 40);
      console.log(`✅ Created bus: ${bus.busNumber}\n`);
    }

    console.log(`🚌 Testing with Bus: ${bus.busNumber} (ID: ${bus.id})\n`);

    // Get or create test user
    let user = await User.findOne({ where: { email: 'test@example.com' } });
    if (!user) {
      const bcrypt = require('bcryptjs');
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });
      console.log(`✅ Created test user: ${user.email}\n`);
    }

    // Check initial seat status
    console.log('📊 STEP 1: Check Initial Seat Status');
    console.log('-'.repeat(60));
    let seatInfo = await BookingService.getAvailableSeats(bus.id);
    console.log(`Available: ${seatInfo.availableCount}`);
    console.log(`Reserved: ${seatInfo.reservedCount}`);
    console.log(`Booked: ${seatInfo.bookedCount}`);
    console.log(`Occupancy: ${seatInfo.occupancyPercentage}%\n`);

    // Create booking
    console.log('📝 STEP 2: Create Booking (Book Seats 20, 21, 22)');
    console.log('-'.repeat(60));
    const seatsToBook = [20, 21, 22];
    const result = await BookingService.createBooking(user.id, bus.id, seatsToBook);
    
    if (!result.success) {
      console.log(`❌ Booking failed: ${result.message}`);
      process.exit(1);
    }

    const bookingId = result.bookingId;
    console.log(`✅ Booking created:`);
    console.log(`   ID: ${bookingId}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Seats: [${result.seatsBooked}]`);
    console.log(`   Price: ${result.totalPrice}\n`);

    // Check seat status after booking
    console.log('📊 STEP 3: Check Seat Status After Booking');
    console.log('-'.repeat(60));
    seatInfo = await BookingService.getAvailableSeats(bus.id);
    console.log(`Available: ${seatInfo.availableCount}`);
    console.log(`Reserved: ${seatInfo.reservedCount} ${seatInfo.reservedCount > 0 ? '✅ LOCKED!' : '❌ NOT LOCKED'}`);
    console.log(`Booked: ${seatInfo.bookedCount}`);
    console.log(`Occupancy: ${seatInfo.occupancyPercentage}%\n`);

    if (seatInfo.reservedCount === 0) {
      console.log('❌ ERROR: Seats were NOT locked to RESERVED status!');
      console.log('   Checking database directly...\n');
      
      const rawSeats = await Seat.findAll({
        where: { seatNumber: seatsToBook, busId: bus.id },
        raw: true
      });
      
      console.log('Raw seat data from database:');
      rawSeats.forEach(seat => {
        console.log(`   Seat ${seat.seatNumber}: Status=${seat.status}, BookingId=${seat.bookingId}`);
      });
      process.exit(1);
    }

    // Confirm booking
    console.log('✅ STEP 4: Confirm Booking (Payment)');
    console.log('-'.repeat(60));
    const confirmResult = await BookingExpiryService.confirmBooking(bookingId);
    
    if (!confirmResult.success) {
      console.log(`❌ Confirmation failed: ${confirmResult.message}`);
      process.exit(1);
    }

    console.log(`✅ Booking confirmed:`);
    console.log(`   Status: ${confirmResult.status}\n`);

    // Check final seat status
    console.log('📊 STEP 5: Check Final Seat Status');
    console.log('-'.repeat(60));
    seatInfo = await BookingService.getAvailableSeats(bus.id);
    console.log(`Available: ${seatInfo.availableCount}`);
    console.log(`Reserved: ${seatInfo.reservedCount}`);
    console.log(`Booked: ${seatInfo.bookedCount} ${seatInfo.bookedCount === 3 ? '✅ CORRECT!' : '❌ WRONG'}`);
    console.log(`Occupancy: ${seatInfo.occupancyPercentage}%\n`);

    if (seatInfo.bookedCount !== 3) {
      console.log('❌ ERROR: Seats were NOT updated to BOOKED!');
      process.exit(1);
    }

    // Verify booking in database
    console.log('✅ STEP 6: Verify Booking in Database');
    console.log('-'.repeat(60));
    const booking = await Booking.findByPk(bookingId);
    console.log(`Booking #${booking.id}:`);
    console.log(`   Status: ${booking.status}`);
    console.log(`   Seats: [${booking.seatsBooked}]`);
    console.log(`   User: ${booking.userId}`);
    console.log(`   Price: ${booking.totalPrice}\n`);

    console.log('='.repeat(60));
    console.log('✅ ALL TESTS PASSED!\n');
    console.log('🎉 Booking system is working correctly!');
    console.log('   - Seats lock to RESERVED on booking');
    console.log('   - Seats change to BOOKED on confirmation');
    console.log('   - Seat status persists in database\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

testBookingFlow();
