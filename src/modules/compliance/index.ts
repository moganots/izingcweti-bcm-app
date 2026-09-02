// ============================================
// Compliance Module - Enums
// ============================================

export enum ComplianceStandard {
  ISO22301 = 'ISO22301',
  NIST800_34 = 'NIST800-34',
  FFIEC = 'FFIEC',
  COBIT_2019 = 'COBIT2019',
  SOC2 = 'SOC2',
  GDPR = 'GDPR',
}

export enum ComplianceStatus {
  COMPLIANT = 'Compliant',
  PARTIALLY_COMPLIANT = 'PartiallyCompliant',
  NON_COMPLIANT = 'NonCompliant',
  NOT_ASSESSED = 'NotAssessed',
}

// ============================================
// Compliance Module - Types
// ============================================

import type { BaseEntity } from './../../../core/base/base.entity';

export interface ComplianceRecord extends BaseEntity {
  organisation_id: string
  compliance_standard: ComplianceStandard
  compliance_status: ComplianceStatus
  last_audit_date: string
  next_audit_due: string
  evidence_links?: string[]
}

export interface CreateComplianceRecordRequest {
  organisation_id: string
  compliance_standard: ComplianceStandard
  compliance_status: ComplianceStatus
  last_audit_date: string
  next_audit_due: string
  evidence_links?: string[]
}

export interface UpdateComplianceRecordRequest {
  compliance_status?: ComplianceStatus
  last_audit_date?: string
  next_audit_due?: string
  evidence_links?: string[]
}
