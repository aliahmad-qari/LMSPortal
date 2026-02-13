const express = require('express');
const router = express.Router();
const Lecture = require('../models/Lecture');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/upload');

// Create lecture with file upload (instructor)
router.post('/', protect, authorize('INSTRUCTOR'), upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, courseId, duration, order } = req.body;
        if (!title || !courseId) {
            return res.status(400).json({ message: 'Title and courseId are required' });
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to add lectures to this course' });
        }

        let videoUrl = '';
        let pdfUrl = '';
        if (req.files && req.files.video) {
            videoUrl = `/uploads/videos/${req.files.video[0].filename}`;
        }
        if (req.files && req.files.pdf) {
            pdfUrl = `/uploads/pdfs/${req.files.pdf[0].filename}`;
        }

        const lecture = await Lecture.create({
            title,
            course: courseId,
            videoUrl,
            pdfUrl,
            duration: duration || '',
            order: order || 0
        });
        res.status(201).json(lecture);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get lectures for a course
router.get('/course/:courseId', protect, async (req, res) => {
    try {
        const lectures = await Lecture.find({ course: req.params.courseId }).sort({ order: 1 });
        res.json(lectures);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete lecture
router.delete('/:id', protect, authorize('INSTRUCTOR'), async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id).populate('course');
        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }
        if (lecture.course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await Lecture.findByIdAndDelete(req.params.id);
        res.json({ message: 'Lecture deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
