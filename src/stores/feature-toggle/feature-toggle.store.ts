import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  FeatureToggle,
  FeatureToggleOverride,
  FeatureToggleAuditLog,
  FeatureEvaluationResponse,
} from '../../models/feature-toggle/feature-toggle.entity'
import { FeatureToggleStatus } from '../../models/feature-toggle/feature-toggle.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'
import { featureToggleService } from '../../services/api/feature-toggle/FeatureToggleService'

// ============================================
// Offline-First CRUD Stores
// ============================================
export const useFeatureToggleItemStore = createOfflineCrudStore<FeatureToggle>({
  storeId: 'feature-toggles',
  tableName: 'featureToggles',
})

export const useFeatureToggleOverrideStore = createOfflineCrudStore<FeatureToggleOverride>({
  storeId: 'feature-toggle-overrides',
  tableName: 'featureToggleOverrides',
})

export const useFeatureToggleAuditLogStore = createOfflineCrudStore<FeatureToggleAuditLog>({
  storeId: 'feature-toggle-audit-logs',
  tableName: 'featureToggleAuditLogs',
})

// ============================================
// Main Feature Toggle Store (Facade)
// ============================================
export const useFeatureToggleStore = defineStore('feature-toggle', () => {
  const toggleStore = useFeatureToggleItemStore()
  const overrideStore = useFeatureToggleOverrideStore()
  const auditLogStore = useFeatureToggleAuditLogStore()

  const evaluationResults = ref<Record<string, FeatureEvaluationResponse>>({})
  const isEvaluating = ref(false)
  const isSaving = ref(false)
  const isInitialized = ref(false)

  const toggles = toggleStore.items
  const overrides = overrideStore.items
  const auditLogs = auditLogStore.items

  // ============================================
  // Getters - By Status
  // ============================================
  const activeToggles = computed(() =>
    toggles?.filter((t: FeatureToggle) => t.status === FeatureToggleStatus.ACTIVE)
  )

  const draftToggles = computed(() =>
    toggles?.filter((t: FeatureToggle) => t.status === FeatureToggleStatus.DRAFT)
  )

  const scheduledToggles = computed(() =>
    toggles?.filter((t: FeatureToggle) => t.status === FeatureToggleStatus.SCHEDULED)
  )

  const archivedToggles = computed(() =>
    toggles?.filter((t: FeatureToggle) => t.status === FeatureToggleStatus.ARCHIVED)
  )

  const inactiveToggles = computed(() =>
    toggles?.filter((t: FeatureToggle) => t.status === FeatureToggleStatus.INACTIVE)
  )

  // ============================================
  // Getters - Groupings
  // ============================================
  const togglesByEnvironment = computed(() => {
    const grouped: Record<string, FeatureToggle[]> = {}
    toggles?.forEach((t: FeatureToggle) => {
      const env = t.environment || 'Unknown'
      if (!grouped[env]) grouped[env] = []
      grouped[env].push(t)
    })
    return grouped
  })

  const togglesByType = computed(() => {
    const grouped: Record<string, FeatureToggle[]> = {}
    toggles?.forEach((t: FeatureToggle) => {
      const type = t.toggleType || 'Unknown'
      if (!grouped[type]) grouped[type] = []
      grouped[type].push(t)
    })
    return grouped
  })

  const togglesByStatus = computed(() => {
    const grouped: Record<string, FeatureToggle[]> = {}
    toggles?.forEach((t: FeatureToggle) => {
      const status = t.status || 'Unknown'
      if (!grouped[status]) grouped[status] = []
      grouped[status].push(t)
    })
    return grouped
  })

  // ============================================
  // Getters - Overrides
  // ============================================
  const activeOverrides = computed(() =>
    overrides?.filter((o: FeatureToggleOverride) => {
      if (!o.expiresAt) return true
      return new Date(o.expiresAt) > new Date()
    })
  )

  const expiredOverrides = computed(() =>
    overrides?.filter((o: FeatureToggleOverride) => {
      if (!o.expiresAt) return false
      return new Date(o.expiresAt) <= new Date()
    })
  )

  const getOverridesForToggle = (toggleId: string): FeatureToggleOverride[] =>
    overrides?.filter((o: FeatureToggleOverride) => o.featureToggleId === toggleId)

  // ============================================
  // Getters - Metrics
  // ============================================
  const totalEvaluations = computed(() =>
    toggles?.reduce(
      (sum: number, t: FeatureToggle) => sum + (t.evaluationCount || 0),
      0
    )
  )

  const totalTrueEvaluations = computed(() =>
    toggles?.reduce(
      (sum: number, t: FeatureToggle) => sum + (t.trueEvaluationCount || 0),
      0
    )
  )

  const averageTrueRate = computed(() => {
    const total = totalEvaluations.value
    if (total === 0) return 0
    return Math.round((totalTrueEvaluations.value / total) * 100)
  })

  // ============================================
  // Getters - Evaluation Cache
  // ============================================
  const getEvaluationResult = (
    featureName: string
  ): FeatureEvaluationResponse | null =>
    evaluationResults.value[featureName] || null

  const isFeatureEnabled = (featureName: string): boolean =>
    evaluationResults.value[featureName]?.enabled === true

  // ============================================
  // Actions
  // ============================================
  async function initialize(): Promise<void> {
    if (isInitialized.value) return
    await Promise.all([
      toggleStore.initialize(),
      overrideStore.initialize(),
      auditLogStore.initialize(),
    ])
    isInitialized.value = true
  }

  async function evaluateFeature(
    featureName: string,
    context?: Record<string, any>
  ): Promise<FeatureEvaluationResponse | null> {
    isEvaluating.value = true
    try {
      const result = await featureToggleService.evaluateFeature({
        featureName,
        organisationId: context?.organisationId || '',
        userId: context?.userId,
        userRole: context?.userRole,
      })
      evaluationResults.value[featureName] = result
      return result
    } catch (err: any) {
      console.error('Failed to evaluate feature:', err)
      return null
    } finally {
      isEvaluating.value = false
    }
  }

  async function evaluateFeatures(
    featureNames: string[],
    context?: Record<string, any>
  ): Promise<Record<string, FeatureEvaluationResponse>> {
    isEvaluating.value = true
    const results: Record<string, FeatureEvaluationResponse> = {}
    try {
      await Promise.all(
        featureNames.map(async (name) => {
          const result = await featureToggleService.evaluateFeature({
            featureName: name,
            organisationId: context?.organisationId || '',
            userId: context?.userId,
            userRole: context?.userRole,
          })
          results[name] = result
          evaluationResults.value[name] = result
        })
      )
      return results
    } catch (err: any) {
      console.error('Failed to evaluate features:', err)
      return results
    } finally {
      isEvaluating.value = false
    }
  }

  function clearEvaluationCache(): void {
    evaluationResults.value = {}
  }

  async function activateToggle(id: string): Promise<FeatureToggle | null> {
    return toggleStore.update(id, {
      status: FeatureToggleStatus.ACTIVE,
      activatedAt: new Date(),
    } as Partial<FeatureToggle>)
  }

  async function deactivateToggle(id: string): Promise<FeatureToggle | null> {
    return toggleStore.update(id, {
      status: FeatureToggleStatus.INACTIVE,
      deactivatedAt: new Date(),
    } as Partial<FeatureToggle>)
  }

  async function archiveToggle(id: string): Promise<FeatureToggle | null> {
    return toggleStore.update(id, {
      status: FeatureToggleStatus.ARCHIVED,
    } as Partial<FeatureToggle>)
  }

  async function createOverride(
    data: Partial<FeatureToggleOverride>
  ): Promise<FeatureToggleOverride | null> {
    return overrideStore.create(data)
  }

  async function removeOverride(id: string): Promise<boolean> {
    return overrideStore.remove(id)
  }

  async function deleteExpiredOverrides(): Promise<number> {
    const expired = expiredOverrides.value
    for (const o of expired) {
      await overrideStore.remove(o.uuid)
    }
    return expired.length
  }

  function reset(): void {
    toggleStore.reset()
    overrideStore.reset()
    auditLogStore.reset()
    evaluationResults.value = {}
    isEvaluating.value = false
    isSaving.value = false
    isInitialized.value = false
  }

  // ============================================
  // Return Store Interface
  // ============================================
  return {
    // State
    toggles,
    overrides,
    auditLogs,
    evaluationResults,
    isLoading: toggleStore.loading,
    isSaving,
    isEvaluating,
    isInitialized,
    error: toggleStore.error,

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
    getOverridesForToggle,

    // Getters - Metrics
    totalEvaluations,
    totalTrueEvaluations,
    averageTrueRate,

    // Getters - Evaluation Cache
    getEvaluationResult,
    isFeatureEnabled,

    // Actions
    initialize,
    evaluateFeature,
    evaluateFeatures,
    clearEvaluationCache,
    activateToggle,
    deactivateToggle,
    archiveToggle,
    createOverride,
    removeOverride,
    deleteExpiredOverrides,
    reset,

    // Sub-stores
    toggleStore,
    overrideStore,
    auditLogStore,
  }
})