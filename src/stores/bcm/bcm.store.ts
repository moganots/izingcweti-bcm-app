import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { bcmService } from './../../services/api/bcm/BcmService'
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
  BCMDashboardData,
  TestStatistics,
} from './../../models/entities/bcm/bcm.entity'

export const useBcmStore = defineStore('bcm', () => {
  // ============================================
  // State - Critical Functions
  // ============================================
  const criticalFunctions = ref<CriticalFunction[]>([])
  const selectedFunction = ref<CriticalFunction | null>(null)
  const isLoadingFunctions = ref(false)
  const functionsError = ref<string | null>(null)
  const functionsPagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 })

  // ============================================
  // State - BIA
  // ============================================
  const bias = ref<BusinessImpactAssessment[]>([])
  const selectedBIA = ref<BusinessImpactAssessment | null>(null)
  const isLoadingBIA = ref(false)
  const biaError = ref<string | null>(null)
  const biaPagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 })

  // ============================================
  // State - BCP
  // ============================================
  const bcps = ref<BusinessContinuityPlan[]>([])
  const selectedBCP = ref<BusinessContinuityPlan | null>(null)
  const isLoadingBCP = ref(false)
  const bcpError = ref<string | null>(null)
  const bcpPagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 })

  // ============================================
  // State - BCP Templates
  // ============================================
  const bcpTemplates = ref<BCPTemplate[]>([])
  const selectedTemplate = ref<BCPTemplate | null>(null)
  const isLoadingTemplates = ref(false)
  const templatesError = ref<string | null>(null)

  // ============================================
  // State - Recovery Strategies
  // ============================================
  const recoveryStrategies = ref<RecoveryStrategy[]>([])
  const isLoadingStrategies = ref(false)
  const strategiesError = ref<string | null>(null)
  const strategiesPagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 })

  // ============================================
  // State - Exercise Tests
  // ============================================
  const exerciseTests = ref<ExerciseTest[]>([])
  const isLoadingTests = ref(false)
  const testsError = ref<string | null>(null)
  const testsPagination = ref({ page: 1, limit: 20, total: 0, totalPages: 1 })

  // ============================================
  // State - Metrics
  // ============================================
  const metrics = ref<BCMMetrics | null>(null)
  const isLoadingMetrics = ref(false)
  const metricsError = ref<string | null>(null)

  // ============================================
  // Getters - Critical Functions
  // ============================================
  const functionsByPriority = computed(() => {
    const grouped: Record<string, CriticalFunction[]> = {}
    criticalFunctions.value.forEach((fn) => {
      const priority = fn.recoveryPriority || 'UNKNOWN'
      if (!grouped[priority]) grouped[priority] = []
      grouped[priority].push(fn)
    })
    return grouped
  })

  const functionsRequiringBCP = computed(() => 
    criticalFunctions.value.filter((fn) => fn.requiresBcp)
  )

  const activeFunctions = computed(() =>
    criticalFunctions.value.filter((fn) => fn.isActive)
  )

  // ============================================
  // Getters - BCP
  // ============================================
  const activeBCPs = computed(() =>
    bcps.value.filter((b) => b.planStatus === 'ACTIVE')
  )

  const draftBCPs = computed(() =>
    bcps.value.filter((b) => b.planStatus === 'DRAFT')
  )

  const approvedBCPs = computed(() =>
    bcps.value.filter((b) => b.planStatus === 'APPROVED')
  )

  const archivedBCPs = computed(() =>
    bcps.value.filter((b) => b.planStatus === 'ARCHIVED')
  )

  const overdueBCPs = computed(() =>
    bcps.value.filter((b) => {
      const dueDate = new Date(b.reviewDueDate)
      return dueDate < new Date()
    })
  )

  // ============================================
  // Getters - Exercise Tests
  // ============================================
  const upcomingTests = computed(() =>
    exerciseTests.value.filter((t) => new Date(t.scheduledDate) >= new Date() && !t.passed)
  )

  const passedTests = computed(() =>
    exerciseTests.value.filter((t) => t.passed)
  )

  const failedTests = computed(() =>
    exerciseTests.value.filter((t) => !t.passed && new Date(t.scheduledDate) < new Date())
  )

  const testsByType = computed(() => {
    const grouped: Record<string, ExerciseTest[]> = {}
    exerciseTests.value.forEach((test) => {
      const type = test.exerciseTestType || 'UNKNOWN'
      if (!grouped[type]) grouped[type] = []
      grouped[type].push(test)
    })
    return grouped
  })

  // ============================================
  // Getters - Recovery Strategies
  // ============================================
  const primaryStrategies = computed(() =>
    recoveryStrategies.value.filter((s) => s.isPrimary)
  )

  const activeStrategies = computed(() =>
    recoveryStrategies.value.filter((s) => s.isActive)
  )

  const highSuccessRateStrategies = computed(() =>
    recoveryStrategies.value.filter((s) => s.testSuccessRate >= 80)
  )

  // ============================================
  // Getters - Overall
  // ============================================
  const hasData = computed(() =>
    criticalFunctions.value.length > 0 ||
    bcps.value.length > 0 ||
    exerciseTests.value.length > 0
  )

  const isEmpty = computed(() =>
    !isLoadingFunctions.value &&
    !isLoadingBCP.value &&
    !isLoadingTests.value &&
    criticalFunctions.value.length === 0 &&
    bcps.value.length === 0 &&
    exerciseTests.value.length === 0
  )

  // ============================================
  // Actions - Critical Functions
  // ============================================

  async function loadCriticalFunctions(params?: CriticalFunctionQueryParams): Promise<void> {
    isLoadingFunctions.value = true
    functionsError.value = null

    try {
      const response = await bcmService.getCriticalFunctions({
        ...params,
        page: params?.page || functionsPagination.value.page,
        limit: params?.limit || functionsPagination.value.limit,
      })
      criticalFunctions.value = response.data || []
      functionsPagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      }
    } catch (error: any) {
      console.error('Failed to load critical functions:', error)
      functionsError.value = error.message || 'Failed to load critical functions'
    } finally {
      isLoadingFunctions.value = false
    }
  }

  async function loadCriticalFunction(id: string): Promise<void> {
    try {
      const data = await bcmService.getCriticalFunction(id)
      selectedFunction.value = data
    } catch (error: any) {
      console.error('Failed to load critical function:', error)
      throw error
    }
  }

  async function createCriticalFunction(data: CreateCriticalFunctionRequest): Promise<CriticalFunction> {
    try {
      const created = await bcmService.createCriticalFunction(data)
      criticalFunctions.value.unshift(created)
      return created
    } catch (error: any) {
      console.error('Failed to create critical function:', error)
      throw error
    }
  }

  async function updateCriticalFunction(id: string, data: UpdateCriticalFunctionRequest): Promise<CriticalFunction> {
    try {
      const updated = await bcmService.updateCriticalFunction(id, data)
      const index = criticalFunctions.value.findIndex((f) => f.uuid === id)
      if (index !== -1) {
        criticalFunctions.value[index] = updated
      }
      if (selectedFunction.value?.uuid === id) {
        selectedFunction.value = updated
      }
      return updated
    } catch (error: any) {
      console.error('Failed to update critical function:', error)
      throw error
    }
  }

  async function deleteCriticalFunction(id: string): Promise<void> {
    try {
      await bcmService.deleteCriticalFunction(id)
      criticalFunctions.value = criticalFunctions.value.filter((f) => f.uuid !== id)
      if (selectedFunction.value?.uuid === id) {
        selectedFunction.value = null
      }
    } catch (error: any) {
      console.error('Failed to delete critical function:', error)
      throw error
    }
  }

  // ============================================
  // Actions - BIA
  // ============================================

  async function loadBIAs(params?: BIAQueryParams): Promise<void> {
    isLoadingBIA.value = true
    biaError.value = null

    try {
      const response = await bcmService.getBIAs({
        ...params,
        page: params?.page || biaPagination.value.page,
        limit: params?.limit || biaPagination.value.limit,
      })
      bias.value = response.data || []
      biaPagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      }
    } catch (error: any) {
      console.error('Failed to load BIAs:', error)
      biaError.value = error.message || 'Failed to load BIAs'
    } finally {
      isLoadingBIA.value = false
    }
  }

  async function loadBIA(id: string): Promise<void> {
    try {
      const data = await bcmService.getBIA(id)
      selectedBIA.value = data
    } catch (error: any) {
      console.error('Failed to load BIA:', error)
      throw error
    }
  }

  async function createBIA(data: CreateBIARequest): Promise<BusinessImpactAssessment> {
    try {
      const created = await bcmService.createBIA(data)
      bias.value.unshift(created)
      return created
    } catch (error: any) {
      console.error('Failed to create BIA:', error)
      throw error
    }
  }

  async function updateBIA(id: string, data: UpdateBIARequest): Promise<BusinessImpactAssessment> {
    try {
      const updated = await bcmService.updateBIA(id, data)
      const index = bias.value.findIndex((b) => b.uuid === id)
      if (index !== -1) {
        bias.value[index] = updated
      }
      if (selectedBIA.value?.uuid === id) {
        selectedBIA.value = updated
      }
      return updated
    } catch (error: any) {
      console.error('Failed to update BIA:', error)
      throw error
    }
  }

  async function deleteBIA(id: string): Promise<void> {
    try {
      await bcmService.deleteBIA(id)
      bias.value = bias.value.filter((b) => b.uuid !== id)
      if (selectedBIA.value?.uuid === id) {
        selectedBIA.value = null
      }
    } catch (error: any) {
      console.error('Failed to delete BIA:', error)
      throw error
    }
  }

  // ============================================
  // Actions - BCP
  // ============================================

  async function loadBCPs(params?: BCPQueryParams): Promise<void> {
    isLoadingBCP.value = true
    bcpError.value = null

    try {
      const response = await bcmService.getBCPs({
        ...params,
        page: params?.page || bcpPagination.value.page,
        limit: params?.limit || bcpPagination.value.limit,
      })
      bcps.value = response.data || []
      bcpPagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      }
    } catch (error: any) {
      console.error('Failed to load BCPs:', error)
      bcpError.value = error.message || 'Failed to load BCPs'
    } finally {
      isLoadingBCP.value = false
    }
  }

  async function loadBCP(id: string): Promise<void> {
    try {
      const data = await bcmService.getBCP(id)
      selectedBCP.value = data
    } catch (error: any) {
      console.error('Failed to load BCP:', error)
      throw error
    }
  }

  async function createBCP(data: CreateBCPRequest): Promise<BusinessContinuityPlan> {
    try {
      const created = await bcmService.createBCP(data)
      bcps.value.unshift(created)
      return created
    } catch (error: any) {
      console.error('Failed to create BCP:', error)
      throw error
    }
  }

  async function updateBCP(id: string, data: UpdateBCPRequest): Promise<BusinessContinuityPlan> {
    try {
      const updated = await bcmService.updateBCP(id, data)
      const index = bcps.value.findIndex((b) => b.uuid === id)
      if (index !== -1) {
        bcps.value[index] = updated
      }
      if (selectedBCP.value?.uuid === id) {
        selectedBCP.value = updated
      }
      return updated
    } catch (error: any) {
      console.error('Failed to update BCP:', error)
      throw error
    }
  }

  async function approveBCP(id: string): Promise<BusinessContinuityPlan> {
    try {
      const approved = await bcmService.approveBCP(id)
      updateLocalBCP(id, approved)
      return approved
    } catch (error: any) {
      console.error('Failed to approve BCP:', error)
      throw error
    }
  }

  async function archiveBCP(id: string): Promise<BusinessContinuityPlan> {
    try {
      const archived = await bcmService.archiveBCP(id)
      updateLocalBCP(id, archived)
      return archived
    } catch (error: any) {
      console.error('Failed to archive BCP:', error)
      throw error
    }
  }

  async function activateBCP(id: string): Promise<BusinessContinuityPlan> {
    try {
      const activated = await bcmService.activateBCP(id)
      updateLocalBCP(id, activated)
      return activated
    } catch (error: any) {
      console.error('Failed to activate BCP:', error)
      throw error
    }
  }

  async function deleteBCP(id: string): Promise<void> {
    try {
      await bcmService.deleteBCP(id)
      bcps.value = bcps.value.filter((b) => b.uuid !== id)
      if (selectedBCP.value?.uuid === id) {
        selectedBCP.value = null
      }
    } catch (error: any) {
      console.error('Failed to delete BCP:', error)
      throw error
    }
  }

  // ============================================
  // Actions - BCP Templates
  // ============================================

  async function loadBCPTemplates(params?: { category?: string; tags?: string[] }): Promise<void> {
    isLoadingTemplates.value = true
    templatesError.value = null

    try {
      const response = await bcmService.getBCPTemplates(params)
      bcpTemplates.value = response.data || []
    } catch (error: any) {
      console.error('Failed to load BCP templates:', error)
      templatesError.value = error.message || 'Failed to load BCP templates'
    } finally {
      isLoadingTemplates.value = false
    }
  }

  async function createBCPTemplate(data: CreateBCPTemplateRequest): Promise<BCPTemplate> {
    try {
      const created = await bcmService.createBCPTemplate(data)
      bcpTemplates.value.unshift(created)
      return created
    } catch (error: any) {
      console.error('Failed to create BCP template:', error)
      throw error
    }
  }

  async function updateBCPTemplate(id: string, data: UpdateBCPTemplateRequest): Promise<BCPTemplate> {
    try {
      const updated = await bcmService.updateBCPTemplate(id, data)
      const index = bcpTemplates.value.findIndex((t) => t.uuid === id)
      if (index !== -1) {
        bcpTemplates.value[index] = updated
      }
      if (selectedTemplate.value?.uuid === id) {
        selectedTemplate.value = updated
      }
      return updated
    } catch (error: any) {
      console.error('Failed to update BCP template:', error)
      throw error
    }
  }

  async function deleteBCPTemplate(id: string): Promise<void> {
    try {
      await bcmService.deleteBCPTemplate(id)
      bcpTemplates.value = bcpTemplates.value.filter((t) => t.uuid !== id)
      if (selectedTemplate.value?.uuid === id) {
        selectedTemplate.value = null
      }
    } catch (error: any) {
      console.error('Failed to delete BCP template:', error)
      throw error
    }
  }

  async function applyTemplate(templateId: string, data: ApplyTemplateRequest): Promise<BusinessContinuityPlan> {
    try {
      const result = await bcmService.applyTemplate(templateId, data)
      bcps.value.unshift(result)
      return result
    } catch (error: any) {
      console.error('Failed to apply template:', error)
      throw error
    }
  }

  // ============================================
  // Actions - Recovery Strategies
  // ============================================

  async function loadRecoveryStrategies(params?: RecoveryStrategyQueryParams): Promise<void> {
    isLoadingStrategies.value = true
    strategiesError.value = null

    try {
      const response = await bcmService.getRecoveryStrategies({
        ...params,
        page: params?.page || strategiesPagination.value.page,
        limit: params?.limit || strategiesPagination.value.limit,
      })
      recoveryStrategies.value = response.data || []
      strategiesPagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      }
    } catch (error: any) {
      console.error('Failed to load recovery strategies:', error)
      strategiesError.value = error.message || 'Failed to load recovery strategies'
    } finally {
      isLoadingStrategies.value = false
    }
  }

  async function createRecoveryStrategy(data: CreateRecoveryStrategyRequest): Promise<RecoveryStrategy> {
    try {
      const created = await bcmService.createRecoveryStrategy(data)
      recoveryStrategies.value.unshift(created)
      return created
    } catch (error: any) {
      console.error('Failed to create recovery strategy:', error)
      throw error
    }
  }

  async function updateRecoveryStrategy(id: string, data: UpdateRecoveryStrategyRequest): Promise<RecoveryStrategy> {
    try {
      const updated = await bcmService.updateRecoveryStrategy(id, data)
      const index = recoveryStrategies.value.findIndex((r) => r.uuid === id)
      if (index !== -1) {
        recoveryStrategies.value[index] = updated
      }
      return updated
    } catch (error: any) {
      console.error('Failed to update recovery strategy:', error)
      throw error
    }
  }

  async function deleteRecoveryStrategy(id: string): Promise<void> {
    try {
      await bcmService.deleteRecoveryStrategy(id)
      recoveryStrategies.value = recoveryStrategies.value.filter((r) => r.uuid !== id)
    } catch (error: any) {
      console.error('Failed to delete recovery strategy:', error)
      throw error
    }
  }

  // ============================================
  // Actions - Exercise Tests
  // ============================================

  async function loadExerciseTests(params?: ExerciseTestQueryParams): Promise<void> {
    isLoadingTests.value = true
    testsError.value = null

    try {
      const response = await bcmService.getExerciseTests({
        ...params,
        page: params?.page || testsPagination.value.page,
        limit: params?.limit || testsPagination.value.limit,
      })
      exerciseTests.value = response.data || []
      testsPagination.value = {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      }
    } catch (error: any) {
      console.error('Failed to load exercise tests:', error)
      testsError.value = error.message || 'Failed to load exercise tests'
    } finally {
      isLoadingTests.value = false
    }
  }

  async function createExerciseTest(data: CreateExerciseTestRequest): Promise<ExerciseTest> {
    try {
      const created = await bcmService.createExerciseTest(data)
      exerciseTests.value.unshift(created)
      return created
    } catch (error: any) {
      console.error('Failed to create exercise test:', error)
      throw error
    }
  }

  async function updateExerciseTest(id: string, data: UpdateExerciseTestRequest): Promise<ExerciseTest> {
    try {
      const updated = await bcmService.updateExerciseTest(id, data)
      const index = exerciseTests.value.findIndex((t) => t.uuid === id)
      if (index !== -1) {
        exerciseTests.value[index] = updated
      }
      return updated
    } catch (error: any) {
      console.error('Failed to update exercise test:', error)
      throw error
    }
  }

  async function recordTestResult(id: string, data: RecordTestResultRequest): Promise<ExerciseTest> {
    try {
      const result = await bcmService.recordTestResult(id, data)
      const index = exerciseTests.value.findIndex((t) => t.uuid === id)
      if (index !== -1) {
        exerciseTests.value[index] = result
      }
      return result
    } catch (error: any) {
      console.error('Failed to record test result:', error)
      throw error
    }
  }

  async function deleteExerciseTest(id: string): Promise<void> {
    try {
      await bcmService.deleteExerciseTest(id)
      exerciseTests.value = exerciseTests.value.filter((t) => t.uuid !== id)
    } catch (error: any) {
      console.error('Failed to delete exercise test:', error)
      throw error
    }
  }

  // ============================================
  // Actions - Metrics
  // ============================================

  async function loadMetrics(organisationId?: string): Promise<void> {
    isLoadingMetrics.value = true
    metricsError.value = null

    try {
      const data = await bcmService.getBCMMetrics(organisationId)
      metrics.value = data
    } catch (error: any) {
      console.error('Failed to load BCM metrics:', error)
      metricsError.value = error.message || 'Failed to load BCM metrics'
    } finally {
      isLoadingMetrics.value = false
    }
  }

  // ============================================
  // Private Helpers
  // ============================================

  function updateLocalBCP(id: string, updated: BusinessContinuityPlan): void {
    const index = bcps.value.findIndex((b) => b.uuid === id)
    if (index !== -1) {
      bcps.value[index] = updated
    }
    if (selectedBCP.value?.uuid === id) {
      selectedBCP.value = updated
    }
  }

  // ============================================
  // Clear State
  // ============================================

  function clearAll(): void {
    criticalFunctions.value = []
    selectedFunction.value = null
    bias.value = []
    selectedBIA.value = null
    bcps.value = []
    selectedBCP.value = null
    bcpTemplates.value = []
    selectedTemplate.value = null
    recoveryStrategies.value = []
    exerciseTests.value = []
    metrics.value = null
    functionsError.value = null
    biaError.value = null
    bcpError.value = null
    templatesError.value = null
    strategiesError.value = null
    testsError.value = null
    metricsError.value = null
  }

  // ============================================
  // Return Store Interface
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

    // Getters - BCP
    activeBCPs,
    draftBCPs,
    approvedBCPs,
    archivedBCPs,
    overdueBCPs,

    // Getters - Exercise Tests
    upcomingTests,
    passedTests,
    failedTests,
    testsByType,

    // Getters - Recovery Strategies
    primaryStrategies,
    activeStrategies,
    highSuccessRateStrategies,

    // Getters - Overall
    hasData,
    isEmpty,

    // Actions - Critical Functions
    loadCriticalFunctions,
    loadCriticalFunction,
    createCriticalFunction,
    updateCriticalFunction,
    deleteCriticalFunction,

    // Actions - BIA
    loadBIAs,
    loadBIA,
    createBIA,
    updateBIA,
    deleteBIA,

    // Actions - BCP
    loadBCPs,
    loadBCP,
    createBCP,
    updateBCP,
    approveBCP,
    archiveBCP,
    activateBCP,
    deleteBCP,

    // Actions - BCP Templates
    loadBCPTemplates,
    createBCPTemplate,
    updateBCPTemplate,
    deleteBCPTemplate,
    applyTemplate,

    // Actions - Recovery Strategies
    loadRecoveryStrategies,
    createRecoveryStrategy,
    updateRecoveryStrategy,
    deleteRecoveryStrategy,

    // Actions - Exercise Tests
    loadExerciseTests,
    createExerciseTest,
    updateExerciseTest,
    recordTestResult,
    deleteExerciseTest,

    // Actions - Metrics
    loadMetrics,

    // Utils
    clearAll,
  }
})