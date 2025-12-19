require('dotenv').config({ path: '../.env' });
const { connectDB } = require('./config/db');
const { Student, Teacher, Admin } = require('./models');
const { mapClerkUserToLocal } = require('./utils/clerk');

async function testTeacherMapping() {
  try {
    await connectDB();
    
    // Mock a Clerk user object for the teacher
    const mockClerkUser = {
      id: 'user_31ucBo2y1iZNZ4GY4kVsANGAcgq',
      emailAddresses: [{ emailAddress: 'anantmishra249@gmail.com' }]
    };
    
    console.log('Testing teacher mapping...');
    console.log('Mock Clerk user:', mockClerkUser);
    
    // Test mapping with teacher role
    const result = await mapClerkUserToLocal(
      mockClerkUser, 
      { Student, Teacher, Admin }, 
      { desiredRole: 'teacher' }
    );
    
    if (result) {
      console.log('\n✅ Mapping successful!');
      console.log('Mapped user:', {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.role
      });
    } else {
      console.log('\n❌ Mapping failed - no result returned');
      
      // Let's debug step by step
      console.log('\nDebugging...');
      const teacher = await Teacher.findOne({ where: { clerkId: mockClerkUser.id } });
      console.log('Teacher found by clerkId:', !!teacher);
      
      if (!teacher) {
        const teacherByEmail = await Teacher.findOne({ where: { email: 'anantmishra249@gmail.com' } });
        console.log('Teacher found by email:', !!teacherByEmail);
        if (teacherByEmail) {
          console.log('Teacher clerkId in DB:', teacherByEmail.clerkId);
        }
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testTeacherMapping();
