import React, { useState, useEffect } from 'react';
import { coursesAPI, assignmentsAPI, SERVER_URL } from '../../services/api';
import { Loader2, Upload, FileText, CheckCircle, Clock, Download } from 'lucide-react';

const StudentAssignments: React.FC = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<Record<string, any>>({});
    const [uploading, setUploading] = useState<string | null>(null);

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            loadAssignments(selectedCourse);
        } else {
            setAssignments([]);
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

    const loadAssignments = async (courseId: string) => {
        try {
            const res = await assignmentsAPI.getByCourse(courseId);
            setAssignments(res.data);

            // Load my submissions for these assignments
            const subs: Record<string, any> = {};
            for (const assign of res.data) {
                try {
                    const subRes = await assignmentsAPI.getMySubmission(assign._id);
                    if (subRes.data) subs[assign._id] = subRes.data;
                } catch (e) { /* ignore if no submission */ }
            }
            setSubmissions(subs);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (assignmentId: string, file: File) => {
        setUploading(assignmentId);
        try {
            const formData = new FormData();
            formData.append('submission', file);
            const res = await assignmentsAPI.submit(assignmentId, formData);
            setSubmissions(prev => ({ ...prev, [assignmentId]: res.data }));
            alert('Submitted successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to submit');
        } finally {
            setUploading(null);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">My Assignments</h1>

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

            <div className="space-y-4">
                {assignments.map(assignment => {
                    const submission = submissions[assignment._id];
                    const isSubmitted = !!submission;
                    const isGraded = submission?.status === 'GRADED';

                    return (
                        <div key={assignment._id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900">{assignment.title}</h3>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isGraded ? 'bg-emerald-100 text-emerald-700' : isSubmitted ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {isGraded ? 'Graded' : isSubmitted ? 'Submitted' : 'Pending'}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 mb-4">{assignment.description}</p>

                                    <div className="flex gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {assignment.totalMarks} Marks</span>
                                    </div>

                                    {assignment.fileUrl && (
                                        <a href={`${SERVER_URL}${assignment.fileUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-indigo-600 mt-4 hover:underline">
                                            <FileText className="w-4 h-4" /> Download Attachment
                                        </a>
                                    )}
                                </div>

                                <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                                    {isSubmitted ? (
                                        <div className="bg-slate-50 p-4 rounded-xl">
                                            <p className="text-sm font-bold text-slate-700 mb-2">Your Submission</p>
                                            <p className="text-xs text-slate-500 mb-2">Submitted on {new Date(submission.submittedAt).toLocaleString()}</p>
                                            <a href={`${SERVER_URL}${submission.fileUrl}`} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-2 mb-3">
                                                <Download className="w-4 h-4" /> View File
                                            </a>

                                            {isGraded && (
                                                <div className="mt-3 pt-3 border-t border-slate-200">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-slate-700">Grade:</span>
                                                        <span className="text-lg font-bold text-emerald-600">{submission.grade} / 100</span>
                                                    </div>
                                                    {submission.feedback && (
                                                        <div className="text-sm text-slate-600">
                                                            <span className="font-bold">Feedback:</span> {submission.feedback}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 mb-3">Submit your work</p>
                                            <label className={`
                                                flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors
                                                ${uploading === assignment._id ? 'bg-slate-50 border-slate-300' : 'border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400'}
                                            `}>
                                                {uploading === assignment._id ? (
                                                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 text-indigo-400 mb-2" />
                                                        <span className="text-xs text-slate-500">Click to upload file</span>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    disabled={!!uploading}
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) handleSubmit(assignment._id, e.target.files[0]);
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StudentAssignments;
