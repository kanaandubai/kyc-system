import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { KYC, KYCSubmission, KYCStats } from '../types';
import api from '../services/api';

export const useKYCStore = defineStore('kyc', () => {
  const userKYC = ref<KYC | null>(null);
  const allKYCs = ref<KYC[]>([]);
  const stats = ref<KYCStats | null>(null);
  const loading = ref(false);
  const initialized = ref(false);
  const error = ref<string | null>(null);

  async function submitKYC(data: KYCSubmission) {
    loading.value = true;
    error.value = null;
    try {
      const formData = new FormData();
      formData.append('fullName', data.fullName);
      if (data.document) {
        formData.append('document', data.document);
      }

      const response = await api.post('/kyc/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      userKYC.value = response.data.kyc;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to submit KYC';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function getUserKYC() {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/kyc/status');
      userKYC.value = response.data.kyc;
      initialized.value = true;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch KYC status';
      userKYC.value = null;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function getAllKYCs() {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/kyc/all');
      allKYCs.value = response.data.kycs;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch KYCs';
      allKYCs.value = [];
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateKYCStatus(id: number, status: string, adminNotes?: string) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.put(`/kyc/${id}/status`, { status, adminNotes });
      const index = allKYCs.value.findIndex(kyc => kyc.id === id);
      if (index !== -1) {
        allKYCs.value[index] = response.data.kyc;
      }
      // Refresh statistics after status update
      await getKYCStats();
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update KYC status';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function getKYCStats() {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/kyc/statistics');
      stats.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch KYC statistics';
      stats.value = null;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function resetStore() {
    userKYC.value = null;
    allKYCs.value = [];
    stats.value = null;
    loading.value = false;
    initialized.value = false;
    error.value = null;
  }

  // Search KYCs with filters
  async function searchKYCs(filters: { 
    status?: string; 
    email?: string; 
    date?: string;
  }) {
    loading.value = true;
    error.value = null;
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.email) params.append('email', filters.email);
      if (filters.date) params.append('date', filters.date);

      const response = await api.get(`/kyc/search?${params.toString()}`);
      allKYCs.value = response.data.kycs;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to search KYCs';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    userKYC,
    allKYCs,
    stats,
    loading,
    initialized,
    error,
    submitKYC,
    getUserKYC,
    getAllKYCs,
    updateKYCStatus,
    getKYCStats,
    resetStore,
    searchKYCs
  };
});