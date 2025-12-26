// Test the signup endpoint
const axios = require('axios');

const testSignup = async () => {
  try {
    console.log('Testing signup at: http://localhost:5000/signup');
    
    const response = await axios.post('http://localhost:5000/signup', {
      name: 'Admin Test User',
      email: 'admin-testuser@email.com',
      password: 'AdminTest@123'
    });
    
    console.log('✅ SIGNUP SUCCESS:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ SIGNUP FAILED:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testSignup();
