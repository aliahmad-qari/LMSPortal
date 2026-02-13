const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// Get chat history for a room
router.get('/:roomId', protect, async (req, res) => {
    try {
        const messages = await Message.find({ roomId: req.params.roomId })
            .sort({ timestamp: 1 })
            .limit(100);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all rooms the user has participated in
router.get('/', protect, async (req, res) => {
    try {
        const rooms = await Message.aggregate([
            { $match: { sender: req.user._id } },
            { $group: { _id: '$roomId', lastMessage: { $last: '$text' }, lastTime: { $last: '$timestamp' } } },
            { $sort: { lastTime: -1 } }
        ]);
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
