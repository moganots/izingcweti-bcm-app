import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { complianceService } from './../../services/api/compliance/ComplianceService'
import type {
  ComplianceRecord,
  CreateComplianceRecordRequest,
  UpdateComplianceRecordRequest,
  UpdateComplianceStatusRequest,
  AddEvidenceRequest,
  ScheduleAuditRequest,
  ComplianceQueryParams,
  ComplianceStats,
  ComplianceSummary,
  ComplianceGap,
} from './../../models/entities/compliance/compliance.entity'
import {
  ComplianceStatus,
  getComplianceStatusColor,
  getComplianceStatusLabel,
  isAuditOverdue,
  isAuditDueSoon,
} from './../../models/entities/compliance/compliance.entity'

export const useComplianceStore = defineStore('compliance', () => {
  // ============================================
  // State
  // ============================================
  const records = ref<ComplianceRecord[]>([])
  const selectedRecord = ref<ComplianceRecord | null>(null)
  const stats = ref<ComplianceStats | null>(null)
  const summary = ref<ComplianceSummary | null>(null)
  const gaps = ref<ComplianceGap[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = ref(20)

  // ============================================
  // Getters
  // ============================================

  const compliantRecords = computed(() =>
    records.value.filter((r) => r.complianceStatus === ComplianceStatus.COMPLIANT)
  )

  const partiallyCompliantRecords = computed(() =>
    records.value.filter((r) => r.complianceStatus === ComplianceStatus.PARTIALLY_COMPLIANT)
  )

  const nonCompliantRecords = computed(() =>
    records.value.filter((r) => r.complianceStatus === ComplianceStatus.NON_COMPLIANT)
  )

  const notAssessedRecords = computed(() =>
    records.value.filter((r) => r.complianceStatus === ComplianceStatus.NOT_ASSESSED)
  )

  const overdueAudits = computed(() =>
    records.value.filter((r) => isAuditOverdue(r.nextAuditDate))
  )

  const upcomingAudits = computed(() =>
    records.value.filter((r) => isAuditDueSoon(r.nextAuditDate, 30))
  )

  const complianceRate = computed(() => {
    if (records.value.length === 0) return 0
    const compliant = compliantRecords.value.length
    return Math.round((compliant / records.value.length) * 100)
  })

  const recordsByStandard = computed(() => {
    const grouped: Record<string, ComplianceRecord[]> = {}
    records.value.forEach((record) => {
      const standard = record.complianceStandard || 'Unknown'
      if (!grouped[standard]) grouped[standard] = []
      grouped[standard].push(record)
    })
    return grouped
  })

  const recordsByStatus = computed(() => {
    const grouped: Record<string, ComplianceRecord[]> = {}
    records.value.forEach((record) => {
      const status = record.complianceStatus || 'Unknown'
      if (!grouped[status]) grouped[status] = []
      grouped[status].push(record)
    })
    return grouped
  })

  const hasRecords = computed(() => records.value.length > 0)
  const isEmpty = computed(() => records.value.length === 0 && !isLoading.value)
  const needsAttention = computed(() => nonCompliantRecords.value.length > 0 || overdueAudits.value.length > 0)

  // ============================================
  // Actions - CRUD Operations
  // ============================================

  async function loadRecords(params?: ComplianceQueryParams): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await complianceService.getRecords({
        ...params,
        page: currentPage.value,
        limit: itemsPerPage.value,
      })
      records.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      console.error('Failed to load compliance records:', err)
      error.value = err.message || 'Failed to load compliance records'
    } finally {
      isLoading.value = false
    }
  }

  async function loadRecord(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      selectedRecord.value = await complianceService.getRecord(id)
    } catch (err: any) {
      console.error('Failed to load compliance record:', err)
      error.value = err.message || 'Failed to load compliance record'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createRecord(data: CreateComplianceRecordRequest): Promise<ComplianceRecord> {
    isSaving.value = true
    error.value = null

    try {
      const created = await complianceService.createRecord(data)
      records.value.unshift(created)
      await loadStats()
      return created
    } catch (err: any) {
      console.error('Failed to create compliance record:', err)
      error.value = err.message || 'Failed to create compliance record'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function updateRecord(id: string, data: UpdateComplianceRecordRequest): Promise<ComplianceRecord> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await complianceService.updateRecord(id, data)
      updateLocalRecord(id, updated)
      await loadStats()
      return updated
    } catch (err: any) {
      console.error('Failed to update compliance record:', err)
      error.value = err.message || 'Failed to update compliance record'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function deleteRecord(id: string): Promise<void> {
    isSaving.value = true
    error.value = null

    try {
      await complianceService.deleteRecord(id)
      records.value = records.value.filter((r) => r.uuid !== id)
      if (selectedRecord.value?.uuid === id) {
        selectedRecord.value = null
      }
      await loadStats()
    } catch (err: any) {
      console.error('Failed to delete compliance record:', err)
      error.value = err.message || 'Failed to delete compliance record'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  // ============================================
  // Actions - Status & Audit Operations
  // ============================================

  async function updateStatus(id: string, data: UpdateComplianceStatusRequest): Promise<ComplianceRecord> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await complianceService.updateStatus(id, data)
      updateLocalRecord(id, updated)
      await loadStats()
      return updated
    } catch (err: any) {
      console.error('Failed to update compliance status:', err)
      error.value = err.message || 'Failed to update compliance status'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function bulkUpdateStatus(ids: string[], status: ComplianceStatus): Promise<{ updated: number }> {
    isSaving.value = true
    error.value = null

    try {
      const result = await complianceService.bulkUpdateStatus({ ids, complianceStatus: status })
      await loadRecords()
      await loadStats()
      return result
    } catch (err: any) {
      console.error('Failed to bulk update compliance status:', err)
      error.value = err.message || 'Failed to bulk update compliance status'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function scheduleAudit(id: string, nextAuditDate: string | Date): Promise<ComplianceRecord> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await complianceService.scheduleAudit(id, { nextAuditDate })
      updateLocalRecord(id, updated)
      return updated
    } catch (err: any) {
      console.error('Failed to schedule audit:', err)
      error.value = err.message || 'Failed to schedule audit'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function addEvidence(id: string, links: string[]): Promise<ComplianceRecord> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await complianceService.addEvidence(id, { evidenceLinks: links })
      updateLocalRecord(id, updated)
      return updated
    } catch (err: any) {
      console.error('Failed to add evidence:', err)
      error.value = err.message || 'Failed to add evidence'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function removeEvidence(id: string, index: number): Promise<ComplianceRecord> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await complianceService.removeEvidence(id, index)
      updateLocalRecord(id, updated)
      return updated
    } catch (err: any) {
      console.error('Failed to remove evidence:', err)
      error.value = err.message || 'Failed to remove evidence'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  // ============================================
  // Actions - Query Operations
  // ============================================

  async function loadRecordsByOrganisation(organisationId: string, params?: ComplianceQueryParams): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await complianceService.getRecordsByOrganisation(organisationId, {
        ...params,
        page: currentPage.value,
        limit: itemsPerPage.value,
      })
      records.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      console.error('Failed to load compliance records by organisation:', err)
      error.value = err.message || 'Failed to load compliance records'
    } finally {
      isLoading.value = false
    }
  }

  async function loadRecordsByStandard(standard: string, params?: ComplianceQueryParams): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await complianceService.getRecordsByStandard(
        standard as any,
        {
          ...params,
          page: currentPage.value,
          limit: itemsPerPage.value,
        }
      )
      records.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      console.error('Failed to load compliance records by standard:', err)
      error.value = err.message || 'Failed to load compliance records'
    } finally {
      isLoading.value = false
    }
  }

  async function loadOverdueAudits(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await complianceService.getOverdueAudits({
        page: currentPage.value,
        limit: itemsPerPage.value,
      })
      records.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      console.error('Failed to load overdue audits:', err)
      error.value = err.message || 'Failed to load overdue audits'
    } finally {
      isLoading.value = false
    }
  }

  async function loadUpcomingAudits(days: number = 30): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await complianceService.getUpcomingAudits(days, {
        page: currentPage.value,
        limit: itemsPerPage.value,
      })
      records.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      console.error('Failed to load upcoming audits:', err)
      error.value = err.message || 'Failed to load upcoming audits'
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // Actions - Statistics
  // ============================================

  async function loadStats(organisationId?: string): Promise<void> {
    try {
      stats.value = await complianceService.getStats(organisationId)
    } catch (err: any) {
      console.error('Failed to load compliance stats:', err)
      error.value = err.message || 'Failed to load compliance stats'
    }
  }

  async function loadSummary(organisationId?: string): Promise<void> {
    try {
      summary.value = await complianceService.getSummary(organisationId)
    } catch (err: any) {
      console.error('Failed to load compliance summary:', err)
      error.value = err.message || 'Failed to load compliance summary'
    }
  }

  async function loadGaps(organisationId?: string): Promise<void> {
    try {
      gaps.value = await complianceService.getGapAnalysis(organisationId)
    } catch (err: any) {
      console.error('Failed to load compliance gaps:', err)
      error.value = err.message || 'Failed to load compliance gaps'
    }
  }

  // ============================================
  // Actions - Export
  // ============================================

  async function exportRecords(params?: {
    standard?: string
    status?: string
    format?: 'csv' | 'json'
  }): Promise<void> {
    try {
      await complianceService.exportRecords(params as any)
    } catch (err: any) {
      console.error('Failed to export compliance records:', err)
      error.value = err.message || 'Failed to export compliance records'
      throw err
    }
  }

  // ============================================
  // Actions - Pagination
  // ============================================

  async function setPage(page: number): Promise<void> {
    currentPage.value = page
    await loadRecords()
  }

  function setItemsPerPage(limit: number): void {
    itemsPerPage.value = limit
    currentPage.value = 1
  }

  // ============================================
  // Actions - Reset
  // ============================================

  function clearSelection(): void {
    selectedRecord.value = null
  }

  function clearAll(): void {
    records.value = []
    selectedRecord.value = null
    stats.value = null
    summary.value = null
    gaps.value = []
    error.value = null
    currentPage.value = 1
    totalPages.value = 1
    totalItems.value = 0
  }

  function resetError(): void {
    error.value = null
  }

  // ============================================
  // Private Helpers
  // ============================================

  function updateLocalRecord(id: string, updated: ComplianceRecord): void {
    const index = records.value.findIndex((r) => r.uuid === id)
    if (index !== -1) {
      records.value[index] = updated
    }
    if (selectedRecord.value?.uuid === id) {
      selectedRecord.value = updated
    }
  }

  // ============================================
  // Return Store Interface
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

    // CRUD Operations
    loadRecords,
    loadRecord,
    createRecord,
    updateRecord,
    deleteRecord,

    // Status & Audit Operations
    updateStatus,
    bulkUpdateStatus,
    scheduleAudit,
    addEvidence,
    removeEvidence,

    // Query Operations
    loadRecordsByOrganisation,
    loadRecordsByStandard,
    loadOverdueAudits,
    loadUpcomingAudits,

    // Statistics
    loadStats,
    loadSummary,
    loadGaps,

    // Export
    exportRecords,

    // Pagination
    setPage,
    setItemsPerPage,

    // Reset
    clearSelection,
    clearAll,
    resetError,
  }
})