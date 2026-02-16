const express = require('express');
const { protect } = require('../middleware/auth');
const { getMyNotifications, markAsRead } = require('../controllers/notificationController');

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
