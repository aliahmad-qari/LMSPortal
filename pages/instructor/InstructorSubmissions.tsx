import React, { useState, useEffect } from 'react';
import { assignmentsAPI, SERVER_URL } from '../../services/api';
import { ChevronLeft, Loader2, FileText, CheckCircle, Clock, Download, X } from 'lucide-react';

const InstructorSubmissions: React.FC<{ assignmentId: string; assignmentTitle?: string; navigate: (r: string, p?: any) => void }> = ({ assignmentId, assignmentTitle, navigate }) => {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [grading, setGrading] = useState<string | null>(null);
    const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { load(); }, [assignmentId]);

    const load = async () => {
        try { const res = await assignmentsAPI.getSubmissions(assignmentId); setSubmissions(res.data); }
        catch (err) { console.error(err); }
        finally { setIsLoading(false); }
    };

    const handleGrade = async (submissionId: string) => {
        setSubmitting(true);
        try {
            await assignmentsAPI.grade(submissionId, { grade: parseInt(gradeForm.grade), feedback: gradeForm.feedback });
            setGrading(null); setGradeForm({ grade: '', feedback: '' }); load();
        } catch (err: any) { alert(err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('my-courses')} className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50"><ChevronLeft className="w-5 h-5" /></button>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Submissions</h1>
                    {assignmentTitle && <p className="text-sm text-slate-500">For: {assignmentTitle}</p>}
                </div>
            </div>

            {submissions.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">No Submissions Yet</h3>
                    <p className="text-slate-500">Students haven't submitted this assignment yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50">
                        <p className="text-sm font-medium text-slate-500">{submissions.length} submission(s)</p>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {submissions.map((s: any) => (
                            <div key={s._id} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center font-bold text-violet-600">{s.student?.name?.[0] || '?'}</div>
                                        <div>
                                            <p className="font-bold text-slate-900">{s.student?.name || 'Unknown'}</p>
                                            <p className="text-xs text-slate-500">{s.student?.email} • Submitted {new Date(s.submittedAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {s.fileUrl && (
                                            <a href={`${SERVER_URL}${s.fileUrl}`} download className="flex items-center gap-1 text-violet-600 hover:text-violet-700 text-sm font-bold"><Download className="w-4 h-4" /> File</a>
                                        )}
                                        {s.status === 'GRADED' ? (
                                            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle className="w-3 h-3" /> {s.grade} pts</span>
                                        ) : (
                                            <button onClick={() => { setGrading(s._id); setGradeForm({ grade: '', feedback: '' }); }} className="bg-violet-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-violet-700">Grade</button>
                                        )}
                                    </div>
                                </div>
                                {s.status === 'GRADED' && s.feedback && (
                                    <p className="mt-2 pl-14 text-sm text-slate-500 italic">Feedback: {s.feedback}</p>
                                )}

                                {/* Inline Grading Form */}
                                {grading === s._id && (
                                    <div className="mt-4 pl-14 flex items-end gap-3 bg-violet-50 p-4 rounded-2xl">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-slate-600 mb-1">Grade (points)</label>
                                            <input type="number" value={gradeForm.grade} onChange={e => setGradeForm({ ...gradeForm, grade: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Score" />
                                        </div>
                                        <div className="flex-[2]">
                                            <label className="block text-xs font-bold text-slate-600 mb-1">Feedback</label>
                                            <input type="text" value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Great work!" />
                                        </div>
                                        <button onClick={() => handleGrade(s._id)} disabled={submitting || !gradeForm.grade} className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-violet-700 disabled:opacity-50">{submitting ? '...' : 'Submit'}</button>
                                        <button onClick={() => setGrading(null)} className="text-slate-400 hover:text-slate-600 p-2"><X className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorSubmissions;
