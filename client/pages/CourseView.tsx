
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, Lecture } from '../types';
import { 
  Play, 
  CheckCircle, 
  ChevronLeft, 
  Download, 
  MessageCircle,
  Calendar,
  BookOpen,
  Plus,
  Zap,
  GraduationCap,
  Save,
  Loader2,
  BookPlus,
  Clock,
  VideoIcon,
  FileText,
  Mail,
  Video as VideoLucide,
  ArrowRight
} from 'lucide-react';

const MOCK_CURRICULUM: Lecture[] = [
  { id: 'l1', title: 'Module 1: Rendering Foundations', duration: '12:05', description: 'Deep dive into React 18 reconciliation engine and virtual DOM mechanics.' },
  { id: 'l2', title: 'Module 2: Performance Patterns', duration: '45:00', description: 'Advanced memoization and concurrent mode optimizations.' },
];

const CourseView: React.FC<{ courseId: string; navigate: (r: string) => void }> = ({ courseId, navigate }) => {
  const { user, enrollCourse } = useAuth();
  const [activeLesson, setActiveLesson] = useState<Lecture>(MOCK_CURRICULUM[0]);
  const [activeTab, setActiveTab] = useState<'content' | 'manage' | 'grading'>('content');
  const [lectures, setLectures] = useState<Lecture[]>(MOCK_CURRICULUM);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  
  // Local state for enrolled count to reflect updates instantly
  const [enrolledCount, setEnrolledCount] = useState(124);

  // Instructor specific states
  const [newLectureTitle, setNewLectureTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Simulate initial progress loading
    const timer = setTimeout(() => setVideoProgress(34), 500);
    return () => clearTimeout(timer);
  }, [activeLesson]);

  const handleUploadLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLectureTitle.trim()) return;
    setIsUploading(true);
    setTimeout(() => {
      const newLec: Lecture = {
        id: Date.now().toString(),
        title: newLectureTitle,
        duration: '00:00',
        description: 'Newly uploaded lecture content.'
      };
      setLectures([...lectures, newLec]);
      setNewLectureTitle('');
      setIsUploading(false);
    }, 1500);
  };

  const isInstructor = user?.role === UserRole.INSTRUCTOR || user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  const isEnrolled = user?.enrolledCourses?.includes(courseId);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200));
    enrollCourse(courseId);
    setEnrolledCount(prev => prev + 1);
    setIsEnrolling(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header with Navigation & Enrollment Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('dashboard')} className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">Advanced React Architecture</h1>
            <p className="text-sm text-slate-500 font-medium">{enrolledCount} Students Enrolled</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!isInstructor && (
            isEnrolled ? (
              <button 
                onClick={() => setActiveTab('content')}
                className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-xl font-bold border border-emerald-100 flex items-center gap-2 shadow-sm transition-all"
              >
                <CheckCircle className="w-5 h-5" /> Enter Course
              </button>
            ) : (
              <button 
                onClick={handleEnroll}
                disabled={isEnrolling}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-95 transition-all"
              >
                {isEnrolling ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookPlus className="w-5 h-5" />}
                Enroll Now
              </button>
            )
          )}

          {isInstructor && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setActiveTab('content')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'content' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Content</button>
              <button onClick={() => setActiveTab('manage')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'manage' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Update</button>
              <button onClick={() => setActiveTab('grading')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'grading' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Grade</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'content' && (
            <>
              {/* Video Player Section */}
              <div className="bg-slate-900 aspect-video rounded-3xl overflow-hidden shadow-2xl relative group border border-slate-800">
                <img src={`https://picsum.photos/seed/${activeLesson.id}/1280/720`} className="w-full h-full object-cover opacity-50" alt="" />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  {(isEnrolled || isInstructor) ? (
                    <button className="bg-white/20 backdrop-blur-md p-6 rounded-full border border-white/30 hover:scale-110 transition-all shadow-xl group/play active:scale-95">
                      <Play className="w-12 h-12 text-white fill-white group-hover/play:scale-110 transition-all" />
                    </button>
                  ) : (
                    <div className="bg-slate-900/95 p-8 rounded-3xl text-center border border-slate-700 backdrop-blur-md max-w-sm">
                      <Zap className="w-10 h-10 text-indigo-400 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-white font-bold text-lg mb-2 tracking-tight">Enrollment Required</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">Please enroll in this course to unlock all lectures, assignments, and academic resources.</p>
                      <button onClick={handleEnroll} className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold">Enroll Now</button>
                    </div>
                  )}
                </div>

                {(isEnrolled || isInstructor) && (
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                    <div className="flex items-center justify-between text-white/90 text-[10px] font-bold uppercase tracking-widest mb-3">
                      <span className="flex items-center gap-2"><Play className="w-3 h-3 fill-current" /> {activeLesson.title}</span>
                      <span>{videoProgress}% Watched</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5 cursor-pointer hover:h-2 transition-all">
                      <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] transition-all duration-700" style={{ width: `${videoProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Lesson Description */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{activeLesson.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-500" /> {activeLesson.duration}</span>
                      <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-indigo-500" /> Advanced Level</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button disabled={!isEnrolled && !isInstructor} className="flex items-center gap-2 bg-slate-50 text-slate-700 px-5 py-3 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100 disabled:opacity-50 active:scale-95"><Download className="w-4 h-4" /> Resources</button>
                    <button onClick={() => navigate('chat')} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95"><MessageCircle className="w-4 h-4" /> Join Discussion</button>
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm mb-4">{activeLesson.description}</p>
                <Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 rotate-12 -z-0" />
              </div>

              {/* Instructor Profile Section - BELOW Main Content */}
              {(isEnrolled || isInstructor) && (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 animate-in slide-in-from-top-4">
                  <div className="relative shrink-0">
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alan" 
                      className="w-24 h-24 rounded-full border-4 border-indigo-50 shadow-md" 
                      alt="Instructor"
                    />
                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                      <div>
                        <h4 className="text-xl font-black text-slate-900 leading-tight">Dr. Alan Smith</h4>
                        <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest">Lead Instructor, Computer Science</p>
                      </div>
                      <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95">
                        <Calendar className="w-4 h-4" /> Schedule Meeting
                      </button>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Specializing in scalable distributed systems and high-performance React architectures. Dr. Smith holds a PhD in Systems Design and has led engineering teams at major tech firms.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'manage' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm animate-in slide-in-from-bottom-2">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-indigo-600"><Plus className="w-5 h-5" /> Add Lecture Module</h3>
              <form onSubmit={handleUploadLecture} className="space-y-6">
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Lecture Title</label><input type="text" value={newLectureTitle} onChange={e => setNewLectureTitle(e.target.value)} placeholder="e.g. Design Systems in React" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 cursor-pointer transition-all bg-slate-50/50"><VideoIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" /><p className="text-[10px] font-bold text-slate-500 uppercase">Upload Video</p></div>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 cursor-pointer transition-all bg-slate-50/50"><FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" /><p className="text-[10px] font-bold text-slate-500 uppercase">Upload Slides</p></div>
                </div>
                <button disabled={isUploading} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95">
                  {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Publishing...</> : <><Save className="w-5 h-5" /> Save Lecture</>}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'grading' && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between"><h3 className="font-bold text-slate-800">New Submissions</h3><button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">Full Gradebook</button></div>
              <div className="divide-y divide-slate-50">
                {['Alice Henderson', 'Mark Vossen', 'Elena Rose'].map((name, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-xs">{name[0]}</div>
                      <div><p className="text-sm font-bold text-slate-900">{name}</p><p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Submitted 2h ago</p></div>
                    </div>
                    <button onClick={() => alert('Grading interface for ' + name)} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-all">Review</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Syllabus Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-600" /> Syllabus Content</h3>
            <div className="space-y-3">
              {lectures.map((lec) => (
                <div 
                  key={lec.id} 
                  onClick={() => { setActiveLesson(lec); setActiveTab('content'); }} 
                  className={`p-4 rounded-2xl border cursor-pointer transition-all group ${activeLesson.id === lec.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-indigo-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Play className={`w-4 h-4 ${activeLesson.id === lec.id ? 'text-indigo-200' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                      <span className="text-sm font-bold truncate w-36 leading-none">{lec.title}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${activeLesson.id === lec.id ? 'text-indigo-200' : 'text-slate-400'}`}>{lec.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-indigo-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden group cursor-pointer hover:bg-indigo-950 transition-all">
            <h4 className="text-lg font-bold mb-2">Live Office Hours</h4>
            <p className="text-indigo-200 text-xs leading-relaxed mb-6">Connect with Dr. Smith for real-time guidance every Tuesday and Thursday.</p>
            <button onClick={() => navigate('video')} className="w-full bg-white text-indigo-900 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
              <VideoLucide className="w-4 h-4" /> Join Session
            </button>
            <VideoLucide className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;
