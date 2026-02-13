import React, { useState, useEffect } from 'react';
import { coursesAPI, SERVER_URL } from '../../services/api';
import { BookOpen, Search, ChevronRight, Loader2, CheckCircle } from 'lucide-react';

const StudentCourses: React.FC<{ navigate: (r: string, p?: any) => void }> = ({ navigate }) => {
    const [courses, setCourses] = useState<any[]>([]);
    const [enrolled, setEnrolled] = useState<string[]>([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [enrollingId, setEnrollingId] = useState<string | null>(null);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setIsLoading(true);
        try {
            const [allRes, enrolledRes] = await Promise.all([
                coursesAPI.getAll({ search: search || undefined, category: category || undefined }),
                coursesAPI.getEnrolled()
            ]);
            setCourses(allRes.data);
            setEnrolled(enrolledRes.data.map((c: any) => c._id));
        } catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    const handleEnroll = async (id: string) => {
        setEnrollingId(id);
        try {
            await coursesAPI.enroll(id);
            setEnrolled(prev => [...prev, id]);
        } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
        finally { setEnrollingId(null); }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Browse Courses</h1>
                <p className="text-slate-500 mt-1">Find and enroll in courses that interest you.</p>
            </div>

            {/* Search/Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} placeholder="Search courses..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
                </div>
                <select value={category} onChange={e => { setCategory(e.target.value); }} className="px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm">
                    <option value="">All Categories</option>
                    {['Computer Science', 'Business', 'Arts', 'Data Science', 'Engineering', 'Mathematics', 'General'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={load} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-sm">Search</button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
            ) : courses.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No Courses Found</h3>
                    <p className="text-slate-500">Try a different search or category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course: any) => {
                        const isEnrolled = enrolled.includes(course._id);
                        return (
                            <div key={course._id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 cursor-pointer" onClick={() => navigate('course-view', { courseId: course._id })}>
                                    {course.thumbnail ? <img src={`${SERVER_URL}${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-14 h-14 text-white/30" /></div>}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-800">{course.enrolledStudents?.length || 0} Students</div>
                                </div>
                                <div className="p-5">
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">{course.category}</p>
                                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{course.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{course.description}</p>
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                                        <span className="text-xs text-slate-500">{course.instructorName}</span>
                                        {isEnrolled ? (
                                            <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs"><CheckCircle className="w-4 h-4" /> Enrolled</span>
                                        ) : (
                                            <button onClick={() => handleEnroll(course._id)} disabled={enrollingId === course._id} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50">
                                                {enrollingId === course._id ? 'Enrolling...' : 'Enroll'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentCourses;
