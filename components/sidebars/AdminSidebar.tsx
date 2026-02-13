import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Users, BookOpen,
    GraduationCap, X, BarChart3, Shield
} from 'lucide-react';

interface Props {
    currentRoute: string;
    navigate: (route: string) => void;
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
}

const AdminSidebar: React.FC<Props> = ({ currentRoute, navigate, isOpen, setIsOpen }) => {
    const { user } = useAuth();

    const menu = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'courses', label: 'Course Overview', icon: BookOpen },
        { id: 'reports', label: 'Reports', icon: BarChart3 },
    ];

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 text-white transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700/50">
                        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('dashboard')}>
                            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="text-lg font-extrabold tracking-tight">SmartLMS</span>
                                <p className="text-[10px] text-amber-400 font-medium -mt-0.5">Admin Panel</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>

                    {/* Profile Card */}
                    <div className="mx-4 mt-6 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/40">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg font-bold shadow-lg">
                                {user?.name?.[0]}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-sm truncate">{user?.name}</p>
                                <p className="text-xs text-amber-300 truncate">Administrator</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                        <p className="px-3 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Management</p>
                        {menu.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { navigate(item.id); setIsOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentRoute === item.id
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-900/10'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${currentRoute === item.id ? 'text-amber-400' : 'text-slate-500'}`} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Bottom */}
                    <div className="p-3 mb-4">
                        <div className="p-4 bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-2xl border border-amber-600/20">
                            <p className="text-sm font-bold mb-1 text-amber-300">🛡️ Admin Access</p>
                            <p className="text-xs text-slate-400">Manage users, monitor courses and system health.</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
