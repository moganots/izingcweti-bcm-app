/**
 * Document Entity
 */
export interface Document {
  uuid: string
  title: string
  description?: string | null
  document_type: string
  status: string
  access_level: string
  file_name: string
  file_type: string
  file_size: number
  file_path: string
  thumbnail_path?: string | null
  organisation_id: string
  uploaded_by: string
  approved_by?: string | null
  approved_at?: string | null
  version_number: number
  previous_versions?: any[] | null
  tags?: string[] | null
  metadata?: Record<string, unknown> | null
  checksum?: string | null
  expires_at?: string | null
  download_count: number
  rejection_reason?: string | null
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: string
  deleted_by?: string | null
  deleted_at?: string | null
}

/**
 * Organisation Entity
 */
export interface Organisation {
  uuid: string
  name: string
  industry_type: string
  bcm_policy_version?: string | null
  maturity_score?: number | null
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: string
  deleted_by?: string | null
  deleted_at?: string | null
}

/**
 * Business Unit Entity
 */
export interface BusinessUnit {
  uuid: string
  name: string
  criticality_score: string
  organisation_id: string
  head_user_id?: string | null
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: string
  deleted_by?: string | null
  deleted_at?: string | null
}

/**
 * Department Entity
 */
export interface Department {
  uuid: string
  name: string
  business_id: string
  recovery_time_objective?: string | null
  recovery_point_objective?: string | null
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: string
  deleted_by?: string | null
  deleted_at?: string | null
}

// Enums for document types
export const DocumentType = {
  BCM_POLICY: 'BCM_POLICY',
  RISK_ASSESSMENT: 'RISK_ASSESSMENT',
  BIA_REPORT: 'BIA_REPORT',
  BCP_DOCUMENT: 'BCP_DOCUMENT',
  RECOVERY_STRATEGY: 'RECOVERY_STRATEGY',
  TEST_RESULTS: 'TEST_RESULTS',
  INCIDENT_REPORT: 'INCIDENT_REPORT',
  COMPLIANCE_EVIDENCE: 'COMPLIANCE_EVIDENCE',
  TRAINING_MATERIAL: 'TRAINING_MATERIAL',
  AUDIT_REPORT: 'AUDIT_REPORT',
  EXERCISE_REPORT: 'EXERCISE_REPORT',
  MEETING_MINUTES: 'MEETING_MINUTES',
  OTHER: 'OTHER',
} as const

export const DocumentStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const

export const AccessLevel = {
  PUBLIC: 'PUBLIC',
  INTERNAL: 'INTERNAL',
  CONFIDENTIAL: 'CONFIDENTIAL',
  RESTRICTED: 'RESTRICTED',
} as const
