import axios from 'axios';

// Defaults to your live deployed Node.js Gateway on Render
let rawUrl = process.env.NEXT_PUBLIC_API_URL || 'https://eduvision-ai-server-node.onrender.com/api';

// Safely normalize trailing slashes and ensure /api endpoint
rawUrl = rawUrl.trim();
if (!rawUrl.endsWith('/api')) {
  rawUrl = rawUrl.replace(/\/+$/, '') + '/api';
}

export const API_BASE_URL = rawUrl;

export const api = axios.create({
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

// Live Flask AI Microservice URL on Render
let rawFlaskUrl = process.env.NEXT_PUBLIC_FLASK_URL || 'https://eduvision-ai-server-flask.onrender.com/api/ai';
rawFlaskUrl = rawFlaskUrl.trim();
if (!rawFlaskUrl.endsWith('/api/ai')) {
  rawFlaskUrl = rawFlaskUrl.replace(/\/+$/, '') + '/api/ai';
}

export const FLASK_API_BASE_URL = rawFlaskUrl;

export const flaskApi = axios.create({
  baseURL: FLASK_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
