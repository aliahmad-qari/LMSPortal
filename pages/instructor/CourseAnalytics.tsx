import React, { useEffect, useState } from 'react';
import { instructorFeaturesAPI } from '../../services/api';
import { BarChart3, Users, BookOpen, BrainCircuit } from 'lucide-react';

const CourseAnalytics = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await instructorFeaturesAPI.getAnalytics();
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-7 h-7 text-indigo-600" />
                Course Analytics
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Courses */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Courses</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats?.totalCourses || 0}</h3>
                        </div>
                    </div>
                </div>

                {/* Total Students */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Students</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats?.totalStudents || 0}</h3>
                        </div>
                    </div>
                </div>

                {/* Quiz Attempts */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <BrainCircuit className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Quiz Attempts</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats?.totalQuizAttempts || 0}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Placeholder for charts */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                <p className="text-slate-500">More detailed charts (Enrollment Growth, Quiz Performance) coming soon...</p>
            </div>
        </div>
    );
};

export default CourseAnalytics;
