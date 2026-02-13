import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { coursesAPI, SERVER_URL } from '../../services/api';
import { BookOpen, Clock, Trophy, TrendingUp, ChevronRight, Loader2 } from 'lucide-react';

const StudentDashboard: React.FC<{ navigate: (r: string, p?: any) => void }> = ({ navigate }) => {
    const { user } = useAuth();
    const [enrolled, setEnrolled] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const res = await coursesAPI.getEnrolled();
            setEnrolled(res.data);
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

    const stats = [
        { label: 'Enrolled Courses', value: enrolled.length, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Active Courses', value: enrolled.filter((c: any) => c.isPublished).length, icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Total Lectures', value: enrolled.reduce((a: number, c: any) => a + (c.lectureCount || 0), 0), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Assignments Due', value: '—', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Welcome back, <span className="text-indigo-600">{user?.name}!</span></h1>
                <p className="text-slate-500 mt-1">Here's your learning overview.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`${s.bg} ${s.color} p-3 rounded-xl`}><s.icon className="w-6 h-6" /></div>
                        <div><p className="text-slate-500 text-sm font-medium">{s.label}</p><p className="text-2xl font-bold text-slate-900">{s.value}</p></div>
                    </div>
                ))}
            </div>

            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">My Enrolled Courses</h2>
                {enrolled.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No Courses Yet</h3>
                        <p className="text-slate-500 mb-4">Browse and enroll in courses to start learning.</p>
                        <button onClick={() => navigate('browse-courses')} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700">Browse Courses</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrolled.map((course: any) => (
                            <div key={course._id} onClick={() => navigate('course-view', { courseId: course._id })} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600">
                                    {course.thumbnail ? <img src={`${SERVER_URL}${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-14 h-14 text-white/30" /></div>}
                                </div>
                                <div className="p-5">
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">{course.category}</p>
                                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{course.description}</p>
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                                        <span className="text-xs text-slate-500">{course.instructorName}</span>
                                        <span className="flex items-center gap-1 text-indigo-600 font-bold text-sm">View <ChevronRight className="w-4 h-4" /></span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
