const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const colors = require('colors');
const { connectDB, sequelize } = require('./config/db');
const { Student, Batch } = require('./models');

// Load environment variables
dotenv.config();

const addFirebaseStudent = async () => {
  try {
    console.log('Connecting to NeonDB...'.yellow);
    await connectDB();
    
    // Get the test batch
    const batch = await Batch.findOne({ where: { id: 'TB2025' } });
    
    if (!batch) {
      console.log('Test batch not found. Please run createTestUsers.js first'.red);
      process.exit(1);
    }
    
    // Create Firebase student
    console.log('Creating Firebase student...'.cyan);
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const [student, created] = await Student.findOrCreate({
      where: { email: 'anntmishraa@gmail.com' },
      defaults: {
        id: 'S_FB_001',
        name: 'Anant Mishra',
        section: 'A',
        batch: 'TB2025',
        email: 'anntmishraa@gmail.com',
        password: hashedPassword,
        role: 'student'
      }
    });
    
    if (created) {
      console.log('Firebase student created successfully!'.green);
      console.log('Student Details:'.cyan);
      console.log(`ID: ${student.id}`);
      console.log(`Name: ${student.name}`);
      console.log(`Email: ${student.email}`);
      console.log(`Password: password123`);
    } else {
      console.log('Student with this email already exists'.yellow);
    }
    
  } catch (error) {
    console.error('Error creating Firebase student:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.'.gray);
  }
};

addFirebaseStudent();