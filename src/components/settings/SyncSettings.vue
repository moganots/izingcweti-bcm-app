<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6 q-mb-md">Synchronization</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>Auto Sync</q-item-label>
            <q-item-label caption>Automatically sync changes when online</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="autoSync"
              color="primary"
              @update:model-value="$emit('update:auto-sync', autoSync)"
            />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section>
            <q-item-label>Sync Interval</q-item-label>
            <q-item-label caption>How often to sync in the background</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select
              v-model="syncInterval"
              :options="intervalOptions"
              outlined
              dense
              style="width: 140px"
              @update:model-value="$emit('update:sync-interval', syncInterval)"
            />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section>
            <q-item-label>Sync on Metered Connection</q-item-label>
            <q-item-label caption>Allow sync when using cellular data</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="meteredSync"
              color="primary"
              @update:model-value="$emit('update:metered-sync', meteredSync)"
            />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item>
          <q-item-section>
            <q-item-label>Conflict Resolution</q-item-label>
            <q-item-label caption>Default strategy for resolving sync conflicts</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select
              v-model="conflictStrategy"
              :options="conflictOptions"
              outlined
              dense
              style="width: 160px"
              @update:model-value="$emit('update:conflict-strategy', conflictStrategy)"
            />
          </q-item-section>
        </q-item>
      </q-list>

      <q-separator class="q-my-md" />

      <div class="row q-col-gutter-md">
        <div class="col-6">
          <q-btn
            color="primary"
            icon="sync"
            label="Sync Now"
            class="full-width"
            unelevated
            @click="$emit('sync-now')"
          />
        </div>
        <div class="col-6">
          <q-btn
            outline
            color="negative"
            icon="delete"
            label="Clear Pending"
            class="full-width"
            @click="$emit('clear-pending')"
          />
        </div>
      </div>

      <div class="q-mt-md text-center">
        <div class="text-caption text-grey-7">Last synced: {{ lastSyncText }}</div>
        <div v-if="pendingCount > 0" class="text-caption text-orange">
          {{ pendingCount }} pending changes
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatTimeAgo } from '../../utils/date.utils'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    autoSync?: boolean
    syncInterval?: number
    meteredSync?: boolean
    conflictStrategy?: string
    lastSyncAt?: string | null
    pendingCount?: number
  }>(),
  {
    autoSync: true,
    syncInterval: 5,
    meteredSync: false,
    conflictStrategy: 'last_write_wins',
    lastSyncAt: null,
    pendingCount: 0,
  }
)

const emit = defineEmits<{
  'update:auto-sync': [value: boolean]
  'update:sync-interval': [value: number]
  'update:metered-sync': [value: boolean]
  'update:conflict-strategy': [value: string]
  'sync-now': []
  'clear-pending': []
}>()

const autoSync = ref(props.autoSync)
const syncInterval = ref(props.syncInterval)
const meteredSync = ref(props.meteredSync)
const conflictStrategy = ref(props.conflictStrategy)

const intervalOptions = [
  { label: '1 minute', value: 1 },
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
]

const conflictOptions = [
  { label: 'Last Write Wins', value: 'last_write_wins' },
  { label: 'Client Wins', value: 'client_wins' },
  { label: 'Server Wins', value: 'server_wins' },
  { label: 'Manual', value: 'manual' },
]

const lastSyncText = computed(() => {
  if (!props.lastSyncAt) return 'Never'
  return formatTimeAgo(props.lastSyncAt)
})
</script>
