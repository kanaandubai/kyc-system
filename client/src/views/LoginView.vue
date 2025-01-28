<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const formData = ref({
  email: '',
  password: ''
});

const showPassword = ref(false);
const loading = ref(false);
const error = ref('');
const form = ref<any>(null);

const rules = {
  required: (v: string) => !!v || 'This field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Please enter a valid email',
  password: (v: string) => v.length >= 6 || 'Password must be at least 6 characters'
};

const handleSubmit = async () => {
  try {
    // Clear previous errors
    error.value = '';
    
    // Validate form
    const { valid } = await form.value.validate();
    if (!valid) return;

    loading.value = true;
    
    // Attempt login
    await authStore.login(formData.value);
    
    // Clear sensitive data
    formData.value = {
      email: '',
      password: ''
    };
    
    // Redirect to dashboard
    router.push('/dashboard');
  } catch (err: any) {
    // Handle specific error cases
    if (err.response?.status === 401) {
      error.value = 'Invalid email or password';
    } else if (err.response?.status === 429) {
      error.value = 'Too many login attempts. Please try again later.';
    } else {
      error.value = err.response?.data?.message || 'Login failed. Please try again.';
    }
    console.error('Login error:', err);
  } finally {
    loading.value = false;
  }
};

// Check auth state on mount
onMounted(async () => {
  try {
    if (authStore.user) {
      router.push('/dashboard');
    } else {
      await authStore.resetState();
    }
  } catch (error) {
    console.error('Auth check failed:', error);
  }
});
</script>

<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-card-title class="text-h5 text-center py-4">
            Login to KYC System
          </v-card-title>
          
          <v-card-text>
            <v-form
              @submit.prevent="handleSubmit"
              ref="form"
              v-model="valid"
              lazy-validation
            >
              <v-text-field
                v-model="formData.email"
                :rules="[rules.required, rules.email]"
                label="Email"
                prepend-icon="mdi-email"
                type="email"
                required
                autocomplete="email"
                :error-messages="error && error.includes('email') ? [error] : []"
              ></v-text-field>

              <v-text-field
                v-model="formData.password"
                :rules="[rules.required, rules.password]"
                label="Password"
                prepend-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                required
                autocomplete="current-password"
                :error-messages="error && error.includes('password') ? [error] : []"
              ></v-text-field>

              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
              >
                {{ error }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                block
                :loading="loading"
                :disabled="loading"
                class="mt-4"
              >
                {{ loading ? 'Logging in...' : 'Login' }}
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-text class="text-center">
            <router-link to="/register" class="text-decoration-none">
              Don't have an account? Register here
            </router-link>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>