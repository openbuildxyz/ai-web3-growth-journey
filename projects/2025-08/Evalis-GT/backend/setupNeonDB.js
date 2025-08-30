const dotenv = require('dotenv');
const colors = require('colors');
const { connectDB, sequelize } = require('./config/db');

// Load environment variables
dotenv.config();

const setupDatabase = async () => {
  try {
    console.log('Connecting to NeonDB...'.yellow);
    await connectDB();
    
    console.log('Creating database tables...'.yellow);
    
    // Import models
    const models = require('./models');
    
    // Sync all models with the database
    // force: false to avoid dropping tables
    await sequelize.sync({ force: false });
    
    console.log('✅ Database tables created successfully!'.green.bold);
    
    // Close connection
    await sequelize.close();
    console.log('Connection closed.'.yellow);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:'.red.bold);
    console.error(`${error.message}`.red);
    process.exit(1);
  }
};

// Run the setup
setupDatabase();