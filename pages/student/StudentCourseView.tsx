import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { coursesAPI, lecturesAPI, assignmentsAPI, SERVER_URL } from '../../services/api';
import {
    Play, FileText, ChevronLeft, Download, Upload,
    Loader2, Clock, Video, BookOpen, X
} from 'lucide-react';

const StudentCourseView: React.FC<{ courseId: string; navigate: (r: string, p?: any) => void }> = ({ courseId, navigate }) => {
    const { user } = useAuth();
    const [course, setCourse] = useState<any>(null);
    const [lectures, setLectures] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [activeLecture, setActiveLecture] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [showSubmit, setShowSubmit] = useState<string | null>(null);
    const [submissionFile, setSubmissionFile] = useState<File | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => { loadCourse(); }, [courseId]);

    const loadCourse = async () => {
        setIsLoading(true);
        try {
            const res = await coursesAPI.getById(courseId);
            setCourse(res.data.course);
            setLectures(res.data.lectures);
            setAssignments(res.data.assignments);
            setIsEnrolled(res.data.isEnrolled);
            if (res.data.lectures.length > 0) setActiveLecture(res.data.lectures[0]);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    const handleEnroll = async () => {
        setEnrolling(true);
        try { await coursesAPI.enroll(courseId); setIsEnrolled(true); loadCourse(); }
        catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
        finally { setEnrolling(false); }
    };

    const handleSubmit = async (assignmentId: string) => {
        if (!submissionFile) return alert('Please select a file');
        setFormLoading(true);
        try {
            const fd = new FormData(); fd.append('submission', submissionFile);
            await assignmentsAPI.submit(assignmentId, fd);
            setShowSubmit(null); setSubmissionFile(null);
            alert('Submitted successfully!');
        } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
        finally { setFormLoading(false); }
    };

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
    if (!course) return <div className="text-center py-12"><p className="text-slate-500">Course not found</p></div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('my-courses')} className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
                <div className="flex-1">
                    <h1 className="text-2xl font-extrabold text-slate-900">{course.title}</h1>
                    <p className="text-sm text-slate-500">by {course.instructorName} • {course.category}</p>
                </div>
                {!isEnrolled && (
                    <button onClick={handleEnroll} disabled={enrolling} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50">{enrolling ? 'Enrolling...' : 'Enroll Now'}</button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Video/Content */}
                <div className="lg:col-span-2 space-y-6">
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

                    {/* Assignments */}
                    {assignments.length > 0 && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-600" /> Assignments</h3>
                            <div className="space-y-3">
                                {assignments.map((a: any) => (
                                    <div key={a._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div>
                                            <p className="font-bold text-slate-900">{a.title}</p>
                                            <p className="text-sm text-slate-500">{a.description}</p>
                                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {new Date(a.dueDate).toLocaleDateString()} • {a.totalMarks} marks</p>
                                        </div>
                                        {isEnrolled && (
                                            <button onClick={() => setShowSubmit(a._id)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700"><Upload className="w-4 h-4" /> Submit</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Lectures ({lectures.length})</h3>
                        {lectures.length === 0 ? <p className="text-slate-500 text-sm">No lectures yet</p> : (
                            <div className="space-y-2">
                                {lectures.map((l: any) => (
                                    <div key={l._id} onClick={() => setActiveLecture(l)} className={`p-3 rounded-2xl border cursor-pointer transition-all ${activeLecture?._id === l._id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-200'}`}>
                                        <div className="flex items-center gap-3">
                                            {l.videoUrl ? <Play className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                            <span className="text-sm font-bold">{l.title}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {isEnrolled && (
                        <>
                            <button onClick={() => navigate('video', { courseId })} className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white p-4 rounded-3xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"><Video className="w-5 h-5" /> Join Live Class</button>
                            <button onClick={() => navigate('chat', { roomId: courseId })} className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white p-4 rounded-3xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">💬 Course Chat</button>
                        </>
                    )}
                </div>
            </div>

            {/* Submit Modal */}
            {showSubmit && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold">Submit Assignment</h2><button onClick={() => setShowSubmit(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X className="w-5 h-5" /></button></div>
                        <div className="space-y-4">
                            <input type="file" onChange={e => setSubmissionFile(e.target.files?.[0] || null)} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
                            <button onClick={() => handleSubmit(showSubmit)} disabled={formLoading || !submissionFile} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
                                {formLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : <><Upload className="w-5 h-5" /> Submit</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentCourseView;
