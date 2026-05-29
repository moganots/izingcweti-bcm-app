// ============================================
// Organisation Module - Enums
// ============================================

export enum IndustryType {
  FINANCE = 'Finance',
  HEALTHCARE = 'Healthcare',
  TECH = 'Tech',
  MANUFACTURING = 'Manufacturing',
  RETAIL = 'Retail',
  GOVERNMENT = 'Government',
  EDUCATION = 'Education',
  OTHER = 'Other',
}

export enum MaturityScore {
  INITIAL = 'INITIAL',
  REPEATABLE = 'REPEATABLE',
  DEFINED = 'DEFINED',
  QUANTITATIVELY_MANAGED = 'QUANTITATIVELY_MANAGED',
  OPTIMIZING = 'OPTIMIZING',
}

export enum CriticalityScore {
  CRITICAL = 'CRITICAL',
  URGENT = 'URGENT',
  IMPORTANT = 'IMPORTANT',
  NORMAL = 'NORMAL',
  NON_ESSENTIAL = 'NON_ESSENTIAL',
}

// ============================================
// Organisation Module - Types
// ============================================

import { BaseEntity } from '../../core/base/base.entity'

export interface Organisation extends BaseEntity {
  name: string
  tenant_id: string
  industry_type: IndustryType
  bcm_policy_version?: string
  maturity_score?: MaturityScore
}

export interface BusinessUnit extends BaseEntity {
  name: string
  organisation_id: string
  criticality_score: CriticalityScore
  head_user_id?: string
}

export interface Department extends BaseEntity {
  name: string
  business_unit_id: string
  description?: string
  recovery_time_objective_hours?: number
  recovery_point_objective_hours?: number
  order: number
  parent_department_id?: string
}

// Request Types
export interface CreateOrganisationRequest {
  name: string
  industry_type: IndustryType
  bcm_policy_version?: string
  maturity_score?: MaturityScore
}

export interface UpdateOrganisationRequest {
  name?: string
  industry_type?: IndustryType
  bcm_policy_version?: string
  maturity_score?: MaturityScore
}

export interface CreateBusinessUnitRequest {
  name: string
  organisation_id: string
  criticality_score: CriticalityScore
  head_user_id?: string
}

export interface UpdateBusinessUnitRequest {
  name?: string
  organisation_id?: string
  criticality_score?: CriticalityScore
  head_user_id?: string
}

export interface CreateDepartmentRequest {
  name: string
  business_unit_id: string
  description?: string
  recovery_time_objective_hours?: number
  recovery_point_objective_hours?: number
  parent_department_id?: string
}

export interface UpdateDepartmentRequest {
  name?: string
  business_unit_id?: string
  description?: string
  recovery_time_objective_hours?: number
  recovery_point_objective_hours?: number
  parent_department_id?: string
}
