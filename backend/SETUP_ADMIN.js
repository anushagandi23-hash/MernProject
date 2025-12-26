const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function setupAdmin() {
  try {
    console.log('Creating admin account...');
    const signupRes = await axios.post(`${API_URL}/signup`, {
      name: 'Test Admin',
      email: 'admin-testadmin@email.com',
      password: 'Admin@123'
    });

    console.log('Signup response:', signupRes.data);

    // Now login
    console.log('\nLogging in...');
    const loginRes = await axios.post(`${API_URL}/login`, {
      email: 'admin-testadmin@email.com',
      password: 'Admin@123'
    });

    console.log('Login response:', loginRes.data);

    if (loginRes.data.success) {
      const token = loginRes.data.token;
      console.log('✅ Token:', token.substring(0, 20) + '...');

      // Now try to create trip
      console.log('\nGetting buses...');
      const busRes = await axios.get(`${API_URL}/buses`);
      const buses = busRes.data.data;
      console.log('Buses count:', buses?.length);

      if (buses && buses.length > 0) {
        const bus = buses[0];
        console.log('Creating trip with bus:', bus.id, bus.busNumber);

        const tripRes = await axios.post(
          `${API_URL}/trips/create`,
          {
            busId: bus.id,
            busName: bus.busNumber,
            startTime: new Date(Date.now() + 86400000).toISOString(),
            endTime: new Date(Date.now() + 90000000).toISOString(),
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

        console.log('Trip response:', tripRes.data);
      }
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

setupAdmin();
