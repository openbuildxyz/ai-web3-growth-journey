const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const colors = require('colors');
const path = require('path');

// Load production environment variables
dotenv.config({ path: path.join(__dirname, '../.env.production') });

const { connectDB, sequelize } = require('./config/db');
const { Admin } = require('./models');

const createProductionAdmin = async () => {
  try {
    console.log('🔧 Setting up production admin...'.yellow);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`.blue);
    console.log(`🗄️  Database URL: ${process.env.DATABASE_URL ? 'Present' : 'Missing'}`.blue);
    
    // Connect to database
    console.log('🔌 Connecting to production database...'.yellow);
    await connectDB();
    console.log('✅ Database connected successfully'.green);

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ where: { username: 'admin' } });
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists:'.green);
      console.log(`   Username: ${existingAdmin.username}`.gray);
      console.log(`   Email: ${existingAdmin.email}`.gray);
      console.log(`   Name: ${existingAdmin.name}`.gray);
      
      // Update password to ensure it matches production env
      const targetPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'zyExeKhXoMFtd1Gc';
      existingAdmin.password = targetPassword; // Model hook will hash this
      await existingAdmin.save();
      console.log('🔑 Admin password updated to match production environment'.green);
    } else {
      console.log('👤 Creating new admin user...'.cyan);
      
      const adminData = {
        username: 'admin',
        name: 'Administrator',
        email: 'admin@evalis.com',
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'zyExeKhXoMFtd1Gc',
        role: 'admin'
      };
      
      const newAdmin = await Admin.create(adminData);
      console.log('✅ Admin user created successfully:'.green);
      console.log(`   Username: ${newAdmin.username}`.gray);
      console.log(`   Email: ${newAdmin.email}`.gray);
      console.log(`   Name: ${newAdmin.name}`.gray);
    }

    // Verify admin can be found
    const verifyAdmin = await Admin.findOne({ where: { username: 'admin' } });
    if (verifyAdmin) {
      console.log('✅ Admin verification successful'.green);
      console.log('🎯 Production admin setup complete!'.green.bold);
      
      console.log('\n📋 Login Credentials:'.yellow.bold);
      console.log(`   Username: admin`.white);
      console.log(`   Password: ${process.env.DEFAULT_ADMIN_PASSWORD || 'zyExeKhXoMFtd1Gc'}`.white);
      console.log(`   URL: https://evalis-gt.vercel.app/login`.white);
    } else {
      throw new Error('Admin verification failed');
    }

    // Close connection
    await sequelize.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error setting up production admin:'.red.bold);
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  createProductionAdmin();
}

module.exports = { createProductionAdmin };
