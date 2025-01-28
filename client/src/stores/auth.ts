// stores/auth.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User, LoginCredentials,RegisterCredentials } from '../types';
import api from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const initialized = ref(false);

  // Add refresh token timer
  let refreshTimer: NodeJS.Timeout | null = null;
  async function register(credentials: RegisterCredentials) {
    loading.value = true;
    try {
      const { data } = await api.post('/auth/register', {
        email: credentials.email,
        password: credentials.password,
        confirmPassword: credentials.confirmPassword
      });
      user.value = data.user;
      initialized.value = true;
      return data;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  }
  async function startRefreshTimer() {
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(async () => {
      try {
        await api.post('/auth/refresh-token');
      } catch (error) {
        await logout();
      }
    }, 14 * 60 * 1000); // Refresh 1 minute before expiration
  }

  async function login(credentials: LoginCredentials) {
    loading.value = true;
    try {
      const { data } = await api.post('/auth/login', credentials);
      user.value = data.user;
      initialized.value = true;
      startRefreshTimer();
      return data;
    } catch (error) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function checkAuth() {
    if (initialized.value) return;
    
    try {
      const { data } = await api.get('/auth/me');
      user.value = data.user;
      startRefreshTimer();
    } catch (error) {
      user.value = null;
    } finally {
      initialized.value = true;
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      resetState();
    }
  }

  function resetState() {
    user.value = null;
    loading.value = false;
    initialized.value = false;
    if (refreshTimer) clearInterval(refreshTimer);
  }

  return {
    user,
    loading,
    initialized,
    login,
    logout,
    checkAuth,
    resetState,
    register
  };
});