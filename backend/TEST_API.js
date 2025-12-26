/**
 * TEST_API.js - Test that API returns correct seat status
 * This tests that the frontend receives all seat information
 */

const http = require('http');

function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testAPI() {
  try {
    console.log('\n🧪 TESTING API RESPONSES\n');
    console.log('='.repeat(60));

    // Wait for server to be ready
    let retries = 5;
    let response;
    
    while (retries > 0) {
      try {
        response = await makeRequest('GET', '/buses/1');
        break;
      } catch (e) {
        retries--;
        if (retries === 0) throw new Error('Server not responding');
        console.log('⏳ Waiting for server...');
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    console.log('\n✅ Server is running\n');

    // Test GET /buses/1 - Should return reservedSeats
    console.log('📋 Testing GET /buses/1');
    console.log('-'.repeat(60));
    
    if (!response || !response.data || !response.data.bus) {
      console.log('❌ Invalid response format');
      console.log('Response:', response);
      process.exit(1);
    }

    const bus = response.data.bus;
    console.log(`Bus: ${bus.busNumber}`);
    console.log(`Total Seats: ${bus.totalSeats}`);
    console.log(`Available: ${bus.availableSeats?.length || 0}`);
    console.log(`Reserved: ${bus.reservedSeats?.length || 0}`);
    console.log(`Booked: ${bus.bookedSeats?.length || 0}`);
    console.log(`Occupancy: ${bus.occupancyPercentage}%\n`);

    // Check if reservedSeats is returned
    if (!bus.reservedSeats) {
      console.log('❌ ERROR: API is NOT returning "reservedSeats" array!');
      console.log('   Available keys:', Object.keys(bus));
      process.exit(1);
    }

    // Check if reserved seats are correct
    if (bus.reservedSeats.length === 0) {
      console.log('⚠️  Warning: No reserved seats in API response');
      console.log('   But database has reserved seats (20, 21, 22)');
      process.exit(1);
    }

    // Verify the reserved seats match database
    const expectedReserved = [20, 21, 22];
    const actualReserved = bus.reservedSeats.sort((a, b) => a - b);
    
    console.log(`Expected Reserved: [${expectedReserved}]`);
    console.log(`Actual Reserved: [${actualReserved}]`);

    if (JSON.stringify(expectedReserved) !== JSON.stringify(actualReserved)) {
      console.log('❌ Reserved seats don\'t match!');
      process.exit(1);
    }

    console.log('✅ Reserved seats are correctly returned!\n');

    console.log('='.repeat(60));
    console.log('✅ API TEST PASSED!\n');
    console.log('🎉 Frontend will now correctly receive:');
    console.log('   - availableSeats array');
    console.log('   - reservedSeats array (for display)');
    console.log('   - bookedSeats array\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

testAPI();
