const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Subject = sequelize.define('Subject', {
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
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  credits: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  // Primary relationship - every subject should be tied to a semester
  semesterId: {
    type: DataTypes.STRING,
    allowNull: true, // Keeping allowNull: true for backward compatibility with existing data
    references: {
      model: 'Semesters',
      key: 'id'
    }
  },
  // Secondary relationship - kept for backward compatibility
  batchId: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'Batches',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

module.exports = Subject; 