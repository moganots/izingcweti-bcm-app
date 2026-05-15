<template>
  <q-page padding>
    <PageHeader
      title="Audit Logs"
      subtitle="View and manage system audit trail"
      show-refresh
      @refresh="loadLogs"
    >
      <template #actions>
        <q-btn
          color="primary"
          icon="download"
          label="Export"
          outline
          @click="showExportDialog = true"
        />
      </template>
    </PageHeader>

    <!-- Stats Overview -->
    <AuditStatsOverview :logs="logs" :stats-data="statsData" class="q-mb-lg" />

    <!-- Search & Filters -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12">
        <AuditSearchBar
          v-model="filters.search"
          @search="handleSearch"
          @clear="clearSearch"
          @toggle-filters="showFilters = !showFilters"
        />
      </div>
    </div>

    <!-- Filter Bar (collapsible) -->
    <q-slide-transition>
      <AuditFilterBar v-if="showFilters" @filter-change="handleFilterChange" />
    </q-slide-transition>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center q-pa-xl">
      <LoadingSpinner message="Loading audit logs..." />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="logs.length === 0"
      icon="history"
      title="No Audit Logs"
      description="No audit logs found matching your criteria."
    />

    <!-- Audit Log List -->
    <div v-else class="q-gutter-md">
      <AuditLogCard v-for="log in logs" :key="log.uuid" :log="log" />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center q-mt-lg">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="6"
        direction-links
        color="primary"
        @update:model-value="loadLogs"
      />
    </div>

    <!-- Export Dialog -->
    <AuditExportDialog v-model="showExportDialog" :exporting="exporting" @export="handleExport" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuditStore } from '../../stores/audit.store'
import PageHeader from '../../components/.common/PageHeader.vue'
import LoadingSpinner from '../../components/.common/LoadingSpinner.vue'
import EmptyState from '../../components/.common/EmptyState.vue'
import AuditStatsOverview from '../../components/audit/AuditStatsOverview.vue'
import AuditSearchBar from '../../components/audit/AuditSearchBar.vue'
import AuditFilterBar from '../../components/audit/AuditFilterBar.vue'
import AuditLogCard from '../../components/audit/AuditLogCard.vue'
import AuditExportDialog from '../../components/audit/AuditExportDialog.vue'

const $q = useQuasar()
const auditStore = useAuditStore()

// State
const logs = computed(() => auditStore.logs || [])
const isLoading = ref(false)
const totalPages = ref(1)
const currentPage = ref(1)
const showFilters = ref(false)
const showExportDialog = ref(false)
const exporting = ref(false)

// Stats
const statsData = reactive({
  total_logs: 0,
  logs_today: 0,
  logs_this_week: 0,
  logs_this_month: 0,
  average_execution_time: 0,
})

// Filters
const filters = reactive({
  search: '',
  action: null,
  audit_category: null,
  severity: null,
  entity_type: null,
  start_date: '',
  end_date: '',
  user_id: '',
})

// Lifecycle
onMounted(() => loadLogs())

// Methods
async function loadLogs(): Promise<void> {
  isLoading.value = true
  try {
    await auditStore.loadLogs({
      ...filters,
      page: currentPage.value,
    } as any)
    updateStats()
  } catch (error) {
    console.error('Failed to load logs:', error)
    $q.notify({ type: 'negative', message: 'Failed to load audit logs' })
  } finally {
    isLoading.value = false
  }
}

function updateStats(): void {
  const data = logs.value
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 7)
  const monthStart = new Date(now)
  monthStart.setMonth(now.getMonth() - 1)

  statsData.total_logs = data.length
  statsData.logs_today = data.filter(
    (l: any) => l.created_at && new Date(l.created_at) >= today
  ).length
  statsData.logs_this_week = data.filter(
    (l: any) => l.created_at && new Date(l.created_at) >= weekStart
  ).length
  statsData.logs_this_month = data.filter(
    (l: any) => l.created_at && new Date(l.created_at) >= monthStart
  ).length
  statsData.average_execution_time =
    data.reduce((sum: number, l: any) => sum + (l.execution_time_ms || 0), 0) / (data.length || 1)
}

function handleSearch(value: string): void {
  filters.search = value
  currentPage.value = 1
  loadLogs()
}

function clearSearch(): void {
  filters.search = ''
  currentPage.value = 1
  loadLogs()
}

function handleFilterChange(filterValues: any): void {
  Object.assign(filters, filterValues)
  currentPage.value = 1
  loadLogs()
}

async function handleExport(exportData: {
  audit_category?: string
  start_date?: string
  end_date?: string
  format: string
}): Promise<void> {
  exporting.value = true
  try {
    await auditStore.exportLogs(exportData)
    $q.notify({ type: 'positive', message: 'Audit logs exported successfully' })
    showExportDialog.value = false
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Failed to export audit logs' })
  } finally {
    exporting.value = false
  }
}
</script>
