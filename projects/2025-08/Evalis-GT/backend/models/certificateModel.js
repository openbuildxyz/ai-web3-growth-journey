const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Certificate = sequelize.define('Certificate', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  submissionId: { type: DataTypes.INTEGER, allowNull: false },
  studentId: { type: DataTypes.STRING, allowNull: false },
  tokenId: { type: DataTypes.STRING, allowNull: false },
  metadataUri: { type: DataTypes.STRING, allowNull: false }, // Updated field name for consistency
  contractAddress: { type: DataTypes.STRING, allowNull: true }, // Made optional since we may not have it initially
  badgeType: { 
    type: DataTypes.ENUM('diamond', 'platinum', 'gold', 'silver', 'bronze'), 
    allowNull: true 
  },
  transactionHash: { type: DataTypes.STRING, allowNull: true },
  chain: { type: DataTypes.STRING, allowNull: false, defaultValue: 'sepolia' },
  phash: { type: DataTypes.STRING, allowNull: true },
  lastVerifiedAt: { type: DataTypes.DATE, allowNull: true },
  lastVerificationOk: { type: DataTypes.BOOLEAN, allowNull: true },
  lastVerificationNotes: { type: DataTypes.TEXT, allowNull: true }
}, { timestamps: true });

module.exports = Certificate;
