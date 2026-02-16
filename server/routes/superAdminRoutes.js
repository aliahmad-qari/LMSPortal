const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getLogs, getSystemStats } = require('../controllers/superAdminController');

const router = express.Router();

router.get('/logs', protect, authorize('SUPER_ADMIN'), getLogs);
router.get('/stats', protect, authorize('SUPER_ADMIN'), getSystemStats);

module.exports = router;
