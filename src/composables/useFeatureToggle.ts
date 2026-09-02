import { computed, watch, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useFeatureToggleStore } from '../stores/feature-toggle/feature-toggle.store'
import { useAuth } from './useAuth'
import type {
    FeatureToggle,
    FeatureToggleOverride,
    EvaluateFeatureRequest,
    FeatureEvaluationResponse,
    BatchFeatureEvaluationRequest,
    FeatureToggleQueryParams,
} from '../models/entities/feature-toggle/feature-toggle.entity'
import {
    FeatureToggleStatus,
    ToggleEnvironment,
    FeatureToggleType,
    getFeatureToggleStatusLabel,
    getFeatureToggleStatusColor,
    getToggleEnvironmentLabel,
    getFeatureToggleTypeLabel,
} from '../models/entities/feature-toggle/feature-toggle.entity'

export interface UseFeatureToggleOptions {
    autoLoad?: boolean
    organisationId?: string
    refreshInterval?: number
    filterStatus?: FeatureToggleStatus
    filterEnvironment?: ToggleEnvironment
    filterType?: FeatureToggleType
}

/**
 * Composable for Feature Toggle functionality
 * Provides reactive feature toggle state and operations
 */
export function useFeatureToggle(options: UseFeatureToggleOptions = {}) {
    const {
        autoLoad = true,
        organisationId: defaultOrgId,
        refreshInterval,
        filterStatus,
        filterEnvironment,
        filterType,
    } = options

    const toggleStore = useFeatureToggleStore()
    const { userOrganisationId, isAuthenticated } = useAuth()

    // Store refs for reactivity
    const {
        toggles,
        selectedToggle,
        overrides,
        selectedOverride,
        auditLogs,
        stats,
        evaluationResults,
        isLoading,
        isSaving,
        isLoadingOverrides,
        isLoadingAuditLogs,
        isLoadingStats,
        isEvaluating,
        error,
        overridesError,
        auditLogsError,
        statsError,
        evaluationError,
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        activeToggles,
        draftToggles,
        scheduledToggles,
        archivedToggles,
        togglesByEnvironment,
        togglesByType,
        togglesByStatus,
        hasToggles,
        isEmpty,
        activeOverrides,
        expiredOverrides,
    } = storeToRefs(toggleStore)

    // Store actions
    const {
        loadToggles,
        loadToggle,
        createToggle,
        updateToggle,
        deleteToggle,
        evaluateFeature,
        batchEvaluateFeatures,
        loadOverrides,
        createOverride,
        updateOverride,
        deleteOverride,
        loadActiveOverrides,
        deleteExpiredOverrides,
        loadAuditLogs,
        loadStats,
        setPage,
        setItemsPerPage,
        clearSelection,
        clearAll,
        resetError,
    } = toggleStore

    // Local state
    const refreshTimer = ref<number | null>(null)
    const isInitialLoad = ref(true)
    const isReady = ref(false)
    const currentOrganisationId = computed(() => defaultOrgId || userOrganisationId.value)

    // ============================================
    // Computed Getters - Derived Metrics
    // ============================================

    const totalToggles = computed(() => toggles.value?.length || 0)

    const toggleHealth = computed(() => {
        const total = totalToggles.value
        if (total === 0) return 0

        const active = activeToggles.value?.length || 0
        const scheduled = scheduledToggles.value?.length || 0

        // Weight: active = 1, scheduled = 0.5
        const weightedScore = (active * 1) + (scheduled * 0.5)
        return Math.round((weightedScore / total) * 100)
    })

    const healthStatus = computed(() => {
        const score = toggleHealth.value
        if (score >= 80) return { label: 'Healthy', color: 'positive', icon: 'check_circle' }
        if (score >= 60) return { label: 'Fair', color: 'warning', icon: 'warning' }
        if (score >= 40) return { label: 'Needs Attention', color: 'orange', icon: 'error_outline' }
        return { label: 'Critical', color: 'negative', icon: 'dangerous' }
    })

    const toggleDistribution = computed(() => ({
        byStatus: togglesByStatus.value,
        byEnvironment: togglesByEnvironment.value,
        byType: togglesByType.value,
    }))

    // ============================================
    // Helper Functions
    // ============================================

    function getStatusLabel(status: string): string {
        return getFeatureToggleStatusLabel(status)
    }

    function getStatusColor(status: string): string {
        return getFeatureToggleStatusColor(status)
    }

    function getEnvironmentLabel(environment: string): string {
        return getToggleEnvironmentLabel(environment)
    }

    function getTypeLabel(type: string): string {
        return getFeatureToggleTypeLabel(type)
    }

    function isToggleActive(toggle: FeatureToggle): boolean {
        return toggle.status === FeatureToggleStatus.ACTIVE
    }

    function isToggleScheduled(toggle: FeatureToggle): boolean {
        return toggle.status === FeatureToggleStatus.SCHEDULED
    }

    function isOverrideActive(override: FeatureToggleOverride): boolean {
        if (!override.expiresAt) return true
        return new Date(override.expiresAt) > new Date()
    }

    function getOverrideStatus(override: FeatureToggleOverride): string {
        return isOverrideActive(override) ? 'Active' : 'Expired'
    }

    // ============================================
    // Actions
    // ============================================

    /**
     * Load all feature toggle data
     */
    async function load(): Promise<void> {
        const orgId = currentOrganisationId.value
        if (!orgId) {
            console.warn('No organisation ID available for feature toggle data')
            return
        }

        const params: FeatureToggleQueryParams = {
            organisationId: orgId,
        }
        if (filterStatus) params.status = filterStatus
        if (filterEnvironment) params.environment = filterEnvironment
        if (filterType) params.toggleType = filterType

        await Promise.all([
            loadToggles(params),
            loadStats(orgId),
            loadActiveOverrides(orgId),
        ])
    }

    /**
     * Refresh all feature toggle data
     */
    async function refresh(): Promise<void> {
        await load()
    }

    /**
     * Evaluate a feature
     */
    async function evaluate(data: EvaluateFeatureRequest): Promise<FeatureEvaluationResponse> {
        const result = await evaluateFeature(data)
        return result
    }

    /**
     * Batch evaluate features
     */
    async function evaluateBatch(data: BatchFeatureEvaluationRequest): Promise<void> {
        await batchEvaluateFeatures(data)
    }

    /**
     * Get evaluation result for a feature
     */
    function getEvaluation(featureName: string): FeatureEvaluationResponse | undefined {
        return evaluationResults.value?.[featureName]
    }

    /**
     * Check if a feature is enabled
     */
    async function isFeatureEnabled(featureName: string, context?: Record<string, any>): Promise<boolean> {
        const orgId = currentOrganisationId.value
        if (!orgId) return false

        try {
            const request: EvaluateFeatureRequest = {
                featureName,
                organisationId: orgId,
                ...(context ? { context } : {}),
            }

            const result = await evaluateFeature(request)
            return result.enabled
        } catch {
            return false
        }
    }

    /**
     * Start auto-refresh timer
     */
    function startAutoRefresh(intervalMs: number = refreshInterval || 60000): void {
        stopAutoRefresh()

        refreshTimer.value = window.setInterval(async () => {
            if (!isLoading.value && !isSaving.value && !isLoadingOverrides.value) {
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
     * Clear all feature toggle data
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
        // State - Toggles
        toggles,
        selectedToggle,
        isLoading,
        isSaving,
        error,

        // State - Overrides
        overrides,
        selectedOverride,
        isLoadingOverrides,
        overridesError,

        // State - Audit Logs
        auditLogs,
        isLoadingAuditLogs,
        auditLogsError,

        // State - Statistics
        stats,
        isLoadingStats,
        statsError,

        // State - Evaluation
        evaluationResults,
        isEvaluating,
        evaluationError,

        // State - Pagination
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        isReady,
        isInitialLoad,

        // Getters - Toggles
        activeToggles,
        draftToggles,
        scheduledToggles,
        archivedToggles,
        togglesByEnvironment,
        togglesByType,
        togglesByStatus,
        hasToggles,
        isEmpty,
        totalToggles,
        toggleHealth,
        healthStatus,
        toggleDistribution,

        // Getters - Overrides
        activeOverrides,
        expiredOverrides,

        // Actions - Toggles
        load,
        loadToggles,
        loadToggle,
        createToggle,
        updateToggle,
        deleteToggle,

        // Actions - Evaluation
        evaluate,
        evaluateBatch,
        getEvaluation,
        isFeatureEnabled,

        // Actions - Overrides
        loadOverrides,
        createOverride,
        updateOverride,
        deleteOverride,
        loadActiveOverrides,
        deleteExpiredOverrides,

        // Actions - Audit Logs
        loadAuditLogs,

        // Actions - Statistics
        loadStats,

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
        getStatusLabel,
        getStatusColor,
        getEnvironmentLabel,
        getTypeLabel,
        isToggleActive,
        isToggleScheduled,
        isOverrideActive,
        getOverrideStatus,

        // Utils
        currentOrganisationId,
    }
}

export default useFeatureToggle