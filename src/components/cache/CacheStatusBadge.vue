<template>
  <div class="cache-status-badge">
    <q-badge :color="enabled ? 'green' : 'grey'" class="q-px-sm q-py-xs">
      <q-icon :name="enabled ? 'storage' : 'storage_off'" size="14px" class="q-mr-xs" />
      {{ enabled ? 'Cache Enabled' : 'Cache Disabled' }}
    </q-badge>
    <span v-if="enabled" class="text-caption text-grey-7 q-ml-sm">
      {{ entryCount }} entries | {{ formatFileSize(sizeBytes) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { formatFileSize } from '../../utils/formatters'

withDefaults(
  defineProps<{
    enabled?: boolean
    entryCount?: number
    sizeBytes?: number
  }>(),
  {
    enabled: true,
    entryCount: 0,
    sizeBytes: 0,
  }
)
</script>

<style lang="scss" scoped>
.cache-status-badge {
  display: inline-flex;
  align-items: center;
}
</style>
