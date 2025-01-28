<template>
    <v-card>
      <v-card-title>
        Users Management
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
        :items="users"
        :search="search"
        :loading="loading"
      >
        <template v-slot:item.role="{ item }">
          <v-chip
            :color="item.role === 'ADMIN' ? 'error' : 'primary'"
            size="small"
          >
            {{ item.role }}
          </v-chip>
        </template>
  
        <template v-slot:item.kycStatus="{ item }">
          <v-chip
            :color="getStatusColor(item.kyc?.status)"
            size="small"
          >
            {{ item.kyc?.status || 'NOT SUBMITTED' }}
          </v-chip>
        </template>
  
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            size="small"
            color="info"
            @click="viewUserDetails(item)"
          >
            <v-icon>mdi-eye</v-icon>
          </v-btn>
        </template>
      </v-data-table>
  
      <!-- User Details Dialog -->
      <v-dialog v-model="dialog.show" max-width="600">
        <v-card v-if="dialog.user">
          <v-card-title>User Details</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Email</v-list-item-title>
                <v-list-item-subtitle>{{ dialog.user.email }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Role</v-list-item-title>
                <v-list-item-subtitle>{{ dialog.user.role }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Created At</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(dialog.user.createdAt) }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item v-if="dialog.user.kyc">
                <v-list-item-title>KYC Status</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip
                    :color="getStatusColor(dialog.user.kyc.status)"
                    size="small"
                  >
                    {{ dialog.user.kyc.status }}
                  </v-chip>
                </v-list-item-subtitle>
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
    </v-card>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import api from '@/services/api';
  import type { User } from '@/types';
  
  const search = ref('');
  const users = ref<User[]>([]);
  const loading = ref(false);
  
  const headers = [
    { title: 'Email', key: 'email' },
    { title: 'Role', key: 'role' },
    { title: 'KYC Status', key: 'kycStatus' },
    { title: 'Created At', key: 'createdAt' },
    { title: 'Actions', key: 'actions', sortable: false },
  ];
  
  const dialog = ref({
    show: false,
    user: null as User | null,
  });
  
  const getStatusColor = (status?: string) => {
    if (!status) return 'grey';
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'warning';
    }
  };
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };
  
  const viewUserDetails = (user: User) => {
    dialog.value = {
      show: true,
      user,
    };
  };
  
  const fetchUsers = async () => {
    loading.value = true;
    try {
      const response = await api.get('/admin/users');
      users.value = response.data.users.map((user: User) => ({
        ...user,
        createdAt: formatDate(user.createdAt),
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      loading.value = false;
    }
  };
  
  onMounted(fetchUsers);
  </script>