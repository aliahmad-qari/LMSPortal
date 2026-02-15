const mongoose = require('mongoose');

const QuizQuestionSchema = new mongoose.Schema({
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    question: { type: String, required: true },
    options: [{ type: String, required: true }], // Array of 4 options
    correctAnswer: { type: Number, required: true }, // Index of the correct option (0-3)
    marks: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('QuizQuestion', QuizQuestionSchema);
