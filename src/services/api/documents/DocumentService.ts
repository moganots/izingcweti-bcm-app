import { BaseService } from './../../BaseService'
import {
  DocumentType,
  DocumentStatus,
  AccessLevel,
  type Document,
  type DocumentVersion,
  type DocumentTemplate,
  type DocumentStats,
  type UploadDocumentRequest,
  type UpdateDocumentRequest,
  type ApproveDocumentRequest,
  type RejectDocumentRequest,
  type GenerateDocumentFromTemplateRequest,
  type DocumentSearchParams,
  type DocumentBulkOperationRequest,
  type DocumentBulkOperationResult,
  type DocumentQueryParams,
  type PaginatedResponse,
} from './../../../modules'

export interface DocumentUploadProgress {
  loaded: number
  total: number
  percent: number
}

export interface DocumentVerificationResult {
  verified: boolean
  checksum_match: boolean
  message?: string
}

export class DocumentService extends BaseService {
  async getDocuments(params?: DocumentQueryParams): Promise<PaginatedResponse<Document>> {
    return this.getPaginated<Document>('/documents', params as Record<string, any>)
  }

  async getDocument(id: string): Promise<Document> {
    const response = await this.get<Document>(`/documents/${id}`)
    return this.extractData(response)
  }

  async createDocument(data: UploadDocumentRequest & { file: File }): Promise<Document> {
    const formData = new FormData()
    formData.append('title', data.title)
    if (data.description) formData.append('description', data.description)
    formData.append('document_type', data.document_type)
    formData.append('access_level', data.access_level || AccessLevel.INTERNAL)
    formData.append('file', data.file)
    formData.append('organisation_id', data.organisation_id)
    if (data.tags) formData.append('tags', JSON.stringify(data.tags))
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata))
    if (data.expires_at) formData.append('expires_at', data.expires_at)

    const response = await this.upload<Document>('/documents', formData)
    return this.extractData(response)
  }

  async updateDocument(id: string, data: UpdateDocumentRequest): Promise<Document> {
    const response = await this.put<Document>(`/documents/${id}`, data)
    return this.extractData(response)
  }

  async deleteDocument(id: string): Promise<void> {
    await this.delete(`/documents/${id}`)
  }

  async uploadNewVersion(
    id: string,
    file: File,
    onProgress?: (progress: DocumentUploadProgress) => void
  ): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.upload<Document>(
      `/documents/${id}/new-version`,
      formData,
      (percent) => {
        if (onProgress) {
          onProgress({ loaded: percent, total: 100, percent })
        }
      }
    )
    return this.extractData(response)
  }

  async downloadDocument(id: string, filename?: string): Promise<void> {
    await this.download(`/documents/${id}/download`, filename)
  }

  async previewDocument(id: string): Promise<string> {
    const response = await this.get<{ url: string }>(`/documents/${id}/preview`)
    return this.extractData(response).url
  }

  async getDocumentVersions(id: string): Promise<DocumentVersion[]> {
    const response = await this.get<DocumentVersion[]>(`/documents/${id}/versions`)
    return this.extractData(response)
  }

  async restoreVersion(id: string, versionNumber: number): Promise<Document> {
    const response = await this.post<Document>(`/documents/${id}/restore-version`, {
      version_number: versionNumber,
    })
    return this.extractData(response)
  }

  async approveDocument(id: string, request?: ApproveDocumentRequest): Promise<Document> {
    const response = await this.post<Document>(`/documents/${id}/approve`, request || {})
    return this.extractData(response)
  }

  async rejectDocument(id: string, request: RejectDocumentRequest): Promise<Document> {
    const response = await this.post<Document>(`/documents/${id}/reject`, request)
    return this.extractData(response)
  }

  async archiveDocument(id: string): Promise<Document> {
    const response = await this.post<Document>(`/documents/${id}/archive`)
    return this.extractData(response)
  }

  async publishDocument(id: string): Promise<Document> {
    const response = await this.post<Document>(`/documents/${id}/publish`)
    return this.extractData(response)
  }

  async verifyDocument(id: string): Promise<DocumentVerificationResult> {
    const response = await this.get<DocumentVerificationResult>(`/documents/${id}/verify`)
    return this.extractData(response)
  }

  async getDocumentsByOrganisation(
    organisationId: string,
    params?: DocumentQueryParams
  ): Promise<PaginatedResponse<Document>> {
    return this.getDocuments({ ...params, organisation_id: organisationId })
  }

  async getDocumentsByType(
    documentType: DocumentType,
    organisationId?: string
  ): Promise<PaginatedResponse<Document>> {
    const params: DocumentQueryParams = { document_type: documentType }
    if (organisationId) params.organisation_id = organisationId
    return this.getDocuments(params)
  }

  async getDocumentsByStatus(
    status: DocumentStatus,
    organisationId?: string
  ): Promise<PaginatedResponse<Document>> {
    const params: DocumentQueryParams = { status }
    if (organisationId) params.organisation_id = organisationId
    return this.getDocuments(params)
  }

  async searchDocuments(
    query: string,
    organisationId?: string
  ): Promise<PaginatedResponse<Document>> {
    const params: DocumentSearchParams = { query }
    if (organisationId) {
      params.organisation_id = organisationId
    }
    return this.getPaginated<Document>('/documents/search', params as Record<string, any>)
  }

  async searchByTags(
    tags: string[],
    organisationId?: string
  ): Promise<PaginatedResponse<Document>> {
    const params: DocumentQueryParams = { tags: tags!?.join(',') }
    if (organisationId) {
      params.organisation_id = organisationId
    }
    return this.getDocuments(params)
  }

  async getDocumentStats(organisationId: string): Promise<DocumentStats> {
    const response = await this.get<DocumentStats>(`/documents/stats/${organisationId}`)
    return this.extractData(response)
  }

  async bulkDownload(docIds: string[]): Promise<void> {
    await this.download(
      '/documents/bulk-download',
      `documents_bulk_${new Date().toISOString().split('T')[0]}.zip`,
      { params: { ids: docIds.join(',') } }
    )
  }

  async updateDocumentTags(id: string, tags: string[]): Promise<Document> {
    const response = await this.patch<Document>(`/documents/${id}/tags`, { tags })
    return this.extractData(response)
  }

  async bulkOperation(request: DocumentBulkOperationRequest): Promise<DocumentBulkOperationResult> {
    const response = await this.post<DocumentBulkOperationResult>(
      '/documents/bulk-operation',
      request
    )
    return this.extractData(response)
  }

  async getDocumentTemplates(documentType?: DocumentType): Promise<DocumentTemplate[]> {
    const params = documentType ? { document_type: documentType } : undefined
    const response = await this.get<DocumentTemplate[]>('/documents/templates', params)
    return this.extractData(response)
  }

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
