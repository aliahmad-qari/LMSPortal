
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  Video, 
  Settings, 
  ShieldCheck, 
  Users, 
  GraduationCap,
  X,
  FileText,
  ClipboardCheck,
  Zap,
  HelpCircle,
  Search,
  BookMarked,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentRoute, navigate, isOpen, setIsOpen }) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    if (!user) return [];

    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'admin-manage', label: 'Manage Admins', icon: ShieldCheck },
          { id: 'admin-users', label: 'All Users', icon: Users },
          { id: 'admin-analytics', label: 'System Analytics', icon: BarChart3 },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case UserRole.ADMIN:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'admin-courses', label: 'Manage Courses', icon: BookOpen },
          { id: 'admin-instructors', label: 'Manage Instructors', icon: GraduationCap },
          { id: 'admin-students', label: 'Manage Students', icon: Users },
          { id: 'admin-reports', label: 'Reports', icon: FileText },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case UserRole.INSTRUCTOR:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'courses', label: 'My Courses', icon: BookMarked },
          { id: 'catalog', label: 'Course Catalog', icon: Search },
          { id: 'instructor-upload', label: 'Upload Content', icon: Zap },
          { id: 'assignments', label: 'Grading', icon: FileText },
          { id: 'video', label: 'Live Class', icon: Video },
          { id: 'chat', label: 'Chat', icon: MessageSquare },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case UserRole.STUDENT:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'catalog', label: 'Course Catalog', icon: Search },
          { id: 'courses', label: 'My Learning', icon: BookOpen },
          { id: 'assignments', label: 'Assignments', icon: FileText },
          { id: 'quizzes', label: 'Quizzes', icon: ClipboardCheck },
          { id: 'video', label: 'Live Classes', icon: Video },
          { id: 'chat', label: 'Chat', icon: MessageSquare },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();
  const enrolledCount = user?.enrolledCourses?.length || 0;
  // Dynamic progress based on number of enrolled courses (mock calculation)
  const progressPercent = Math.min(100, (enrolledCount * 25)); 

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-indigo-950 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-6 bg-indigo-950 shrink-0 border-b border-indigo-900/50">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-indigo-400" />
              <span className="text-xl font-bold tracking-tight">SmartLMS</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-indigo-300 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentRoute === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-300 hover:bg-indigo-800/50 hover:text-white'}`}
              >
                <item.icon className={`w-5 h-5 ${currentRoute === item.id ? 'text-white' : 'text-indigo-500 group-hover:text-indigo-400'}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          {user?.role === UserRole.STUDENT && (
            <div className="px-6 py-4 border-t border-indigo-900 bg-indigo-950">
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-3">Your Journey</p>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-indigo-200 font-medium">Curriculum Progress</span>
                <span className="text-white font-bold">{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-indigo-900 rounded-full overflow-hidden border border-indigo-800">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="p-4 bg-indigo-950 mx-4 mb-6 rounded-2xl border border-indigo-900 shrink-0">
            <p className="text-xs text-indigo-400 font-semibold mb-1 uppercase tracking-wider">AI Support</p>
            <button 
              onClick={() => { navigate('ai-tutor'); setIsOpen(false); }}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <HelpCircle className="w-4 h-4" /> Ask Tutor
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
