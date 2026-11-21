import axios from 'axios';

// Defaults to your live deployed Node.js Gateway on Render
let rawUrl = process.env.NEXT_PUBLIC_API_URL || 'https://eduvision-ai-server-node.onrender.com/api';

// Safely normalize trailing slashes and ensure /api endpoint
rawUrl = rawUrl.trim();
if (!rawUrl.endsWith('/api')) {
  rawUrl = rawUrl.replace(/\/+$/, '') + '/api';
}

const API_BASE_URL = rawUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('eduvision_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
