import axios from 'axios';
import toast from 'react-hot-toast';
import { AUTH_TOKEN_NAME_STORE } from '../contexts/AuthContext';

const api = axios.create({
  //baseURL: 'https://api.aniversarioatakarejo.com.br/api', 
  baseURL: 'http://localhost:8080/api',
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_NAME_STORE);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem(AUTH_TOKEN_NAME_STORE);
      if (token) {
        localStorage.removeItem(AUTH_TOKEN_NAME_STORE);
        toast.error('Sessão expirada. Você foi desconectado.');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;