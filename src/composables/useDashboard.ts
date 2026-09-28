import { computed, watch, onMounted, onBeforeUnmount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '../stores/dashboard/dashboard.store'
import { useAuth } from './useAuth'

export interface UseDashboardOptions {
    autoLoad?: boolean
    refreshInterval?: number
}

/**
 * Dashboard composable
 * Aligned with useDashboardStore
 */
export function useDashboard(options: UseDashboardOptions = {}) {
    const { autoLoad = true, refreshInterval } = options

    const dashboardStore = useDashboardStore()
    const { isAuthenticated } = useAuth()

    const {
        kpis,
        isLoading,
        isRefreshing,
        error,
        lastRefreshed,
        configs,
        hasActiveIncidents,
        hasHighRisks,
        hasPendingApprovals,
        hasOverdueItems,
        complianceRatePercent,
        maturityLevel,
    } = storeToRefs(dashboardStore)

    const refreshTimer = ref<number | null>(null)
    const isInitialLoad = ref(true)

    const hasData = computed(
        () =>
            (kpis.value?.activeBCPs ?? 0) > 0 ||
            (kpis.value?.activeIncidents ?? 0) > 0 ||
            (kpis.value?.highRisks ?? 0) > 0 ||
            (kpis.value?.pendingApprovals ?? 0) > 0
    )

    const isEmpty = computed(() => !isLoading.value && !hasData.value && !error.value)
    const hasError = computed(() => !!error.value)
    const isReady = computed(() => !isLoading.value && !isRefreshing.value && !error.value)

    // ============================================
    // Actions
    // ============================================
    async function load(): Promise<void> {
        if (!isAuthenticated.value) return
        await dashboardStore.loadDashboard()
    }

    async function refreshDashboard(): Promise<void> {
        if (!isAuthenticated.value) return
        await dashboardStore.refresh()
    }

    function startAutoRefresh(intervalMs: number = refreshInterval || 60000): void {
        stopAutoRefresh()
        refreshTimer.value = window.setInterval(() => {
            if (!isLoading.value && !isRefreshing.value) {
                refreshDashboard().catch(console.error)
            }
        }, intervalMs)
    }

    function stopAutoRefresh(): void {
        if (refreshTimer.value) {
            clearInterval(refreshTimer.value)
            refreshTimer.value = null
        }
    }

    // ============================================
    // Lifecycle
    // ============================================
    onMounted(async () => {
        if (autoLoad && isAuthenticated.value) {
            await load()
            isInitialLoad.value = false
            if (refreshInterval) startAutoRefresh(refreshInterval)
        }
    })

    onBeforeUnmount(() => stopAutoRefresh())

    watch(isAuthenticated, async (auth) => {
        if (auth) {
            await load()
            if (refreshInterval) startAutoRefresh(refreshInterval)
        } else {
            dashboardStore.clearDashboard()
            stopAutoRefresh()
        }
    })

    // ============================================
    // Return API
    // ============================================
    return {
        // State
        kpis,
        configs,
        isLoading,
        isRefreshing,
        error,
        lastRefreshed,

        // Getters
        hasData,
        isEmpty,
        hasError,
        isReady,
        hasActiveIncidents,
        hasHighRisks,
        hasPendingApprovals,
        hasOverdueItems,
        complianceRatePercent,
        maturityLevel,

        // Actions
        load,
        refresh: refreshDashboard,
        clear: dashboardStore.clearDashboard,
        clearError: () => { dashboardStore.error = null },
        startAutoRefresh,
        stopAutoRefresh,

        isInitialLoad,
    }
}

export default useDashboard