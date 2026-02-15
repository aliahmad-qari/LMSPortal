const Course = require('../models/Course');
const Announcement = require('../models/Announcement');
const QuestionBank = require('../models/QuestionBank');
const QuizAttempt = require('../models/QuizAttempt');
const Notification = require('../models/Notification');
const User = require('../models/User'); // Assuming we need to find enrolled students

const Quiz = require('../models/Quiz');

// --- Analytics ---

exports.getCourseAnalytics = async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user._id });
        const courseIds = courses.map(c => c._id);

        const totalStudents = courses.reduce((acc, curr) => acc + (curr.students ? curr.students.length : 0), 0);

        // Find quizzes for these courses
        const quizzes = await Quiz.find({ course: { $in: courseIds } }).select('_id');
        const quizIds = quizzes.map(q => q._id);

        // Count attempts for these quizzes
        const quizAttempts = await QuizAttempt.countDocuments({
            quizId: { $in: quizIds }
        });

        res.json({
            totalCourses: courses.length,
            totalStudents,
            totalQuizAttempts: quizAttempts
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


// --- Announcements ---

exports.createAnnouncement = async (req, res) => {
    try {
        const { courseId, title, content } = req.body;

        const announcement = await Announcement.create({
            course: courseId,
            instructor: req.user._id,
            title,
            content
        });

        // Notify enrolled students
        const course = await Course.findById(courseId);
        if (course && course.students) {
            const notifications = course.students.map(studentId => ({
                user: studentId,
                message: `New announcement in ${course.title}: ${title}`,
                type: 'INFO',
                link: `/student/courses/${courseId}`
            }));
            await Notification.insertMany(notifications);
        }

        res.status(201).json(announcement);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({ instructor: req.user._id })
            .populate('course', 'title')
            .sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Question Bank ---

exports.addQuestionToBank = async (req, res) => {
    try {
        const { question, options, correctAnswer, type, tags } = req.body;

        const newItem = await QuestionBank.create({
            instructor: req.user._id,
            question,
            options,
            correctAnswer,
            type,
            tags
        });

        res.status(201).json(newItem);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getQuestionBank = async (req, res) => {
    try {
        const questions = await QuestionBank.find({ instructor: req.user._id });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
