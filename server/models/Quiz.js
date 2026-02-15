const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timeLimit: { type: Number, default: 30 }, // in minutes
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuizQuestion' }]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);
