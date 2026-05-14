import { Department, Organisation } from './organisation.entity'
import { SyncStatus } from './sync.entity'

/**
 * BCM Enums
 */
export enum IndustryType {
  FINANCE = 'Finance',
  HEALTHCARE = 'Healthcare',
  TECH = 'Tech',
  MANUFACTURING = 'Manufacturing',
  RETAIL = 'Retail',
  ENERGY = 'Energy',
  TELECOMMUNICATIONS = 'Telecommunications',
  GOVERNMENT = 'Government',
  EDUCATION = 'Education',
  TRANSPORTATION = 'Transportation',
}

export enum MaturityScore {
  INITIAL = 1,
  REPEATABLE = 2,
  DEFINED = 3,
  QUANTITATIVELY_MANAGED = 4,
  OPTIMIZING = 5,
}

export enum CriticalityScore {
  CRITICAL = 'Critical',
  URGENT = 'Urgent',
  IMPORTANT = 'Important',
  NORMAL = 'Normal',
  NON_ESSENTIAL = 'Non-Essential',
}

export enum BCMPlanStatus {
  DRAFT = 'Draft',
  APPROVED = 'Approved',
  ACTIVE = 'Active',
  ARCHIVED = 'Archived',
}

export enum RecoveryStrategyType {
  HOT_SITE = 'HotSite',
  COLD_SITE = 'ColdSite',
  CLOUD_FAILOVER = 'CloudFailover',
  MANUAL_WORKAROUND = 'ManualWorkaround',
}

export enum ExerciseTestType {
  TABLETOP = 'Tabletop',
  WALKTHROUGH = 'Walkthrough',
  FULL = 'Full',
}

export enum ReputationalImpact {
  LOW = 'Low',
  MEDIUM = 'Med',
  HIGH = 'High',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SYNC = 'SYNC',
  CONFLICT_RESOLVE = 'CONFLICT_RESOLVE',
}

/**
 * Critical Function Entity
 */
export interface CriticalFunction {
  uuid: string
  name: string
  department_id: string
  max_tolerable_outage: string
  work_recovery_time: string
  dependency_ids?: string[]
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: SyncStatus
  department?: Department
  business_impact_assessment?: BusinessImpactAssessment
  business_continuity_plan?: BusinessContinuityPlan
}

/**
 * Business Impact Assessment Entity
 */
export interface BusinessImpactAssessment {
  uuid: string
  function_id: string
  assessed_date: string
  financial_impact_per_day: number
  operational_impact: string
  regulatory_impact: string
  reputational_impact: ReputationalImpact
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: SyncStatus
  critical_function?: CriticalFunction
}

/**
 * Business Continuity Plan Entity
 */
export interface BusinessContinuityPlan {
  uuid: string
  function_id: string
  version: number
  plan_status: BCMPlanStatus
  approval_date?: string | null
  review_due_date: string
  emergency_contact_list: Record<string, EmergencyContact>
  plan_document_url?: string | null
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  sync_status: SyncStatus
  critical_function?: CriticalFunction
  recovery_strategies?: RecoveryStrategy[]
  exercise_tests?: ExerciseTest[]
}

export interface EmergencyContact {
  name: string
  phone: string
  email?: string
  role?: string
}

/**
 * Recovery Strategy Entity
 */
export interface RecoveryStrategy {
  uuid: string
  business_continuity_plan_id: string
  recovery_strategy_type: RecoveryStrategyType
  resource_requirements: Record<string, any>
  estimated_recovery_cost: number
  test_success_rate: number
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: SyncStatus
  business_continuity_plan?: BusinessContinuityPlan
}

/**
 * Exercise Test Entity
 */
export interface ExerciseTest {
  uuid: string
  business_continuity_plan_id: string
  exercise_test_type: ExerciseTestType
  date: string
  participants: string[]
  passed: boolean
  lessons_learned: string
  corrective_actions: string
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: SyncStatus
  business_continuity_plan?: BusinessContinuityPlan
}

/**
 * Compliance Record Entity
 */
export interface ComplianceRecord {
  uuid: string
  organisation_id: string
  compliance_standard: ComplianceStandard
  compliance_status: ComplianceStatus
  last_audit_date: string
  next_audit_due: string
  evidence_links?: string[]
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: SyncStatus
  organisation?: Organisation
}

export enum ComplianceStandard {
  ISO_22301 = 'ISO22301',
  NIST_800_34 = 'NIST800-34',
  FFIEC = 'FFIEC',
  COBIT_2019 = 'COBIT2019',
}

export enum ComplianceStatus {
  COMPLIANT = 'Compliant',
  PARTIALLY = 'Partially',
  NON_COMPLIANT = 'NonCompliant',
}
