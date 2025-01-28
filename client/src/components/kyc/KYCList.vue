<template>
    <v-card>
      <v-card-title>
        {{ title || 'KYC Submissions' }}
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
          density="compact"
        ></v-text-field>
      </v-card-title>
  
      <v-data-table
        :headers="headers"
        :items="displayItems"
        :search="search"
        :loading="loading"
      >
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>
  
        <template v-slot:item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>
  
        <template v-slot:item.actions="{ item }">
          <v-btn-group>
            <v-btn
              v-if="isAdmin"
              color="success"
              icon
              size="small"
              @click="updateStatus(item, 'APPROVED')"
              :disabled="item.status === 'APPROVED'"
            >
              <v-icon>mdi-check</v-icon>
            </v-btn>
  
            <v-btn
              v-if="isAdmin"
              color="error"
              icon
              size="small"
              @click="updateStatus(item, 'REJECTED')"
              :disabled="item.status === 'REJECTED'"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
  
            <v-btn
              color="info"
              icon
              size="small"
              @click="viewDetails(item)"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
          </v-btn-group>
        </template>
      </v-data-table>
  
      <!-- Details Dialog -->
      <v-dialog v-model="dialog.show" max-width="600">
        <v-card v-if="dialog.item">
          <v-card-title>KYC Details</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Full Name</v-list-item-title>
                <v-list-item-subtitle>{{ dialog.item.fullName }}</v-list-item-subtitle>
              </v-list-item>
  
              <v-list-item>
                <v-list-item-title>Status</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip
                    :color="getStatusColor(dialog.item.status)"
                    size="small"
                  >
                    {{ dialog.item.status }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
  
              <v-list-item>
                <v-list-item-title>Submitted On</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(dialog.item.createdAt) }}</v-list-item-subtitle>
              </v-list-item>
  
              <v-list-item v-if="dialog.item.adminNotes">
                <v-list-item-title>Admin Notes</v-list-item-title>
                <v-list-item-subtitle>{{ dialog.item.adminNotes }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              text
              @click="dialog.show = false"
            >
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- Status Update Dialog -->
      <v-dialog v-model="statusDialog.show" max-width="500">
        <v-card>
          <v-card-title>
            {{ statusDialog.status === 'APPROVED' ? 'Approve' : 'Reject' }} KYC
          </v-card-title>
          <v-card-text>
            <v-textarea
              v-model="statusDialog.notes"
              label="Admin Notes"
              rows="3"
            ></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey"
              text
              @click="statusDialog.show = false"
            >
              Cancel
            </v-btn>
            <v-btn
              :color="statusDialog.status === 'APPROVED' ? 'success' : 'error'"
              @click="confirmStatusUpdate"
            >
              Confirm
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { useKYCStore } from '@/stores/kyc';
  import type { KYC } from '@/types';
  
  const props = defineProps<{
    title?: string;
    limit?: number;
  }>();
  
  const authStore = useAuthStore();
  const kycStore = useKYCStore();
  const search = ref('');
  
  const isAdmin = computed(() => authStore.user?.role === 'ADMIN');
  const loading = computed(() => kycStore.loading);
  
  const headers = [
    { title: 'Full Name', key: 'fullName' },
    { title: 'Status', key: 'status' },
    { title: 'Submitted On', key: 'createdAt' },
    { title: 'Actions', key: 'actions', sortable: false },
  ];
  
  const displayItems = computed(() => {
    let items = kycStore.allKYCs;
    if (props.limit) {
      items = items.slice(0, props.limit);
    }
    return items;
  });
  
  const dialog = ref({
    show: false,
    item: null as KYC | null,
  });
  
  const statusDialog = ref({
    show: false,
    item: null as KYC | null,
    status: '',
    notes: '',
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'warning';
    }
  };
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };
  
  const viewDetails = (item: KYC) => {
    dialog.value = {
      show: true,
      item,
    };
  };
  
  const updateStatus = (item: KYC, status: string) => {
    statusDialog.value = {
      show: true,
      item,
      status,
      notes: '',
    };
  };
  
  const confirmStatusUpdate = async () => {
    if (!statusDialog.value.item) return;
  
    await kycStore.updateKYCStatus(
      statusDialog.value.item.id,
      statusDialog.value.status,
      statusDialog.value.notes
    );
  
    statusDialog.value.show = false;
  };
  </script>