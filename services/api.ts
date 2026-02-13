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
    create: (data: { title: string; description: string; courseId: string; dueDate: string; totalMarks?: number }) =>
        api.post('/assignments', data),
    submit: (id: string, formData: FormData) =>
        api.post(`/assignments/${id}/submit`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    getSubmissions: (id: string) => api.get(`/assignments/${id}/submissions`),
    getMySubmission: (id: string) => api.get(`/assignments/${id}/my-submission`),
    grade: (submissionId: string, data: { grade: number; feedback?: string }) =>
        api.put(`/assignments/submissions/${submissionId}/grade`, data),
};

// ==================== MESSAGES ====================
export const messagesAPI = {
    getHistory: (roomId: string) => api.get(`/messages/${roomId}`),
    getRooms: () => api.get('/messages'),
};

export const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');

export default api;
