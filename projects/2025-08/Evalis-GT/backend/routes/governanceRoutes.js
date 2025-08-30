const express = require('express');
const router = express.Router();
const { protect, admin, teacher } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/governanceController');

// Proposals
router.post('/proposals', protect, admin, ctrl.createProposal);
router.get('/proposals', protect, ctrl.listProposals);
router.get('/proposals/:id', protect, ctrl.getProposal);
router.post('/proposals/:id/vote', protect, teacher, ctrl.castVote);
router.post('/proposals/:id/close', protect, admin, ctrl.closeProposal);

// Notifications
router.get('/notifications', protect, ctrl.listNotifications);
router.post('/notifications/:id/read', protect, ctrl.markNotificationRead);

module.exports = router;
