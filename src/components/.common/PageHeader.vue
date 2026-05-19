<template>
  <div class="page-header q-mb-lg">
    <div class="row items-center justify-between">
      <div>
        <div class="text-h4 text-weight-bold">{{ title }}</div>
        <div v-if="subtitle" class="text-subtitle1 text-grey-7 q-mt-sm">
          {{ subtitle }}
        </div>
      </div>
      <div class="row items-center q-gutter-sm">
        <slot name="actions" />
        <q-btn
          v-if="showRefresh"
          flat
          round
          dense
          icon="refresh"
          :loading="refreshing"
          @click="handleRefresh"
        >
          <q-tooltip>Refresh</q-tooltip>
        </q-btn>
      </div>
    </div>
    <q-separator class="q-mt-md" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title: string
  subtitle?: string
  showRefresh?: boolean
}>()

const emit = defineEmits<{
  refresh: []
}>()

const refreshing = ref(false)

async function handleRefresh() {
  refreshing.value = true
  try {
    await emit('refresh')
  } finally {
    setTimeout(() => {
      refreshing.value = false
    }, 500)
  }
}
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
