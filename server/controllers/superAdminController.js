const Log = require('../models/Log');
const User = require('../models/User');
const Course = require('../models/Course');

// @desc    Get system activity logs
// @route   GET /api/superadmin/logs
// @access  Super Admin
exports.getLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const logs = await Log.find()
            .populate('user', 'name role email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Log.countDocuments();

        res.json({
            logs,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get system stats
// @route   GET /api/superadmin/stats
// @access  Super Admin
exports.getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCourses = await Course.countDocuments();
        const students = await User.countDocuments({ role: 'student' });
        const instructors = await User.countDocuments({ role: 'instructor' });

        res.json({
            totalUsers,
            totalCourses,
            students,
            instructors
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
