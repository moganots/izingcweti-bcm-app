import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Risk, RiskStats } from './../../models/entities'
import { riskService } from './../../services/api'
import type {
  RiskQueryParams,
  CreateRiskRequest,
  UpdateRiskRequest,
  ReassessRiskRequest,
} from '../../types'
import { useAuthStore } from '../auth/auth.store'

export const useRiskStore = defineStore('risk', () => {
  const authStore = useAuthStore()

  // ============================================
  // State
  // ============================================
  const risks = ref<Risk[]>([])
  const selectedRisk = ref<Risk | null>(null)
  const stats = ref<RiskStats | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)

  // ============================================
  // Getters
  // ============================================
  const criticalRisks = computed(() => risks.value.filter((r) => r.inherent_risk_score >= 8.5))
  const highRisks = computed(() =>
    risks.value.filter((r) => r.inherent_risk_score >= 7 && r.inherent_risk_score < 8.5)
  )
  const mediumRisks = computed(() =>
    risks.value.filter((r) => r.inherent_risk_score >= 5 && r.inherent_risk_score < 7)
  )
  const lowRisks = computed(() => risks.value.filter((r) => r.inherent_risk_score < 5))
  const mitigatedRisks = computed(() =>
    risks.value.filter(
      (r) => Array.isArray(r.mitigation_control_ids) && r.mitigation_control_ids.length > 0
    )
  )
  const unmitigatedRisks = computed(() =>
    risks.value.filter(
      (r) => !Array.isArray(r.mitigation_control_ids) || r.mitigation_control_ids.length === 0
    )
  )

  const risksByCategory = computed(() => {
    const grouped: Record<string, Risk[]> = {}
    risks.value.forEach((r) => {
      const category = r.risk_category || 'Unknown'
      if (!grouped[category]) grouped[category] = []
      grouped[category].push(r)
    })
    return grouped
  })

  const risksBySeverity = computed(() => {
    const grouped: Record<string, Risk[]> = {}
    risks.value.forEach((r) => {
      const severity = r.impact_severity || 'Unknown'
      if (!grouped[severity]) grouped[severity] = []
      grouped[severity].push(r)
    })
    return grouped
  })

  const averageInherentScore = computed(() => {
    if (risks.value.length === 0) return 0
    const total = risks.value.reduce(
      (sum, r) => sum + (typeof r.inherent_risk_score === 'number' ? r.inherent_risk_score : 0),
      0
    )
    return Math.round((total / risks.value.length) * 100) / 100
  })

  const averageResidualScore = computed(() => {
    if (risks.value.length === 0) return 0
    const total = risks.value.reduce(
      (sum, r) => sum + (typeof r.residual_risk_score === 'number' ? r.residual_risk_score : 0),
      0
    )
    return Math.round((total / risks.value.length) * 100) / 100
  })

  const riskReduction = computed(() => {
    return Math.round((averageInherentScore.value - averageResidualScore.value) * 100) / 100
  })

  const hasCriticalRisks = computed(() => criticalRisks.value.length > 0)
  const hasHighRisks = computed(() => highRisks.value.length > 0)

  // ============================================
  // Actions
  // ============================================

  async function loadRisks(filters?: RiskQueryParams): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await riskService.getRisks({
        ...filters,
        page: currentPage.value,
      })

      risks.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      console.error('Failed to load risks:', err)
      error.value = err.message || 'Failed to load risks'
    } finally {
      isLoading.value = false
    }
  }

  async function loadRisk(id: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const data = await riskService.getRisk(id)
      selectedRisk.value = data
    } catch (err: any) {
      console.error('Failed to load risk:', err)
      error.value = err.message || 'Failed to load risk'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function loadStats(organisationId?: string): Promise<void> {
    try {
      const data = await riskService.getStats(organisationId)
      stats.value = data
    } catch (err: any) {
      console.error('Failed to load risk stats:', err)
    }
  }

  async function loadHighRisks(threshold?: number): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await riskService.getHighRisks(threshold)
      risks.value = response.data || []
      totalPages.value = response.totalPages || 1
    } catch (err: any) {
      console.error('Failed to load high risks:', err)
      error.value = err.message || 'Failed to load high risks'
    } finally {
      isLoading.value = false
    }
  }

  async function loadCriticalRisks(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await riskService.getCriticalRisks()
      risks.value = response.data || []
      totalPages.value = response.totalPages || 1
    } catch (err: any) {
      console.error('Failed to load critical risks:', err)
      error.value = err.message || 'Failed to load critical risks'
    } finally {
      isLoading.value = false
    }
  }

  async function createRisk(data: CreateRiskRequest): Promise<Risk> {
    isSaving.value = true
    error.value = null

    try {
      // Fix: Ensure organisation_id is set from auth store
      if (!data.organisation_id && authStore.user?.organisation_id) {
        data.organisation_id = authStore.user.organisation_id
      }

      const created = await riskService.createRisk(data)
      risks.value.unshift(created)
      await loadStats()
      return created
    } catch (err: any) {
      console.error('Failed to create risk:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to create risk'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function updateRisk(id: string, data: UpdateRiskRequest): Promise<Risk> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await riskService.updateRisk(id, data)
      const index = risks.value.findIndex((r) => r.uuid === id)
      if (index !== -1) {
        risks.value[index] = updated
      }
      if (selectedRisk.value?.uuid === id) {
        selectedRisk.value = updated
      }
      return updated
    } catch (err: any) {
      console.error('Failed to update risk:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to update risk'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function reassessRisk(id: string, data: ReassessRiskRequest): Promise<Risk> {
    isSaving.value = true
    error.value = null

    try {
      const reassessed = await riskService.reassessRisk(id, data)
      const index = risks.value.findIndex((r) => r.uuid === id)
      if (index !== -1) {
        risks.value[index] = reassessed
      }
      if (selectedRisk.value?.uuid === id) {
        selectedRisk.value = reassessed
      }
      await loadStats()
      return reassessed
    } catch (err: any) {
      console.error('Failed to reassess risk:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to reassess risk'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function deleteRisk(id: string): Promise<void> {
    isSaving.value = true
    error.value = null

    try {
      await riskService.deleteRisk(id)
      risks.value = risks.value.filter((r) => r.uuid !== id)
      if (selectedRisk.value?.uuid === id) {
        selectedRisk.value = null
      }
      await loadStats()
    } catch (err: any) {
      console.error('Failed to delete risk:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to delete risk'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function addMitigationControls(id: string, controlIds: string[]): Promise<Risk> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await riskService.addMitigationControls(id, controlIds)
      const index = risks.value.findIndex((r) => r.uuid === id)
      if (index !== -1) {
        risks.value[index] = updated
      }
      if (selectedRisk.value?.uuid === id) {
        selectedRisk.value = updated
      }
      return updated
    } catch (err: any) {
      console.error('Failed to add mitigation controls:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to add controls'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function removeMitigationControl(id: string, controlId: string): Promise<Risk> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await riskService.removeMitigationControl(id, controlId)
      const index = risks.value.findIndex((r) => r.uuid === id)
      if (index !== -1) {
        risks.value[index] = updated
      }
      if (selectedRisk.value?.uuid === id) {
        selectedRisk.value = updated
      }
      return updated
    } catch (err: any) {
      console.error('Failed to remove mitigation control:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to remove control'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function setPage(page: number): Promise<void> {
    currentPage.value = page
    await loadRisks()
  }

  function clearSelection(): void {
    selectedRisk.value = null
  }

  function clearAll(): void {
    risks.value = []
    selectedRisk.value = null
    stats.value = null
    error.value = null
    currentPage.value = 1
    totalPages.value = 1
    totalItems.value = 0
  }

  return {
    risks,
    selectedRisk,
    stats,
    isLoading,
    isSaving,
    error,
    currentPage,
    totalPages,
    totalItems,
    criticalRisks,
    highRisks,
    mediumRisks,
    lowRisks,
    mitigatedRisks,
    unmitigatedRisks,
    risksByCategory,
    risksBySeverity,
    averageInherentScore,
    averageResidualScore,
    riskReduction,
    hasCriticalRisks,
    hasHighRisks,
    loadRisks,
    loadRisk,
    loadStats,
    loadHighRisks,
    loadCriticalRisks,
    createRisk,
    updateRisk,
    reassessRisk,
    deleteRisk,
    addMitigationControls,
    removeMitigationControl,
    setPage,
    clearSelection,
    clearAll,
  }
})
