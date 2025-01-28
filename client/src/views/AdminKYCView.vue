<template>
  <v-container fluid>
    <!-- KPI Cards -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-h6">Total Users</div>
            <div class="text-h4">{{ kycStore.stats?.totalUsers || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card color="info">
          <v-card-text>
            <div class="text-h6">Pending KYCs</div>
            <div class="text-h4">{{ kycStore.stats?.kycStats?.PENDING || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card color="success">
          <v-card-text>
            <div class="text-h6">Approved KYCs</div>
            <div class="text-h4">{{ kycStore.stats?.kycStats?.APPROVED || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card color="error">
          <v-card-text>
            <div class="text-h6">Rejected KYCs</div>
            <div class="text-h4">{{ kycStore.stats?.kycStats?.REJECTED || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- KYC Table -->
    <v-card class="mt-6">
      <v-card-title>
        KYC Submissions
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="kycStore.allKYCs"
        :search="search"
        :loading="loading"
      >
        <template v-slot:item="{ item }">
          <tr>
            <td>{{ item.fullName }}</td>
            <td>{{ item.user?.email }}</td>
            <td>
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
              >
                {{ item.status }}
              </v-chip>
            </td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td>
              <div class="d-flex align-center">
                <v-btn
                  color="primary"
                  size="small"
                  class="mr-2"
                  @click="openReviewDialog(item)"
                >
                  Review
                </v-btn>
                <v-btn
                  v-if="item.documentUrl"
                  color="info"
                  size="small"
                  :href="item.documentUrl"
                  target="_blank"
                >
                  View Doc
                </v-btn>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <!-- Review Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card v-if="selectedKYC">
        <v-card-title>Review KYC - {{ selectedKYC.fullName }}</v-card-title>
        <v-card-text>
          <div class="mb-4">
            <strong>Email:</strong> {{ selectedKYC.user?.email }}
          </div>
          <div class="mb-4">
            <strong>Submitted:</strong> {{ formatDate(selectedKYC.createdAt) }}
          </div>
          <v-textarea
            v-model="adminNotes"
            label="Admin Notes"
            rows="3"
            placeholder="Add notes (required for rejection)"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            :loading="loading"
            :disabled="loading || (status === 'REJECTED' && !adminNotes)"
            @click="handleStatusUpdate('REJECTED')"
          >
            Reject
          </v-btn>
          <v-btn
            color="success"
            :loading="loading"
            :disabled="loading"
            @click="handleStatusUpdate('APPROVED')"
          >
            Approve
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useKYCStore } from '@/stores/kyc';

const kycStore = useKYCStore();
const search = ref('');
const loading = ref(false);
const adminNotes = ref('');
const selectedKYC = ref<any>(null);
const dialog = ref(false);

const headers = [
  { title: 'Full Name', key: 'fullName', align: 'start' },
  { title: 'Email', key: 'user.email', align: 'start' },
  { title: 'Status', key: 'status', align: 'center' },
  { title: 'Submitted', key: 'createdAt', align: 'start' },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'success';
    case 'REJECTED': return 'error';
    default: return 'info';
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const openReviewDialog = (kyc: any) => {
  selectedKYC.value = kyc;
  adminNotes.value = kyc.adminNotes || '';
  dialog.value = true;
};

const handleStatusUpdate = async (status: string) => {
  try {
    if (!selectedKYC.value) return;
    
    loading.value = true;
    
    if (status === 'REJECTED' && !adminNotes.value.trim()) {
      alert('Notes are required for rejection');
      return;
    }

    await kycStore.updateKYCStatus(
      selectedKYC.value.id,
      status,
      adminNotes.value.trim()
    );
    
    dialog.value = false;
    selectedKYC.value = null;
    adminNotes.value = '';
    await loadData();
  } catch (error) {
    console.error('Error updating status:', error);
    alert('Error updating KYC status');
  } finally {
    loading.value = false;
  }
};

const loadData = async () => {
  try {
    loading.value = true;
    await Promise.all([
      kycStore.getAllKYCs(),
      kycStore.getKYCStats()
    ]);
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);
</script>