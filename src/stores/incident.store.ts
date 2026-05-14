import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Incident, IncidentStats } from '../models/entities/incident.entity'
import {
  incidentService,
  type CreateIncidentDTO,
  type UpdateIncidentDTO,
  type CloseIncidentDTO,
} from '../services/api/IncidentService'
import type { IncidentQueryParams } from './../types/bcm.types'

export const useIncidentStore = defineStore('incident', () => {
  // ============================================
  // State
  // ============================================
  const incidents = ref<Incident[]>([])
  const selectedIncident = ref<Incident | null>(null)
  const stats = ref<IncidentStats | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)

  // ============================================
  // Getters
  // ============================================
  const activeIncidents = computed(() => incidents.value.filter((i) => !i.closed_at))

  const closedIncidents = computed(() => incidents.value.filter((i) => !!i.closed_at))

  const criticalIncidents = computed(() =>
    activeIncidents.value.filter((i) => i.incident_severity === 'Critical')
  )

  const highSeverityIncidents = computed(() =>
    activeIncidents.value.filter(
      (i) => i.incident_severity === 'Critical' || i.incident_severity === 'High'
    )
  )

  const incidentsBySeverity = computed(() => {
    const grouped: Record<string, Incident[]> = {}
    incidents.value.forEach((i) => {
      const severity = i.incident_severity || 'Unknown'
      if (!grouped[severity]) grouped[severity] = []
      grouped[severity].push(i)
    })
    return grouped
  })

  const averageResolutionTime = computed(() => {
    const closed = closedIncidents.value.filter((i) => i.declared_at && i.closed_at)
    if (closed.length === 0) return 0

    const totalMs = closed.reduce((sum, i) => {
      const declared = new Date(i.declared_at).getTime()
      const closed = new Date(i.closed_at!).getTime()
      return sum + (closed - declared)
    }, 0)

    return Math.round((totalMs / closed.length / (1000 * 60 * 60)) * 100) / 100 // Hours
  })

  const hasActiveIncidents = computed(() => activeIncidents.value.length > 0)
  const hasCriticalIncidents = computed(() => criticalIncidents.value.length > 0)

  // ============================================
  // Actions
  // ============================================

  /**
   * Load incidents with optional filters
   */
  async function loadIncidents(filters?: IncidentQueryParams): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await incidentService.getIncidents({
        ...filters,
        page: currentPage.value,
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

  /**
   * Load a single incident by ID
   */
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

  /**
   * Load incident statistics
   */
  async function loadStats(organisationId?: string): Promise<void> {
    try {
      const data = await incidentService.getStats(organisationId)
      stats.value = data
    } catch (err: any) {
      console.error('Failed to load incident stats:', err)
    }
  }

  /**
   * Load active incidents only
   */
  async function loadActiveIncidents(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await incidentService.getActiveIncidents({
        page: currentPage.value,
      })
      incidents.value = response.data || []
      totalPages.value = response.totalPages || 1
    } catch (err: any) {
      console.error('Failed to load active incidents:', err)
      error.value = err.message || 'Failed to load active incidents'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load critical incidents only
   */
  async function loadCriticalIncidents(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await incidentService.getCriticalIncidents()
      incidents.value = response.data || []
      totalPages.value = response.totalPages || 1
    } catch (err: any) {
      console.error('Failed to load critical incidents:', err)
      error.value = err.message || 'Failed to load critical incidents'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new incident
   */
  async function createIncident(data: CreateIncidentDTO): Promise<Incident> {
    isSaving.value = true
    error.value = null

    try {
      const created = await incidentService.createIncident(data)
      // Add to local list
      incidents.value.unshift(created)
      // Refresh stats
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

  /**
   * Update an incident
   */
  async function updateIncident(id: string, data: UpdateIncidentDTO): Promise<Incident> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await incidentService.updateIncident(id, data)
      // Update in local list
      const index = incidents.value.findIndex((i) => i.uuid === id)
      if (index !== -1) {
        incidents.value[index] = updated
      }
      // Update selected if viewing
      if (selectedIncident.value?.uuid === id) {
        selectedIncident.value = updated
      }
      return updated
    } catch (err: any) {
      console.error('Failed to update incident:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to update incident'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Close an incident
   */
  async function closeIncident(id: string, data: CloseIncidentDTO): Promise<Incident> {
    isSaving.value = true
    error.value = null

    try {
      const closed = await incidentService.closeIncident(id, data)
      // Update in local list
      const index = incidents.value.findIndex((i) => i.uuid === id)
      if (index !== -1) {
        incidents.value[index] = closed
      }
      // Update selected if viewing
      if (selectedIncident.value?.uuid === id) {
        selectedIncident.value = closed
      }
      // Refresh stats
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

  /**
   * Reopen a closed incident
   */
  async function reopenIncident(id: string): Promise<Incident> {
    isSaving.value = true
    error.value = null

    try {
      const reopened = await incidentService.reopenIncident(id)
      // Update in local list
      const index = incidents.value.findIndex((i) => i.uuid === id)
      if (index !== -1) {
        incidents.value[index] = reopened
      }
      // Update selected if viewing
      if (selectedIncident.value?.uuid === id) {
        selectedIncident.value = reopened
      }
      // Refresh stats
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

  /**
   * Escalate an incident
   */
  async function escalateIncident(id: string): Promise<Incident> {
    isSaving.value = true
    error.value = null

    try {
      const escalated = await incidentService.escalateIncident(id)
      // Update in local list
      const index = incidents.value.findIndex((i) => i.uuid === id)
      if (index !== -1) {
        incidents.value[index] = escalated
      }
      // Update selected if viewing
      if (selectedIncident.value?.uuid === id) {
        selectedIncident.value = escalated
      }
      return escalated
    } catch (err: any) {
      console.error('Failed to escalate incident:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to escalate incident'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Set current page and reload
   */
  async function setPage(page: number): Promise<void> {
    currentPage.value = page
    await loadIncidents()
  }

  /**
   * Clear selected incident
   */
  function clearSelection(): void {
    selectedIncident.value = null
  }

  /**
   * Clear all incident data
   */
  function clearAll(): void {
    incidents.value = []
    selectedIncident.value = null
    stats.value = null
    error.value = null
    currentPage.value = 1
    totalPages.value = 1
    totalItems.value = 0
  }

  return {
    // State
    incidents,
    selectedIncident,
    stats,
    isLoading,
    isSaving,
    error,
    currentPage,
    totalPages,
    totalItems,
    // Getters
    activeIncidents,
    closedIncidents,
    criticalIncidents,
    highSeverityIncidents,
    incidentsBySeverity,
    averageResolutionTime,
    hasActiveIncidents,
    hasCriticalIncidents,
    // Actions
    loadIncidents,
    loadIncident,
    loadStats,
    loadActiveIncidents,
    loadCriticalIncidents,
    createIncident,
    updateIncident,
    closeIncident,
    reopenIncident,
    escalateIncident,
    setPage,
    clearSelection,
    clearAll,
  }
})
