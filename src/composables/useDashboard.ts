import { computed, watch, onMounted, onBeforeUnmount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../stores/dashboard/dashboard.store'
import { useAuth } from './useAuth'
import type { DashboardKPIs, DashboardIncident, DashboardTest, DashboardWorkflow, ComplianceOverview, RiskTrend } from '../modules/dashboard'

export interface UseDashboardOptions {
  autoLoad?: boolean
  refreshInterval?: number // in milliseconds
}

/**
 * Composable for dashboard functionality
 * Provides reactive dashboard data and operations
 */
export function useDashboard(options: UseDashboardOptions = {}) {
  const { autoLoad = true, refreshInterval } = options

  const dashboardStore = useDashboardStore()
  const { isAuthenticated, organisationId } = useAuth()

  // Store refs for reactivity
  const {
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
  } = storeToRefs(dashboardStore)

  // Store actions
  const {
    loadDashboard,
    refresh,
    loadRiskTrends,
    loadKPIsOnly,
    loadRecentActivity,
    loadUpcomingTasks,
    loadPendingWorkflows,
    clearDashboard,
    resetError,
  } = dashboardStore

  // Local state for auto-refresh timer
  const refreshTimer = ref<number | null>(null)
  const isInitialLoad = ref(true)

  // ============================================
  // Computed Getters
  // ============================================

  const hasData = computed(() => {
    return (
      (kpis.value?.activeBCPs ?? 0) > 0 ||
      (kpis.value?.activeIncidents ?? 0) > 0 ||
      (kpis.value?.highRisks ?? 0) > 0 ||
      (kpis.value?.pendingApprovals ?? 0) > 0
    )
  })

  const isEmpty = computed(() => {
    return !isLoading.value && !hasData.value && !error.value
  })

  const hasError = computed(() => !!error.value)

  const isReady = computed(() => {
    return !isLoading.value && !isRefreshing.value && !error.value
  })

  const criticalIncidentsCount = computed(() => {
    return recentIncidents.value?.filter((i) => i.incidentSeverity === 'Critical').length || 0
  })

  const highPriorityWorkflowsCount = computed(() => {
    return pendingWorkflows.value?.filter((w) => (w.priority || 5) <= 2).length || 0
  })

  const overdueTestsCount = computed(() => {
    return upcomingTests.value?.filter((t) => t.date && new Date(t.date) < new Date()).length || 0
  })

  // ============================================
  // Actions
  // ============================================

  /**
   * Load all dashboard data
   */
  async function load(): Promise<void> {
    if (!isAuthenticated.value) {
      console.warn('User not authenticated, skipping dashboard load')
      return
    }

    if (!organisationId.value) {
      console.warn('No organisation ID found, skipping dashboard load')
      return
    }

    await loadDashboard()
  }

  /**
   * Refresh dashboard data
   */
  async function refreshDashboard(): Promise<void> {
    if (!isAuthenticated.value) {
      console.warn('User not authenticated, skipping dashboard refresh')
      return
    }

    await refresh()
  }

  /**
   * Load risk trends with custom period
   */
  async function loadTrends(period: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<void> {
    if (!isAuthenticated.value) {
      console.warn('User not authenticated, skipping trends load')
      return
    }

    await loadRiskTrends(period)
  }

  /**
   * Start auto-refresh timer
   */
  function startAutoRefresh(intervalMs: number = refreshInterval || 60000): void {
    stopAutoRefresh()

    refreshTimer.value = window.setInterval(async () => {
      if (!isLoading.value && !isRefreshing.value) {
        await refreshDashboard()
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
   * Clear all dashboard data
   */
  function clear(): void {
    clearDashboard()
  }

  /**
   * Reset error state
   */
  function clearError(): void {
    resetError()
  }

  // ============================================
  // Lifecycle
  // ============================================

  // Auto-load on mount if authenticated
  onMounted(async () => {
    if (autoLoad && isAuthenticated.value && organisationId.value) {
      await load()
      isInitialLoad.value = false

      // Start auto-refresh if interval is set
      if (refreshInterval) {
        startAutoRefresh(refreshInterval)
      }
    }
  })

  // Clean up timer on unmount
  onBeforeUnmount(() => {
    stopAutoRefresh()
  })

  // Watch for authentication changes
  watch([isAuthenticated, organisationId], async ([auth, orgId]) => {
    if (auth && orgId) {
      await load()
      if (refreshInterval) {
        startAutoRefresh(refreshInterval)
      }
    } else {
      clear()
      stopAutoRefresh()
    }
  })

  // ============================================
  // Return API
  // ============================================

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

    // Computed
    hasData,
    isEmpty,
    hasError,
    isReady,
    isInitialLoad,
    criticalIncidentsCount,
    highPriorityWorkflowsCount,
    overdueTestsCount,

    // Actions
    load,
    refresh: refreshDashboard,
    loadTrends,
    loadKPIsOnly,
    loadRecentActivity,
    loadUpcomingTasks,
    loadPendingWorkflows,
    clear,
    clearError,
    startAutoRefresh,
    stopAutoRefresh,
  }
}

export default useDashboard