import React, { useState } from 'react';
import { quizzesAPI } from '../../services/api';
import { Plus, Trash, Check, X } from 'lucide-react';

interface QuizBuilderProps {
    quizId: string;
    onClose: () => void;
}

const QuizBuilder: React.FC<QuizBuilderProps> = ({ quizId, onClose }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState(0);
    const [marks, setMarks] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleOptionChange = (idx: number, val: string) => {
        const newOptions = [...options];
        newOptions[idx] = val;
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (options.some(o => !o.trim())) return alert('All options must be filled');

        setLoading(true);
        try {
            await quizzesAPI.addQuestion(quizId, {
                question,
                options,
                correctAnswer,
                marks
            });
            // Reset form
            setQuestion('');
            setOptions(['', '', '', '']);
            setCorrectAnswer(0);
            setMarks(1);
            alert('Question added successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to add question');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Add Question</h2>
                    <button onClick={onClose}><X className="w-6 h-6 text-slate-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Question Text</label>
                        <textarea
                            required
                            rows={3}
                            className="w-full rounded-lg border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            placeholder="e.g., What is the capital of France?"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700">Options</label>
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="correct"
                                    checked={correctAnswer === idx}
                                    onChange={() => setCorrectAnswer(idx)}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                />
                                <input
                                    required
                                    type="text"
                                    className="flex-1 rounded-lg border-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    value={opt}
                                    onChange={e => handleOptionChange(idx, e.target.value)}
                                    placeholder={`Option ${idx + 1}`}
                                />
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Marks</label>
                        <input
                            type="number"
                            min="1"
                            className="w-32 rounded-lg border-slate-300"
                            value={marks}
                            onChange={e => setMarks(Number(e.target.value))}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Done</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {loading ? 'Adding...' : 'Add Question'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuizBuilder;
