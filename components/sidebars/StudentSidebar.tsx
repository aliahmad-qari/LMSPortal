import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, BookOpen, MessageSquare, Video,
    GraduationCap, X, Compass, Library, ClipboardCheck
} from 'lucide-react';

interface Props {
    currentRoute: string;
    navigate: (route: string) => void;
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
}

const StudentSidebar: React.FC<Props> = ({ currentRoute, navigate, isOpen, setIsOpen }) => {
    const { user } = useAuth();

    const menu = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'browse-courses', label: 'Browse Courses', icon: Compass },
        { id: 'my-courses', label: 'My Courses', icon: Library },
        { id: 'assignments', label: 'Assignments', icon: ClipboardCheck },
        { id: 'quizzes', label: 'Quizzes', icon: BookOpen },
        { id: 'chat', label: 'Messages', icon: MessageSquare },
        { id: 'video', label: 'Live Classes', icon: Video },
    ];

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-indigo-900 via-indigo-900 to-indigo-950 text-white transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-indigo-800/50">
                        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('dashboard')}>
                            <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-950/50">
                                <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="text-lg font-extrabold tracking-tight">SmartLMS</span>
                                <p className="text-[10px] text-indigo-400 font-medium -mt-0.5">Student Portal</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-indigo-300 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>

                    {/* Profile Card */}
                    <div className="mx-4 mt-6 p-4 bg-indigo-800/40 rounded-2xl border border-indigo-700/30">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-lg font-bold shadow-lg">
                                {user?.name?.[0]}
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-sm truncate">{user?.name}</p>
                                <p className="text-xs text-indigo-300 truncate">{user?.department || 'Student'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                        <p className="px-3 mb-3 text-[10px] font-bold text-indigo-400/70 uppercase tracking-widest">Navigation</p>
                        {menu.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { navigate(item.id); setIsOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentRoute === item.id
                                    ? 'bg-indigo-500/20 text-white border border-indigo-500/30 shadow-lg shadow-indigo-900/20'
                                    : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${currentRoute === item.id ? 'text-indigo-300' : 'text-indigo-400'}`} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Bottom Card */}
                    <div className="p-3 mb-4">
                        <div className="p-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-xl">
                            <p className="text-sm font-bold mb-1">📚 Keep Learning!</p>
                            <p className="text-xs text-indigo-100/80">Track progress and stay on top of assignments.</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default StudentSidebar;
