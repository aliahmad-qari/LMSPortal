import React, { useEffect, useState } from 'react';
import { adminFeaturesAPI } from '../../services/api';
import { CheckCircle, XCircle, BookOpen, AlertCircle } from 'lucide-react';

const PendingApprovals = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await adminFeaturesAPI.getPendingCourses();
            setCourses(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Are you sure you want to approve this course?')) return;
        try {
            await adminFeaturesAPI.approveCourse(id);
            setCourses(courses.filter(c => c._id !== id));
            alert('Course approved!');
        } catch (err) {
            alert('Failed to approve course');
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        try {
            await adminFeaturesAPI.rejectCourse(id, reason);
            setCourses(courses.filter(c => c._id !== id));
            alert('Course rejected.');
        } catch (err) {
            alert('Failed to reject course');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-amber-600" />
                Pending Course Approvals
            </h1>

            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading pending courses...</div>
            ) : courses.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">All Caught Up!</h3>
                    <p className="text-slate-500">No pending courses to review.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {courses.map(course => (
                        <div key={course._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-48 h-32 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                                {course.thumbnail ? (
                                    <img src={`http://localhost:5000${course.thumbnail}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                        <BookOpen className="w-8 h-8" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">{course.title}</h3>
                                        <p className="text-sm text-slate-500 mb-2">By {course.instructor?.name} • {course.category || 'General'}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                                        Pending Review
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm line-clamp-2 mb-4">{course.description}</p>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleApprove(course._id)}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(course._id)}
                                        className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-sm font-bold hover:bg-rose-100 flex items-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PendingApprovals;
