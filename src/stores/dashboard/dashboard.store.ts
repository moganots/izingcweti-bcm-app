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
  // State
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

  // Getters
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
    return `${Math.round(rate)}%`
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

  // Actions
  async function loadDashboard(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const completeData = await dashboardService.getCompleteDashboard()

      // Safely set KPIs with fallbacks
      kpis.value = {
        activeBCPs: completeData.kpis?.activeBCPs ?? 0,
        activeIncidents: completeData.kpis?.activeIncidents ?? 0,
        highRisks: completeData.kpis?.highRisks ?? 0,
        pendingApprovals: completeData.kpis?.pendingApprovals ?? 0,
        complianceRate: completeData.kpis?.complianceRate ?? 0,
        maturityScore: completeData.kpis?.maturityScore ?? 0,
      }

      // Transform recent activity to incidents (with safe navigation)
      recentIncidents.value = (completeData.recentActivity?.activities || [])
        .filter((a) => a.entity_type === 'Incident')
        .slice(0, 5)
        .map((a) => ({
          uuid: a.id,
          incident_severity: a.action,
          root_cause: a.entity_name,
          declared_at: a.timestamp,
          closed_at: null,
          organisation: { uuid: '', name: '' },
        }))

      // Extract tests from upcoming tasks (with safe navigation)
      upcomingTests.value = (completeData.upcomingTasks?.tasks || [])
        .filter((t) => t.type === 'BCP_REVIEW')
        .slice(0, 5)
        .map((t) => ({
          uuid: t.id,
          exercise_test_type: t.type,
          date: t.due_date,
          passed: false,
          business_continuity_plan: {
            uuid: t.id,
            critical_function: { name: t.title },
          },
        }))

      pendingWorkflows.value = completeData.workflowSummary?.recent_workflows?.slice(0, 5) || []
      complianceOverview.value = completeData.complianceSummary?.compliance_by_standard || []
      riskTrends.value = completeData.riskSummary?.risk_trends || []

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

  async function loadRecentActivity(limit: number = 10): Promise<void> {
    try {
      const activity = await dashboardService.getRecentActivity(limit)
      // Transform as needed - you can store this in state if needed
      console.log('Recent activity loaded:', activity)
    } catch (err: any) {
      console.error('Failed to load recent activity:', err)
    }
  }

  async function loadUpcomingTasks(limit: number = 10): Promise<void> {
    try {
      const tasks = await dashboardService.getUpcomingTasks(limit)
      // Transform as needed - you can store this in state if needed
      console.log('Upcoming tasks loaded:', tasks)
    } catch (err: any) {
      console.error('Failed to load upcoming tasks:', err)
    }
  }

  async function loadPendingWorkflows(limit: number = 5): Promise<void> {
    try {
      const summary = await dashboardService.getWorkflowSummary()
      pendingWorkflows.value = summary.recent_workflows?.slice(0, limit) || []
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
    loadRecentActivity,
    loadUpcomingTasks,
    loadPendingWorkflows,
    clearDashboard,
    resetError,
  }
})
