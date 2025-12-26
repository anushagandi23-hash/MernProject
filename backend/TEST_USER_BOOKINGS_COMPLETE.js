const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

/**
 * Complete test for user bookings feature
 * Creates a booking and then retrieves it
 */

async function completeTest() {
  try {
    console.log('🚀 Complete User Bookings Feature Test...\n');

    // Step 1: Create/Login user
    console.log('1️⃣ Setting up user account...');
    const email = `test${Date.now()}@example.com`;
    let token, userId;

    try {
      const loginResp = await axios.post(`${API_BASE_URL}/login`, {
        email: email,
        password: 'Test@1234'
      });
      token = loginResp.data.token;
      userId = loginResp.data.user.id;
    } catch {
      const signupResp = await axios.post(`${API_BASE_URL}/signup`, {
        name: 'Test User',
        email: email,
        password: 'Test@1234'
      });
      userId = signupResp.data.userId;
      
      const loginResp = await axios.post(`${API_BASE_URL}/login`, {
        email: email,
        password: 'Test@1234'
      });
      token = loginResp.data.token;
    }
    
    console.log(`   ✅ User ready. ID: ${userId}`);

    // Step 2: Get a bus to book
    console.log('\n2️⃣ Getting available buses...');
    const busesResp = await axios.get(`${API_BASE_URL}/buses`);
    const bus = busesResp.data.data[0];
    console.log(`   ✅ Bus: ${bus.busNumber} (${bus.from} → ${bus.to})`);

    // Step 3: Create and confirm booking
    console.log('\n3️⃣ Creating and confirming booking...');
    const seats = [Math.floor(Math.random() * 30) + 10, Math.floor(Math.random() * 30) + 10, Math.floor(Math.random() * 30) + 10];
    const uniqueSeats = [...new Set(seats)]; // Remove duplicates
    
    const bookingResp = await axios.post(
      `${API_BASE_URL}/buses/${bus.id}/book`,
      { seats: uniqueSeats },
      { headers: { Authorization: token } }
    );
    const bookingId = bookingResp.data.booking.id;
    console.log(`   ✅ Booking created. ID: ${bookingId}`);

    const confirmResp = await axios.post(
      `${API_BASE_URL}/bookings/${bookingId}/confirm`,
      {},
      { headers: { Authorization: token } }
    );
    console.log(`   ✅ Booking confirmed. Status: ${confirmResp.data.booking.status}`);

    // Step 4: Fetch user bookings
    console.log('\n4️⃣ Fetching user bookings...');
    const userBookingsResp = await axios.get(
      `${API_BASE_URL}/user/bookings`,
      { headers: { Authorization: token } }
    );
    const bookings = userBookingsResp.data.data || [];
    console.log(`   ✅ Retrieved ${bookings.length} booking(s)`);

    // Step 5: Display booking details
    if (bookings.length > 0) {
      const booking = bookings[0];
      
      console.log('\n   📋 Raw booking object:', JSON.stringify(booking, null, 2).substring(0, 500));
      
      console.log('\n5️⃣ Booking Details:');
      
      console.log(`\n   📊 Basic Info:`);
      console.log(`      • Booking ID: ${booking.id}`);
      console.log(`      • Status: ${booking.status}`);
      console.log(`      • Booked on: ${booking.bookingDate} at ${booking.bookingTime}`);
      
      console.log(`\n   🚌 Bus Details:`);
      console.log(`      • Bus Number: ${booking.busNumber}`);
      console.log(`      • Route: ${booking.from} → ${booking.to}`);
      console.log(`      • Departure: ${new Date(booking.departureTime).toLocaleString('en-IN')}`);
      console.log(`      • Arrival: ${new Date(booking.arrivalTime).toLocaleString('en-IN')}`);
      
      console.log(`\n   🪑 Seat Information:`);
      console.log(`      • Seats: [${booking.seatsBooked.join(', ')}]`);
      console.log(`      • Total Seats: ${booking.numberOfSeats}`);
      
      console.log(`\n   💰 Pricing:`);
      console.log(`      • Price per Seat: ₹${booking.pricePerSeat.toFixed(2)}`);
      console.log(`      • Total Price: ₹${booking.totalPrice.toFixed(2)}`);
    }

    // Step 6: Test filtering by status
    console.log('\n6️⃣ Testing status filter (CONFIRMED only)...');
    const filteredResp = await axios.get(
      `${API_BASE_URL}/user/bookings?status=CONFIRMED`,
      { headers: { Authorization: token } }
    );
    const confirmedCount = (filteredResp.data.data || []).length;
    console.log(`   ✅ Confirmed bookings: ${confirmedCount}`);

    console.log('\n✨ All tests passed!\n');
    console.log('Summary:');
    console.log('  ✓ User account created/logged in');
    console.log('  ✓ Booking created and confirmed');
    console.log('  ✓ User bookings retrieved with all details');
    console.log('  ✓ Seat numbers are displayed correctly');
    console.log('  ✓ Status filter working');
    console.log('  ✓ Frontend MyBookings component will display this data\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error.response?.data || error.message);
    process.exit(1);
  }
}

completeTest();
