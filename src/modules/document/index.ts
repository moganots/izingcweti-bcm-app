// ============================================
// Document Module - Enums
// ============================================

export enum DocumentType {
  BCM_POLICY = 'BCM_POLICY',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  BIA_REPORT = 'BIA_REPORT',
  BCP_DOCUMENT = 'BCP_DOCUMENT',
  RECOVERY_STRATEGY = 'RECOVERY_STRATEGY',
  TEST_RESULTS = 'TEST_RESULTS',
  INCIDENT_REPORT = 'INCIDENT_REPORT',
  COMPLIANCE_EVIDENCE = 'COMPLIANCE_EVIDENCE',
  TRAINING_MATERIAL = 'TRAINING_MATERIAL',
  AUDIT_REPORT = 'AUDIT_REPORT',
  EXERCISE_REPORT = 'EXERCISE_REPORT',
  MEETING_MINUTES = 'MEETING_MINUTES',
  PROCEDURE = 'PROCEDURE',
  WORK_INSTRUCTION = 'WORK_INSTRUCTION',
  CONTACT_LIST = 'CONTACT_LIST',
  VENDOR_CONTRACT = 'VENDOR_CONTRACT',
  SLA_DOCUMENT = 'SLA_DOCUMENT',
  REGULATORY_DOCUMENT = 'REGULATORY_DOCUMENT',
  CERTIFICATE = 'CERTIFICATE',
  GAP_ANALYSIS = 'GAP_ANALYSIS',
  IMPROVEMENT_PLAN = 'IMPROVEMENT_PLAN',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  UNDER_REVISION = 'UNDER_REVISION',
  SUPERSEDED = 'SUPERSEDED',
}

export enum AccessLevel {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED',
  PRIVATE = 'PRIVATE',
}

import { QueryParams } from 'src/shared/types/common.types'
// ============================================
// Document Module - Types
// ============================================

import { BaseEntity } from '../../core/base/base.entity'

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

// Request Types
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

export interface GenerateDocumentFromTemplateRequest {
  template_id: string
  variables: Record<string, any>
  output_format: 'PDF' | 'DOCX' | 'HTML'
  document_title: string
  save_to_library?: boolean
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
  errors: Array<{ document_id: string; error: string }>
}

export interface DocumentQueryParams extends QueryParams {
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
}
