import React, { useState, useEffect } from 'react';
import { coursesAPI, quizzesAPI } from '../../services/api';
import { Loader2, Plus, Clock, HelpCircle, Trash2, Box } from 'lucide-react';
import QuizBuilder from './QuizBuilder';

const InstructorQuizzes: React.FC<{ navigate: (r: string, p?: any) => void }> = ({ navigate }) => {
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeQuizId, setActiveQuizId] = useState<string | null>(null); // For QuizBuilder

    // Create form data
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [timeLimit, setTimeLimit] = useState(30);

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
            const res = await coursesAPI.getTeaching();
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
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await quizzesAPI.create({ title, description, courseId: selectedCourse, timeLimit });
            setShowCreateModal(false);
            setTitle('');
            setDescription('');
            setTimeLimit(30);
            loadQuizzes(selectedCourse);
        } catch (err) {
            console.error(err);
            alert('Failed to create quiz');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this quiz?')) {
            try {
                await quizzesAPI.delete(id);
                setQuizzes(quizzes.filter(q => q._id !== id));
            } catch (err) {
                console.error(err);
                alert('Failed to delete');
            }
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Quiz Management</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4" /> Create Quiz
                </button>
            </div>

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
                {quizzes.map(quiz => (
                    <div key={quiz._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <button onClick={() => handleDelete(quiz._id)} className="text-slate-400 hover:text-red-600 transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <h3 className="font-bold text-lg text-slate-900 mb-2">{quiz.title}</h3>
                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{quiz.description}</p>

                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-6">
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span>{quiz.timeLimit} mins</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Box className="w-4 h-4 text-slate-400" />
                                <span>{quiz.questions?.length || 0} Questions</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setActiveQuizId(quiz._id)}
                                className="col-span-1 bg-white border border-indigo-600 text-indigo-600 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                            >
                                Add Questions
                            </button>
                            <button
                                onClick={() => navigate('quiz-results', { quizId: quiz._id, quizTitle: quiz.title })}
                                className="col-span-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                            >
                                Results
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Create New Quiz</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input required placeholder="Quiz Title" className="w-full rounded-lg border-slate-300" value={title} onChange={e => setTitle(e.target.value)} />
                            <textarea placeholder="Description" rows={3} className="w-full rounded-lg border-slate-300" value={description} onChange={e => setDescription(e.target.value)} />
                            <div>
                                <label className="text-sm text-slate-700 block mb-1">Time Limit (mins)</label>
                                <input required type="number" min="1" className="w-full rounded-lg border-slate-300" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quiz Builder Modal */}
            {activeQuizId && (
                <QuizBuilder quizId={activeQuizId} onClose={() => {
                    setActiveQuizId(null);
                    loadQuizzes(selectedCourse);
                }} />
            )}
        </div>
    );
};

export default InstructorQuizzes;
