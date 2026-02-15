const QuizAttempt = require('../models/QuizAttempt');
const Submission = require('../models/Submission');
const Certificate = require('../models/Certificate');
const Ticket = require('../models/Ticket');
const Course = require('../models/Course'); // Needed for certificate generation check

// --- Results ---

exports.getResults = async (req, res) => {
    try {
        const quizAttempts = await QuizAttempt.find({ studentId: req.user._id })
            .populate('quizId', 'title')
            .sort({ submittedAt: -1 });

        const assignments = await Submission.find({ student: req.user._id })
            .populate('assignment', 'title totalMarks')
            .sort({ submittedAt: -1 });

        res.json({
            quizzes: quizAttempts,
            assignments: assignments
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Certificates ---

exports.getMyCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({ student: req.user._id })
            .populate('course', 'title');
        res.json(certificates);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Placeholder for generating certificate (would typically be called upon course completion)
exports.generateCertificate = async (req, res) => {
    try {
        const { courseId } = req.body;
        // Check if course completed... (logic depends on progress tracking)
        // For now, create a dummy certificate

        const existing = await Certificate.findOne({ student: req.user._id, course: courseId });
        if (existing) return res.json(existing);

        const cert = await Certificate.create({
            student: req.user._id,
            course: courseId,
            certificateCode: `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        });

        res.status(201).json(cert);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Tickets ---

exports.createTicket = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const ticket = await Ticket.create({
            student: req.user._id,
            subject,
            message
        });
        res.status(201).json(ticket);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ student: req.user._id }).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
