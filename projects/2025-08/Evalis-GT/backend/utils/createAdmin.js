const bcrypt = require('bcryptjs');

const createDefaultAdmin = async () => {
  try {
    const { Admin } = require('../models');
    
    // Default admin credentials
    const adminData = {
      username: 'admin',
      name: 'Administrator',
      email: 'admin@evalis.edu',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
      role: 'admin'
    };
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ where: { username: adminData.username } });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return existingAdmin;
    }
    
    // Create new admin user
    const admin = await Admin.create(adminData);
    console.log('✅ Default admin user created successfully');
    console.log(`📧 Username: ${adminData.username}`);
    console.log(`🔑 Password: ${adminData.password}`);
    
    return admin;
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
    // Don't throw error to prevent server startup failure
    return null;
  }
};

module.exports = {
  createDefaultAdmin
};
