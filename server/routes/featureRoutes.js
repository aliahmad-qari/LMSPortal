const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getCourseAnalytics } = require('../controllers/instructorController');
const { getResults } = require('../controllers/studentController');

const router = express.Router();

// Instructor Analytics
router.get('/instructor/analytics', protect, authorize('INSTRUCTOR'), getCourseAnalytics);

// Student Results
router.get('/student/results', protect, authorize('STUDENT'), getResults);

module.exports = router;
