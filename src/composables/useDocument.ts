// src/composables/useDocument.ts

import { computed, watch, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDocumentStore } from '../stores/document/document.store'
import { useAuth } from './useAuth'
import type {
    Document,
    DocumentVersion,
    DocumentStats,
    CreateDocumentRequest,
    UpdateDocumentRequest,
    DocumentQueryParams,
    DocumentSearchParams,
    DocumentVerificationResult,
    DocumentBulkOperationRequest,
    DocumentUploadProgress,
} from '../models/entities/document/document.entity'
import {
    DocumentStatus,
    DocumentType,
    AccessLevel,
} from '../models/entities/document/document.entity'

export interface UseDocumentOptions {
    autoLoad?: boolean
    organisationId?: string
    refreshInterval?: number
    filterStatus?: DocumentStatus
    filterType?: DocumentType
}

/**
 * Composable for Document functionality
 * Provides reactive document state and operations
 */
export function useDocument(options: UseDocumentOptions = {}) {
    const {
        autoLoad = true,
        organisationId: defaultOrgId,
        refreshInterval,
        filterStatus,
        filterType,
    } = options

    const documentStore = useDocumentStore()
    const { organisationId: authOrgId, isAuthenticated } = useAuth()

    // Store refs for reactivity
    const {
        documents,
        selectedDocument,
        documentVersions,
        stats,
        isLoading,
        isSaving,
        isUploading,
        uploadProgress,
        error,
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        filters,
        hasDocuments,
        publishedDocuments,
        draftDocuments,
        archivedDocuments,
        underReviewDocuments,
        rejectedDocuments,
        pendingApprovalDocuments,
        documentsByType,
        documentsByStatus,
        documentsByAccessLevel,
        totalDocumentSize,
        totalDownloadCount,
        isEmpty,
    } = storeToRefs(documentStore)

    // Store actions
    const {
        loadDocuments,
        loadDocument,
        loadDocumentVersions,
        createDocument,
        updateDocument,
        deleteDocument,
        uploadNewVersion,
        restoreVersion,
        downloadDocument,
        previewDocument,
        submitForReview,
        approveDocument,
        rejectDocument,
        publishDocument,
        archiveDocument,
        loadDocumentsByOrganisation,
        searchDocuments,
        searchByTags,
        loadPendingApprovals,
        loadStats,
        bulkDownload,
        bulkOperation,
        updateDocumentTags,
        verifyDocument,
        setPage,
        setItemsPerPage,
        resetFilters,
        clearSelection,
        clearAll,
        resetError,
    } = documentStore

    // Local state
    const refreshTimer = ref<number | null>(null)
    const isInitialLoad = ref(true)
    const isReady = ref(false)
    const currentOrganisationId = computed(() => defaultOrgId || authOrgId.value)

    // ============================================
    // Computed Getters - Derived Metrics
    // ============================================

    const totalDocuments = computed(() => documents.value?.length || 0)

    const documentCountByStatus = computed(() => {
        const counts: Record<string, number> = {}
        documents.value?.forEach((doc) => {
            const status = doc.status || 'Unknown'
            counts[status] = (counts[status] || 0) + 1
        })
        return counts
    })

    const documentCountByType = computed(() => {
        const counts: Record<string, number> = {}
        documents.value?.forEach((doc) => {
            const type = doc.documentType || 'Unknown'
            counts[type] = (counts[type] || 0) + 1
        })
        return counts
    })

    const overallHealth = computed(() => {
        const total = totalDocuments.value
        if (total === 0) return 0

        const published = publishedDocuments.value?.length || 0
        const approved = documents.value?.filter((d) => d.status === DocumentStatus.APPROVED).length || 0
        const underReview = underReviewDocuments.value?.length || 0

        // Weight: published/approved = 1, under review = 0.5, draft = 0.25
        const weightedScore = (published + approved) * 1 + underReview * 0.5
        return Math.round((weightedScore / total) * 100)
    })

    const healthStatus = computed(() => {
        const score = overallHealth.value
        if (score >= 80) return { label: 'Healthy', color: 'positive', icon: 'check_circle' }
        if (score >= 60) return { label: 'Fair', color: 'warning', icon: 'warning' }
        if (score >= 40) return { label: 'Needs Attention', color: 'orange', icon: 'error_outline' }
        return { label: 'Critical', color: 'negative', icon: 'dangerous' }
    })

    // ============================================
    // Actions
    // ============================================

    /**
     * Load all document data
     */
    async function load(): Promise<void> {
        const orgId = currentOrganisationId.value
        if (!orgId) {
            console.warn('No organisation ID available for document data')
            return
        }

        const params: DocumentQueryParams = {
            organisationId: orgId,
        }
        if (filterStatus) params.status = filterStatus
        if (filterType) params.documentType = filterType

        await Promise.all([
            loadDocuments(params),
            loadStats(orgId),
        ])
    }

    /**
     * Refresh all document data
     */
    async function refresh(): Promise<void> {
        await load()
    }

    /**
     * Start auto-refresh timer
     */
    function startAutoRefresh(intervalMs: number = refreshInterval || 60000): void {
        stopAutoRefresh()

        refreshTimer.value = window.setInterval(async () => {
            if (!isLoading.value && !isSaving.value && !isUploading.value) {
                await refresh()
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
     * Clear all document data
     */
    function clear(): void {
        clearAll()
    }

    // ============================================
    // Helper Functions
    // ============================================

    function getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            DRAFT: 'Draft',
            PUBLISHED: 'Published',
            ARCHIVED: 'Archived',
            UNDER_REVIEW: 'Under Review',
            APPROVED: 'Approved',
            REJECTED: 'Rejected',
            EXPIRED: 'Expired',
            PENDING_APPROVAL: 'Pending Approval',
            UNDER_REVISION: 'Under Revision',
            SUPERSEDED: 'Superseded',
        }
        return labels[status] || status
    }

    function getStatusColor(status: string): string {
        const colors: Record<string, string> = {
            DRAFT: 'grey',
            PUBLISHED: 'positive',
            ARCHIVED: 'grey',
            UNDER_REVIEW: 'warning',
            APPROVED: 'positive',
            REJECTED: 'negative',
            EXPIRED: 'negative',
            PENDING_APPROVAL: 'warning',
            UNDER_REVISION: 'info',
            SUPERSEDED: 'grey',
        }
        return colors[status] || 'grey'
    }

    function getStatusIcon(status: string): string {
        const icons: Record<string, string> = {
            DRAFT: 'edit',
            PUBLISHED: 'check_circle',
            ARCHIVED: 'archive',
            UNDER_REVIEW: 'visibility',
            APPROVED: 'check_circle',
            REJECTED: 'cancel',
            EXPIRED: 'warning',
            PENDING_APPROVAL: 'pending',
            UNDER_REVISION: 'refresh',
            SUPERSEDED: 'swap_horiz',
        }
        return icons[status] || 'help'
    }

    function getDocumentTypeLabel(type: string): string {
        const labels: Record<string, string> = {
            BCM_POLICY: 'BCM Policy',
            RISK_ASSESSMENT: 'Risk Assessment',
            BIA_REPORT: 'BIA Report',
            BCP_DOCUMENT: 'BCP Document',
            RECOVERY_STRATEGY: 'Recovery Strategy',
            TEST_RESULTS: 'Test Results',
            INCIDENT_REPORT: 'Incident Report',
            COMPLIANCE_EVIDENCE: 'Compliance Evidence',
            TRAINING_MATERIAL: 'Training Material',
            AUDIT_REPORT: 'Audit Report',
            EXERCISE_REPORT: 'Exercise Report',
            MEETING_MINUTES: 'Meeting Minutes',
            PROCEDURE: 'Procedure',
            WORK_INSTRUCTION: 'Work Instruction',
            CONTACT_LIST: 'Contact List',
            VENDOR_CONTRACT: 'Vendor Contract',
            SLA_DOCUMENT: 'SLA Document',
            REGULATORY_DOCUMENT: 'Regulatory Document',
            CERTIFICATE: 'Certificate',
            GAP_ANALYSIS: 'Gap Analysis',
            IMPROVEMENT_PLAN: 'Improvement Plan',
            OTHER: 'Other',
        }
        return labels[type] || type
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
            await load()
            isInitialLoad.value = false
            isReady.value = true

            if (refreshInterval) {
                startAutoRefresh(refreshInterval)
            }
        }
    })

    // Watch for organisation changes
    watch(currentOrganisationId, async (newOrgId, oldOrgId) => {
        if (newOrgId && newOrgId !== oldOrgId && isAuthenticated.value) {
            await load()
        }
    })

    // Watch for authentication changes
    watch(isAuthenticated, async (auth) => {
        if (auth && currentOrganisationId.value) {
            await load()
            if (refreshInterval) {
                startAutoRefresh(refreshInterval)
            }
        } else if (!auth) {
            clear()
            stopAutoRefresh()
        }
    })

    // ============================================
    // Return API
    // ============================================

    return {
        // State
        documents,
        selectedDocument,
        documentVersions,
        stats,
        isLoading,
        isSaving,
        isUploading,
        uploadProgress,
        error,
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        filters,
        isReady,
        isInitialLoad,

        // Getters
        hasDocuments,
        publishedDocuments,
        draftDocuments,
        archivedDocuments,
        underReviewDocuments,
        rejectedDocuments,
        pendingApprovalDocuments,
        documentsByType,
        documentsByStatus,
        documentsByAccessLevel,
        totalDocumentSize,
        totalDownloadCount,
        isEmpty,
        totalDocuments,
        documentCountByStatus,
        documentCountByType,
        overallHealth,
        healthStatus,

        // Actions - Load
        load,
        refresh,
        loadDocuments,
        loadDocument,
        loadDocumentVersions,
        loadDocumentsByOrganisation,
        loadPendingApprovals,
        loadStats,

        // Actions - CRUD
        createDocument,
        updateDocument,
        deleteDocument,

        // Actions - Versions
        uploadNewVersion,
        restoreVersion,

        // Actions - Download & Preview
        downloadDocument,
        previewDocument,

        // Actions - Workflow
        submitForReview,
        approveDocument,
        rejectDocument,
        publishDocument,
        archiveDocument,

        // Actions - Query
        searchDocuments,
        searchByTags,

        // Actions - Bulk
        bulkDownload,
        bulkOperation,
        updateDocumentTags,

        // Actions - Verification
        verifyDocument,

        // Actions - Pagination & Filters
        setPage,
        setItemsPerPage,
        resetFilters,

        // Actions - Clear
        clear,
        clearSelection,
        resetError,

        // Auto-Refresh
        startAutoRefresh,
        stopAutoRefresh,

        // Helpers
        getStatusLabel,
        getStatusColor,
        getStatusIcon,
        getDocumentTypeLabel,
        formatFileSize,

        // Utils
        currentOrganisationId,
    }
}

export default useDocument