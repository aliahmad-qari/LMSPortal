require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Create Super Admin
        const existingSuperAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
        if (!existingSuperAdmin) {
            await User.create({
                name: 'Super Admin',
                email: 'admin@lms.com',
                password: 'admin123',
                role: 'SUPER_ADMIN',
                department: 'Administration',
                isActive: true
            });
            console.log('Super Admin created: admin@lms.com / admin123');
        } else {
            console.log('Super Admin already exists:', existingSuperAdmin.email);
        }

        // Create a demo Admin
        const existingAdmin = await User.findOne({ email: 'demoadmin@lms.com' });
        if (!existingAdmin) {
            await User.create({
                name: 'Demo Admin',
                email: 'demoadmin@lms.com',
                password: 'admin123',
                role: 'ADMIN',
                department: 'Administration',
                isActive: true
            });
            console.log('Demo Admin created: demoadmin@lms.com / admin123');
        }

        // Create a demo Instructor
        const existingInstructor = await User.findOne({ email: 'instructor@lms.com' });
        if (!existingInstructor) {
            await User.create({
                name: 'Dr. Alan Smith',
                email: 'instructor@lms.com',
                password: 'instructor123',
                role: 'INSTRUCTOR',
                department: 'Computer Science',
                isActive: true
            });
            console.log('Demo Instructor created: instructor@lms.com / instructor123');
        }

        // Create a demo Student
        const existingStudent = await User.findOne({ email: 'student@lms.com' });
        if (!existingStudent) {
            await User.create({
                name: 'John Doe',
                email: 'student@lms.com',
                password: 'student123',
                role: 'STUDENT',
                department: 'Computer Science',
                isActive: true
            });
            console.log('Demo Student created: student@lms.com / student123');
        }

        console.log('\nSeed completed! You can now login with:');
        console.log('  Super Admin: admin@lms.com / admin123');
        console.log('  Admin: demoadmin@lms.com / admin123');
        console.log('  Instructor: instructor@lms.com / instructor123');
        console.log('  Student: student@lms.com / student123');

        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err.message);
        process.exit(1);
    }
}

seed();
