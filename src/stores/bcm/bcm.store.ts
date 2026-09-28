import { defineStore } from 'pinia'
import { computed } from 'vue'
import type {
  CriticalFunction,
  BusinessImpactAssessment,
  BusinessContinuityPlan,
  BCPTemplate,
  RecoveryStrategy,
  ExerciseTest,
  Incident,
  BCMLifecycleStatus,
} from '../../models/bcm/bcm.entity'
import {
  BCMPlanStatus,
  RecoveryPriority,
  IncidentStatus,
  IncidentSeverity,
} from '../../models/bcm/bcm.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'

// ============================================
// Critical Functions Store
// ============================================
export const useCriticalFunctionStore = createOfflineCrudStore<CriticalFunction>({
  storeId: 'critical-functions',
  tableName: 'criticalFunctions',
})

// ============================================
// Business Impact Assessments Store
// ============================================
export const useBIAStore = createOfflineCrudStore<BusinessImpactAssessment>({
  storeId: 'business-impact-assessments',
  tableName: 'businessImpactAssessments',
})

// ============================================
// Business Continuity Plans Store
// ============================================
export const useBusinessContinuityPlanStore = createOfflineCrudStore<BusinessContinuityPlan>({
  storeId: 'business-continuity-plans',
  tableName: 'businessContinuityPlans',
})

// ============================================
// BCP Templates Store
// ============================================
export const useBCPTemplateStore = createOfflineCrudStore<BCPTemplate>({
  storeId: 'bcp-templates',
  tableName: 'bcpTemplates',
})

// ============================================
// Recovery Strategies Store
// ============================================
export const useRecoveryStrategyStore = createOfflineCrudStore<RecoveryStrategy>({
  storeId: 'recovery-strategies',
  tableName: 'recoveryStrategies',
})

// ============================================
// Exercise Tests Store
// ============================================
export const useExerciseTestStore = createOfflineCrudStore<ExerciseTest>({
  storeId: 'exercise-tests',
  tableName: 'exerciseTests',
})

// ============================================
// Incidents Store
// ============================================
export const useIncidentStore = createOfflineCrudStore<Incident>({
  storeId: 'incidents',
  tableName: 'incidents',
})

// ============================================
// BCM Lifecycle Status Store
// ============================================
export const useBCMLifecycleStatusStore = createOfflineCrudStore<BCMLifecycleStatus>({
  storeId: 'bcm-lifecycle-statuses',
  tableName: 'bcmLifecycleStatuses',
})

// ============================================
// Main BCM Store (facade with computed aggregations)
// ============================================
export const useBcmStore = defineStore('bcm', () => {
  const criticalFunctionStore = useCriticalFunctionStore()
  const biaStore = useBIAStore()
  const bcpStore = useBusinessContinuityPlanStore()
  const templateStore = useBCPTemplateStore()
  const strategyStore = useRecoveryStrategyStore()
  const testStore = useExerciseTestStore()
  const incidentStore = useIncidentStore()

  // ============================================
  // Getters - Critical Functions
  // ============================================
  const criticalFunctions = criticalFunctionStore.items
  const functionsByPriority = computed(() => {
    const grouped: Record<string, CriticalFunction[]> = {}
    criticalFunctions?.forEach((fn) => {
      const priority = fn.recoveryPriority || RecoveryPriority.MEDIUM
      if (!grouped[priority]) grouped[priority] = []
      grouped[priority].push(fn)
    })
    return grouped
  })

  const functionsRequiringBCP = computed(() =>
    criticalFunctions?.filter((fn) => fn.requiresBcp)
  )

  const activeFunctions = computed(() =>
    criticalFunctions?.filter((fn) => fn.isActive)
  )

  // ============================================
  // Getters - BCPs
  // ============================================
  const bcps = bcpStore.items
  const activeBCPs = computed(() =>
    bcps?.filter((b) => b.planStatus === BCMPlanStatus.ACTIVE)
  )

  const draftBCPs = computed(() =>
    bcps?.filter((b) => b.planStatus === BCMPlanStatus.DRAFT)
  )

  const approvedBCPs = computed(() =>
    bcps?.filter(
      (b) =>
        b.planStatus === BCMPlanStatus.APPROVED ||
        b.planStatus === BCMPlanStatus.ACTIVE
    )
  )

  const overdueBCPs = computed(() =>
    bcps?.filter((b) => new Date(b.reviewDueDate) < new Date())
  )

  // ============================================
  // Getters - Exercise Tests
  // ============================================
  const exerciseTests = testStore.items
  const upcomingTests = computed(() =>
    exerciseTests?.filter(
      (t) => new Date(t.scheduledDate) >= new Date() && !t.executedDate
    )
  )

  const passedTests = computed(() => exerciseTests?.filter((t) => t.passed))
  const failedTests = computed(() =>
    exerciseTests?.filter(
      (t) => !t.passed && t.executedDate && new Date(t.executedDate) < new Date()
    )
  )

  // ============================================
  // Getters - Incidents
  // ============================================
  const incidents = incidentStore.items
  const activeIncidents = computed(() =>
    incidents?.filter(
      (i) =>
        i.incidentStatus !== IncidentStatus.CLOSED &&
        i.incidentStatus !== IncidentStatus.RESOLVED
    )
  )

  const criticalIncidents = computed(() =>
    activeIncidents?.value?.filter((i) => i.incidentSeverity === IncidentSeverity.CRITICAL)
  )

  // ============================================
  // Actions
  // ============================================
  async function initialize(): Promise<void> {
    await Promise.all([
      criticalFunctionStore.initialize(),
      biaStore.initialize(),
      bcpStore.initialize(),
      templateStore.initialize(),
      strategyStore.initialize(),
      testStore.initialize(),
      incidentStore.initialize(),
    ])
  }

  async function approveBCP(id: string, userId: string): Promise<BusinessContinuityPlan | null> {
    return bcpStore.update(id, {
      planStatus: BCMPlanStatus.APPROVED,
      approvedBy: userId,
      approvalDate: new Date(),
    } as Partial<BusinessContinuityPlan>)
  }

  async function archiveBCP(id: string): Promise<BusinessContinuityPlan | null> {
    return bcpStore.update(id, {
      planStatus: BCMPlanStatus.ARCHIVED,
      isActive: false,
    } as Partial<BusinessContinuityPlan>)
  }

  async function recordTestResult(
    id: string,
    data: { passed: boolean; lessonsLearned: string; correctiveActions?: string }
  ): Promise<ExerciseTest | null> {
    return testStore.update(id, {
      ...data,
      executedDate: new Date(),
    } as Partial<ExerciseTest>)
  }

  async function closeIncident(id: string, resolutionNotes: string): Promise<Incident | null> {
    return incidentStore.update(id, {
      incidentStatus: IncidentStatus.CLOSED,
      closedAt: new Date(),
      resolutionNotes,
    } as Partial<Incident>)
  }

  async function escalateIncident(
    id: string,
    data: {
      escalationLevel: string
      escalatedTo: string
      reason: string
    }
  ): Promise<Incident | null> {
    const incident = incidentStore.items?.find((i) => i.uuid === id)
    if (!incident) return null

    const history = incident.escalationHistory || []
    history.push({
      escalatedAt: new Date(),
      escalatedBy: incident.declaredBy || '',
      fromLevel: incident.escalationLevel,
      toLevel: data.escalationLevel as any,
      reason: data.reason,
      escalatedTo: data.escalatedTo,
    })

    return incidentStore.update(id, {
      escalationLevel: data.escalationLevel as any,
      escalationStatus: 'Escalated' as any,
      escalatedTo: data.escalatedTo,
      escalatedAt: new Date(),
      escalationReason: data.reason,
      escalationHistory: history,
      escalationAttempts: (incident.escalationAttempts || 0) + 1,
    } as Partial<Incident>)
  }

  return {
    // Sub-store refs
    criticalFunctions,
    bias: biaStore.items,
    bcps,
    bcpTemplates: templateStore.items,
    recoveryStrategies: strategyStore.items,
    exerciseTests,
    incidents,

    // Getters
    functionsByPriority,
    functionsRequiringBCP,
    activeFunctions,
    activeBCPs,
    draftBCPs,
    approvedBCPs,
    overdueBCPs,
    upcomingTests,
    passedTests,
    failedTests,
    activeIncidents,
    criticalIncidents,

    // Actions
    initialize,
    approveBCP,
    archiveBCP,
    recordTestResult,
    closeIncident,
    escalateIncident,

    // Sub-store access
    criticalFunctionStore,
    biaStore,
    bcpStore,
    templateStore,
    strategyStore,
    testStore,
    incidentStore,
  }
})