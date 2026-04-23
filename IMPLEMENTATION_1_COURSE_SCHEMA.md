# Step 1: Update Course Schema (Course.js)

## File Location
`server/models/Course.js`

## Current Schema
The existing schema has these fields:
- title, description, instructor, instructorName, thumbnail
- enrolledStudents, isPublished, category
- timestamps

## What to Add
Add these new fields to support the Course Builder:
- `price` - Course pricing
- `level` - Difficulty level
- `duration` - Course duration
- `sections` - Array of course sections with lessons

## Implementation

Replace the entire `server/models/Course.js` with:

```javascript
const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'pdf', 'text'], default: 'video' },
  contentUrl: { type: String, required: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
  duration: { type: String, default: '' }, // e.g., "15 mins"
  createdAt: { type: Date, default: Date.now }
});

const SectionSchema = new mongoose.Schema({
  sectionTitle: { type: String, required: true },
  description: { type: String, default: '' },
  lessons: [LessonSchema],
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const CourseSchema = new mongoose.Schema({
  // Existing fields (DO NOT REMOVE)
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  instructorName: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPublished: { type: Boolean, default: true },
  category: { type: String, default: 'General' },

  // NEW FIELDS - Course Builder Enhancement
  price: { type: Number, default: 0 },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  duration: { type: String, default: '' }, // e.g., "4 weeks", "20 hours"
  
  // Structured content support
  sections: [SectionSchema],

}, { timestamps: true });

// Virtual for enrolled count (existing)
CourseSchema.virtual('enrolledCount').get(function() {
  return this.enrolledStudents ? this.enrolledStudents.length : 0;
});

// Virtual for total lessons count
CourseSchema.virtual('totalLessons').get(function() {
  if (!this.sections) return 0;
  return this.sections.reduce((total, section) => total + (section.lessons ? section.lessons.length : 0), 0);
});

// Virtual for total sections count
CourseSchema.virtual('totalSections').get(function() {
  return this.sections ? this.sections.length : 0;
});

CourseSchema.set('toJSON', { virtuals: true });
CourseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', CourseSchema);
```

## Key Points

✅ **Backward Compatible**
- All existing fields remain unchanged
- Existing courses will work without modification
- New fields have default values

✅ **Nested Schemas**
- `LessonSchema` - Individual lesson with type, content, and metadata
- `SectionSchema` - Groups lessons together with ordering

✅ **Virtuals Added**
- `totalLessons` - Count all lessons across sections
- `totalSections` - Count sections
- `enrolledCount` - Already existed, kept for compatibility

✅ **Flexible Structure**
- Lessons support multiple types: video, pdf, text
- Each lesson has metadata (duration, description)
- Ordering support for both sections and lessons

## Migration Notes

**For existing courses:**
- They will automatically have empty `sections` array
- New fields will use default values
- No data loss occurs

**For new courses:**
- Can include sections and lessons during creation
- Or add them later via update endpoints

## Next Step
→ Go to `IMPLEMENTATION_2_BACKEND_ROUTES.md`

