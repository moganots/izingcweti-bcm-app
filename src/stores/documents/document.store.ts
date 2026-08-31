import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { documentService } from './../../services/api/document/DocumentService'
import type {
  Document,
  DocumentVersion,
  DocumentStats,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  ApproveDocumentRequest,
  RejectDocumentRequest,
  DocumentQueryParams,
  DocumentSearchParams,
  DocumentVerificationResult,
  DocumentUploadProgress,
  DocumentBulkOperationRequest,
} from './../../models/entities/document/document.entity'
import {
  DocumentStatus,
  DocumentType,
  AccessLevel,
} from './../../models/entities/document/document.entity'

export const useDocumentStore = defineStore('document', () => {
  // ============================================
  // State
  // ============================================
  const documents = ref<Document[]>([])
  const selectedDocument = ref<Document | null>(null)
  const documentVersions = ref<DocumentVersion[]>([])
  const stats = ref<DocumentStats | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const error = ref<string | null>(null)

  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = ref(20)

  const filters = ref<DocumentQueryParams>({})

  // ============================================
  // Getters
  // ============================================

  const hasDocuments = computed(() => documents.value.length > 0)

  const publishedDocuments = computed(() =>
    documents.value.filter((doc) =>
      doc.status === DocumentStatus.PUBLISHED || doc.status === DocumentStatus.APPROVED
    )
  )

  const draftDocuments = computed(() =>
    documents.value.filter((doc) => doc.status === DocumentStatus.DRAFT)
  )

  const archivedDocuments = computed(() =>
    documents.value.filter((doc) => doc.status === DocumentStatus.ARCHIVED)
  )

  const underReviewDocuments = computed(() =>
    documents.value.filter((doc) => doc.status === DocumentStatus.UNDER_REVIEW)
  )

  const rejectedDocuments = computed(() =>
    documents.value.filter((doc) => doc.status === DocumentStatus.REJECTED)
  )

  const pendingApprovalDocuments = computed(() =>
    documents.value.filter((doc) => doc.status === DocumentStatus.PENDING_APPROVAL)
  )

  const documentsByType = computed(() => {
    const grouped: Record<string, Document[]> = {}
    documents.value.forEach((doc) => {
      const type = doc.documentType || 'Unknown'
      if (!grouped[type]) grouped[type] = []
      grouped[type].push(doc)
    })
    return grouped
  })

  const documentsByStatus = computed(() => {
    const grouped: Record<string, Document[]> = {}
    documents.value.forEach((doc) => {
      const status = doc.status || 'Unknown'
      if (!grouped[status]) grouped[status] = []
      grouped[status].push(doc)
    })
    return grouped
  })

  const documentsByAccessLevel = computed(() => {
    const grouped: Record<string, Document[]> = {}
    documents.value.forEach((doc) => {
      const level = doc.accessLevel || 'Unknown'
      if (!grouped[level]) grouped[level] = []
      grouped[level].push(doc)
    })
    return grouped
  })

  const totalDocumentSize = computed(() => {
    return documents.value.reduce((sum, doc) => sum + (doc.fileSize || 0), 0)
  })

  const totalDownloadCount = computed(() => {
    return documents.value.reduce((sum, doc) => sum + (doc.downloadCount || 0), 0)
  })

  const isEmpty = computed(() => documents.value.length === 0 && !isLoading.value)

  // ============================================
  // Actions - CRUD
  // ============================================

  async function loadDocuments(params?: DocumentQueryParams): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const queryParams = {
        ...filters.value,
        ...params,
        page: currentPage.value,
        limit: itemsPerPage.value,
      }
      const response = await documentService.getDocuments(queryParams)

      documents.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0

      if (params) filters.value = { ...filters.value, ...params }
    } catch (err: any) {
      console.error('Failed to load documents:', err)
      error.value = err.message || 'Failed to load documents'
    } finally {
      isLoading.value = false
    }
  }

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

  async function loadDocumentVersions(id: string): Promise<void> {
    isLoading.value = true

    try {
      documentVersions.value = await documentService.getDocumentVersions(id)
    } catch (err: any) {
      console.error('Failed to load document versions:', err)
      error.value = err.message || 'Failed to load versions'
    } finally {
      isLoading.value = false
    }
  }

  async function createDocument(data: CreateDocumentRequest & { file: File }): Promise<Document> {
    isSaving.value = true
    error.value = null

    try {
      const created = await documentService.createDocument(data)
      documents.value.unshift(created)
      return created
    } catch (err: any) {
      console.error('Failed to create document:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to create document'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function updateDocument(id: string, data: UpdateDocumentRequest): Promise<Document> {
    isSaving.value = true
    error.value = null

    try {
      const updated = await documentService.updateDocument(id, data)
      updateLocalDocument(updated)
      return updated
    } catch (err: any) {
      console.error('Failed to update document:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to update document'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function deleteDocument(id: string): Promise<void> {
    isSaving.value = true
    error.value = null

    try {
      await documentService.deleteDocument(id)
      documents.value = documents.value.filter((doc) => doc.uuid !== id)
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

  // ============================================
  // Actions - Version Operations
  // ============================================

  async function uploadNewVersion(
    id: string,
    file: File,
    data?: { title?: string; description?: string; tags?: string[] }
  ): Promise<Document> {
    isUploading.value = true
    uploadProgress.value = 0
    error.value = null

    try {
      const updated = await documentService.uploadNewVersion(
        id,
        file,
        data,
        (progress: DocumentUploadProgress) => {
          uploadProgress.value = progress.percent
        }
      )

      updateLocalDocument(updated)
      return updated
    } catch (err: any) {
      console.error('Failed to upload new version:', err)
      error.value = err.message || 'Failed to upload new version'
      throw err
    } finally {
      isUploading.value = false
      uploadProgress.value = 0
    }
  }

  async function restoreVersion(id: string, versionNumber: number): Promise<Document> {
    isSaving.value = true

    try {
      const updated = await documentService.restoreVersion(id, versionNumber)
      updateLocalDocument(updated)
      await loadDocumentVersions(id)
      return updated
    } catch (err: any) {
      error.value = err.message || 'Failed to restore version'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  // ============================================
  // Actions - Download & Preview
  // ============================================

  async function downloadDocument(id: string, filename?: string): Promise<void> {
    try {
      await documentService.downloadDocument(id, filename)
    } catch (err: any) {
      console.error('Failed to download document:', err)
      error.value = err.message || 'Failed to download document'
      throw err
    }
  }

  async function previewDocument(id: string): Promise<string> {
    try {
      return await documentService.previewDocument(id)
    } catch (err: any) {
      console.error('Failed to preview document:', err)
      error.value = err.message || 'Failed to preview document'
      throw err
    }
  }

  // ============================================
  // Actions - Workflow
  // ============================================

  async function submitForReview(id: string): Promise<Document> {
    isSaving.value = true

    try {
      const updated = await documentService.submitForReview(id)
      updateLocalDocument(updated)
      return updated
    } catch (err: any) {
      error.value = err.message || 'Failed to submit for review'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function approveDocument(id: string, comments?: string): Promise<Document> {
    isSaving.value = true

    try {
      const data: ApproveDocumentRequest = { comments }
      const updated = await documentService.approveDocument(id, data)
      updateLocalDocument(updated)
      return updated
    } catch (err: any) {
      error.value = err.message || 'Failed to approve document'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function rejectDocument(id: string, rejectionReason: string, comments?: string): Promise<Document> {
    isSaving.value = true

    try {
      const data: RejectDocumentRequest = { rejectionReason, comments }
      const updated = await documentService.rejectDocument(id, data)
      updateLocalDocument(updated)
      return updated
    } catch (err: any) {
      error.value = err.message || 'Failed to reject document'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function publishDocument(id: string): Promise<Document> {
    isSaving.value = true

    try {
      const updated = await documentService.publishDocument(id)
      updateLocalDocument(updated)
      return updated
    } catch (err: any) {
      error.value = err.message || 'Failed to publish document'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function archiveDocument(id: string): Promise<Document> {
    isSaving.value = true

    try {
      const updated = await documentService.archiveDocument(id)
      updateLocalDocument(updated)
      return updated
    } catch (err: any) {
      error.value = err.message || 'Failed to archive document'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  // ============================================
  // Actions - Query
  // ============================================

  async function loadDocumentsByOrganisation(
    organisationId: string,
    params?: DocumentQueryParams
  ): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const queryParams = {
        ...params,
        page: currentPage.value,
        limit: itemsPerPage.value,
      }
      const response = await documentService.getDocumentsByOrganisation(
        organisationId,
        queryParams
      )

      documents.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      console.error('Failed to load documents by organisation:', err)
      error.value = err.message || 'Failed to load documents'
    } finally {
      isLoading.value = false
    }
  }

  async function searchDocuments(params: DocumentSearchParams): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await documentService.searchDocuments({
        ...params,
        page: currentPage.value,
        limit: itemsPerPage.value,
      })
      documents.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      error.value = err.message || 'Failed to search documents'
    } finally {
      isLoading.value = false
    }
  }

  async function searchByTags(tags: string[], organisationId?: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await documentService.searchByTags(tags, {
        organisationId,
        page: currentPage.value,
        limit: itemsPerPage.value,
      })
      documents.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      error.value = err.message || 'Failed to search by tags'
    } finally {
      isLoading.value = false
    }
  }

  async function loadPendingApprovals(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await documentService.getPendingApprovals({
        page: currentPage.value,
        limit: itemsPerPage.value,
      })
      documents.value = response.data || []
      totalPages.value = response.totalPages || 1
      totalItems.value = response.total || 0
    } catch (err: any) {
      error.value = err.message || 'Failed to load pending approvals'
    } finally {
      isLoading.value = false
    }
  }

  // ============================================
  // Actions - Statistics
  // ============================================

  async function loadStats(organisationId: string): Promise<void> {
    try {
      stats.value = await documentService.getDocumentStats(organisationId)
    } catch (err: any) {
      console.error('Failed to load document stats:', err)
      error.value = err.message || 'Failed to load document stats'
    }
  }

  // ============================================
  // Actions - Bulk Operations
  // ============================================

  async function bulkDownload(docIds: string[]): Promise<void> {
    try {
      await documentService.bulkDownload(docIds)
    } catch (err: any) {
      error.value = err.message || 'Failed to download documents'
      throw err
    }
  }

  async function bulkOperation(request: DocumentBulkOperationRequest): Promise<DocumentBulkOperationResult> {
    isSaving.value = true

    try {
      const result = await documentService.bulkOperation(request)
      await loadDocuments()
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to perform bulk operation'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function updateDocumentTags(id: string, tags: string[]): Promise<Document> {
    isSaving.value = true

    try {
      const updated = await documentService.updateDocumentTags(id, tags)
      updateLocalDocument(updated)
      return updated
    } catch (err: any) {
      error.value = err.message || 'Failed to update tags'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  // ============================================
  // Actions - Verification
  // ============================================

  async function verifyDocument(id: string): Promise<DocumentVerificationResult> {
    try {
      return await documentService.verifyDocument(id)
    } catch (err: any) {
      error.value = err.message || 'Failed to verify document'
      throw err
    }
  }

  // ============================================
  // Actions - Pagination & Filters
  // ============================================

  async function setPage(page: number): Promise<void> {
    currentPage.value = page
    await loadDocuments()
  }

  function setItemsPerPage(limit: number): void {
    itemsPerPage.value = limit
    currentPage.value = 1
  }

  function resetFilters(): void {
    filters.value = {}
  }

  // ============================================
  // Actions - Clear State
  // ============================================

  function clearSelection(): void {
    selectedDocument.value = null
    documentVersions.value = []
  }

  function clearAll(): void {
    documents.value = []
    selectedDocument.value = null
    documentVersions.value = []
    stats.value = null
    error.value = null
    currentPage.value = 1
    totalPages.value = 1
    totalItems.value = 0
    filters.value = {}
    uploadProgress.value = 0
  }

  function resetError(): void {
    error.value = null
  }

  // ============================================
  // Private Helpers
  // ============================================

  function updateLocalDocument(updated: Document): void {
    const index = documents.value.findIndex((doc) => doc.uuid === updated.uuid)
    if (index !== -1) {
      documents.value[index] = updated
    }
    if (selectedDocument.value?.uuid === updated.uuid) {
      selectedDocument.value = updated
    }
  }

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

    // CRUD
    loadDocuments,
    loadDocument,
    createDocument,
    updateDocument,
    deleteDocument,

    // Versions
    loadDocumentVersions,
    uploadNewVersion,
    restoreVersion,

    // Download & Preview
    downloadDocument,
    previewDocument,

    // Workflow
    submitForReview,
    approveDocument,
    rejectDocument,
    publishDocument,
    archiveDocument,

    // Query
    loadDocumentsByOrganisation,
    searchDocuments,
    searchByTags,
    loadPendingApprovals,

    // Statistics
    loadStats,

    // Bulk Operations
    bulkDownload,
    bulkOperation,
    updateDocumentTags,

    // Verification
    verifyDocument,

    // Pagination & Filters
    setPage,
    setItemsPerPage,
    resetFilters,

    // Clear State
    clearSelection,
    clearAll,
    resetError,
  }
})