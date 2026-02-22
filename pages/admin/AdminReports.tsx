import React, { useState, useEffect } from 'react';
import { usersAPI, coursesAPI } from '../../services/api';
import { Loader2, Users, BookOpen, TrendingUp } from 'lucide-react';

const AdminReports: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [usersRes, coursesRes] = await Promise.all([
                usersAPI.getAll(),
                coursesAPI.getAll()
            ]);

            const now = new Date();
            const thisMonth = now.getMonth();
            const thisYear = now.getFullYear();

            const newUsersThisMonth = usersRes.data.filter((u: any) => {
                const created = new Date(u.createdAt);
                return created.getMonth() === thisMonth && created.getFullYear() === thisYear;
            }).length;

            const newCoursesThisMonth = coursesRes.data.filter((c: any) => {
                const created = new Date(c.createdAt);
                return created.getMonth() === thisMonth && created.getFullYear() === thisYear;
            }).length;

            setStats({
                totalUsers: usersRes.data.length,
                totalCourses: coursesRes.data.length,
                newUsersThisMonth,
                newCoursesThisMonth
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Reports</h1>
                <p className="text-slate-500 mt-1">System statistics and analytics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-50 text-blue-600 p-3 rounded-xl"><Users className="w-6 h-6" /></div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900">{stats?.totalUsers || 0}</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">Total Users</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-violet-50 text-violet-600 p-3 rounded-xl"><BookOpen className="w-6 h-6" /></div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900">{stats?.totalCourses || 0}</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">Total Courses</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-50 text-green-600 p-3 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900">{stats?.newUsersThisMonth || 0}</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">New Users This Month</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-amber-50 text-amber-600 p-3 rounded-xl"><BookOpen className="w-6 h-6" /></div>
                    </div>
                    <p className="text-3xl font-extrabold text-slate-900">{stats?.newCoursesThisMonth || 0}</p>
                    <p className="text-sm text-slate-500 font-medium mt-1">New Courses This Month</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Monthly Overview</h2>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm font-medium text-slate-700">New User Registrations</span>
                        <span className="text-lg font-bold text-slate-900">{stats?.newUsersThisMonth || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm font-medium text-slate-700">New Courses Created</span>
                        <span className="text-lg font-bold text-slate-900">{stats?.newCoursesThisMonth || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
