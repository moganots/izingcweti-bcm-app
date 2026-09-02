// ============================================
// BCM Module - Enums
// ============================================

export enum BCMPlanStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

export enum RecoveryStrategyType {
  HOT_SITE = 'HotSite',
  COLD_SITE = 'ColdSite',
  CLOUD_FAILOVER = 'CloudFailover',
  MANUAL_WORKAROUND = 'ManualWorkaround',
  HYBRID = 'Hybrid',
  MUTUAL_AGREEMENT = 'MutualAgreement',
}

export enum ExerciseTestType {
  TABLETOP = 'TABLETOP',
  WALKTHROUGH = 'WALKTHROUGH',
  FULL = 'FULL',
  TECHNICAL = 'TECHNICAL',
  FULL_SCALE = 'FULL_SCALE',
  SIMULATION = 'SIMULATION',
}

export enum ReputationalImpact {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum RecoveryPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum BCMLifecyclePhase {
  INITIATION_GOVERNANCE = 'INITIATION_GOVERNANCE',
  EMBEDDING = 'EMBEDDING',
  RISK_ASSESSMENT = 'RISK_ASSESSMENT',
  BUSINESS_IMPACT_ANALYSIS = 'BUSINESS_IMPACT_ANALYSIS',
  STRATEGY_DESIGN = 'STRATEGY_DESIGN',
  PLAN_GENERATION = 'PLAN_GENERATION',
  APPROVAL_WORKFLOWS = 'APPROVAL_WORKFLOWS',
  TESTING_VALIDATION = 'TESTING_VALIDATION',
  CONTINUOUS_IMPROVEMENT = 'CONTINUOUS_IMPROVEMENT',
}

import { QueryParams } from 'src/shared/types/common.types'
// ============================================
// BCM Module - Types
// ============================================

import type { BaseEntity } from './../../../core/base/base.entity';
import { RecentActivity } from '../dashboard'
import { Department } from '../organisation'

// Core Types
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

export interface BCMLifecycleStatus extends BaseEntity {
  organisation_id: string
  phase: BCMLifecyclePhase
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
  progress_percentage: number
  started_at?: string
  completed_at?: string
  blocked_reason?: string
  assigned_to?: string
  dependencies?: string[]
  tasks: LifecycleTask[]
  documents: string[]
  metadata?: Record<string, any>
}

export interface LifecycleTask {
  id: string
  title: string
  description?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
  due_date?: string
  completed_at?: string
  assigned_to?: string
  depends_on?: string[]
}

// Request Types
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

export interface ValidateBCPRequest {
  plan_id: string
  check_strategies: boolean
  check_tests: boolean
  check_documents: boolean
  check_approvals: boolean
}

export interface BIAAnalysisRequest {
  organisation_id: string
  include_financial: boolean
  include_operational: boolean
  include_dependencies: boolean
}

// Response/Analysis Types
export interface BIASummary {
  totalFunctions: number
  assessedFunctions: number
  unassessedFunctions: number
  criticalImpactCount: number
  highImpactCount: number
  mediumImpactCount: number
  lowImpactCount: number
  totalFinancialImpact: number
  averageFinancialImpact: number
}

export interface BCPProgress {
  bcpId: string
  functionName: string
  status: string
  version: number
  hasStrategies: boolean
  hasTests: boolean
  overallProgress: number
}

export interface TestStatistics {
  totalTests: number
  passedTests: number
  failedTests: number
  passRate: number
  upcomingTests: number
  overdueTests: number
  byType: Record<string, number>
}

export interface StrategyComparison {
  strategyId: string
  type: string
  cost: number
  successRate: number
  resourceRequirements: Record<string, any>
  effectiveness: number
}

export interface ComplianceGap {
  requirement: string
  currentStatus: string
  targetStatus: string
  actionItems: string[]
  priority: 'high' | 'medium' | 'low'
}

export interface MaturityAssessment {
  domain: string
  currentLevel: number
  targetLevel: number
  gap: number
  recommendations: string[]
}

export interface LifecycleProgress {
  phase: string
  completed: boolean
  completionDate?: string
  documents: string[]
  nextActions: string[]
}

export interface BCPValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  missing_strategies: string[]
  missing_tests: string[]
  missing_documents: string[]
  missing_approvals: string[]
}

export interface BIAAnalysisResult {
  total_financial_impact: number
  average_financial_impact: number
  critical_functions: number
  functions_with_dependencies: number
  third_party_risks: ThirdPartyRisk[]
  recovery_priorities: Record<string, number>
}

export interface ThirdPartyRisk {
  provider_name: string
  service: string
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  impact_description: string
  mitigation_strategy?: string
}

export interface BCMMetrics {
  total_critical_functions: number
  assessed_functions: number
  plans_approved: number
  plans_active: number
  tests_passed: number
  tests_failed: number
  average_rto_achievement: number
  average_rpo_achievement: number
  overall_maturity_score: number
}

export interface BCMDashboardData {
  metrics: BCMMetrics
  recent_activities: RecentActivity[]
  upcoming_reviews: UpcomingReview[]
  pending_approvals: number
  expiring_plans: ExpiringPlan[]
  compliance_gaps: ComplianceGap[]
}

export interface UpcomingReview {
  plan_id: string
  plan_name: string
  review_due_date: string
  days_until_due: number
  status: 'UPCOMING' | 'OVERDUE' | 'DUE_SOON'
}

export interface ExpiringPlan {
  plan_id: string
  plan_name: string
  expiry_date: string
  days_until_expiry: number
}

// Query Parameter Types
export interface CriticalFunctionQueryParams extends QueryParams {
  department_id?: string
  name?: string
  max_tolerable_outage?: string
  has_dependencies?: boolean
  bia_completed?: boolean
}

export interface BIAQueryParams extends QueryParams {
  function_id?: string
  impact_level?: 'Low' | 'Med' | 'High'
  department_id?: string
  min_financial_impact?: number
  max_financial_impact?: number
  assessed_after?: string
  assessed_before?: string
  organisation_id?: string
}

export interface BCPQueryParams extends QueryParams {
  plan_status?: string
  function_id?: string
  organisation_id?: string
  review_due_before?: string
  review_due_after?: string
  min_version?: number
  has_strategies?: boolean
  has_tests?: boolean
  has_documents?: boolean
}

export interface RecoveryStrategyQueryParams extends QueryParams {
  bcp_id?: string
  strategy_type?: string
  min_success_rate?: number
  max_success_rate?: number
  min_cost?: number
  max_cost?: number
  organisation_id?: string
}

export interface ExerciseTestQueryParams extends QueryParams {
  test_type?: string
  bcp_id?: string
  passed?: boolean
  date_after?: string
  date_before?: string
  organisation_id?: string
  participant?: string
  upcoming_only?: boolean
  overdue_only?: boolean
}
