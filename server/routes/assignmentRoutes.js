const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/upload');

// Create assignment (instructor)
router.post('/', protect, authorize('INSTRUCTOR'), async (req, res) => {
    try {
        const { title, description, courseId, dueDate, totalMarks } = req.body;
        if (!title || !description || !courseId || !dueDate) {
            return res.status(400).json({ message: 'Title, description, courseId, and dueDate are required' });
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const assignment = await Assignment.create({
            title,
            description,
            course: courseId,
            dueDate,
            totalMarks: totalMarks || 100
        });
        res.status(201).json(assignment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get assignments for a course
router.get('/course/:courseId', protect, async (req, res) => {
    try {
        const assignments = await Assignment.find({ course: req.params.courseId }).sort({ dueDate: 1 });
        res.json(assignments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submit assignment (student) — file upload
router.post('/:id/submit', protect, authorize('STUDENT'), upload.single('submission'), async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }
        // Check if already submitted
        const existing = await Submission.findOne({
            assignment: req.params.id,
            student: req.user._id
        });
        if (existing) {
            // Update existing submission
            existing.fileUrl = `/uploads/assignments/${req.file.filename}`;
            existing.status = 'PENDING';
            existing.submittedAt = Date.now();
            await existing.save();
            return res.json(existing);
        }
        const submission = await Submission.create({
            assignment: req.params.id,
            student: req.user._id,
            studentName: req.user.name,
            fileUrl: `/uploads/assignments/${req.file.filename}`,
            status: 'PENDING'
        });
        res.status(201).json(submission);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get submissions for an assignment (instructor)
router.get('/:id/submissions', protect, authorize('INSTRUCTOR'), async (req, res) => {
    try {
        const submissions = await Submission.find({ assignment: req.params.id })
            .populate('student', 'name email')
            .sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get my submission for an assignment (student)
router.get('/:id/my-submission', protect, authorize('STUDENT'), async (req, res) => {
    try {
        const submission = await Submission.findOne({
            assignment: req.params.id,
            student: req.user._id
        });
        res.json(submission);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Grade submission (instructor)
router.put('/submissions/:id/grade', protect, authorize('INSTRUCTOR'), async (req, res) => {
    try {
        const { grade, feedback } = req.body;
        if (grade === undefined) {
            return res.status(400).json({ message: 'Grade is required' });
        }
        const submission = await Submission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        submission.grade = grade;
        submission.feedback = feedback || '';
        submission.status = 'GRADED';
        await submission.save();
        res.json(submission);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
