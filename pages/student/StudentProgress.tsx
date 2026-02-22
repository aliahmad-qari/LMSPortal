import React, { useState, useEffect } from 'react';
import { coursesAPI, assignmentsAPI, quizzesAPI } from '../../services/api';
import { TrendingUp, BookOpen, CheckCircle, Clock, Award, Loader2 } from 'lucide-react';

const StudentProgress: React.FC = () => {
    const [courses, setCourses] = useState<any[]>([]);
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
                    const completedQuizzes = quizAttemptChecks.filter(r => r.data && r.data.length > 0);
                    const avgScore = completedQuizzes.length > 0
                        ? Math.round(completedQuizzes.reduce((sum, r) => sum + (r.data[0]?.score || 0), 0) / completedQuizzes.length)
                        : 0;

                    const totalItems = lectures.length + assignments.length + quizzes.length;
                    const completedItems = lectures.length + submittedCount + completedQuizzes.length;
                    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

                    return {
                        ...course,
                        lectures: lectures.length,
                        assignments: assignments.length,
                        quizzes: quizzes.length,
                        submittedAssignments: submittedCount,
                        avgScore,
                        progress
                    };
                } catch (err) {
                    console.error('Error loading course:', course._id, err);
                    return {
                        ...course,
                        lectures: 0,
                        assignments: 0,
                        quizzes: 0,
                        submittedAssignments: 0,
                        avgScore: 0,
                        progress: 0
                    };
                }
            }));
            setCourses(coursesData);
        } catch (err) { 
            console.error('Error loading progress:', err); 
        }
        finally { setIsLoading(false); }
    };

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

    const totalCourses = courses.length;
    const avgProgress = courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length) : 0;
    const totalAssignments = courses.reduce((sum, c) => sum + c.assignments, 0);
    const submittedAssignments = courses.reduce((sum, c) => sum + c.submittedAssignments, 0);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900">My Progress</h1>
                <p className="text-slate-500 mt-1">Track your learning journey and achievements</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl"><BookOpen className="w-6 h-6" /></div>
                        <div><p className="text-slate-500 text-sm font-medium">Enrolled Courses</p><p className="text-2xl font-bold text-slate-900">{totalCourses}</p></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
                        <div><p className="text-slate-500 text-sm font-medium">Avg Progress</p><p className="text-2xl font-bold text-slate-900">{avgProgress}%</p></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-amber-50 text-amber-600 p-3 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
                        <div><p className="text-slate-500 text-sm font-medium">Assignments</p><p className="text-2xl font-bold text-slate-900">{submittedAssignments}/{totalAssignments}</p></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-violet-50 text-violet-600 p-3 rounded-xl"><Award className="w-6 h-6" /></div>
                        <div><p className="text-slate-500 text-sm font-medium">Completed</p><p className="text-2xl font-bold text-slate-900">{courses.filter(c => c.progress === 100).length}</p></div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Course Progress</h2>
                {courses.length === 0 ? (
                    <div className="text-center py-12"><BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-500">No enrolled courses yet</p></div>
                ) : (
                    <div className="space-y-6">
                        {courses.map((course: any) => (
                            <div key={course._id} className="border border-slate-100 rounded-2xl p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900">{course.title}</h3>
                                        <p className="text-sm text-slate-500">{course.category}</p>
                                    </div>
                                    <span className="text-2xl font-bold text-indigo-600">{course.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 mb-4">
                                    <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-3 rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-slate-400" /><span className="text-slate-600">{course.lectures} Lectures</span></div>
                                    <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-slate-400" /><span className="text-slate-600">{course.submittedAssignments}/{course.assignments} Assignments</span></div>
                                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /><span className="text-slate-600">{course.quizzes} Quizzes</span></div>
                                    <div className="flex items-center gap-2"><Award className="w-4 h-4 text-slate-400" /><span className="text-slate-600">Avg: {course.avgScore}%</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentProgress;
