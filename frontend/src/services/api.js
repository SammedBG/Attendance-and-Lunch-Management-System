import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getCookieValue = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

const shouldAttachCsrf = (method) => {
  const normalized = method?.toLowerCase();
  return ['post', 'put', 'patch', 'delete'].includes(normalized);
};

// Attach CSRF token for state-changing requests
api.interceptors.request.use((config) => {
  if (shouldAttachCsrf(config.method)) {
    const csrfToken = getCookieValue('csrfToken');
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
  }
  return config;
});

// Add automatic token refresh interceptor for managing short-lived JWT Cookies
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    const isAuthExcluded = url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh');
    
    // If we catch a 401 Unauthorized, and we haven't tried to refresh yet, AND it's not the actual auth routes failing
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthExcluded) {
      originalRequest._retry = true;
      
      try {
        // Silently request a new 15-minute Access Cookie using our 7-day HttpOnly Refresh Cookie
        await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
        
        // Since the browser automatically attached the fresh new cookie from the response, retry original query!
        return api(originalRequest);
        
      } catch (refreshError) {
        // The Refresh token itself was invalid or expired (Over 7 days)
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Hard 401 kick (If login fails or refresh retries fail)
    if (error.response?.status === 401 && !originalRequest.url?.includes('/auth/login')) {
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
