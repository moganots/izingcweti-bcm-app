import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Document,
  DocumentTemplate,
  DocumentStats,
} from '../../models/document/document.entity'
import { DocumentStatus } from '../../models/document/document.entity'
import { createOfflineCrudStore } from '../.base/offline-crud.store'
import { documentService } from '../../services/api/documents/DocumentService'
import { useAuthStore } from '../auth/auth.store'

// ============================================
// Offline-First CRUD Stores
// ============================================
export const useDocumentItemStore = createOfflineCrudStore<Document>({
  storeId: 'documents',
  tableName: 'documents',
})

export const useDocumentTemplateStore = createOfflineCrudStore<DocumentTemplate>({
  storeId: 'document-templates',
  tableName: 'documentTemplates',
})

// ============================================
// Main Document Store (Facade)
// ============================================
export const useDocumentStore = defineStore('document', () => {
  const docStore = useDocumentItemStore()
  const templateStore = useDocumentTemplateStore()
  const authStore = useAuthStore()

  const stats = ref<DocumentStats | null>(null)
  const isUploading = ref(false)
  const uploadProgress = ref(0)
  const isSaving = ref(false)
  const isInitialized = ref(false)

  const documents = docStore.items

  // ============================================
  // Getters - By Status
  // ============================================
  const publishedDocuments = computed(() =>
    documents?.filter(
      (d: Document) =>
        d.status === DocumentStatus.PUBLISHED ||
        d.status === DocumentStatus.APPROVED
    )
  )

  const draftDocuments = computed(() =>
    documents?.filter((d: Document) => d.status === DocumentStatus.DRAFT)
  )

  const archivedDocuments = computed(() =>
    documents?.filter((d: Document) => d.status === DocumentStatus.ARCHIVED)
  )

  const underReviewDocuments = computed(() =>
    documents?.filter((d: Document) => d.status === DocumentStatus.UNDER_REVIEW)
  )

  const pendingApprovalDocuments = computed(() =>
    documents?.filter(
      (d: Document) => d.status === DocumentStatus.PENDING_APPROVAL
    )
  )

  const rejectedDocuments = computed(() =>
    documents?.filter((d: Document) => d.status === DocumentStatus.REJECTED)
  )

  const expiredDocuments = computed(() =>
    documents?.filter((d: Document) => d.status === DocumentStatus.EXPIRED)
  )

  // ============================================
  // Getters - Groupings
  // ============================================
  const documentsByType = computed(() => {
    const grouped: Record<string, Document[]> = {}
    documents?.forEach((doc: Document) => {
      const type = doc.documentType || 'Unknown'
      if (!grouped[type]) grouped[type] = []
      grouped[type].push(doc)
    })
    return grouped
  })

  const documentsByAccessLevel = computed(() => {
    const grouped: Record<string, Document[]> = {}
    documents?.forEach((doc: Document) => {
      const level = doc.accessLevel || 'Unknown'
      if (!grouped[level]) grouped[level] = []
      grouped[level].push(doc)
    })
    return grouped
  })

  // ============================================
  // Getters - Metrics
  // ============================================
  const totalDocumentSize = computed(() =>
    documents?.reduce((sum: number, doc: Document) => sum + (doc.fileSize || 0), 0)
  )

  const totalDocumentSizeMB = computed(() => {
    const bytes = totalDocumentSize.value
    return parseFloat((bytes / (1024 * 1024)).toFixed(2))
  })

  const totalDownloadCount = computed(() =>
    documents?.reduce(
      (sum: number, doc: Document) => sum + (doc.downloadCount || 0),
      0
    )
  )

  // ============================================
  // Actions
  // ============================================
  async function initialize(): Promise<void> {
    if (isInitialized.value) return
    await Promise.all([docStore.initialize(), templateStore.initialize()])
    await refreshStats()
    isInitialized.value = true
  }

  async function refreshStats(): Promise<void> {
    try {
      const organisationId = authStore.userOrganisationId
      if (!organisationId) {
        console.warn('No organisation ID available for document stats')
        return
      }
      stats.value = await documentService.getDocumentStats(organisationId)
    } catch (err: any) {
      console.error('Failed to load document stats:', err)
    }
  }

  async function uploadDocument(
    file: File,
    metadata: Partial<Document>
  ): Promise<Document | null> {
    isUploading.value = true
    uploadProgress.value = 0

    try {
      const organisationId = authStore.userOrganisationId
      if (!organisationId) {
        console.warn('No organisation ID available for document upload')
        return null
      }

      const created = await documentService.createDocument(
        file,
        metadata,
        organisationId
      )

      await docStore.loadAll()
      return created
    } catch (err: any) {
      console.error('Failed to upload document:', err)
      return null
    } finally {
      isUploading.value = false
      uploadProgress.value = 0
    }
  }

  async function submitForReview(id: string): Promise<Document | null> {
    return docStore.update(id, {
      status: DocumentStatus.UNDER_REVIEW,
    } as Partial<Document>)
  }

  async function approveDocument(id: string, comments?: string): Promise<Document | null> {
    return docStore.update(id, {
      status: DocumentStatus.APPROVED,
      approvedAt: new Date(),
      approvalNotes: comments,
    } as Partial<Document>)
  }

  async function rejectDocument(
    id: string,
    rejectionReason: string
  ): Promise<Document | null> {
    return docStore.update(id, {
      status: DocumentStatus.REJECTED,
      rejectedAt: new Date(),
      rejectionReason,
    } as Partial<Document>)
  }

  async function publishDocument(id: string): Promise<Document | null> {
    return docStore.update(id, {
      status: DocumentStatus.PUBLISHED,
      publishedAt: new Date(),
    } as Partial<Document>)
  }

  async function archiveDocument(id: string): Promise<Document | null> {
    return docStore.update(id, {
      status: DocumentStatus.ARCHIVED,
    } as Partial<Document>)
  }

  async function downloadDocument(id: string): Promise<void> {
    try {
      await documentService.downloadDocument(id)
      // Local increment of download count
      const doc = documents?.find((d: Document) => d.uuid === id)
      if (doc) {
        await docStore.update(id, {
          downloadCount: (doc.downloadCount || 0) + 1,
        } as Partial<Document>)
      }
    } catch (err: any) {
      console.error('Failed to download document:', err)
    }
  }

  function reset(): void {
    docStore.reset()
    templateStore.reset()
    stats.value = null
    isUploading.value = false
    uploadProgress.value = 0
    isSaving.value = false
    isInitialized.value = false
  }

  // ============================================
  // Return Store Interface
  // ============================================
  return {
    // State
    documents,
    selectedDocument: docStore.selected,
    documentTemplates: templateStore.items,
    stats,
    isLoading: docStore.loading,
    isSaving,
    isUploading,
    uploadProgress,
    isInitialized,
    error: docStore.error,

    // Getters - By Status
    publishedDocuments,
    draftDocuments,
    archivedDocuments,
    underReviewDocuments,
    pendingApprovalDocuments,
    rejectedDocuments,
    expiredDocuments,

    // Getters - Groupings
    documentsByType,
    documentsByAccessLevel,

    // Getters - Metrics
    totalDocumentSize,
    totalDocumentSizeMB,
    totalDownloadCount,

    // Actions
    initialize,
    refreshStats,
    uploadDocument,
    submitForReview,
    approveDocument,
    rejectDocument,
    publishDocument,
    archiveDocument,
    downloadDocument,
    reset,

    // Sub-stores
    docStore,
    templateStore,
  }
})