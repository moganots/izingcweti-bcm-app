

import { BaseService } from './BaseService';
import { API_ENDPOINTS } from '../../utils/constants';
import type { PaginatedResponse } from '../../types/common.types';
import type { Document } from '../../models/entities/organisation.entity';
import { GetDocumentsParams, ApproveDocumentRequest, RejectDocumentRequest } from 'src/types';

/**
 * Document API Service
 */
export class DocumentService extends BaseService {
  /**
   * Get all documents with pagination and filters
   */
  async getDocuments(
    params?: GetDocumentsParams,
  ): Promise<PaginatedResponse<Document>> {
    return this.getPaginated<Document>(API_ENDPOINTS.DOCUMENTS.BASE, params as Record<string, any>);
  }

  /**
   * Get document by ID
   */
  async getDocument(id: string): Promise<Document> {
    const response = await this.get<Document>(API_ENDPOINTS.DOCUMENTS.BY_ID(id));
    return this.extractData(response);
  }

  /**
   * Upload a document with progress tracking
   */
  async uploadDocument(
    formData: FormData,
    onProgress?: (progress: number) => void,
  ): Promise<Document> {
    const response = await this.upload<Document>(
      API_ENDPOINTS.DOCUMENTS.UPLOAD,
      formData,
      onProgress,
    );
    return this.extractData(response);
  }

  /**
   * Download a document
   */
  async downloadDocument(id: string, filename?: string): Promise<void> {
    await this.download(API_ENDPOINTS.DOCUMENTS.DOWNLOAD(id), filename);
  }

  /**
   * Update document metadata
   */
  async updateDocument(id: string, data: Partial<Document>): Promise<Document> {
    const response = await this.put<Document>(
      API_ENDPOINTS.DOCUMENTS.BY_ID(id),
      data,
    );
    return this.extractData(response);
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.DOCUMENTS.BY_ID(id));
  }

  /**
   * Approve a document with optional comments
   */
  async approveDocument(id: string, data?: ApproveDocumentRequest): Promise<Document> {
    const response = await this.patch<Document>(
      API_ENDPOINTS.DOCUMENTS.APPROVE(id),
      data || {},
    );
    return this.extractData(response);
  }

  /**
   * Reject a document with reason
   */
  async rejectDocument(id: string, data: RejectDocumentRequest): Promise<Document> {
    const response = await this.patch<Document>(
      API_ENDPOINTS.DOCUMENTS.REJECT(id),
      data,
    );
    return this.extractData(response);
  }

  /**
   * Submit document for review
   */
  async submitForReview(id: string): Promise<Document> {
    const response = await this.patch<Document>(
      `/documents/${id}/submit-review`,
    );
    return this.extractData(response);
  }

  /**
   * Publish document
   */
  async publishDocument(id: string): Promise<Document> {
    const response = await this.patch<Document>(
      `/documents/${id}/publish`,
    );
    return this.extractData(response);
  }

  /**
   * Archive document
   */
  async archiveDocument(id: string): Promise<Document> {
    const response = await this.patch<Document>(
      `/documents/${id}/archive`,
    );
    return this.extractData(response);
  }

  /**
   * Search documents by query
   */
  async searchDocuments(
    query: string,
    params?: GetDocumentsParams,
  ): Promise<PaginatedResponse<Document>> {
    const searchParams: Record<string, any> = {
      q: query,
      ...params,
    };
    return this.getPaginated<Document>(
      API_ENDPOINTS.DOCUMENTS.SEARCH,
      searchParams,
    );
  }

  /**
   * Get documents by type
   */
  async getDocumentsByType(
    documentType: string,
    params?: GetDocumentsParams,
  ): Promise<PaginatedResponse<Document>> {
    return this.getDocuments({ ...params, document_type: documentType });
  }

  /**
   * Get documents by status
   */
  async getDocumentsByStatus(
    status: string,
    params?: GetDocumentsParams,
  ): Promise<PaginatedResponse<Document>> {
    return this.getDocuments({ ...params, status });
  }

  /**
   * Get documents pending approval
   */
  async getPendingApprovalDocuments(
    params?: GetDocumentsParams,
  ): Promise<PaginatedResponse<Document>> {
    return this.getDocuments({ ...params, pending_approval: true });
  }

  /**
   * Get document statistics
   */
  async getDocumentStats(organisationId?: string): Promise<any> {
    const params: Record<string, any> = {};
    if (organisationId) params.organisation_id = organisationId;
    const response = await this.get('/documents/stats', params);
    return this.extractData(response);
  }

  /**
   * Get document versions
   */
  async getDocumentVersions(id: string): Promise<any> {
    const response = await this.get(`/documents/${id}/versions`);
    return this.extractData(response);
  }

  /**
   * Restore a previous version
   */
  async restoreDocumentVersion(
    documentId: string,
    versionNumber: number,
  ): Promise<Document> {
    const response = await this.post(`/documents/${documentId}/restore`, {
      version_number: versionNumber,
    });
    return this.extractData(response);
  }

  /**
   * Get document download URL
   */
  async getDownloadUrl(id: string): Promise<string> {
    const response = await this.get<{ url: string }>(`/documents/${id}/download-url`);
    return this.extractData(response).url;
  }
}

// Export singleton
export const documentService = new DocumentService();