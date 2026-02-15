import React, { useState, useEffect } from 'react';
import { quizzesAPI } from '../../services/api';
import { Loader2, ChevronLeft, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface InstructorQuizResultsProps {
    quizId: string;
    quizTitle?: string;
    navigate: (r: string, p?: any) => void;
}

const InstructorQuizResults: React.FC<InstructorQuizResultsProps> = ({ quizId, quizTitle, navigate }) => {
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAttempts();
    }, [quizId]);

    const loadAttempts = async () => {
        try {
            const res = await quizzesAPI.getAttempts(quizId);
            setAttempts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('quizzes')}
                    className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quiz Results</h1>
                    {quizTitle && <p className="text-slate-500">{quizTitle}</p>}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-700">Student Attempts</h3>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">Total: {attempts.length}</span>
                </div>

                {attempts.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        No attempts yet.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {attempts.map(attempt => (
                            <div key={attempt._id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                        {attempt.studentId?.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{attempt.studentId?.name || 'Unknown Student'}</p>
                                        <p className="text-xs text-slate-500">{attempt.studentId?.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 mb-1 flex items-center gap-1 justify-end">
                                            <Calendar className="w-3 h-3" /> {new Date(attempt.submittedAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-slate-400">{new Date(attempt.submittedAt).toLocaleTimeString()}</p>
                                    </div>
                                    <div className="text-right min-w-[80px]">
                                        <span className="block text-2xl font-bold text-emerald-600">{attempt.score}</span>
                                        <span className="text-xs text-slate-400">Score</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorQuizResults;
