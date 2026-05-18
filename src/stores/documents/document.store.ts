import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Document, DocumentVersion } from './../../models/entities'
import { documentService } from './../../services/api'
import type { DocumentVerificationResult } from './../../services/api'
import type {
  DocumentQueryParams,
  CreateDocumentRequest,
  UpdateDocumentRequest,
} from './../../types'

export const useDocumentStore = defineStore('document', () => {
  // ============================================
  // State
  // ============================================
  const documents = ref<Document[]>([])
  const selectedDocument = ref<Document | null>(null)
  const documentVersions = ref<DocumentVersion[]>([])
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
    documents.value.filter((doc) => doc.status === 'PUBLISHED' || doc.status === 'APPROVED')
  )

  const draftDocuments = computed(() => documents.value.filter((doc) => doc.status === 'DRAFT'))

  const archivedDocuments = computed(() =>
    documents.value.filter((doc) => doc.status === 'ARCHIVED')
  )

  const documentsByType = computed(() => {
    const grouped: Record<string, Document[]> = {}
    documents.value.forEach((doc) => {
      const type = doc.document_type || 'Unknown'
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

  const totalDocumentSize = computed(() => {
    return documents.value.reduce((sum, doc) => sum + (doc.file_size || 0), 0)
  })

  // ============================================
  // Helper Functions
  // ============================================

  /**
   * Convert tags to the expected format for DocumentQueryParams
   */
  function normalizeTagsParam(tags?: string | string[]): string[] | undefined {
    if (!tags) return undefined
    if (Array.isArray(tags)) return tags
    return [tags]
  }

  /**
   * Prepare query params with proper types
   */
  function prepareQueryParams(params?: DocumentQueryParams): Record<string, any> | undefined {
    if (!params) return undefined

    const result: Record<string, any> = {}

    // Copy all properties, but handle tags specially
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'tags') {
          const tags = normalizeTagsParam(value as string | string[])
          if (tags && tags.length > 0) {
            result[key] = tags
          }
        } else {
          result[key] = value
        }
      }
    })

    return result
  }

  // ============================================
  // Actions
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
      const normalizedParams = prepareQueryParams(queryParams)
      const response = await documentService.getDocuments(normalizedParams)

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

  async function createDocument(data: CreateDocumentRequest): Promise<Document> {
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
      const index = documents.value.findIndex((doc) => doc.uuid === id)
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

  async function uploadNewVersion(id: string, file: File): Promise<Document> {
    isUploading.value = true
    uploadProgress.value = 0
    error.value = null

    try {
      const updated = await documentService.uploadNewVersion(id, file, (progress) => {
        uploadProgress.value = progress.percent
      })

      // Update in list
      const index = documents.value.findIndex((doc) => doc.uuid === id)
      if (index !== -1) {
        documents.value[index] = updated
      }
      if (selectedDocument.value?.uuid === id) {
        selectedDocument.value = updated
      }

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

  async function approveDocument(id: string, comments?: string): Promise<Document> {
    isSaving.value = true

    try {
      const updated = await documentService.approveDocument(id, comments)
      updateLocalDocument(updated)
      return updated
    } catch (err: any) {
      error.value = err.message || 'Failed to approve document'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function rejectDocument(id: string, reason: string): Promise<Document> {
    isSaving.value = true

    try {
      const updated = await documentService.rejectDocument(id, reason)
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

  async function verifyDocument(id: string): Promise<DocumentVerificationResult> {
    try {
      return await documentService.verifyDocument(id)
    } catch (err: any) {
      error.value = err.message || 'Failed to verify document'
      throw err
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
      const normalizedParams = prepareQueryParams(queryParams)
      const response = await documentService.getDocumentsByOrganisation(
        organisationId,
        normalizedParams
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

  async function searchDocuments(query: string, organisationId?: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await documentService.searchDocuments(query, organisationId)
      documents.value = response.data || []
      totalPages.value = response.totalPages || 1
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
      const response = await documentService.searchByTags(tags, organisationId)
      documents.value = response.data || []
      totalPages.value = response.totalPages || 1
    } catch (err: any) {
      error.value = err.message || 'Failed to search by tags'
    } finally {
      isLoading.value = false
    }
  }

  async function bulkDownload(docIds: string[]): Promise<void> {
    try {
      await documentService.bulkDownload(docIds)
    } catch (err: any) {
      error.value = err.message || 'Failed to download documents'
      throw err
    }
  }

  async function getDocumentStats(organisationId: string): Promise<{
    total: number
    by_type: Record<string, number>
    by_status: Record<string, number>
    total_size: number
    recent_uploads: Document[]
  }> {
    try {
      return await documentService.getDocumentStats(organisationId)
    } catch (err: any) {
      console.error('Failed to get document stats:', err)
      error.value = err.message || 'Failed to get document stats'
      throw err
    }
  }

  function updateLocalDocument(updated: Document): void {
    const index = documents.value.findIndex((doc) => doc.uuid === updated.uuid)
    if (index !== -1) {
      documents.value[index] = updated
    }
    if (selectedDocument.value?.uuid === updated.uuid) {
      selectedDocument.value = updated
    }
  }

  function clearSelection(): void {
    selectedDocument.value = null
    documentVersions.value = []
  }

  function clearAll(): void {
    documents.value = []
    selectedDocument.value = null
    documentVersions.value = []
    error.value = null
    currentPage.value = 1
    totalPages.value = 1
    totalItems.value = 0
    filters.value = {}
    uploadProgress.value = 0
  }

  function resetFilters(): void {
    filters.value = {}
  }

  async function setPage(page: number): Promise<void> {
    currentPage.value = page
    await loadDocuments()
  }

  async function setItemsPerPage(limit: number): Promise<void> {
    itemsPerPage.value = limit
    currentPage.value = 1
    await loadDocuments()
  }

  return {
    // State
    documents,
    selectedDocument,
    documentVersions,
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
    documentsByType,
    documentsByStatus,
    totalDocumentSize,

    // Actions
    loadDocuments,
    loadDocument,
    loadDocumentVersions,
    createDocument,
    updateDocument,
    deleteDocument,
    uploadNewVersion,
    downloadDocument,
    previewDocument,
    approveDocument,
    rejectDocument,
    publishDocument,
    archiveDocument,
    restoreVersion,
    verifyDocument,
    updateDocumentTags,
    loadDocumentsByOrganisation,
    searchDocuments,
    searchByTags,
    bulkDownload,
    getDocumentStats,
    clearSelection,
    clearAll,
    resetFilters,
    setPage,
    setItemsPerPage,
  }
})
