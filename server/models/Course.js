const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'pdf', 'text'], default: 'video' },
  contentUrl: { type: String, required: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
  duration: { type: String, default: '' },
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
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  instructorName: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPublished: { type: Boolean, default: true },
  category: { type: String, default: 'General' },
  price: { type: Number, default: 0 },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  duration: { type: String, default: '' },
  sections: [SectionSchema]
}, { timestamps: true });

CourseSchema.virtual('enrolledCount').get(function() {
  return this.enrolledStudents ? this.enrolledStudents.length : 0;
});

CourseSchema.virtual('totalLessons').get(function() {
  if (!this.sections) return 0;
  return this.sections.reduce((total, section) => total + (section.lessons ? section.lessons.length : 0), 0);
});

CourseSchema.virtual('totalSections').get(function() {
  return this.sections ? this.sections.length : 0;
});

CourseSchema.set('toJSON', { virtuals: true });
CourseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', CourseSchema);
