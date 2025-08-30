const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TeacherSubject = sequelize.define('TeacherSubject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  teacherId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Teachers',
      key: 'id'
    }
  },
  subjectId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Subjects',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['teacherId', 'subjectId']
    }
  ]
});

module.exports = TeacherSubject; 