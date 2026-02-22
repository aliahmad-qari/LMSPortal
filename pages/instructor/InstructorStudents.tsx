import React, { useState, useEffect } from 'react';
import { coursesAPI, assignmentsAPI, quizzesAPI } from '../../services/api';
import { Users, BookOpen, CheckCircle, TrendingUp, Loader2, Search } from 'lucide-react';

const InstructorStudents: React.FC = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const coursesRes = await coursesAPI.getTeaching();
            const courses = coursesRes.data;

            const studentsMap = new Map();

            for (const course of courses) {
                try {
                    const courseDetails = await coursesAPI.getById(course._id);
                    const enrolledStudents = courseDetails.data.course.enrolledStudents || [];
                    
                    const assignmentsRes = await assignmentsAPI.getByCourse(course._id).catch(() => ({ data: [] }));
                    const assignments = assignmentsRes.data || [];
                    
                    const quizzesRes = await quizzesAPI.getByCourse(course._id).catch(() => ({ data: [] }));
                    const quizzes = quizzesRes.data || [];

                    for (const student of enrolledStudents) {
                        const studentId = student._id || student;
                        const studentName = student.name || 'Unknown';
                        const studentEmail = student.email || '';

                        if (!studentsMap.has(studentId)) {
                            studentsMap.set(studentId, {
                                id: studentId,
                                name: studentName,
                                email: studentEmail,
                                courses: [],
                                totalAssignments: 0,
                                submittedAssignments: 0,
                                totalQuizzes: 0,
                                quizScoreSum: 0
                            });
                        }

                        const studentData = studentsMap.get(studentId);
                        
                        let studentSubmissions = [];
                        try {
                            const submissionsRes = await Promise.all(
                                assignments.map((a: any) => 
                                    assignmentsAPI.getSubmissions(a._id).catch(() => ({ data: [] }))
                                )
                            );
                            studentSubmissions = submissionsRes
                                .flatMap(r => r.data)
                                .filter((s: any) => {
                                    const sId = s.student?._id || s.student;
                                    return sId && sId.toString() === studentId.toString();
                                });
                        } catch (err) {
                            console.error('Error fetching submissions:', err);
                        }

                        let studentQuizzes = [];
                        try {
                            const attemptsRes = await Promise.all(
                                quizzes.map((q: any) => 
                                    quizzesAPI.getAttempts(q._id).catch(() => ({ data: [] }))
                                )
                            );
                            studentQuizzes = attemptsRes
                                .flatMap(r => r.data)
                                .filter((a: any) => {
                                    const aId = a.studentId?._id || a.studentId;
                                    return aId && aId.toString() === studentId.toString();
                                });
                        } catch (err) {
                            console.error('Error fetching quiz attempts:', err);
                        }

                        const lectures = courseDetails.data.lectures || [];
                        const totalItems = lectures.length + assignments.length + quizzes.length;
                        const completedItems = lectures.length + studentSubmissions.length + studentQuizzes.length;
                        const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

                        studentData.courses.push({
                            courseId: course._id,
                            courseName: course.title,
                            enrolledDate: new Date(),
                            progress
                        });
                        studentData.totalAssignments += assignments.length;
                        studentData.submittedAssignments += studentSubmissions.length;
                        studentData.totalQuizzes += studentQuizzes.length;
                        studentData.quizScoreSum += studentQuizzes.reduce((sum: number, q: any) => sum + (q.score || 0), 0);
                    }
                } catch (err) {
                    console.error('Error processing course:', course._id, err);
                }
            }

            setStudents(Array.from(studentsMap.values()));
        } catch (err) { 
            console.error('Error loading students:', err); 
        }
        finally { setIsLoading(false); }
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900">My Students</h1>
                <p className="text-slate-500 mt-1">Track student progress across your courses</p>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search students..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none shadow-sm"
                    />
                </div>
            </div>

            {filteredStudents.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No Students Found</h3>
                    <p className="text-slate-500">Students will appear here when they enroll in your courses</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Courses</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Progress</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assignments</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Quiz Avg</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredStudents.map((student: any) => {
                                    const avgProgress = student.courses.length > 0 ? Math.round(student.courses.reduce((sum: number, c: any) => sum + c.progress, 0) / student.courses.length) : 0;
                                    const avgQuizScore = student.totalQuizzes > 0 ? Math.round(student.quizScoreSum / student.totalQuizzes) : 0;
                                    return (
                                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-slate-900">{student.name}</p>
                                                    <p className="text-sm text-slate-500">{student.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    {student.courses.map((c: any, i: number) => (
                                                        <span key={i} className="text-sm text-slate-600">{c.courseName}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 bg-slate-100 rounded-full h-2">
                                                        <div className="bg-violet-600 h-2 rounded-full" style={{ width: `${avgProgress}%` }} />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900">{avgProgress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-600">{student.submittedAssignments}/{student.totalAssignments}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-slate-900">{avgQuizScore}%</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstructorStudents;
