const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema({
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    responses: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizQuestion' },
        selectedOption: { type: Number }
    }],
    submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
