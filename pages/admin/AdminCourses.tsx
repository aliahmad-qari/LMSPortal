import React, { useState, useEffect } from 'react';
import { coursesAPI, SERVER_URL } from '../../services/api';
import { BookOpen, Search, Loader2, Users, Eye } from 'lucide-react';

const AdminCourses: React.FC<{ navigate: (r: string, p?: any) => void }> = ({ navigate }) => {
    const [courses, setCourses] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setIsLoading(true);
        try { const res = await coursesAPI.getAll({ search: search || undefined }); setCourses(res.data); }
        catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900">All Courses</h1>
                <p className="text-slate-500 mt-1">Overview of all courses in the system.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} placeholder="Search courses..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none shadow-sm" />
                </div>
                <button onClick={load} className="bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-sm">Search</button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>
            ) : courses.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">No Courses Found</h3>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="bg-slate-50"><th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Course</th><th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Instructor</th><th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th><th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Students</th><th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th></tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {courses.map((c: any) => (
                                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center overflow-hidden">
                                                    {c.thumbnail ? <img src={`${SERVER_URL}${c.thumbnail}`} alt="" className="w-full h-full object-cover" /> : <BookOpen className="w-6 h-6 text-amber-500" />}
                                                </div>
                                                <div><p className="font-bold text-slate-900 text-sm">{c.title}</p><p className="text-xs text-slate-500 line-clamp-1">{c.description}</p></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{c.instructorName || '—'}</td>
                                        <td className="px-6 py-4"><span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{c.category}</span></td>
                                        <td className="px-6 py-4"><span className="flex items-center gap-1 text-sm text-slate-600"><Users className="w-4 h-4" /> {c.enrolledStudents?.length || 0}</span></td>
                                        <td className="px-6 py-4"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{c.isPublished ? 'Published' : 'Draft'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCourses;
