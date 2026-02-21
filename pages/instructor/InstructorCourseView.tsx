import React, { useState, useEffect } from 'react';
import { coursesAPI, lecturesAPI, assignmentsAPI, liveClassAPI, SERVER_URL } from '../../services/api';
import {
    Play, FileText, ChevronLeft, Plus, X, Loader2, Clock,
    Video, BookOpen, Upload, Users, Download, ExternalLink
} from 'lucide-react';

const InstructorCourseView: React.FC<{ courseId: string; navigate: (r: string, p?: any) => void }> = ({ courseId, navigate }) => {
    const [course, setCourse] = useState<any>(null);
    const [lectures, setLectures] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [activeLecture, setActiveLecture] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [liveClass, setLiveClass] = useState<any>(null);

    const [showAddLecture, setShowAddLecture] = useState(false);
    const [showAddAssignment, setShowAddAssignment] = useState(false);
    const [showGoLive, setShowGoLive] = useState(false);
    const [lectureForm, setLectureForm] = useState({ title: '', duration: '' });
    const [lectureVideo, setLectureVideo] = useState<File | null>(null);
    const [lecturePdf, setLecturePdf] = useState<File | null>(null);
    const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '', totalMarks: '100' });
    const [liveForm, setLiveForm] = useState({ meetingLink: '', platform: 'Other' });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => { load(); loadLiveClass(); }, [courseId]);

    const load = async () => {
        setIsLoading(true);
        try {
            const res = await coursesAPI.getById(courseId);
            setCourse(res.data.course); setLectures(res.data.lectures); setAssignments(res.data.assignments);
            if (res.data.lectures.length > 0) setActiveLecture(res.data.lectures[0]);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    const loadLiveClass = async () => {
        try {
            const res = await liveClassAPI.getByCourse(courseId);
            setLiveClass(res.data);
        } catch (err) { console.error(err); }
    };

    const handleAddLecture = async (e: React.FormEvent) => {
        e.preventDefault(); setFormLoading(true);
        try {
            const fd = new FormData();
            fd.append('title', lectureForm.title); fd.append('courseId', courseId);
            fd.append('duration', lectureForm.duration); fd.append('order', lectures.length.toString());
            if (lectureVideo) fd.append('video', lectureVideo);
            if (lecturePdf) fd.append('pdf', lecturePdf);
            await lecturesAPI.create(fd);
            setShowAddLecture(false); setLectureForm({ title: '', duration: '' }); setLectureVideo(null); setLecturePdf(null);
            load();
        } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
        finally { setFormLoading(false); }
    };

    const handleAddAssignment = async (e: React.FormEvent) => {
        e.preventDefault(); setFormLoading(true);
        try {
            const fd = new FormData();
            fd.append('title', assignmentForm.title);
            fd.append('description', assignmentForm.description);
            fd.append('courseId', courseId);
            fd.append('dueDate', assignmentForm.dueDate);
            fd.append('totalMarks', assignmentForm.totalMarks);
            await assignmentsAPI.create(fd);
            setShowAddAssignment(false); setAssignmentForm({ title: '', description: '', dueDate: '', totalMarks: '100' });
            load();
        } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
        finally { setFormLoading(false); }
    };

    const handleGoLive = async (e: React.FormEvent) => {
        e.preventDefault(); setFormLoading(true);
        try {
            await liveClassAPI.create({ courseId, meetingLink: liveForm.meetingLink, platform: liveForm.platform });
            setShowGoLive(false); setLiveForm({ meetingLink: '', platform: 'Other' });
            loadLiveClass();
        } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
        finally { setFormLoading(false); }
    };

    const handleEndLive = async () => {
        if (!liveClass) return;
        try {
            await liveClassAPI.end(liveClass._id);
            setLiveClass(null);
        } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    };

    const deleteLecture = async (id: string) => {
        if (!confirm('Delete this lecture?')) return;
        try { await lecturesAPI.delete(id); load(); } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
    };

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>;
    if (!course) return <div className="text-center py-12"><p className="text-slate-500">Course not found</p></div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('my-courses')} className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50"><ChevronLeft className="w-5 h-5" /></button>
                <div className="flex-1">
                    <h1 className="text-2xl font-extrabold text-slate-900">{course.title}</h1>
                    <p className="text-sm text-slate-500">{course.enrolledStudents?.length || 0} students enrolled • {course.category}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowAddLecture(true)} className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-violet-700"><Plus className="w-4 h-4" /> Add Lecture</button>
                    <button onClick={() => setShowAddAssignment(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700"><Plus className="w-4 h-4" /> Add Assignment</button>
                    {liveClass ? (
                        <button onClick={handleEndLive} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-700">🔴 End Live</button>
                    ) : (
                        <button onClick={() => setShowGoLive(true)} className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-rose-700"><Video className="w-4 h-4" /> Go Live</button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Video Player */}
                    {activeLecture ? (
                        <div className="bg-slate-900 aspect-video rounded-3xl overflow-hidden shadow-2xl">
                            {activeLecture.videoUrl ? <video key={activeLecture._id} controls className="w-full h-full object-contain" src={`${SERVER_URL}${activeLecture.videoUrl}`} />
                                : activeLecture.pdfUrl ? (
                                    <div className="h-full flex flex-col items-center justify-center p-12 text-white text-center">
                                        <FileText className="w-20 h-20 text-violet-400 mb-6" /><h3 className="text-2xl font-bold mb-2">{activeLecture.title}</h3>
                                        <a href={`${SERVER_URL}${activeLecture.pdfUrl}`} download className="bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-bold flex items-center gap-2 mt-4"><Download className="w-5 h-5" /> Download PDF</a>
                                    </div>
                                ) : <div className="h-full flex items-center justify-center text-white"><p>No media</p></div>}
                        </div>
                    ) : (
                        <div className="bg-slate-100 aspect-video rounded-3xl flex items-center justify-center"><div className="text-center"><BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">{lectures.length === 0 ? 'Add your first lecture' : 'Select a lecture'}</p></div></div>
                    )}

                    {/* Assignments */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-violet-600" /> Assignments ({assignments.length})</h3>
                        {assignments.length === 0 ? <p className="text-slate-500 text-sm">No assignments yet.</p> : (
                            <div className="space-y-3">
                                {assignments.map((a: any) => (
                                    <div key={a._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div>
                                            <p className="font-bold text-slate-900">{a.title}</p>
                                            <p className="text-xs text-slate-400 mt-1"><Clock className="w-3 h-3 inline mr-1" />Due: {new Date(a.dueDate).toLocaleDateString()} • {a.totalMarks} marks</p>
                                        </div>
                                        <button onClick={() => navigate('submissions', { assignmentId: a._id, assignmentTitle: a.title })} className="text-violet-600 font-bold text-sm hover:underline">View Submissions</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Lectures ({lectures.length})</h3>
                        {lectures.length === 0 ? <p className="text-slate-500 text-sm">No lectures yet</p> : (
                            <div className="space-y-2">
                                {lectures.map((l: any) => (
                                    <div key={l._id} onClick={() => setActiveLecture(l)} className={`p-3 rounded-2xl border cursor-pointer transition-all group ${activeLecture?._id === l._id ? 'bg-violet-600 border-violet-600 text-white shadow-lg' : 'bg-white border-slate-100 hover:border-violet-200'}`}>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                {l.videoUrl ? <Play className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                <span className="text-sm font-bold">{l.title}</span>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); deleteLecture(l._id); }} className={`opacity-0 group-hover:opacity-100 text-xs px-2 py-0.5 rounded ${activeLecture?._id === l._id ? 'text-violet-200 hover:text-white' : 'text-red-400 hover:text-red-600'}`}>✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={() => navigate('chat', { roomId: courseId })} className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white p-4 rounded-3xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">💬 Course Chat</button>
                </div>
            </div>

            {/* Add Lecture Modal */}
            {showAddLecture && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">Add Lecture</h2><button onClick={() => setShowAddLecture(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button></div>
                        <form onSubmit={handleAddLecture} className="space-y-4">
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Title</label><input type="text" value={lectureForm.title} onChange={e => setLectureForm({ ...lectureForm, title: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none" required /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Duration</label><input type="text" value={lectureForm.duration} onChange={e => setLectureForm({ ...lectureForm, duration: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="e.g. 45:00" /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Video File</label><input type="file" accept="video/*" onChange={e => setLectureVideo(e.target.files?.[0] || null)} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">PDF File</label><input type="file" accept="application/pdf" onChange={e => setLecturePdf(e.target.files?.[0] || null)} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
                            <button type="submit" disabled={formLoading} className="w-full bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2">{formLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</> : 'Add Lecture'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Assignment Modal */}
            {showAddAssignment && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">Create Assignment</h2><button onClick={() => setShowAddAssignment(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button></div>
                        <form onSubmit={handleAddAssignment} className="space-y-4">
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Title</label><input type="text" value={assignmentForm.title} onChange={e => setAssignmentForm({ ...assignmentForm, title: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" required /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Description</label><textarea value={assignmentForm.description} onChange={e => setAssignmentForm({ ...assignmentForm, description: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl h-20" required /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label><input type="date" value={assignmentForm.dueDate} onChange={e => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" required /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Total Marks</label><input type="number" value={assignmentForm.totalMarks} onChange={e => setAssignmentForm({ ...assignmentForm, totalMarks: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" /></div>
                            <button type="submit" disabled={formLoading} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">{formLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : 'Create Assignment'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Go Live Modal */}
            {showGoLive && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">Go Live</h2><button onClick={() => setShowGoLive(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button></div>
                        <form onSubmit={handleGoLive} className="space-y-4">
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Meeting Link</label><input type="url" value={liveForm.meetingLink} onChange={e => setLiveForm({ ...liveForm, meetingLink: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="https://zoom.us/j/..." required /></div>
                            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Platform</label><select value={liveForm.platform} onChange={e => setLiveForm({ ...liveForm, platform: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl"><option value="Zoom">Zoom</option><option value="Google Meet">Google Meet</option><option value="Microsoft Teams">Microsoft Teams</option><option value="Other">Other</option></select></div>
                            <button type="submit" disabled={formLoading} className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2">{formLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Starting...</> : <><Video className="w-5 h-5" /> Start Live Class</>}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorCourseView;
