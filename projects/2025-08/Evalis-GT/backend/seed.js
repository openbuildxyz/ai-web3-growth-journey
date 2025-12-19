const colors = require('colors');
const { connectDB } = require('./config/db');
const seedBatches = require('./seeders/seedBatches');

colors.enable();

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...'.cyan);
    await connectDB();
    
    // Run seeders
    await seedBatches();
    
    console.log('Database seeding completed successfully'.green.bold);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:'.red.bold, error.message);
    process.exit(1);
  }
};

seedDatabase(); 