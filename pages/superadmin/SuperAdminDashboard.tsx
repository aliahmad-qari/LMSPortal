import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, coursesAPI } from '../../services/api';
import { Users, BookOpen, ShieldAlert, TrendingUp, Activity, Database, Server, Loader2 } from 'lucide-react';

const SuperAdminDashboard: React.FC<{ navigate: (r: string, p?: any) => void }> = ({ navigate }) => {
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

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-rose-600" /></div>;

    const stats = [
        { label: 'Total Users', value: analytics?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { label: 'Admins', value: analytics?.admins || 0, icon: ShieldAlert, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
        { label: 'Instructors', value: analytics?.instructors || 0, icon: Activity, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
        { label: 'Students', value: analytics?.students || 0, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { label: 'Total Courses', value: analytics?.totalCourses || 0, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
        { label: 'Active Users', value: analytics?.activeUsers || analytics?.totalUsers || 0, icon: Activity, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-100' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">System Control Center</h1>
                    <p className="text-slate-500 mt-1">Full platform overview — <span className="font-semibold text-rose-500">{user?.name}</span></p>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-sm font-bold">
                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span> Super Admin
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className={`bg-white p-6 rounded-2xl border ${s.border} shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${s.bg} ${s.color} p-3 rounded-xl`}><s.icon className="w-6 h-6" /></div>
                        </div>
                        <p className="text-3xl font-extrabold text-slate-900">{s.value}</p>
                        <p className="text-sm text-slate-500 font-medium mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button onClick={() => navigate('users')} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all text-left group">
                    <Users className="w-8 h-8 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-slate-900">All Users</h3>
                    <p className="text-xs text-slate-500 mt-1">Manage every user account</p>
                </button>
                <button onClick={() => navigate('admins')} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all text-left group">
                    <ShieldAlert className="w-8 h-8 text-rose-500 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-slate-900">Admin Mgmt</h3>
                    <p className="text-xs text-slate-500 mt-1">Promote or manage admin roles</p>
                </button>
                <button onClick={() => navigate('courses')} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all text-left group">
                    <BookOpen className="w-8 h-8 text-violet-500 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-slate-900">All Courses</h3>
                    <p className="text-xs text-slate-500 mt-1">View and manage all courses</p>
                </button>
                <button onClick={() => navigate('settings')} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all text-left group">
                    <Server className="w-8 h-8 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-slate-900">System Settings</h3>
                    <p className="text-xs text-slate-500 mt-1">Platform configuration</p>
                </button>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
