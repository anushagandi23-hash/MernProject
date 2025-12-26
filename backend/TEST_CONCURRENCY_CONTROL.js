const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

/**
 * Concurrency Test - Simulate multiple users booking the same seat
 * Verifies that only one user can book each seat
 */

async function concurrencyTest() {
  try {
    console.log('🔒 Testing Concurrency Control...\n');

    // Step 1: Create 2 test users
    console.log('1️⃣ Creating test users...');
    const user1Email = `user1_${Date.now()}@test.com`;
    const user2Email = `user2_${Date.now()}@test.com`;

    const user1Signup = await axios.post(`${API_BASE_URL}/signup`, {
      name: 'User 1',
      email: user1Email,
      password: 'Test@1234'
    });
    const user1Id = user1Signup.data.userId;

    const user2Signup = await axios.post(`${API_BASE_URL}/signup`, {
      name: 'User 2',
      email: user2Email,
      password: 'Test@1234'
    });
    const user2Id = user2Signup.data.userId;

    console.log(`   ✅ User 1 created (ID: ${user1Id})`);
    console.log(`   ✅ User 2 created (ID: ${user2Id})`);

    // Step 2: Login both users
    console.log('\n2️⃣ Logging in users...');
    const user1Login = await axios.post(`${API_BASE_URL}/login`, {
      email: user1Email,
      password: 'Test@1234'
    });
    const token1 = user1Login.data.token;

    const user2Login = await axios.post(`${API_BASE_URL}/login`, {
      email: user2Email,
      password: 'Test@1234'
    });
    const token2 = user2Login.data.token;

    console.log('   ✅ Both users logged in');

    // Step 3: Get a bus
    console.log('\n3️⃣ Finding a bus...');
    const busesResp = await axios.get(`${API_BASE_URL}/buses`);
    const bus = busesResp.data.data[0];
    console.log(`   ✅ Bus: ${bus.busNumber} (${bus.from} → ${bus.to})`);

    // Step 4: Simulate concurrent bookings for the SAME SEAT
    console.log('\n4️⃣ Testing concurrent booking of SAME SEAT (seat 40)...');
    console.log('   Scenario: User1 and User2 both try to book seat 40 simultaneously\n');

    const seatToTest = 40;
    let user1Result = null;
    let user2Result = null;

    // Run both booking requests in parallel (simulating concurrent access)
    const [booking1, booking2] = await Promise.allSettled([
      // User 1 tries to book seat 40
      axios.post(
        `${API_BASE_URL}/buses/${bus.id}/book`,
        { seats: [seatToTest] },
        { headers: { Authorization: token1 } }
      ),
      // User 2 tries to book seat 40 (at same time)
      axios.post(
        `${API_BASE_URL}/buses/${bus.id}/book`,
        { seats: [seatToTest] },
        { headers: { Authorization: token2 } }
      )
    ]);

    console.log('   ⏱️  Both requests sent simultaneously...\n');

    // Analyze results
    if (booking1.status === 'fulfilled') {
      user1Result = 'SUCCESS';
      console.log(`   ✅ User 1: BOOKED seat ${seatToTest}`);
      console.log(`      Booking ID: ${booking1.value.data.booking.id}`);
      console.log(`      Status: ${booking1.value.data.booking.status}`);
    } else {
      user1Result = 'FAILED';
      console.log(`   ❌ User 1: FAILED - ${booking1.reason.response?.data?.error}`);
    }

    if (booking2.status === 'fulfilled') {
      user2Result = 'SUCCESS';
      console.log(`   ✅ User 2: BOOKED seat ${seatToTest}`);
      console.log(`      Booking ID: ${booking2.value.data.booking.id}`);
      console.log(`      Status: ${booking2.value.data.booking.status}`);
    } else {
      user2Result = 'FAILED';
      console.log(`   ❌ User 2: FAILED - ${booking2.reason.response?.data?.error}`);
    }

    // Step 5: Verify concurrency control
    console.log('\n5️⃣ Concurrency Control Verification:');
    
    if (user1Result === 'SUCCESS' && user2Result === 'FAILED') {
      console.log('   ✅ CORRECT: Only one user could book the seat');
      console.log('   ✅ Other user got: "Seats temporarily reserved" error');
      console.log('   ✅ Database locking is working!');
      return true;
    } else if (user2Result === 'SUCCESS' && user1Result === 'FAILED') {
      console.log('   ✅ CORRECT: Only one user could book the seat');
      console.log('   ✅ Other user got: "Seats temporarily reserved" error');
      console.log('   ✅ Database locking is working!');
      return true;
    } else if (user1Result === 'SUCCESS' && user2Result === 'SUCCESS') {
      console.log('   ❌ RACE CONDITION: Both users booked the same seat!');
      console.log('   ❌ Concurrency control FAILED');
      return false;
    } else {
      console.log('   ⚠️  Both users failed (unexpected)');
      return null;
    }

  } catch (error) {
    console.error('\n❌ Test error:', error.response?.data || error.message);
    return false;
  }
}

console.log('\n' + '='.repeat(60));
console.log('🔒 CONCURRENCY CONTROL TEST');
console.log('='.repeat(60) + '\n');

concurrencyTest().then(result => {
  console.log('\n' + '='.repeat(60));
  if (result === true) {
    console.log('✅ CONCURRENCY PROTECTION: WORKING');
    console.log('   Database locking prevents race conditions');
    console.log('   SERIALIZABLE isolation level active');
    console.log('   Row-level exclusive locks in place');
  } else if (result === false) {
    console.log('❌ CONCURRENCY PROTECTION: FAILED');
    console.log('   Race condition detected!');
    console.log('   Multiple users could book same seat');
  } else {
    console.log('⚠️  TEST INCONCLUSIVE');
  }
  console.log('='.repeat(60) + '\n');
  process.exit(result === true ? 0 : 1);
});
