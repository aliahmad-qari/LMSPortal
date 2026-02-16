const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { addQuestionToBank, getQuestionBank } = require('../controllers/instructorController');

const router = express.Router();

router.post('/', protect, authorize('INSTRUCTOR'), addQuestionToBank);
router.get('/', protect, authorize('INSTRUCTOR'), getQuestionBank);

module.exports = router;
