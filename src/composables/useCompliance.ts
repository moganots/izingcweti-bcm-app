import { computed, onMounted, watch, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useComplianceStore } from '../stores/compliance/compliance.store'
import { useAuth } from './useAuth'
import {
  ComplianceStatus,
  getComplianceStatusColor,
  getComplianceStatusLabel,
  getComplianceStandardLabel,
  getComplianceStandardColor,
  isAuditOverdue,
  isAuditDueSoon,
  calculateComplianceRate,
} from '../models/compliance/compliance.entity'

export interface UseComplianceOptions {
  autoLoad?: boolean
  organisationId?: string
  refreshInterval?: number
}

/**
 * Compliance composable
 * Aligned with useComplianceStore
 */
export function useCompliance(options: UseComplianceOptions = {}) {
  const { autoLoad = true, organisationId: defaultOrgId, refreshInterval } = options

  const complianceStore = useComplianceStore()
  const { userOrganisationId, isAuthenticated } = useAuth()

  const {
    records,
    stats,
    compliantRecords,
    partiallyCompliantRecords,
    nonCompliantRecords,
    notAssessedRecords,
    overdueAudits,
    upcomingAudits,
    complianceRate,
    recordsByStandard,
    recordsByStatus,
    needsAttention,
  } = storeToRefs(complianceStore)

  const refreshTimer = ref<number | null>(null)
  const isInitialLoad = ref(true)

  const currentOrganisationId = computed(
    () => defaultOrgId || userOrganisationId.value
  )

  const totalRecords = computed(() => records.value?.length ?? 0)
  const overdueCount = computed(() => overdueAudits.value?.length ?? 0)
  const upcomingCount = computed(() => upcomingAudits.value?.length ?? 0)

  // ============================================
  // Actions
  // ============================================
  async function loadAll(): Promise<void> {
    await complianceStore.initialize()
  }

  async function refresh(): Promise<void> {
    await complianceStore.refreshStats()
    await loadAll()
  }

  function startAutoRefresh(intervalMs: number = refreshInterval || 60000): void {
    stopAutoRefresh()
    refreshTimer.value = window.setInterval(() => refresh().catch(console.error), intervalMs)
  }

  function stopAutoRefresh(): void {
    if (refreshTimer.value) {
      clearInterval(refreshTimer.value)
      refreshTimer.value = null
    }
  }

  // ============================================
  // Helpers
  // ============================================
  function getStatusColor(status: string): string {
    return getComplianceStatusColor(status)
  }

  function getStatusLabel(status: string): string {
    return getComplianceStatusLabel(status)
  }

  function getStandardLabel(standard: string): string {
    return getComplianceStandardLabel(standard)
  }

  function getStandardColor(standard: string): string {
    return getComplianceStandardColor(standard)
  }

  function isOverdue(date: string | Date): boolean {
    return isAuditOverdue(new Date(date))
  }

  function isDueSoon(date: string | Date, days = 30): boolean {
    return isAuditDueSoon(new Date(date), days)
  }

  function calculateRate(compliant: number, total: number): number {
    return calculateComplianceRate(compliant, total)
  }

  // ============================================
  // Lifecycle
  // ============================================
  onMounted(async () => {
    if (autoLoad && isAuthenticated.value && currentOrganisationId.value) {
      await loadAll()
      isInitialLoad.value = false
      if (refreshInterval) startAutoRefresh(refreshInterval)
    }
  })

  watch(isAuthenticated, async (auth) => {
    if (auth && currentOrganisationId.value) {
      await loadAll()
      if (refreshInterval) startAutoRefresh(refreshInterval)
    } else if (!auth) {
      stopAutoRefresh()
    }
  })

  // ============================================
  // Return API
  // ============================================
  return {
    // State
    records,
    stats,
    isLoading: complianceStore.recordStore.loading,
    error: complianceStore.recordStore.error,

    // Getters
    compliantRecords,
    partiallyCompliantRecords,
    nonCompliantRecords,
    notAssessedRecords,
    overdueAudits,
    upcomingAudits,
    complianceRate,
    recordsByStandard,
    recordsByStatus,
    needsAttention,
    totalRecords,
    overdueCount,
    upcomingCount,

    // Actions
    loadAll,
    refresh,
    refreshStats: complianceStore.refreshStats,
    updateStatus: complianceStore.updateStatus,
    bulkUpdateStatus: complianceStore.bulkUpdateStatus,
    scheduleAudit: complianceStore.scheduleAudit,
    addEvidence: complianceStore.addEvidence,
    // removeEvidence: complianceStore.removeEvidence,
    reset: complianceStore.$reset,

    // Auto-refresh
    startAutoRefresh,
    stopAutoRefresh,

    // Helpers
    getStatusColor,
    getStatusLabel,
    getStandardLabel,
    getStandardColor,
    isOverdue,
    isDueSoon,
    calculateRate,

    // Utils
    isInitialLoad,
    currentOrganisationId,
    ComplianceStatus,
  }
}

export default useCompliance