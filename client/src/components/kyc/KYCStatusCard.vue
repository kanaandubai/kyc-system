<!-- components/kyc/KYCStatusCard.vue -->
<template>
  <v-card>
    <v-card-title>KYC Status</v-card-title>
    <v-card-text>
      <div v-if="kyc">
        <v-alert
          :type="statusType"
          :title="kyc.status"
        >
          {{ kyc.adminNotes || 'Your KYC is being processed.' }}
        </v-alert>

        <div v-if="kyc.documentUrl" class="mt-4">
          <v-btn
            color="primary"
            @click="viewDocument"
            prepend-icon="mdi-file-document"
          >
            View Document
          </v-btn>
        </div>
      </div>
      <div v-else>
        <v-alert type="info">
          You haven't submitted your KYC yet.
          <v-btn
            color="primary"
            class="mt-4"
            to="/kyc"
          >
            Submit KYC
          </v-btn>
        </v-alert>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface KYC {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  documentUrl?: string;
  adminNotes?: string;
}

const props = defineProps<{
  kyc: KYC | null
}>();

const statusType = computed(() => {
  if (!props.kyc) return 'info';
  switch (props.kyc.status) {
    case 'APPROVED': return 'success';
    case 'REJECTED': return 'error';
    default: return 'info';
  }
});

const viewDocument = () => {
  if (props.kyc?.id) {
    window.open(`/api/kyc/document/${props.kyc.id}`, '_blank');
  }
};
</script>

<style scoped>
.v-btn {
  text-transform: none;
}

.v-alert {
  margin-bottom: 0;
}
</style>