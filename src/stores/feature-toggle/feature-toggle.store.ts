import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { featureToggleService } from './../../services/api/feature-toggle/FeatureToggleService'
import type {
    FeatureToggle,
    FeatureToggleOverride,
    FeatureToggleAuditLog,
    CreateFeatureToggleRequest,
    UpdateFeatureToggleRequest,
    CreateFeatureToggleOverrideRequest,
    UpdateFeatureToggleOverrideRequest,
    EvaluateFeatureRequest,
    FeatureEvaluationResponse,
    BatchFeatureEvaluationRequest,
    FeatureToggleQueryParams,
    FeatureToggleStats,
    FeatureToggleAuditQueryParams,
} from './../../models/entities/feature-toggle/feature-toggle.entity'
import {
    FeatureToggleStatus,
} from './../../models/entities/feature-toggle/feature-toggle.entity'

export const useFeatureToggleStore = defineStore('feature-toggle', () => {
    // ============================================
    // State - Feature Toggles
    // ============================================
    const toggles = ref<FeatureToggle[]>([])
    const selectedToggle = ref<FeatureToggle | null>(null)
    const isLoading = ref(false)
    const isSaving = ref(false)
    const error = ref<string | null>(null)

    // ============================================
    // State - Overrides
    // ============================================
    const overrides = ref<FeatureToggleOverride[]>([])
    const selectedOverride = ref<FeatureToggleOverride | null>(null)
    const isLoadingOverrides = ref(false)
    const overridesError = ref<string | null>(null)

    // ============================================
    // State - Audit Logs
    // ============================================
    const auditLogs = ref<FeatureToggleAuditLog[]>([])
    const isLoadingAuditLogs = ref(false)
    const auditLogsError = ref<string | null>(null)

    // ============================================
    // State - Statistics
    // ============================================
    const stats = ref<FeatureToggleStats | null>(null)
    const isLoadingStats = ref(false)
    const statsError = ref<string | null>(null)

    // ============================================
    // State - Evaluation
    // ============================================
    const evaluationResults = ref<Record<string, FeatureEvaluationResponse>>({})
    const isEvaluating = ref(false)
    const evaluationError = ref<string | null>(null)

    // ============================================
    // State - Pagination
    // ============================================
    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalItems = ref(0)
    const itemsPerPage = ref(20)

    // ============================================
    // Getters - Feature Toggles
    // ============================================

    const activeToggles = computed(() =>
        toggles.value.filter((t) => t.status === FeatureToggleStatus.ACTIVE)
    )

    const draftToggles = computed(() =>
        toggles.value.filter((t) => t.status === FeatureToggleStatus.DRAFT)
    )

    const scheduledToggles = computed(() =>
        toggles.value.filter((t) => t.status === FeatureToggleStatus.SCHEDULED)
    )

    const archivedToggles = computed(() =>
        toggles.value.filter((t) => t.status === FeatureToggleStatus.ARCHIVED)
    )

    const togglesByEnvironment = computed(() => {
        const grouped: Record<string, FeatureToggle[]> = {}
        toggles.value.forEach((t) => {
            const env = t.environment || 'Unknown'
            if (!grouped[env]) grouped[env] = []
            grouped[env].push(t)
        })
        return grouped
    })

    const togglesByType = computed(() => {
        const grouped: Record<string, FeatureToggle[]> = {}
        toggles.value.forEach((t) => {
            const type = t.toggleType || 'Unknown'
            if (!grouped[type]) grouped[type] = []
            grouped[type].push(t)
        })
        return grouped
    })

    const togglesByStatus = computed(() => {
        const grouped: Record<string, FeatureToggle[]> = {}
        toggles.value.forEach((t) => {
            const status = t.status || 'Unknown'
            if (!grouped[status]) grouped[status] = []
            grouped[status].push(t)
        })
        return grouped
    })

    const hasToggles = computed(() => toggles.value.length > 0)
    const isEmpty = computed(() => toggles.value.length === 0 && !isLoading.value)

    // ============================================
    // Getters - Overrides
    // ============================================

    const activeOverrides = computed(() =>
        overrides.value.filter((o) => {
            if (!o.expiresAt) return true
            return new Date(o.expiresAt) > new Date()
        })
    )

    const expiredOverrides = computed(() =>
        overrides.value.filter((o) => {
            if (!o.expiresAt) return false
            return new Date(o.expiresAt) <= new Date()
        })
    )

    // ============================================
    // Actions - Feature Toggles
    // ============================================

    async function loadToggles(params?: FeatureToggleQueryParams): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            const response = await featureToggleService.getFeatureToggles({
                ...params,
                page: currentPage.value,
                limit: itemsPerPage.value,
            })
            toggles.value = response.data || []
            totalPages.value = response.totalPages || 1
            totalItems.value = response.total || 0
        } catch (err: any) {
            console.error('Failed to load feature toggles:', err)
            error.value = err.message || 'Failed to load feature toggles'
        } finally {
            isLoading.value = false
        }
    }

    async function loadToggle(id: string): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            selectedToggle.value = await featureToggleService.getFeatureToggle(id)
        } catch (err: any) {
            console.error('Failed to load feature toggle:', err)
            error.value = err.message || 'Failed to load feature toggle'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function createToggle(data: CreateFeatureToggleRequest): Promise<FeatureToggle> {
        isSaving.value = true
        error.value = null

        try {
            const created = await featureToggleService.createFeatureToggle(data)
            toggles.value.unshift(created)
            return created
        } catch (err: any) {
            console.error('Failed to create feature toggle:', err)
            error.value = err.response?.data?.message || err.message || 'Failed to create feature toggle'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    async function updateToggle(id: string, data: UpdateFeatureToggleRequest): Promise<FeatureToggle> {
        isSaving.value = true
        error.value = null

        try {
            const updated = await featureToggleService.updateFeatureToggle(id, data)
            const index = toggles.value.findIndex((t) => t.uuid === id)
            if (index !== -1) {
                toggles.value[index] = updated
            }
            if (selectedToggle.value?.uuid === id) {
                selectedToggle.value = updated
            }
            return updated
        } catch (err: any) {
            console.error('Failed to update feature toggle:', err)
            error.value = err.response?.data?.message || err.message || 'Failed to update feature toggle'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    async function deleteToggle(id: string): Promise<void> {
        isSaving.value = true
        error.value = null

        try {
            await featureToggleService.deleteFeatureToggle(id)
            toggles.value = toggles.value.filter((t) => t.uuid !== id)
            if (selectedToggle.value?.uuid === id) {
                selectedToggle.value = null
            }
        } catch (err: any) {
            console.error('Failed to delete feature toggle:', err)
            error.value = err.response?.data?.message || err.message || 'Failed to delete feature toggle'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    // ============================================
    // Actions - Evaluation
    // ============================================

    async function evaluateFeature(data: EvaluateFeatureRequest): Promise<FeatureEvaluationResponse> {
        isEvaluating.value = true
        evaluationError.value = null

        try {
            const result = await featureToggleService.evaluateFeature(data)
            evaluationResults.value[data.featureName] = result
            return result
        } catch (err: any) {
            console.error('Failed to evaluate feature:', err)
            evaluationError.value = err.message || 'Failed to evaluate feature'
            throw err
        } finally {
            isEvaluating.value = false
        }
    }

    async function batchEvaluateFeatures(data: BatchFeatureEvaluationRequest): Promise<void> {
        isEvaluating.value = true
        evaluationError.value = null

        try {
            const results = await featureToggleService.batchEvaluateFeatures(data)
            evaluationResults.value = { ...evaluationResults.value, ...results.results }
        } catch (err: any) {
            console.error('Failed to batch evaluate features:', err)
            evaluationError.value = err.message || 'Failed to batch evaluate features'
            throw err
        } finally {
            isEvaluating.value = false
        }
    }

    // ============================================
    // Actions - Overrides
    // ============================================

    async function loadOverrides(organisationId: string): Promise<void> {
        isLoadingOverrides.value = true
        overridesError.value = null

        try {
            const response = await featureToggleService.getOverrides(organisationId)
            overrides.value = response.data || []
        } catch (err: any) {
            console.error('Failed to load overrides:', err)
            overridesError.value = err.message || 'Failed to load overrides'
        } finally {
            isLoadingOverrides.value = false
        }
    }

    async function createOverride(data: CreateFeatureToggleOverrideRequest): Promise<FeatureToggleOverride> {
        isSaving.value = true
        error.value = null

        try {
            const created = await featureToggleService.createOverride(data)
            overrides.value.unshift(created)
            return created
        } catch (err: any) {
            console.error('Failed to create override:', err)
            error.value = err.response?.data?.message || err.message || 'Failed to create override'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    async function updateOverride(id: string, data: UpdateFeatureToggleOverrideRequest): Promise<FeatureToggleOverride> {
        isSaving.value = true
        error.value = null

        try {
            const updated = await featureToggleService.updateOverride(id, data)
            const index = overrides.value.findIndex((o) => o.uuid === id)
            if (index !== -1) {
                overrides.value[index] = updated
            }
            if (selectedOverride.value?.uuid === id) {
                selectedOverride.value = updated
            }
            return updated
        } catch (err: any) {
            console.error('Failed to update override:', err)
            error.value = err.response?.data?.message || err.message || 'Failed to update override'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    async function deleteOverride(id: string): Promise<void> {
        isSaving.value = true
        error.value = null

        try {
            await featureToggleService.deleteOverride(id)
            overrides.value = overrides.value.filter((o) => o.uuid !== id)
            if (selectedOverride.value?.uuid === id) {
                selectedOverride.value = null
            }
        } catch (err: any) {
            console.error('Failed to delete override:', err)
            error.value = err.response?.data?.message || err.message || 'Failed to delete override'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    async function loadActiveOverrides(organisationId: string): Promise<void> {
        isLoadingOverrides.value = true
        overridesError.value = null

        try {
            overrides.value = await featureToggleService.getActiveOverrides(organisationId)
        } catch (err: any) {
            console.error('Failed to load active overrides:', err)
            overridesError.value = err.message || 'Failed to load active overrides'
        } finally {
            isLoadingOverrides.value = false
        }
    }

    async function deleteExpiredOverrides(): Promise<{ count: number }> {
        try {
            return await featureToggleService.deleteExpiredOverrides()
        } catch (err: any) {
            console.error('Failed to delete expired overrides:', err)
            error.value = err.message || 'Failed to delete expired overrides'
            throw err
        }
    }

    // ============================================
    // Actions - Audit Logs
    // ============================================

    async function loadAuditLogs(
        featureToggleId: string,
        params?: FeatureToggleAuditQueryParams
    ): Promise<void> {
        isLoadingAuditLogs.value = true
        auditLogsError.value = null

        try {
            const response = await featureToggleService.getAuditLogs(featureToggleId, params)
            auditLogs.value = response.data || []
        } catch (err: any) {
            console.error('Failed to load audit logs:', err)
            auditLogsError.value = err.message || 'Failed to load audit logs'
        } finally {
            isLoadingAuditLogs.value = false
        }
    }

    // ============================================
    // Actions - Statistics
    // ============================================

    async function loadStats(organisationId: string): Promise<void> {
        isLoadingStats.value = true
        statsError.value = null

        try {
            stats.value = await featureToggleService.getFeatureToggleStats(organisationId)
        } catch (err: any) {
            console.error('Failed to load feature toggle stats:', err)
            statsError.value = err.message || 'Failed to load feature toggle stats'
        } finally {
            isLoadingStats.value = false
        }
    }

    // ============================================
    // Actions - Pagination & Reset
    // ============================================

    async function setPage(page: number): Promise<void> {
        currentPage.value = page
        await loadToggles()
    }

    function setItemsPerPage(limit: number): void {
        itemsPerPage.value = limit
        currentPage.value = 1
    }

    function clearSelection(): void {
        selectedToggle.value = null
        selectedOverride.value = null
    }

    function clearAll(): void {
        toggles.value = []
        selectedToggle.value = null
        overrides.value = []
        selectedOverride.value = null
        auditLogs.value = []
        stats.value = null
        evaluationResults.value = {}
        error.value = null
        currentPage.value = 1
        totalPages.value = 1
        totalItems.value = 0
    }

    function resetError(): void {
        error.value = null
        overridesError.value = null
        auditLogsError.value = null
        statsError.value = null
        evaluationError.value = null
    }

    // ============================================
    // Return Store Interface
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

        // Getters - Overrides
        activeOverrides,
        expiredOverrides,

        // Actions - Toggles
        loadToggles,
        loadToggle,
        createToggle,
        updateToggle,
        deleteToggle,

        // Actions - Evaluation
        evaluateFeature,
        batchEvaluateFeatures,

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

        // Actions - Reset
        clearSelection,
        clearAll,
        resetError,
    }
})