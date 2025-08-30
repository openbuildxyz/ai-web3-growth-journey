const dotenv = require('dotenv');
const colors = require('colors');
const { connectDB, sequelize } = require('./config/db');

// Load environment variables
dotenv.config();

const setupFreshDatabase = async () => {
  try {
    console.log('🚀 Setting up fresh database...'.cyan.bold);
    console.log('Connecting to database...'.yellow);
    await connectDB();
    
    console.log('Creating database tables...'.yellow);
    
    // Import all models to ensure they are registered
    const models = require('./models');
    
    // Force sync to recreate all tables
    await sequelize.sync({ force: true });
    console.log('✅ All database tables created successfully!'.green.bold);
    
    // Import and run seeders
    console.log('🌱 Seeding database with initial data...'.yellow);
    
    // Seed batches first
    const seedBatches = require('./seeders/seedBatches');
    await seedBatches();
    console.log('✅ Batches seeded successfully!'.green);
    
    // Seed semesters
    const seedSemesters = require('./seeders/seedSemesters');
    await seedSemesters();
    console.log('✅ Semesters seeded successfully!'.green);
    
    // Create default admin
    console.log('👤 Creating default admin user...'.yellow);
    const Admin = require('./models/adminModel');
    const bcrypt = require('bcryptjs');
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD || 'admin123', salt);
    
    await Admin.create({
      username: 'admin',
      password: hashedPassword,
      name: 'System Administrator',
      email: 'admin@evalis.com'
    });
    console.log('✅ Default admin created successfully!'.green);
    console.log('📋 Admin credentials:'.cyan);
    console.log(`   Username: admin`.cyan);
    console.log(`   Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'}`.cyan);
    
    console.log('\n🎉 Database setup completed successfully!'.green.bold);
    console.log('Your Evalis system is ready to use.'.green);
    
    // Close connection
    await sequelize.close();
    console.log('Connection closed.'.yellow);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:'.red.bold);
    console.error(`${error.message}`.red);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the setup
setupFreshDatabase();
