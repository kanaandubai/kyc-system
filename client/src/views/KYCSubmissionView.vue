<template>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <!-- Show loading state -->
          <v-progress-circular
            v-if="loading"
            indeterminate
            color="primary"
            class="d-flex mx-auto my-4"
          ></v-progress-circular>
  
          <template v-else>
            <!-- Show KYC status if it exists -->
            <v-card v-if="kycStore.userKYC" class="mb-6">
              <v-card-title>KYC Status</v-card-title>
              <v-card-text>
                <v-alert
                  :type="kycStore.userKYC.status === 'APPROVED' ? 'success' : 
                         kycStore.userKYC.status === 'REJECTED' ? 'error' : 'info'"
                  :title="kycStore.userKYC.status"
                >
                  {{ kycStore.userKYC.adminNotes || 'Your KYC is being processed.' }}
                </v-alert>
  
                <div v-if="kycStore.userKYC.documentUrl" class="mt-4">
                  <v-btn
                    color="primary"
                    :href="kycStore.userKYC.documentUrl"
                    target="_blank"
                    prepend-icon="mdi-file-document"
                  >
                    View Uploaded Document
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
  
            <!-- Show submission form if no KYC exists -->
            <v-card v-else>
              <v-card-title>Submit KYC</v-card-title>
              <v-card-text>
                <v-form @submit.prevent="handleSubmit" ref="form">
                  <v-text-field
                    v-model="formData.fullName"
                    label="Full Name"
                  ></v-text-field>
  
                  <v-file-input
                    @change="handleFileInput"
                    accept="image/jpeg,image/png,application/pdf"
                    label="Upload ID Document"
                    prepend-icon="mdi-camera"
                  ></v-file-input>
  
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
                    :disabled="loading || !formData.fullName || !formData.document"
                  >
                    Submit KYC
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-card>
          </template>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useKYCStore } from '@/stores/kyc';
  
  const kycStore = useKYCStore();
  const form = ref<any>(null);
  const loading = ref(false);
  const error = ref('');
  
  const formData = ref({
    fullName: '',
    document: null as File | null
  });
  
  const handleFileInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      formData.value.document = target.files[0];
    }
  };
  
  const handleSubmit = async () => {
    try {
      loading.value = true;
      error.value = '';
      
      await kycStore.submitKYC(formData.value);
      formData.value = {
        fullName: '',
        document: null
      };
    } catch (err: any) {
      error.value = err.response?.data?.message || 'KYC submission failed';
    } finally {
      loading.value = false;
    }
  };
  
  onMounted(async () => {
    loading.value = true;
    try {
      await kycStore.getUserKYC();
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    } finally {
      loading.value = false;
    }
  });
  </script>