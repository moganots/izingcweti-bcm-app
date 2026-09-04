<template>
  <q-page padding>
    <PageHeader :title="$t('sync.settings.title')" :subtitle="$t('sync.settings.subtitle')" />

    <div class="settings-container q-gutter-md">
      <!-- General Settings -->
      <SettingsSection :title="$t('sync.settings.general')" icon="settings"
        :description="$t('sync.settings.general_description')">
        <q-list>
          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="sync" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('sync.settings.auto_sync') }}</q-item-label>
              <q-item-label caption>{{ $t('sync.settings.auto_sync_description') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settings.autoSync" color="primary"
                @update:model-value="saveSetting('autoSync', settings.autoSync)" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="timer" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('sync.settings.sync_interval') }}</q-item-label>
              <q-item-label caption>{{ $t('sync.settings.sync_interval_description') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select v-model="settings.syncInterval" :options="intervalOptions" outlined dense style="width: 150px"
                emit-value map-options @update:model-value="saveSetting('syncInterval', settings.syncInterval)" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="wifi" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('sync.settings.wifi_only') }}</q-item-label>
              <q-item-label caption>{{ $t('sync.settings.wifi_only_description') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settings.wifiOnly" color="primary"
                @update:model-value="saveSetting('wifiOnly', settings.wifiOnly)" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="signal_cellular_alt" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('sync.settings.metered_sync') }}</q-item-label>
              <q-item-label caption>{{ $t('sync.settings.metered_sync_description') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settings.meteredSync" color="primary" :disable="settings.wifiOnly"
                @update:model-value="saveSetting('meteredSync', settings.meteredSync)" />
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>

      <!-- Advanced Settings -->
      <SettingsSection :title="$t('sync.settings.advanced')" icon="tune"
        :description="$t('sync.settings.advanced_description')">
        <q-list>
          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="batch_prediction" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('sync.settings.batch_size') }}</q-item-label>
              <q-item-label caption>{{ $t('sync.settings.batch_size_description') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select v-model="settings.batchSize" :options="batchSizeOptions" outlined dense style="width: 120px"
                emit-value map-options @update:model-value="saveSetting('batchSize', settings.batchSize)" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="replay" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('sync.settings.max_retries') }}</q-item-label>
              <q-item-label caption>{{ $t('sync.settings.max_retries_description') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select v-model="settings.maxRetries" :options="retryOptions" outlined dense style="width: 120px"
                emit-value map-options @update:model-value="saveSetting('maxRetries', settings.maxRetries)" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="compress" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('sync.settings.compression') }}</q-item-label>
              <q-item-label caption>{{ $t('sync.settings.compression_description') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settings.compression" color="primary"
                @update:model-value="saveSetting('compression', settings.compression)" />
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>

      <!-- Conflict Resolution -->
      <SettingsSection :title="$t('sync.settings.conflict_resolution')" icon="build"
        :description="$t('sync.settings.conflict_resolution_description')">
        <q-list>
          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="gavel" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('sync.settings.default_strategy') }}</q-item-label>
              <q-item-label caption>{{ $t('sync.settings.default_strategy_description') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select v-model="settings.conflictStrategy" :options="strategyOptions" outlined dense
                style="width: 180px" emit-value map-options
                @update:model-value="saveSetting('conflictStrategy', settings.conflictStrategy)" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="notifications_active" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('sync.settings.notify_conflict') }}</q-item-label>
              <q-item-label caption>{{ $t('sync.settings.notify_conflict_description') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settings.notifyConflict" color="primary"
                @update:model-value="saveSetting('notifyConflict', settings.notifyConflict)" />
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item tag="label">
            <q-item-section avatar>
              <q-icon name="auto_fix_high" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('sync.settings.auto_resolve') }}</q-item-label>
              <q-item-label caption>{{ $t('sync.settings.auto_resolve_description') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="settings.autoResolve" color="primary"
                @update:model-value="saveSetting('autoResolve', settings.autoResolve)" />
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>

      <!-- Data Management -->
      <SettingsSection :title="$t('sync.settings.data_management')" icon="storage"
        :description="$t('sync.settings.data_management_description')">
        <q-list>
          <q-item clickable @click="clearPendingChanges">
            <q-item-section avatar>
              <q-icon name="delete_sweep" color="orange" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('sync.settings.clear_pending') }}</q-item-label>
              <q-item-label caption>{{ $t('sync.settings.clear_pending_description') }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable @click="resetSyncState">
            <q-item-section avatar>
              <q-icon name="restart_alt" color="red" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-negative">{{ $t('sync.settings.reset_sync') }}</q-item-label>
              <q-item-label caption>{{ $t('sync.settings.reset_sync_description') }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />

          <q-item clickable @click="exportSyncLogs">
            <q-item-section avatar>
              <q-icon name="download" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('sync.settings.export_logs') }}</q-item-label>
              <q-item-label caption>{{ $t('sync.settings.export_logs_description') }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>

      <!-- Sync Statistics -->
      <SettingsSection :title="$t('sync.settings.statistics')" icon="analytics"
        :description="$t('sync.settings.statistics_description')">
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label>{{ $t('sync.settings.total_pushed') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span class="text-body2 text-weight-bold">{{ syncStats.totalPushed }}</span>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item>
            <q-item-section>
              <q-item-label>{{ $t('sync.settings.total_pulled') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span class="text-body2 text-weight-bold">{{ syncStats.totalPulled }}</span>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item>
            <q-item-section>
              <q-item-label>{{ $t('sync.settings.conflicts_resolved') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span class="text-body2 text-weight-bold">{{ syncStats.conflictsResolved }}</span>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item>
            <q-item-section>
              <q-item-label>{{ $t('sync.settings.avg_sync_time') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span class="text-body2 text-weight-bold">{{ syncStats.avgSyncTime }}ms</span>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item>
            <q-item-section>
              <q-item-label>{{ $t('sync.settings.data_transferred') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span class="text-body2 text-weight-bold">{{ syncStats.dataTransferred }}</span>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item>
            <q-item-section>
              <q-item-label>{{ $t('sync.settings.success_rate') }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span class="text-body2 text-weight-bold text-green">
                {{ syncStats.successRate }}%
              </span>
            </q-item-section>
          </q-item>
        </q-list>
      </SettingsSection>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useSync } from 'src/composables/useSync'
import PageHeader from 'src/components/.common/PageHeader.vue'
import SettingsSection from 'src/components/settings/SettingsSection.vue'

// ============================================
// Composables
// ============================================
const $q = useQuasar()
const { t } = useI18n()
const sync = useSync()

// ============================================
// Settings
// ============================================
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

// ============================================
// Options
// ============================================
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
  { label: t('sync.strategies.last_write_wins'), value: 'last_write_wins' },
  { label: t('sync.strategies.client_wins'), value: 'client_wins' },
  { label: t('sync.strategies.server_wins'), value: 'server_wins' },
  { label: t('sync.strategies.manual'), value: 'manual' },
]

// ============================================
// Sync Stats
// ============================================
const syncStats = reactive({
  totalPushed: 0,
  totalPulled: 0,
  conflictsResolved: 0,
  avgSyncTime: 0,
  dataTransferred: '0 MB',
  successRate: 100,
})

// ============================================
// Methods
// ============================================

/**
 * Load statistics
 */
async function loadStats(): Promise<void> {
  try {
    const progress = await sync.getSyncProgress()
    if (progress) {
      syncStats.totalPushed = progress.totalProcessed || 0
    }

    // Calculate success rate based on sync history    // In a real implementation, this would come from an API
    syncStats.successRate = 98
  } catch (err) {
    console.error('Failed to load stats:', err)
  }
}

/**
 * Save a setting
 */
function saveSetting(key: string, value: any): void {
  localStorage.setItem(`sync_setting_${key}`, JSON.stringify(value))

  // Apply settings to sync composable
  if (key === 'autoSync') {
    if (value) {
      sync.startAutoSync()
    } else {
      sync.stopAutoSync()
    }
  } else if (key === 'syncInterval') {
    sync.stopAutoSync()
    // Restart with new interval
    if (settings.autoSync) {
      sync.startAutoSync()
    }
  }

  $q.notify({
    type: 'positive',
    message: t('sync.settings.saved', { key: key }),
    timeout: 1500,
    position: 'bottom',
  })
}

/**
 * Clear pending changes
 */
function clearPendingChanges(): void {
  $q.dialog({
    title: t('sync.dialogs.clear_title'),
    message: t('sync.dialogs.clear_message'),
    cancel: true,
    ok: { color: 'negative', label: t('common.clear') },
  }).onOk(async () => {
    try {
      await sync.clearPendingChanges()
      $q.notify({
        type: 'positive',
        message: t('sync.notifications.pending_cleared'),
        position: 'top',
        timeout: 2000,
      })
      await loadStats()
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.message || t('sync.notifications.clear_failed'),
        position: 'top',
        timeout: 3000,
      })
    }
  })
}

/**
 * Reset sync state
 */
function resetSyncState(): void {
  $q.dialog({
    title: t('sync.dialogs.reset_title'),
    message: t('sync.dialogs.reset_message'),
    cancel: true,
    ok: { color: 'negative', label: t('common.reset') },
  }).onOk(async () => {
    try {
      await sync.updateSyncToken('')
      await sync.clearPendingChanges()
      $q.notify({
        type: 'positive',
        message: t('sync.notifications.reset_success'),
        position: 'top',
        timeout: 2000,
      })
      await loadStats()
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.message || t('sync.notifications.reset_failed'),
        position: 'top',
        timeout: 3000,
      })
    }
  })
}

/**
 * Export sync logs
 */
function exportSyncLogs(): void {
  const logs = {
    settings: { ...settings },
    stats: { ...syncStats },
    pendingChanges: sync.pendingChanges.value,
    conflicts: sync.conflicts.value,
    lastSyncAt: sync.lastSyncAt.value,
    syncToken: sync.syncToken.value,
    exportedAt: new Date().toISOString(),
  }

  const dataStr = JSON.stringify(logs, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `sync-logs-${formatISO(new Date())}.json`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    message: t('sync.notifications.logs_exported'),
    position: 'top',
    timeout: 2000,
  })
}

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
  loadStats()
})
</script>

<style lang="scss" scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 600px) {
    padding: 0 4px;
  }
}

:deep(.q-item) {
  min-height: 56px;

  @media (max-width: 400px) {
    min-height: 48px;
    padding: 8px 12px;

    .q-item__label--caption {
      font-size: 0.7rem;
    }
  }
}

:deep(.q-select) {
  @media (max-width: 400px) {
    width: 100px !important;

    .q-field__native {
      font-size: 0.8rem;
    }
  }
}
</style>