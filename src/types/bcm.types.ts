/**
 * BCM Type Definitions
 */

import {
  CriticalFunction,
  BusinessImpactAssessment,
  BusinessContinuityPlan,
  RecoveryStrategy,
  ExerciseTest,
  ComplianceRecord,
} from 'src/models/entities'
import { QueryParams } from './common.types'

// ============================================
// BCM Module Types
// ============================================

/**
 * BCM state
 */
export interface BCMState {
  criticalFunctions: CriticalFunction[]
  bias: BusinessImpactAssessment[]
  bcps: BusinessContinuityPlan[]
  recoveryStrategies: RecoveryStrategy[]
  exerciseTests: ExerciseTest[]
  complianceRecords: ComplianceRecord[]
  selectedFunction: CriticalFunction | null
  selectedBIA: BusinessImpactAssessment | null
  selectedBCP: BusinessContinuityPlan | null
  isLoading: boolean
  error: string | null
}

// ============================================
// BIA Types
// ============================================

/**
 * BIA filters
 */
export interface BIAFilters {
  search?: string
  impactLevel?: string
  functionId?: string
  departmentId?: string
  assessedAfter?: string
  assessedBefore?: string
}

/**
 * BIA summary
 */
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

// ============================================
// BCP Types
// ============================================

/**
 * BCP filters
 */
export interface BCPFilters {
  search?: string
  planStatus?: string
  functionId?: string
  organisationId?: string
  reviewDueBefore?: string
  reviewDueAfter?: string
}

/**
 * BCP progress
 */
export interface BCPProgress {
  bcpId: string
  functionName: string
  status: string
  version: number
  hasStrategies: boolean
  hasTests: boolean
  overallProgress: number // 0-100
}

/**
 * Emergency contact
 */
export interface EmergencyContact {
  name: string
  role?: string
  phone: string
  email?: string
  isPrimary?: boolean
}

// ============================================
// Exercise Test Types
// ============================================

/**
 * Test filters
 */
export interface TestFilters {
  search?: string
  testType?: string
  bcpId?: string
  passed?: boolean
  dateAfter?: string
  dateBefore?: string
}

/**
 * Test statistics
 */
export interface TestStatistics {
  totalTests: number
  passedTests: number
  failedTests: number
  passRate: number
  upcomingTests: number
  overdueTests: number
  byType: Record<string, number>
}

/**
 * Test result
 */
export interface TestResult {
  testId: string
  passed: boolean
  lessonsLearned: string
  correctiveActions: string
  recordedBy: string
  recordedAt: string
}

// ============================================
// Recovery Strategy Types
// ============================================

/**
 * Strategy filters
 */
export interface StrategyFilters {
  bcpId?: string
  strategyType?: string
  minSuccessRate?: number
  maxCost?: number
}

/**
 * Strategy comparison
 */
export interface StrategyComparison {
  strategyId: string
  type: string
  cost: number
  successRate: number
  resourceRequirements: Record<string, any>
  effectiveness: number
}

// ============================================
// Compliance Types
// ============================================

/**
 * Compliance filters
 */
export interface ComplianceFilters {
  organisationId?: string
  standard?: string
  status?: string
  auditDueBefore?: string
  auditDueAfter?: string
}

/**
 * Compliance gap
 */
export interface ComplianceGap {
  requirement: string
  currentStatus: string
  targetStatus: string
  actionItems: string[]
  priority: 'high' | 'medium' | 'low'
}

/**
 * Maturity assessment
 */
export interface MaturityAssessment {
  domain: string
  currentLevel: number
  targetLevel: number
  gap: number
  recommendations: string[]
}

// ============================================
// BCM Lifecycle Types
// ============================================

/**
 * BCM lifecycle phase
 */
export enum BCMLifecyclePhase {
  INITIATION = 'Initiation',
  RISK_ASSESSMENT = 'Risk Assessment',
  BUSINESS_IMPACT_ANALYSIS = 'Business Impact Analysis',
  STRATEGY_DESIGN = 'Strategy Design',
  PLAN_DEVELOPMENT = 'Plan Development',
  TESTING_VALIDATION = 'Testing & Validation',
  CONTINUOUS_IMPROVEMENT = 'Continuous Improvement',
}

/**
 * BCM lifecycle progress
 */
export interface LifecycleProgress {
  phase: BCMLifecyclePhase
  completed: boolean
  completionDate?: string
  documents: string[]
  nextActions: string[]
}

// ============================================
// Critical Functions Query Parameters
// ============================================

export interface CriticalFunctionQueryParams extends QueryParams {
  /** Filter by department ID */
  department_id?: string
  /** Filter by name (partial match) */
  name?: string
  /** Filter by max tolerable outage */
  max_tolerable_outage?: string
  /** Filter by functions with dependencies */
  has_dependencies?: boolean
  /** Filter by functions with BIA completed */
  bia_completed?: boolean
}

// ============================================
// BIA Query Parameters
// ============================================

export interface BIAQueryParams extends QueryParams {
  /** Filter by function ID */
  function_id?: string
  /** Filter by impact level */
  impact_level?: 'Low' | 'Med' | 'High'
  /** Filter by department ID */
  department_id?: string
  /** Filter by minimum financial impact per day */
  min_financial_impact?: number
  /** Filter by maximum financial impact per day */
  max_financial_impact?: number
  /** Filter assessments after date */
  assessed_after?: string
  /** Filter assessments before date */
  assessed_before?: string
  /** Filter by organisation ID */
  organisation_id?: string
}

// ============================================
// BCP Query Parameters
// ============================================

export interface BCPQueryParams extends QueryParams {
  /** Filter by plan status */
  plan_status?: 'Draft' | 'Approved' | 'Active' | 'Archived'
  /** Filter by function ID */
  function_id?: string
  /** Filter by organisation ID */
  organisation_id?: string
  /** Filter BCPs due for review before this date */
  review_due_before?: string
  /** Filter BCPs due for review after this date */
  review_due_after?: string
  /** Filter by minimum version number */
  min_version?: number
  /** Filter BCPs with recovery strategies */
  has_strategies?: boolean
  /** Filter BCPs with exercise tests */
  has_tests?: boolean
  /** Filter BCPs with plan documents */
  has_documents?: boolean
}

// ============================================
// Recovery Strategy Query Parameters
// ============================================

export interface RecoveryStrategyQueryParams extends QueryParams {
  /** Filter by BCP ID */
  bcp_id?: string
  /** Filter by strategy type */
  strategy_type?: 'HotSite' | 'ColdSite' | 'CloudFailover' | 'ManualWorkaround'
  /** Filter by minimum test success rate */
  min_success_rate?: number
  /** Filter by maximum test success rate */
  max_success_rate?: number
  /** Filter by minimum estimated cost */
  min_cost?: number
  /** Filter by maximum estimated cost */
  max_cost?: number
  /** Filter by organisation ID (via BCP) */
  organisation_id?: string
}

// ============================================
// Exercise Test Query Parameters
// ============================================

export interface ExerciseTestQueryParams extends QueryParams {
  /** Filter by test type */
  test_type?: 'Tabletop' | 'Walkthrough' | 'Full'
  /** Filter by BCP ID */
  bcp_id?: string
  /** Filter by pass/fail status */
  passed?: boolean
  /** Filter tests after date */
  date_after?: string
  /** Filter tests before date */
  date_before?: string
  /** Filter by organisation ID (via BCP) */
  organisation_id?: string
  /** Filter by participant email */
  participant?: string
  /** Filter upcoming tests only */
  upcoming_only?: boolean
  /** Filter overdue tests only */
  overdue_only?: boolean
}

// ============================================
// Risk Query Parameters
// ============================================

export interface RiskQueryParams extends QueryParams {
  /** Filter by risk category */
  risk_category?:
    | 'Financial'
    | 'Operational'
    | 'Compliance_and_Legal'
    | 'Reputational'
    | 'People_and_Safety'
    | 'Assets_and_IT'
    | 'Cyber'
    | 'Natural'
    | 'Human'
    | 'Supply'
  /** Filter by impact severity */
  impact_severity?: 'Insignificant' | 'Low' | 'Medium' | 'High' | 'Critical'
  /** Filter by organisation ID */
  organisation_id?: string
  /** Filter by minimum inherent risk score */
  min_inherent_score?: number
  /** Filter by maximum inherent risk score */
  max_inherent_score?: number
  /** Filter by minimum residual risk score */
  min_residual_score?: number
  /** Filter by maximum residual risk score */
  max_residual_score?: number
  /** Filter by minimum likelihood */
  min_likelihood?: number
  /** Filter by maximum likelihood */
  max_likelihood?: number
  /** Filter risks with mitigation controls */
  has_controls?: boolean
  /** Filter risks without mitigation controls */
  needs_mitigation?: boolean
  /** Filter high risks only */
  high_only?: boolean
  /** Filter critical risks only */
  critical_only?: boolean
  /** Filter risks by threshold (for high risks) */
  threshold?: number
}

// ============================================
// Compliance Query Parameters
// ============================================

export interface ComplianceQueryParams extends QueryParams {
  /** Filter by compliance standard */
  standard?: 'ISO22301' | 'NIST800-34' | 'FFIEC' | 'COBIT2019'
  /** Filter by compliance status */
  status?: 'Compliant' | 'Partially' | 'NonCompliant'
  /** Filter by organisation ID */
  organisation_id?: string
  /** Filter by days until next audit (for upcoming audits) */
  days?: number
  /** Filter audits due before date */
  audit_due_before?: string
  /** Filter audits due after date */
  audit_due_after?: string
  /** Filter overdue audits only */
  overdue_only?: boolean
}

// ============================================
// Incident Query Parameters
// ============================================

export interface IncidentQueryParams extends QueryParams {
  /** Filter by incident severity */
  incident_severity?: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational'
  /** Filter by organisation ID */
  organisation_id?: string
  /** Filter by BCP activated */
  bcp_id?: string
  /** Filter active incidents only */
  active_only?: boolean
  /** Filter closed incidents only */
  closed_only?: boolean
  /** Filter incidents declared after date */
  declared_after?: string
  /** Filter incidents declared before date */
  declared_before?: string
  /** Filter incidents closed after date */
  closed_after?: string
  /** Filter incidents closed before date */
  closed_before?: string
  /** Search in root cause field */
  root_cause_search?: string
}

// ============================================
// Workflow Query Parameters
// ============================================

export interface WorkflowQueryParams extends QueryParams {
  /** Filter by workflow type */
  workflow_type?:
    | 'PolicyApproval'
    | 'RiskAssessment'
    | 'BIAReview'
    | 'BCPApproval'
    | 'StrategyApproval'
    | 'TestReview'
    | 'IncidentManagement'
    | 'ImprovementTracking'
    | 'TrainingAttestation'
    | 'ComplianceReview'
  /** Filter by workflow state */
  workflow_state?:
    | 'Draft'
    | 'Submitted'
    | 'InReview'
    | 'Approved'
    | 'Rejected'
    | 'Completed'
    | 'Archived'
    | 'Cancelled'
    | 'Expired'
    | 'AwaitingInput'
    | 'ParallelReview'
  /** Filter by priority */
  priority?: number
  /** Filter by assignee user ID */
  assigned_to?: string
  /** Filter by initiator user ID */
  initiated_by?: string
  /** Filter by entity type */
  entity_type?: string
  /** Filter by entity ID */
  entity_id?: string
  /** Filter workflows due before date */
  due_before?: string
  /** Filter workflows due after date */
  due_after?: string
  /** Filter pending approvals for current user */
  my_approvals?: boolean
  /** Filter my workflows only */
  my_workflows?: boolean
  /** Filter overdue workflows only */
  overdue_only?: boolean
  /** Filter escalated workflows only */
  escalated_only?: boolean
  /** Filter by escalation level */
  escalation_level?: number
}

// ============================================
// Document Query Parameters
// ============================================

export interface DocumentQueryParams extends QueryParams {
  /** Filter by document type */
  document_type?:
    | 'BCM_POLICY'
    | 'RISK_ASSESSMENT'
    | 'BIA_REPORT'
    | 'BCP_DOCUMENT'
    | 'RECOVERY_STRATEGY'
    | 'TEST_RESULTS'
    | 'INCIDENT_REPORT'
    | 'COMPLIANCE_EVIDENCE'
    | 'TRAINING_MATERIAL'
    | 'AUDIT_REPORT'
    | 'EXERCISE_REPORT'
    | 'MEETING_MINUTES'
    | 'OTHER'
  /** Filter by document status */
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  /** Filter by organisation ID */
  organisation_id?: string
  /** Filter by uploader user ID */
  uploaded_by?: string
  /** Filter by access level */
  access_level?: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED'
  /** Filter by tags (comma-separated or array) */
  tags?: string | string[]
  /** Filter by file type/MIME type */
  file_type?: string
  /** Filter documents uploaded after date */
  uploaded_after?: string
  /** Filter documents uploaded before date */
  uploaded_before?: string
  /** Filter by minimum file size (bytes) */
  min_size?: number
  /** Filter by maximum file size (bytes) */
  max_size?: number
  /** Filter documents pending approval */
  pending_approval?: boolean
  /** Filter expired documents */
  expired?: boolean
  /** Filter documents with previous versions */
  has_versions?: boolean
}

// ============================================
// Notification Query Parameters
// ============================================

export interface NotificationQueryParams extends QueryParams {
  /** Filter by notification type */
  notification_type?: string
  /** Filter by priority */
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  /** Filter by status */
  status?: 'UNREAD' | 'READ' | 'ARCHIVED' | 'DISMISSED'
  /** Filter unread only */
  unread_only?: boolean
  /** Filter by entity type */
  entity_type?: string
  /** Filter by entity ID */
  entity_id?: string
  /** Filter notifications created after date */
  created_after?: string
  /** Filter notifications created before date */
  created_before?: string
  /** Filter scheduled notifications */
  scheduled_only?: boolean
}

// ============================================
// Audit Query Parameters
// ============================================

export interface AuditQueryParams extends QueryParams {
  /** Filter by user ID */
  user_id?: string
  /** Filter by organisation ID */
  organisation_id?: string
  /** Filter by audit action */
  action?: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'SYNC' | 'CONFLICT_RESOLVE'
  /** Filter by audit category */
  audit_category?:
    | 'USER_ACTIVITY'
    | 'SYSTEM_EVENT'
    | 'SECURITY'
    | 'DATA_CHANGE'
    | 'ACCESS_CONTROL'
    | 'WORKFLOW'
    | 'COMPLIANCE'
    | 'SYNC'
    | 'CONFIGURATION'
    | 'PERFORMANCE'
  /** Filter by severity */
  severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  /** Filter by entity type */
  entity_type?: string
  /** Filter by entity ID */
  entity_id?: string
  /** Filter audit logs after date */
  start_date?: string
  /** Filter audit logs before date */
  end_date?: string
  /** Search in description field */
  search?: string
  /** Filter sensitive logs only */
  sensitive_only?: boolean
}

// ============================================
// User Query Parameters
// ============================================

export interface UserQueryParams extends QueryParams {
  /** Filter by role */
  role?: string
  /** Filter by organisation ID */
  organisation_id?: string
  /** Filter by active status */
  is_active?: boolean
  /** Filter users with completed training */
  training_completed?: boolean
  /** Filter by email (partial match) */
  email?: string
}

// ============================================
// Organisation Query Parameters
// ============================================

export interface OrganisationQueryParams extends QueryParams {
  /** Filter by industry type */
  industry_type?: string
  /** Filter by maturity score */
  maturity_score?: number
  /** Filter by minimum maturity score */
  min_maturity_score?: number
  /** Filter by maximum maturity score */
  max_maturity_score?: number
  /** Filter by BCM policy version */
  bcm_policy_version?: string
}

// ============================================
// Sync Query Parameters
// ============================================

export interface SyncQueryParams extends QueryParams {
  /** Filter by entity type */
  entity_type?: string
  /** Filter by entity ID */
  entity_id?: string
  /** Filter by operation type */
  operation_type?: 'CREATE' | 'UPDATE' | 'DELETE'
  /** Filter by priority */
  priority?: number
  /** Filter by minimum attempts */
  min_attempts?: number
  /** Filter unresolved conflicts only */
  unresolved_only?: boolean
  /** Sync token for pull operations */
  since?: string
}

// ============================================
// Rule Query Parameters
// ============================================

export interface RuleQueryParams extends QueryParams {
  /** Filter by rule type */
  rule_type?: string
  /** Filter by rule trigger */
  rule_trigger?: string
  /** Filter by status */
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'TESTING' | 'DEPRECATED'
  /** Filter by entity type */
  entity_type?: string
  /** Filter by organisation ID */
  organisation_id?: string
  /** Filter active rules only */
  is_active?: boolean
}

// ============================================
// Dashboard Query Parameters
// ============================================

export interface DashboardQueryParams {
  /** Period for trend data */
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year'
  /** Organisation filter */
  organisation_id?: string
  /** Limit for recent items */
  limit?: number
  /** Start date for range queries */
  start_date?: string
  /** End date for range queries */
  end_date?: string
}

/**
 * Dashboard KPIs
 */
export interface DashboardKPIs {
  activeBCPs: number
  activeIncidents: number
  highRisks: number
  pendingApprovals: number
  complianceRate: number
  maturityScore: number
}

/**
 * Dashboard Incident (simplified for dashboard display)
 */
export interface DashboardIncident {
  uuid: string
  incident_severity: string
  root_cause: string
  declared_at: string
  closed_at?: string | null
  organisation?: {
    uuid: string
    name: string
  }
}

/**
 * Dashboard Test (simplified for dashboard display)
 */
export interface DashboardTest {
  uuid: string
  exercise_test_type: string
  date: string
  passed: boolean
  business_continuity_plan?: {
    uuid: string
    critical_function?: {
      name: string
    }
  }
}

/**
 * Dashboard Workflow (simplified for dashboard display)
 */
export interface DashboardWorkflow {
  uuid: string
  workflow_type: string
  workflow_state: string
  priority: number
  title: string
  due_date?: string | null
  assigned_to?: string | null
}

/**
 * Compliance Overview
 */
export interface ComplianceOverview {
  standard: string
  compliant: number
  partially: number
  nonCompliant: number
  total: number
  complianceRate: number
  lastAuditDate?: string
  nextAuditDue?: string
}

/**
 * Risk Trend
 */
export interface RiskTrend {
  period: string
  label: string
  highRisks: number
  mediumRisks: number
  lowRisks: number
  total: number
}

/**
 * Maturity Progress
 */
export interface MaturityProgress {
  overall: number
  domains: MaturityDomain[]
  target: number
  progress: number
  lastAssessment?: string
}

export interface MaturityDomain {
  name: string
  score: number
  target: number
  gap: number
  recommendations: string[]
}

/**
 * Incident Trend
 */
export interface IncidentTrend {
  period: string
  label: string
  critical: number
  high: number
  medium: number
  low: number
  total: number
  avgResolutionTime: number
}
