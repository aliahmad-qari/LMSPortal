const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/upload');
const {
    createAssignment,
    getAssignmentsByCourse,
    getAssignmentById,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    getSubmissions,
    getMySubmission,
    gradeSubmission
} = require('../controllers/assignmentController');

// Instructor routes
router.post('/', protect, authorize('INSTRUCTOR'), upload.single('file'), createAssignment);
router.put('/:id', protect, authorize('INSTRUCTOR'), upload.single('file'), updateAssignment);
router.delete('/:id', protect, authorize('INSTRUCTOR'), deleteAssignment);
router.get('/:id/submissions', protect, authorize('INSTRUCTOR'), getSubmissions);
router.put('/submissions/:id/grade', protect, authorize('INSTRUCTOR'), gradeSubmission);

// Student routes
router.post('/:id/submit', protect, authorize('STUDENT'), upload.single('submission'), submitAssignment);
router.get('/:id/my-submission', protect, authorize('STUDENT'), getMySubmission);

// Shared routes
router.get('/course/:courseId', protect, getAssignmentsByCourse);
router.get('/:id', protect, getAssignmentById);

module.exports = router;
