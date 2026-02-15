const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createAnnouncement, getAnnouncements } = require('../controllers/instructorController');

const router = express.Router();

router.post('/', protect, authorize('INSTRUCTOR'), createAnnouncement);
router.get('/', protect, authorize('INSTRUCTOR'), getAnnouncements);
// Note: Students usually fetch announcements via course, but we adding a general get for now as per controller

module.exports = router;
