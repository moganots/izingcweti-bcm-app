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
            <SyncStatusIndicator
              :status="syncStatus"
              :pending-count="pendingCount"
              :last-sync-at="lastSyncAt"
            />
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
        <q-tab name="pending" :label="'Pending (' + pendingCount + ')'">
          <q-badge v-if="pendingCount > 0" floating color="orange">{{ pendingCount }}</q-badge>
        </q-tab>
        <q-tab name="conflicts" :label="'Conflicts (' + conflictCount + ')'">
          <q-badge v-if="conflictCount > 0" floating color="red">{{ conflictCount }}</q-badge>
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
      <q-card style="width: 600px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Resolve Conflict</div>
        </q-card-section>
        <q-card-section>
          <ConflictResolver
            :conflict="resolvingConflict"
            :submitting="resolving"
            @resolve="handleResolveConflict"
            @cancel="showResolveDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useSyncStore } from '../../stores/sync.store'
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

// Sync data
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

const syncHistory = ref<any[]>([])
const statusColor = computed(() => {
  switch (syncStatus.value) {
    case 'syncing':
      return 'orange'
    case 'error':
      return 'red'
    case 'offline':
      return 'grey'
    default:
      return hasPendingChanges.value ? 'orange' : 'green'
  }
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

// Lifecycle
onMounted(() => loadSyncData())

// Methods
async function loadSyncData(): Promise<void> {
  await Promise.all([loadPendingChanges(), loadConflicts()])
}

async function loadPendingChanges(): Promise<void> {
  loadingPending.value = true
  try {
    await syncStore.loadPendingChanges()
  } finally {
    loadingPending.value = false
  }
}

async function loadConflicts(): Promise<void> {
  loadingConflicts.value = true
  try {
    await syncStore.loadConflicts()
  } finally {
    loadingConflicts.value = false
  }
}

async function handlePush(): Promise<void> {
  try {
    await syncStore.pushChanges()
    $q.notify({ type: 'positive', message: 'Changes pushed successfully', timeout: 2000 })
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Push failed' })
  }
}

async function handlePull(): Promise<void> {
  try {
    await syncStore.pullChanges()
    $q.notify({ type: 'positive', message: 'Changes pulled successfully', timeout: 2000 })
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Pull failed' })
  }
}

async function handleFullSync(): Promise<void> {
  try {
    await syncStore.fullSync()
    $q.notify({ type: 'positive', message: 'Sync completed', timeout: 2000 })
    await loadSyncData()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Sync failed' })
  }
}

function handleRetry(): void {
  handleFullSync()
}

async function handlePushSingle(change: any): Promise<void> {
  console.log('Push single change:', change)
}

async function handleRetrySingle(change: any): Promise<void> {
  console.log('Retry single change:', change)
}

async function handleRemovePending(change: any): Promise<void> {
  console.log('Remove pending change:', change)
  await loadPendingChanges()
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
    await syncStore.resolveConflict(resolvingConflict.value.uuid, data)
    $q.notify({ type: 'positive', message: 'Conflict resolved', timeout: 2000 })
    showResolveDialog.value = false
    resolvingConflict.value = null
    await loadConflicts()
  } catch (err: any) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to resolve conflict' })
  } finally {
    resolving.value = false
  }
}
</script>
