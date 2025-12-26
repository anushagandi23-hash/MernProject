const http = require('http');

function getJSON(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

(async () => {
  try {
    // Wait a moment for server to start
    await new Promise(r => setTimeout(r, 2000));
    
    const response = await getJSON('/buses/1');
    const bus = response.bus;

    console.log('\n📊 API RESPONSE CHECK\n');
    console.log('='.repeat(50));
    console.log(`Bus: ${bus.busNumber}`);
    console.log(`Available Seats: ${bus.availableSeats?.length || 0}`);
    console.log(`Reserved Seats: ${bus.reservedSeats?.length || 0}`);
    console.log(`Booked Seats: ${bus.bookedSeats?.length || 0}`);
    console.log('='.repeat(50));

    if (!bus.reservedSeats) {
      console.log('\n❌ ERROR: reservedSeats NOT in response!');
      console.log('Available keys:', Object.keys(bus));
      process.exit(1);
    }

    if (bus.reservedSeats.length > 0) {
      console.log(`\n✅ Reserved Seats: [${bus.reservedSeats.join(', ')}]`);
      console.log('✅ Seats are being properly returned by API!');
    } else {
      console.log('\n⚠️  No reserved seats currently');
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to server on port 5000');
    } else {
      console.log('Error:', error.message);
    }
    process.exit(1);
  }
})();
