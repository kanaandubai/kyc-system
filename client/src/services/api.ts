// services/api.ts
import axios from 'axios';
import { useRouter } from 'vue-router';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  response => response,
  async error => {
    const router = useRouter();

    if (error.response?.status === 401) {
      // Try to refresh token if not on auth routes
      if (!error.config.url?.includes('/auth/')) {
        try {
          await api.post('/auth/refresh-token');
          // Retry the original request
          return api(error.config);
        } catch (refreshError) {
          router.push('/login');
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api; 