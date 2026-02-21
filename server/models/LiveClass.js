const mongoose = require('mongoose');

const LiveClassSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  meetingLink: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  platform: { type: String, default: 'Other' }, // Zoom, Google Meet, Other
  scheduledAt: { type: Date },
  endedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('LiveClass', LiveClassSchema);
