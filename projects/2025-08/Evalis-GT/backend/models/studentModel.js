const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  section: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  batch: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
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
    defaultValue: 'student',
  },
  walletAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEthAddressOrNull(value) {
        if (value && !/^0x[a-fA-F0-9]{40}$/.test(value)) {
          throw new Error('Invalid Ethereum address');
        }
      }
    }
  },
  activeSemesterId: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'Semesters',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  hooks: {
    beforeSave: async (student) => {
      // Only hash password if it has been modified (or is new)
      if (!student.changed('password')) {
        return;
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(student.password, salt);
    }
  }
});

// Instance method to check if entered password matches the stored hashed password
Student.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = Student; 