<template>
  <q-page padding>
    <PageHeader :title="$t('sync.dashboard.title')" :subtitle="$t('sync.dashboard.subtitle')" show-refresh
      @refresh="loadSyncData">
      <template #actions>
        <q-btn v-if="hasPendingChanges" color="primary" icon="sync" :label="$t('sync.dashboard.syncNow')" unelevated
          :loading="isSyncing" @click="handleFullSync" />
      </template>
    </PageHeader>

    <!-- Sync Status Overview -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-md-3">
        <q-card flat bordered :class="'bg-' + statusColor + '-1'">
          <q-card-section class="text-center">
            <div class="flex flex-center">
              <SyncStatusIndicator :status="syncStatus" :pending-count="pendingCount" :last-sync-at="lastSyncAt" />
            </div>
            <div class="text-caption text-grey-7 q-mt-sm">{{ $t('sync.dashboard.status') }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card flat bordered class="bg-orange-1">
          <q-card-section class="text-center">
            <div class="text-h4 text-orange">{{ pendingCount }}</div>
            <div class="text-caption text-grey-7">{{ $t('sync.dashboard.pendingChanges') }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card flat bordered class="bg-red-1">
          <q-card-section class="text-center">
            <div class="text-h4 text-red">{{ unresolvedConflictsCount }}</div>
            <div class="text-caption text-grey-7">{{ $t('sync.dashboard.conflicts') }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card flat bordered class="bg-grey-1">
          <q-card-section class="text-center">
            <div class="text-h4 text-grey-7">{{ lastSyncText }}</div>
            <div class="text-caption text-grey-7">{{ $t('sync.dashboard.lastSync') }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Sync Panel -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <SyncPanel :status="syncStatus" :pending-count="pendingCount" :progress="syncProgressPercentage"
          :error="lastSyncError" :last-sync-at="lastSyncAt" :total-pushed="totalPushed" :total-pulled="totalPulled"
          @push="handlePush" @pull="handlePull" @full-sync="handleFullSync" @retry="handleRetry" />
      </div>
      <div class="col-12 col-md-6">
        <NetworkStatus :is-online="isOnline" :connection-type="connectionType" :signal-strength="signalStrength"
          :is-metered="isMetered" />
      </div>
    </div>

    <!-- Pending Changes & Conflicts Tabs -->
    <q-card flat bordered>
      <q-tabs v-model="activeTab" active-color="primary" indicator-color="primary" class="text-grey-7" dense>
        <q-tab name="pending">
          <template #default>
            <div class="row items-center q-gutter-xs">
              <span>{{ $t('sync.dashboard.pendingChanges') }}</span>
              <q-badge v-if="pendingCount > 0" color="orange" rounded>{{ pendingCount }}</q-badge>
            </div>
          </template>
        </q-tab>
        <q-tab name="conflicts">
          <template #default>
            <div class="row items-center q-gutter-xs">
              <span>{{ $t('sync.dashboard.conflicts') }}</span>
              <q-badge v-if="unresolvedConflictsCount > 0" color="red" rounded>{{ unresolvedConflictsCount }}</q-badge>
            </div>
          </template>
        </q-tab>
        <q-tab name="history" :label="$t('sync.dashboard.history')" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <!-- Pending Changes -->
        <q-tab-panel name="pending">
          <PendingChangesList :changes="pendingChanges" :loading="loadingPending" :disabled="isSyncing"
            @push-all="handlePush" @push="handlePushSingle" @retry="handleRetrySingle" @remove="handleRemovePending" />
        </q-tab-panel>

        <!-- Conflicts -->
        <q-tab-panel name="conflicts">
          <ConflictList :conflicts="conflicts" :loading="loadingConflicts" @resolve="openResolveDialog" />
        </q-tab-panel>

        <!-- History -->
        <q-tab-panel name="history">
          <SyncHistory :history="syncHistory" :loading="loadingHistory" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <!-- Resolve Conflict Dialog -->
    <q-dialog v-model="showResolveDialog" persistent>
      <div style="width: 700px; max-width: 90vw">
        <ConflictResolver :conflict="resolvingConflict" :submitting="resolving" @resolve="handleResolveConflict"
          @cancel="showResolveDialog = false" />
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useSync } from 'src/composables/useSync'
import { useNetwork } from 'src/composables/useNetwork'
import { useI18n } from 'vue-i18n'
import PageHeader from 'src/components/.common/PageHeader.vue'
import SyncStatusIndicator from 'src/components/sync/SyncStatusIndicator.vue'
import SyncPanel from 'src/components/sync/SyncPanel.vue'
import NetworkStatus from 'src/components/sync/NetworkStatus.vue'
import PendingChangesList from 'src/components/sync/PendingChangesList.vue'
import ConflictList from 'src/components/sync/ConflictList.vue'
import ConflictResolver from 'src/components/sync/ConflictResolver.vue'
import SyncHistory from 'src/components/sync/SyncHistory.vue'
import type { SyncConflict, PendingChange } from 'src/types/sync.types'

// ============================================
// Composables
// ============================================
const $q = useQuasar()
const { t } = useI18n()
const { isOnline, connectionType, signalStrength, isMetered } = useNetwork()

// ============================================
// Sync Composable
// ============================================
const sync = useSync({
  autoSyncInterval: 5,
})

// ============================================
// State
// ============================================
const activeTab = ref('pending')
const loadingPending = ref(false)
const loadingConflicts = ref(false)
const loadingHistory = ref(false)
const showResolveDialog = ref(false)
const resolving = ref(false)
const resolvingConflict = ref<SyncConflict | null>(null)

// ============================================
// Computed
// ============================================
const syncStatus = computed(() => {
  if (sync.isSyncing.value) return 'syncing'
  if (sync.lastSyncError.value) return 'error'
  if (!sync.isOnline.value) return 'offline'
  return 'idle'
})

const pendingCount = sync.pendingCount
const pendingChanges = sync.pendingChanges
const conflicts = sync.conflicts
const unresolvedConflictsCount = sync.unresolvedConflictsCount
const isSyncing = sync.isSyncing
const lastSyncError = sync.lastSyncError
const lastSyncAt = sync.lastSyncAt
const hasPendingChanges = sync.hasPendingChanges
const syncProgressPercentage = computed(() => {
  // Calculate progress based on pending changes processed
  if (!sync.syncProgress.value) return 0
  const { totalProcessed, pendingItems } = sync.syncProgress.value
  const total = totalProcessed + pendingItems
  if (total === 0) return 0
  return Math.round((totalProcessed / total) * 100)
})

// Track sync statistics from store
const totalPushed = ref(0)
const totalPulled = ref(0)

// Sync history
const syncHistory = ref<Array<{
  id: string
  type: 'push' | 'pull' | 'full'
  status: 'success' | 'failed' | 'partial'
  timestamp: string
  details?: string
  pushed?: number
  pulled?: number
  conflicts?: number
}>>([])

const statusColor = computed(() => {
  if (syncStatus.value === 'syncing') return 'orange'
  if (syncStatus.value === 'error') return 'red'
  if (syncStatus.value === 'offline') return 'grey'
  return hasPendingChanges.value ? 'orange' : 'green'
})

const lastSyncText = computed(() => {
  if (!lastSyncAt.value) return 'Never'
  const diff = Date.now() - new Date(lastSyncAt.value).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
})

// ============================================
// Auto-refresh interval
// ============================================
let refreshInterval: number | null = null

// ============================================
// Methods
// ============================================

/**
 * Load all sync data
 */
async function loadSyncData(): Promise<void> {
  await Promise.all([
    loadPendingChanges(),
    loadConflicts(),
    loadHistory(),
    loadSyncStats(),
  ])
}

/**
 * Load pending changes
 */
async function loadPendingChanges(): Promise<void> {
  loadingPending.value = true
  try {
    await sync.refreshPendingChanges()
  } catch (err: any) {
    console.error('Failed to load pending changes:', err)
    $q.notify({
      type: 'negative',
      message: err.message || 'Failed to load pending changes',
      position: 'top',
      timeout: 3000,
    })
  } finally {
    loadingPending.value = false
  }
}

/**
 * Load conflicts
 */
async function loadConflicts(): Promise<void> {
  loadingConflicts.value = true
  try {
    await sync.refreshConflicts()
  } catch (err: any) {
    console.error('Failed to load conflicts:', err)
    $q.notify({
      type: 'negative',
      message: err.message || 'Failed to load conflicts',
      position: 'top',
      timeout: 3000,
    })
  } finally {
    loadingConflicts.value = false
  }
}

/**
 * Load sync history
 */
async function loadHistory(): Promise<void> {
  loadingHistory.value = true
  try {
    // Mock history data - replace with actual implementation
    syncHistory.value = [
      {
        id: '1',
        type: 'full',
        status: 'success',
        timestamp: new Date().toISOString(),
        details: 'Full synchronization completed',
        pushed: 5,
        pulled: 12,
        conflicts: 0,
      },
      {
        id: '2',
        type: 'push',
        status: 'success',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        details: 'Changes pushed to server',
        pushed: 3,
        pulled: 0,
        conflicts: 0,
      },
      {
        id: '3',
        type: 'pull',
        status: 'success',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        details: 'Changes pulled from server',
        pushed: 0,
        pulled: 8,
        conflicts: 1,
      },
    ]
  } catch (err: any) {
    console.error('Failed to load history:', err)
  } finally {
    loadingHistory.value = false
  }
}

/**
 * Load sync statistics
 */
async function loadSyncStats(): Promise<void> {
  try {
    const progress = await sync.getSyncProgress()
    if (progress) {
      totalPushed.value = progress.totalProcessed || 0
    }
  } catch (err: any) {
    console.error('Failed to load sync stats:', err)
  }
}

/**
 * Handle push action
 */
async function handlePush(): Promise<void> {
  try {
    const result = await sync.pushChanges()
    $q.notify({
      type: 'positive',
      message: t('sync.notifications.push_success', { count: result.appliedChanges || 0 }),
      position: 'top',
      timeout: 3000,
    })
    await loadPendingChanges()
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.message || t('sync.notifications.push_failed'),
      position: 'top',
      timeout: 3000,
    })
  }
}

/**
 * Handle pull action
 */
async function handlePull(): Promise<void> {
  try {
    $q.notify({
      type: 'positive',
      message: t('sync.notifications.pull_success'),
      position: 'top',
      timeout: 3000,
    })
    await Promise.all([loadPendingChanges(), loadConflicts()])
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.message || t('sync.notifications.pull_failed'),
      position: 'top',
      timeout: 3000,
    })
  }
}

/**
 * Handle full sync
 */
async function handleFullSync(): Promise<void> {
  try {
    const result = await sync.fullSync()
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: t('sync.notifications.sync_success', { count: result.changesApplied || 0 }),
        position: 'top',
        timeout: 3000,
      })
    } else if (result.conflicts && result.conflicts.length > 0) {
      $q.notify({
        type: 'warning',
        message: t('sync.notifications.sync_conflicts', { count: result.conflicts.length }),
        position: 'top',
        timeout: 5000,
      })
    }
    await loadSyncData()
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.message || t('sync.notifications.sync_failed'),
      position: 'top',
      timeout: 3000,
    })
  }
}

/**
 * Handle retry
 */
function handleRetry(): void {
  handleFullSync()
}

/**
 * Open resolve dialog
 */
function openResolveDialog(conflict: SyncConflict): void {
  resolvingConflict.value = conflict
  showResolveDialog.value = true
}

/**
 * Handle push single change
 */
async function handlePushSingle(change: PendingChange): Promise<void> {
  try {
    const success = await sync.processPendingChange(change.uuid)
    if (success) {
      $q.notify({
        type: 'positive',
        message: t('sync.notifications.change_pushed'),
        position: 'top',
        timeout: 2000,
      })
      await loadPendingChanges()
    }
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.message || t('sync.notifications.push_failed'),
      position: 'top',
      timeout: 3000,
    })
  }
}

/**
 * Handle retry single change
 */
async function handleRetrySingle(_change: PendingChange): Promise<void> {
  try {
    const count = await sync.retryFailedChanges()
    $q.notify({
      type: 'positive',
      message: t('sync.notifications.retry_queued', { count }),
      position: 'top',
      timeout: 2000,
    })
    await loadPendingChanges()
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.message || t('sync.notifications.retry_failed'),
      position: 'top',
      timeout: 3000,
    })
  }
}

/**
 * Handle remove pending change
 */
function handleRemovePending(change: PendingChange): void {
  $q.dialog({
    title: t('sync.dialogs.remove_title'),
    message: t('sync.dialogs.remove_message'),
    cancel: true,
    ok: { color: 'negative', label: t('common.remove') },
  }).onOk(async () => {
    try {
      const success = await sync.deletePendingChange(change.uuid)
      if (success) {
        $q.notify({
          type: 'positive',
          message: t('sync.notifications.change_removed'),
          position: 'top',
          timeout: 2000,
        })
        await loadPendingChanges()
      }
    } catch (err: any) {
      $q.notify({
        type: 'negative',
        message: err.message || t('sync.notifications.remove_failed'),
        position: 'top',
        timeout: 3000,
      })
    }
  })
}

/**
 * Handle resolve conflict
 */
async function handleResolveConflict(data: {
  strategy: string
  resolvedData?: any
}): Promise<void> {
  resolving.value = true
  try {
    if (!resolvingConflict.value) return

    await sync.resolveConflict(resolvingConflict.value.uuid, {
      resolutionStrategy: data.strategy as any,
      resolvedData: data.resolvedData,
    })

    $q.notify({
      type: 'positive',
      message: t('sync.notifications.conflict_resolved'),
      position: 'top',
      timeout: 3000,
    })

    showResolveDialog.value = false
    resolvingConflict.value = null
    await Promise.all([loadConflicts(), loadPendingChanges()])
  } catch (err: any) {
    $q.notify({
      type: 'negative',
      message: err.message || t('sync.notifications.resolve_failed'),
      position: 'top',
      timeout: 3000,
    })
  } finally {
    resolving.value = false
  }
}

// ============================================
// Watch for pending changes changes
// ============================================
watch(
  () => sync.pendingCount.value,
  async (newCount, oldCount) => {
    if (newCount !== oldCount && newCount > 0) {
      // Update badge or trigger actions if needed
      console.log(`Pending changes updated: ${newCount}`)
    }
  }
)

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
  loadSyncData()

  // Auto-refresh every 30 seconds
  refreshInterval = window.setInterval(() => {
    if (!isSyncing.value) {
      loadPendingChanges()
      loadConflicts()
    }
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style lang="scss" scoped>
.q-page {
  padding: 16px;

  @media (max-width: 600px) {
    padding: 8px;
  }
}

.text-h4 {
  font-size: 1.75rem;

  @media (max-width: 400px) {
    font-size: 1.25rem;
  }
}

:deep(.q-card) {
  border-radius: 12px;

  @media (max-width: 400px) {
    border-radius: 8px;
  }
}

:deep(.q-tabs) {
  @media (max-width: 400px) {
    .q-tab {
      padding: 8px 12px;
      font-size: 0.75rem;
    }
  }
}

:deep(.q-tab-panel) {
  padding: 16px;

  @media (max-width: 400px) {
    padding: 8px;
  }
}
</style>