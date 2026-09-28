import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Risk } from '../../models/risk/risk.entity'
import { RiskStatus } from '../../models/risk/risk.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'
import { useAuthStore } from '../auth/auth.store'

export const useRiskItemStore = createOfflineCrudStore<Risk>({
  storeId: 'risks',
  tableName: 'risks',
})

export const useRiskStore = defineStore('risk', () => {
  const riskStore = useRiskItemStore()
  const authStore = useAuthStore()
  const isSaving = ref(false)

  const risks = riskStore.items

  // ============================================
  // Getters
  // ============================================
  const criticalRisks = computed(() =>
    risks?.filter((r) => (r.inherentRiskScore || 0) >= 20)
  )

  const highRisks = computed(() =>
    risks?.filter(
      (r) => (r.inherentRiskScore || 0) >= 15 && (r.inherentRiskScore || 0) < 20
    )
  )

  const mediumRisks = computed(() =>
    risks?.filter(
      (r) => (r.inherentRiskScore || 0) >= 8 && (r.inherentRiskScore || 0) < 15
    )
  )

  const lowRisks = computed(() => risks?.filter((r) => (r.inherentRiskScore || 0) < 8))

  const openRisks = computed(() => risks?.filter((r) => r.status !== RiskStatus.CLOSED))

  const closedRisks = computed(() => risks?.filter((r) => r.status === RiskStatus.CLOSED))

  const pendingApprovalRisks = computed(() =>
    risks?.filter((r) => r.requiresApproval && !r.approvedBy)
  )

  const overdueReviewRisks = computed(() => {
    const now = new Date()
    return risks?.filter(
      (r) => r.reviewDate && new Date(r.reviewDate) < now && r.status !== RiskStatus.CLOSED
    )
  })

  const myAssignedRisks = computed(() =>
    risks?.filter((r) => r.assignedTo === authStore.userId)
  )

  const risksByCategory = computed(() => {
    const grouped: Record<string, Risk[]> = {}
    risks?.forEach((r) => {
      const category = r.riskCategory || 'Unknown'
      if (!grouped[category]) grouped[category] = []
      grouped[category].push(r)
    })
    return grouped
  })

  const averageInherentScore = computed(() => {
    if (risks?.length === 0) return 0
    const total = risks?.reduce((sum, r) => sum + (r.inherentRiskScore || 0), 0)
    return Math.round((total / risks?.length) * 100) / 100
  })

  const averageResidualScore = computed(() => {
    const withResidual = risks?.filter((r) => r.residualRiskScore !== undefined)
    if (withResidual.length === 0) return 0
    const total = withResidual.reduce((sum, r) => sum + (r.residualRiskScore || 0), 0)
    return Math.round((total / withResidual.length) * 100) / 100
  })

  const riskReduction = computed(
    () => Math.round((averageInherentScore.value - averageResidualScore.value) * 100) / 100
  )

  const riskReductionPercentage = computed(() => {
    if (averageInherentScore.value === 0) return 0
    return Math.round((riskReduction.value / averageInherentScore.value) * 100)
  })

  const riskMatrix = computed(() => {
    const matrix: number[][] = Array(5)
      .fill(0)
      .map(() => Array(5).fill(0))

    risks?.forEach((risk) => {
      const likelihood = Math.min(5, Math.max(1, Math.round(risk.inherentLikelihood || 0)))
      const impact = Math.min(5, Math.max(1, Math.round(risk.inherentImpact || 0)))
      matrix[likelihood - 1]![impact - 1]!++
    })

    return matrix
  })

  // ============================================
  // Actions
  // ============================================
  async function initialize(): Promise<void> {
    await riskStore.initialize()
  }

  async function assessRisk(
    id: string,
    data: { inherentLikelihood: number; inherentImpact: number; residualLikelihood?: number; residualImpact?: number }
  ): Promise<Risk | null> {
    const inherentScore = data.inherentLikelihood * data.inherentImpact
    const residualScore =
      data.residualLikelihood && data.residualImpact
        ? data.residualLikelihood * data.residualImpact
        : undefined

    return riskStore.update(id, {
      ...data,
      inherentRiskScore: inherentScore,
      residualRiskScore: residualScore,
      status: RiskStatus.ASSESSING,
    } as Partial<Risk>)
  }

  async function approveRisk(id: string, notes?: string): Promise<Risk | null> {
    return riskStore.update(id, {
      approvedBy: authStore.userId,
      approvedAt: new Date(),
      approvalNotes: notes,
      status: RiskStatus.APPROVED,
    } as Partial<Risk>)
  }

  async function assignRisk(id: string, assignedTo: string): Promise<Risk | null> {
    return riskStore.update(id, { assignedTo } as Partial<Risk>)
  }

  async function closeRisk(id: string): Promise<Risk | null> {
    return riskStore.update(id, {
      status: RiskStatus.CLOSED,
      actualCompletionDate: new Date(),
    } as Partial<Risk>)
  }

  async function addControl(
    id: string,
    control: {
      controlName: string
      effectiveness: number
      implementedDate?: Date
    }
  ): Promise<Risk | null> {
    const risk = risks?.find((r) => r.uuid === id)
    if (!risk) return null

    const controls = risk.mitigatingControls || []
    controls.push({
      controlId: crypto.randomUUID(),
      controlName: control.controlName,
      effectiveness: control.effectiveness,
      implementedDate: control.implementedDate || new Date(),
      responsiblePerson: '',
      reviewDate: new Date(),
    })

    return riskStore.update(id, { mitigatingControls: controls } as Partial<Risk>)
  }

  return {
    // State
    risks,
    selectedRisk: riskStore.selected,
    isLoading: riskStore.loading,
    isSaving,
    error: riskStore.error,

    // Getters
    criticalRisks,
    highRisks,
    mediumRisks,
    lowRisks,
    openRisks,
    closedRisks,
    pendingApprovalRisks,
    overdueReviewRisks,
    myAssignedRisks,
    risksByCategory,
    averageInherentScore,
    averageResidualScore,
    riskReduction,
    riskReductionPercentage,
    riskMatrix,

    // Actions
    initialize,
    assessRisk,
    approveRisk,
    assignRisk,
    closeRisk,
    addControl,

    // Sub-store
    riskStore,
  }
})