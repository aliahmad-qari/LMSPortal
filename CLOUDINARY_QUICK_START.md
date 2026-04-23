# Cloudinary Integration - Quick Start

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```bash
cd server
npm install cloudinary multer-storage-cloudinary
```

### 2. Add Environment Variables
Edit `server/.env`:
```env
CLOUDINARY_CLOUD_NAME=dux3niyf5
CLOUDINARY_API_KEY=kxcLn7kGsUJP6TzM-JpiBc9JhQg
CLOUDINARY_API_SECRET=your_api_secret_from_cloudinary
```

### 3. Restart Server
```bash
npm run dev
```

**Done!** ✅

---

## 📝 What Was Added

### Backend Files (New)
- `server/config/cloudinary.js` - Cloudinary configuration
- `server/controllers/uploadController.js` - Upload handlers
- `server/routes/uploadRoutes.js` - Upload endpoints

### Backend Files (Updated)
- `server/server.js` - Added upload routes
- `server/package.json` - Added dependencies
- `server/.env.example` - Added Cloudinary variables

### Frontend Files (New)
- `components/VideoPlayer.tsx` - Video player with controls
- `components/LessonViewer.tsx` - Unified lesson viewer
- `pages/instructor/InstructorCreateCourse.tsx` - Updated with file upload UI

### Frontend Files (Updated)
- `services/api.ts` - Added uploadAPI methods

---

## 🎯 How It Works

### Instructor Creates Course:
1. Fill course info
2. Click "Show Course Structure Builder"
3. Add sections and lessons
4. For video/PDF lessons: Click file upload → Select file → Auto-uploads to Cloudinary
5. URL automatically saved
6. Click "Create Course"

### Student Views Lesson:
1. Click lesson
2. **Video:** Plays with custom player (play, pause, speed, volume, fullscreen)
3. **PDF:** Click "View PDF" → Opens in modal with zoom
4. **Text:** Reads formatted text

---

## 📊 API Endpoints

```
POST /api/upload/video    - Upload video file
POST /api/upload/pdf      - Upload PDF file
POST /api/upload/image    - Upload image file
POST /api/upload/file     - Upload any file
```

All require authentication (Bearer token)

---

## 🎬 Components

### VideoPlayer
```typescript
<VideoPlayer 
  url="https://res.cloudinary.com/video.mp4"
  title="Lesson Title"
  poster="https://res.cloudinary.com/poster.jpg"
/>
```

### PDFViewer
```typescript
<PDFViewer 
  url="https://res.cloudinary.com/doc.pdf"
  title="Document"
  isModal={true}
  onClose={() => setShowPDF(false)}
/>
```

### LessonViewer (Unified)
```typescript
<LessonViewer 
  lesson={lesson}
  onClose={() => setSelectedLesson(null)}
/>
```

---

## 📁 File Limits

| Type | Max Size |
|------|----------|
| Video | 500MB |
| PDF | 100MB |
| Image | 10MB |

---

## ✅ Testing

1. Create course with video lesson
2. Upload video file
3. Verify URL saved
4. View as student
5. Test player controls

---

## 🔗 Useful Links

- Cloudinary Dashboard: https://cloudinary.com/console
- API Key: Settings → API Keys
- Documentation: https://cloudinary.com/documentation

---

## ⚠️ Common Issues

**"Cloudinary credentials not found"**
→ Check `.env` has all 3 variables

**"File upload fails"**
→ Check file size and format

**"Video won't play"**
→ Check URL is valid, format is supported

**"PDF won't display"**
→ Check PDF is not corrupted

---

## 🎉 You're All Set!

Your LMS now supports:
✅ Video uploads to Cloudinary
✅ PDF uploads to Cloudinary
✅ Professional video player
✅ PDF viewer with zoom
✅ Unified lesson viewer

**Start creating courses!**

