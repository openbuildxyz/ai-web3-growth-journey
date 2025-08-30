const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  createUser,
  getAllUsers,
  deleteUser
} = require('../controllers/adminUserController');
const { migrateFirebaseToClerk } = require('../controllers/migrationController');

const router = express.Router();

// Apply authentication and admin-only middleware to all routes
router.use(protect);
router.use(adminOnly);

// User management routes
router.post('/create', createUser);
router.get('/', getAllUsers);
router.delete('/:id', deleteUser);

// Migration route (one-time use)
router.post('/migrate-firebase', migrateFirebaseToClerk);

module.exports = router;
