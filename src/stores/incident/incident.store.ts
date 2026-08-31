import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { incidentService } from './../../services/api/incident/IncidentService'
import type {
  Incident,
  IncidentStats,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  CloseIncidentRequest,
  EscalateIncidentRequest,
  AssignIncidentRequest,
  AcknowledgeIncidentRequest,
  AddIncidentUpdateRequest,
  IncidentQueryParams,
  IncidentDashboardStats,
  IncidentTimeline,
  IncidentRecoveryMetrics,
} from './../../models/entities/incident/incident.entity'
import {
  IncidentSeverity,
  IncidentStatus,
  EscalationLevel,
  getIncidentSeverityLabel,
  getIncidentSeverityColor,
  getIncidentStatusLabel,
  getIncidentStatusColor,
  getEscalationLevelLabel,
  calculateResolutionTime,
} from './../../models/entities/incident/incident.entity'

export const useIncidentStore = defineStore('incident', () => {
  // ============================================
  // State
  // ============================================
  const incidents = ref<Incident[]>([])
  const selectedIncident = ref<Incident | null>(null)
  const incidentTimeline = ref<IncidentTimeline | null>(null)
  const recoveryMetrics = ref<IncidentRecoveryMetrics | null>(null)
  const stats = ref<IncidentDashboardStats | null>(null)
  const summary = ref<IncidentStats | null>(null)
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

  const activeIncidents = computed(() =>
    incidents.value.filter((i) => i.incidentStatus === IncidentStatus.OPEN ||
      i.incidentStatus === IncidentStatus.INVESTIGATING ||
      i.incidentStatus === IncidentStatus.ESCALATED)
  )

  const closedIncidents = computed(() =>
    incidents.value.filter((i) => i.incidentStatus === IncidentStatus.CLOSED ||
      i.incidentStatus === IncidentStatus.RESOLVED)
  )

  const criticalIncidents = computed(() =>
    activeIncidents.value.filter((i) => i.incidentSeverity === IncidentSeverity.CRITICAL)
  )

  const highSeverityIncidents = computed(() =>
    activeIncidents.value.filter((i) =>
      i.incidentSeverity === IncidentSeverity.CRITICAL ||
      i.incidentSeverity === IncidentSeverity.HIGH
    )
  )

  const escalatedIncidents = computed(() =>
    incidents.value.filter((i) => i.escalationLevel !== EscalationLevel.NO_ESCALATION)
  )

  const incidentsBySeverity = computed(() => {
    const grouped: Record<string, Incident[]> = {}
    incidents.value.forEach((i) => {
      const severity = i.incidentSeverity || 'Unknown'
      if (!grouped[severity]) grouped[severity] = []
      grouped[severity].push(i)
    })
    return grouped
  })

  const incidentsByStatus = computed(() => {
    const grouped: Record<string, Incident[]> = {}
    incidents.value.forEach((i) => {
      const status = i.incidentStatus || 'Unknown'
      if (!grouped[status]) grouped[status] = []
      grouped[status].push(i)
    })
    return grouped
  })

  const incidentsByEscalationLevel = computed(() => {
    const grouped: Record<string, Incident[]> = {}
    incidents.value.forEach((i) => {
      const level = i.escalationLevel || EscalationLevel.NO_ESCALATION
      if (!grouped[level]) grouped[level] = []
      grouped[level].push(i)
    })
    return grouped
  })

  const averageResolutionTime = computed(() => {
    const closed = closedIncidents.value.filter((i) => i.declaredAt && i.closedAt)
    if (closed.length === 0) return 0

    const totalHours = closed.reduce((sum, i) => {
      const hours = calculateResolutionTime(i.declaredAt, i.closedAt)
      return sum + (hours || 0)
    }, 0)

    return Math.round((totalHours / closed.length) * 100) / 100
  })

  const hasActiveIncidents = computed(() => activeIncidents.value.length > 0)
  const hasCriticalIncidents = computed(() => criticalIncidents.value.length > 0)
  const hasEscalatedIncidents = computed(() => escalatedIncidents.value.length > 0)

  const totalIncidents = computed(() => incidents.value.length)
  const openCount = computed(() => activeIncidents.value.length)
  const closedCount = computed(() => closedIncidents.value.length)

  const isEmpty = computed(() => incidents.value.length === 0 && !isLoading.value)

  // ============================================
  // Actions - Load Operations
  // ============================================

  async function loadIncidents(params?: IncidentQueryParams): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await incidentService.getIncidents({
        ...params,
        page: currentPage.value,
        limit: itemsPerPage.value,
      })

      incidents.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      console.error('Failed to load incidents:', err)
      error.value = err.message || 'Failed to load incidents'
    } finally {
      isLoading.value = false
    }
  }

  async function loadIncident(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const data = await incidentService.getIncident(id)
      selectedIncident.value = data
    } catch (err: any) {
      console.error('Failed to load incident:', err)
      error.value = err.message || 'Failed to load incident'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadIncidentTimeline(id: string): Promise<void> {
    isLoading.value = true

    try {
      incidentTimeline.value = await incidentService.getIncidentTimeline(id)
    } catch (err: any) {
      console.error('Failed to load incident timeline:', err)
      error.value = err.message || 'Failed to load incident timeline'
    } finally {
      isLoading.value = false
    }
  }

  async function loadRecoveryMetrics(id: string): Promise<void> {
    isLoading.value = true

    try {
      recoveryMetrics.value = await incidentService.getRecoveryMetrics(id)
    } catch (err: any) {
      console.error('Failed to load recovery metrics:', err)
      error.value = err.message || 'Failed to load recovery metrics'
    } finally {
      isLoading.value = false
    }
  }

  async function loadStats(organisationId?: string): Promise<void> {
    try {
      stats.value = await incidentService.getStats(organisationId)
    } catch (err: any) {
      console.error('Failed to load incident stats:', err)
    }
  }

  async function loadSummary(organisationId?: string): Promise<void> {
    try {
      summary.value = await incidentService.getSummary(organisationId)
    } catch (err: any) {
      console.error('Failed to load incident summary:', err)
    }
  }

  // ============================================
  // Actions - Filtered Loads
  // ============================================

  async function loadActiveIncidents(params?: { page?: number; limit?: number }): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await incidentService.getActiveIncidents({
        ...params,
        page: currentPage.value,
        limit: itemsPerPage.value,
      })
      incidents.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      console.error('Failed to load active incidents:', err)
      error.value = err.message || 'Failed to load active incidents'
    } finally {
      isLoading.value = false
    }
  }

  async function loadClosedIncidents(params?: { page?: number; limit?: number }): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await incidentService.getClosedIncidents({
        ...params,
        page: currentPage.value,
        limit: itemsPerPage.value,
      })
      incidents.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      console.error('Failed to load closed incidents:', err)
      error.value = err.message || 'Failed to load closed incidents'
    } finally {
      isLoading.value = false
    }
  }

  async function loadCriticalIncidents(params?: { page?: number; limit?: number }): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await incidentService.getCriticalIncidents({
        ...params,
        page: currentPage.value,
        limit: itemsPerPage.value,
      })
      incidents.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      console.error('Failed to load critical incidents:', err)
      error.value = err.message || 'Failed to load critical incidents'
    } finally {
      isLoading.value = false
    }
  }

  async function loadIncidentsByOrganisation(
    organisationId: string,
    params?: IncidentQueryParams
  ): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await incidentService.getIncidentsByOrganisation(organisationId, {
        ...params,
        page: currentPage.value,
        limit: itemsPerPage.value,
      })
      incidents.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      console.error('Failed to load incidents by organisation:', err)
      error.value = err.message || 'Failed to load incidents'
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // Actions - CRUD Operations
  // ============================================

  async function createIncident(data: CreateIncidentRequest): Promise<Incident> {
    isSaving.value = true
    error.value = null

    try {
      const created = await incidentService.createIncident(data)
      incidents.value.unshift(created)
      await loadStats()
      return created
    } catch (err: any) {
      console.error('Failed to create incident:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to create incident'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function updateIncident(id: string, data: UpdateIncidentRequest): Promise<Incident> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await incidentService.updateIncident(id, data)
      updateLocalIncident(updated)
      return updated
    } catch (err: any) {
      console.error('Failed to update incident:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to update incident'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function deleteIncident(id: string): Promise<void> {
    isSaving.value = true
    error.value = null

    try {
      await incidentService.deleteIncident(id)
      incidents.value = incidents.value.filter((i) => i.uuid !== id)
      if (selectedIncident.value?.uuid === id) {
        selectedIncident.value = null
      }
      await loadStats()
    } catch (err: any) {
      console.error('Failed to delete incident:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to delete incident'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  // ============================================
  // Actions - Incident Actions
  // ============================================

  async function closeIncident(id: string, data: CloseIncidentRequest): Promise<Incident> {
    isSaving.value = true
    error.value = null

    try {
      const closed = await incidentService.closeIncident(id, data)
      updateLocalIncident(closed)
      await loadStats()
      return closed
    } catch (err: any) {
      console.error('Failed to close incident:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to close incident'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function reopenIncident(id: string): Promise<Incident> {
    isSaving.value = true
    error.value = null

    try {
      const reopened = await incidentService.reopenIncident(id)
      updateLocalIncident(reopened)
      await loadStats()
      return reopened
    } catch (err: any) {
      console.error('Failed to reopen incident:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to reopen incident'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function escalateIncident(id: string, data: EscalateIncidentRequest): Promise<Incident> {
    isSaving.value = true
    error.value = null

    try {
      const escalated = await incidentService.escalateIncident(id, data)
      updateLocalIncident(escalated)
      return escalated
    } catch (err: any) {
      console.error('Failed to escalate incident:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to escalate incident'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function assignIncident(id: string, data: AssignIncidentRequest): Promise<Incident> {
    isSaving.value = true
    error.value = null

    try {
      const assigned = await incidentService.assignIncident(id, data)
      updateLocalIncident(assigned)
      return assigned
    } catch (err: any) {
      console.error('Failed to assign incident:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to assign incident'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function acknowledgeIncident(id: string, data: AcknowledgeIncidentRequest): Promise<Incident> {
    isSaving.value = true
    error.value = null

    try {
      const acknowledged = await incidentService.acknowledgeIncident(id, data)
      updateLocalIncident(acknowledged)
      return acknowledged
    } catch (err: any) {
      console.error('Failed to acknowledge incident:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to acknowledge incident'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function addIncidentUpdate(id: string, data: AddIncidentUpdateRequest): Promise<Incident> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await incidentService.addIncidentUpdate(id, data)
      updateLocalIncident(updated)
      return updated
    } catch (err: any) {
      console.error('Failed to add incident update:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to add incident update'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  // ============================================
  // Actions - Pagination & Reset
  // ============================================

  async function setPage(page: number): Promise<void> {
    currentPage.value = page
    await loadIncidents()
  }

  function setItemsPerPage(limit: number): void {
    itemsPerPage.value = limit
    currentPage.value = 1
  }

  function clearSelection(): void {
    selectedIncident.value = null
    incidentTimeline.value = null
    recoveryMetrics.value = null
  }

  function clearAll(): void {
    incidents.value = []
    selectedIncident.value = null
    incidentTimeline.value = null
    recoveryMetrics.value = null
    stats.value = null
    summary.value = null
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

  function updateLocalIncident(updated: Incident): void {
    const index = incidents.value.findIndex((i) => i.uuid === updated.uuid)
    if (index !== -1) {
      incidents.value[index] = updated
    }
    if (selectedIncident.value?.uuid === updated.uuid) {
      selectedIncident.value = updated
    }
  }

  // ============================================
  // Return Store Interface
  // ============================================

  return {
    // State
    incidents,
    selectedIncident,
    incidentTimeline,
    recoveryMetrics,
    stats,
    summary,
    isLoading,
    isSaving,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,

    // Getters
    activeIncidents,
    closedIncidents,
    criticalIncidents,
    highSeverityIncidents,
    escalatedIncidents,
    incidentsBySeverity,
    incidentsByStatus,
    incidentsByEscalationLevel,
    averageResolutionTime,
    hasActiveIncidents,
    hasCriticalIncidents,
    hasEscalatedIncidents,
    totalIncidents,
    openCount,
    closedCount,
    isEmpty,

    // Load Operations
    loadIncidents,
    loadIncident,
    loadIncidentTimeline,
    loadRecoveryMetrics,
    loadStats,
    loadSummary,

    // Filtered Loads
    loadActiveIncidents,
    loadClosedIncidents,
    loadCriticalIncidents,
    loadIncidentsByOrganisation,

    // CRUD Operations
    createIncident,
    updateIncident,
    deleteIncident,

    // Incident Actions
    closeIncident,
    reopenIncident,
    escalateIncident,
    assignIncident,
    acknowledgeIncident,
    addIncidentUpdate,

    // Pagination
    setPage,
    setItemsPerPage,

    // Reset
    clearSelection,
    clearAll,
    resetError,
  }
})