import React, { useState, useEffect } from 'react';
import { coursesAPI, assignmentsAPI, quizzesAPI } from '../../services/api';
import { Award, Download, Calendar, CheckCircle, Loader2, BookOpen } from 'lucide-react';

const StudentCertificates: React.FC = () => {
    const [completedCourses, setCompletedCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const res = await coursesAPI.getEnrolled();
            const coursesData = await Promise.all(res.data.map(async (course: any) => {
                try {
                    const courseDetails = await coursesAPI.getById(course._id);
                    const lectures = courseDetails.data.lectures || [];
                    
                    const assignmentsRes = await assignmentsAPI.getByCourse(course._id).catch(() => ({ data: [] }));
                    const assignments = assignmentsRes.data || [];
                    
                    const quizzesRes = await quizzesAPI.getByCourse(course._id).catch(() => ({ data: [] }));
                    const quizzes = quizzesRes.data || [];

                    const submissionChecks = await Promise.all(
                        assignments.map((a: any) => assignmentsAPI.getMySubmission(a._id).catch(() => ({ data: null })))
                    );
                    const submittedCount = submissionChecks.filter(r => r.data).length;

                    const quizAttemptChecks = await Promise.all(
                        quizzes.map((q: any) => quizzesAPI.getMyAttempts(q._id).catch(() => ({ data: [] })))
                    );
                    const completedQuizzes = quizAttemptChecks.filter(r => r.data && r.data.length > 0).length;

                    const totalItems = lectures.length + assignments.length + quizzes.length;
                    const completedItems = lectures.length + submittedCount + completedQuizzes;
                    const isCompleted = totalItems > 0 && completedItems === totalItems;

                    return {
                        ...course,
                        isCompleted,
                        completionDate: isCompleted ? new Date() : null
                    };
                } catch (err) {
                    console.error('Error checking course completion:', course._id, err);
                    return { ...course, isCompleted: false, completionDate: null };
                }
            }));
            setCompletedCourses(coursesData.filter(c => c.isCompleted));
        } catch (err) { 
            console.error('Error loading certificates:', err); 
        }
        finally { setIsLoading(false); }
    };

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900">My Certificates</h1>
                <p className="text-slate-500 mt-1">Download certificates for completed courses</p>
            </div>

            {completedCourses.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
                    <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Certificates Yet</h3>
                    <p className="text-slate-500">Complete courses to earn certificates</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedCourses.map((course: any) => (
                        <div key={course._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition-all">
                            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-8 text-center">
                                <Award className="w-16 h-16 text-white mx-auto mb-4" />
                                <h3 className="text-white font-bold text-lg">Certificate of Completion</h3>
                            </div>
                            <div className="p-6">
                                <h4 className="font-bold text-slate-900 mb-2">{course.title}</h4>
                                <p className="text-sm text-slate-500 mb-4">{course.category}</p>
                                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                                    <Calendar className="w-4 h-4" />
                                    <span>Completed: {course.completionDate?.toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-emerald-600 mb-4">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>100% Complete</span>
                                </div>
                                <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                                    <Download className="w-5 h-5" />
                                    Download Certificate
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentCertificates;
