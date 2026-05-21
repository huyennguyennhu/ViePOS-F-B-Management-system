import axios from 'axios';

// Địa chỉ của Spring Boot backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đính kèm JWT token vào mọi request (nếu đã đăng nhập)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Nếu token hết hạn (401), tự động logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Không tự động redirect nếu đang ở trang Đăng nhập
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data: any) => api.post('/api/auth/login', data),
  staffRegister: (data: any) => api.post('/api/staff/register', data),
  staffLogin: (data: any) => api.post('/api/staff/login', data),
};

export const staffAPI = {
  getPending: () => api.get('/api/staff/pending'),
  approve: (id: string) => api.put(`/api/staff/${id}/approve`),
  reject: (id: string) => api.put(`/api/staff/${id}/reject`),
};

export const productAPI = {
  getProducts: () => api.get('/api/products'),
  getCategories: () => api.get('/api/products/categories'),
};

export const cardAPI = {
  getCards: () => api.get('/api/cards'),
  getFreeCards: () => api.get('/api/cards/free'),
  startSession: (data: { cardNumber: string; orderId: string; duration: string }) => api.post('/api/cards/session', data),
  releaseCard: (cardNumber: string) => api.post(`/api/cards/release/${cardNumber}`),
  getSessions: () => api.get('/api/cards/sessions'),
  updateCardStatus: (cardNumber: string, status: string) => api.post(`/api/cards/${cardNumber}/status`, { status }),
};

export default api;
