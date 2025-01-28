<template>
    <v-dialog
      v-model="dialog"
      max-width="500"
    >
      <v-card>
        <v-card-title>{{ title }}</v-card-title>
        <v-card-text>
          {{ message }}
          <v-textarea
            v-if="showNotes"
            v-model="notes"
            label="Notes"
            rows="3"
            class="mt-3"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            text
            @click="cancel"
          >
            Cancel
          </v-btn>
          <v-btn
            :color="confirmColor"
            @click="confirm"
          >
            {{ confirmText }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue';
  
  const props = defineProps<{
    modelValue: boolean;
    title: string;
    message: string;
    confirmText?: string;
    confirmColor?: string;
    showNotes?: boolean;
  }>();
  
  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'confirm', notes?: string): void;
    (e: 'cancel'): void;
  }>();
  
  const dialog = ref(props.modelValue);
  const notes = ref('');
  
  watch(() => props.modelValue, (value) => {
    dialog.value = value;
  });
  
  watch(dialog, (value) => {
    emit('update:modelValue', value);
  });
  
  const confirm = () => {
    emit('confirm', props.showNotes ? notes.value : undefined);
    dialog.value = false;
    notes.value = '';
  };
  
  const cancel = () => {
    emit('cancel');
    dialog.value = false;
    notes.value = '';
  };
  </script>