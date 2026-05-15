import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auditService } from '../services/api/AuditService'

export const useAuditStore = defineStore('audit', () => {
    const logs = ref<any[]>([])
    const selectedLog = ref<any>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalItems = ref(0)

    const errorLogs = computed(() =>
        logs.value.filter((l) => l.severity === 'ERROR' || l.severity === 'CRITICAL'),
    )
    const securityLogs = computed(() => logs.value.filter((l) => l.audit_category === 'SECURITY'))

    async function loadLogs(filters?: any): Promise<void> {
        isLoading.value = true
        error.value = null
        try {
            const response = await auditService.getLogs({ ...filters, page: currentPage.value } as any)
            logs.value = response.data || []
            totalPages.value = response.totalPages || 1
            totalItems.value = response.total || 0
        } catch (err: any) {
            error.value = err.message
        } finally {
            isLoading.value = false
        }
    }

    async function loadLog(id: string): Promise<void> {
        isLoading.value = true
        try {
            selectedLog.value = await auditService.getLog(id)
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function exportLogs(data: any): Promise<void> {
        await auditService.exportLogs(data)
    }

    return {
        logs,
        selectedLog,
        isLoading,
        error,
        currentPage,
        totalPages,
        totalItems,
        errorLogs,
        securityLogs,
        loadLogs,
        loadLog,
        exportLogs,
    }
})
