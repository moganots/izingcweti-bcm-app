import { computed, watch, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useIncidentStore } from '../stores/incident/incident.store'
import { useAuth } from './useAuth'
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
} from '../models/entities/incident/incident.entity'
import {
    IncidentSeverity,
    IncidentStatus,
    EscalationLevel,
    getIncidentSeverityLabel,
    getIncidentSeverityColor,
    getIncidentStatusLabel,
    getIncidentStatusColor,
    getEscalationLevelLabel,
    getEscalationLevelColor,
    calculateResolutionTime,
} from '../models/entities/incident/incident.entity'

export interface UseIncidentOptions {
    autoLoad?: boolean
    organisationId?: string
    refreshInterval?: number
    filterSeverity?: IncidentSeverity
    filterStatus?: IncidentStatus
    filterActiveOnly?: boolean
}

/**
 * Composable for Incident functionality
 * Provides reactive incident state and operations
 */
export function useIncident(options: UseIncidentOptions = {}) {
    const {
        autoLoad = true,
        organisationId: defaultOrgId,
        refreshInterval,
        filterSeverity,
        filterStatus,
        filterActiveOnly,
    } = options

    const incidentStore = useIncidentStore()
    const { organisationId: authOrgId, isAuthenticated } = useAuth()

    // Store refs for reactivity
    const {
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
    } = storeToRefs(incidentStore)

    // Store actions
    const {
        loadIncidents,
        loadIncident,
        loadIncidentTimeline,
        loadRecoveryMetrics,
        loadStats,
        loadSummary,
        loadActiveIncidents,
        loadClosedIncidents,
        loadCriticalIncidents,
        loadIncidentsByOrganisation,
        createIncident,
        updateIncident,
        deleteIncident,
        closeIncident,
        reopenIncident,
        escalateIncident,
        assignIncident,
        acknowledgeIncident,
        addIncidentUpdate,
        setPage,
        setItemsPerPage,
        clearSelection,
        clearAll,
        resetError,
    } = incidentStore

    // Local state
    const refreshTimer = ref<number | null>(null)
    const isInitialLoad = ref(true)
    const isReady = ref(false)
    const currentOrganisationId = computed(() => defaultOrgId || authOrgId.value)

    // ============================================
    // Computed Getters - Derived Metrics
    // ============================================

    const severityDistribution = computed(() => {
        const dist: Record<string, number> = {}
        incidents.value?.forEach((i) => {
            const severity = i.incidentSeverity || 'Unknown'
            dist[severity] = (dist[severity] || 0) + 1
        })
        return dist
    })

    const statusDistribution = computed(() => {
        const dist: Record<string, number> = {}
        incidents.value?.forEach((i) => {
            const status = i.incidentStatus || 'Unknown'
            dist[status] = (dist[status] || 0) + 1
        })
        return dist
    })

    const escalationDistribution = computed(() => {
        const dist: Record<string, number> = {}
        incidents.value?.forEach((i) => {
            const level = i.escalationLevel || EscalationLevel.NO_ESCALATION
            dist[level] = (dist[level] || 0) + 1
        })
        return dist
    })

    const incidentHealth = computed(() => {
        const total = totalIncidents.value
        if (total === 0) return 0

        const resolved = closedIncidents.value?.length || 0
        const investigating = incidents.value?.filter((i) => i.incidentStatus === IncidentStatus.INVESTIGATING).length || 0

        // Weight: resolved = 1, investigating = 0.5, open = 0.25
        const weightedScore = (resolved * 1) + (investigating * 0.5)
        return Math.round((weightedScore / total) * 100)
    })

    const healthStatus = computed(() => {
        const score = incidentHealth.value
        if (score >= 80) return { label: 'Healthy', color: 'positive', icon: 'check_circle' }
        if (score >= 60) return { label: 'Fair', color: 'warning', icon: 'warning' }
        if (score >= 40) return { label: 'Needs Attention', color: 'orange', icon: 'error_outline' }
        return { label: 'Critical', color: 'negative', icon: 'dangerous' }
    })

    const criticalIncidentCount = computed(() => criticalIncidents.value?.length || 0)
    const highSeverityCount = computed(() => highSeverityIncidents.value?.length || 0)
    const escalatedCount = computed(() => escalatedIncidents.value?.length || 0)

    // ============================================
    // Helper Functions
    // ============================================

    function getSeverityLabel(severity: string): string {
        return getIncidentSeverityLabel(severity)
    }

    function getSeverityColor(severity: string): string {
        return getIncidentSeverityColor(severity)
    }

    function getStatusLabel(status: string): string {
        return getIncidentStatusLabel(status)
    }

    function getStatusColor(status: string): string {
        return getIncidentStatusColor(status)
    }

    function getEscalationLabel(level: string): string {
        return getEscalationLevelLabel(level)
    }

    function getEscalationColor(level: string): string {
        return getEscalationLevelColor(level)
    }

    function getResolutionTime(incident: Incident): number | null {
        return calculateResolutionTime(incident.declaredAt, incident.closedAt)
    }

    function formatResolutionTime(hours: number | null): string {
        if (hours === null) return 'N/A'
        if (hours < 1) return `${Math.round(hours * 60)} minutes`
        if (hours < 24) return `${hours.toFixed(1)} hours`
        return `${(hours / 24).toFixed(1)} days`
    }

    // ============================================
    // Actions
    // ============================================

    /**
     * Load all incident data
     */
    async function load(): Promise<void> {
        const orgId = currentOrganisationId.value
        if (!orgId) {
            console.warn('No organisation ID available for incident data')
            return
        }

        const params: IncidentQueryParams = {
            organisationId: orgId,
        }
        if (filterSeverity) params.incidentSeverity = filterSeverity
        if (filterStatus) params.incidentStatus = filterStatus
        if (filterActiveOnly) params.activeOnly = true

        await Promise.all([
            loadIncidents(params),
            loadStats(orgId),
            loadSummary(orgId),
        ])
    }

    /**
     * Load incidents with filters
     */
    async function load(params?: IncidentQueryParams): Promise<void> {
        await loadIncidents({
            ...params,
            organisationId: params?.organisationId || currentOrganisationId.value,
        })
    }

    /**
     * Refresh all incident data
     */
    async function refresh(): Promise<void> {
        await load()
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
     * Clear all incident data
     */
    function clear(): void {
        clearAll()
    }

    // ============================================
    // Lifecycle
    // ============================================

    onMounted(async () => {
        if (autoLoad && isAuthenticated.value && currentOrganisationId.value) {
            await load()
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
            await load()
        }
    })

    // Watch for authentication changes
    watch(isAuthenticated, async (auth) => {
        if (auth && currentOrganisationId.value) {
            await load()
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
        isReady,
        isInitialLoad,

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
        severityDistribution,
        statusDistribution,
        escalationDistribution,
        incidentHealth,
        healthStatus,
        criticalIncidentCount,
        highSeverityCount,
        escalatedCount,

        // Actions - Load
        load,
        loadIncidents,
        loadIncident,
        loadIncidentTimeline,
        loadRecoveryMetrics,
        loadStats,
        loadSummary,
        loadActiveIncidents,
        loadClosedIncidents,
        loadCriticalIncidents,
        loadIncidentsByOrganisation,

        // Actions - CRUD
        createIncident,
        updateIncident,
        deleteIncident,

        // Actions - Incident Actions
        closeIncident,
        reopenIncident,
        escalateIncident,
        assignIncident,
        acknowledgeIncident,
        addIncidentUpdate,

        // Actions - Pagination
        setPage,
        setItemsPerPage,

        // Actions - Utilities
        refresh,
        clear,
        clearSelection,
        resetError,
        startAutoRefresh,
        stopAutoRefresh,

        // Helpers
        getSeverityLabel,
        getSeverityColor,
        getStatusLabel,
        getStatusColor,
        getEscalationLabel,
        getEscalationColor,
        getResolutionTime,
        formatResolutionTime,

        // Utils
        currentOrganisationId,
    }
}

export default useIncident