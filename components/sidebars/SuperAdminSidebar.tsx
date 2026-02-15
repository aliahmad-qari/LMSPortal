import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, BookOpen, Settings,
    GraduationCap, X, ShieldAlert, BarChart3, Database, Shield, Video
} from 'lucide-react';

interface Props {
    currentRoute: string;
    navigate: (route: string) => void;
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
}

const SuperAdminSidebar: React.FC<Props> = ({ currentRoute, navigate, isOpen, setIsOpen }) => {
    const { user } = useAuth();

    const menu = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'All Users', icon: Users },
        { id: 'admins', label: 'Admin Management', icon: ShieldAlert },
        { id: 'courses', label: 'All Courses', icon: BookOpen },
        { id: 'reports', label: 'Analytics', icon: BarChart3 },
        { id: 'settings', label: 'System Settings', icon: Settings },
    ];

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/50">
                        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('dashboard')}>
                            <div className="w-9 h-9 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-900/40">
                                <ShieldAlert className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="text-lg font-extrabold tracking-tight">SmartLMS</span>
                                <p className="text-[10px] text-rose-400 font-medium -mt-0.5">Super Admin</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>

                    {/* Profile Card */}
                    <div className="mx-4 mt-6 p-4 bg-slate-800/40 rounded-2xl border border-rose-900/30">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-lg font-bold shadow-lg shadow-rose-900/30">
                                {user?.name?.[0]}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-sm truncate">{user?.name}</p>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                                    <p className="text-xs text-rose-300 truncate">Super Administrator</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                        <p className="px-3 mb-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">System Control</p>
                        {menu.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { navigate(item.id); setIsOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentRoute === item.id
                                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/25 shadow-lg shadow-rose-900/10'
                                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${currentRoute === item.id ? 'text-rose-400' : 'text-slate-600'}`} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Bottom */}
                    <div className="p-3 mb-4">
                        <div className="p-4 bg-gradient-to-r from-rose-600/15 to-pink-600/15 rounded-2xl border border-rose-600/20">
                            <p className="text-sm font-bold mb-1 text-rose-300">⚡ Full System Access</p>
                            <p className="text-xs text-slate-500">Complete control over the entire LMS platform.</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default SuperAdminSidebar;
