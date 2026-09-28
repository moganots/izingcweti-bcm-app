import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  DashboardConfig,
} from '../../models/dashboard/dashboard.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'
import { dashboardService } from '../../services/api/dashboard/DashboardService'
import { useAuthStore } from '../auth/auth.store'

// ============================================
// Dashboard Config Store
// ============================================
export const useDashboardConfigStore = createOfflineCrudStore<DashboardConfig>({
  storeId: 'dashboard-configs',
  tableName: 'dashboardConfigs',
})

// ============================================
// Dashboard KPIs & Analytics Store
// ============================================
export const useDashboardStore = defineStore('dashboard', () => {
  const configStore = useDashboardConfigStore()

  const kpis = ref({
    activeBCPs: 0,
    activeIncidents: 0,
    highRisks: 0,
    pendingApprovals: 0,
    complianceRate: 0,
    maturityScore: 0,
  })

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
      kpis.value.activeIncidents > 0 ||
      kpis.value.highRisks > 0 ||
      kpis.value.pendingApprovals > 0
  )

  const complianceRatePercent = computed(() => `${Math.round(kpis.value.complianceRate)}%`)
  const maturityLevel = computed(() => {
    const score = kpis.value.maturityScore
    if (score >= 5) return { level: 5, label: 'Optimizing', color: 'green' }
    if (score >= 4) return { level: 4, label: 'Managed', color: 'blue' }
    if (score >= 3) return { level: 3, label: 'Defined', color: 'cyan' }
    if (score >= 2) return { level: 2, label: 'Repeatable', color: 'orange' }
    return { level: 1, label: 'Initial', color: 'red' }
  })

  // ============================================
  // Actions
  // ============================================
  async function loadDashboard(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const authStore = useAuthStore()
      const organisationId = authStore.userOrganisationId

      if (!organisationId) throw new Error('No organisation ID found')

      const data = await dashboardService.getCompleteDashboard(organisationId)

      kpis.value = {
        activeBCPs: Math.round(data.kpis?.activeBCPs ?? 0),
        activeIncidents: Math.round(data.kpis?.activeIncidents ?? 0),
        highRisks: Math.round(data.kpis?.highRisks ?? 0),
        pendingApprovals: Math.round(data.kpis?.pendingApprovals ?? 0),
        complianceRate: Math.round(data.kpis?.complianceRate ?? 0),
        maturityScore: Math.round((data.kpis?.maturityScore ?? 0) * 10) / 10,
      }

      lastRefreshed.value = new Date().toISOString()
    } catch (err: any) {
      error.value = err.message || 'Failed to load dashboard'
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

  function clearDashboard(): void {
    kpis.value = {
      activeBCPs: 0,
      activeIncidents: 0,
      highRisks: 0,
      pendingApprovals: 0,
      complianceRate: 0,
      maturityScore: 0,
    }
    error.value = null
    lastRefreshed.value = null
  }

  return {
    // State
    kpis,
    isLoading,
    isRefreshing,
    error,
    lastRefreshed,
    configs: configStore.items,

    // Getters
    hasActiveIncidents,
    hasHighRisks,
    hasPendingApprovals,
    hasOverdueItems,
    complianceRatePercent,
    maturityLevel,

    // Actions
    loadDashboard,
    refresh,
    clearDashboard,

    // Sub-store
    configStore,
  }
})