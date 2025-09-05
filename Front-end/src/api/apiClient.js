import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/auth/signin';
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

// Auth API calls
export const authAPI = {
  signup: (userData) => apiClient.post('/auth/signup', userData),
  signin: (credentials) => apiClient.post('/auth/signin', credentials),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (updates) => apiClient.put('/auth/profile', updates)
};

// Reservations API calls
export const reservationsAPI = {
  getReservations: () => apiClient.get('/reservations'),
  createReservation: (reservationData) => apiClient.post('/reservations', reservationData),
  updateReservation: (id, updates) => apiClient.put(`/reservations/${id}`, updates),
  deleteReservation: (id) => apiClient.delete(`/reservations/${id}`)
};

// Pharmacies API calls
export const pharmaciesAPI = {
  getPharmacies: () => apiClient.get('/pharmacies'),
  getPharmacyById: (id) => apiClient.get(`/pharmacies/${id}`),
  searchPharmacies: (searchTerm) => apiClient.get(`/pharmacies/search?q=${searchTerm}`)
};

// Medications API calls
export const medicationsAPI = {
  getMedications: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`/medications${queryString ? `?${queryString}` : ''}`);
  },
  searchMedications: (searchTerm) => apiClient.get(`/medications/search?q=${searchTerm}`)
};

export default apiClient;