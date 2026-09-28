import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
    Report,
    ReportStats,
    ReportGenerationResult,
} from '../../models/report/report.entity'
import { ReportStatus } from '../../models/report/report.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'
import { reportService } from '../../services/api/report/ReportService'

export const useReportItemStore = createOfflineCrudStore<Report>({
    storeId: 'reports',
    tableName: 'reports',
})

export const useReportStore = defineStore('report', () => {
    const reportStore = useReportItemStore()
    const stats = ref<ReportStats | null>(null)
    const isSaving = ref(false)

    const reports = reportStore.items

    // ============================================
    // Getters
    // ============================================
    const completedReports = computed(() =>
        reports?.filter((r) => r.status === ReportStatus.COMPLETED)
    )

    const pendingReports = computed(() =>
        reports?.filter((r) => r.status === ReportStatus.PENDING)
    )

    const generatingReports = computed(() =>
        reports?.filter((r) => r.status === ReportStatus.GENERATING)
    )

    const failedReports = computed(() =>
        reports?.filter((r) => r.status === ReportStatus.FAILED)
    )

    const scheduledReports = computed(() =>
        reports?.filter((r) => r.status === ReportStatus.SCHEDULED)
    )

    const expiredReports = computed(() =>
        reports?.filter((r) => r.status === ReportStatus.EXPIRED)
    )

    const reportsByType = computed(() => {
        const grouped: Record<string, Report[]> = {}
        reports?.forEach((r) => {
            const type = r.reportType || 'Unknown'
            if (!grouped[type]) grouped[type] = []
            grouped[type].push(r)
        })
        return grouped
    })

    const recurringReports = computed(() =>
        reports?.filter((r) => r.frequency && r.frequency !== 'Once')
    )

    // ============================================
    // Actions
    // ============================================
    async function initialize(): Promise<void> {
        await reportStore.initialize()
        await refreshStats()
    }

    async function refreshStats(): Promise<void> {
        try {
            stats.value = await reportService.getStats()
        } catch (err: any) {
            console.error('Failed to load report stats:', err)
        }
    }

    async function generateReport(id: string): Promise<ReportGenerationResult | null> {
        try {
            const result = await reportService.generateReport(id)
            await reportStore.loadAll()
            return result
        } catch (err: any) {
            console.error('Failed to generate report:', err)
            return null
        }
    }

    async function cancelReport(id: string): Promise<Report | null> {
        return reportStore.update(id, {
            status: ReportStatus.CANCELLED,
        } as Partial<Report>)
    }

    async function scheduleReport(
        id: string,
        frequency: string,
        scheduledAt: Date
    ): Promise<Report | null> {
        return reportStore.update(id, {
            frequency: frequency as any,
            scheduledAt,
            status: ReportStatus.SCHEDULED,
        } as Partial<Report>)
    }

    return {
        // State
        reports,
        selectedReport: reportStore.selected,
        stats,
        isLoading: reportStore.loading,
        isSaving,
        error: reportStore.error,

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
        initialize,
        refreshStats,
        generateReport,
        cancelReport,
        scheduleReport,

        // Sub-store
        reportStore,
    }
})