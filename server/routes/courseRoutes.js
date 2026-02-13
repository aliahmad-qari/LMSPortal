const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const Assignment = require('../models/Assignment');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/upload');

// Create course (instructor only)
router.post('/', protect, authorize('INSTRUCTOR'), upload.single('thumbnail'), async (req, res) => {
    try {
        const { title, description, category } = req.body;
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }
        const course = await Course.create({
            title,
            description,
            instructor: req.user._id,
            instructorName: req.user.name,
            category: category || 'General',
            thumbnail: req.file ? `/uploads/thumbnails/${req.file.filename}` : ''
        });
        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all courses (public listing)
router.get('/', protect, async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = { isPublished: true };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (category && category !== 'All') {
            query.category = category;
        }
        const courses = await Course.find(query)
            .populate('instructor', 'name email')
            .sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get enrolled courses (student)
router.get('/enrolled', protect, authorize('STUDENT'), async (req, res) => {
    try {
        const courses = await Course.find({ enrolledStudents: req.user._id })
            .populate('instructor', 'name email')
            .sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get instructor's courses
router.get('/teaching', protect, authorize('INSTRUCTOR'), async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user._id })
            .sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single course with lectures and assignments
router.get('/:id', protect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name email')
            .populate('enrolledStudents', 'name email');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const lectures = await Lecture.find({ course: req.params.id }).sort({ order: 1 });
        const assignments = await Assignment.find({ course: req.params.id }).sort({ dueDate: 1 });

        const isEnrolled = course.enrolledStudents.some(
            s => s._id.toString() === req.user._id.toString()
        );
        const isInstructor = course.instructor._id.toString() === req.user._id.toString();

        res.json({
            course,
            lectures,
            assignments,
            isEnrolled,
            isInstructor
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Enroll in course (student)
router.post('/:id/enroll', protect, authorize('STUDENT'), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (course.enrolledStudents.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }
        course.enrolledStudents.push(req.user._id);
        await course.save();
        res.json({ message: 'Enrolled successfully', course });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update course (instructor)
router.put('/:id', protect, authorize('INSTRUCTOR'), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this course' });
        }
        const { title, description, category, isPublished } = req.body;
        if (title) course.title = title;
        if (description) course.description = description;
        if (category) course.category = category;
        if (isPublished !== undefined) course.isPublished = isPublished;
        await course.save();
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete course
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (req.user.role === 'INSTRUCTOR' && course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
        }
        await Lecture.deleteMany({ course: req.params.id });
        await Assignment.deleteMany({ course: req.params.id });
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
