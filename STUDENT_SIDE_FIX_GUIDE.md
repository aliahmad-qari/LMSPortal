# Student Side Display Fix - Complete Guide

## Problem Analysis

### Current Issue:
1. **Backend** returns `lectures` from old Lecture model
2. **Frontend** expects `lectures` array but new data is in `course.sections[].lessons[]`
3. **Result**: "No lectures yet" message even though data exists

### Data Structure Mismatch:

**Old System (Lecture Model):**
```javascript
{
  lectures: [
    { _id, title, videoUrl, pdfUrl, duration }
  ]
}
```

**New System (Course Model with Sections):**
```javascript
{
  course: {
    price,
    sections: [
      {
        sectionTitle,
        lessons: [
          { title, type: 'video'|'pdf'|'text', contentUrl, duration }
        ]
      }
    ]
  }
}
```

---

## Solution: Two-Part Fix

### Part 1: Backend Route Update
**File:** `server/routes/courseRoutes.js`

**Change:** Modify the GET /:id endpoint to return both old lectures AND new sections/lessons

### Part 2: Frontend Component Update
**File:** `pages/student/StudentCourseView.tsx`

**Change:** Map both old lectures and new sections/lessons for display

---

## Implementation

### STEP 1: Update Backend Route

**Location:** `server/routes/courseRoutes.js` - GET /:id endpoint

**Replace this:**
```javascript
// Get single course with lectures and assignments
router.get('/:id', protect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name email')
            .populate('enrolledStudents', 'name email');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const lectures = await Lecture.find({ course: req.params.id }).sort({ order: 1 });
        const assignments = await Assignment.find({ course: req.params.id }).sort({ dueDate: 1 });

        const isEnrolled = course.enrolledStudents.some(
            s => s._id.toString() === req.user._id.toString()
        );
        const isInstructor = course.instructor._id.toString() === req.user._id.toString();

        res.json({
            course,
            lectures,
            assignments,
            isEnrolled,
            isInstructor
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
```

**With this:**
```javascript
// Get single course with lectures and assignments
router.get('/:id', protect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name email')
            .populate('enrolledStudents', 'name email');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        // Get old-style lectures (for backward compatibility)
        const lectures = await Lecture.find({ course: req.params.id }).sort({ order: 1 });
        const assignments = await Assignment.find({ course: req.params.id }).sort({ dueDate: 1 });

        // Convert new-style sections/lessons to flat lecture array for frontend
        let allLessons = [];
        if (course.sections && course.sections.length > 0) {
            course.sections.forEach((section, sectionIdx) => {
                if (section.lessons && section.lessons.length > 0) {
                    section.lessons.forEach((lesson, lessonIdx) => {
                        allLessons.push({
                            _id: lesson._id || `${section._id}-${lessonIdx}`,
                            title: `${section.sectionTitle} - ${lesson.title}`,
                            type: lesson.type,
                            contentUrl: lesson.contentUrl,
                            videoUrl: lesson.type === 'video' ? lesson.contentUrl : '',
                            pdfUrl: lesson.type === 'pdf' ? lesson.contentUrl : '',
                            duration: lesson.duration || '',
                            description: lesson.description || '',
                            order: sectionIdx * 100 + lessonIdx
                        });
                    });
                }
            });
        }

        // Combine old lectures with new lessons
        const combinedLectures = [...lectures, ...allLessons].sort((a, b) => (a.order || 0) - (b.order || 0));

        const isEnrolled = course.enrolledStudents.some(
            s => s._id.toString() === req.user._id.toString()
        );
        const isInstructor = course.instructor._id.toString() === req.user._id.toString();

        res.json({
            course,
            lectures: combinedLectures,  // Now includes both old and new content
            assignments,
            isEnrolled,
            isInstructor
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
```

---

### STEP 2: Update Frontend Component

**Location:** `pages/student/StudentCourseView.tsx`

**Add price display** - Find the header section and add:

```typescript
// After the course title section, add price display:
<div className="flex items-center gap-4">
    <button onClick={() => navigate('my-courses')} className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
    <div className="flex-1">
        <h1 className="text-2xl font-extrabold text-slate-900">{course.title}</h1>
        <p className="text-sm text-slate-500">by {course.instructorName} • {course.category}</p>
        {/* ADD THIS: Price Display */}
        {course.price > 0 && (
            <p className="text-lg font-bold text-emerald-600 mt-1">💰 ${course.price}</p>
        )}
    </div>
    {!isEnrolled && (
        <button onClick={handleEnroll} disabled={enrolling} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50">{enrolling ? 'Enrolling...' : 'Enroll Now'}</button>
    )}
</div>
```

**Update the video display section** - Replace the activeLecture rendering:

```typescript
// Replace this section:
{activeLecture ? (
    <div className="bg-slate-900 aspect-video rounded-3xl overflow-hidden shadow-2xl">
        {activeLecture.videoUrl ? (
            <video key={activeLecture._id} controls className="w-full h-full object-contain" src={`${SERVER_URL}${activeLecture.videoUrl}`} />
        ) : activeLecture.pdfUrl ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-white">
                <FileText className="w-20 h-20 text-indigo-400 mb-6" />
                <h3 className="text-2xl font-bold mb-2">{activeLecture.title}</h3>
                <a href={`${SERVER_URL}${activeLecture.pdfUrl}`} download className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 mt-4"><Download className="w-5 h-5" /> Download PDF</a>
            </div>
        ) : <div className="h-full flex items-center justify-center text-white"><p>No media available</p></div>}
    </div>
) : (
    <div className="bg-slate-100 aspect-video rounded-3xl flex items-center justify-center">
        <div className="text-center"><BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">{lectures.length === 0 ? 'No lectures yet' : 'Select a lecture'}</p></div>
    </div>
)}

// WITH THIS (improved handling for new content types):
{activeLecture ? (
    <div className="bg-slate-900 aspect-video rounded-3xl overflow-hidden shadow-2xl">
        {activeLecture.type === 'video' || activeLecture.videoUrl ? (
            <video key={activeLecture._id} controls className="w-full h-full object-contain" src={activeLecture.contentUrl || `${SERVER_URL}${activeLecture.videoUrl}`} />
        ) : activeLecture.type === 'pdf' || activeLecture.pdfUrl ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-white">
                <FileText className="w-20 h-20 text-indigo-400 mb-6" />
                <h3 className="text-2xl font-bold mb-2">{activeLecture.title}</h3>
                <a href={activeLecture.contentUrl || `${SERVER_URL}${activeLecture.pdfUrl}`} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 mt-4"><FileText className="w-5 h-5" /> View PDF</a>
            </div>
        ) : activeLecture.type === 'text' ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-white bg-gradient-to-br from-slate-800 to-slate-900">
                <BookOpen className="w-20 h-20 text-indigo-400 mb-6" />
                <h3 className="text-2xl font-bold mb-4">{activeLecture.title}</h3>
                <div className="text-left max-w-2xl bg-slate-800 p-6 rounded-xl text-sm leading-relaxed overflow-auto max-h-96">
                    {activeLecture.contentUrl}
                </div>
            </div>
        ) : <div className="h-full flex items-center justify-center text-white"><p>No media available</p></div>}
    </div>
) : (
    <div className="bg-slate-100 aspect-video rounded-3xl flex items-center justify-center">
        <div className="text-center"><BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">{lectures.length === 0 ? 'No lectures yet' : 'Select a lecture'}</p></div>
    </div>
)}
```

---

## Testing Checklist

- [ ] Backend returns combined lectures (old + new)
- [ ] Frontend displays course price
- [ ] Video lessons play correctly
- [ ] PDF lessons display in modal/viewer
- [ ] Text lessons display formatted
- [ ] "No lectures yet" only shows when truly empty
- [ ] Sections and lessons display in sidebar
- [ ] Clicking lesson updates active lecture
- [ ] Old Lecture model data still works
- [ ] New sections/lessons data works

---

## Result

✅ Students can now see:
- Course price
- All sections and lessons
- Videos play with controls
- PDFs display in browser
- Text content displays formatted
- No more "No lectures yet" when data exists

