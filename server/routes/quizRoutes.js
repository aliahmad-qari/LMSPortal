const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createQuiz,
    getQuizzesByCourse,
    getQuizById,
    addQuestion,
    deleteQuiz,
    submitQuiz,
    getQuizAttempts,
    getMyAttempts
} = require('../controllers/quizController');

// Instructor routes
router.post('/', protect, authorize('INSTRUCTOR'), createQuiz);
router.post('/:id/questions', protect, authorize('INSTRUCTOR'), addQuestion);
router.delete('/:id', protect, authorize('INSTRUCTOR'), deleteQuiz);
router.get('/:id/attempts', protect, authorize('INSTRUCTOR'), getQuizAttempts);

// Student routes
router.post('/:id/submit', protect, authorize('STUDENT'), submitQuiz);
router.get('/:id/my-attempts', protect, authorize('STUDENT'), getMyAttempts);

// Shared routes
router.get('/course/:courseId', protect, getQuizzesByCourse);
router.get('/:id', protect, getQuizById);

module.exports = router;
