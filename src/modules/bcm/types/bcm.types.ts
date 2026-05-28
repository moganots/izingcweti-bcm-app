import { BaseEntity } from '../../../core/base/base.entity'
import {
  BCMPlanStatus,
  RecoveryStrategyType,
  ExerciseTestType,
  ReputationalImpact,
  RecoveryPriority,
} from '../enums/bcm.enum'
import { Department } from '../../organisation/types/organisation.types'

export interface CriticalFunction extends BaseEntity {
  department_id: string
  name: string
  description?: string
  recovery_priority: RecoveryPriority
  recovery_time_objective?: number
  recovery_point_objective?: number
  maximum_tolerable_downtime?: number
  work_recovery_time?: number
  requires_bcp: boolean
  dependencies?: CriticalFunctionDependency[]
  resource_requirements?: ResourceRequirement[]
  department?: Department
}

export interface CriticalFunctionDependency {
  function_id: string
  function_name: string
  dependency_type: string
}

export interface ResourceRequirement {
  resource_type: string
  quantity: number
  unit: string
  critical: boolean
}

export interface BusinessImpactAssessment extends BaseEntity {
  function_id: string
  assessed_date: string
  financial_impact_per_day: number
  operational_impact: string
  regulatory_impact?: string
  reputational_impact?: ReputationalImpact
  maximum_acceptable_outage?: number
  seasonal_variations?: SeasonalVariation[]
  third_party_dependencies?: ThirdPartyDependency[]
}

export interface SeasonalVariation {
  season: string
  financial_impact_multiplier: number
  operational_impact: string
}

export interface ThirdPartyDependency {
  provider_name: string
  service: string
  criticality: string
  sla_in_hours: number
}

export interface BusinessContinuityPlan extends BaseEntity {
  function_id: string
  plan_name: string
  version: number
  plan_status: BCMPlanStatus
  approved_by?: string
  approval_date?: string
  review_due_date: string
  recovery_time_objective?: number
  recovery_point_objective?: number
  emergency_contact_list?: EmergencyContact[]
  plan_document_url?: string
  plan_objectives?: string
  scope?: string
  assumptions?: string
  key_personnel?: KeyPersonnel[]
}

export interface EmergencyContact {
  name: string
  role?: string
  phone: string
  email?: string
  isPrimary?: boolean
}

export interface KeyPersonnel {
  name: string
  role: string
  contact: string
  backup_person?: string
}

export interface RecoveryStrategy extends BaseEntity {
  business_continuity_plan_id: string
  recovery_strategy_type: RecoveryStrategyType
  strategy_name?: string
  description?: string
  resource_requirements?: Record<string, any>
  estimated_recovery_cost: number
  test_success_rate: number
  estimated_recovery_time?: number
  dependencies?: StrategyDependency[]
  validation_evidence?: ValidationEvidence[]
}

export interface StrategyDependency {
  strategy_id: string
  strategy_name: string
  dependency_type: string
}

export interface ValidationEvidence {
  test_id: string
  test_date: string
  success: boolean
  notes: string
}

export interface ExerciseTest extends BaseEntity {
  business_continuity_plan_id: string
  exercise_test_type: ExerciseTestType
  scheduled_date: string
  executed_date?: string
  participants: string[]
  passed: boolean
  lessons_learned?: string
  corrective_actions?: string
}

export interface CreateBCPRequest {
  function_id: string
  plan_name: string
  review_due_date: string
  emergency_contact_list: EmergencyContact[]
  plan_document_url?: string
  plan_objectives?: string
  scope?: string
  assumptions?: string
  key_personnel?: KeyPersonnel[]
}

export interface CreateBIARequest {
  function_id: string
  financial_impact_per_day: number
  operational_impact: string
  regulatory_impact?: string
  reputational_impact?: ReputationalImpact
  maximum_acceptable_outage?: number
  seasonal_variations?: SeasonalVariation[]
  third_party_dependencies?: ThirdPartyDependency[]
}

export interface CreateRecoveryStrategyRequest {
  business_continuity_plan_id: string
  recovery_strategy_type: RecoveryStrategyType
  strategy_name?: string
  description?: string
  resource_requirements?: Record<string, any>
  estimated_recovery_cost: number
  estimated_recovery_time?: number
}

export interface RecordTestResultRequest {
  passed: boolean
  lessons_learned?: string
  corrective_actions?: string
  executed_date: string
}
