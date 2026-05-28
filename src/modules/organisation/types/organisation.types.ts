import { BaseEntity } from '../../../core/base/base.entity'
import { IndustryType, MaturityScore, CriticalityScore } from '../enums/organisation.enum'

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

export interface CreateDepartmentRequest {
  name: string
  business_unit_id: string
  description?: string
  recovery_time_objective_hours?: number
  recovery_point_objective_hours?: number
  parent_department_id?: string
}
