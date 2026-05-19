<template>
  <div class="page-header q-mb-md">
    <div class="row items-center justify-between">
      <div class="col">
        <div class="text-h4 text-weight-bold">{{ title }}</div>
        <div v-if="subtitle" class="text-subtitle1 text-grey-7 q-mt-xs">{{ subtitle }}</div>
      </div>
      <div class="col-auto">
        <q-btn
          v-if="showRefresh"
          flat
          round
          icon="refresh"
          :loading="refreshing"
          @click="$emit('refresh')"
        >
          <q-tooltip>Refresh</q-tooltip>
        </q-btn>
        <q-btn v-if="showSettings" flat round icon="settings" @click="$emit('settings')">
          <q-tooltip>Settings</q-tooltip>
        </q-btn>
        <slot name="actions" />
      </div>
    </div>
    <q-separator class="q-mt-md" />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    showRefresh?: boolean
    showSettings?: boolean
    refreshing?: boolean
  }>(),
  {
    subtitle: '',
    showRefresh: false,
    showSettings: false,
    refreshing: false,
  }
)

defineEmits<{
  refresh: []
  settings: []
}>()
</script>

<style lang="scss" scoped>
.page-header {
  .text-h4 {
    font-size: 1.75rem;

    @media (max-width: 600px) {
      font-size: 1.5rem;
    }
  }
}
</style>
