const express = require('express');
const router = express.Router();
const LiveClass = require('../models/LiveClass');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

// Create/Update live class (Instructor)
router.post('/', protect, authorize('INSTRUCTOR'), async (req, res) => {
    try {
        const { courseId, meetingLink, platform } = req.body;
        if (!courseId || !meetingLink) {
            return res.status(400).json({ message: 'Course ID and meeting link are required' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Deactivate previous live classes for this course
        await LiveClass.updateMany(
            { course: courseId, isActive: true },
            { isActive: false, endedAt: new Date() }
        );

        // Create new live class
        const liveClass = await LiveClass.create({
            course: courseId,
            instructor: req.user._id,
            meetingLink,
            platform: platform || 'Other',
            isActive: true
        });

        res.status(201).json(liveClass);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get active live class for a course (Student/Instructor)
router.get('/course/:courseId', protect, async (req, res) => {
    try {
        const liveClass = await LiveClass.findOne({
            course: req.params.courseId,
            isActive: true
        }).populate('instructor', 'name');

        res.json(liveClass);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// End live class (Instructor)
router.put('/:id/end', protect, authorize('INSTRUCTOR'), async (req, res) => {
    try {
        const liveClass = await LiveClass.findById(req.params.id);
        if (!liveClass) {
            return res.status(404).json({ message: 'Live class not found' });
        }
        if (liveClass.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        liveClass.isActive = false;
        liveClass.endedAt = new Date();
        await liveClass.save();

        res.json({ message: 'Live class ended' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
