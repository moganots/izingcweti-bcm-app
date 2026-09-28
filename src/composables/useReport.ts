import { computed, watch, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useReportStore } from '../stores/report/report.store'
import { useAuth } from './useAuth'

export interface UseReportOptions {
    autoLoad?: boolean
    organisationId?: string
    refreshInterval?: number
}

/**
 * Report composable
 * Aligned with useReportStore
 */
export function useReport(options: UseReportOptions = {}) {
    const { autoLoad = true, organisationId: defaultOrgId, refreshInterval } = options

    const reportStore = useReportStore()
    const { userOrganisationId, isAuthenticated } = useAuth()

    const {
        reports,
        selectedReport,
        stats,
        isLoading,
        isSaving,
        error,
        completedReports,
        pendingReports,
        generatingReports,
        failedReports,
        scheduledReports,
        expiredReports,
        reportsByType,
        recurringReports,
    } = storeToRefs(reportStore)

    const refreshTimer = ref<number | null>(null)
    const isInitialLoad = ref(true)

    const currentOrganisationId = computed(
        () => defaultOrgId || userOrganisationId.value
    )

    async function loadAll(): Promise<void> {
        await reportStore.initialize()
    }

    async function refresh(): Promise<void> {
        await reportStore.refreshStats()
        await loadAll()
    }

    async function generateReport(id: string) {
        return reportStore.generateReport(id)
    }

    async function cancelReport(id: string) {
        return reportStore.cancelReport(id)
    }

    async function scheduleReport(id: string, frequency: string, scheduledAt: Date) {
        return reportStore.scheduleReport(id, frequency, scheduledAt)
    }

    function startAutoRefresh(intervalMs: number = refreshInterval || 60000): void {
        stopAutoRefresh()
        refreshTimer.value = window.setInterval(() => refresh().catch(console.error), intervalMs)
    }

    function stopAutoRefresh(): void {
        if (refreshTimer.value) {
            clearInterval(refreshTimer.value)
            refreshTimer.value = null
        }
    }

    onMounted(async () => {
        if (autoLoad && isAuthenticated.value) {
            await loadAll()
            isInitialLoad.value = false
            if (refreshInterval) startAutoRefresh(refreshInterval)
        }
    })

    watch(isAuthenticated, async (auth) => {
        if (auth) {
            await loadAll()
            if (refreshInterval) startAutoRefresh(refreshInterval)
        } else {
            stopAutoRefresh()
        }
    })

    return {
        // State
        reports,
        selectedReport,
        stats,
        isLoading,
        isSaving,
        error,

        // Getters
        completedReports,
        pendingReports,
        generatingReports,
        failedReports,
        scheduledReports,
        expiredReports,
        reportsByType,
        recurringReports,

        // Actions
        loadAll,
        refresh,
        refreshStats: reportStore.refreshStats,
        generateReport,
        cancelReport,
        scheduleReport,

        // Auto-refresh
        startAutoRefresh,
        stopAutoRefresh,

        isInitialLoad,
        currentOrganisationId,
    }
}

export default useReport