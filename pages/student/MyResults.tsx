import React, { useEffect, useState } from 'react';
import { studentFeaturesAPI } from '../../services/api';
import { Award, CheckCircle, Clock, XCircle } from 'lucide-react';

const MyResults = () => {
    const [data, setData] = useState<{ quizzes: any[], assignments: any[] }>({ quizzes: [], assignments: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const res = await studentFeaturesAPI.getResults();
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading results...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-7 h-7 text-amber-500" />
                My Results & Grades
            </h1>

            {/* Quizzes Section */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">Quiz Attempts</h2>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {data.quizzes.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No quiz attempts found.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {data.quizzes.map((quiz: any) => (
                                <div key={quiz._id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg mb-1">{quiz.quizId?.title || 'Unknown Quiz'}</h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {new Date(quiz.submittedAt).toLocaleDateString()}
                                            </span>
                                            <span>Score: {quiz.score} / {quiz.totalMarks}</span>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl border text-sm font-bold ${(quiz.score / quiz.totalMarks) >= 0.5
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}>
                                        {Math.round((quiz.score / quiz.totalMarks) * 100)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Assignments Section */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">Assignment Submissions</h2>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {data.assignments.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No assignment submissions found.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {data.assignments.map((assignment: any) => (
                                <div key={assignment._id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg mb-1">{assignment.assignment?.title || 'Unknown Assignment'}</h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {new Date(assignment.submittedAt).toLocaleDateString()}
                                            </span>
                                            {assignment.status === 'GRADED' && (
                                                <span>Grade: {assignment.grade} / {assignment.assignment?.totalMarks}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${assignment.status === 'GRADED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                            {assignment.status}
                                        </span>
                                        {assignment.feedback && (
                                            <span className="text-xs text-slate-400 italic mt-1 max-w-xs text-right">
                                                "{assignment.feedback}"
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyResults;
