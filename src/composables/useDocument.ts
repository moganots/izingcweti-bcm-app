import { computed, watch, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDocumentStore } from '../stores/documents/document.store'
import { useAuth } from './useAuth'
import {
    DocumentStatus,
    getDocumentStatusColor,
    getDocumentStatusLabel,
} from '../models/document/document.entity'

export interface UseDocumentOptions {
    autoLoad?: boolean
    organisationId?: string
    refreshInterval?: number
}

/**
 * Document composable
 * Aligned with useDocumentStore
 */
export function useDocument(options: UseDocumentOptions = {}) {
    const { autoLoad = true, organisationId: defaultOrgId, refreshInterval } = options

    const documentStore = useDocumentStore()
    const { userOrganisationId, isAuthenticated } = useAuth()

    const {
        documents,
        selectedDocument: selected,
        documentTemplates,
        stats,
        isLoading,
        isSaving,
        isUploading,
        uploadProgress,
        error,
        publishedDocuments,
        draftDocuments,
        archivedDocuments,
        underReviewDocuments,
        pendingApprovalDocuments,
        rejectedDocuments,
        expiredDocuments,
        documentsByType,
        documentsByAccessLevel,
        totalDocumentSize,
        totalDocumentSizeMB,
        totalDownloadCount,
    } = storeToRefs(documentStore)

    const refreshTimer = ref<number | null>(null)
    const isInitialLoad = ref(true)

    const currentOrganisationId = computed(
        () => defaultOrgId || userOrganisationId.value
    )

    const totalDocuments = computed(() => documents.value?.length ?? 0)

    // ============================================
    // Actions
    // ============================================
    async function loadAll(): Promise<void> {
        await documentStore.initialize()
    }

    async function refresh(): Promise<void> {
        await documentStore.refreshStats()
        await loadAll()
    }

    function startAutoRefresh(intervalMs: number = refreshInterval || 60000): void {
        stopAutoRefresh()
        refreshTimer.value = window.setInterval(() => {
            if (!isLoading.value && !isSaving.value && !isUploading.value) {
                refresh().catch(console.error)
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
    // Helpers
    // ============================================
    function getStatusLabel(status: string): string {
        return getDocumentStatusLabel(status as DocumentStatus)
    }

    function getStatusColor(status: string): string {
        return getDocumentStatusColor(status as DocumentStatus)
    }

    function formatFileSize(bytes: number): string {
        if (!bytes) return '0 B'
        const units = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
    }

    // ============================================
    // Lifecycle
    // ============================================
    onMounted(async () => {
        if (autoLoad && isAuthenticated.value && currentOrganisationId.value) {
            await loadAll()
            isInitialLoad.value = false
            if (refreshInterval) startAutoRefresh(refreshInterval)
        }
    })

    watch(isAuthenticated, async (auth) => {
        if (auth && currentOrganisationId.value) {
            await loadAll()
            if (refreshInterval) startAutoRefresh(refreshInterval)
        } else if (!auth) {
            documentStore.reset()
            stopAutoRefresh()
        }
    })

    // ============================================
    // Return API
    // ============================================
    return {
        // State
        documents,
        selectedDocument: selected,
        documentTemplates,
        stats,
        isLoading,
        isSaving,
        isUploading,
        uploadProgress,
        error,

        // Getters
        publishedDocuments,
        draftDocuments,
        archivedDocuments,
        underReviewDocuments,
        pendingApprovalDocuments,
        rejectedDocuments,
        expiredDocuments,
        documentsByType,
        documentsByAccessLevel,
        totalDocumentSize,
        totalDocumentSizeMB,
        totalDownloadCount,
        totalDocuments,

        // Actions
        loadAll,
        refresh,
        refreshStats: documentStore.refreshStats,
        uploadDocument: documentStore.uploadDocument,
        submitForReview: documentStore.submitForReview,
        approveDocument: documentStore.approveDocument,
        rejectDocument: documentStore.rejectDocument,
        publishDocument: documentStore.publishDocument,
        archiveDocument: documentStore.archiveDocument,
        downloadDocument: documentStore.downloadDocument,
        reset: documentStore.reset,

        // Auto-refresh
        startAutoRefresh,
        stopAutoRefresh,

        // Helpers
        getStatusLabel,
        getStatusColor,
        formatFileSize,

        isInitialLoad,
        currentOrganisationId,
        DocumentStatus,
    }
}

export default useDocument