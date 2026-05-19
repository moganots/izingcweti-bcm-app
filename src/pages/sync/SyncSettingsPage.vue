<template>
  <q-page padding>
    <PageHeader title="Sync Settings" subtitle="Configure synchronization behavior" />

    <div class="settings-container q-gutter-md">
      <!-- General Settings -->
      <SettingsSection title="General" icon="settings" description="Basic synchronization settings">
        <q-list>
          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="sync" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Auto Sync</q-item-label>
              <q-item-label caption>Automatically sync changes when online</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="settings.autoSync"
                color="primary"
                @update:model-value="saveSetting('autoSync', settings.autoSync)"
              />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="timer" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Sync Interval</q-item-label>
              <q-item-label caption>How often to sync in the background</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                v-model="settings.syncInterval"
                :options="intervalOptions"
                outlined
                dense
                style="width: 150px"
                emit-value
                map-options
                @update:model-value="saveSetting('syncInterval', settings.syncInterval)"
              />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="wifi" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Sync on WiFi Only</q-item-label>
              <q-item-label caption>Only sync when connected to WiFi</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="settings.wifiOnly"
                color="primary"
                @update:model-value="saveSetting('wifiOnly', settings.wifiOnly)"
              />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="signal_cellular_alt" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Sync on Cellular</q-item-label>
              <q-item-label caption>Allow sync when using mobile data</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="settings.meteredSync"
                color="primary"
                :disable="settings.wifiOnly"
                @update:model-value="saveSetting('meteredSync', settings.meteredSync)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>

      <!-- Advanced Settings -->
      <SettingsSection
        title="Advanced"
        icon="tune"
        description="Advanced synchronization configuration"
      >
        <q-list>
          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="batch_prediction" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Batch Size</q-item-label>
              <q-item-label caption>Number of changes to sync per batch</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                v-model="settings.batchSize"
                :options="batchSizeOptions"
                outlined
                dense
                style="width: 120px"
                emit-value
                map-options
                @update:model-value="saveSetting('batchSize', settings.batchSize)"
              />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="replay" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Max Retries</q-item-label>
              <q-item-label caption>Maximum retry attempts for failed syncs</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                v-model="settings.maxRetries"
                :options="retryOptions"
                outlined
                dense
                style="width: 120px"
                emit-value
                map-options
                @update:model-value="saveSetting('maxRetries', settings.maxRetries)"
              />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="compress" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Compression</q-item-label>
              <q-item-label caption>Compress data before syncing</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="settings.compression"
                color="primary"
                @update:model-value="saveSetting('compression', settings.compression)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>

      <!-- Conflict Resolution -->
      <SettingsSection
        title="Conflict Resolution"
        icon="build"
        description="How sync conflicts are handled"
      >
        <q-list>
          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="gavel" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Default Strategy</q-item-label>
              <q-item-label caption>How to resolve conflicts by default</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                v-model="settings.conflictStrategy"
                :options="strategyOptions"
                outlined
                dense
                style="width: 180px"
                emit-value
                map-options
                @update:model-value="saveSetting('conflictStrategy', settings.conflictStrategy)"
              />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="notifications_active" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Notify on Conflict</q-item-label>
              <q-item-label caption>Send notification when conflicts occur</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="settings.notifyConflict"
                color="primary"
                @update:model-value="saveSetting('notifyConflict', settings.notifyConflict)"
              />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="auto_fix_high" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Auto-Resolve</q-item-label>
              <q-item-label caption>Automatically resolve simple conflicts</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="settings.autoResolve"
                color="primary"
                @update:model-value="saveSetting('autoResolve', settings.autoResolve)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>

      <!-- Data Management -->
      <SettingsSection
        title="Data Management"
        icon="storage"
        description="Manage synchronized data"
      >
        <q-list>
          <q-item clickable @click="clearPendingChanges">
            <q-item-section avatar>
              <q-icon name="delete_sweep" color="orange" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Clear Pending Changes</q-item-label>
              <q-item-label caption>Remove all queued changes</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable @click="resetSyncState">
            <q-item-section avatar>
              <q-icon name="restart_alt" color="red" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-negative">Reset Sync State</q-item-label>
              <q-item-label caption>Clear sync metadata and start fresh</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable @click="exportSyncLogs">
            <q-item-section avatar>
              <q-icon name="download" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Export Sync Logs</q-item-label>
              <q-item-label caption>Download synchronization logs for debugging</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>

      <!-- Sync Statistics -->
      <SettingsSection title="Statistics" icon="analytics" description="Synchronization statistics">
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label>Total Pushed</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span class="text-body2 text-weight-bold">{{ syncStats.totalPushed }}</span>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item>
            <q-item-section>
              <q-item-label>Total Pulled</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span class="text-body2 text-weight-bold">{{ syncStats.totalPulled }}</span>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item>
            <q-item-section>
              <q-item-label>Conflicts Resolved</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span class="text-body2 text-weight-bold">{{ syncStats.conflictsResolved }}</span>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item>
            <q-item-section>
              <q-item-label>Average Sync Time</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span class="text-body2 text-weight-bold">{{ syncStats.avgSyncTime }}ms</span>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item>
            <q-item-section>
              <q-item-label>Data Transferred</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span class="text-body2 text-weight-bold">{{ syncStats.dataTransferred }}</span>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item>
            <q-item-section>
              <q-item-label>Success Rate</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span class="text-body2 text-weight-bold text-green"
                >{{ syncStats.successRate }}%</span
              >
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'  // Remove 'ref' from here
import { useQuasar } from 'quasar'
import { useSyncStore } from './../../stores'
import PageHeader from '../../components/.common/PageHeader.vue'
import SettingsSection from '../../components/settings/SettingsSection.vue'

const $q = useQuasar()
const syncStore = useSyncStore()

// Settings
const settings = reactive({
  autoSync: true,
  syncInterval: 5,
  wifiOnly: false,
  meteredSync: false,
  batchSize: 50,
  maxRetries: 5,
  compression: true,
  conflictStrategy: 'last_write_wins',
  notifyConflict: true,
  autoResolve: true,
})

// Options
const intervalOptions = [
  { label: '1 minute', value: 1 },
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
]

const batchSizeOptions = [
  { label: '10', value: 10 },
  { label: '25', value: 25 },
  { label: '50', value: 50 },
  { label: '100', value: 100 },
  { label: '200', value: 200 },
]

const retryOptions = [
  { label: '3', value: 3 },
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: 'Unlimited', value: -1 },
]

const strategyOptions = [
  { label: 'Last Write Wins', value: 'last_write_wins' },
  { label: 'Client Wins', value: 'client_wins' },
  { label: 'Server Wins', value: 'server_wins' },
  { label: 'Manual Resolution', value: 'manual' },
]

// Sync stats
const syncStats = reactive({
  totalPushed: 0,
  totalPulled: 0,
  conflictsResolved: 0,
  avgSyncTime: 0,
  dataTransferred: '0 MB',
  successRate: 100,
})

// Load statistics on mount
onMounted(async () => {
  await loadStats()
})

async function loadStats(): Promise<void> {
  try {
    // Load stats from sync store
    syncStats.totalPushed = syncStore.totalPushed || 0
    syncStats.totalPulled = syncStore.totalPulled || 0

    // Calculate success rate based on sync history
    const history = await syncStore.getSyncHistory()
    if (history && history.length > 0) {
      const successful = history.filter((h: any) => h.status === 'success').length
      syncStats.successRate = Math.round((successful / history.length) * 100)
    }
  } catch (err) {
    console.error('Failed to load stats:', err)
  }
}

function saveSetting(key: string, value: any): void {
  localStorage.setItem(`sync_setting_${key}`, JSON.stringify(value))
  
  if (key === 'autoSync') {
    syncStore.setAutoSync(value)
  } else if (key === 'syncInterval') {
    syncStore.setSyncInterval(value)
  }
  
  $q.notify({ 
    type: 'positive', 
    message: `${key} setting saved`, 
    timeout: 1500,
    position: 'bottom'
  })
}

function clearPendingChanges(): void {
  $q.dialog({
    title: 'Clear Pending Changes',
    message: 'Are you sure you want to clear all pending changes? Unsynchronized data will be lost.',
    cancel: true,
    ok: { color: 'negative', label: 'Clear' },
  }).onOk(async () => {
    try {
      await syncStore.clearPendingChanges()  // Use clearPendingChanges, not clearAllPendingChanges
      $q.notify({ type: 'positive', message: 'Pending changes cleared' })
    } catch (err: any) {
      $q.notify({ type: 'negative', message: err.message })
    }
  })
}

function resetSyncState(): void {
  $q.dialog({
    title: 'Reset Sync State',
    message: 'This will reset all sync metadata. You will need to do a full sync. Continue?',
    cancel: true,
    ok: { color: 'negative', label: 'Reset' },
  }).onOk(async () => {
    try {
      await syncStore.resetSyncState()  // This now exists
      $q.notify({ type: 'positive', message: 'Sync state reset successfully' })
      await loadStats()
    } catch (err: any) {
      $q.notify({ type: 'negative', message: err.message })
    }
  })
}

function exportSyncLogs(): void {
  const logs = syncStore.getSyncLogs()
  const dataStr = JSON.stringify(logs, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `sync-logs-${new Date().toISOString()}.json`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({ type: 'positive', message: 'Sync logs exported', timeout: 2000 })
}
</script>

<style lang="scss" scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
}
</style>
