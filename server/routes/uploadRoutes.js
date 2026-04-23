const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadVideo, uploadPDF, uploadImage, uploadFile } = require('../config/cloudinary');
const uploadController = require('../controllers/uploadController');

/**
 * Upload Routes
 * All routes require authentication
 */

// Generic file upload
router.post('/file', protect, uploadFile.single('file'), uploadController.uploadFile);

// Video upload (for lessons)
router.post('/video', protect, uploadVideo.single('video'), uploadController.uploadVideo);

// PDF upload (for lessons)
router.post('/pdf', protect, uploadPDF.single('pdf'), uploadController.uploadPDF);

// Image upload (for thumbnails, course covers, etc.)
router.post('/image', protect, uploadImage.single('image'), uploadController.uploadImage);

module.exports = router;
