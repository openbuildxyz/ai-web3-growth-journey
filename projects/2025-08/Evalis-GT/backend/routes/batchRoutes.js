const express = require('express');
const router = express.Router();
const {
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  getBatchStudents,
} = require('../controllers/batchController');
const { protect, admin, teacher } = require('../middleware/authMiddleware');

// Route: /api/batches
router.route('/')
  .get(protect, getAllBatches)
  .post(protect, admin, createBatch);

// Route: /api/batches/:id
router.route('/:id')
  .get(protect, getBatchById)
  .put(protect, admin, updateBatch)
  .delete(protect, admin, deleteBatch);

router.route('/:id/students')
  .get(protect, getBatchStudents);

module.exports = router; 