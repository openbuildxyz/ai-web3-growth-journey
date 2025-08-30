const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Vote model linking Teacher to Proposal
const ProposalVote = sequelize.define('ProposalVote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  proposalId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  teacherId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  choiceIndex: {
    // Index into Proposal.options
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['proposalId', 'teacherId'] }
  ]
});

module.exports = ProposalVote;
