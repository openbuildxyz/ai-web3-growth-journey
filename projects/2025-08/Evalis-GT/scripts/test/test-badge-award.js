const axios = require('axios');

async function testBadgeAwarding() {
  try {
    console.log('Testing badge awarding for Abhay Charan...');
    
    // First, find Abhay's submission ID
    const response = await axios.post('http://localhost:3000/api/web3/award/badge-rewards', {
      submissionId: 1, // Assuming this is Abhay's submission ID - we might need to adjust
      awardCertificate: false
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Badge award response:', response.data);
    
  } catch (error) {
    console.log('Badge award error:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message);
    console.log('Full error:', error.response?.data);
  }
}

testBadgeAwarding();
