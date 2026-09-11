import axios from 'axios';

export const getBackendBaseUrl = () => {
  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    if (window.location.hostname === 'rasmalai-core.onrender.com') {
      return window.location.origin;
    }
    // For mobile phones, Vercel deployments, or LAN IPs, route directly to live Render backend
    return 'https://rasmalai-core.onrender.com';
  }
  return 'https://rasmalai-core.onrender.com';
};

export const getApiBaseUrl = () => {
  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return `${getBackendBaseUrl()}/api`;
};

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${getBackendBaseUrl()}${path}`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer Token and Language to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smart_farm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const lang = localStorage.getItem('smart_farm_lang') || 'en';
  config.headers['X-Language'] = lang;

  // Critical for FormData: remove manual Content-Type so browser attaches multipart boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor for 401 Unauthorized handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('smart_farm_token');
      localStorage.removeItem('smart_farm_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
};

export const sensorsAPI = {
  getCurrent: () => api.get('/sensors/current'),
};

export const weatherAPI = {
  getCurrent: (location) => api.get('/weather/current', { params: { location } }),
};

export const motorAPI = {
  getStatus: () => api.get('/motor/status'),
  control: (action, mode) => api.post('/motor/control', { action, mode }),
  getLogs: () => api.get('/motor/logs'),
};

export const plantAPI = {
  analyzeScan: (formData) => {
    if (formData instanceof FormData && !formData.has('lang')) {
      formData.append('lang', localStorage.getItem('smart_farm_lang') || 'en');
    }
    return api.post('/plant/analyze', formData, {
      headers: { 'Content-Type': undefined },
      timeout: 90000,
    });
  },
  getHistory: (search) => api.get('/plant/history', { params: { search } }),
  getScanDetail: (id) => api.get(`/plant/history/${id}`),
  getLatestScan: () => api.get('/plant/latest'),
};

export const chatAPI = {
  sendMessage: (message, scanId = null) => api.post('/chat/message', { message, scan_id: scanId }),
  getHistory: () => api.get('/chat/history'),
  clearHistory: () => api.delete('/chat/clear'),
};

export default api;
