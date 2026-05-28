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
