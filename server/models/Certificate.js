const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    issueDate: { type: Date, default: Date.now },
    certificateCode: { type: String, unique: true, required: true }, // e.g., CERT-UUID
    pdfUrl: { type: String } // Path to generated PDF if stored
}, { timestamps: true });

module.exports = mongoose.model('Certificate', CertificateSchema);
