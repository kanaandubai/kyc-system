<template>
    <v-card :color="color" :variant="variant">
      <v-card-text>
        <div class="d-flex justify-space-between align-center">
          <div>
            <div class="text-h4 mb-1">{{ value }}</div>
            <div class="text-subtitle-2">{{ title }}</div>
          </div>
          <v-icon
            size="48"
            :color="iconColor"
          >
            {{ icon }}
          </v-icon>
        </div>
        <div v-if="change !== undefined" class="mt-2">
          <v-chip
            :color="change >= 0 ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            {{ change >= 0 ? '+' : '' }}{{ change }}%
          </v-chip>
          <span class="text-caption ml-2">vs last month</span>
        </div>
      </v-card-text>
    </v-card>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    title: string;
    value: number | string;
    icon: string;
    color?: string;
    variant?: string;
    iconColor?: string;
    change?: number;
  }>();
  </script>