import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import StudentSidebar from './sidebars/StudentSidebar';
import InstructorSidebar from './sidebars/InstructorSidebar';
import AdminSidebar from './sidebars/AdminSidebar';
import SuperAdminSidebar from './sidebars/SuperAdminSidebar';
import { LogOut, Bell, Search, Menu } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

interface LayoutProps {
  children: React.ReactNode;
  currentRoute: string;
  navigate: (route: string, params?: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentRoute, navigate }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Pick sidebar by role
  const renderSidebar = () => {
    const sidebarProps = { currentRoute, navigate, isOpen: isMobileMenuOpen, setIsOpen: setIsMobileMenuOpen };
    switch (user?.role) {
      case UserRole.STUDENT: return <StudentSidebar {...sidebarProps} />;
      case UserRole.INSTRUCTOR: return <InstructorSidebar {...sidebarProps} />;
      case UserRole.ADMIN: return <AdminSidebar {...sidebarProps} />;
      case UserRole.SUPER_ADMIN: return <SuperAdminSidebar {...sidebarProps} />;
      default: return <StudentSidebar {...sidebarProps} />;
    }
  };

  // Role-based header accent color
  const headerAccent = {
    [UserRole.STUDENT]: 'focus:ring-indigo-500',
    [UserRole.INSTRUCTOR]: 'focus:ring-violet-500',
    [UserRole.ADMIN]: 'focus:ring-amber-500',
    [UserRole.SUPER_ADMIN]: 'focus:ring-rose-500',
  }[user?.role || UserRole.STUDENT];

  const roleColor = {
    [UserRole.STUDENT]: 'text-indigo-600',
    [UserRole.INSTRUCTOR]: 'text-violet-600',
    [UserRole.ADMIN]: 'text-amber-600',
    [UserRole.SUPER_ADMIN]: 'text-rose-600',
  }[user?.role || UserRole.STUDENT];

  const avatarBg = {
    [UserRole.STUDENT]: 'bg-indigo-100 text-indigo-600',
    [UserRole.INSTRUCTOR]: 'bg-violet-100 text-violet-600',
    [UserRole.ADMIN]: 'bg-amber-100 text-amber-600',
    [UserRole.SUPER_ADMIN]: 'bg-rose-100 text-rose-600',
  }[user?.role || UserRole.STUDENT];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {renderSidebar()}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-md"
            >
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className={`pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm w-64 ${headerAccent} focus:ring-2 outline-none transition-all`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <NotificationDropdown />

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className={`text-xs font-bold uppercase tracking-wider ${roleColor}`}>{user?.role?.replace('_', ' ')}</p>
              </div>
              <div className={`w-9 h-9 rounded-full ${avatarBg} flex items-center justify-center font-bold text-sm border border-slate-100`}>
                {user?.name?.[0] || 'U'}
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
