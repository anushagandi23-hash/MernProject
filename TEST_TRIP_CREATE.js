const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testTripCreation() {
  try {
    // First login as admin
    console.log('1️⃣  Logging in as admin...');
    const loginRes = await axios.post(`${API_URL}/login`, {
      email: 'admin-test123@email.com',
      password: 'Admin@123'
    });

    if (!loginRes.data.success) {
      console.log('❌ Login failed:', loginRes.data.error);
      return;
    }

    const token = loginRes.data.token;
    console.log('✅ Login successful, token:', token.substring(0, 20) + '...');

    // Get list of buses
    console.log('\n2️⃣  Fetching buses...');
    const busRes = await axios.get(`${API_URL}/buses`);
    console.log('✅ Buses:', busRes.data.data?.slice(0, 2) || 'No buses');

    if (!busRes.data.data || busRes.data.data.length === 0) {
      console.log('❌ No buses available. Need to create a bus first.');
      return;
    }

    const bus = busRes.data.data[0];
    console.log('Using bus:', { id: bus.id, busNumber: bus.busNumber });

    // Create a trip
    console.log('\n3️⃣  Creating trip...');
    const tripRes = await axios.post(
      `${API_URL}/trips/create`,
      {
        busId: bus.id,
        busName: bus.busNumber,
        startTime: new Date(new Date().getTime() + 86400000).toISOString(), // Tomorrow
        endTime: new Date(new Date().getTime() + 86400000 + 3600000).toISOString(), // Tomorrow + 1hr
        from: 'Delhi',
        to: 'Mumbai',
        totalSeats: 40,
        pricePerSeat: 1500
      },
      {
        headers: {
          Authorization: token
        }
      }
    );

    if (tripRes.data.success) {
      console.log('✅ Trip created successfully!');
      console.log('Trip details:', tripRes.data.trip);
    } else {
      console.log('❌ Trip creation failed:', tripRes.data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testTripCreation();
