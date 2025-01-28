<template>
    <v-card>
      <v-card-title>Submit KYC Information</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleSubmit" ref="form">
          <v-text-field
            v-model="formData.fullName"
            label="Full Name"
            :rules="[rules.required]"
            required
          ></v-text-field>
  
          <v-file-input
            v-model="formData.document"
            label="ID Document"
            accept="image/*,.pdf"
            :rules="[rules.required]"
            show-size
            required
            prepend-icon="mdi-file-document"
          >
            <template v-slot:selection="{ fileNames }">
              <template v-for="fileName in fileNames" :key="fileName">
                <v-chip
                  label
                  size="small"
                  color="primary"
                  class="me-2"
                >
                  {{ fileName }}
                </v-chip>
              </template>
            </template>
          </v-file-input>
  
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mb-4"
          >
            {{ error }}
          </v-alert>
  
          <v-btn
            type="submit"
            color="primary"
            block
            :loading="loading"
            :disabled="loading"
          >
            Submit KYC
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useKYCStore } from '@/stores/kyc';
  
  const router = useRouter();
  const kycStore = useKYCStore();
  
  const formData = ref({
    fullName: '',
    document: null as File | null
  });
  
  const loading = ref(false);
  const error = ref('');
  const form = ref<any>(null);
  
  const rules = {
    required: (v: any) => !!v || 'This field is required'
  };
  
  const handleSubmit = async () => {
    const { valid } = await form.value.validate();
    
    if (!valid || !formData.value.document) return;
  
    try {
      loading.value = true;
      error.value = '';
      
      await kycStore.submitKYC({
        fullName: formData.value.fullName,
        document: formData.value.document
      });
  
      router.push('/dashboard');
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to submit KYC';
    } finally {
      loading.value = false;
    }
  };
  </script>