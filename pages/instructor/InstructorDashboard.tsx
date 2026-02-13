import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { coursesAPI, SERVER_URL } from '../../services/api';
import { BookOpen, Users, PlayCircle, TrendingUp, ChevronRight, Loader2 } from 'lucide-react';

const InstructorDashboard: React.FC<{ navigate: (r: string, p?: any) => void }> = ({ navigate }) => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try { const res = await coursesAPI.getTeaching(); setCourses(res.data); }
        catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>;

    const totalStudents = courses.reduce((a: number, c: any) => a + (c.enrolledStudents?.length || 0), 0);

    const stats = [
        { label: 'My Courses', value: courses.length, icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-50' },
        { label: 'Total Students', value: totalStudents, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Published', value: courses.filter((c: any) => c.isPublished).length, icon: PlayCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Categories', value: [...new Set(courses.map((c: any) => c.category))].length, icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Welcome, <span className="text-violet-600">{user?.name}!</span></h1>
                    <p className="text-slate-500 mt-1">Your teaching overview at a glance.</p>
                </div>
                <button onClick={() => navigate('create-course')} className="flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200">+ Create New Course</button>
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
                <h2 className="text-xl font-bold text-slate-900 mb-4">Your Courses</h2>
                {courses.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold mb-2">No Courses Yet</h3>
                        <p className="text-slate-500 mb-4">Create your first course to get started.</p>
                        <button onClick={() => navigate('create-course')} className="bg-violet-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-violet-700">Create Course</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((c: any) => (
                            <div key={c._id} onClick={() => navigate('course-view', { courseId: c._id })} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group">
                                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600">
                                    {c.thumbnail ? <img src={`${SERVER_URL}${c.thumbnail}`} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-14 h-14 text-white/30" /></div>}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold">{c.enrolledStudents?.length || 0} Students</div>
                                </div>
                                <div className="p-5">
                                    <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">{c.category}</p>
                                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-violet-600 transition-colors">{c.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{c.description}</p>
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{c.isPublished ? 'Published' : 'Draft'}</span>
                                        <span className="flex items-center gap-1 text-violet-600 font-bold text-sm">Manage <ChevronRight className="w-4 h-4" /></span>
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

export default InstructorDashboard;
