import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Document } from '../models/entities/organisation.entity'
import { documentService } from '../services/api/DocumentService'
import { GetDocumentsParams } from 'src/types/document.types'

export const useDocumentStore = defineStore('document', () => {
    // ============================================
    // State
    // ============================================
    const documents = ref<Document[]>([])
    const selectedDocument = ref<Document | null>(null)
    const isLoading = ref(false)
    const isSaving = ref(false)
    const isUploading = ref(false)
    const uploadProgress = ref(0)
    const error = ref<string | null>(null)
    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalItems = ref(0)

    // ============================================
    // Getters
    // ============================================
    const publishedDocuments = computed(() => documents.value.filter((d) => d.status === 'PUBLISHED'))

    const draftDocuments = computed(() => documents.value.filter((d) => d.status === 'DRAFT'))

    const pendingReviewDocuments = computed(() =>
        documents.value.filter((d) => d.status === 'UNDER_REVIEW')
    )

    const approvedDocuments = computed(() => documents.value.filter((d) => d.status === 'APPROVED'))

    const rejectedDocuments = computed(() => documents.value.filter((d) => d.status === 'REJECTED'))

    const archivedDocuments = computed(() => documents.value.filter((d) => d.status === 'ARCHIVED'))

    const expiredDocuments = computed(() => documents.value.filter((d) => d.status === 'EXPIRED'))

    const documentsByType = computed(() => {
        const grouped: Record<string, Document[]> = {}
        documents.value.forEach((d) => {
            const type = d.document_type || 'Unknown'
            if (!grouped[type]) grouped[type] = []
            grouped[type].push(d)
        })
        return grouped
    })

    const documentsByStatus = computed(() => {
        const grouped: Record<string, Document[]> = {}
        documents.value.forEach((d) => {
            const status = d.status || 'Unknown'
            if (!grouped[status]) grouped[status] = []
            grouped[status].push(d)
        })
        return grouped
    })

    const totalSize = computed(() => documents.value.reduce((sum, d) => sum + (d.file_size || 0), 0))

    const totalDownloads = computed(() =>
        documents.value.reduce((sum, d) => sum + (d.download_count || 0), 0)
    )

    const popularDocuments = computed(() =>
        [...documents.value]
            .sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
            .slice(0, 10)
    )

    const recentDocuments = computed(() =>
        [...documents.value]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10)
    )

    // ============================================
    // Actions
    // ============================================

    /**
     * Load documents with optional filters
     */
    async function loadDocuments(filters?: GetDocumentsParams): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            const response = await documentService.getDocuments({
                ...filters,
                page: currentPage.value,
                limit: 12,
            })

            documents.value = response.data || []
            totalPages.value = response.totalPages || 1
            totalItems.value = response.total || 0
        } catch (err: any) {
            console.error('Failed to load documents:', err)
            error.value = err.message || 'Failed to load documents'
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Load a single document by ID
     */
    async function loadDocument(id: string): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            selectedDocument.value = await documentService.getDocument(id)
        } catch (err: any) {
            console.error('Failed to load document:', err)
            error.value = err.message || 'Failed to load document'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Upload a document
     */
    async function uploadDocument(
        formData: FormData,
        onProgress?: (progress: number) => void
    ): Promise<Document> {
        isUploading.value = true
        uploadProgress.value = 0
        error.value = null

        try {
            const uploaded = await documentService.uploadDocument(formData, (progress) => {
                uploadProgress.value = progress
                if (onProgress) onProgress(progress)
            })

            documents.value.unshift(uploaded)
            return uploaded
        } catch (err: any) {
            console.error('Failed to upload document:', err)
            error.value = err.response?.data?.message || err.message || 'Failed to upload document'
            throw err
        } finally {
            isUploading.value = false
            uploadProgress.value = 0
        }
    }

    /**
     * Download a document
     */
    async function downloadDocument(id: string, filename?: string): Promise<void> {
        try {
            await documentService.downloadDocument(id, filename)
            // Increment download count locally
            const doc = documents.value.find((d) => d.uuid === id)
            if (doc) {
                doc.download_count = (doc.download_count || 0) + 1
            }
        } catch (err: any) {
            console.error('Failed to download document:', err)
            error.value = err.message || 'Failed to download document'
            throw err
        }
    }

    /**
     * Update document metadata
     */
    async function updateDocument(id: string, data: Partial<Document>): Promise<Document> {
        isSaving.value = true
        error.value = null

        try {
            const updated = await documentService.updateDocument(id, data)
            const index = documents.value.findIndex((d) => d.uuid === id)
            if (index !== -1) {
                documents.value[index] = updated
            }
            if (selectedDocument.value?.uuid === id) {
                selectedDocument.value = updated
            }
            return updated
        } catch (err: any) {
            console.error('Failed to update document:', err)
            error.value = err.response?.data?.message || err.message || 'Failed to update document'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Delete a document
     */
    async function deleteDocument(id: string): Promise<void> {
        isSaving.value = true
        error.value = null

        try {
            await documentService.deleteDocument(id)
            documents.value = documents.value.filter((d) => d.uuid !== id)
            if (selectedDocument.value?.uuid === id) {
                selectedDocument.value = null
            }
        } catch (err: any) {
            console.error('Failed to delete document:', err)
            error.value = err.response?.data?.message || err.message || 'Failed to delete document'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Submit document for review
     */
    async function submitForReview(id: string): Promise<Document> {
        isSaving.value = true
        error.value = null

        try {
            const updated = await documentService.submitForReview(id)
            updateLocalDocument(id, updated)
            return updated
        } catch (err: any) {
            console.error('Failed to submit for review:', err)
            error.value = err.message || 'Failed to submit for review'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Approve a document
     */
    async function approveDocument(id: string, comments?: string): Promise<Document> {
        isSaving.value = true
        error.value = null

        try {
            const updated = await documentService.approveDocument(id, { comments } as any)
            updateLocalDocument(id, updated)
            return updated
        } catch (err: any) {
            console.error('Failed to approve document:', err)
            error.value = err.message || 'Failed to approve document'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Reject a document
     */
    async function rejectDocument(id: string, reason: string): Promise<Document> {
        isSaving.value = true
        error.value = null

        try {
            const updated = await documentService.rejectDocument(id, {
                rejection_reason: reason,
            })
            updateLocalDocument(id, updated)
            return updated
        } catch (err: any) {
            console.error('Failed to reject document:', err)
            error.value = err.message || 'Failed to reject document'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Publish a document
     */
    async function publishDocument(id: string): Promise<Document> {
        isSaving.value = true
        error.value = null

        try {
            const updated = await documentService.publishDocument(id)
            updateLocalDocument(id, updated)
            return updated
        } catch (err: any) {
            console.error('Failed to publish document:', err)
            error.value = err.message || 'Failed to publish document'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Archive a document
     */
    async function archiveDocument(id: string): Promise<Document> {
        isSaving.value = true
        error.value = null

        try {
            const updated = await documentService.archiveDocument(id)
            updateLocalDocument(id, updated)
            return updated
        } catch (err: any) {
            console.error('Failed to archive document:', err)
            error.value = err.message || 'Failed to archive document'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Search documents
     */
    async function searchDocuments(query: string, params?: GetDocumentsParams): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            const response = await documentService.searchDocuments(query, params)
            documents.value = response.data || []
            totalPages.value = response.totalPages || 1
        } catch (err: any) {
            console.error('Failed to search documents:', err)
            error.value = err.message || 'Failed to search documents'
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Get document statistics
     */
    async function getDocumentStats(organisationId?: string): Promise<any> {
        try {
            return await documentService.getDocumentStats(organisationId)
        } catch (err: any) {
            console.error('Failed to get document stats:', err)
            return null
        }
    }

    /**
     * Get document versions
     */
    async function getDocumentVersions(id: string): Promise<any> {
        try {
            return await documentService.getDocumentVersions(id)
        } catch (err: any) {
            console.error('Failed to get document versions:', err)
            return []
        }
    }

    /**
     * Restore a document version
     */
    async function restoreVersion(documentId: string, versionNumber: number): Promise<Document> {
        isSaving.value = true
        error.value = null

        try {
            const updated = await documentService.restoreDocumentVersion(documentId, versionNumber)
            updateLocalDocument(documentId, updated)
            return updated
        } catch (err: any) {
            console.error('Failed to restore version:', err)
            error.value = err.message || 'Failed to restore version'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Get document download URL
     */
    async function getDownloadUrl(id: string): Promise<string> {
        try {
            return await documentService.getDownloadUrl(id)
        } catch (err: any) {
            console.error('Failed to get download URL:', err)
            return ''
        }
    }

    /**
     * Set current page and reload
     */
    async function setPage(page: number): Promise<void> {
        currentPage.value = page
        await loadDocuments()
    }

    /**
     * Clear selected document
     */
    function clearSelection(): void {
        selectedDocument.value = null
    }

    /**
     * Clear all document data
     */
    function clearAll(): void {
        documents.value = []
        selectedDocument.value = null
        error.value = null
        currentPage.value = 1
        totalPages.value = 1
        totalItems.value = 0
        uploadProgress.value = 0
    }

    // ============================================
    // Private Helpers
    // ============================================

    function updateLocalDocument(id: string, updated: Document): void {
        const index = documents.value.findIndex((d) => d.uuid === id)
        if (index !== -1) {
            documents.value[index] = updated
        }
        if (selectedDocument.value?.uuid === id) {
            selectedDocument.value = updated
        }
    }

    return {
        // State
        documents,
        selectedDocument,
        isLoading,
        isSaving,
        isUploading,
        uploadProgress,
        error,
        currentPage,
        totalPages,
        totalItems,
        // Getters
        publishedDocuments,
        draftDocuments,
        pendingReviewDocuments,
        approvedDocuments,
        rejectedDocuments,
        archivedDocuments,
        expiredDocuments,
        documentsByType,
        documentsByStatus,
        totalSize,
        totalDownloads,
        popularDocuments,
        recentDocuments,
        // Actions
        loadDocuments,
        loadDocument,
        uploadDocument,
        downloadDocument,
        updateDocument,
        deleteDocument,
        submitForReview,
        approveDocument,
        rejectDocument,
        publishDocument,
        archiveDocument,
        searchDocuments,
        getDocumentStats,
        getDocumentVersions,
        restoreVersion,
        getDownloadUrl,
        setPage,
        clearSelection,
        clearAll,
    }
})
