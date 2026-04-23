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
        let { title, description, category, price, level, duration, sections } = req.body;
        
        // Parse sections if it's a JSON string
        if (sections && typeof sections === 'string') {
            try {
                sections = JSON.parse(sections);
            } catch (e) {
                return res.status(400).json({ message: 'Invalid sections format' });
            }
        }
        
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        if (price !== undefined && (isNaN(price) || price < 0)) {
            return res.status(400).json({ message: 'Price must be a valid number' });
        }

        const validLevels = ['Beginner', 'Intermediate', 'Advanced'];
        if (level && !validLevels.includes(level)) {
            return res.status(400).json({ message: 'Level must be Beginner, Intermediate, or Advanced' });
        }

        // Validate sections only if they have content
        if (sections && Array.isArray(sections) && sections.length > 0) {
            for (let section of sections) {
                // Only validate if section has a title (skip empty sections)
                if (section.sectionTitle && section.sectionTitle.trim()) {
                    if (section.lessons && Array.isArray(section.lessons)) {
                        for (let lesson of section.lessons) {
                            // Only validate lessons that have content
                            if (lesson.title && lesson.title.trim()) {
                                if (!lesson.type || !lesson.contentUrl) {
                                    return res.status(400).json({ 
                                        message: 'Each lesson must have type and contentUrl' 
                                    });
                                }
                                const validTypes = ['video', 'pdf', 'text'];
                                if (!validTypes.includes(lesson.type)) {
                                    return res.status(400).json({ 
                                        message: 'Lesson type must be video, pdf, or text' 
                                    });
                                }
                            }
                        }
                    }
                }
            }
            
            // Filter out empty sections and lessons
            sections = sections.filter(section => section.sectionTitle && section.sectionTitle.trim()).map(section => ({
                ...section,
                lessons: section.lessons ? section.lessons.filter(lesson => lesson.title && lesson.title.trim()) : []
            }));
        }

        const course = await Course.create({
            title,
            description,
            instructor: req.user._id,
            instructorName: req.user.name,
            category: category || 'General',
            thumbnail: req.file ? `/uploads/thumbnails/${req.file.filename}` : '',
            price: price || 0,
            level: level || 'Beginner',
            duration: duration || '',
            sections: sections || []
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
        let query = {};
        
        // Students see only published courses
        if (req.user.role === 'STUDENT') {
            query.isPublished = true;
        }
        // Instructors and Admins see all courses
        
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
        
        // Get old-style lectures (for backward compatibility)
        const lectures = await Lecture.find({ course: req.params.id }).sort({ order: 1 });
        const assignments = await Assignment.find({ course: req.params.id }).sort({ dueDate: 1 });

        // Convert new-style sections/lessons to flat lecture array for frontend
        let allLessons = [];
        if (course.sections && course.sections.length > 0) {
            course.sections.forEach((section, sectionIdx) => {
                if (section.lessons && section.lessons.length > 0) {
                    section.lessons.forEach((lesson, lessonIdx) => {
                        allLessons.push({
                            _id: lesson._id || `${section._id}-${lessonIdx}`,
                            title: `${section.sectionTitle} - ${lesson.title}`,
                            type: lesson.type,
                            contentUrl: lesson.contentUrl,
                            videoUrl: lesson.type === 'video' ? lesson.contentUrl : '',
                            pdfUrl: lesson.type === 'pdf' ? lesson.contentUrl : '',
                            duration: lesson.duration || '',
                            description: lesson.description || '',
                            order: sectionIdx * 100 + lessonIdx
                        });
                    });
                }
            });
        }

        // Combine old lectures with new lessons
        const combinedLectures = [...lectures, ...allLessons].sort((a, b) => (a.order || 0) - (b.order || 0));

        const isEnrolled = course.enrolledStudents.some(
            s => s._id.toString() === req.user._id.toString()
        );
        const isInstructor = course.instructor._id.toString() === req.user._id.toString();

        res.json({
            course,
            lectures: combinedLectures,
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
        const { title, description, category, isPublished, price, level, duration } = req.body;
        if (title) course.title = title;
        if (description) course.description = description;
        if (category) course.category = category;
        if (isPublished !== undefined) course.isPublished = isPublished;
        if (price !== undefined) course.price = price;
        if (level) course.level = level;
        if (duration) course.duration = duration;
        await course.save();
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete course
router.delete('/:id', protect, authorize('INSTRUCTOR', 'ADMIN'), async (req, res) => {
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

// Add section to course
router.post('/:id/sections', protect, authorize('INSTRUCTOR'), async (req, res) => {
    try {
        const { sectionTitle, description } = req.body;
        
        if (!sectionTitle) {
            return res.status(400).json({ message: 'Section title is required' });
        }

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const newSection = {
            sectionTitle,
            description: description || '',
            lessons: [],
            order: course.sections ? course.sections.length : 0
        };

        course.sections.push(newSection);
        await course.save();

        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add lesson to section
router.post('/:id/sections/:sectionId/lessons', protect, authorize('INSTRUCTOR'), async (req, res) => {
    try {
        const { title, type, contentUrl, description, duration } = req.body;
        
        if (!title || !type || !contentUrl) {
            return res.status(400).json({ 
                message: 'Title, type, and contentUrl are required' 
            });
        }

        const validTypes = ['video', 'pdf', 'text'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: 'Type must be video, pdf, or text' });
        }

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const section = course.sections.id(req.params.sectionId);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        const newLesson = {
            title,
            type,
            contentUrl,
            description: description || '',
            duration: duration || '',
            order: section.lessons ? section.lessons.length : 0
        };

        section.lessons.push(newLesson);
        await course.save();

        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete section
router.delete('/:id/sections/:sectionId', protect, authorize('INSTRUCTOR'), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        course.sections.id(req.params.sectionId).deleteOne();
        await course.save();

        res.json({ message: 'Section deleted', course });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete lesson
router.delete('/:id/sections/:sectionId/lessons/:lessonId', protect, authorize('INSTRUCTOR'), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const section = course.sections.id(req.params.sectionId);
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }

        section.lessons.id(req.params.lessonId).deleteOne();
        await course.save();

        res.json({ message: 'Lesson deleted', course });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
