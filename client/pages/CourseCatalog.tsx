
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Course, UserRole } from '../types';
import { Search, Users, Star, ArrowRight, BookPlus, Loader2, GraduationCap } from 'lucide-react';

const MOCK_COURSES: Course[] = [
  { id: '1', title: 'Advanced React Architecture', description: 'Master large-scale web applications with React 18, Concurrent Mode, and Design Patterns.', instructorId: 'i1', instructorName: 'Dr. Alan Smith', instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alan', thumbnail: 'https://picsum.photos/seed/react/800/450', enrolledCount: 124, status: 'active' },
  { id: '2', title: 'Cloud Computing & AWS', description: 'Architect highly scalable and available cloud systems using Amazon Web Services core features.', instructorId: 'i2', instructorName: 'Sarah Johnson', instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', thumbnail: 'https://picsum.photos/seed/cloud/800/450', enrolledCount: 89, status: 'active' },
  { id: '3', title: 'Machine Learning Fundamentals', description: 'Intro to supervised and unsupervised learning, neural networks, and classification algorithms.', instructorId: 'i3', instructorName: 'Prof. Michael Chen', instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', thumbnail: 'https://picsum.photos/seed/ml/800/450', enrolledCount: 210, status: 'active' },
  { id: '4', title: 'Cybersecurity Fundamentals', description: 'Protect organizational assets by mastering encryption, network security, and risk assessment.', instructorId: 'i4', instructorName: 'Dr. Emily Vance', instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', thumbnail: 'https://picsum.photos/seed/security/800/450', enrolledCount: 156, status: 'active' },
  { id: '5', title: 'Data Visualization with D3', description: 'Transform raw data into beautiful, interactive browser-based visualizations.', instructorId: 'i5', instructorName: 'James Wilson', instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', thumbnail: 'https://picsum.photos/seed/data/800/450', enrolledCount: 67, status: 'active' }
];

const CourseCatalog: React.FC<{ navigate: (r: string, p?: any) => void }> = ({ navigate }) => {
  const { user, enrollCourse } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const isEnrolled = (courseId: string) => user?.enrolledCourses?.includes(courseId);

  const handleEnroll = async (courseId: string) => {
    setEnrollingId(courseId);
    await new Promise(r => setTimeout(r, 1000));
    enrollCourse(courseId);
    setEnrollingId(null);
  };

  const filteredCourses = MOCK_COURSES.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">University Course Catalog</h1>
          <p className="text-slate-500 mt-1">Discover your next academic challenge from our top-tier faculty.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search catalog..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-80 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map(course => (
          <div key={course.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
            <div className="h-52 overflow-hidden relative">
              <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-slate-900 shadow-sm flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" /> {course.enrolledCount + (isEnrolled(course.id) ? 1 : 0)} Enrolled
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg">High Impact</span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg"><Star className="w-3 h-3 fill-amber-500" /> 4.98</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 truncate group-hover:text-indigo-600 transition-colors tracking-tight">{course.title}</h3>
              <p className="text-slate-500 text-xs line-clamp-2 mb-8 h-8 leading-relaxed font-medium">{course.description}</p>
              
              <div className="flex items-center gap-3 mb-8 pt-6 border-t border-slate-50">
                <img src={course.instructorAvatar} className="w-10 h-10 rounded-full border border-slate-200 shadow-sm" alt="" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{course.instructorName}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lead Faculty</p>
                </div>
              </div>

              {isEnrolled(course.id) ? (
                <button 
                  onClick={() => navigate('course', { courseId: course.id })}
                  className="w-full bg-emerald-600 text-white py-4 rounded-[1.2rem] text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                >
                  Enter Classroom <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrollingId === course.id}
                  className="w-full bg-indigo-600 text-white py-4 rounded-[1.2rem] text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 active:scale-95"
                >
                  {enrollingId === course.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookPlus className="w-4 h-4" />}
                  Enroll Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseCatalog;
