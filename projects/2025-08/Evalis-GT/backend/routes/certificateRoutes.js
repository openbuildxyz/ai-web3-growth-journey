const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const ctrl = require('../web3/certificateController');

router.post('/issue', protect, admin, ctrl.issueCertificate);
router.get('/verify/:id', ctrl.verifyCertificate);
router.get('/student/:studentId?', protect, ctrl.listStudentCertificates);

module.exports = router;
