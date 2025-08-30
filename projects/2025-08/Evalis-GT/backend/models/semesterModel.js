const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Semester = sequelize.define('Semester', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 8
    }
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  batchId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Batches',
      key: 'id'
    }
  }
}, {
  timestamps: true
});

// Static method to generate semester ID
Semester.generateSemesterId = async function(batchId, semesterNumber) {
  // Format: BATCH_ID-S-SEMESTER_NUMBER (e.g., B2023CSE-S-1)
  return `${batchId}-S-${semesterNumber}`;
};

module.exports = Semester; 