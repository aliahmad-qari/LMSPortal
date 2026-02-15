import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('lms_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle 401 (auto-logout)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('lms_token');
            localStorage.removeItem('lms_user');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

// ==================== AUTH ====================
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    register: (data: { name: string; email: string; password: string; department?: string }) =>
        api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data: { name?: string; department?: string }) =>
        api.put('/auth/profile', data),
};

// ==================== USERS ====================
export const usersAPI = {
    getAll: (params?: { role?: string; search?: string }) =>
        api.get('/users', { params }),
    getAnalytics: () => api.get('/users/analytics'),
    create: (data: { name: string; email: string; password: string; role: string; department?: string }) =>
        api.post('/users', data),
    toggleStatus: (id: string) => api.put(`/users/${id}/toggle-status`),
    delete: (id: string) => api.delete(`/users/${id}`),
};

// ==================== COURSES ====================
export const coursesAPI = {
    getAll: (params?: { search?: string; category?: string }) =>
        api.get('/courses', { params }),
    getEnrolled: () => api.get('/courses/enrolled'),
    getTeaching: () => api.get('/courses/teaching'),
    getById: (id: string) => api.get(`/courses/${id}`),
    create: (formData: FormData) =>
        api.post('/courses', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    update: (id: string, data: any) => api.put(`/courses/${id}`, data),
    delete: (id: string) => api.delete(`/courses/${id}`),
    enroll: (id: string) => api.post(`/courses/${id}/enroll`),
};

// ==================== LECTURES ====================
export const lecturesAPI = {
    getByCourse: (courseId: string) => api.get(`/lectures/course/${courseId}`),
    create: (formData: FormData) =>
        api.post('/lectures', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    delete: (id: string) => api.delete(`/lectures/${id}`),
};

// ==================== ASSIGNMENTS ====================
export const assignmentsAPI = {
    getByCourse: (courseId: string) => api.get(`/assignments/course/${courseId}`),
    create: (formData: FormData) =>
        api.post('/assignments', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    update: (id: string, formData: FormData) =>
        api.put(`/assignments/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    delete: (id: string) => api.delete(`/assignments/${id}`),
    submit: (id: string, formData: FormData) =>
        api.post(`/assignments/${id}/submit`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    getSubmissions: (id: string) => api.get(`/assignments/${id}/submissions`),
    getMySubmission: (id: string) => api.get(`/assignments/${id}/my-submission`),
    grade: (submissionId: string, data: { grade: number; feedback?: string }) =>
        api.put(`/assignments/submissions/${submissionId}/grade`, data),
};

// ==================== QUIZZES ====================
export const quizzesAPI = {
    getByCourse: (courseId: string) => api.get(`/quizzes/course/${courseId}`),
    getById: (id: string) => api.get(`/quizzes/${id}`),
    create: (data: { title: string; description?: string; courseId: string; timeLimit?: number }) =>
        api.post('/quizzes', data),
    addQuestion: (id: string, data: any) => api.post(`/quizzes/${id}/questions`, data),
    delete: (id: string) => api.delete(`/quizzes/${id}`),
    submit: (id: string, data: { responses: any[] }) => api.post(`/quizzes/${id}/submit`, data),
    getAttempts: (id: string) => api.get(`/quizzes/${id}/attempts`),
    getMyAttempts: (id: string) => api.get(`/quizzes/${id}/my-attempts`),
};

// ==================== MESSAGES ====================
export const messagesAPI = {
    getHistory: (roomId: string) => api.get(`/messages/${roomId}`),
    getRooms: () => api.get('/messages'),
};

// ==================== SUPER ADMIN ====================
export const superAdminAPI = {
    getLogs: (params?: { page?: number; limit?: number }) => api.get('/superadmin/logs', { params }),
    getStats: () => api.get('/superadmin/stats'),
};

// ==================== ADMIN FEATURES ====================
export const adminFeaturesAPI = {
    getPendingCourses: () => api.get('/admin/courses/pending'),
    approveCourse: (id: string) => api.put(`/admin/courses/${id}/approve`),
    rejectCourse: (id: string, reason: string) => api.put(`/admin/courses/${id}/reject`, { reason }),
    getCategories: () => api.get('/categories'),
    createCategory: (data: { name: string; description?: string }) => api.post('/categories', data),
    deleteCategory: (id: string) => api.delete(`/categories/${id}`),
    getTickets: () => api.get('/tickets'), // Admin view
    replyTicket: (id: string, data: { message: string; status?: string }) => api.put(`/tickets/${id}/reply`, data),
};

// ==================== INSTRUCTOR FEATURES ====================
export const instructorFeaturesAPI = {
    getAnalytics: () => api.get('/instructor/analytics'),
    createAnnouncement: (data: { courseId: string; title: string; content: string }) => api.post('/announcements', data),
    getAnnouncements: () => api.get('/announcements'),
    addToQuestionBank: (data: any) => api.post('/question-bank', data),
    getQuestionBank: () => api.get('/question-bank'),
};

// ==================== STUDENT FEATURES ====================
export const studentFeaturesAPI = {
    getResults: () => api.get('/student/results'),
    getCertificates: () => api.get('/certificates'),
    generateCertificate: (courseId: string) => api.post('/certificates/generate', { courseId }),
    createTicket: (data: { subject: string; message: string }) => api.post('/tickets', data),
    getMyTickets: () => api.get('/tickets/my-tickets'),
};

// ==================== COMMON ====================
export const commonAPI = {
    getNotifications: () => api.get('/notifications'),
    markNotificationRead: (id: string) => api.put(`/notifications/${id}/read`),
};

export const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');

export default api;
