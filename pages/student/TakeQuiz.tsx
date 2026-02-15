import React, { useState, useEffect } from 'react';
import { quizzesAPI } from '../../services/api';
import { Loader2, Clock, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';

interface TakeQuizProps {
    quizId: string;
    onClose: () => void;
}

const TakeQuiz: React.FC<TakeQuizProps> = ({ quizId, onClose }) => {
    const [quiz, setQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeQuestion, setActiveQuestion] = useState(0);
    const [responses, setResponses] = useState<Record<string, number>>({}); // questionId -> optionIndex
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0); // in seconds

    useEffect(() => {
        loadQuiz();
    }, [quizId]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (quiz && !submitting && timeLeft === 0) {
            // Auto submit
            handleSubmit();
        }
    }, [timeLeft, quiz]);

    const loadQuiz = async () => {
        try {
            const res = await quizzesAPI.getById(quizId);
            setQuiz(res.data);
            setTimeLeft(res.data.timeLimit * 60);
        } catch (err) {
            console.error(err);
            alert('Failed to load quiz');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (qId: string, optIdx: number) => {
        setResponses(prev => ({ ...prev, [qId]: optIdx }));
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const formattedResponses = Object.entries(responses).map(([questionId, selectedOption]) => ({
                questionId,
                selectedOption
            }));

            await quizzesAPI.submit(quizId, { responses: formattedResponses });
            alert('Quiz submitted successfully!');
            onClose();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to submit quiz');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-indigo-600" /></div>;

    if (!quiz) return null;

    const currentQ = quiz.questions[activeQuestion];
    const progress = ((activeQuestion + 1) / quiz.questions.length) * 100;
    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">{quiz.title}</h1>
                    <p className="text-sm text-slate-500">Question {activeQuestion + 1} of {quiz.questions.length}</p>
                </div>
                <div className={`
                    flex items-center gap-2 px-4 py-2 rounded-full font-bold
                    ${timeLeft < 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-indigo-50 text-indigo-600'}
                `}>
                    <Clock className="w-5 h-5" />
                    <span className="text-xl font-mono">{formatTime(timeLeft)}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-slate-200">
                <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-sm border border-slate-200 my-auto">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8">{currentQ.question}</h2>

                    <div className="space-y-4">
                        {currentQ.options.map((opt: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(currentQ._id, idx)}
                                className={`
                                    w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group
                                    ${responses[currentQ._id] === idx
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                                        : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-700'}
                                `}
                            >
                                <span className="font-medium text-lg">{opt}</span>
                                {responses[currentQ._id] === idx && <CheckCircle className="w-6 h-6 text-indigo-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-slate-200 px-8 py-4 flex justify-between items-center">
                <button
                    disabled={activeQuestion === 0}
                    onClick={() => setActiveQuestion(q => q - 1)}
                    className="text-slate-500 font-bold hover:text-slate-800 disabled:opacity-30"
                >
                    Previous
                </button>

                {activeQuestion === quiz.questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center gap-2"
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Submit Quiz</>}
                    </button>
                ) : (
                    <button
                        onClick={() => setActiveQuestion(q => q + 1)}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2"
                    >
                        Next <ChevronRight className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default TakeQuiz;
