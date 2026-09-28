import { BaseService } from './../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
  DocumentType,
  DocumentStatus,
  AccessLevel,
  type Document,
  type DocumentVersion,
  type DocumentTemplate,
  type DocumentStats,
  type CreateDocumentRequest,
  type UpdateDocumentRequest,
  type ApproveDocumentRequest,
  type RejectDocumentRequest,
  type DocumentVersionRequest,
  type GenerateDocumentFromTemplateRequest,
  type DocumentSearchParams,
  type DocumentBulkOperationRequest,
  type DocumentBulkOperationResult,
  type DocumentQueryParams,
  type DocumentVerificationResult,
  type DocumentUploadProgress,
} from './../../../models/document/document.entity'
import { PaginatedResponse } from './../../../shared/types/common.types'
import { formatISO } from './../../../utils/date.utils'

/**
 * Document Service - Aligned with Backend DTOs (camelCase)
 */
export class DocumentService extends BaseService {
  // ============================================
  // CRUD Operations
  // ============================================

  /**
   * Get documents - GET /documents
   */
  async getDocuments(params?: DocumentQueryParams): Promise<PaginatedResponse<Document>> {
    const response = await this.getPaginated<Document>(
      API_ENDPOINTS.DOCUMENTS.BASE,
      params as Record<string, any>
    )
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
      hasMore: response.hasMore || false,
    }
  }

  /**
   * Get document by ID - GET /documents/:uuid
   */
  async getDocument(id: string): Promise<Document> {
    const response = await this.get<Document>(API_ENDPOINTS.DOCUMENTS.BY_ID(id))
    return this.extractData(response)
  }

  /**
   * Create/Upload document
   * POST /document/upload
   *
   * @param file - File to upload
   * @param metadata - Document metadata (title, type, access level, tags, etc.)
   * @param organisationId - Organisation this document belongs to
   * @param onProgress - Optional progress callback
   */
  async createDocument(
    file: File,
    metadata: Partial<Document>,
    organisationId: string,
    onProgress?: (progress: DocumentUploadProgress) => void
  ): Promise<Document> {
    const formData = new FormData()

    // Required fields
    formData.append('file', file)
    formData.append('organisationId', organisationId)

    if (metadata.title) formData.append('title', metadata.title)
    if (metadata.description) formData.append('description', metadata.description)
    if (metadata.documentType) formData.append('documentType', metadata.documentType)
    if (metadata.accessLevel) {
      formData.append('accessLevel', metadata.accessLevel)
    } else {
      formData.append('accessLevel', AccessLevel.INTERNAL)
    }
    if (metadata.businessUnitId) {
      formData.append('businessUnitId', metadata.businessUnitId)
    }
    if (metadata.departmentId) {
      formData.append('departmentId', metadata.departmentId)
    }
    if (metadata.tags) formData.append('tags', JSON.stringify(metadata.tags))
    if (metadata.metadata) {
      formData.append('metadata', JSON.stringify(metadata.metadata))
    }
    if (metadata.expiresAt) {
      formData.append('expiresAt', String(metadata.expiresAt))
    }

    const response = await this.upload<Document>(
      API_ENDPOINTS.DOCUMENTS.UPLOAD,
      formData,
      (percent) => {
        if (onProgress) {
          onProgress({ loaded: percent, total: 100, percent })
        }
      }
    )

    return this.extractData(response)
  }

  /**
   * Update document - PUT /documents/:uuid
   */
  async updateDocument(id: string, data: UpdateDocumentRequest): Promise<Document> {
    const response = await this.put<Document>(API_ENDPOINTS.DOCUMENTS.BY_ID(id), data)
    return this.extractData(response)
  }

  /**
   * Delete document - DELETE /documents/:uuid
   */
  async deleteDocument(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.DOCUMENTS.BY_ID(id))
  }

  // ============================================
  // Version Operations
  // ============================================

  /**
   * Upload new version - PUT /documents/:uuid/new-version
   */
  async uploadNewVersion(
    id: string,
    file: File,
    data?: DocumentVersionRequest,
    onProgress?: (progress: DocumentUploadProgress) => void
  ): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)
    if (data?.title) formData.append('title', data.title)
    if (data?.description) formData.append('description', data.description)
    if (data?.tags) formData.append('tags', JSON.stringify(data.tags))

    const response = await this.upload<Document>(
      API_ENDPOINTS.DOCUMENTS.NEW_VERSION(id),
      formData,
      (percent) => {
        if (onProgress) {
          onProgress({ loaded: percent, total: 100, percent })
        }
      }
    )
    return this.extractData(response)
  }

  /**
   * Get document versions - GET /documents/:uuid/versions
   */
  async getDocumentVersions(id: string): Promise<DocumentVersion[]> {
    const response = await this.get<DocumentVersion[]>(API_ENDPOINTS.DOCUMENTS.VERSIONS(id))
    return this.extractData(response)
  }

  /**
   * Restore version - POST /documents/:uuid/restore/:versionNumber
   */
  async restoreVersion(id: string, versionNumber: number): Promise<Document> {
    const response = await this.post<Document>(
      API_ENDPOINTS.DOCUMENTS.RESTORE(id, versionNumber)
    )
    return this.extractData(response)
  }

  // ============================================
  // Download & Preview
  // ============================================

  /**
   * Download document - GET /documents/:uuid/download
   */
  async downloadDocument(id: string, filename?: string): Promise<void> {
    await this.download(API_ENDPOINTS.DOCUMENTS.DOWNLOAD(id), filename)
  }

  /**
   * Preview document - GET /documents/:uuid/preview
   */
  async previewDocument(id: string): Promise<string> {
    const response = await this.get<{ url: string }>(`/documents/${id}/preview`)
    return this.extractData(response).url
  }

  // ============================================
  // Workflow Operations
  // ============================================

  /**
   * Submit for review - PATCH /documents/:uuid/submit-review
   */
  async submitForReview(id: string): Promise<Document> {
    const response = await this.patch<Document>(API_ENDPOINTS.DOCUMENTS.SUBMIT_REVIEW(id))
    return this.extractData(response)
  }

  /**
   * Approve document - PATCH /documents/:uuid/approve
   */
  async approveDocument(id: string, data?: ApproveDocumentRequest): Promise<Document> {
    const response = await this.patch<Document>(API_ENDPOINTS.DOCUMENTS.APPROVE(id), data || {})
    return this.extractData(response)
  }

  /**
   * Reject document - PATCH /documents/:uuid/reject
   */
  async rejectDocument(id: string, data: RejectDocumentRequest): Promise<Document> {
    const response = await this.patch<Document>(API_ENDPOINTS.DOCUMENTS.REJECT(id), data)
    return this.extractData(response)
  }

  /**
   * Archive document - PATCH /documents/:uuid/archive
   */
  async archiveDocument(id: string): Promise<Document> {
    const response = await this.patch<Document>(API_ENDPOINTS.DOCUMENTS.ARCHIVE(id))
    return this.extractData(response)
  }

  /**
   * Publish document - PATCH /documents/:uuid/publish
   */
  async publishDocument(id: string): Promise<Document> {
    const response = await this.patch<Document>(API_ENDPOINTS.DOCUMENTS.PUBLISH(id))
    return this.extractData(response)
  }

  // ============================================
  // Query Operations
  // ============================================

  /**
   * Search documents - GET /documents/search
   */
  async searchDocuments(
    params: DocumentSearchParams
  ): Promise<PaginatedResponse<Document>> {
    const response = await this.getPaginated<Document>(
      API_ENDPOINTS.DOCUMENTS.SEARCH,
      params as Record<string, any>
    )
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
      hasMore: response.hasMore || false,
    }
  }

  /**
   * Get documents by organisation - GET /documents/organisation/:organisationId
   */
  async getDocumentsByOrganisation(
    organisationId: string,
    params?: DocumentQueryParams
  ): Promise<PaginatedResponse<Document>> {
    return this.getDocuments({ ...params, organisationId })
  }

  /**
   * Get documents by type - GET /documents/type/:documentType
   */
  async getDocumentsByType(
    documentType: DocumentType,
    params?: DocumentQueryParams
  ): Promise<PaginatedResponse<Document>> {
    return this.getDocuments({ ...params, documentType })
  }

  /**
   * Get documents by status - GET /documents/status/:status
   */
  async getDocumentsByStatus(
    status: DocumentStatus,
    params?: DocumentQueryParams
  ): Promise<PaginatedResponse<Document>> {
    return this.getDocuments({ ...params, status })
  }

  /**
   * Get pending approvals - GET /documents/pending-approvals
   */
  async getPendingApprovals(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Document>> {
    return this.getPaginated<Document>(API_ENDPOINTS.DOCUMENTS.PENDING_APPROVALS, params as Record<string, any>)
  }

  /**
   * Get approved documents - GET /documents/approved
   */
  async getApprovedDocuments(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Document>> {
    return this.getPaginated<Document>(API_ENDPOINTS.DOCUMENTS.APPROVED, params as Record<string, any>)
  }

  /**
   * Get expired documents - GET /documents/expired
   */
  async getExpiredDocuments(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Document>> {
    return this.getPaginated<Document>(API_ENDPOINTS.DOCUMENTS.EXPIRED, params as Record<string, any>)
  }

  /**
   * Search by tags - GET /documents/search?tags=...
   */
  async searchByTags(tags: string[], params?: DocumentQueryParams): Promise<PaginatedResponse<Document>> {
    return this.getDocuments({ ...params, tags: tags.join(',') })
  }

  // ============================================
  // Statistics
  // ============================================

  /**
   * Get document statistics - GET /documents/stats
   */
  async getDocumentStats(organisationId: string): Promise<DocumentStats> {
    const response = await this.get<DocumentStats>(API_ENDPOINTS.DOCUMENTS.STATS, {
      organisationId,
    })
    return this.extractData(response)
  }

  // ============================================
  // Bulk Operations
  // ============================================

  /**
   * Bulk download - GET /documents/bulk-download
   */
  async bulkDownload(docIds: string[]): Promise<void> {
    await this.download(
      '/documents/bulk-download',
      `documents_bulk_${formatISO(new Date())}.zip`,
      { params: { ids: docIds.join(',') } }
    )
  }

  /**
   * Bulk operation - POST /documents/bulk-operation
   */
  async bulkOperation(request: DocumentBulkOperationRequest): Promise<DocumentBulkOperationResult> {
    const response = await this.post<DocumentBulkOperationResult>(
      '/documents/bulk-operation',
      request
    )
    return this.extractData(response)
  }

  /**
   * Update document tags - PATCH /documents/:uuid/tags
   */
  async updateDocumentTags(id: string, tags: string[]): Promise<Document> {
    const response = await this.patch<Document>(`/documents/${id}/tags`, { tags })
    return this.extractData(response)
  }

  // ============================================
  // Verification & Templates
  // ============================================

  /**
   * Verify document - GET /documents/:uuid/verify
   */
  async verifyDocument(id: string): Promise<DocumentVerificationResult> {
    const response = await this.get<DocumentVerificationResult>(`/documents/${id}/verify`)
    return this.extractData(response)
  }

  /**
   * Get document templates - GET /documents/templates
   */
  async getDocumentTemplates(documentType?: DocumentType): Promise<DocumentTemplate[]> {
    const params = documentType ? { documentType } : undefined
    const response = await this.get<DocumentTemplate[]>('/documents/templates', params)
    return this.extractData(response)
  }

  /**
   * Generate document from template - POST /documents/generate-from-template
   */
  async generateFromTemplate(
    request: GenerateDocumentFromTemplateRequest
  ): Promise<{ document: Document; downloadUrl: string }> {
    const response = await this.post<{ document: Document; downloadUrl: string }>(
      '/documents/generate-from-template',
      request
    )
    return this.extractData(response)
  }
}

export const documentService = new DocumentService()