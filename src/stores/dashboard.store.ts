// src/stores/dashboard.store.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { dashboardService } from '../services/api/DashboardService'
import type {
  DashboardKPIs,
  DashboardIncident,
  DashboardTest,
  DashboardWorkflow,
  ComplianceOverview,
  RiskTrend,
} from './../types/bcm.types'

export const useDashboardStore = defineStore('dashboard', () => {
  // ============================================
  // State
  // ============================================
  const kpis = ref<DashboardKPIs>({
    activeBCPs: 0,
    activeIncidents: 0,
    highRisks: 0,
    pendingApprovals: 0,
    complianceRate: 0,
    maturityScore: 0,
  })

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
  const hasActiveIncidents = computed(() => kpis.value.activeIncidents > 0)
  const hasHighRisks = computed(() => kpis.value.highRisks > 0)
  const hasPendingApprovals = computed(() => kpis.value.pendingApprovals > 0)
  const hasOverdueItems = computed(
    () =>
      kpis.value.activeIncidents > 0 || kpis.value.highRisks > 0 || kpis.value.pendingApprovals > 0
  )

  const complianceRatePercent = computed(() => `${Math.round(kpis.value.complianceRate * 100)}%`)

  const maturityLevel = computed(() => {
    const score = kpis.value.maturityScore
    if (score >= 5) return { level: 5, label: 'Optimizing' }
    if (score >= 4) return { level: 4, label: 'Managed' }
    if (score >= 3) return { level: 3, label: 'Defined' }
    if (score >= 2) return { level: 2, label: 'Repeatable' }
    return { level: 1, label: 'Initial' }
  })

  const criticalIncidents = computed(() =>
    recentIncidents.value.filter((i) => i.incident_severity === 'Critical')
  )

  const highPriorityWorkflows = computed(() =>
    pendingWorkflows.value.filter((w) => w.priority <= 2)
  )

  const overdueTests = computed(() =>
    upcomingTests.value.filter((t) => new Date(t.date) < new Date())
  )

  // ============================================
  // Actions
  // ============================================

  /**
   * Load all dashboard data
   */
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

      // Update KPIs
      kpis.value = {
        activeBCPs: kpiData.activeBCPs ?? 0,
        activeIncidents: kpiData.activeIncidents ?? 0,
        highRisks: kpiData.highRisks ?? 0,
        pendingApprovals: kpiData.pendingApprovals ?? 0,
        complianceRate: kpiData.complianceRate ?? 0,
        maturityScore: kpiData.maturityScore ?? 0,
      }

      // Update lists
      recentIncidents.value = incidents
      upcomingTests.value = tests
      pendingWorkflows.value = workflows
      complianceOverview.value = compliance
      riskTrends.value = trends

      lastRefreshed.value = new Date().toISOString()
    } catch (err: any) {
      console.error('Failed to load dashboard:', err)
      error.value = err.message || 'Failed to load dashboard data'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Refresh dashboard data (shows loading indicator)
   */
  async function refresh(): Promise<void> {
    isRefreshing.value = true
    try {
      await loadDashboard()
    } finally {
      isRefreshing.value = false
    }
  }

  /**
   * Load KPIs only (lightweight refresh)
   */
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

  /**
   * Load recent incidents only
   */
  async function loadRecentIncidents(): Promise<void> {
    try {
      const incidents = await dashboardService.getRecentIncidents(5)
      recentIncidents.value = incidents
    } catch (err: any) {
      console.error('Failed to load recent incidents:', err)
    }
  }

  /**
   * Load upcoming tests only
   */
  async function loadUpcomingTests(): Promise<void> {
    try {
      const tests = await dashboardService.getUpcomingTests(5)
      upcomingTests.value = tests
    } catch (err: any) {
      console.error('Failed to load upcoming tests:', err)
    }
  }

  /**
   * Load pending workflows only
   */
  async function loadPendingWorkflows(): Promise<void> {
    try {
      const workflows = await dashboardService.getPendingWorkflows(5)
      pendingWorkflows.value = workflows
    } catch (err: any) {
      console.error('Failed to load pending workflows:', err)
    }
  }

  /**
   * Clear all dashboard data
   */
  function clearDashboard(): void {
    kpis.value = {
      activeBCPs: 0,
      activeIncidents: 0,
      highRisks: 0,
      pendingApprovals: 0,
      complianceRate: 0,
      maturityScore: 0,
    }
    recentIncidents.value = []
    upcomingTests.value = []
    pendingWorkflows.value = []
    complianceOverview.value = []
    riskTrends.value = []
    error.value = null
    lastRefreshed.value = null
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
    loadKPIsOnly,
    loadRecentIncidents,
    loadUpcomingTests,
    loadPendingWorkflows,
    clearDashboard,
  }
})
