import { BaseEntity } from '../../../core/base/base.entity'
import { DocumentType, DocumentStatus, AccessLevel } from '../enums/document.enum'

export interface Document extends BaseEntity {
  title: string
  description?: string
  document_type: DocumentType
  status: DocumentStatus
  access_level: AccessLevel
  file_name: string
  file_type: string
  file_size: number
  file_path: string
  thumbnail_path?: string
  organisation_id: string
  uploaded_by: string
  approved_by?: string
  approved_at?: string
  approval_notes?: string
  version_number: number
  previous_versions?: DocumentVersion[]
  tags?: string[]
  metadata?: Record<string, any>
  checksum?: string
  expires_at?: string
  download_count: number
  published_by?: string
  published_at?: string
  rejected_by?: string
  rejected_at?: string
  rejection_reason?: string
}

export interface DocumentVersion {
  version_number: number
  file_path: string
  file_size: number
  uploaded_by: string
  uploaded_at: string
  checksum: string
  change_notes?: string
}

export interface UploadDocumentRequest {
  title: string
  description?: string
  document_type: DocumentType
  access_level?: AccessLevel
  organisation_id: string
  tags?: string[]
  metadata?: Record<string, any>
  expires_at?: string
}

export interface UpdateDocumentRequest {
  title?: string
  description?: string
  document_type?: DocumentType
  access_level?: AccessLevel
  tags?: string[]
  metadata?: Record<string, any>
  expires_at?: string
}

export interface ApproveDocumentRequest {
  comments?: string
}

export interface RejectDocumentRequest {
  rejection_reason: string
  comments?: string
}

export interface DocumentVersion extends BaseEntity {
  document_id: string
  version_number: number
  file_name: string
  file_path: string
  file_size: number
  uploaded_by: string
  uploaded_at: string
  checksum: string
  change_notes?: string
  is_current: boolean
}

export interface DocumentApprovalHistory {
  document_id: string
  approval_id: string
  approver_id: string
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REVOKED'
  comments?: string
  timestamp: string
}

export interface DocumentSearchParams {
  query?: string
  document_type?: string[]
  status?: string[]
  tags?: string[]
  uploaded_by?: string[]
  date_from?: string
  date_to?: string
  organisation_id?: string
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'ASC' | 'DESC'
}

export interface DocumentBulkOperationRequest {
  document_ids: string[]
  operation: 'DELETE' | 'ARCHIVE' | 'PUBLISH' | 'TAG'
  parameters?: Record<string, any>
}

export interface DocumentBulkOperationResult {
  total: number
  successful: number
  failed: number
  errors: Array<{
    document_id: string
    error: string
  }>
}

export interface DocumentTemplate extends BaseEntity {
  name: string
  description?: string
  document_type: string
  template_content: string
  variables: string[]
  category: string
  version: number
  is_active: boolean
  organisation_id?: string
  created_by: string
}

export interface GenerateDocumentFromTemplateRequest {
  template_id: string
  variables: Record<string, any>
  output_format: 'PDF' | 'DOCX' | 'HTML'
  document_title: string
  save_to_library?: boolean
}

export interface DocumentQueryParams {
  document_type?: string
  status?: string
  organisation_id?: string
  uploaded_by?: string
  tags?: string | string[]
  access_level?: string
  file_type?: string
  uploaded_after?: string
  uploaded_before?: string
  min_size?: number
  max_size?: number
  pending_approval?: boolean
  expired?: boolean
  has_versions?: boolean
  page?: number
  limit?: number
}

export interface DocumentStats {
  total: number
  by_type: Record<string, number>
  by_status: Record<string, number>
  total_size_bytes: number
  average_size_bytes: number
  versions_count: number
  expired_count: number
  pending_approval_count: number
}
