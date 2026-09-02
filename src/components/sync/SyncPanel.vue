<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">Synchronization</div>
        <SyncStatusIndicator :status="status" :pending-count="pendingCount" :last-sync-at="lastSyncAt" />
      </div>

      <!-- Progress Bar -->
      <div v-if="isSyncing" class="q-mb-md">
        <q-linear-progress :value="progress / 100" color="orange" size="20px" rounded class="q-mb-sm" />
        <div class="row justify-between text-caption">
          <span>Syncing...</span>
          <span>{{ progress }}%</span>
        </div>
      </div>

      <!-- Error Message -->
      <q-banner v-if="error && status === 'error'" class="bg-red-1 text-red-8 q-mb-md rounded-borders" rounded>
        <template v-slot:avatar>
          <q-icon name="error" color="red-8" />
        </template>
        {{ error }}
        <template v-slot:action>
          <q-btn flat color="red-8" label="Retry" @click="$emit('retry')" />
        </template>
      </q-banner>

      <!-- Offline Banner -->
      <q-banner v-if="status === 'offline'" class="bg-orange-1 text-orange-8 q-mb-md rounded-borders" rounded>
        <template v-slot:avatar>
          <q-icon name="wifi_off" color="orange-8" />
        </template>
        You are offline. Changes will be synced when you reconnect.
      </q-banner>

      <!-- Sync Actions -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-6">
          <q-btn color="primary" icon="cloud_upload" label="Push Changes" class="full-width"
            :disable="isSyncing || status === 'offline' || pendingCount === 0" :loading="isSyncing" unelevated
            @click="$emit('push')" />
        </div>
        <div class="col-6">
          <q-btn color="secondary" icon="cloud_download" label="Pull Changes" class="full-width"
            :disable="isSyncing || status === 'offline'" outline @click="$emit('pull')" />
        </div>
      </div>

      <q-btn color="primary" icon="sync" label="Full Sync" class="full-width"
        :disable="isSyncing || status === 'offline'" :loading="isSyncing" unelevated @click="$emit('full-sync')" />

      <!-- Sync Stats -->
      <div v-if="lastSyncAt" class="q-mt-md text-center">
        <div class="text-caption text-grey-7">Last synced: {{ lastSyncText }}</div>
        <div class="text-caption text-grey-7">
          Pushed: {{ totalPushed }} | Pulled: {{ totalPulled }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SyncStatusIndicator from './SyncStatusIndicator.vue'
import { formatTimeAgo } from '../../utils/date.utils'

const props = withDefaults(
  defineProps<{
    status: 'idle' | 'syncing' | 'error' | 'offline'
    pendingCount?: number
    progress?: number
    error?: string | null
    lastSyncAt?: string | null
    totalPushed?: number
    totalPulled?: number
  }>(),
  {
    status: 'idle',
    pendingCount: 0,
    progress: 0,
    error: null,
    lastSyncAt: null,
    totalPushed: 0,
    totalPulled: 0,
  }
)

defineEmits<{
  push: []
  pull: []
  'full-sync': []
  retry: []
}>()

const isSyncing = computed(() => props.status === 'syncing')
const lastSyncText = computed(() => (props.lastSyncAt ? formatTimeAgo(props.lastSyncAt) : 'Never'))
</script>
