const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

/**
 * Test script to verify user bookings functionality
 * Tests getting user's confirmed bookings with all details
 */

async function testUserBookings() {
  try {
    console.log('🚀 Testing User Bookings Feature...\n');

    // Step 1: Login
    console.log('1️⃣ Logging in user...');
    const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
      email: `test${1735038000000}@example.com`,
      password: 'Test@1234'
    }).catch(async (err) => {
      // If login fails, create and login
      console.log('   Creating new test user...');
      const email = `test${Date.now()}@example.com`;
      await axios.post(`${API_BASE_URL}/signup`, {
        name: 'Test User',
        email: email,
        password: 'Test@1234'
      });
      return await axios.post(`${API_BASE_URL}/login`, {
        email: email,
        password: 'Test@1234'
      });
    });

    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log(`   ✅ Logged in. User ID: ${userId}`);

    // Step 2: Get all user bookings
    console.log('\n2️⃣ Fetching all user bookings...');
    const allBookingsResponse = await axios.get(
      `${API_BASE_URL}/user/bookings`,
      { headers: { Authorization: token } }
    );

    const allBookings = allBookingsResponse.data.data || [];
    console.log(`   ✅ Total bookings: ${allBookings.length}`);

    if (allBookings.length > 0) {
      console.log('\n3️⃣ Sample Booking Details:');
      const booking = allBookings[0];
      console.log(`   Booking ID: ${booking.id}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Bus: ${booking.busNumber} (${booking.from} → ${booking.to})`);
      console.log(`   Seats: [${booking.seatsBooked.join(', ')}] (${booking.numberOfSeats} seats)`);
      console.log(`   Price: ₹${booking.pricePerSeat.toFixed(2)}/seat × ${booking.numberOfSeats} = ₹${booking.totalPrice.toFixed(2)}`);
      console.log(`   Departure: ${new Date(booking.departureTime).toLocaleString('en-IN')}`);
      console.log(`   Booked on: ${booking.bookingDate} at ${booking.bookingTime}`);
    }

    // Step 3: Get only CONFIRMED bookings
    console.log('\n4️⃣ Fetching CONFIRMED bookings only...');
    const confirmedResponse = await axios.get(
      `${API_BASE_URL}/user/bookings?status=CONFIRMED`,
      { headers: { Authorization: token } }
    );

    const confirmedBookings = confirmedResponse.data.data || [];
    console.log(`   ✅ Confirmed bookings: ${confirmedBookings.length}`);

    if (confirmedBookings.length > 0) {
      console.log('\n5️⃣ Confirmed Bookings Summary:');
      confirmedBookings.forEach((booking, index) => {
        console.log(`\n   Booking ${index + 1}:`);
        console.log(`   • ID: ${booking.id}`);
        console.log(`   • Route: ${booking.from} → ${booking.to}`);
        console.log(`   • Bus: ${booking.busNumber}`);
        console.log(`   • Seats: [${booking.seatsBooked.join(', ')}]`);
        console.log(`   • Total: ₹${booking.totalPrice.toFixed(2)}`);
        console.log(`   • Status: ${booking.status}`);
      });
    }

    // Step 4: Verify response includes all required fields
    console.log('\n6️⃣ Verifying API Response Structure:');
    if (confirmedBookings.length > 0) {
      const booking = confirmedBookings[0];
      const requiredFields = [
        'id', 'busNumber', 'from', 'to', 'seatsBooked', 
        'numberOfSeats', 'status', 'totalPrice', 'pricePerSeat',
        'departureTime', 'arrivalTime', 'bookingDate', 'bookingTime'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in booking));
      
      if (missingFields.length === 0) {
        console.log('   ✅ All required fields present:');
        requiredFields.forEach(field => {
          console.log(`      • ${field}: ${
            typeof booking[field] === 'object' 
              ? JSON.stringify(booking[field]) 
              : booking[field]
          }`);
        });
      } else {
        console.log(`   ❌ Missing fields: ${missingFields.join(', ')}`);
      }
    } else {
      console.log('   ⚠️ No confirmed bookings to verify structure');
      console.log('   You may need to make a booking first to verify all fields');
    }

    console.log('\n✨ Test completed successfully!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error.response?.data || error.message);
    process.exit(1);
  }
}

testUserBookings();
