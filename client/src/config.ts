// Centralized configuration for the client application

// API Base URL
// 1. Prioritize environment variable (VITE_API_URL)
// 2. Fallback to localhost:3000 (standard local development)
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
