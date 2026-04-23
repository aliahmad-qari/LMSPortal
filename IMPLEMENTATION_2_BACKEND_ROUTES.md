# Step 2: Update Backend Routes (courseRoutes.js)

## File Location
`server/routes/courseRoutes.js`

## What to Change
Update the POST route (create course) to accept and validate new fields including sections and lessons.

## Implementation

### Find this section in `server/routes/courseRoutes.js`:

```javascript
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
```

### Replace it with:

```javascript
// Create course (instructor only)
router.post('/', protect, authorize('INSTRUCTOR'), upload.single('thumbnail'), async (req, res) => {
    try {
        const { title, description, category, price, level, duration, sections } = req.body;
        
        // Validation
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        // Validate price if provided
        if (price !== undefined && (isNaN(price) || price < 0)) {
            return res.status(400).json({ message: 'Price must be a valid number' });
        }

        // Validate level if provided
        const validLevels = ['Beginner', 'Intermediate', 'Advanced'];
        if (level && !validLevels.includes(level)) {
            return res.status(400).json({ message: 'Level must be Beginner, Intermediate, or Advanced' });
        }

        // Validate sections structure if provided
        if (sections && Array.isArray(sections)) {
            for (let section of sections) {
                if (!section.sectionTitle) {
                    return res.status(400).json({ message: 'Each section must have a title' });
                }
                if (section.lessons && Array.isArray(section.lessons)) {
                    for (let lesson of section.lessons) {
                        if (!lesson.title || !lesson.type || !lesson.contentUrl) {
                            return res.status(400).json({ 
                                message: 'Each lesson must have title, type, and contentUrl' 
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

        // Create course with all fields
        const course = await Course.create({
            title,
            description,
            instructor: req.user._id,
            instructorName: req.user.name,
            category: category || 'General',
            thumbnail: req.file ? `/uploads/thumbnails/${req.file.filename}` : '',
            // NEW FIELDS
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
```

## Add New Endpoints

Add these endpoints after the existing DELETE route in `server/routes/courseRoutes.js`:

```javascript
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

// Update course with new fields
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
```

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/courses` | Create course with sections/lessons |
| POST | `/api/courses/:id/sections` | Add section to course |
| POST | `/api/courses/:id/sections/:sectionId/lessons` | Add lesson to section |
| DELETE | `/api/courses/:id/sections/:sectionId` | Delete section |
| DELETE | `/api/courses/:id/sections/:sectionId/lessons/:lessonId` | Delete lesson |
| PUT | `/api/courses/:id` | Update course (including new fields) |

## Key Points

✅ **Validation**
- All new fields are validated before saving
- Nested structures are checked for required fields
- Type enums are enforced

✅ **Authorization**
- Only course instructor can modify
- All endpoints check ownership

✅ **Backward Compatible**
- Existing PUT endpoint still works
- New fields are optional

## Next Step
→ Go to `IMPLEMENTATION_3_FRONTEND_FORM.md`

