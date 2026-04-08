import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const DatasetService = {
  uploadCsv: async (file, name) => {
    const formData = new FormData();
    formData.append('file', file);
    if (name) formData.append('name', name);
    
    const response = await api.post('/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getAll: async () => {
    const response = await api.get('/datasets');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/datasets/${id}`);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/datasets/${id}`);
    return response.data;
  },
  
  manualQuery: async (id, queryData) => {
    const response = await api.post(`/datasets/${id}/query`, queryData);
    return response.data;
  }
};

export const AIService = {
  query: async (datasetId, question) => {
    const response = await api.post('/ai/query', {
      datasetId,
      question
    });
    return response.data;
  }
};

export default api;
