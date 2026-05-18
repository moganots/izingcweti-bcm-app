import { BaseService } from '../BaseService'
import { API_ENDPOINTS } from './../../../utils/constants'
import type { Document, DocumentVersion } from './../../../models/entities'
import type {
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentQueryParams,
  PaginatedResponse,
} from './../../../types'

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

/**
 * Document API Service
 */
export class DocumentService extends BaseService {
  // ============================================
  // Document CRUD
  // ============================================

  async getDocuments(params?: DocumentQueryParams): Promise<PaginatedResponse<Document>> {
    return this.getPaginated<Document>(API_ENDPOINTS.DOCUMENTS.BASE, params as Record<string, any>)
  }

  async getDocument(id: string): Promise<Document> {
    const response = await this.get<Document>(API_ENDPOINTS.DOCUMENTS.BY_ID(id))
    return this.extractData(response)
  }

  async createDocument(data: CreateDocumentRequest): Promise<Document> {
    const formData = new FormData()
    formData.append('title', data.title)
    if (data.description) formData.append('description', data.description)
    formData.append('document_type', data.document_type)
    formData.append('access_level', data.access_level)
    formData.append('file', data.file)
    if (data.tags) formData.append('tags', JSON.stringify(data.tags))
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata))
    if (data.expires_at) formData.append('expires_at', data.expires_at)

    const response = await this.upload<Document>(API_ENDPOINTS.DOCUMENTS.BASE, formData)
    return this.extractData(response)
  }

  async updateDocument(id: string, data: UpdateDocumentRequest): Promise<Document> {
    const response = await this.put<Document>(API_ENDPOINTS.DOCUMENTS.BY_ID(id), data)
    return this.extractData(response)
  }

  async deleteDocument(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.DOCUMENTS.BY_ID(id))
  }

  // ============================================
  // Document Operations
  // ============================================

  async uploadNewVersion(
    id: string,
    file: File,
    onProgress?: (progress: DocumentUploadProgress) => void
  ): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.upload<Document>(
      API_ENDPOINTS.DOCUMENTS.UPLOAD_VERSION(id),
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
    await this.download(API_ENDPOINTS.DOCUMENTS.DOWNLOAD(id), filename)
  }

  async previewDocument(id: string): Promise<string> {
    const response = await this.get<{ url: string }>(API_ENDPOINTS.DOCUMENTS.PREVIEW(id))
    return this.extractData(response).url
  }

  async getDocumentVersions(id: string): Promise<DocumentVersion[]> {
    const response = await this.get<DocumentVersion[]>(API_ENDPOINTS.DOCUMENTS.VERSIONS(id))
    return this.extractData(response)
  }

  async restoreVersion(id: string, versionNumber: number): Promise<Document> {
    const response = await this.post<Document>(API_ENDPOINTS.DOCUMENTS.RESTORE_VERSION(id), {
      version_number: versionNumber,
    })
    return this.extractData(response)
  }

  async approveDocument(id: string, comments?: string): Promise<Document> {
    const response = await this.post<Document>(API_ENDPOINTS.DOCUMENTS.APPROVE(id), { comments })
    return this.extractData(response)
  }

  async rejectDocument(id: string, reason: string): Promise<Document> {
    const response = await this.post<Document>(API_ENDPOINTS.DOCUMENTS.REJECT(id), { reason })
    return this.extractData(response)
  }

  async archiveDocument(id: string): Promise<Document> {
    const response = await this.post<Document>(API_ENDPOINTS.DOCUMENTS.ARCHIVE(id))
    return this.extractData(response)
  }

  async publishDocument(id: string): Promise<Document> {
    const response = await this.post<Document>(API_ENDPOINTS.DOCUMENTS.PUBLISH(id))
    return this.extractData(response)
  }

  async verifyDocument(id: string): Promise<DocumentVerificationResult> {
    const response = await this.get<DocumentVerificationResult>(API_ENDPOINTS.DOCUMENTS.VERIFY(id))
    return this.extractData(response)
  }

  async getDocumentsByOrganisation(
    organisationId: string,
    params?: DocumentQueryParams
  ): Promise<PaginatedResponse<Document>> {
    return this.getPaginated<Document>(API_ENDPOINTS.DOCUMENTS.BASE, {
      ...params,
      organisation_id: organisationId,
    } as Record<string, any>)
  }

  async getDocumentsByType(
    documentType: string,
    organisationId?: string
  ): Promise<PaginatedResponse<Document>> {
    const params: Record<string, any> = { document_type: documentType }
    if (organisationId) params.organisation_id = organisationId

    return this.getPaginated<Document>(API_ENDPOINTS.DOCUMENTS.BASE, params)
  }

  async getDocumentsByStatus(
    status: string,
    organisationId?: string
  ): Promise<PaginatedResponse<Document>> {
    const params: Record<string, any> = { status }
    if (organisationId) params.organisation_id = organisationId

    return this.getPaginated<Document>(API_ENDPOINTS.DOCUMENTS.BASE, params)
  }

  async searchDocuments(
    query: string,
    organisationId?: string
  ): Promise<PaginatedResponse<Document>> {
    const params: Record<string, any> = { search: query }
    if (organisationId) params.organisation_id = organisationId

    return this.getPaginated<Document>(API_ENDPOINTS.DOCUMENTS.SEARCH, params)
  }

  async searchByTags(
    tags: string[],
    organisationId?: string
  ): Promise<PaginatedResponse<Document>> {
    const params: Record<string, any> = { tags: tags.join(',') }
    if (organisationId) params.organisation_id = organisationId

    return this.getPaginated<Document>(API_ENDPOINTS.DOCUMENTS.BASE, params)
  }

  async getDocumentStats(organisationId: string): Promise<{
    total: number
    by_type: Record<string, number>
    by_status: Record<string, number>
    total_size: number
    recent_uploads: Document[]
  }> {
    const response = await this.get<{
      total: number
      by_type: Record<string, number>
      by_status: Record<string, number>
      total_size: number
      recent_uploads: Document[]
    }>(API_ENDPOINTS.DOCUMENTS.STATS(organisationId))
    return this.extractData(response)
  }

  async bulkDownload(docIds: string[]): Promise<void> {
    await this.download(
      API_ENDPOINTS.DOCUMENTS.BULK_DOWNLOAD,
      `documents_bulk_${new Date().toISOString().split('T')[0]}.zip`,
      { params: { ids: docIds.join(',') } }
    )
  }

  async updateDocumentTags(id: string, tags: string[]): Promise<Document> {
    const response = await this.patch<Document>(API_ENDPOINTS.DOCUMENTS.TAGS(id), { tags })
    return this.extractData(response)
  }
}

export const documentService = new DocumentService()
