import React, { useState, useEffect } from 'react';
import { usersAPI, coursesAPI } from '../../services/api';
import { Loader2, Search, Ban, CheckCircle } from 'lucide-react';

const AdminStudents: React.FC = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const [usersRes, coursesRes] = await Promise.all([
                usersAPI.getAll(),
                coursesAPI.getAll()
            ]);
            setStudents(usersRes.data.filter((u: any) => u.role === 'STUDENT'));
            setCourses(coursesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleBlock = async (userId: string, currentStatus: boolean) => {
        try {
            await usersAPI.update(userId, { isActive: !currentStatus });
            loadStudents();
        } catch (err) {
            console.error(err);
        }
    };

    const getEnrolledCount = (studentId: string) => {
        return courses.filter(c => c.enrolledStudents?.includes(studentId)).length;
    };

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Students</h1>
                    <p className="text-slate-500 mt-1">Manage all student accounts</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Joined</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Enrolled Courses</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map((student) => (
                            <tr key={student._id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{student.name}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{student.email}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{new Date(student.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{getEnrolledCount(student._id)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${student.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {student.isActive ? 'Active' : 'Blocked'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleBlock(student._id, student.isActive)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${student.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                    >
                                        {student.isActive ? <><Ban className="w-4 h-4 inline mr-1" />Block</> : <><CheckCircle className="w-4 h-4 inline mr-1" />Unblock</>}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminStudents;
