const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const dirs = ['uploads', 'uploads/videos', 'uploads/pdfs', 'uploads/assignments', 'uploads/thumbnails'];
dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadDir = 'uploads/';
        if (file.mimetype.startsWith('video/')) {
            uploadDir = 'uploads/videos/';
        } else if (file.mimetype === 'application/pdf') {
            uploadDir = 'uploads/pdfs/';
        } else if (file.fieldname === 'submission' || file.fieldname === 'file') {
            uploadDir = 'uploads/assignments/';
        } else if (file.fieldname === 'thumbnail') {
            uploadDir = 'uploads/thumbnails/';
        }
        cb(null, path.join(__dirname, '..', uploadDir));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'video/mp4', 'video/webm', 'video/avi', 'video/mkv', 'video/mov',
        'application/pdf',
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/zip', 'application/x-rar-compressed',
        'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('File type not allowed: ' + file.mimetype), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB max
});

module.exports = upload;
