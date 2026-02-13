
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  department?: string;
  enrolledCourses?: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar?: string;
  thumbnail: string;
  enrolledCount: number;
  status: 'active' | 'archived' | 'draft';
  lectures?: Lecture[];
  assignments?: Assignment[];
}

export interface Lecture {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  pdfUrl?: string;
  duration: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status?: 'pending' | 'submitted' | 'graded' | 'returned';
  grade?: number;
  feedback?: string;
  courseName?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  fileUrl: string;
  status: 'PENDING' | 'GRADED';
  grade?: number;
  feedback?: string;
  submittedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  roomId: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  activeAdmins: number;
  totalStudents: number;
  totalInstructors: number;
  pendingAssignments: number;
  upcomingClasses: number;
  activeEnrollments: number;
}
