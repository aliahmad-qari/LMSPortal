const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getPendingCourses, approveCourse, rejectCourse } = require('../controllers/adminController');

const router = express.Router();

router.get('/courses/pending', protect, authorize('ADMIN', 'SUPER_ADMIN'), getPendingCourses);
router.put('/courses/:id/approve', protect, authorize('ADMIN', 'SUPER_ADMIN'), approveCourse);
router.put('/courses/:id/reject', protect, authorize('ADMIN', 'SUPER_ADMIN'), rejectCourse);

module.exports = router;
