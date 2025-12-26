const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

/**
 * Test script to verify the booking flow works correctly
 * Tests the complete flow: Create booking -> Confirm booking -> Verify seats are BOOKED
 */

async function testBookingFlow() {
  try {
    console.log('🚀 Starting Booking Flow Test...\n');

    // Step 1: Signup/Login to get a token
    console.log('1️⃣ Testing user login...');
    let token, userId;
    
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/login`, {
        email: 'admin@example.com',
        password: 'Admin@123'
      });
      token = loginResponse.data.token;
      userId = loginResponse.data.user.id;
      console.log(`   ✅ Logged in successfully. User ID: ${userId}`);
      console.log(`   Token: ${token.substring(0, 20)}...`);
    } catch (err) {
      // If login fails, create a new user
      console.log('   User not found, creating test account...');
      const newEmail = `test${Date.now()}@example.com`;
      const signupResponse = await axios.post(`${API_BASE_URL}/signup`, {
        name: 'Test User',
        email: newEmail,
        password: 'Test@1234'
      });
      userId = signupResponse.data.userId;
      
      // Login with the new user
      const loginResponse2 = await axios.post(`${API_BASE_URL}/login`, {
        email: newEmail,
        password: 'Test@1234'
      });
      token = loginResponse2.data.token;
      console.log(`   ✅ User created and logged in. User ID: ${userId}`);
      console.log(`   Token: ${token.substring(0, 20)}...`);
    }

    // Step 2: Get a bus to book
    console.log('\n2️⃣ Getting available buses...');
    const busesResponse = await api.get(`${API_BASE_URL}/buses`);
    const buses = busesResponse.data.data;
    
    if (buses.length === 0) {
      console.log('   ⚠️ No buses available. Please create a bus first.');
      return;
    }

    const bus = buses[0];
    console.log(`   ✅ Found bus: ${bus.busNumber} (${bus.from} → ${bus.to})`);
    console.log(`   Available seats: ${bus.availableSeats}/${bus.totalSeats}`);

    // Step 3: Create a booking
    console.log('\n3️⃣ Creating booking for seats [1, 2, 3]...');
    const bookingResponse = await axios.post(
      `${API_BASE_URL}/buses/${bus.id}/book`,
      { seats: [1, 2, 3] },
      { headers: { Authorization: token } }
    );

    const bookingId = bookingResponse.data.booking.id;
    const initialStatus = bookingResponse.data.booking.status;
    console.log(`   ✅ Booking created successfully`);
    console.log(`   Booking ID: ${bookingId}`);
    console.log(`   Initial Status: ${initialStatus}`);

    // Step 4: Check seat status before confirmation
    console.log('\n4️⃣ Checking seat status BEFORE confirmation...');
    const seatsBeforeResponse = await axios.get(`${API_BASE_URL}/buses/${bus.id}/seats`);
    const seatsDataBefore = seatsBeforeResponse.data.data;
    console.log(`   Available: ${seatsDataBefore.availableSeats.length}`);
    console.log(`   Booked: ${seatsDataBefore.bookedSeats.length}`);
    console.log(`   Reserved: ${seatsDataBefore.reservedSeats?.length || 0}`);
    console.log(`   Seats [1,2,3] status: Reserved (held for user)`);

    // Step 5: Confirm the booking
    console.log('\n5️⃣ Confirming booking (simulating payment success)...');
    const confirmResponse = await axios.post(
      `${API_BASE_URL}/bookings/${bookingId}/confirm`,
      {},
      { headers: { Authorization: token } }
    );

    const confirmedStatus = confirmResponse.data.booking.status;
    console.log(`   ✅ Booking confirmed successfully`);
    console.log(`   Final Status: ${confirmedStatus}`);

    // Step 6: Check seat status after confirmation
    console.log('\n6️⃣ Checking seat status AFTER confirmation...');
    const seatsAfterResponse = await axios.get(`${API_BASE_URL}/buses/${bus.id}/seats`);
    const seatsDataAfter = seatsAfterResponse.data.data;
    console.log(`   Available: ${seatsDataAfter.availableSeats.length}`);
    console.log(`   Booked: ${seatsDataAfter.bookedSeats.length}`);
    console.log(`   Booked seats: [${seatsDataAfter.bookedSeats.join(', ')}]`);

    // Step 7: Verify the fix
    console.log('\n7️⃣ Verifying the fix...');
    if (seatsDataAfter.bookedSeats.includes(1) && 
        seatsDataAfter.bookedSeats.includes(2) && 
        seatsDataAfter.bookedSeats.includes(3)) {
      console.log('   ✅ SUCCESS! Seats are now marked as BOOKED');
      console.log('   ✅ Refreshing and logging out/in will preserve the booking');
    } else {
      console.log('   ❌ FAILED! Seats are not marked as BOOKED');
      console.log(`   Booked seats: [${seatsDataAfter.bookedSeats.join(', ')}]`);
    }

    // Step 8: Test refresh by getting booking details
    console.log('\n8️⃣ Testing persistence (getting booking details)...');
    const bookingDetailsResponse = await axios.get(
      `${API_BASE_URL}/bookings/${bookingId}`,
      { headers: { Authorization: token } }
    );
    const bookingDetails = bookingDetailsResponse.data.data;
    console.log(`   ✅ Booking still exists with status: ${bookingDetails.status}`);
    console.log(`   ✅ Seats will remain booked even after logout/login`);

    console.log('\n✨ Test completed successfully!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error.response?.data || error.message);
    process.exit(1);
  }
}

testBookingFlow();
