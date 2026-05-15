<template>
  <div class="page-header q-mb-lg">
    <div class="row items-center justify-between">
      <div>
        <h4 class="text-h5 q-mb-xs">{{ title }}</h4>
        <p v-if="subtitle" class="text-grey-7 q-mb-none">{{ subtitle }}</p>
      </div>
      <div class="q-gutter-sm">
        <slot name="actions" />
        <q-btn
          v-if="showRefresh"
          flat
          round
          icon="refresh"
          :loading="refreshing"
          @click="$emit('refresh')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string; showRefresh?: boolean; refreshing?: boolean }>()
defineEmits<{ refresh: [] }>()
</script>
