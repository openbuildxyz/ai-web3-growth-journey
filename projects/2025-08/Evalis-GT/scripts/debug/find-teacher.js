const { connectDB } = require('./server/config/db');
const { Teacher } = require('./server/models');

async function findTeacher() {
  try {
    await connectDB();
    
    const teachers = await Teacher.findAll({
      limit: 1
    });
    
    if (teachers.length > 0) {
      console.log('Found teacher:', {
        id: teachers[0].id,
        name: teachers[0].name,
        email: teachers[0].email
      });
    } else {
      console.log('No teachers found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

findTeacher();
