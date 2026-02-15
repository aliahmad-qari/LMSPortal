const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true }, // e.g., 'LOGIN', 'COURSE_CREATED', 'USER_DELETED'
    details: { type: mongoose.Schema.Types.Mixed }, // Flexible field for extra data
    ip: { type: String },
    role: { type: String, enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'] }
}, { timestamps: true });

module.exports = mongoose.model('Log', LogSchema);
