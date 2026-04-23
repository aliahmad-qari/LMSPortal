/**
 * Upload Controller
 * Handles file uploads to Cloudinary
 */

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        // Cloudinary stores the URL in req.file.path
        const fileUrl = req.file.path;
        const fileName = req.file.originalname;
        const fileSize = req.file.size;
        const mimeType = req.file.mimetype;

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                url: fileUrl,
                fileName: fileName,
                fileSize: fileSize,
                mimeType: mimeType,
                uploadedAt: new Date()
            }
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({
            success: false,
            message: 'File upload failed',
            error: err.message
        });
    }
};

exports.uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No video file provided' });
        }

        const videoUrl = req.file.path;
        const fileName = req.file.originalname;

        res.status(200).json({
            success: true,
            message: 'Video uploaded successfully',
            data: {
                url: videoUrl,
                fileName: fileName,
                type: 'video',
                uploadedAt: new Date()
            }
        });
    } catch (err) {
        console.error('Video upload error:', err);
        res.status(500).json({
            success: false,
            message: 'Video upload failed',
            error: err.message
        });
    }
};

exports.uploadPDF = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No PDF file provided' });
        }

        const pdfUrl = req.file.path;
        const fileName = req.file.originalname;

        res.status(200).json({
            success: true,
            message: 'PDF uploaded successfully',
            data: {
                url: pdfUrl,
                fileName: fileName,
                type: 'pdf',
                uploadedAt: new Date()
            }
        });
    } catch (err) {
        console.error('PDF upload error:', err);
        res.status(500).json({
            success: false,
            message: 'PDF upload failed',
            error: err.message
        });
    }
};

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const imageUrl = req.file.path;
        const fileName = req.file.originalname;

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: imageUrl,
                fileName: fileName,
                type: 'image',
                uploadedAt: new Date()
            }
        });
    } catch (err) {
        console.error('Image upload error:', err);
        res.status(500).json({
            success: false,
            message: 'Image upload failed',
            error: err.message
        });
    }
};
