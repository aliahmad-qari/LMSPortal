
import React from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Video,
  ShieldCheck,
  GraduationCap,
  X
} from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentRoute, navigate, isOpen, setIsOpen }) => {
  const { user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { id: 'chat', label: 'Messages', icon: MessageSquare, roles: [UserRole.STUDENT, UserRole.INSTRUCTOR] },
    { id: 'video', label: 'Live Classes', icon: Video, roles: [UserRole.STUDENT, UserRole.INSTRUCTOR] },
    { id: 'admin', label: 'University Mgmt', icon: ShieldCheck, roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
  ];

  const filteredItems = menuItems.filter(item => user?.role && item.roles.includes(user.role));

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-indigo-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-6 bg-indigo-950">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('dashboard')}>
              <GraduationCap className="w-8 h-8 text-indigo-400" />
              <span className="text-xl font-bold tracking-tight">SmartLMS</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-indigo-300 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${currentRoute === item.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/20'
                    : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}
                `}
              >
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${currentRoute === item.id ? 'text-indigo-200' : 'text-indigo-400'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 bg-indigo-950/50 mx-4 mb-6 rounded-2xl border border-indigo-800">
            <p className="text-xs text-indigo-400 font-semibold mb-1 uppercase tracking-wider">Quick Support</p>
            <p className="text-sm text-indigo-200 mb-3">Stuck with a course? Ask our AI assistant for help.</p>
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">
              AI Support
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
