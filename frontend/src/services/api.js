import axios from 'axios';

const API_BASE_URL = 'https://meteo-backend-fsgzg3fkdjhmaaav.westeurope-01.azurewebsites.net';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (userData) => api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/auth/profile'),
};

export const weatherService = {
  getWeather: (city) => api.get(`/api/weather?city=${city}`),
  getPublicWeather: (city) => api.get(`/weather?city=${city}`),
};

export const favoritesService = {
  getFavorites: () => api.get('/api/favorites'),
  addFavorite: (cityData) => {
    console.log('Sending city data to backend:', cityData);
    return api.post('/api/favorites', cityData);
  },
  removeFavorite: (cityName) => {
    console.log('Removing city:', cityName);
    return api.delete(`/api/favorites/${encodeURIComponent(cityName)}`);
  },
};

export default api;