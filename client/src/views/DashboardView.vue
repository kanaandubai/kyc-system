<template>
  <div>
    <v-row>
      <!-- Stats Cards -->
      <v-col cols="12" md="6" lg="3" v-for="stat in stats" :key="stat.title">
        <v-card :color="stat.color" variant="tonal">
          <v-card-text>
            <div class="text-h4 mb-2">{{ stat.value }}</div>
            <div class="text-subtitle-1">{{ stat.title }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- KYC Status for Users -->
    <v-row v-if="!isAdmin">
      <v-col cols="12">
        <kyc-status-card :kyc="userKYC" />
      </v-col>
    </v-row>

    <!-- Recent KYCs for Admin -->
    <v-row v-else>
      <v-col cols="12">
        <kyc-list :limit="5" title="Recent KYC Submissions" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useKYCStore } from '@/stores/kyc';
import { useAuthStore } from '@/stores/auth';
import KYCStatusCard from '@/components/kyc/KYCStatusCard.vue';
import KYCList from '@/components/kyc/KYCList.vue';

const kycStore = useKYCStore();
const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.role === 'ADMIN');

const stats = ref([
  { title: 'Total Users', value: 0, color: 'primary' },
  { title: 'Pending KYCs', value: 0, color: 'warning' },
  { title: 'Approved KYCs', value: 0, color: 'success' },
  { title: 'Rejected KYCs', value: 0, color: 'error' },
]);

onMounted(async () => {
  try {
    if (isAdmin.value) {
      const statistics = await kycStore.getKYCStats();
      stats.value = [
        { title: 'Total Users', value: statistics.totalUsers || 0, color: 'primary' },
        { title: 'Pending KYCs', value: statistics.kycStats?.PENDING || 0, color: 'warning' },
        { title: 'Approved KYCs', value: statistics.kycStats?.APPROVED || 0, color: 'success' },
        { title: 'Rejected KYCs', value: statistics.kycStats?.REJECTED || 0, color: 'error' },
      ];
    } else {
      await kycStore.getUserKYC();
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
});

const userKYC = computed(() => kycStore.userKYC);
</script>