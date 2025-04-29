import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const attendanceService = {
  markAttendance: (status: 'office' | 'home' | 'leave', date: string) => 
    api.post('/attendance', { status, date }),
  
  getAttendance: (date?: string) => 
    api.get('/attendance', { params: { date } }),
  
  getMonthlyAttendance: (month: number, year: number) => 
    api.get('/attendance/monthly', { params: { month, year } }),
};

export const adminService = {
  getDailyReport: (date?: string) => 
    api.get('/admin/reports/daily', { params: { date } }),
  
  getAttendanceTrends: (startDate: string, endDate: string) => 
    api.get('/admin/reports/trends', { params: { startDate, endDate } }),
  
  getUsers: () => 
    api.get('/admin/users'),
  
  updateUserRole: (userId: string, role: string) => 
    api.put(`/admin/users/${userId}/role`, { role }),
};

export const chefService = {
  getDailyCount: () => 
    api.get('/chef/daily-count'),
};