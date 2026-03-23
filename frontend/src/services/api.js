import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  markAttendance: (status, date) => 
    api.post('/attendance', { status, date }),
  
  getAttendance: (date) => 
    api.get('/attendance', { params: { date } }),
  
  getMonthlyAttendance: (month, year) => 
    api.get('/attendance/monthly', { params: { month, year } }),
};

export const adminService = {
  getDailyReport: (date) => 
    api.get('/admin/reports/daily', { params: { date } }),
  
  getAttendanceTrends: (startDate, endDate) => 
    api.get('/admin/reports/trends', { params: { startDate, endDate } }),
  
  getUsers: () => 
    api.get('/admin/users'),
  
  updateUserRole: (userId, role) => 
    api.put(`/admin/users/${userId}/role`, { role }),
};

export const chefService = {
  getDailyCount: () => 
    api.get('/chef/daily-count'),
};
