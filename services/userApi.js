// services/userApi.js
import axios from 'axios';

const userApi = axios.create({
  baseURL: 'https://todu.mn/bs/lms/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token for every request
userApi.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default userApi;
