const Course = require('../models/Course');
const Category = require('../models/Category');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const Log = require('../models/Log');

// --- Course Approvals ---

// @desc    Get pending courses
// @route   GET /api/admin/courses/pending
// @access  Admin
exports.getPendingCourses = async (req, res) => {
    try {
        // Assuming courses have an 'isPublished' flag or 'status' field. 
        // Based on existing schema, we might depend on isPublished=false
        const courses = await Course.find({ isPublished: false }).populate('instructor', 'name email');
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Approve course
// @route   PUT /api/admin/courses/:id/approve
// @access  Admin
exports.approveCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        course.isPublished = true;
        await course.save();

        // Notify Instructor
        await Notification.create({
            user: course.instructor,
            message: `Your course "${course.title}" has been approved and is now live.`,
            type: 'SUCCESS',
            link: `/instructor/courses/${course._id}`
        });

        // Log
        await Log.create({
            user: req.user._id,
            action: 'COURSE_APPROVED',
            details: { courseId: course._id, title: course.title },
            role: 'ADMIN'
        });

        res.json({ message: 'Course approved' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reject course
// @route   PUT /api/admin/courses/:id/reject
// @access  Admin
exports.rejectCourse = async (req, res) => {
    try {
        const { reason } = req.body;
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Notify Instructor
        await Notification.create({
            user: course.instructor,
            message: `Your course "${course.title}" was rejected. Reason: ${reason}`,
            type: 'ERROR',
            link: `/instructor/courses/${course._id}`
        });

        // Log
        await Log.create({
            user: req.user._id,
            action: 'COURSE_REJECTED',
            details: { courseId: course._id, title: course.title, reason },
            role: 'ADMIN'
        });

        res.json({ message: 'Course rejected' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Categories ---

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const slug = name.toLowerCase().replace(/ /g, '-');

        const category = await Category.create({ name, slug, description });
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Support Tickets ---

exports.getTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate('student', 'name email')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.replyTicket = async (req, res) => {
    try {
        const { message, status } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        ticket.replies.push({
            sender: req.user._id,
            message
        });

        if (status) ticket.status = status;
        await ticket.save();

        // Re-populate student details
        await ticket.populate('student', 'name email');

        // Notify Student
        await Notification.create({
            user: ticket.student._id,
            message: `New reply on your ticket: "${ticket.subject}"`,
            type: 'INFO',
            link: `/student/support`
        });

        res.json(ticket);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
