import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  CriticalFunction,
  BusinessImpactAssessment,
  BusinessContinuityPlan,
  RecoveryStrategy,
  ExerciseTest,
} from './../../models/entities'
import { bcmService } from './../../services/api'

export const useBcmStore = defineStore('bcm', () => {
  // ============================================
  // State - Critical Functions
  // ============================================
  const criticalFunctions = ref<CriticalFunction[]>([])
  const selectedFunction = ref<CriticalFunction | null>(null)
  const isLoadingFunctions = ref(false)
  const functionsError = ref<string | null>(null)

  // ============================================
  // State - BIA
  // ============================================
  const bias = ref<BusinessImpactAssessment[]>([])
  const selectedBIA = ref<BusinessImpactAssessment | null>(null)
  const isLoadingBIA = ref(false)
  const biaError = ref<string | null>(null)

  // ============================================
  // State - BCP
  // ============================================
  const bcps = ref<BusinessContinuityPlan[]>([])
  const selectedBCP = ref<BusinessContinuityPlan | null>(null)
  const isLoadingBCP = ref(false)
  const bcpError = ref<string | null>(null)

  const activeBCPs = computed(() => bcps.value.filter((b) => b.plan_status === 'Active'))

  const draftBCPs = computed(() => bcps.value.filter((b) => b.plan_status === 'Draft'))

  const approvedBCPs = computed(() => bcps.value.filter((b) => b.plan_status === 'Approved'))

  // ============================================
  // State - Recovery Strategies
  // ============================================
  const recoveryStrategies = ref<RecoveryStrategy[]>([])
  const isLoadingStrategies = ref(false)
  const strategiesError = ref<string | null>(null)

  // ============================================
  // State - Exercise Tests
  // ============================================
  const exerciseTests = ref<ExerciseTest[]>([])
  const isLoadingTests = ref(false)
  const testsError = ref<string | null>(null)

  const upcomingTests = computed(() =>
    exerciseTests.value.filter((t) => new Date(t.date) >= new Date() && !t.passed)
  )

  const passedTests = computed(() => exerciseTests.value.filter((t) => t.passed))

  const failedTests = computed(() =>
    exerciseTests.value.filter((t) => !t.passed && new Date(t.date) < new Date())
  )

  // ============================================
  // Actions - Critical Functions
  // ============================================

  async function loadCriticalFunctions(filters?: Record<string, unknown>): Promise<void> {
    isLoadingFunctions.value = true
    functionsError.value = null

    try {
      const response = await bcmService.getCriticalFunctions(filters)
      criticalFunctions.value = response.data || []
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

  async function createCriticalFunction(
    data: Partial<CriticalFunction>
  ): Promise<CriticalFunction> {
    const created = await bcmService.createCriticalFunction(data)
    await loadCriticalFunctions()
    return created
  }

  async function updateCriticalFunction(
    id: string,
    data: Partial<CriticalFunction>
  ): Promise<CriticalFunction> {
    const updated = await bcmService.updateCriticalFunction(id, data)
    // Update in local list
    const index = criticalFunctions.value.findIndex((f) => f.uuid === id)
    if (index !== -1) {
      criticalFunctions.value[index] = updated
    }
    if (selectedFunction.value?.uuid === id) {
      selectedFunction.value = updated
    }
    return updated
  }

  async function deleteCriticalFunction(id: string): Promise<void> {
    await bcmService.deleteCriticalFunction(id)
    criticalFunctions.value = criticalFunctions.value.filter((f) => f.uuid !== id)
    if (selectedFunction.value?.uuid === id) {
      selectedFunction.value = null
    }
  }

  // ============================================
  // Actions - BIA
  // ============================================

  async function loadBIAs(filters?: Record<string, unknown>): Promise<void> {
    isLoadingBIA.value = true
    biaError.value = null

    try {
      const response = await bcmService.getBIAs(filters)
      bias.value = response.data || []
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

  async function createBIA(
    data: Partial<BusinessImpactAssessment>
  ): Promise<BusinessImpactAssessment> {
    const created = await bcmService.createBIA(data)
    await loadBIAs()
    return created
  }

  async function updateBIA(
    id: string,
    data: Partial<BusinessImpactAssessment>
  ): Promise<BusinessImpactAssessment> {
    const updated = await bcmService.updateBIA(id, data)
    const index = bias.value.findIndex((b) => b.uuid === id)
    if (index !== -1) {
      bias.value[index] = updated
    }
    if (selectedBIA.value?.uuid === id) {
      selectedBIA.value = updated
    }
    return updated
  }

  // ============================================
  // Actions - BCP
  // ============================================

  async function loadBCPs(filters?: Record<string, unknown>): Promise<void> {
    isLoadingBCP.value = true
    bcpError.value = null

    try {
      const response = await bcmService.getBCPs(filters)
      bcps.value = response.data || []
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

  async function createBCP(data: Partial<BusinessContinuityPlan>): Promise<BusinessContinuityPlan> {
    const created = await bcmService.createBCP(data)
    await loadBCPs()
    return created
  }

  async function updateBCP(
    id: string,
    data: Partial<BusinessContinuityPlan>
  ): Promise<BusinessContinuityPlan> {
    const updated = await bcmService.updateBCP(id, data)
    const index = bcps.value.findIndex((b) => b.uuid === id)
    if (index !== -1) {
      bcps.value[index] = updated
    }
    if (selectedBCP.value?.uuid === id) {
      selectedBCP.value = updated
    }
    return updated
  }

  async function approveBCP(id: string): Promise<BusinessContinuityPlan> {
    const approved = await bcmService.approveBCP(id)
    const index = bcps.value.findIndex((b) => b.uuid === id)
    if (index !== -1) {
      bcps.value[index] = approved
    }
    if (selectedBCP.value?.uuid === id) {
      selectedBCP.value = approved
    }
    return approved
  }

  async function archiveBCP(id: string): Promise<BusinessContinuityPlan> {
    const archived = await bcmService.archiveBCP(id)
    const index = bcps.value.findIndex((b) => b.uuid === id)
    if (index !== -1) {
      bcps.value[index] = archived
    }
    return archived
  }

  async function activateBCP(id: string): Promise<BusinessContinuityPlan> {
    const activated = await bcmService.activateBCP(id)
    const index = bcps.value.findIndex((b) => b.uuid === id)
    if (index !== -1) {
      bcps.value[index] = activated
    }
    return activated
  }

  // ============================================
  // Actions - Recovery Strategies
  // ============================================

  async function loadRecoveryStrategies(filters?: Record<string, unknown>): Promise<void> {
    isLoadingStrategies.value = true
    strategiesError.value = null

    try {
      const response = await bcmService.getRecoveryStrategies(filters)
      recoveryStrategies.value = response.data || []
    } catch (error: any) {
      console.error('Failed to load recovery strategies:', error)
      strategiesError.value = error.message || 'Failed to load recovery strategies'
    } finally {
      isLoadingStrategies.value = false
    }
  }

  async function createRecoveryStrategy(
    data: Partial<RecoveryStrategy>
  ): Promise<RecoveryStrategy> {
    const created = await bcmService.createRecoveryStrategy(data)
    await loadRecoveryStrategies()
    return created
  }

  async function updateRecoveryStrategy(
    id: string,
    data: Partial<RecoveryStrategy>
  ): Promise<RecoveryStrategy> {
    const updated = await bcmService.updateRecoveryStrategy(id, data)
    const index = recoveryStrategies.value.findIndex((r) => r.uuid === id)
    if (index !== -1) {
      recoveryStrategies.value[index] = updated
    }
    return updated
  }

  async function deleteRecoveryStrategy(id: string): Promise<void> {
    await bcmService.deleteRecoveryStrategy(id)
    recoveryStrategies.value = recoveryStrategies.value.filter((r) => r.uuid !== id)
  }

  // ============================================
  // Actions - Exercise Tests
  // ============================================

  async function loadExerciseTests(filters?: Record<string, unknown>): Promise<void> {
    isLoadingTests.value = true
    testsError.value = null

    try {
      const response = await bcmService.getExerciseTests(filters)
      exerciseTests.value = response.data || []
    } catch (error: any) {
      console.error('Failed to load exercise tests:', error)
      testsError.value = error.message || 'Failed to load exercise tests'
    } finally {
      isLoadingTests.value = false
    }
  }

  async function createExerciseTest(data: Partial<ExerciseTest>): Promise<ExerciseTest> {
    const created = await bcmService.createExerciseTest(data)
    await loadExerciseTests()
    return created
  }

  async function recordTestResult(
    id: string,
    data: { passed: boolean; lessons_learned: string; corrective_actions: string }
  ): Promise<ExerciseTest> {
    const result = await bcmService.recordTestResult(id, data)
    const index = exerciseTests.value.findIndex((t) => t.uuid === id)
    if (index !== -1) {
      exerciseTests.value[index] = result
    }
    return result
  }

  // ============================================
  // Return store interface
  // ============================================
  return {
    // Critical Functions
    criticalFunctions,
    selectedFunction,
    isLoadingFunctions,
    functionsError,
    loadCriticalFunctions,
    loadCriticalFunction,
    createCriticalFunction,
    updateCriticalFunction,
    deleteCriticalFunction,
    // BIA
    bias,
    selectedBIA,
    isLoadingBIA,
    biaError,
    loadBIAs,
    loadBIA,
    createBIA,
    updateBIA,
    // BCP
    bcps,
    selectedBCP,
    isLoadingBCP,
    bcpError,
    activeBCPs,
    draftBCPs,
    approvedBCPs,
    loadBCPs,
    loadBCP,
    createBCP,
    updateBCP,
    approveBCP,
    archiveBCP,
    activateBCP,
    // Recovery Strategies
    recoveryStrategies,
    isLoadingStrategies,
    strategiesError,
    loadRecoveryStrategies,
    createRecoveryStrategy,
    updateRecoveryStrategy,
    deleteRecoveryStrategy,
    // Exercise Tests
    exerciseTests,
    isLoadingTests,
    testsError,
    upcomingTests,
    passedTests,
    failedTests,
    loadExerciseTests,
    createExerciseTest,
    recordTestResult,
  }
})
