const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage for different file types
const createCloudinaryStorage = (resourceType = 'auto', folder = 'lms') => {
    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: folder,
            resource_type: resourceType,
            allowed_formats: resourceType === 'video' 
                ? ['mp4', 'webm', 'avi', 'mkv', 'mov', 'flv', 'wmv']
                : resourceType === 'raw'
                ? ['pdf']
                : ['jpg', 'jpeg', 'png', 'gif', 'webp']
        }
    });
};

// Video upload middleware
const uploadVideo = multer({
    storage: createCloudinaryStorage('video', 'lms/videos'),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'), false);
        }
    },
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

// PDF upload middleware
const uploadPDF = multer({
    storage: createCloudinaryStorage('raw', 'lms/pdfs'),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Image upload middleware (for thumbnails)
const uploadImage = multer({
    storage: createCloudinaryStorage('image', 'lms/thumbnails'),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Generic upload middleware
const uploadFile = multer({
    storage: createCloudinaryStorage('auto', 'lms/files'),
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

module.exports = {
    cloudinary,
    uploadVideo,
    uploadPDF,
    uploadImage,
    uploadFile
};
