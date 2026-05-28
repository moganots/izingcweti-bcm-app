import { BaseEntity } from '../../../core/base/base.entity'
import { ComplianceStandard, ComplianceStatus } from '../enums/compliance.enum'

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
