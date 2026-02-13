
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Assignment } from '../types';
import { FileText, Clock, CheckCircle, AlertCircle, ChevronRight, MessageSquare, Trophy, ExternalLink, X, Upload, Check, Loader2 } from 'lucide-react';

const MOCK_ASSIGNMENTS: (Assignment & { courseName: string })[] = [
  { 
    id: 'a1', 
    title: 'Redux Store Architecture', 
    description: 'Implement a complex state management system using Redux Toolkit. Your submission should include a fully typed store and multiple middleware examples.', 
    dueDate: '2024-03-20', 
    status: 'submitted', 
    courseName: 'Advanced React Architecture' 
  },
  { 
    id: 'a2', 
    title: 'AWS VPC Configuration', 
    description: 'Design and implement a secure VPC with public/private subnets and a NAT Gateway. Submit the Terraform script or a detailed diagram.', 
    dueDate: '2024-03-15', 
    status: 'graded', 
    grade: 92,
    feedback: 'Excellent work on the subnet division. The NAT Gateway setup is perfectly implemented. Consider optimizing the route tables next time.',
    courseName: 'Cloud Computing & AWS' 
  },
  { 
    id: 'a3', 
    title: 'Backpropagation Algorithm', 
    description: 'Derive and code the backpropagation algorithm from scratch using NumPy. Test it on the MNIST dataset and provide accuracy logs.', 
    dueDate: '2024-04-05', 
    status: 'pending', 
    courseName: 'Machine Learning Fundamentals' 
  },
  { 
    id: 'a4', 
    title: 'Security Audit Report', 
    description: 'Perform a mock audit of the provided network trace and identify 5 critical vulnerabilities.', 
    dueDate: '2024-02-28', 
    status: 'returned', 
    feedback: 'Missing the risk assessment matrix. Please re-upload with the requested documentation.',
    courseName: 'Cybersecurity Fundamentals' 
  }
];

const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedAssignment, setSelectedAssignment] = useState<(Assignment & { courseName: string }) | null>(null);
  const [isRevising, setIsRevising] = useState(false);
  const [uploading, setUploading] = useState(false);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'graded': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'submitted': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'returned': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const handleRevisionUpload = async () => {
    setUploading(true);
    await new Promise(r => setTimeout(r, 1500));
    setUploading(false);
    setIsRevising(false);
    alert('Revised assignment successfully uploaded for review!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Academic Assignments</h1>
        <p className="text-slate-500">Track your submissions, review feedback, and submit revisions.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Your Deliverables</h2>
          <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest">Active Semester</span>
        </div>

        <div className="divide-y divide-slate-50">
          {MOCK_ASSIGNMENTS.map((a) => (
            <div 
              key={a.id} 
              onClick={() => { setSelectedAssignment(a); setIsRevising(false); }}
              className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">{a.title}</h3>
                  <p className="text-xs text-slate-400 font-bold mb-3">{a.courseName}</p>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1.5 text-slate-500 font-bold uppercase"><Clock className="w-3.5 h-3.5" /> Due {a.dueDate}</span>
                    <span className={`px-2.5 py-0.5 rounded-full border font-extrabold uppercase tracking-widest ${getStatusStyle(a.status || 'pending')}`}>
                      {a.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {a.status === 'graded' && (
                  <div className="flex flex-col items-end mr-4">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Grade</span>
                    <span className="text-2xl font-black text-emerald-600 leading-none">{a.grade}%</span>
                  </div>
                )}
                <button className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedAssignment(null)}></div>
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <header className="p-8 border-b border-slate-100 flex items-start justify-between bg-white relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
              <div>
                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-lg mb-3 inline-block">
                  {selectedAssignment.courseName}
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedAssignment.title}</h2>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="p-2 hover:bg-slate-100 rounded-2xl transition-all active:scale-90">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </header>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <section className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                  <AlertCircle className="w-4 h-4 text-indigo-600" /> Assignment Overview
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedAssignment.description}</p>
              </section>

              {(selectedAssignment.grade || selectedAssignment.feedback) && (
                <div className={`p-6 rounded-3xl border ${selectedAssignment.status === 'graded' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-sm font-bold flex items-center gap-2 uppercase tracking-widest ${selectedAssignment.status === 'graded' ? 'text-emerald-900' : 'text-amber-900'}`}>
                      {selectedAssignment.status === 'graded' ? <Trophy className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} 
                      {selectedAssignment.status === 'graded' ? 'Instructor Grade' : 'Instructor Feedback'}
                    </h3>
                    {selectedAssignment.grade && (
                      <span className="text-3xl font-black text-emerald-600">{selectedAssignment.grade}%</span>
                    )}
                  </div>
                  {selectedAssignment.feedback && (
                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl text-sm italic text-slate-700 font-medium leading-relaxed border border-white/40">
                      "{selectedAssignment.feedback}"
                    </div>
                  )}
                </div>
              )}

              {isRevising ? (
                <div className="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-indigo-200 animate-in slide-in-from-top-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Upload className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">Upload Revised Project</h4>
                    <p className="text-xs text-slate-500 mb-6">Supported formats: PDF, ZIP, TXT (Max 50MB)</p>
                    <button 
                      onClick={handleRevisionUpload}
                      disabled={uploading}
                      className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all"
                    >
                      {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                      {uploading ? 'Processing Revision...' : 'Finalize and Submit'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  {(selectedAssignment.status === 'returned' || selectedAssignment.status === 'pending') && (
                    <button 
                      onClick={() => setIsRevising(true)}
                      className="flex-1 bg-slate-900 text-white py-4 rounded-[1.2rem] font-bold text-sm shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Upload className="w-5 h-5" /> {selectedAssignment.status === 'returned' ? 'Upload Revision' : 'Submit Assignment'}
                    </button>
                  )}
                  <button className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-[1.2rem] font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95 border border-slate-200">
                    <MessageSquare className="w-4 h-4" /> Message Instructor
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
