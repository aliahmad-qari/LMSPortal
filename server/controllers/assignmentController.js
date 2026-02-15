const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const fs = require('fs');
const path = require('path');

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Instructor
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, courseId, dueDate, totalMarks } = req.body;

        if (!title || !description || !courseId || !dueDate) {
            return res.status(400).json({ message: 'Title, description, courseId, and dueDate are required' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Verify instructor owns the course
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to add assignment to this course' });
        }

        let fileUrl = '';
        if (req.file) {
            fileUrl = `/uploads/assignments/${req.file.filename}`;
        }

        const assignment = await Assignment.create({
            title,
            description,
            course: courseId,
            createdBy: req.user._id,
            dueDate,
            totalMarks: totalMarks || 100,
            fileUrl
        });

        res.status(201).json(assignment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get assignments for a course (Instructor & Student)
// @route   GET /api/assignments/course/:courseId
// @access  Private
exports.getAssignmentsByCourse = async (req, res) => {
    try {
        const assignments = await Assignment.find({ course: req.params.courseId }).sort({ dueDate: 1 });
        res.json(assignments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignmentById = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.json(assignment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Instructor
exports.updateAssignment = async (req, res) => {
    try {
        let assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Verify ownership
        if (assignment.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { title, description, dueDate, totalMarks } = req.body;

        assignment.title = title || assignment.title;
        assignment.description = description || assignment.description;
        assignment.dueDate = dueDate || assignment.dueDate;
        assignment.totalMarks = totalMarks || assignment.totalMarks;

        if (req.file) {
            // Delete old file if exists
            if (assignment.fileUrl) {
                const oldPath = path.join(__dirname, '..', assignment.fileUrl);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            assignment.fileUrl = `/uploads/assignments/${req.file.filename}`;
        }

        await assignment.save();
        res.json(assignment);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Instructor
exports.deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (assignment.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete associated file
        if (assignment.fileUrl) {
            const filePath = path.join(__dirname, '..', assignment.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete all submissions
        await Submission.deleteMany({ assignment: assignment._id });

        await assignment.deleteOne();
        res.json({ message: 'Assignment removed' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Student
exports.submitAssignment = async (req, res) => {
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
            // Remove old file
            if (existing.fileUrl) {
                const oldPath = path.join(__dirname, '..', existing.fileUrl);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

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
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Instructor
exports.getSubmissions = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (assignment.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const submissions = await Submission.find({ assignment: req.params.id })
            .populate('student', 'name email')
            .sort({ submittedAt: -1 });

        res.json(submissions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get my submission
// @route   GET /api/assignments/:id/my-submission
// @access  Student
exports.getMySubmission = async (req, res) => {
    try {
        const submission = await Submission.findOne({
            assignment: req.params.id,
            student: req.user._id
        });
        res.json(submission);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Grade submission
// @route   PUT /api/assignments/submissions/:id/grade
// @access  Instructor
exports.gradeSubmission = async (req, res) => {
    try {
        const { grade, feedback } = req.body;

        if (grade === undefined) {
            return res.status(400).json({ message: 'Grade is required' });
        }

        const submission = await Submission.findById(req.params.id).populate('assignment');
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Verify instructor owns the assignment
        // Note: submission.assignment is now the populated object
        if (submission.assignment.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        submission.grade = grade;
        submission.feedback = feedback || '';
        submission.status = 'GRADED';
        await submission.save();

        res.json(submission);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
