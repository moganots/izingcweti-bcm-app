<template>
  <div class="page-header q-mb-lg">
    <div class="row items-center justify-between">
      <div>
        <div class="text-h4 text-weight-bold">
          <q-icon v-if="pageIcon" :name="pageIcon" size="2em" class="q-mr-xs" />
          {{ title }}
        </div>
        <div v-if="subtitle" class="text-subtitle1 text-grey-7 q-mt-sm">
          {{ subtitle }}
        </div>
      </div>
      <div class="row items-center q-gutter-sm">
        <slot name="actions" />
        <q-btn
          v-if="showRefresh"
          dense
          round
          color="primary"
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
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router';

const route = useRoute()

const props = defineProps<{
  title: string
  subtitle?: string
  showRefresh?: boolean
}>()

const emit = defineEmits<{
  refresh: []
}>()

const refreshing = ref(false)
const pageIcon = computed(() => (route.meta?.icon as string))

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
    font-size: 1.25rem;

    @media (max-width: 600px) {
      font-size: 1rem;
    }
  }
}
</style>
