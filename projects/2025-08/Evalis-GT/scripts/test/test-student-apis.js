const axios = require('axios');

const BASE_URL = 'http://localhost:5000'; // Assuming server is running on port 5000

async function testStudentAPIs() {
  try {
    console.log('🔍 Testing Student Dashboard APIs for Abhay Charan');
    console.log('================================================');
    
    // You'll need to get a valid token first. For testing, let's try with the student's ID
    const studentId = 'S0001'; // Abhay's ID
    
    console.log('\n1. Testing /web3/me endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/api/web3/me`, {
        headers: {
          'Authorization': `Bearer STUDENT_TOKEN_HERE` // You'll need a real token
        }
      });
      console.log('✅ /web3/me response:', response.data);
    } catch (error) {
      console.log('❌ /web3/me error:', error.response?.data || error.message);
    }
    
    console.log('\n2. Testing student balance endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/api/web3/student/${studentId}/balance`, {
        headers: {
          'Authorization': `Bearer TEACHER_TOKEN_HERE` // You'll need a real token
        }
      });
      console.log('✅ Student balance response:', response.data);
    } catch (error) {
      console.log('❌ Student balance error:', error.response?.data || error.message);
    }
    
    console.log('\n3. Testing student certificates endpoint...');
    try {
      const response = await axios.get(`${BASE_URL}/api/web3/student/${studentId}/certificates`, {
        headers: {
          'Authorization': `Bearer TEACHER_TOKEN_HERE` // You'll need a real token
        }
      });
      console.log('✅ Student certificates response:', response.data);
    } catch (error) {
      console.log('❌ Student certificates error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Error testing APIs:', error);
  }
}

// Test the direct controller functions instead
async function testControllerDirectly() {
  try {
    console.log('\n🎯 Testing Controller Functions Directly');
    console.log('======================================');
    
    const { connectDB } = require('./server/config/db');
    await connectDB();
    
    // Test getMyWeb3Profile function
    const web3Controller = require('./server/web3/web3Controller');
    const rewardsController = require('./server/web3/rewardsController');
    
    console.log('\n1. Testing getMyWeb3Profile for student...');
    const mockReq1 = {
      user: { id: 'S0001', role: 'student' }
    };
    
    const mockRes1 = {
      json: (data) => {
        console.log('✅ getMyWeb3Profile response:', JSON.stringify(data, null, 2));
      }
    };
    
    await web3Controller.getMyWeb3Profile(mockReq1, mockRes1);
    
    console.log('\n2. Testing getStudentTokenBalance...');
    const mockReq2 = {
      params: { studentId: 'S0001' }
    };
    
    const mockRes2 = {
      json: (data) => {
        console.log('✅ getStudentTokenBalance response:', JSON.stringify(data, null, 2));
      },
      status: (code) => mockRes2
    };
    
    await rewardsController.getStudentTokenBalance(mockReq2, mockRes2);
    
    console.log('\n3. Testing getStudentBadges...');
    const mockReq4 = {
      params: { studentId: 'S0001' }
    };
    
    const mockRes4 = {
      json: (data) => {
        console.log('✅ getStudentBadges response:', JSON.stringify(data, null, 2));
      },
      status: (code) => mockRes4
    };
    
    await rewardsController.getStudentBadges(mockReq4, mockRes4);
    
    console.log('\n4. Testing getStudentCertificates...');
    const mockReq3 = {
      params: { studentId: 'S0001' }
    };
    
    const mockRes3 = {
      json: (data) => {
        console.log('✅ getStudentCertificates response:', JSON.stringify(data, null, 2));
      },
      status: (code) => mockRes3
    };
    
    await rewardsController.getStudentCertificates(mockReq3, mockRes3);
    
  } catch (error) {
    console.error('Error testing controllers:', error);
  }
  
  process.exit(0);
}

testControllerDirectly();
