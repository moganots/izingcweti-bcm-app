import { computed, watch, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useFeatureToggleStore } from '../stores/feature-toggle/feature-toggle.store'
import { useAuth } from './useAuth'
import type { FeatureEvaluationResponse } from '../models/feature-toggle/feature-toggle.entity'
import {
    FeatureToggleStatus,
    ToggleEnvironment,
    getFeatureToggleStatusLabel,
    getFeatureToggleStatusColor,
    getToggleEnvironmentLabel,
    getToggleEnvironmentColor,
} from '../models/feature-toggle/feature-toggle.entity'

export interface UseFeatureToggleOptions {
    autoLoad?: boolean
    organisationId?: string
    refreshInterval?: number
}

/**
 * Feature Toggle composable
 * Fully aligned with useFeatureToggleStore
 */
export function useFeatureToggle(options: UseFeatureToggleOptions = {}) {
    const { autoLoad = true, organisationId: defaultOrgId, refreshInterval } = options

    const toggleStore = useFeatureToggleStore()
    const { userOrganisationId, isAuthenticated } = useAuth()

    // ============================================
    // Store bindings
    // ============================================
    const {
        // State
        toggles,
        overrides,
        auditLogs,
        evaluationResults,
        isLoading,
        isSaving,
        isEvaluating,
        isInitialized,
        error,

        // By Status
        activeToggles,
        draftToggles,
        scheduledToggles,
        archivedToggles,
        inactiveToggles,

        // Groupings
        togglesByEnvironment,
        togglesByType,
        togglesByStatus,

        // Overrides
        activeOverrides,
        expiredOverrides,

        // Metrics
        totalEvaluations,
        totalTrueEvaluations,
        averageTrueRate,
    } = storeToRefs(toggleStore)

    // ============================================
    // Local state
    // ============================================
    const refreshTimer = ref<number | null>(null)
    const isInitialLoad = ref(true)

    const currentOrganisationId = computed(
        () => defaultOrgId || userOrganisationId.value
    )

    // ============================================
    // Actions
    // ============================================
    async function loadAll(): Promise<void> {
        await toggleStore.initialize()
    }

    async function refresh(): Promise<void> {
        await loadAll()
    }

    async function evaluateFeature(
        featureName: string,
        context?: Record<string, any>
    ): Promise<FeatureEvaluationResponse | null> {
        return toggleStore.evaluateFeature(featureName, {
            ...context,
            organisationId: context?.organisationId || currentOrganisationId.value,
        })
    }

    async function evaluateFeatures(
        featureNames: string[],
        context?: Record<string, any>
    ): Promise<Record<string, FeatureEvaluationResponse>> {
        return toggleStore.evaluateFeatures(featureNames, {
            ...context,
            organisationId: context?.organisationId || currentOrganisationId.value,
        })
    }

    function startAutoRefresh(intervalMs: number = refreshInterval || 60000): void {
        stopAutoRefresh()
        refreshTimer.value = window.setInterval(
            () => refresh().catch(console.error),
            intervalMs
        )
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
    function getStatusLabel(status: string): string {
        return getFeatureToggleStatusLabel(status)
    }

    function getStatusColor(status: string): string {
        return getFeatureToggleStatusColor(status)
    }

    function getEnvironmentLabel(environment: string): string {
        return getToggleEnvironmentLabel(environment)
    }

    function getEnvironmentColor(environment: string): string {
        return getToggleEnvironmentColor(environment)
    }

    // ============================================
    // Lifecycle
    // ============================================
    onMounted(async () => {
        if (autoLoad && isAuthenticated.value) {
            await loadAll()
            isInitialLoad.value = false
            if (refreshInterval) startAutoRefresh(refreshInterval)
        }
    })

    watch(isAuthenticated, async (auth) => {
        if (auth) {
            await loadAll()
            if (refreshInterval) startAutoRefresh(refreshInterval)
        } else {
            toggleStore.reset()
            stopAutoRefresh()
        }
    })

    // ============================================
    // Return API
    // ============================================
    return {
        // State
        toggles,
        overrides,
        auditLogs,
        evaluationResults,
        isLoading,
        isSaving,
        isEvaluating,
        isInitialized,
        error,

        // Getters - By Status
        activeToggles,
        draftToggles,
        scheduledToggles,
        archivedToggles,
        inactiveToggles,

        // Getters - Groupings
        togglesByEnvironment,
        togglesByType,
        togglesByStatus,

        // Getters - Overrides
        activeOverrides,
        expiredOverrides,

        // Getters - Metrics
        totalEvaluations,
        totalTrueEvaluations,
        averageTrueRate,

        // Getters - Evaluation cache (functions)
        getEvaluationResult: toggleStore.getEvaluationResult,
        isFeatureEnabled: toggleStore.isFeatureEnabled,

        // Actions
        loadAll,
        refresh,
        evaluateFeature,
        evaluateFeatures,
        clearEvaluationCache: toggleStore.clearEvaluationCache,
        activateToggle: toggleStore.activateToggle,
        deactivateToggle: toggleStore.deactivateToggle,
        archiveToggle: toggleStore.archiveToggle,
        createOverride: toggleStore.createOverride,
        removeOverride: toggleStore.removeOverride,
        deleteExpiredOverrides: toggleStore.deleteExpiredOverrides,
        reset: toggleStore.reset,

        // Auto-refresh
        startAutoRefresh,
        stopAutoRefresh,

        // Helpers
        getStatusLabel,
        getStatusColor,
        getEnvironmentLabel,
        getEnvironmentColor,

        // Utils
        isInitialLoad,
        currentOrganisationId,
        FeatureToggleStatus,
        ToggleEnvironment,
    }
}

export default useFeatureToggle