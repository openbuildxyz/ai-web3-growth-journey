require('dotenv').config();
const axios = require('axios');

async function testStudentSubjects() {
    console.log('🔍 Testing Student Subjects API');
    console.log('==============================');
    
    try {
        // First, login as a student
        console.log('📋 Step 1: Logging in as student S0001...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/student/login', {
            id: 'S0001',
            password: 'password123'
        });
        
        console.log('✅ Login successful');
        const token = loginResponse.data.token;
        
        // Now call the subjects endpoint
        console.log('📚 Step 2: Fetching subjects...');
        const subjectsResponse = await axios.get('http://localhost:5000/api/students/subjects', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log(`✅ Subjects response:`, subjectsResponse.data);
        console.log(`📊 Found ${subjectsResponse.data.length} subjects`);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testStudentSubjects();
