import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import { Users, BookOpen, Shield, TrendingUp, Loader2 } from 'lucide-react';

const AdminDashboard: React.FC<{ navigate: (r: string, p?: any) => void }> = ({ navigate }) => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try { const res = await usersAPI.getAnalytics(); setAnalytics(res.data); }
            catch (err) { console.error(err); }
            finally { setIsLoading(false); }
        })();
    }, []);

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>;

    const stats = [
        { label: 'Total Users', value: analytics?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { label: 'Instructors', value: analytics?.instructors || 0, icon: Shield, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
        { label: 'Students', value: analytics?.students || 0, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { label: 'Total Courses', value: analytics?.totalCourses || 0, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-500 mt-1">Welcome back, <span className="font-semibold text-amber-600">{user?.name}</span></p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className={`bg-white p-6 rounded-2xl border ${s.border} shadow-sm hover:shadow-md transition-shadow`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${s.bg} ${s.color} p-3 rounded-xl`}><s.icon className="w-6 h-6" /></div>
                        </div>
                        <p className="text-3xl font-extrabold text-slate-900">{s.value}</p>
                        <p className="text-sm text-slate-500 font-medium mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => navigate('users')} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all text-left group">
                    <Users className="w-8 h-8 text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-slate-900">Manage Users</h3>
                    <p className="text-sm text-slate-500 mt-1">Create, edit, and manage user accounts</p>
                </button>
                <button onClick={() => navigate('courses')} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all text-left group">
                    <BookOpen className="w-8 h-8 text-violet-500 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-slate-900">View Courses</h3>
                    <p className="text-sm text-slate-500 mt-1">Overview of all courses in the system</p>
                </button>
                <button onClick={() => navigate('reports')} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all text-left group">
                    <TrendingUp className="w-8 h-8 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-slate-900">Reports</h3>
                    <p className="text-sm text-slate-500 mt-1">View analytics and system reports</p>
                </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">System Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-slate-50 rounded-2xl">
                        <p className="text-2xl font-extrabold text-slate-900">{analytics?.admins || 0}</p>
                        <p className="text-xs text-slate-500 mt-1">Admins</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-2xl">
                        <p className="text-2xl font-extrabold text-slate-900">{analytics?.instructors || 0}</p>
                        <p className="text-xs text-slate-500 mt-1">Instructors</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-2xl">
                        <p className="text-2xl font-extrabold text-slate-900">{analytics?.students || 0}</p>
                        <p className="text-xs text-slate-500 mt-1">Students</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-2xl">
                        <p className="text-2xl font-extrabold text-slate-900">{analytics?.totalCourses || 0}</p>
                        <p className="text-xs text-slate-500 mt-1">Courses</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
