import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { coursesAPI, assignmentsAPI, SERVER_URL } from '../../services/api';
import { Loader2, Plus, FileText, Calendar, Trash2, Edit, Download, CheckCircle, X } from 'lucide-react';

const InstructorAssignments: React.FC<{ navigate: (r: string, p?: any) => void }> = ({ navigate }) => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        totalMarks: 100,
        file: null as File | null
    });

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            loadAssignments(selectedCourse);
        } else {
            setAssignments([]);
        }
    }, [selectedCourse]);

    const loadCourses = async () => {
        try {
            const res = await coursesAPI.getTeaching();
            setCourses(res.data);
            if (res.data.length > 0) setSelectedCourse(res.data[0]._id);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadAssignments = async (courseId: string) => {
        try {
            const res = await assignmentsAPI.getByCourse(courseId);
            setAssignments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await assignmentsAPI.delete(id);
                setAssignments(assignments.filter(a => a._id !== id));
            } catch (err) {
                console.error(err);
                alert('Failed to delete assignment');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('courseId', selectedCourse);
            data.append('dueDate', formData.dueDate);
            data.append('totalMarks', formData.totalMarks.toString());
            if (formData.file) {
                data.append('file', formData.file);
            }

            await assignmentsAPI.create(data);
            setShowModal(false);
            setFormData({ title: '', description: '', dueDate: '', totalMarks: 100, file: null });
            loadAssignments(selectedCourse);
        } catch (err) {
            console.error(err);
            alert('Failed to create assignment');
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Assignment Management</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4" /> Create Assignment
                </button>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <label className="font-semibold text-slate-700">Select Course:</label>
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="border-slate-300 rounded-lg p-2 min-w-[200px]"
                >
                    {courses.map(c => (
                        <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                </select>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {assignments.map(assignment => (
                    <div key={assignment._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleDelete(assignment._id)} className="text-slate-400 hover:text-red-600 transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1">{assignment.title}</h3>
                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{assignment.description}</p>

                        <div className="space-y-2 text-sm text-slate-600 mb-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-slate-400" />
                                <span>{assignment.totalMarks} Marks</span>
                            </div>
                        </div>

                        {assignment.fileUrl && (
                            <a
                                href={`${SERVER_URL}${assignment.fileUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="block w-full text-center py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors mb-2"
                            >
                                <Download className="w-4 h-4 inline mr-2" /> Download file
                            </a>
                        )}

                        <button
                            onClick={() => navigate('submissions', { assignmentId: assignment._id, assignmentTitle: assignment.title })}
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                            View Submissions
                        </button>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Create Assignment</h2>
                            <button onClick={() => setShowModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input required type="text" className="w-full rounded-lg border-slate-300" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea required rows={4} className="w-full rounded-lg border-slate-300" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                                    <input required type="date" className="w-full rounded-lg border-slate-300" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Marks</label>
                                    <input required type="number" className="w-full rounded-lg border-slate-300" value={formData.totalMarks} onChange={e => setFormData({ ...formData, totalMarks: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Attachment (Optional)</label>
                                <input type="file" className="w-full" onChange={e => setFormData({ ...formData, file: e.target.files?.[0] || null })} />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">Create Assignment</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorAssignments;
