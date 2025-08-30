const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Students',
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
  },
  assignmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Assignments',
      key: 'id'
    }
  },
  examType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  submissionText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  submissionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  letterGrade: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gradePoints: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  plagiarismScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  feedback: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  graded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  gradedBy: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'Teachers',
      key: 'id'
    }
  },
  gradedDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  gradedFileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  annotations: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: true
});

module.exports = Submission; 