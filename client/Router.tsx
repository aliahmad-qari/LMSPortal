
import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CourseView from './pages/CourseView';
import CourseCatalog from './pages/CourseCatalog';
import AssignmentsPage from './pages/AssignmentsPage';
import ChatPage from './pages/ChatPage';
import VideoCallPage from './pages/VideoCallPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import AITutorPage from './pages/AITutorPage';
import Layout from './components/Layout';
import { Course, UserRole } from './types';
// Import Zap icon from lucide-react
import { Zap } from 'lucide-react';

export const AppRouter: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold text-slate-600 tracking-tight">Booting University Cloud...</p>
    </div>
  );

  if (!user) return <LoginPage />;

  const navigate = (route: string, params?: any) => {
    if (params?.courseId) {
      setActiveCourseId(params.courseId);
    }
    setCurrentRoute(route);
  };

  const renderRoute = () => {
    switch (currentRoute) {
      case 'dashboard': 
        return <Dashboard navigate={navigate} />;
      case 'catalog':
        return <CourseCatalog navigate={navigate} />;
      case 'course': 
        return <CourseView courseId={activeCourseId || '1'} navigate={navigate} />;
      case 'assignments':
        return <AssignmentsPage />;
      case 'courses':
        // Filter catalog for "My Learning" logic handled within Catalog or separate page
        return <CourseCatalog navigate={navigate} />;
      case 'quizzes':
        return (
          <div className="p-12 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm animate-in zoom-in-95 duration-300">
             <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-amber-500 animate-pulse" />
             </div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">Examination Portal</h2>
             <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">There are currently no scheduled quizzes for your active curriculum modules.</p>
             <button onClick={() => navigate('dashboard')} className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Return to Dashboard</button>
          </div>
        );
      case 'settings':
        return <ProfilePage />;
      case 'chat': return <ChatPage navigate={navigate} />;
      case 'video': return <VideoCallPage navigate={navigate} />;
      case 'ai-tutor': return <AITutorPage navigate={navigate} />;
      case 'admin':
      case 'admin-manage':
      case 'admin-users':
      case 'admin-analytics':
      case 'admin-instructors':
      case 'admin-students':
        return <AdminPage navigate={navigate} currentView={currentRoute} />;
      default: 
        return <Dashboard navigate={navigate} />;
    }
  };

  return (
    <Layout currentRoute={currentRoute} navigate={navigate}>
      {renderRoute()}
    </Layout>
  );
};
