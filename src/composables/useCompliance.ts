import { computed, watch, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useComplianceStore } from '../stores/compliance/compliance.store'
import { useAuth } from './useAuth'
import type {
  ComplianceRecord,
  CreateComplianceRecordRequest,
  UpdateComplianceRecordRequest,
  UpdateComplianceStatusRequest,
  ComplianceQueryParams,
} from './../models/entities/compliance/compliance.entity'
import {
  ComplianceStatus,
  getComplianceStatusColor,
  getComplianceStatusLabel,
  getComplianceStandardLabel,
  getComplianceStandardColor,
  isAuditOverdue,
  isAuditDueSoon,
  calculateComplianceRate,
} from '../models/entities/compliance/compliance.entity'

export interface UseComplianceOptions {
  autoLoad?: boolean
  organisationId?: string
  refreshInterval?: number
}

/**
 * Composable for Compliance functionality
 * Provides reactive compliance state and operations
 */
export function useCompliance(options: UseComplianceOptions = {}) {
  const { autoLoad = true, organisationId: defaultOrgId, refreshInterval } = options

  const complianceStore = useComplianceStore()
  const { userOrganisationId, isAuthenticated } = useAuth()

  // Store refs for reactivity
  const {
    records,
    selectedRecord,
    stats,
    summary,
    gaps,
    isLoading,
    isSaving,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    compliantRecords,
    partiallyCompliantRecords,
    nonCompliantRecords,
    notAssessedRecords,
    overdueAudits,
    upcomingAudits,
    complianceRate,
    recordsByStandard,
    recordsByStatus,
    hasRecords,
    isEmpty,
    needsAttention,
  } = storeToRefs(complianceStore)

  // Store actions
  const {
    loadRecords,
    loadRecord,
    createRecord,
    updateRecord,
    deleteRecord,
    updateStatus,
    bulkUpdateStatus,
    scheduleAudit,
    addEvidence,
    removeEvidence,
    loadRecordsByOrganisation,
    loadRecordsByStandard,
    loadOverdueAudits,
    loadUpcomingAudits,
    loadStats,
    loadSummary,
    loadGaps,
    exportRecords,
    setPage,
    setItemsPerPage,
    clearSelection,
    clearAll,
    resetError,
  } = complianceStore

  // Local state
  const refreshTimer = ref<number | null>(null)
  const isInitialLoad = ref(true)
  const isReady = ref(false)

  const currentOrganisationId = computed(() => defaultOrgId || userOrganisationId.value)

  // ============================================
  // Computed Getters - Derived Metrics
  // ============================================

  const totalRecords = computed(() => records.value?.length || 0)
  const compliantCount = computed(() => compliantRecords.value?.length || 0)
  const partiallyCompliantCount = computed(() => partiallyCompliantRecords.value?.length || 0)
  const nonCompliantCount = computed(() => nonCompliantRecords.value?.length || 0)
  const notAssessedCount = computed(() => notAssessedRecords.value?.length || 0)
  const overdueCount = computed(() => overdueAudits.value?.length || 0)
  const upcomingCount = computed(() => upcomingAudits.value?.length || 0)

  const overallHealth = computed(() => {
    const total = totalRecords.value
    if (total === 0) return 0
    const compliant = compliantCount.value
    const partially = partiallyCompliantCount.value
    // Weight: compliant = 1, partially = 0.5, non-compliant = 0
    const weightedScore = compliant + (partially * 0.5)
    return Math.round((weightedScore / total) * 100)
  })

  const healthStatus = computed(() => {
    const score = overallHealth.value
    if (score >= 80) return { label: 'Healthy', color: 'positive', icon: 'check_circle' }
    if (score >= 60) return { label: 'Fair', color: 'warning', icon: 'warning' }
    if (score >= 40) return { label: 'Needs Attention', color: 'orange', icon: 'error_outline' }
    return { label: 'Critical', color: 'negative', icon: 'dangerous' }
  })

  const statusSummary = computed(() => ({
    compliant: compliantCount.value,
    partiallyCompliant: partiallyCompliantCount.value,
    nonCompliant: nonCompliantCount.value,
    notAssessed: notAssessedCount.value,
  }))

  const standardSummary = computed(() => {
    const summary: Record<string, { total: number; compliant: number; rate: number }> = {}
    for (const [standard, records] of Object.entries(recordsByStandard.value)) {
      const total = records.length
      const compliant = records.filter((r) => r.complianceStatus === ComplianceStatus.COMPLIANT).length
      summary[standard] = {
        total,
        compliant,
        rate: total > 0 ? Math.round((compliant / total) * 100) : 0,
      }
    }
    return summary
  })

  // ============================================
  // Actions
  // ============================================

  /**
   * Load all compliance data for the current organisation
   */
  async function loadAll(): Promise<void> {
    const orgId = currentOrganisationId.value
    if (!orgId) {
      console.warn('No organisation ID available for compliance data')
      return
    }

    await Promise.all([
      loadRecords({ organisationId: orgId }),
      loadStats(orgId),
      loadSummary(orgId),
      loadGaps(orgId),
    ])
  }

  /**
   * Load compliance records with filters
   */
  async function loadBy(params?: ComplianceQueryParams): Promise<void> {
    await loadRecords({
      ...params,
      organisationId: params?.organisationId || currentOrganisationId.value,
    })
  }

  /**
   * Get a single compliance record by ID
   */
  async function getRecord(id: string): Promise<ComplianceRecord | null> {
    await loadRecord(id)
    return selectedRecord.value
  }

  /**
   * Create a new compliance record
   */
  async function create(data: CreateComplianceRecordRequest): Promise<ComplianceRecord> {
    return await createRecord(data)
  }

  /**
   * Update an existing compliance record
   */
  async function update(id: string, data: UpdateComplianceRecordRequest): Promise<ComplianceRecord> {
    return await updateRecord(id, data)
  }

  /**
   * Delete a compliance record
   */
  async function remove(id: string): Promise<void> {
    await deleteRecord(id)
  }

  /**
   * Update compliance status
   */
  async function updateComplianceStatus(id: string, data: UpdateComplianceStatusRequest): Promise<ComplianceRecord> {
    return await updateStatus(id, data)
  }

  /**
   * Bulk update compliance status
   */
  async function bulkUpdateComplianceStatus(ids: string[], status: ComplianceStatus): Promise<{ updated: number }> {
    return await bulkUpdateStatus(ids, status)
  }

  /**
   * Schedule an audit
   */
  async function scheduleComplianceAudit(id: string, nextAuditDate: string | Date): Promise<ComplianceRecord> {
    return await scheduleAudit(id, nextAuditDate)
  }

  /**
   * Add evidence to a compliance record
   */
  async function addComplianceEvidence(id: string, links: string[]): Promise<ComplianceRecord> {
    return await addEvidence(id, links)
  }

  /**
   * Remove evidence from a compliance record
   */
  async function removeComplianceEvidence(id: string, index: number): Promise<ComplianceRecord> {
    return await removeEvidence(id, index)
  }

  /**
   * Load records by organisation
   */
  async function loadByOrganisation(organisationId: string, params?: ComplianceQueryParams): Promise<void> {
    await loadRecordsByOrganisation(organisationId, params)
  }

  /**
   * Load records by standard
   */
  async function loadByStandard(standard: string, params?: ComplianceQueryParams): Promise<void> {
    await loadRecordsByStandard(standard, params)
  }

  /**
   * Load overdue audits
   */
  async function loadOverdue(_params?: ComplianceQueryParams): Promise<void> {
    await loadOverdueAudits()
  }

  /**
   * Load upcoming audits
   */
  async function loadUpcoming(days: number = 30, _params?: ComplianceQueryParams): Promise<void> {
    await loadUpcomingAudits(days)
  }

  /**
   * Refresh all compliance data
   */
  async function refresh(): Promise<void> {
    await loadAll()
  }

  /**
   * Export compliance records
   */
  async function exportData(params?: { standard?: string; status?: string; format?: 'csv' | 'json' }): Promise<void> {
    await exportRecords(params as any)
  }

  /**
   * Get status color helper
   */
  function getStatusColor(status: string): string {
    return getComplianceStatusColor(status)
  }

  /**
   * Get status label helper
   */
  function getStatusLabel(status: string): string {
    return getComplianceStatusLabel(status)
  }

  /**
   * Get standard label helper
   */
  function getStandardLabel(standard: string): string {
    return getComplianceStandardLabel(standard)
  }

  /**
   * Get standard color helper
   */
  function getStandardColor(standard: string): string {
    return getComplianceStandardColor(standard)
  }

  /**
   * Check if audit is overdue
   */
  function isOverdue(date: string | Date): boolean {
    return isAuditOverdue(date)
  }

  /**
   * Check if audit is due soon
   */
  function isDueSoon(date: string | Date, days: number = 30): boolean {
    return isAuditDueSoon(date, days)
  }

  /**
   * Calculate compliance rate
   */
  function calculateRate(compliant: number, total: number): number {
    return calculateComplianceRate(compliant, total)
  }

  /**
   * Start auto-refresh timer
   */
  function startAutoRefresh(intervalMs: number = refreshInterval || 60000): void {
    stopAutoRefresh()

    refreshTimer.value = window.setInterval(async () => {
      if (!isLoading.value && !isSaving.value) {
        await refresh()
      }
    }, intervalMs)
  }

  /**
   * Stop auto-refresh timer
   */
  function stopAutoRefresh(): void {
    if (refreshTimer.value) {
      clearInterval(refreshTimer.value)
      refreshTimer.value = null
    }
  }

  /**
   * Clear all compliance data
   */
  function clear(): void {
    clearAll()
  }

  /**
   * Clear selection
   */
  function clearSelected(): void {
    clearSelection()
  }

  /**
   * Clear error
   */
  function clearError(): void {
    resetError()
  }

  // ============================================
  // Lifecycle
  // ============================================

  onMounted(async () => {
    if (autoLoad && isAuthenticated.value && currentOrganisationId.value) {
      await loadAll()
      isInitialLoad.value = false
      isReady.value = true

      if (refreshInterval) {
        startAutoRefresh(refreshInterval)
      }
    }
  })

  // Watch for organisation changes
  watch(currentOrganisationId, async (newOrgId, oldOrgId) => {
    if (newOrgId && newOrgId !== oldOrgId && isAuthenticated.value) {
      await loadAll()
    }
  })

  // Watch for authentication changes
  watch(isAuthenticated, async (auth) => {
    if (auth && currentOrganisationId.value) {
      await loadAll()
      if (refreshInterval) {
        startAutoRefresh(refreshInterval)
      }
    } else if (!auth) {
      clear()
      stopAutoRefresh()
    }
  })

  // ============================================
  // Return API
  // ============================================

  return {
    // State
    records,
    selectedRecord,
    stats,
    summary,
    gaps,
    isLoading,
    isSaving,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    isReady,
    isInitialLoad,

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
    hasRecords,
    isEmpty,
    needsAttention,
    totalRecords,
    compliantCount,
    partiallyCompliantCount,
    nonCompliantCount,
    notAssessedCount,
    overdueCount,
    upcomingCount,
    overallHealth,
    healthStatus,
    statusSummary,
    standardSummary,

    // Actions - Load
    loadAll,
    loadBy,
    getRecord,
    loadByOrganisation,
    loadByStandard,
    loadOverdue,
    loadUpcoming,
    loadStats,
    loadSummary,
    loadGaps,
    refresh,

    // Actions - CRUD
    create,
    update,
    remove,
    createRecord,
    updateRecord,
    deleteRecord,

    // Actions - Status & Audit
    updateComplianceStatus,
    bulkUpdateComplianceStatus,
    scheduleComplianceAudit,
    addComplianceEvidence,
    removeComplianceEvidence,
    updateStatus,
    bulkUpdateStatus,
    scheduleAudit,
    addEvidence,
    removeEvidence,

    // Actions - Export
    exportData,
    exportRecords,

    // Actions - Pagination
    setPage,
    setItemsPerPage,

    // Actions - Utilities
    clear,
    clearSelected,
    clearSelection,
    clearError,
    resetError,
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

    // Lifecycle
    currentOrganisationId,
  }
}

export default useCompliance