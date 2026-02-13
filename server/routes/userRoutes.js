const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

// Get all users (admin, superadmin)
router.get('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        // Admin can only see students and instructors
        if (req.user.role === 'ADMIN') {
            query.role = { $in: ['STUDENT', 'INSTRUCTOR'] };
            if (role && ['STUDENT', 'INSTRUCTOR'].includes(role)) {
                query.role = role;
            }
        }
        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get system analytics (superadmin)
router.get('/analytics', protect, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'STUDENT' });
        const totalInstructors = await User.countDocuments({ role: 'INSTRUCTOR' });
        const totalAdmins = await User.countDocuments({ role: 'ADMIN' });
        const activeUsers = await User.countDocuments({ isActive: true });
        const disabledUsers = await User.countDocuments({ isActive: false });
        const totalCourses = await Course.countDocuments();

        res.json({
            totalUsers,
            totalStudents,
            totalInstructors,
            totalAdmins,
            activeUsers,
            disabledUsers,
            totalCourses
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create user (admin creates instructor, superadmin creates admin)
router.post('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Name, email, password, and role are required' });
        }
        // Admin can only create INSTRUCTOR and STUDENT
        if (req.user.role === 'ADMIN' && !['INSTRUCTOR', 'STUDENT'].includes(role)) {
            return res.status(403).json({ message: 'Admins can only create Instructors and Students' });
        }
        // Super admin can create ADMIN
        if (req.user.role === 'SUPER_ADMIN' && !['ADMIN', 'INSTRUCTOR', 'STUDENT'].includes(role)) {
            return res.status(403).json({ message: 'Invalid role assignment' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        const user = await User.create({
            name,
            email,
            password,
            role,
            department: department || '',
            isActive: true
        });
        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            department: user.department
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Toggle user status (enable/disable)
router.put('/:id/toggle-status', protect, authorize('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Admin cannot disable other admins or super admins
        if (req.user.role === 'ADMIN' && ['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
            return res.status(403).json({ message: 'You cannot modify admin or super admin accounts' });
        }
        // Super admin cannot disable other super admins
        if (req.user.role === 'SUPER_ADMIN' && user.role === 'SUPER_ADMIN' && user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Cannot disable another super admin' });
        }
        user.isActive = !user.isActive;
        await user.save();
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete user
router.delete('/:id', protect, authorize('SUPER_ADMIN'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Cannot delete super admin' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
