import React, { useState, useEffect } from 'react';
import { coursesAPI, quizzesAPI } from '../../services/api';
import { Loader2, PlayCircle, Clock, CheckCircle } from 'lucide-react';

const StudentQuizzes: React.FC<{ navigate: (p: string, state?: any) => void }> = ({ navigate }) => {
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [attempts, setAttempts] = useState<Record<string, any>>({});

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            loadQuizzes(selectedCourse);
        } else {
            setQuizzes([]);
        }
    }, [selectedCourse]);

    const loadCourses = async () => {
        try {
            const res = await coursesAPI.getEnrolled();
            setCourses(res.data);
            if (res.data.length > 0) setSelectedCourse(res.data[0]._id);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadQuizzes = async (courseId: string) => {
        try {
            const res = await quizzesAPI.getByCourse(courseId);
            setQuizzes(res.data);

            const attem: Record<string, any> = {};
            for (const quiz of res.data) {
                try {
                    const myAtt = await quizzesAPI.getMyAttempts(quiz._id);
                    if (myAtt.data.length > 0) attem[quiz._id] = myAtt.data[0]; // Get latest attempt
                } catch (e) { /* ignore */ }
            }
            setAttempts(attem);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Quizzes</h1>

            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <label className="font-semibold text-slate-700">Select Course:</label>
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="border-slate-300 rounded-lg p-2 min-w-[200px]"
                >
                    {courses.map(c => (
                        <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                </select>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {quizzes.map(quiz => {
                    const attempt = attempts[quiz._id];
                    const isAttempted = !!attempt;

                    return (
                        <div key={quiz._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-lg text-slate-900 mb-2">{quiz.title}</h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{quiz.description}</p>

                            <div className="flex items-center gap-4 text-sm text-slate-600 mb-6">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span>{quiz.timeLimit} mins</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold">{quiz.questions?.length || 0}</span> Questions
                                </div>
                            </div>

                            {isAttempted ? (
                                <div className="bg-slate-50 p-4 rounded-xl text-center">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Your Score</p>
                                    <p className="text-3xl font-extrabold text-emerald-600">{attempt.score}</p>
                                    <p className="text-xs text-slate-400 mt-1">Submitted: {new Date(attempt.submittedAt).toLocaleDateString()}</p>
                                </div>
                            ) : (
                                <button
                                    onClick={() => navigate('take-quiz', { quizId: quiz._id })}
                                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <PlayCircle className="w-5 h-5" /> Start Quiz
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StudentQuizzes;
