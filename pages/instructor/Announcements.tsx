import React, { useEffect, useState } from 'react';
import { instructorFeaturesAPI, coursesAPI } from '../../services/api';
import { Megaphone, Plus } from 'lucide-react';

const Announcements = () => {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [newAnnouncement, setNewAnnouncement] = useState({ courseId: '', title: '', content: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [annRes, courseRes] = await Promise.all([
                instructorFeaturesAPI.getAnnouncements(),
                coursesAPI.getTeaching()
            ]);
            setAnnouncements(annRes.data);
            setCourses(courseRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await instructorFeaturesAPI.createAnnouncement(newAnnouncement);
            setAnnouncements([res.data, ...announcements]); // Add new to top
            setNewAnnouncement({ courseId: '', title: '', content: '' });
            alert('Announcement posted!');
        } catch (err) {
            alert('Failed to post announcement');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Form */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-indigo-600" />
                        New Announcement
                    </h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Select Course</label>
                            <select
                                value={newAnnouncement.courseId}
                                onChange={e => setNewAnnouncement({ ...newAnnouncement, courseId: e.target.value })}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                                required
                            >
                                <option value="">Select a course...</option>
                                {courses.map(c => (
                                    <option key={c._id} value={c._id}>{c.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={newAnnouncement.title}
                                onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                            <textarea
                                value={newAnnouncement.content}
                                onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none h-32 resize-none"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                            Post Announcement
                        </button>
                    </form>
                </div>
            </div>

            {/* List */}
            <div className="lg:col-span-2">
                <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Megaphone className="w-7 h-7 text-indigo-600" />
                    Recent Announcements
                </h1>

                <div className="space-y-4">
                    {loading ? (
                        <p className="text-slate-500">Loading...</p>
                    ) : announcements.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
                            No announcements posted yet.
                        </div>
                    ) : (
                        announcements.map(ann => (
                            <div key={ann._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-slate-900">{ann.title}</h3>
                                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-medium">
                                        {ann.course?.title || 'General'}
                                    </span>
                                </div>
                                <p className="text-slate-600 mb-3">{ann.content}</p>
                                <p className="text-xs text-slate-400">Posted on {new Date(ann.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Announcements;
