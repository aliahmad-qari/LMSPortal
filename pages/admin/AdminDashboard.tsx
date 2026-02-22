import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, adminFeaturesAPI } from '../../services/api';
import { Users, BookOpen, Shield, TrendingUp, Loader2, Tag } from 'lucide-react';

const AdminDashboard: React.FC<{ navigate: (r: string, p?: any) => void }> = ({ navigate }) => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [analyticsRes, categoriesRes] = await Promise.all([
                    usersAPI.getAnalytics(),
                    adminFeaturesAPI.getCategories()
                ]);
                setAnalytics({ ...analyticsRes.data, totalCategories: categoriesRes.data.length });
            }
            catch (err) { console.error(err); }
            finally { setIsLoading(false); }
        })();
    }, []);

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>;

    const stats = [
        { label: 'Total Students', value: analytics?.students || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { label: 'Total Instructors', value: analytics?.instructors || 0, icon: Shield, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
        { label: 'Total Courses', value: analytics?.totalCourses || 0, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { label: 'Total Categories', value: analytics?.totalCategories || 0, icon: Tag, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
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

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Registrations</h3>
                <div className="space-y-3">
                    {analytics?.recentUsers?.slice(0, 5).map((u: any) => (
                        <div key={u._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div>
                                <p className="font-medium text-slate-900">{u.name}</p>
                                <p className="text-sm text-slate-500">{u.email}</p>
                            </div>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">{u.role}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
