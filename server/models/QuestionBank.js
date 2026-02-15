const mongoose = require('mongoose');

const QuestionBankSchema = new mongoose.Schema({
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // Optional, can be general
    type: { type: String, enum: ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER'], default: 'MCQ' },
    question: { type: String, required: true },
    options: [{ type: String }], // Only for MCQ
    correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }, // Index or text
    marks: { type: Number, default: 1 },
    tags: [{ type: String }] // For filtering e.g., 'Easy', 'Chapter 1'
}, { timestamps: true });

module.exports = mongoose.model('QuestionBank', QuestionBankSchema);
