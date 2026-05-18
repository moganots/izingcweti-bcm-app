import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { complianceService } from './../../services/api'

export const useComplianceStore = defineStore('compliance', () => {
    const records = ref<any[]>([])
    const selectedRecord = ref<any>(null)
    const isLoading = ref(false)
    const isSaving = ref(false)
    const error = ref<string | null>(null)
    const currentPage = ref(1)
    const totalPages = ref(1)

    const compliantRecords = computed(() =>
        records.value.filter((r) => r.compliance_status === 'Compliant')
    )
    const nonCompliantRecords = computed(() =>
        records.value.filter((r) => r.compliance_status === 'NonCompliant')
    )
    const overdueAudits = computed(() =>
        records.value.filter((r) => r.next_audit_due && new Date(r.next_audit_due) < new Date())
    )

    async function loadRecords(filters?: any): Promise<void> {
        isLoading.value = true
        error.value = null
        try {
            const response = await complianceService.getRecords({
                ...filters,
                page: currentPage.value,
            } as any)
            records.value = response.data || []
            totalPages.value = response.totalPages || 1
        } catch (err: any) {
            error.value = err.message
        } finally {
            isLoading.value = false
        }
    }

    async function loadRecord(id: string): Promise<void> {
        isLoading.value = true
        try {
            selectedRecord.value = await complianceService.getRecord(id)
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function createRecord(data: any): Promise<void> {
        isSaving.value = true
        try {
            await complianceService.createRecord(data)
            await loadRecords()
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            isSaving.value = false
        }
    }

    async function updateRecord(id: string, data: any): Promise<void> {
        isSaving.value = true
        try {
            const updated = await complianceService.updateRecord(id, data)
            if (selectedRecord.value?.uuid === id) selectedRecord.value = updated
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            isSaving.value = false
        }
    }

    async function deleteRecord(id: string): Promise<void> {
        isSaving.value = true
        try {
            await complianceService.deleteRecord(id)
            records.value = records.value.filter((r) => r.uuid !== id)
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            isSaving.value = false
        }
    }

    async function updateStatus(id: string, data: any): Promise<void> {
        isSaving.value = true
        try {
            const updated = await complianceService.updateStatus(id, data)
            if (selectedRecord.value?.uuid === id) selectedRecord.value = updated
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            isSaving.value = false
        }
    }

    async function addEvidence(id: string, links: string[]): Promise<void> {
        isSaving.value = true
        try {
            const updated = await complianceService.addEvidence(id, links)
            if (selectedRecord.value?.uuid === id) selectedRecord.value = updated
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            isSaving.value = false
        }
    }

    async function removeEvidence(id: string, index: number): Promise<void> {
        isSaving.value = true
        try {
            const updated = await complianceService.removeEvidence(id, index)
            if (selectedRecord.value?.uuid === id) selectedRecord.value = updated
        } catch (err: any) {
            error.value = err.message
            throw err
        } finally {
            isSaving.value = false
        }
    }

    return {
        records,
        selectedRecord,
        isLoading,
        isSaving,
        error,
        currentPage,
        totalPages,
        compliantRecords,
        nonCompliantRecords,
        overdueAudits,
        loadRecords,
        loadRecord,
        createRecord,
        updateRecord,
        deleteRecord,
        updateStatus,
        addEvidence,
        removeEvidence,
    }
})
