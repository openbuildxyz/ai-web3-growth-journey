const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Governance Proposal model
// Stores proposals created by admin for curriculum updates, resource allocation, etc.
const Proposal = sequelize.define('Proposal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING, // e.g., 'course_addition', 'curriculum_update', 'resource_allocation', 'other'
    allowNull: false,
  },
  options: {
    // Array of option strings; JSONB preferred (works on Postgres)
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: ['Yes', 'No'],
  },
  status: {
    type: DataTypes.STRING, // 'active' | 'closed' | 'scheduled'
    allowNull: false,
    defaultValue: 'active',
  },
  startAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdByAdminId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: true,
});

module.exports = Proposal;
