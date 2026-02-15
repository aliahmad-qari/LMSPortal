const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getMyCertificates, generateCertificate } = require('../controllers/studentController');

const router = express.Router();

router.get('/', protect, authorize('STUDENT'), getMyCertificates);
router.post('/generate', protect, authorize('STUDENT'), generateCertificate);

module.exports = router;
