import axios from 'axios';
import logger from '../utils/logger';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Request interceptor for logging
api.interceptors.request.use((config) => {
  logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data || '');
  return config;
}, (error) => {
  logger.error('API Request Error:', error);
  return Promise.reject(error);
});

// Response interceptor for logging
api.interceptors.response.use((response) => {
  logger.debug(`API Response: ${response.status} ${response.config.url}`);
  return response;
}, (error) => {
  if (error.response) {
    logger.error(`API Error Response: ${error.response.status} ${error.config.url}`, error.response.data);
  } else if (error.request) {
    logger.error(`API No Response: ${error.config.url}`, error.request);
  } else {
    logger.error('API Error:', error.message);
  }
  return Promise.reject(error);
});

export default api;
