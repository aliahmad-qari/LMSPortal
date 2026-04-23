# Course Builder System Upgrade Guide

## Overview
This guide provides step-by-step instructions to upgrade the existing course creation system into a professional, modular Course Builder without breaking existing functionality.

## Architecture Changes

### 1. Database Schema Enhancement (Course.js)
**Location:** `server/models/Course.js`

**Changes:**
- Add new fields: `price`, `level`, `duration`
- Add structured content support: `sections` array with nested `lessons`
- Maintain all existing fields and functionality

### 2. Backend Controller Update (instructorController.js)
**Location:** `server/routes/courseRoutes.js` (POST route)

**Changes:**
- Accept new fields in request body
- Validate nested sections and lessons data
- Save structured data correctly

### 3. Frontend Form Enhancement (InstructorCreateCourse.tsx)
**Location:** `pages/instructor/InstructorCreateCourse.tsx`

**Changes:**
- Add basic course fields (price, level, duration)
- Add dynamic section/lesson builder UI
- Maintain existing form structure

### 4. PDF Viewer Component
**Location:** `components/PDFViewer.tsx` (new file)

**Changes:**
- Create reusable PDF viewer component
- Support both iframe and react-pdf approaches
- Handle document display in modal/page

---

## Implementation Steps

### Step 1: Update Course Schema
See `IMPLEMENTATION_1_COURSE_SCHEMA.md`

### Step 2: Update Backend Routes
See `IMPLEMENTATION_2_BACKEND_ROUTES.md`

### Step 3: Update Frontend Form
See `IMPLEMENTATION_3_FRONTEND_FORM.md`

### Step 4: Create PDF Viewer Component
See `IMPLEMENTATION_4_PDF_VIEWER.md`

### Step 5: Integration Points
See `IMPLEMENTATION_5_INTEGRATION.md`

---

## Key Features

✅ **Backward Compatible** - All existing functionality preserved
✅ **Modular Design** - Easy to extend and maintain
✅ **Scalable** - Supports unlimited sections and lessons
✅ **Professional UI** - Matches existing design system
✅ **Type-Safe** - Full TypeScript support on frontend

---

## Testing Checklist

- [ ] Existing course creation still works
- [ ] New fields (price, level, duration) save correctly
- [ ] Sections can be added/removed
- [ ] Lessons can be added/removed within sections
- [ ] Different lesson types (video, pdf, text) work
- [ ] PDF viewer displays documents correctly
- [ ] Form validation works for all fields
- [ ] Existing courses display correctly

---

## Rollback Plan

If issues occur:
1. Revert Course.js to original schema
2. Revert courseRoutes.js POST handler
3. Revert InstructorCreateCourse.tsx
4. All existing data remains intact

---

## Next Steps

1. Read each implementation file in order
2. Apply changes to respective files
3. Test each component
4. Deploy to production

