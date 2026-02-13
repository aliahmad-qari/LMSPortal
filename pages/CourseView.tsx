import React, { useState, useEffect } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { coursesAPI, lecturesAPI, assignmentsAPI, SERVER_URL } from '../services/api';
import {
  Play, FileText, ChevronLeft, Download, Upload,
  Plus, X, Loader2, CheckCircle, Clock, Video, BookOpen
} from 'lucide-react';

const CourseView: React.FC<{ courseId: string; navigate: (r: string, p?: any) => void }> = ({ courseId, navigate }) => {
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const [activeLecture, setActiveLecture] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  // Modals
  const [showAddLecture, setShowAddLecture] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [showSubmit, setShowSubmit] = useState<string | null>(null);

  // Forms
  const [lectureForm, setLectureForm] = useState({ title: '', duration: '' });
  const [lectureVideo, setLectureVideo] = useState<File | null>(null);
  const [lecturePdf, setLecturePdf] = useState<File | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '', totalMarks: '100' });
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    setIsLoading(true);
    try {
      const res = await coursesAPI.getById(courseId);
      setCourse(res.data.course);
      setLectures(res.data.lectures);
      setAssignments(res.data.assignments);
      setIsEnrolled(res.data.isEnrolled);
      setIsInstructor(res.data.isInstructor);
      if (res.data.lectures.length > 0) {
        setActiveLecture(res.data.lectures[0]);
      }
    } catch (err) {
      console.error('Error loading course:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await coursesAPI.enroll(courseId);
      setIsEnrolled(true);
      loadCourse();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const handleAddLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', lectureForm.title);
      formData.append('courseId', courseId);
      formData.append('duration', lectureForm.duration);
      formData.append('order', lectures.length.toString());
      if (lectureVideo) formData.append('video', lectureVideo);
      if (lecturePdf) formData.append('pdf', lecturePdf);
      await lecturesAPI.create(formData);
      setShowAddLecture(false);
      setLectureForm({ title: '', duration: '' });
      setLectureVideo(null);
      setLecturePdf(null);
      loadCourse();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add lecture');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await assignmentsAPI.create({
        title: assignmentForm.title,
        description: assignmentForm.description,
        courseId,
        dueDate: assignmentForm.dueDate,
        totalMarks: parseInt(assignmentForm.totalMarks)
      });
      setShowAddAssignment(false);
      setAssignmentForm({ title: '', description: '', dueDate: '', totalMarks: '100' });
      loadCourse();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create assignment');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!submissionFile) return alert('Please select a file');
    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append('submission', submissionFile);
      await assignmentsAPI.submit(assignmentId, formData);
      setShowSubmit(null);
      setSubmissionFile(null);
      alert('Assignment submitted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit');
    } finally {
      setFormLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  if (!course) {
    return <div className="text-center py-12"><p className="text-slate-500">Course not found</p></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('dashboard')} className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-slate-900">{course.title}</h1>
          <p className="text-sm text-slate-500">Instructor: {course.instructorName}</p>
        </div>
        {user?.role === UserRole.STUDENT && !isEnrolled && (
          <button onClick={handleEnroll} disabled={enrolling} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50">
            {enrolling ? 'Enrolling...' : 'Enroll Now'}
          </button>
        )}
        {isInstructor && (
          <div className="flex gap-2">
            <button onClick={() => setShowAddLecture(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700">
              <Plus className="w-4 h-4" /> Add Lecture
            </button>
            <button onClick={() => setShowAddAssignment(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700">
              <Plus className="w-4 h-4" /> Add Assignment
            </button>
            <button onClick={() => navigate('video', { courseId })} className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-violet-700">
              <Video className="w-4 h-4" /> Start Live Class
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeLecture ? (
            <div className="bg-slate-900 aspect-video rounded-3xl overflow-hidden shadow-2xl relative">
              {activeLecture.videoUrl ? (
                <video
                  key={activeLecture._id}
                  controls
                  className="w-full h-full object-contain"
                  src={`${SERVER_URL}${activeLecture.videoUrl}`}
                />
              ) : activeLecture.pdfUrl ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center text-white">
                  <FileText className="w-20 h-20 text-indigo-400 mb-6" />
                  <h3 className="text-2xl font-bold mb-2">{activeLecture.title}</h3>
                  <p className="text-slate-400 mb-8">PDF Document</p>
                  <a href={`${SERVER_URL}${activeLecture.pdfUrl}`} download className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                    <Download className="w-5 h-5" /> Download PDF
                  </a>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-white">
                  <p>No media available for this lecture</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-100 aspect-video rounded-3xl flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">{lectures.length === 0 ? 'No lectures yet' : 'Select a lecture'}</p>
              </div>
            </div>
          )}

          {/* Assignments Section */}
          {assignments.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Assignments
              </h3>
              <div className="space-y-3">
                {assignments.map((a: any) => (
                  <div key={a._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">{a.title}</p>
                      <p className="text-sm text-slate-500">{a.description}</p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due: {new Date(a.dueDate).toLocaleDateString()}
                        <span className="mx-2">•</span> {a.totalMarks} marks
                      </p>
                    </div>
                    {user?.role === UserRole.STUDENT && isEnrolled && (
                      <button onClick={() => setShowSubmit(a._id)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700">
                        <Upload className="w-4 h-4" /> Submit
                      </button>
                    )}
                    {isInstructor && (
                      <button onClick={() => navigate('submissions', { assignmentId: a._id })} className="text-indigo-600 font-bold text-sm hover:underline">
                        View Submissions
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Curriculum */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Lectures ({lectures.length})</h3>
            {lectures.length === 0 ? (
              <p className="text-slate-500 text-sm">No lectures yet</p>
            ) : (
              <div className="space-y-2">
                {lectures.map((lecture: any) => (
                  <div
                    key={lecture._id}
                    onClick={() => setActiveLecture(lecture)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer group ${activeLecture?._id === lecture._id
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-200 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {lecture.videoUrl ? <Play className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        <span className="text-sm font-bold">{lecture.title}</span>
                      </div>
                      {lecture.duration && (
                        <span className={`text-[10px] ${activeLecture?._id === lecture._id ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {lecture.duration}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Join Live Class button for students */}
          {user?.role === UserRole.STUDENT && isEnrolled && (
            <button
              onClick={() => navigate('video', { courseId })}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white p-4 rounded-3xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
            >
              <Video className="w-5 h-5" /> Join Live Class
            </button>
          )}

          <button
            onClick={() => navigate('chat', { roomId: courseId })}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white p-4 rounded-3xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            💬 Course Chat
          </button>
        </div>
      </div>

      {/* Add Lecture Modal */}
      {showAddLecture && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Add Lecture</h2>
              <button onClick={() => setShowAddLecture(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddLecture} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                <input type="text" value={lectureForm.title} onChange={e => setLectureForm({ ...lectureForm, title: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Duration (e.g. 45:00)</label>
                <input type="text" value={lectureForm.duration} onChange={e => setLectureForm({ ...lectureForm, duration: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Video File</label>
                <input type="file" accept="video/*" onChange={e => setLectureVideo(e.target.files?.[0] || null)} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">PDF File</label>
                <input type="file" accept="application/pdf" onChange={e => setLecturePdf(e.target.files?.[0] || null)} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
              </div>
              <button type="submit" disabled={formLoading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {formLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</> : 'Add Lecture'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Assignment Modal */}
      {showAddAssignment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Create Assignment</h2>
              <button onClick={() => setShowAddAssignment(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                <input type="text" value={assignmentForm.title} onChange={e => setAssignmentForm({ ...assignmentForm, title: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea value={assignmentForm.description} onChange={e => setAssignmentForm({ ...assignmentForm, description: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl h-20" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
                <input type="date" value={assignmentForm.dueDate} onChange={e => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Total Marks</label>
                <input type="number" value={assignmentForm.totalMarks} onChange={e => setAssignmentForm({ ...assignmentForm, totalMarks: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
              </div>
              <button type="submit" disabled={formLoading} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {formLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : 'Create Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Submit Assignment Modal */}
      {showSubmit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Submit Assignment</h2>
              <button onClick={() => setShowSubmit(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Upload File</label>
                <input type="file" onChange={e => setSubmissionFile(e.target.files?.[0] || null)} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
              </div>
              <button
                onClick={() => handleSubmitAssignment(showSubmit)}
                disabled={formLoading || !submissionFile}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {formLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : <><Upload className="w-5 h-5" /> Submit</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseView;
