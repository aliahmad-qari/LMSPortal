import React, { useState, useEffect } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { coursesAPI, usersAPI, SERVER_URL } from '../services/api';
import {
  BookOpen, Clock, Trophy, Users, TrendingUp, PlayCircle,
  ChevronRight, Plus, Loader2, GraduationCap, X
} from 'lucide-react';

interface DashboardProps {
  navigate: (route: string, params?: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', category: 'General' });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (user?.role === UserRole.STUDENT) {
        const [enrolledRes, allRes] = await Promise.all([
          coursesAPI.getEnrolled(),
          coursesAPI.getAll()
        ]);
        setCourses(enrolledRes.data.length > 0 ? enrolledRes.data : allRes.data);
      } else if (user?.role === UserRole.INSTRUCTOR) {
        const res = await coursesAPI.getTeaching();
        setCourses(res.data);
      } else {
        const [coursesRes, analyticsRes] = await Promise.all([
          coursesAPI.getAll(),
          usersAPI.getAnalytics()
        ]);
        setCourses(coursesRes.data);
        setStats(analyticsRes.data);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('title', courseForm.title);
      formData.append('description', courseForm.description);
      formData.append('category', courseForm.category);
      if (thumbnail) formData.append('thumbnail', thumbnail);
      await coursesAPI.create(formData);
      setShowCreateCourse(false);
      setCourseForm({ title: '', description: '', category: 'General' });
      setThumbnail(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const renderStudentStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[
        { label: 'Enrolled Courses', value: courses.length.toString(), icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Active', value: courses.filter((c: any) => c.isPublished).length.toString(), icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Total Lectures', value: '—', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Progress', value: '—', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
      ].map((stat, idx) => (
        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderInstructorStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[
        { label: 'My Courses', value: courses.length.toString(), icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Total Students', value: courses.reduce((a: number, c: any) => a + (c.enrolledStudents?.length || 0), 0).toString(), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Published', value: courses.filter((c: any) => c.isPublished).length.toString(), icon: PlayCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Categories', value: [...new Set(courses.map((c: any) => c.category))].length.toString(), icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
      ].map((stat, idx) => (
        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAdminStats = () => stats && (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[
        { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Students', value: stats.totalStudents, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Instructors', value: stats.totalInstructors, icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Total Courses', value: stats.totalCourses, icon: PlayCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
      ].map((stat, idx) => (
        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Welcome back, <span className="text-indigo-600">{user?.name}!</span>
          </h1>
          <p className="text-slate-500 mt-1">Here is what is happening today.</p>
        </div>
        {user?.role === UserRole.INSTRUCTOR && (
          <button
            onClick={() => setShowCreateCourse(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus className="w-5 h-5" />
            Create New Course
          </button>
        )}
      </div>

      {user?.role === UserRole.STUDENT && renderStudentStats()}
      {user?.role === UserRole.INSTRUCTOR && renderInstructorStats()}
      {(user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN) && renderAdminStats()}

      {/* Course List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            {user?.role === UserRole.STUDENT ? 'Courses' : user?.role === UserRole.INSTRUCTOR ? 'Your Courses' : 'All Courses'}
          </h2>
        </div>
        {courses.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Courses Yet</h3>
            <p className="text-slate-500">
              {user?.role === UserRole.INSTRUCTOR ? 'Create your first course to get started.' : 'Browse and enroll in courses.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <div
                key={course._id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
                onClick={() => navigate('course', { courseId: course._id })}
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600">
                  {course.thumbnail ? (
                    <img
                      src={`${SERVER_URL}${course.thumbnail}`}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white/30" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm">
                    {course.enrolledStudents?.length || 0} Students
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wider">{course.category}</div>
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-2 group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                        {course.instructorName?.[0] || 'I'}
                      </div>
                      <span className="text-xs font-medium text-slate-700">{course.instructorName}</span>
                    </div>
                    <span className="flex items-center gap-1 text-indigo-600 font-bold text-sm">
                      View <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateCourse && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Create New Course</h2>
              <button onClick={() => setShowCreateCourse(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Advanced React Architecture"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={courseForm.description}
                  onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                  placeholder="Describe your course..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={courseForm.category}
                  onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {['General', 'Computer Science', 'Business', 'Arts', 'Data Science', 'Engineering', 'Mathematics'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Thumbnail (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setThumbnail(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {creating ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : 'Create Course'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
