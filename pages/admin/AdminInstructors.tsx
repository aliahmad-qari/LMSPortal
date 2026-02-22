import React, { useState, useEffect } from 'react';
import { usersAPI, coursesAPI } from '../../services/api';
import { Loader2, Plus, Ban, CheckCircle, Trash2, X } from 'lucide-react';

const AdminInstructors: React.FC = () => {
    const [instructors, setInstructors] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '' });

    useEffect(() => {
        loadInstructors();
    }, []);

    const loadInstructors = async () => {
        try {
            const [usersRes, coursesRes] = await Promise.all([
                usersAPI.getAll(),
                coursesAPI.getAll()
            ]);
            setInstructors(usersRes.data.filter((u: any) => u.role === 'INSTRUCTOR'));
            setCourses(coursesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await usersAPI.create({ ...formData, role: 'INSTRUCTOR' });
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', department: '' });
            loadInstructors();
        } catch (err) {
            console.error(err);
        }
    };

    const toggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await usersAPI.update(userId, { isActive: !currentStatus });
            loadInstructors();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Delete this instructor? All their courses will be removed.')) return;
        try {
            await usersAPI.delete(userId);
            loadInstructors();
        } catch (err) {
            console.error(err);
        }
    };

    const getCoursesCount = (instructorId: string) => {
        return courses.filter(c => c.instructor?._id === instructorId || c.instructor === instructorId).length;
    };

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Instructors</h1>
                    <p className="text-slate-500 mt-1">Manage instructor accounts</p>
                </div>
                <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 flex items-center gap-2">
                    <Plus className="w-5 h-5" />Add Instructor
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Courses Created</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {instructors.map((instructor) => (
                            <tr key={instructor._id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{instructor.name}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{instructor.email}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{instructor.department || 'N/A'}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{getCoursesCount(instructor._id)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${instructor.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {instructor.isActive ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    <button
                                        onClick={() => toggleStatus(instructor._id, instructor.isActive)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium ${instructor.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                    >
                                        {instructor.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                    </button>
                                    <button onClick={() => handleDelete(instructor._id)} className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900">Add Instructor</h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
                            </div>
                            <button type="submit" className="w-full py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">Create Instructor</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInstructors;
