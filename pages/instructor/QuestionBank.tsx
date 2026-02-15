import React, { useEffect, useState } from 'react';
import { instructorFeaturesAPI } from '../../services/api';
import { Database, Plus, Check } from 'lucide-react';

const QuestionBank = () => {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [newQuestion, setNewQuestion] = useState({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        type: 'MCQ',
        tags: ''
    });

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const res = await instructorFeaturesAPI.getQuestionBank();
            setQuestions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionChange = (idx: number, val: string) => {
        const newOptions = [...newQuestion.options];
        newOptions[idx] = val;
        setNewQuestion({ ...newQuestion, options: newOptions });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...newQuestion,
                tags: newQuestion.tags.split(',').map(t => t.trim()).filter(Boolean)
            };
            const res = await instructorFeaturesAPI.addToQuestionBank(data);
            setQuestions([...questions, res.data]);
            setShowForm(false);
            setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0, type: 'MCQ', tags: '' });
            alert('Question added to bank!');
        } catch (err) {
            alert('Failed to add question');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-7 h-7 text-rose-600" />
                    Question Bank
                </h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Add Question
                </button>
            </div>

            {/* Add Question Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 animate-in slide-in-from-top-4">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">New Question</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Question Text</label>
                            <input
                                type="text"
                                value={newQuestion.question}
                                onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {newQuestion.options.map((opt, idx) => (
                                <div key={idx} className="relative">
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={e => handleOptionChange(idx, e.target.value)}
                                        placeholder={`Option ${idx + 1}`}
                                        className={`w-full p-2.5 bg-slate-50 border rounded-xl outline-none ${newQuestion.correctAnswer === idx ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'}`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setNewQuestion({ ...newQuestion, correctAnswer: idx })}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full ${newQuestion.correctAnswer === idx ? 'text-emerald-600 bg-emerald-100' : 'text-slate-300 hover:text-slate-500'}`}
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={newQuestion.tags}
                                onChange={e => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                                placeholder="e.g. Math, Chapter 1, Hard"
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">Save Question</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Questions List */}
            <div className="grid gap-4">
                {questions.map(q => (
                    <div key={q._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-900 text-lg">{q.question}</h3>
                            <div className="flex gap-2">
                                {q.tags?.map((tag: string, i: number) => (
                                    <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                            {q.options?.map((opt: string, idx: number) => (
                                <div key={idx} className={`p-3 rounded-lg text-sm border ${idx === q.correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionBank;
