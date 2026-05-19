import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { dashboardService } from './../../services/api/dashboard/DashboardService'
import type {
  DashboardKPIs,
  DashboardIncident,
  DashboardTest,
  DashboardWorkflow,
  ComplianceOverview,
  RiskTrend,
} from '../../types/bcm.types'

const defaultKPIs: DashboardKPIs = {
  activeBCPs: 0,
  activeIncidents: 0,
  highRisks: 0,
  pendingApprovals: 0,
  complianceRate: 0,
  maturityScore: 0,
}

export const useDashboardStore = defineStore('dashboard', () => {
  // ============================================
  // State
  // ============================================
  const kpis = ref<DashboardKPIs>({ ...defaultKPIs })
  const recentIncidents = ref<DashboardIncident[]>([])
  const upcomingTests = ref<DashboardTest[]>([])
  const pendingWorkflows = ref<DashboardWorkflow[]>([])
  const complianceOverview = ref<ComplianceOverview[]>([])
  const riskTrends = ref<RiskTrend[]>([])
  const isLoading = ref(false)
  const isRefreshing = ref(false)
  const error = ref<string | null>(null)
  const lastRefreshed = ref<string | null>(null)

  // ============================================
  // Getters
  // ============================================
  const hasActiveIncidents = computed(() => (kpis.value.activeIncidents || 0) > 0)
  const hasHighRisks = computed(() => (kpis.value.highRisks || 0) > 0)
  const hasPendingApprovals = computed(() => (kpis.value.pendingApprovals || 0) > 0)
  const hasOverdueItems = computed(
    () =>
      (kpis.value.activeIncidents || 0) > 0 ||
      (kpis.value.highRisks || 0) > 0 ||
      (kpis.value.pendingApprovals || 0) > 0
  )

  const complianceRatePercent = computed(() => {
    const rate = kpis.value.complianceRate || 0
    return `${Math.round(rate * 100)}%`
  })

  const maturityLevel = computed(() => {
    const score = kpis.value.maturityScore || 0
    if (score >= 5) return { level: 5, label: 'Optimizing', color: 'green' }
    if (score >= 4) return { level: 4, label: 'Managed', color: 'blue' }
    if (score >= 3) return { level: 3, label: 'Defined', color: 'cyan' }
    if (score >= 2) return { level: 2, label: 'Repeatable', color: 'orange' }
    return { level: 1, label: 'Initial', color: 'red' }
  })

  const criticalIncidents = computed(() =>
    recentIncidents.value.filter((i) => i.incident_severity === 'Critical')
  )

  const highPriorityWorkflows = computed(() =>
    pendingWorkflows.value.filter((w) => (w.priority || 5) <= 2)
  )

  const overdueTests = computed(() =>
    upcomingTests.value.filter((t) => t.date && new Date(t.date) < new Date())
  )

  // ============================================
  // Actions
  // ============================================

  async function loadDashboard(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const [kpiData, incidents, tests, workflows, compliance, trends] = await Promise.all([
        dashboardService.getKPIs(),
        dashboardService.getRecentIncidents(5),
        dashboardService.getUpcomingTests(5),
        dashboardService.getPendingWorkflows(5),
        dashboardService.getComplianceOverview(),
        dashboardService.getRiskTrends('month'),
      ])

      kpis.value = {
        activeBCPs: kpiData.activeBCPs ?? 0,
        activeIncidents: kpiData.activeIncidents ?? 0,
        highRisks: kpiData.highRisks ?? 0,
        pendingApprovals: kpiData.pendingApprovals ?? 0,
        complianceRate: kpiData.complianceRate ?? 0,
        maturityScore: kpiData.maturityScore ?? 0,
      }

      recentIncidents.value = incidents || []
      upcomingTests.value = tests || []
      pendingWorkflows.value = workflows || []
      complianceOverview.value = compliance || []
      riskTrends.value = trends || []

      lastRefreshed.value = new Date().toISOString()
    } catch (err: any) {
      console.error('Failed to load dashboard:', err)
      error.value = err.message || 'Failed to load dashboard data'
    } finally {
      isLoading.value = false
    }
  }

  async function refresh(): Promise<void> {
    isRefreshing.value = true
    try {
      await loadDashboard()
    } finally {
      isRefreshing.value = false
    }
  }

  /**
   * Load risk trends for a specific period
   */
  async function loadRiskTrends(period: string = 'month'): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const trends = await dashboardService.getRiskTrends(period)
      riskTrends.value = trends || []
    } catch (err: any) {
      console.error('Failed to load risk trends:', err)
      error.value = err.message || 'Failed to load risk trends'
    } finally {
      isLoading.value = false
    }
  }

  async function loadKPIsOnly(): Promise<void> {
    try {
      const kpiData = await dashboardService.getKPIs()
      kpis.value = {
        activeBCPs: kpiData.activeBCPs ?? 0,
        activeIncidents: kpiData.activeIncidents ?? 0,
        highRisks: kpiData.highRisks ?? 0,
        pendingApprovals: kpiData.pendingApprovals ?? 0,
        complianceRate: kpiData.complianceRate ?? 0,
        maturityScore: kpiData.maturityScore ?? 0,
      }
      lastRefreshed.value = new Date().toISOString()
    } catch (err: any) {
      console.error('Failed to load KPIs:', err)
    }
  }

  async function loadRecentIncidents(limit: number = 5): Promise<void> {
    try {
      const incidents = await dashboardService.getRecentIncidents(limit)
      recentIncidents.value = incidents || []
    } catch (err: any) {
      console.error('Failed to load recent incidents:', err)
    }
  }

  async function loadUpcomingTests(limit: number = 5): Promise<void> {
    try {
      const tests = await dashboardService.getUpcomingTests(limit)
      upcomingTests.value = tests || []
    } catch (err: any) {
      console.error('Failed to load upcoming tests:', err)
    }
  }

  async function loadPendingWorkflows(limit: number = 5): Promise<void> {
    try {
      const workflows = await dashboardService.getPendingWorkflows(limit)
      pendingWorkflows.value = workflows || []
    } catch (err: any) {
      console.error('Failed to load pending workflows:', err)
    }
  }

  function clearDashboard(): void {
    kpis.value = { ...defaultKPIs }
    recentIncidents.value = []
    upcomingTests.value = []
    pendingWorkflows.value = []
    complianceOverview.value = []
    riskTrends.value = []
    error.value = null
    lastRefreshed.value = null
  }

  function resetError(): void {
    error.value = null
  }

  return {
    // State
    kpis,
    recentIncidents,
    upcomingTests,
    pendingWorkflows,
    complianceOverview,
    riskTrends,
    isLoading,
    isRefreshing,
    error,
    lastRefreshed,

    // Getters
    hasActiveIncidents,
    hasHighRisks,
    hasPendingApprovals,
    hasOverdueItems,
    complianceRatePercent,
    maturityLevel,
    criticalIncidents,
    highPriorityWorkflows,
    overdueTests,

    // Actions
    loadDashboard,
    refresh,
    loadRiskTrends,
    loadKPIsOnly,
    loadRecentIncidents,
    loadUpcomingTests,
    loadPendingWorkflows,
    clearDashboard,
    resetError,
  }
})
