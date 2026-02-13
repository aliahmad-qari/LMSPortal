import React, { useState } from 'react';
import { useAuth, UserRole } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import StudentCourseView from './pages/student/StudentCourseView';

// Instructor pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorCourseView from './pages/instructor/InstructorCourseView';
import InstructorCreateCourse from './pages/instructor/InstructorCreateCourse';
import InstructorSubmissions from './pages/instructor/InstructorSubmissions';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';

// Super Admin pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminSettings from './pages/superadmin/SuperAdminSettings';

// Shared pages
import ChatPage from './pages/ChatPage';
import VideoCallPage from './pages/VideoCallPage';

import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';

export const AppRouter: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [routeParams, setRouteParams] = useState<any>({});
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading SmartLMS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authView === 'register') return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
  }

  const navigate = (route: string, params?: any) => {
    setRouteParams(params || {});
    setCurrentRoute(route);
  };

  // ─── Student Routes ──────────────────────────
  const renderStudentRoute = () => {
    switch (currentRoute) {
      case 'dashboard': return <StudentDashboard navigate={navigate} />;
      case 'browse-courses': return <StudentCourses navigate={navigate} />;
      case 'my-courses': return <StudentCourses navigate={navigate} />;
      case 'course-view': return <StudentCourseView courseId={routeParams.courseId} navigate={navigate} />;
      case 'chat': return <ChatPage navigate={navigate} initialRoomId={routeParams.roomId} />;
      case 'video': return <VideoCallPage navigate={navigate} courseId={routeParams.courseId} />;
      default: return <StudentDashboard navigate={navigate} />;
    }
  };

  // ─── Instructor Routes ───────────────────────
  const renderInstructorRoute = () => {
    switch (currentRoute) {
      case 'dashboard': return <InstructorDashboard navigate={navigate} />;
      case 'my-courses': return <InstructorDashboard navigate={navigate} />;
      case 'course-view': return <InstructorCourseView courseId={routeParams.courseId} navigate={navigate} />;
      case 'create-course': return <InstructorCreateCourse navigate={navigate} />;
      case 'submissions': return <InstructorSubmissions assignmentId={routeParams.assignmentId} assignmentTitle={routeParams.assignmentTitle} navigate={navigate} />;
      case 'chat': return <ChatPage navigate={navigate} initialRoomId={routeParams.roomId} />;
      case 'video': return <VideoCallPage navigate={navigate} courseId={routeParams.courseId} />;
      default: return <InstructorDashboard navigate={navigate} />;
    }
  };

  // ─── Admin Routes ────────────────────────────
  const renderAdminRoute = () => {
    switch (currentRoute) {
      case 'dashboard': return <AdminDashboard navigate={navigate} />;
      case 'users': return <AdminUsers navigate={navigate} />;
      case 'courses': return <AdminCourses navigate={navigate} />;
      case 'reports': return <AdminDashboard navigate={navigate} />;
      default: return <AdminDashboard navigate={navigate} />;
    }
  };

  // ─── Super Admin Routes ──────────────────────
  const renderSuperAdminRoute = () => {
    switch (currentRoute) {
      case 'dashboard': return <SuperAdminDashboard navigate={navigate} />;
      case 'users': return <AdminUsers navigate={navigate} />;
      case 'admins': return <AdminUsers navigate={navigate} />;
      case 'courses': return <AdminCourses navigate={navigate} />;
      case 'reports': return <SuperAdminDashboard navigate={navigate} />;
      case 'settings': return <SuperAdminSettings navigate={navigate} />;
      default: return <SuperAdminDashboard navigate={navigate} />;
    }
  };

  const renderRoute = () => {
    switch (user.role) {
      case UserRole.STUDENT: return renderStudentRoute();
      case UserRole.INSTRUCTOR: return renderInstructorRoute();
      case UserRole.ADMIN: return renderAdminRoute();
      case UserRole.SUPER_ADMIN: return renderSuperAdminRoute();
      default: return renderStudentRoute();
    }
  };

  return (
    <Layout currentRoute={currentRoute} navigate={navigate}>
      {renderRoute()}
    </Layout>
  );
};
