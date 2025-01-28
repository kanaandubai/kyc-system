<template>
    <v-app>
      <v-navigation-drawer v-model="drawer" app>
        <v-list density="compact">
          <v-list-item
            prepend-avatar="https://randomuser.me/api/portraits/men/81.jpg"
            :title="user?.email"
            :subtitle="user?.role"
          ></v-list-item>
  
          <v-divider class="my-2"></v-divider>
  
          <v-list-item
            v-for="item in menuItems"
            :key="item.title"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            :value="item.title"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>
  
      <v-app-bar app>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-app-bar-title>KYC Management System</v-app-bar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="logout">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </v-app-bar>
  
      <v-main>
        <v-container fluid>
          <router-view></router-view>
        </v-container>
      </v-main>
  
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="3000"
      >
        {{ snackbar.text }}
        <template v-slot:actions>
          <v-btn
            color="white"
            variant="text"
            @click="snackbar.show = false"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-app>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  
  const drawer = ref(true);
  const router = useRouter();
  const authStore = useAuthStore();
  
  const user = computed(() => authStore.user);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');
  
  const menuItems = computed(() => {
    const items = [
      { title: 'Dashboard', to: '/dashboard', icon: 'mdi-view-dashboard' },
      { title: 'KYC Submission', to: '/kyc', icon: 'mdi-file-document' },
    ];
  
    if (isAdmin.value) {
      items.push(
        { title: 'Users Management', to: '/admin/users', icon: 'mdi-account-group' },
        { title: 'KYC Approvals', to: '/admin/kyc', icon: 'mdi-file-check' }
      );
    }
  
    return items;
  });
  
  const snackbar = ref({
    show: false,
    text: '',
    color: 'success'
  });
  
  const logout = async () => {
    try {
      await authStore.logout();
      router.push('/login');
    } catch (error) {
      snackbar.value = {
        show: true,
        text: 'Failed to logout',
        color: 'error'
      };
    }
  };
  </script>