const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @param {string} role - User role (student, teacher, admin)
 * @returns {string} JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h',
  });
};

module.exports = generateToken; 