import { computed, watch, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useBcmStore } from '../stores/bcm/bcm.store'
import { useAuth } from './useAuth'
import type {
  CriticalFunction,
  BusinessImpactAssessment,
  BusinessContinuityPlan,
  RecoveryStrategy,
  ExerciseTest,
  BCPTemplate,
  CriticalFunctionQueryParams,
  BIAQueryParams,
  BCPQueryParams,
  RecoveryStrategyQueryParams,
  ExerciseTestQueryParams,
  CreateCriticalFunctionRequest,
  UpdateCriticalFunctionRequest,
  CreateBIARequest,
  UpdateBIARequest,
  CreateBCPRequest,
  UpdateBCPRequest,
  CreateRecoveryStrategyRequest,
  UpdateRecoveryStrategyRequest,
  CreateExerciseTestRequest,
  UpdateExerciseTestRequest,
  RecordTestResultRequest,
  CreateBCPTemplateRequest,
  UpdateBCPTemplateRequest,
  ApplyTemplateRequest,
  BCMMetrics,
} from '../models/entities/bcm/bcm.entity'

export interface UseBcmOptions {
  autoLoad?: boolean
  organisationId?: string
  refreshInterval?: number
}

/**
 * Composable for BCM (Business Continuity Management) functionality
 * Provides reactive BCM data and operations
 */
export function useBcm(options: UseBcmOptions = {}) {
  const { autoLoad = true, organisationId: defaultOrgId, refreshInterval } = options

  const bcmStore = useBcmStore()
  const { organisationId: authOrgId, isAuthenticated } = useAuth()

  // Store refs for reactivity
  const {
    // Critical Functions
    criticalFunctions,
    selectedFunction,
    isLoadingFunctions,
    functionsError,
    functionsPagination,

    // BIA
    bias,
    selectedBIA,
    isLoadingBIA,
    biaError,
    biaPagination,

    // BCP
    bcps,
    selectedBCP,
    isLoadingBCP,
    bcpError,
    bcpPagination,

    // BCP Templates
    bcpTemplates,
    selectedTemplate,
    isLoadingTemplates,
    templatesError,

    // Recovery Strategies
    recoveryStrategies,
    isLoadingStrategies,
    strategiesError,
    strategiesPagination,

    // Exercise Tests
    exerciseTests,
    isLoadingTests,
    testsError,
    testsPagination,

    // Metrics
    metrics,
    isLoadingMetrics,
    metricsError,

    // Getters
    functionsByPriority,
    functionsRequiringBCP,
    activeFunctions,
    activeBCPs,
    draftBCPs,
    approvedBCPs,
    archivedBCPs,
    overdueBCPs,
    upcomingTests,
    passedTests,
    failedTests,
    testsByType,
    primaryStrategies,
    activeStrategies,
    highSuccessRateStrategies,
    hasData,
    isEmpty,
  } = storeToRefs(bcmStore)

  // Store actions
  const {
    loadCriticalFunctions,
    loadCriticalFunction,
    createCriticalFunction,
    updateCriticalFunction,
    deleteCriticalFunction,
    loadBIAs,
    loadBIA,
    createBIA,
    updateBIA,
    deleteBIA,
    loadBCPs,
    loadBCP,
    createBCP,
    updateBCP,
    approveBCP,
    archiveBCP,
    activateBCP,
    deleteBCP,
    loadBCPTemplates,
    createBCPTemplate,
    updateBCPTemplate,
    deleteBCPTemplate,
    applyTemplate,
    loadRecoveryStrategies,
    createRecoveryStrategy,
    updateRecoveryStrategy,
    deleteRecoveryStrategy,
    loadExerciseTests,
    createExerciseTest,
    updateExerciseTest,
    recordTestResult,
    deleteExerciseTest,
    loadMetrics,
    clearAll,
  } = bcmStore

  // Local state
  const refreshTimer = ref<number | null>(null)
  const isInitialLoad = ref(true)
  const currentOrganisationId = computed(() => defaultOrgId || authOrgId.value)

  // ============================================
  // Computed Getters - Derived Metrics
  // ============================================

  const totalCriticalFunctions = computed(() => criticalFunctions.value?.length || 0)
  const totalBCPs = computed(() => bcps.value?.length || 0)
  const totalExerciseTests = computed(() => exerciseTests.value?.length || 0)
  const totalRecoveryStrategies = computed(() => recoveryStrategies.value?.length || 0)

  const bcpCompletionRate = computed(() => {
    const total = bcps.value?.length || 0
    if (total === 0) return 0
    const active = bcps.value?.filter((b) => b.planStatus === 'ACTIVE').length || 0
    return Math.round((active / total) * 100)
  })

  const testPassRate = computed(() => {
    const total = exerciseTests.value?.length || 0
    if (total === 0) return 0
    const passed = exerciseTests.value?.filter((t) => t.passed).length || 0
    return Math.round((passed / total) * 100)
  })

  const overallHealth = computed(() => {
    let score = 0
    let total = 0

    // BCP Status
    if (bcps.value?.length > 0) {
      const active = bcps.value.filter((b) => b.planStatus === 'ACTIVE').length
      score += (active / bcps.value.length) * 30
      total += 30
    }

    // Test Pass Rate
    if (exerciseTests.value?.length > 0) {
      const passed = exerciseTests.value.filter((t) => t.passed).length
      score += (passed / exerciseTests.value.length) * 30
      total += 30
    }

    // Strategy Success Rate
    if (recoveryStrategies.value?.length > 0) {
      const avgSuccess = recoveryStrategies.value.reduce(
        (sum, s) => sum + (s.testSuccessRate || 0),
        0
      ) / recoveryStrategies.value.length
      score += (avgSuccess / 100) * 20
      total += 20
    }

    // Critical Functions with BCP
    if (criticalFunctions.value?.length > 0) {
      const withBCP = criticalFunctions.value.filter((f) => f.requiresBcp).length
      score += (withBCP / criticalFunctions.value.length) * 20
      total += 20
    }

    return total > 0 ? Math.round(score / total * 100) : 0
  })

  const healthStatus = computed(() => {
    const score = overallHealth.value
    if (score >= 80) return { label: 'Healthy', color: 'positive', icon: 'check_circle' }
    if (score >= 60) return { label: 'Fair', color: 'warning', icon: 'warning' }
    if (score >= 40) return { label: 'Needs Attention', color: 'orange', icon: 'error_outline' }
    return { label: 'Critical', color: 'negative', icon: 'dangerous' }
  })

  // ============================================
  // Actions
  // ============================================

  /**
   * Load all BCM data for the current organisation
   */
  async function loadAll(): Promise<void> {
    const orgId = currentOrganisationId.value
    if (!orgId) {
      console.warn('No organisation ID available for BCM data')
      return
    }

    await Promise.all([
      loadCriticalFunctions({ organisationId: orgId }),
      loadBCPs({ organisationId: orgId }),
      loadBIAs({ organisationId: orgId }),
      loadRecoveryStrategies({ organisationId: orgId }),
      loadExerciseTests({ organisationId: orgId }),
      loadMetrics(orgId),
    ])
  }

  /**
   * Load critical functions
   */
  async function loadFunctions(params?: CriticalFunctionQueryParams): Promise<void> {
    await loadCriticalFunctions({
      ...params,
      organisationId: params?.organisationId || currentOrganisationId.value,
    })
  }

  /**
   * Load BCPs
   */
  async function loadPlans(params?: BCPQueryParams): Promise<void> {
    await loadBCPs({
      ...params,
      organisationId: params?.organisationId || currentOrganisationId.value,
    })
  }

  /**
   * Load exercise tests
   */
  async function loadTests(params?: ExerciseTestQueryParams): Promise<void> {
    await loadExerciseTests({
      ...params,
      organisationId: params?.organisationId || currentOrganisationId.value,
    })
  }

  /**
   * Load recovery strategies
   */
  async function loadStrategies(params?: RecoveryStrategyQueryParams): Promise<void> {
    await loadRecoveryStrategies({
      ...params,
      organisationId: params?.organisationId || currentOrganisationId.value,
    })
  }

  /**
   * Load BIA data
   */
  async function loadAssessments(params?: BIAQueryParams): Promise<void> {
    await loadBIAs({
      ...params,
      organisationId: params?.organisationId || currentOrganisationId.value,
    })
  }

  /**
   * Refresh all BCM data
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
      if (!isLoadingFunctions.value && !isLoadingBCP.value && !isLoadingTests.value) {
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
   * Clear all BCM data
   */
  function clear(): void {
    clearAll()
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
    // State - Critical Functions
    criticalFunctions,
    selectedFunction,
    isLoadingFunctions,
    functionsError,
    functionsPagination,

    // State - BIA
    bias,
    selectedBIA,
    isLoadingBIA,
    biaError,
    biaPagination,

    // State - BCP
    bcps,
    selectedBCP,
    isLoadingBCP,
    bcpError,
    bcpPagination,

    // State - BCP Templates
    bcpTemplates,
    selectedTemplate,
    isLoadingTemplates,
    templatesError,

    // State - Recovery Strategies
    recoveryStrategies,
    isLoadingStrategies,
    strategiesError,
    strategiesPagination,

    // State - Exercise Tests
    exerciseTests,
    isLoadingTests,
    testsError,
    testsPagination,

    // State - Metrics
    metrics,
    isLoadingMetrics,
    metricsError,

    // Getters - Critical Functions
    functionsByPriority,
    functionsRequiringBCP,
    activeFunctions,
    totalCriticalFunctions,

    // Getters - BCP
    activeBCPs,
    draftBCPs,
    approvedBCPs,
    archivedBCPs,
    overdueBCPs,
    totalBCPs,
    bcpCompletionRate,

    // Getters - Exercise Tests
    upcomingTests,
    passedTests,
    failedTests,
    testsByType,
    totalExerciseTests,
    testPassRate,

    // Getters - Recovery Strategies
    primaryStrategies,
    activeStrategies,
    highSuccessRateStrategies,
    totalRecoveryStrategies,

    // Getters - Overall
    hasData,
    isEmpty,
    overallHealth,
    healthStatus,

    // Actions
    loadAll,
    loadFunctions,
    loadPlans,
    loadTests,
    loadStrategies,
    loadAssessments,
    loadMetrics,
    refresh,
    clear,
    startAutoRefresh,
    stopAutoRefresh,

    // Critical Function Actions
    loadCriticalFunction,
    createCriticalFunction,
    updateCriticalFunction,
    deleteCriticalFunction,

    // BIA Actions
    loadBIA,
    createBIA,
    updateBIA,
    deleteBIA,

    // BCP Actions
    loadBCP,
    createBCP,
    updateBCP,
    approveBCP,
    archiveBCP,
    activateBCP,
    deleteBCP,

    // Template Actions
    loadBCPTemplates,
    createBCPTemplate,
    updateBCPTemplate,
    deleteBCPTemplate,
    applyTemplate,

    // Recovery Strategy Actions
    createRecoveryStrategy,
    updateRecoveryStrategy,
    deleteRecoveryStrategy,

    // Exercise Test Actions
    createExerciseTest,
    updateExerciseTest,
    recordTestResult,
    deleteExerciseTest,

    // Utils
    isInitialLoad,
    currentOrganisationId,
  }
}

export default useBcm