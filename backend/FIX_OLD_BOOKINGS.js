/**
 * FIX_OLD_BOOKINGS.js - Convert old CONFIRMED bookings to have BOOKED seats
 * Run with: node FIX_OLD_BOOKINGS.js
 */

const sequelize = require('./config/database');
const { Seat, SEAT_STATUS } = require('./models/Seat');
const { Booking, BOOKING_STATUS } = require('./models/Booking');
const { Sequelize } = require('sequelize');

async function fixOldBookings() {
  try {
    console.log('🔧 Starting fix for old CONFIRMED bookings...\n');
    
    // Find all CONFIRMED bookings
    const confirmedBookings = await Booking.findAll({
      where: { status: BOOKING_STATUS.CONFIRMED },
      order: [['createdAt', 'DESC']]
    });

    console.log(`📊 Found ${confirmedBookings.length} CONFIRMED bookings\n`);

    let fixedCount = 0;
    
    for (const booking of confirmedBookings) {
      const transaction = await sequelize.transaction({
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
      });

      try {
        // Get seats for this booking
        const seats = await Seat.findAll({
          where: { bookingId: booking.id },
          transaction
        });

        console.log(`📝 Booking #${booking.id}: ${seats.length} seats`);

        if (seats.length === 0) {
          // No seats linked via bookingId, update by seat numbers
          console.log(`   ⚠️  No seats found by bookingId, updating by seat numbers...`);
          
          await Seat.update(
            {
              status: SEAT_STATUS.BOOKED,
              bookingId: booking.id
            },
            {
              where: {
                busId: booking.busId,
                seatNumber: {
                  [Sequelize.Op.in]: booking.seatsBooked
                }
              },
              transaction
            }
          );
          
          console.log(`   ✅ Updated ${booking.seatsBooked.length} seats to BOOKED`);
        } else {
          // Update existing seats
          const seatNumbers = seats.map(s => s.seatNumber);
          console.log(`   ℹ️  Seats: [${seatNumbers.join(',')}]`);
          console.log(`   ℹ️  Current status: ${seats[0].status}`);
          
          if (seats[0].status !== SEAT_STATUS.BOOKED) {
            await Seat.update(
              { status: SEAT_STATUS.BOOKED },
              {
                where: { bookingId: booking.id },
                transaction
              }
            );
            console.log(`   ✅ Updated to BOOKED`);
          } else {
            console.log(`   ℹ️  Already BOOKED`);
          }
        }

        await transaction.commit();
        fixedCount++;
      } catch (error) {
        await transaction.rollback();
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} bookings\n`);

    // Show summary
    const availableSeats = await Seat.count({ 
      where: { status: SEAT_STATUS.AVAILABLE } 
    });
    const reservedSeats = await Seat.count({ 
      where: { status: SEAT_STATUS.RESERVED } 
    });
    const bookedSeats = await Seat.count({ 
      where: { status: SEAT_STATUS.BOOKED } 
    });

    console.log('📊 Final Seat Summary:');
    console.log(`   Available: ${availableSeats}`);
    console.log(`   Reserved: ${reservedSeats}`);
    console.log(`   Booked: ${bookedSeats}`);
    console.log(`   Total: ${availableSeats + reservedSeats + bookedSeats}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixOldBookings();
