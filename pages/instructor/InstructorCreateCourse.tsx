import React, { useState } from 'react';
import { coursesAPI } from '../../services/api';
import { X, Loader2, ChevronLeft, BookOpen, Upload } from 'lucide-react';

const InstructorCreateCourse: React.FC<{ navigate: (r: string, p?: any) => void }> = ({ navigate }) => {
    const [form, setForm] = useState({ title: '', description: '', category: 'General' });
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [creating, setCreating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setCreating(true);
        try {
            const fd = new FormData();
            fd.append('title', form.title); fd.append('description', form.description); fd.append('category', form.category);
            if (thumbnail) fd.append('thumbnail', thumbnail);
            await coursesAPI.create(fd);
            navigate('my-courses');
        } catch (err: any) { alert(err.response?.data?.message || 'Failed to create course'); }
        finally { setCreating(false); }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('dashboard')} className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50"><ChevronLeft className="w-5 h-5" /></button>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Create New Course</h1>
                    <p className="text-sm text-slate-500">Fill in the details below to create a course.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Course Title</label>
                        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Advanced React Architecture" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-lg" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What will students learn in this course?" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none h-32" required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none">
                            {['General', 'Computer Science', 'Business', 'Arts', 'Data Science', 'Engineering', 'Mathematics'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Course Thumbnail</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-violet-300 transition-colors">
                            {thumbnail ? (
                                <div className="flex items-center justify-center gap-3">
                                    <BookOpen className="w-8 h-8 text-violet-500" />
                                    <span className="font-medium text-slate-700">{thumbnail.name}</span>
                                    <button type="button" onClick={() => setThumbnail(null)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <label className="cursor-pointer">
                                    <Upload className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">Click to upload image</p>
                                    <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
                                    <input type="file" accept="image/*" onChange={e => setThumbnail(e.target.files?.[0] || null)} className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>
                    <button type="submit" disabled={creating} className="w-full bg-violet-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-violet-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200 disabled:opacity-50">
                        {creating ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : '🚀 Create Course'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InstructorCreateCourse;
