<template>
  <q-page padding>
    <PageHeader
      title="Synchronization"
      subtitle="Monitor and manage data synchronization"
      show-refresh
      @refresh="loadSyncData"
    >
      <template #actions>
        <q-btn
          v-if="hasPendingChanges"
          color="primary"
          icon="sync"
          label="Sync Now"
          unelevated
          :loading="isSyncing"
          @click="handleFullSync"
        />
      </template>
    </PageHeader>

    <!-- Sync Status Overview -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-md-3">
        <q-card flat bordered :class="'bg-' + statusColor + '-1'">
          <q-card-section class="text-center">
            <div class="flex flex-center">
              <SyncStatusIndicator
                :status="syncStatus"
                :pending-count="pendingCount"
                :last-sync-at="lastSyncAt"
              />
            </div>
            <div class="text-caption text-grey-7 q-mt-sm">Sync Status</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card flat bordered class="bg-orange-1">
          <q-card-section class="text-center">
            <div class="text-h4 text-orange">{{ pendingCount }}</div>
            <div class="text-caption text-grey-7">Pending Changes</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card flat bordered class="bg-red-1">
          <q-card-section class="text-center">
            <div class="text-h4 text-red">{{ conflictCount }}</div>
            <div class="text-caption text-grey-7">Conflicts</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card flat bordered class="bg-grey-1">
          <q-card-section class="text-center">
            <div class="text-h4 text-grey-7">{{ lastSyncText }}</div>
            <div class="text-caption text-grey-7">Last Sync</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Sync Panel -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-6">
        <SyncPanel
          :status="syncStatus"
          :pending-count="pendingCount"
          :progress="syncProgress"
          :error="syncError"
          :last-sync-at="lastSyncAt"
          :total-pushed="totalPushed"
          :total-pulled="totalPulled"
          @push="handlePush"
          @pull="handlePull"
          @full-sync="handleFullSync"
          @retry="handleRetry"
        />
      </div>
      <div class="col-12 col-md-6">
        <NetworkStatus
          :is-online="isOnline"
          :connection-type="connectionType"
          :signal-strength="signalStrength"
          :is-metered="isMetered"
        />
      </div>
    </div>

    <!-- Pending Changes & Conflicts Tabs -->
    <q-card flat bordered>
      <q-tabs
        v-model="activeTab"
        active-color="primary"
        indicator-color="primary"
        class="text-grey-7"
        dense
      >
        <q-tab name="pending">
          <template #default>
            <div class="row items-center q-gutter-xs">
              <span>Pending Changes</span>
              <q-badge v-if="pendingCount > 0" color="orange" rounded>{{ pendingCount }}</q-badge>
            </div>
          </template>
        </q-tab>
        <q-tab name="conflicts">
          <template #default>
            <div class="row items-center q-gutter-xs">
              <span>Conflicts</span>
              <q-badge v-if="conflictCount > 0" color="red" rounded>{{ conflictCount }}</q-badge>
            </div>
          </template>
        </q-tab>
        <q-tab name="history" label="History" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTab" animated>
        <!-- Pending Changes -->
        <q-tab-panel name="pending">
          <PendingChangesList
            :changes="pendingChanges"
            :loading="loadingPending"
            :disabled="isSyncing"
            @push-all="handlePush"
            @push="handlePushSingle"
            @retry="handleRetrySingle"
            @remove="handleRemovePending"
          />
        </q-tab-panel>

        <!-- Conflicts -->
        <q-tab-panel name="conflicts">
          <ConflictList
            :conflicts="conflicts"
            :loading="loadingConflicts"
            @resolve="openResolveDialog"
          />
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
        <ConflictResolver
          :conflict="resolvingConflict"
          :submitting="resolving"
          @resolve="handleResolveConflict"
          @cancel="showResolveDialog = false"
        />
      </div>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useSyncStore } from './../../stores'
import { useNetwork } from '../../composables/useNetwork'
import PageHeader from '../../components/.common/PageHeader.vue'
import SyncStatusIndicator from '../../components/sync/SyncStatusIndicator.vue'
import SyncPanel from '../../components/sync/SyncPanel.vue'
import NetworkStatus from '../../components/sync/NetworkStatus.vue'
import PendingChangesList from '../../components/sync/PendingChangesList.vue'
import ConflictList from '../../components/sync/ConflictList.vue'
import ConflictResolver from '../../components/sync/ConflictResolver.vue'
import SyncHistory from '../../components/sync/SyncHistory.vue'

const $q = useQuasar()
const syncStore = useSyncStore()
const { isOnline, connectionType, signalStrength, isMetered } = useNetwork()

// State
const activeTab = ref('pending')
const loadingPending = ref(false)
const loadingConflicts = ref(false)
const loadingHistory = ref(false)
const showResolveDialog = ref(false)
const resolving = ref(false)
const resolvingConflict = ref<any>(null)

// Sync data from store
const syncStatus = computed(() => syncStore.status)
const pendingChanges = computed(() => syncStore.pendingChanges)
const conflicts = computed(() => syncStore.conflicts)
const pendingCount = computed(() => syncStore.pendingCount)
const conflictCount = computed(() => syncStore.conflictCount)
const isSyncing = computed(() => syncStore.isSyncing)
const syncProgress = computed(() => syncStore.progress)
const syncError = computed(() => syncStore.error)
const lastSyncAt = computed(() => syncStore.lastSyncAt)
const totalPushed = computed(() => syncStore.totalPushed)
const totalPulled = computed(() => syncStore.totalPulled)
const hasPendingChanges = computed(() => syncStore.hasPendingChanges)

// Sync history
const syncHistory = ref<any[]>([])

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

// Auto-refresh interval
let refreshInterval: number | null = null

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

async function loadSyncData(): Promise<void> {
  await Promise.all([loadPendingChanges(), loadConflicts(), loadHistory()])
}

async function loadPendingChanges(): Promise<void> {
  loadingPending.value = true
  try {
    await syncStore.loadPendingChanges()
  } catch (err: any) {
    console.error('Failed to load pending changes:', err)
  } finally {
    loadingPending.value = false
  }
}

async function loadConflicts(): Promise<void> {
  loadingConflicts.value = true
  try {
    await syncStore.loadConflicts()
  } catch (err: any) {
    console.error('Failed to load conflicts:', err)
  } finally {
    loadingConflicts.value = false
  }
}

async function loadHistory(): Promise<void> {
  loadingHistory.value = true
  try {
    // Mock history data - replace with actual store method
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

async function handlePush(): Promise<void> {
  try {
    await syncStore.pushChanges()
    $q.notify({ type: 'positive', message: 'Changes pushed successfully', timeout: 2000 })
    await loadPendingChanges()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Push failed' })
  }
}

async function handlePull(): Promise<void> {
  try {
    await syncStore.pullChanges()
    $q.notify({ type: 'positive', message: 'Changes pulled successfully', timeout: 2000 })
    await Promise.all([loadPendingChanges(), loadConflicts()])
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Pull failed' })
  }
}

async function handleFullSync(): Promise<void> {
  try {
    await syncStore.fullSync()
    $q.notify({ type: 'positive', message: 'Sync completed successfully', timeout: 2000 })
    await loadSyncData()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Sync failed' })
  }
}

function handleRetry(): void {
  handleFullSync()
}

async function handlePushSingle(change: any): Promise<void> {
  try {
    await syncStore.pushChange(change.id)
    $q.notify({ type: 'positive', message: 'Change pushed successfully', timeout: 2000 })
    await loadPendingChanges()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to push change' })
  }
}

async function handleRetrySingle(change: any): Promise<void> {
  try {
    await syncStore.retryChange(change.id)
    $q.notify({ type: 'positive', message: 'Retry queued', timeout: 2000 })
    await loadPendingChanges()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to retry' })
  }
}

async function handleRemovePending(change: any): Promise<void> {
  $q.dialog({
    title: 'Remove Pending Change',
    message: 'Are you sure you want to remove this pending change? This action cannot be undone.',
    cancel: true,
    ok: { color: 'negative', label: 'Remove' },
  }).onOk(async () => {
    try {
      await syncStore.removePendingChange(change.id)
      $q.notify({ type: 'positive', message: 'Change removed', timeout: 2000 })
      await loadPendingChanges()
    } catch (err: any) {
      $q.notify({ type: 'negative', message: err.message || 'Failed to remove change' })
    }
  })
}

function openResolveDialog(conflict: any): void {
  resolvingConflict.value = conflict
  showResolveDialog.value = true
}

async function handleResolveConflict(data: {
  strategy: string
  resolvedData?: any
}): Promise<void> {
  resolving.value = true
  try {
    await syncStore.resolveConflict(resolvingConflict.value.id, data)
    $q.notify({ type: 'positive', message: 'Conflict resolved successfully', timeout: 2000 })
    showResolveDialog.value = false
    resolvingConflict.value = null
    await Promise.all([loadConflicts(), loadPendingChanges()])
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to resolve conflict' })
  } finally {
    resolving.value = false
  }
}
</script>
