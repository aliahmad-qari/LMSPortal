const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    isPublic: { type: Boolean, default: true } // Visible to prospective students or only enrolled
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
