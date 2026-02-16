const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getCategories, createCategory, deleteCategory } = require('../controllers/adminController');

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), createCategory);
router.delete('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), deleteCategory);

module.exports = router;
