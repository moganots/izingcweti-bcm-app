// src/composables/useCompliance.ts

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
  ComplianceStats,
  ComplianceSummary,
  ComplianceGap,
} from '../models/entities/compliance/compliance.entity'
import {
  ComplianceStatus,
  getComplianceStatusColor,
  getComplianceStatusLabel,
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
  const { organisationId: authOrgId, isAuthenticated } = useAuth()

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
  const currentOrganisationId = computed(() => defaultOrgId || authOrgId.value)

  // ============================================
  // Computed Getters - Derived Metrics
  // ============================================

  const totalRecords = computed(() => records.value?.length || 0)
  const compliantCount = computed(() => compliantRecords.value?.length || 0)
  const nonCompliantCount = computed(() => nonCompliantRecords.value?.length || 0)
  const overdueCount = computed(() => overdueAudits.value?.length || 0)
  const upcomingCount = computed(() => upcomingAudits.value?.length || 0)

  const overallHealth = computed(() => {
    const total = totalRecords.value
    if (total === 0) return 0
    const compliant = compliantCount.value
    const partially = partiallyCompliantRecords.value?.length || 0
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
    partiallyCompliant: partiallyCompliantRecords.value?.length || 0,
    nonCompliant: nonCompliantCount.value,
    notAssessed: notAssessedRecords.value?.length || 0,
  }))

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
  async function load(params?: ComplianceQueryParams): Promise<void> {
    await loadRecords({
      ...params,
      organisationId: params?.organisationId || currentOrganisationId.value,
    })
  }

  /**
   * Refresh all compliance data
   */
  async function refresh(): Promise<void> {
    await loadAll()
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
   * Check if audit is overdue
   */
  function isOverdue(date: string | Date): boolean {
    if (!date) return false
    return new Date(date) < new Date()
  }

  // ============================================
  // Lifecycle
  // ============================================

  onMounted(async () => {
    if (autoLoad && isAuthenticated.value && currentOrganisationId.value) {
      await loadAll()
      isInitialLoad.value = false

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
    nonCompliantCount,
    overdueCount,
    upcomingCount,
    overallHealth,
    healthStatus,
    statusSummary,

    // Actions - Load
    loadAll,
    load,
    refresh,
    loadRecord,
    loadRecordsByOrganisation,
    loadRecordsByStandard,
    loadOverdueAudits,
    loadUpcomingAudits,
    loadStats,
    loadSummary,
    loadGaps,

    // Actions - CRUD
    createRecord,
    updateRecord,
    deleteRecord,

    // Actions - Status & Audit
    updateStatus,
    bulkUpdateStatus,
    scheduleAudit,
    addEvidence,
    removeEvidence,

    // Actions - Export
    exportRecords,

    // Actions - Pagination
    setPage,
    setItemsPerPage,

    // Actions - Utilities
    clear,
    clearSelection,
    resetError,
    startAutoRefresh,
    stopAutoRefresh,

    // Helpers
    getStatusColor,
    getStatusLabel,
    isOverdue,

    // Lifecycle
    isInitialLoad,
    currentOrganisationId,
  }
}

export default useCompliance