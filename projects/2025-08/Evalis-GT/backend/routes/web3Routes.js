const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../web3/web3Controller');
const rewardsCtrl = require('../web3/rewardsController');

// Link current user's wallet address
router.post('/link-wallet', protect, ctrl.linkWallet);
// Get my wallet link status
router.get('/me', protect, ctrl.getMyWeb3Profile);
// Test mint endpoint for any authenticated user (development only)
router.post('/test-mint', protect, ctrl.testMintTokens);
// Admin-only mint endpoint to reward a teacher or student by id
router.post('/admin/mint', protect, ctrl.adminMintTokens);

// Rewards and NFT routes
// Award EVT tokens to student for good performance
router.post('/award/tokens', protect, rewardsCtrl.awardEvtTokens);
// Award badge-based EVT tokens and NFT certificate based on grade
router.post('/award/badge-rewards', protect, rewardsCtrl.awardBadgeBasedRewards);
// Award NFT certificate to student for submission
router.post('/award/certificate', protect, rewardsCtrl.awardNftCertificate);
// Manual NFT certificate awarding (can be used regardless of grade)
router.post('/award/certificate/manual', protect, rewardsCtrl.awardManualCertificate);
// Get student's token balance
router.get('/student/:studentId/balance', protect, rewardsCtrl.getStudentTokenBalance);
// Get student's certificates
router.get('/student/:studentId/certificates', protect, rewardsCtrl.getStudentCertificates);
// Get student's badges
router.get('/student/:studentId/badges', protect, rewardsCtrl.getStudentBadges);
// Batch award tokens to multiple students
router.post('/award/tokens/batch', protect, rewardsCtrl.batchAwardTokens);
// Get available badge tiers
router.get('/badges', rewardsCtrl.getBadgeTiers);
// Get badge for specific grade
router.get('/badge/grade/:grade', rewardsCtrl.getBadgeForGrade);

module.exports = router;
