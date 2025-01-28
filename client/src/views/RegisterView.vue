<template>
    <v-container class="fill-height">
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="elevation-12">
            <v-card-title class="text-h5 text-center py-4">
              Register New Account
            </v-card-title>
            
            <v-card-text>
              <v-form @submit.prevent="handleSubmit" ref="form">
                <v-text-field
                  v-model="formData.email"
                  :rules="[rules.required, rules.email]"
                  label="Email"
                  prepend-icon="mdi-email"
                  type="email"
                  required
                  autocomplete="email"
                  :error-messages="emailError"
                  @input="clearErrors"
                ></v-text-field>
  
                <v-text-field
                  v-model="formData.password"
                  :rules="[rules.required, rules.minLength, rules.password]"
                  label="Password"
                  prepend-icon="mdi-lock"
                  :type="showPassword ? 'text' : 'password'"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="showPassword = !showPassword"
                  required
                  autocomplete="new-password"
                  :error-messages="passwordError"
                  @input="clearErrors"
                ></v-text-field>
  
                <v-text-field
                  v-model="formData.confirmPassword"
                  :rules="[rules.required, rules.passwordMatch]"
                  label="Confirm Password"
                  prepend-icon="mdi-lock-check"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  autocomplete="new-password"
                  :error-messages="confirmPasswordError"
                  @input="clearErrors"
                ></v-text-field>
  
                <v-alert
                  v-if="error"
                  type="error"
                  variant="tonal"
                  class="mb-4"
                  closable
                  @click:close="error = ''"
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
                  {{ loading ? 'Creating Account...' : 'Register' }}
                </v-btn>
              </v-form>
            </v-card-text>
  
            <v-card-text class="text-center">
              <router-link to="/login" class="text-decoration-none">
                Already have an account? Login here
              </router-link>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  
  const router = useRouter();
  const authStore = useAuthStore();
  
  const formData = ref({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const showPassword = ref(false);
  const loading = ref(false);
  const error = ref('');
  const form = ref<any>(null);
  const fieldErrors = ref({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const rules = {
    required: (v: string) => !!v || 'This field is required',
    email: (v: string) => /.+@.+\..+/.test(v) || 'Please enter a valid email',
    minLength: (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
    password: (v: string) => {
      const hasNumber = /\d/.test(v);
      const hasUpper = /[A-Z]/.test(v);
      const hasLower = /[a-z]/.test(v);
      const hasSpecial = /[!@#$%^&*]/.test(v);
      
      if (!hasNumber) return 'Password must contain at least one number';
      if (!hasUpper) return 'Password must contain at least one uppercase letter';
      if (!hasLower) return 'Password must contain at least one lowercase letter';
      if (!hasSpecial) return 'Password must contain at least one special character';
      return true;
    },
    passwordMatch: (v: string) => v === formData.value.password || 'Passwords do not match'
  };
  
  const emailError = computed(() => fieldErrors.value.email);
  const passwordError = computed(() => fieldErrors.value.password);
  const confirmPasswordError = computed(() => fieldErrors.value.confirmPassword);
  
  const clearErrors = () => {
    error.value = '';
    fieldErrors.value = {
      email: '',
      password: '',
      confirmPassword: ''
    };
  };
  
 // In RegisterView.vue
const handleSubmit = async () => {
  try {
    const { valid } = await form.value.validate();
    if (!valid) return;

    loading.value = true;
    error.value = '';
    
    await authStore.register(formData.value);
    router.push('/kyc'); // Redirect to KYC instead of dashboard
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Registration failed';
    console.error('Registration error:', err);
  } finally {
    loading.value = false;
  }
};
  </script>