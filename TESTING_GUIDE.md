# Testing Guide - LMS System Fixes

## 🧪 How to Test All Fixes

### Prerequisites
1. Start backend server: `cd server && npm start`
2. Start frontend: `npm run dev`
3. Ensure MongoDB is running

---

## 1️⃣ Test Live Class Feature

### As Instructor:
1. Login as instructor
2. Go to "My Courses"
3. Click on any course
4. Click "Go Live" button
5. Enter meeting link: `https://zoom.us/j/123456789`
6. Select platform: "Zoom"
7. Click "Start Live Class"
8. ✅ Should redirect to dashboard with success message
9. ✅ Meeting link should be saved in database

### As Student:
1. Login as student
2. Enroll in a course (if not already enrolled)
3. Click "Live Classes" in sidebar
4. ✅ Should see: "Instructor has added this meeting link:"
5. ✅ Should display the meeting link
6. ✅ Should show platform name
7. Click "Join Live Class"
8. ✅ Should open link in new tab

---

## 2️⃣ Test Course Pages

### As Instructor:
1. Login as instructor
2. Go to "My Courses"
3. ✅ Should see only courses created by you
4. ✅ Should display course thumbnails
5. ✅ Should show student count

### As Student:
1. Login as student
2. Go to "Browse Courses"
3. ✅ Should see all published courses
4. ✅ Should display course thumbnails
5. Go to "My Courses"
6. ✅ Should see only enrolled courses

### As Admin:
1. Login as admin
2. Go to "Course Overview"
3. ✅ Should see ALL courses (published and draft)
4. ✅ Should display course thumbnails
5. ✅ Should show instructor names

---

## 3️⃣ Test Admin Sidebar

### As Admin:
1. Login as admin
2. ✅ Sidebar should appear on left
3. ✅ Should show admin menu items:
   - Dashboard
   - User Management
   - Course Overview
   - Approvals
   - Categories
   - Support
   - Reports
4. ✅ Should show admin profile card
5. ✅ Should have amber/orange color scheme

---

## 4️⃣ Test Assignment File Download

### As Instructor:
1. Login as instructor
2. Go to any course
3. Click "Add Assignment"
4. Fill in details and upload a file (PDF/image)
5. Click "Create Assignment"
6. ✅ File should upload successfully
7. ✅ No 404 error

### As Student:
1. Login as student
2. Go to enrolled course
3. Find assignment with file
4. Click download/view
5. ✅ File should download successfully
6. ✅ No "Cannot GET /uploads/assignments/..." error

---

## 5️⃣ Test Lecture PDF Download

### As Instructor:
1. Login as instructor
2. Go to any course
3. Click "Add Lecture"
4. Upload a PDF file (no video)
5. Click "Add Lecture"
6. ✅ PDF should upload successfully

### As Student:
1. Login as student
2. Go to enrolled course
3. Click on lecture with PDF
4. Click "Download PDF"
5. ✅ PDF should download successfully
6. ✅ No "Cannot GET /uploads/pdfs/..." error

---

## 6️⃣ Test Course Images

### On Student Dashboard:
1. Login as student
2. Go to dashboard
3. ✅ Enrolled course cards should show thumbnails
4. ✅ Images should load without errors

### On Browse Courses:
1. Go to "Browse Courses"
2. ✅ All course cards should show thumbnails
3. ✅ Images should load without errors

### On Instructor Dashboard:
1. Login as instructor
2. Go to dashboard
3. ✅ Course cards should show thumbnails
4. ✅ Images should load without errors

---

## 7️⃣ Test Assignment Submission

### As Student:
1. Login as student
2. Go to enrolled course
3. Find an assignment
4. Click "Submit"
5. Upload a file
6. Click "Submit"
7. ✅ Should show "Submitted successfully!"
8. ✅ No 404 error
9. ✅ File should be saved

### As Instructor:
1. Login as instructor
2. Go to course
3. Click "View Submissions" on assignment
4. ✅ Should see student submissions
5. ✅ Should see submitted files
6. Click on file to download
7. ✅ File should download successfully

---

## 🔍 Common Issues to Check

### If files don't download:
1. Check `server/uploads/` directory exists
2. Check subdirectories exist: `assignments/`, `pdfs/`, `videos/`, `thumbnails/`
3. Check server console for errors
4. Verify static routes in `server.js`

### If images don't show:
1. Check browser console for 404 errors
2. Verify image path in database
3. Check `SERVER_URL` in `services/api.ts`
4. Verify file exists in `server/uploads/thumbnails/`

### If live class doesn't work:
1. Check browser console for API errors
2. Verify `liveClassRoutes.js` is registered in `server.js`
3. Check MongoDB for `liveclasses` collection
4. Verify student is enrolled in course

---

## ✅ Expected Results

After all tests:
- ✅ No 404 errors in browser console
- ✅ No "Cannot GET /uploads/..." errors
- ✅ All images display correctly
- ✅ All files download successfully
- ✅ Live class feature works as specified
- ✅ Course pages show correct data
- ✅ Admin sidebar appears correctly
- ✅ Assignment submission works end-to-end

---

## 🐛 If Something Doesn't Work

1. Check browser console for errors
2. Check server console for errors
3. Verify MongoDB connection
4. Check file permissions on `uploads/` directory
5. Restart both frontend and backend servers
6. Clear browser cache
7. Check network tab in browser DevTools

---

## 📞 Support

If issues persist after following this guide:
1. Check `IMPLEMENTATION_FIXES.md` for detailed fix information
2. Verify all files were modified correctly
3. Ensure all dependencies are installed
4. Check MongoDB is running and accessible
