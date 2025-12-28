require('dotenv').config();
const sequelize = require('./config/database');
const Bus = require('./models/bus');
const Trip = require('./models/Trip');
const { Seat, SEAT_STATUS } = require('./models/Seat');
const { Booking } = require('./models/Booking');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

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

const BUSES = [
  // 8 buses for Bangalore -> Chennai route
  {
    busNumber: 'SAI101',
    busName: 'Sai Travels',
    from: 'Bangalore',
    to: 'Chennai',
    price: 500,
    departureTime: new Date('2025-12-27T20:00:00'),
    arrivalTime: new Date('2025-12-28T02:00:00')
  },
  {
    busNumber: 'SKY201',
    busName: 'Sky Express',
    from: 'Bangalore',
    to: 'Chennai',
    price: 550,
    departureTime: new Date('2025-12-27T21:00:00'),
    arrivalTime: new Date('2025-12-28T03:00:00')
  },
  {
    busNumber: 'ROY301',
    busName: 'Royal Coaches',
    from: 'Bangalore',
    to: 'Chennai',
    price: 520,
    departureTime: new Date('2025-12-27T21:30:00'),
    arrivalTime: new Date('2025-12-28T03:30:00')
  },
  {
    busNumber: 'PRE401',
    busName: 'Premier Travels',
    from: 'Bangalore',
    to: 'Chennai',
    price: 480,
    departureTime: new Date('2025-12-27T22:00:00'),
    arrivalTime: new Date('2025-12-28T04:00:00')
  },
  {
    busNumber: 'STA501',
    busName: 'Star Deluxe',
    from: 'Bangalore',
    to: 'Chennai',
    price: 600,
    departureTime: new Date('2025-12-27T22:30:00'),
    arrivalTime: new Date('2025-12-28T04:30:00')
  },
  {
    busNumber: 'FAS601',
    busName: 'Fast Track',
    from: 'Bangalore',
    to: 'Chennai',
    price: 490,
    departureTime: new Date('2025-12-27T23:00:00'),
    arrivalTime: new Date('2025-12-28T05:00:00')
  },
  {
    busNumber: 'GOL701',
    busName: 'Golden Journey',
    from: 'Bangalore',
    to: 'Chennai',
    price: 530,
    departureTime: new Date('2025-12-28T20:00:00'),
    arrivalTime: new Date('2025-12-28T02:00:00')
  },
  {
    busNumber: 'SWI801',
    busName: 'Swift Express',
    from: 'Bangalore',
    to: 'Chennai',
    price: 510,
    departureTime: new Date('2025-12-28T21:00:00'),
    arrivalTime: new Date('2025-12-28T03:00:00')
  },
  // Additional routes with different cities
  {
    busNumber: 'HYD101',
    busName: 'Elite Coaches',
    from: 'Hyderabad',
    to: 'Bangalore',
    price: 650,
    departureTime: new Date('2025-12-27T20:00:00'),
    arrivalTime: new Date('2025-12-28T04:00:00')
  },
  {
    busNumber: 'CHE101',
    busName: 'Comfort Plus',
    from: 'Chennai',
    to: 'Coimbatore',
    price: 550,
    departureTime: new Date('2025-12-27T22:00:00'),
    arrivalTime: new Date('2025-12-28T05:00:00')
  },
  {
    busNumber: 'PUN101',
    busName: 'Sai Travels',
    from: 'Pune',
    to: 'Hyderabad',
    price: 900,
    departureTime: new Date('2025-12-27T19:00:00'),
    arrivalTime: new Date('2025-12-28T06:00:00')
  }
];


function getDates(start, end) {
  const dates = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

(async () => {
  try {
    await sequelize.sync();

    console.log('🚀 Clearing existing data...');
    // Delete in order of dependencies
    await Seat.destroy({ where: {}, truncate: true, cascade: true });
    await Booking.destroy({ where: {}, truncate: true, cascade: true });
    await Trip.destroy({ where: {}, truncate: true, cascade: true });
    await Bus.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
    console.log('✅ Data cleared');

    // Create admin user
    console.log('🚀 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN'
    });
    console.log('✅ Admin user created with ID:', adminUser.id);

    // Create test regular user for booking
    console.log('🚀 Creating test regular user...');
    const hashedUserPassword = await bcrypt.hash('user123', 10);
    const regularUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedUserPassword,
      role: 'USER'
    });
    console.log('✅ Regular user created with ID:', regularUser.id);

    console.log('🚀 Seeding buses...');
   const buses = await Bus.bulkCreate(
  BUSES.map(b => ({
    busNumber: b.busNumber,
    from: b.from,
    to: b.to,
    price: b.price,
    totalSeats: 40,
    departureTime: b.departureTime,
    arrivalTime: b.arrivalTime
  })),
  { returning: true }
);


    const dates = getDates(
      new Date('2025-12-27'),
      new Date('2026-01-10')
    );

    console.log('🚀 Seeding trips and seats...');

    for (const bus of buses) {
      for (const date of dates) {
        const startTime = new Date(date);
        startTime.setHours(21, 0, 0); // 9 PM

        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 6);

        // Find the bus definition to get the correct busName and price
        const busDefinition = BUSES.find(b => b.busNumber === bus.busNumber);

        const trip = await Trip.create({
          busId: bus.id,
          busName: busDefinition.busName,
          startTime,
          endTime,
          from: bus.from,
          to: bus.to,
          totalSeats: 40,
          availableSeats: 40,
          pricePerSeat: busDefinition.price,
          status: 'ACTIVE',
          createdBy: adminUser.id
        });

        const seats = Array.from({ length: 40 }, (_, i) => ({
          busId: bus.id,
          tripId: trip.id,
          seatNumber: i + 1,
          status: SEAT_STATUS.AVAILABLE
        }));

        await Seat.bulkCreate(seats);
      }
    }

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
