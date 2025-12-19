// Test the actual API endpoints that the frontend will call
const axios = require('axios');

const BASE_URL = 'http://localhost:5000'; // Adjust port if needed

async function testFrontendAPIs() {
  try {
    console.log('🔍 Testing Frontend API Calls');
    console.log('===============================');
    
    // Test the /web3/me endpoint (what the frontend calls for token balance)
    console.log('\n1. Testing /web3/me endpoint...');
    try {
      // We need to simulate a logged-in student request
      // In reality, this would have authentication headers
      const response = await axios.get(`${BASE_URL}/api/web3/me`, {
        headers: {
          'Authorization': 'Bearer fake-token' // This will fail, but we can see the structure
        }
      });
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.log('❌ Expected auth error (needs real login):', error.response?.status, error.response?.data?.message);
    }
    
    // Test direct badge endpoint
    console.log('\n2. Testing badges endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/api/web3/student/S0001/badges`, {
        headers: {
          'Authorization': 'Bearer fake-token'
        }
      });
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.log('❌ Expected auth error:', error.response?.status, error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFrontendAPIs();
