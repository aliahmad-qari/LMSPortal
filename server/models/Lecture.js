const mongoose = require('mongoose');

const LectureSchema = new mongoose.Schema({
    title: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    videoUrl: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    duration: { type: String, default: '' },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Lecture', LectureSchema);
