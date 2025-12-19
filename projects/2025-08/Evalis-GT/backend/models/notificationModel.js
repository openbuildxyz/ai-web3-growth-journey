const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Simple notification model for teachers
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  recipientRole: {
    type: DataTypes.STRING, // 'teacher' | 'student' | 'admin' | 'all'
    allowNull: false,
    defaultValue: 'teacher'
  },
  recipientId: {
    type: DataTypes.STRING, // teacherId when recipientRole='teacher'
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  link: {
    type: DataTypes.STRING, // optional deep link
    allowNull: true,
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  timestamps: true,
});

module.exports = Notification;
