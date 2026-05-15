<template>
  <q-banner class="bg-orange text-white text-center" dense>
    <q-icon name="wifi_off" size="18px" class="q-mr-sm" />
    You are offline. Changes will be synced when you reconnect.
    <q-badge v-if="pendingCount > 0" color="red" class="q-ml-sm"
      >{{ pendingCount }} pending</q-badge
    >
  </q-banner>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSyncStore } from '../../stores/sync.store'

const syncStore = useSyncStore()
const pendingCount = computed(() => syncStore.pendingCount)
</script>
