const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'GRADED'], default: 'PENDING' },
    grade: { type: Number },
    feedback: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
