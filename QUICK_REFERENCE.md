# Quick Reference - LMS System

## 🚀 Start System

```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
npm run dev
```

---

## 👤 Test Accounts

### Admin:
- Email: `admin@example.com`
- Password: [your admin password]
- Role: ADMIN

### Instructor:
- Email: `instructor@example.com`
- Password: [your instructor password]
- Role: INSTRUCTOR

### Student:
- Email: `student@example.com`
- Password: [your student password]
- Role: STUDENT

---

## ✅ What Was Fixed

1. **Live Class** - Instructor saves link, student sees link
2. **Course Pages** - Correct data for each role
3. **File Downloads** - All PDFs and assignments work
4. **Course Images** - All thumbnails display
5. **Admin Sidebar** - Renders correctly

---

## 📁 Files Changed

1. `server/server.js` - Static file routes
2. `server/config/upload.js` - File upload handling
3. `server/routes/courseRoutes.js` - Course filtering
4. `pages/VideoCallPage.tsx` - Live class logic
5. `components/Layout.tsx` - Admin sidebar fix

---

## 🔍 Quick Tests

### Test Admin:
1. Login as admin
2. Check sidebar shows (amber theme)
3. Go to "User Management" - should see all users
4. Go to "Course Overview" - should see all courses
5. Check all numbers are from database

### Test Live Class:
1. Login as instructor
2. Go to course
3. Click "Go Live"
4. Enter Zoom link
5. Click "Start Live Class"
6. Login as student
7. Click "Live Classes"
8. Should see the link

### Test Files:
1. Upload assignment as instructor
2. Download as student - should work
3. Upload PDF lecture
4. Download as student - should work

---

## 🐛 If Something Breaks

### Admin Sidebar Not Showing:
```javascript
// Check user role in MongoDB
db.users.findOne({ email: 'admin@example.com' })
// Should show: role: 'ADMIN'

// Clear browser cache
localStorage.clear()
// Then re-login
```

### Files Not Downloading:
```bash
# Check uploads folder exists
ls server/uploads/

# Should see:
# assignments/
# pdfs/
# videos/
# thumbnails/

# Restart backend server
cd server
npm start
```

### No Data Showing:
```bash
# Check MongoDB is running
mongosh

# Check backend is running
curl http://localhost:5000/api/health
# Should return: {"status":"ok"}
```

---

## 📊 Admin Features

### Dashboard:
- Total users count
- Instructors count
- Students count
- Total courses count

### User Management:
- View all users
- Create new users
- Delete users
- Toggle user status

### Course Overview:
- View all courses
- See enrollment counts
- See course status

### Approvals:
- Approve pending courses
- Reject courses

### Categories:
- Create categories
- Delete categories

### Support:
- View tickets
- Reply to tickets
- Close tickets

---

## 🔗 Important URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- API Health: `http://localhost:5000/api/health`
- MongoDB: `mongodb://localhost:27017/lms`

---

## 📝 Database Collections

- `users` - All users (admin, instructor, student)
- `courses` - All courses
- `lectures` - Course lectures
- `assignments` - Course assignments
- `submissions` - Student submissions
- `categories` - Course categories
- `tickets` - Support tickets
- `liveclasses` - Live class sessions

---

## 🎯 Key Points

✅ **All admin pages are database-driven**
✅ **No mock data anywhere**
✅ **All files download correctly**
✅ **All images display correctly**
✅ **Live class works as specified**
✅ **Admin sidebar renders properly**

---

## 📚 Documentation

- `IMPLEMENTATION_FIXES.md` - Technical details
- `TESTING_GUIDE.md` - Testing steps
- `SIMPLE_SUMMARY.md` - Simple explanation
- `ADMIN_VERIFICATION.md` - Admin verification
- `FINAL_SUMMARY.md` - Complete summary
- `QUICK_REFERENCE.md` - This file

---

## 🆘 Emergency Commands

```bash
# Reset everything
npm run dev # Frontend
cd server && npm start # Backend

# Clear browser
localStorage.clear()
# Then refresh (Ctrl+Shift+R)

# Check MongoDB
mongosh
use lms
db.users.find()

# Check logs
# Backend: Check terminal running server
# Frontend: Check browser console (F12)
```

---

**Status:** ✅ ALL WORKING
**Ready:** YES
**Date:** Current Session
