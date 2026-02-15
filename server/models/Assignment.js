const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String }, // Instructor can upload a file (e.g., PDF)
    dueDate: { type: Date, required: true },
    totalMarks: { type: Number, default: 100 }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);
