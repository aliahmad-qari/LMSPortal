
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, Course, DashboardStats } from '../types';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Users, 
  TrendingUp, 
  PlayCircle,
  ChevronRight,
  Plus,
  GraduationCap,
  Layers,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  ShieldAlert,
  Loader2,
  AlertCircle,
  ClipboardList,
  Video,
  FileText
} from 'lucide-react';

const MOCK_COURSES: Course[] = [
  { id: '1', title: 'Advanced React Architecture', description: 'Master large-scale web applications with React 18.', instructorId: 'i1', instructorName: 'Dr. Alan Smith', thumbnail: 'https://picsum.photos/seed/react/800/450', enrolledCount: 124, status: 'active' },
  { id: '2', title: 'Cloud Computing & AWS', description: 'Learn how to architect scalable systems on AWS.', instructorId: 'i2', instructorName: 'Sarah Johnson', thumbnail: 'https://picsum.photos/seed/cloud/800/450', enrolledCount: 89, status: 'active' },
  { id: '3', title: 'Machine Learning Fundamentals', description: 'Intro to neural networks and classification.', instructorId: 'i3', instructorName: 'Prof. Michael Chen', thumbnail: 'https://picsum.photos/seed/ml/800/450', enrolledCount: 210, status: 'active' }
];

interface DashboardProps {
  navigate: (route: string, params?: any) => void;
}

const StatsCard: React.FC<{ label: string, value: string | number, sub?: string, icon: any, color: string, bg: string, onClick?: () => void }> = ({ label, value, sub, icon: Icon, color, bg, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 ${onClick ? 'cursor-pointer hover:border-indigo-200' : ''}`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`${bg} ${color} p-3 rounded-2xl`}>
        <Icon className="w-6 h-6" />
      </div>
      {sub && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{sub}</span>}
    </div>
    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
    <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{value}</h3>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ navigate }) => {
  const { user, enrollCourse } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      await new Promise(r => setTimeout(r, 800));
      setStats({
        totalUsers: 2450, totalCourses: 112, activeAdmins: 8, totalStudents: 2200, 
        totalInstructors: 142, pendingAssignments: 4, upcomingClasses: 3, activeEnrollments: 840
      });
      setIsLoading(false);
    };
    fetchStats();
  }, [user?.role]);

  if (isLoading) return <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /><p className="font-bold">Loading Workspace...</p></div>;

  const isEnrolled = (courseId: string) => user?.enrolledCourses?.includes(courseId);
  const enrolledCoursesList = MOCK_COURSES.filter(c => isEnrolled(c.id));

  const renderStudent = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard onClick={() => navigate('courses')} label="Active Courses" value={enrolledCoursesList.length} icon={BookOpen} color="text-indigo-600" bg="bg-indigo-50" />
        <StatsCard onClick={() => navigate('assignments')} label="Assignments" value={stats?.pendingAssignments || 0} icon={FileText} color="text-amber-600" bg="bg-amber-50" />
        <StatsCard onClick={() => navigate('video')} label="Upcoming Classes" value={stats?.upcomingClasses || 0} icon={Video} color="text-emerald-600" bg="bg-emerald-50" />
        <StatsCard onClick={() => navigate('quizzes')} label="Available Quizzes" value="3" icon={ClipboardList} color="text-rose-600" bg="bg-rose-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-indigo-600" /> Your Current Studies</h2>
              <button onClick={() => navigate('courses')} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">My Course Dashboard <ChevronRight className="w-3 h-3" /></button>
            </div>
            {enrolledCoursesList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrolledCoursesList.map((course) => (
                  <div key={course.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl group transition-all">
                    <div className="relative h-40 overflow-hidden">
                      <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-slate-900 mb-4 truncate">{course.title}</h3>
                      <button 
                        onClick={() => navigate('course', { courseId: course.id })} 
                        className="w-full bg-slate-100 text-slate-700 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        Enter Classroom <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No courses enrolled yet.</p>
                <button onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })} className="mt-4 text-indigo-600 font-bold text-sm">Explore Course Catalog</button>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Layers className="w-5 h-5 text-indigo-600" /> Discover Courses</h2></div>
            <div className="space-y-4">
              {MOCK_COURSES.map((course) => (
                <div key={course.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-6 hover:border-indigo-200 transition-all">
                  <div className="w-full sm:w-48 h-32 rounded-2xl overflow-hidden shrink-0"><img src={course.thumbnail} className="w-full h-full object-cover" /></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 truncate mb-1">{course.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructorName}`} className="w-6 h-6 rounded-full" /><span className="text-xs font-bold text-slate-600">{course.instructorName}</span></div>
                      {isEnrolled(course.id) ? (
                        <button onClick={() => navigate('course', { courseId: course.id })} className="bg-slate-100 text-slate-700 px-5 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white">Enter Classroom</button>
                      ) : (
                        <button onClick={() => enrollCourse(course.id)} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg">Enroll Now</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-600" /> Academic Progress</h3>
            <div className="space-y-6">
              {enrolledCoursesList.length > 0 ? enrolledCoursesList.map((course, i) => {
                const progress = [65, 32, 88][i % 3];
                return (
                  <div key={course.id}>
                    <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-wide"><span className="text-slate-700 truncate w-3/4">{course.title}</span><span className="text-indigo-600">{progress}%</span></div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div></div>
                  </div>
                );
              }) : <p className="text-xs text-slate-400 italic text-center py-4">Enroll in a course to see tracking!</p>}
            </div>
          </div>
          <div className="bg-indigo-900 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden group">
            <h3 className="text-lg font-bold mb-2">Academic AI Support</h3>
            <p className="text-indigo-200 text-sm mb-4 leading-relaxed">Book a session or chat instantly with our AI expert for help with assignments.</p>
            <button onClick={() => navigate('ai-tutor')} className="bg-white text-indigo-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all">Open AI Tutor</button>
            <GraduationCap className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );

  const getDashboardContent = () => {
    switch (user?.role) {
      case UserRole.SUPER_ADMIN: 
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard label="Global Users" value={stats?.totalUsers || 0} sub="+12%" icon={Users} color="text-indigo-600" bg="bg-indigo-50" />
              <StatsCard label="Global Courses" value={stats?.totalCourses || 0} sub="+4" icon={BookOpen} color="text-amber-600" bg="bg-amber-50" />
              <StatsCard label="Active Admins" value={stats?.activeAdmins || 0} icon={ShieldAlert} color="text-emerald-600" bg="bg-emerald-50" />
              <StatsCard label="System Uptime" value="99.9%" sub="Live" icon={TrendingUp} color="text-rose-600" bg="bg-rose-50" />
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">System Health Logs</h3>
                <button onClick={() => navigate('admin-analytics')} className="text-indigo-600 text-sm font-bold hover:underline">Full Audit</button>
              </div>
              <div className="space-y-3">
                {['Security patches applied', 'Admin account created for IT-Dept', 'DB Backup Successful'].map((log, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <AlertCircle className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium text-slate-700">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case UserRole.ADMIN: 
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard label="Total Students" value={stats?.totalStudents || 0} icon={Users} color="text-indigo-600" bg="bg-indigo-50" />
              <StatsCard label="Total Faculty" value={stats?.totalInstructors || 0} icon={GraduationCap} color="text-emerald-600" bg="bg-emerald-50" />
              <StatsCard label="Enrollment Rate" value="78%" icon={TrendingUp} color="text-amber-600" bg="bg-amber-50" />
              <StatsCard label="Course Approvals" value="12" icon={ShieldAlert} color="text-rose-600" bg="bg-rose-50" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Pending Approvals</h3>
                  <button onClick={() => navigate('admin-courses')} className="text-indigo-600 text-sm font-bold">Manage All</button>
                </div>
                <div className="space-y-4">
                  {MOCK_COURSES.slice(0, 2).map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold">C</div>
                        <span className="text-sm font-bold truncate w-40">{c.title}</span>
                      </div>
                      <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Approve</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-indigo-900 p-6 rounded-3xl text-white">
                <h3 className="text-lg font-bold mb-2">Faculty Recruitment</h3>
                <p className="text-indigo-200 text-sm mb-6">There are 5 new instructor applications waiting for your review.</p>
                <button onClick={() => navigate('admin-instructors')} className="w-full bg-white text-indigo-900 py-3 rounded-xl font-bold hover:bg-indigo-50">Review Applications</button>
              </div>
            </div>
          </div>
        );
      case UserRole.INSTRUCTOR: 
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard label="My Courses" value="3" icon={BookOpen} color="text-indigo-600" bg="bg-indigo-50" />
              <StatsCard label="Enrolled Students" value="423" icon={Users} color="text-emerald-600" bg="bg-emerald-50" />
              <StatsCard label="New Submissions" value="28" icon={ClipboardList} color="text-amber-600" bg="bg-amber-50" />
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Your Curriculum</h3>
                  <button onClick={() => navigate('instructor-upload')} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                    <Plus className="w-4 h-4" /> Create New Course
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {MOCK_COURSES.map(course => (
                    <div key={course.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
                      <img src={course.thumbnail} className="w-full h-32 object-cover rounded-2xl mb-4" />
                      <h4 className="font-bold text-slate-900 mb-2 truncate">{course.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-bold">{course.enrolledCount} Students</span>
                        <button onClick={() => navigate('course', { courseId: course.id })} className="text-sm font-bold text-indigo-600 flex items-center gap-1">Manage Content <ChevronRight className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full lg:w-80 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Grading Queue</h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">Student Name</p>
                          <p className="text-xs text-slate-400">Assignment # {i}</p>
                        </div>
                        <button onClick={() => navigate('assignments')} className="text-[10px] font-bold text-indigo-600 px-2 py-1 bg-indigo-50 rounded">Grade</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case UserRole.STUDENT: 
        return renderStudent();
      default: return renderStudent();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div><h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Workspace, <span className="text-indigo-600">{user?.name}!</span></h1><p className="text-slate-500 mt-1">Role: <span className="font-bold text-slate-700 uppercase">{user?.role.replace('_', ' ')}</span></p></div>
      </div>
      {getDashboardContent()}
    </div>
  );
};

export default Dashboard;
