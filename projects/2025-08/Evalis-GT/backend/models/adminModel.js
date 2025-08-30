const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  clerkId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'admin',
  }
}, {
  timestamps: true,
  hooks: {
    beforeSave: async (admin) => {
      // Only hash password if it has been modified (or is new)
      if (!admin.changed('password')) {
        return;
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(admin.password, salt);
    }
  }
});

// Instance method to check if entered password matches the stored hashed password
Admin.prototype.matchPassword = async function(enteredPassword) {
  try {
    console.log(`Comparing password for admin: ${this.username}`);
    console.log(`Entered password length: ${enteredPassword?.length || 'undefined'}`);
    console.log(`Stored password hash length: ${this.password?.length || 'undefined'}`);
    
    if (!enteredPassword) {
      console.error('No password provided for comparison');
      return false;
    }
    
    if (!this.password) {
      console.error('Admin record has no stored password hash');
      return false;
    }
    
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log(`Password match result: ${isMatch}`);
    return isMatch;
  } catch (error) {
    console.error(`Error comparing passwords: ${error.message}`);
    console.error(error.stack);
    return false;
  }
};

module.exports = Admin; 