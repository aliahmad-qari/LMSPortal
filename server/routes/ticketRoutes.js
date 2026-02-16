const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getTickets, replyTicket } = require('../controllers/adminController');
const { createTicket, getMyTickets } = require('../controllers/studentController');

const router = express.Router();

// Admin routes
router.get('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), getTickets);
router.put('/:id/reply', protect, authorize('ADMIN', 'SUPER_ADMIN'), replyTicket);

// Student routes
router.post('/', protect, authorize('STUDENT'), createTicket);
router.get('/my-tickets', protect, authorize('STUDENT'), getMyTickets);

module.exports = router;
