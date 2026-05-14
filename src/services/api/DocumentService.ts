import { BaseService } from './BaseService'
import { API_ENDPOINTS } from '../../utils/constants'
import type { PaginatedResponse } from '../../types/common.types'
import type { Document } from '../../models/entities/organisation.entity'
import type { DocumentAPI } from '../../types/api.types'

/**
 * Document API Service
 */
export class DocumentService extends BaseService {
  /**
   * Get all documents
   */
  async getDocuments(
    params?: DocumentAPI.GetDocumentsParams
  ): Promise<PaginatedResponse<Document>> {
    return this.getPaginated<Document>(API_ENDPOINTS.DOCUMENTS.BASE, params)
  }

  /**
   * Get document by ID
   */
  async getDocument(id: string): Promise<any> {
    return this.get<Document>(API_ENDPOINTS.DOCUMENTS.BY_ID(id))
  }

  /**
   * Upload a document
   */
  async uploadDocument(formData: FormData, onProgress?: (progress: number) => void): Promise<any> {
    return this.upload<Document>(API_ENDPOINTS.DOCUMENTS.UPLOAD, formData, onProgress)
  }

  /**
   * Download a document
   */
  async downloadDocument(id: string, filename?: string): Promise<void> {
    await this.download(API_ENDPOINTS.DOCUMENTS.DOWNLOAD(id), filename)
  }

  /**
   * Update document metadata
   */
  async updateDocument(id: string, data: Partial<Document>): Promise<any> {
    return this.put<Document>(API_ENDPOINTS.DOCUMENTS.BY_ID(id), data)
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<any> {
    return this.delete(API_ENDPOINTS.DOCUMENTS.BY_ID(id))
  }

  /**
   * Approve a document
   */
  async approveDocument(id: string, data?: DocumentAPI.ApproveDocumentRequest): Promise<any> {
    return this.patch<Document>(API_ENDPOINTS.DOCUMENTS.APPROVE(id), data || {})
  }

  /**
   * Reject a document
   */
  async rejectDocument(id: string, data: DocumentAPI.RejectDocumentRequest): Promise<any> {
    return this.patch<Document>(API_ENDPOINTS.DOCUMENTS.REJECT(id), data)
  }

  /**
   * Search documents
   */
  async searchDocuments(
    query: string,
    params?: DocumentAPI.GetDocumentsParams
  ): Promise<PaginatedResponse<Document>> {
    return this.getPaginated<Document>(API_ENDPOINTS.DOCUMENTS.SEARCH, {
      ...params,
      query: query,
    })
  }
}

// Export singleton
export const documentService = new DocumentService()
