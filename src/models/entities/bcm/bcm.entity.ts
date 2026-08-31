import { BaseEntity } from '../../core/base/base.entity'
import { Department, Organisation } from '../organisation'

// ============================================
// BCM Module - Enums (Aligned with Backend)
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

export enum BCPTemplateCategory {
  GENERAL = 'GENERAL',
  IT = 'IT',
  FINANCE = 'FINANCE',
  HR = 'HR',
  OPERATIONS = 'OPERATIONS',
  SUPPLY_CHAIN = 'SUPPLY_CHAIN',
  CUSTOM = 'CUSTOM',
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

// ============================================
// Core BCM Types (camelCase - Aligned with Backend DTOs)
// ============================================

/**
 * Critical Function - Matches backend CriticalFunction entity
 */
export interface CriticalFunction extends BaseEntity {
  organisationId: string
  departmentId: string
  name: string
  description?: string
  recoveryPriority: RecoveryPriority
  recoveryTimeObjective?: number
  recoveryPointObjective?: number
  maximumTolerableDowntime?: number
  workRecoveryTime?: number
  requiresBcp: boolean
  isActive: boolean
  dependencies?: CriticalFunctionDependency[]
  resourceRequirements?: ResourceRequirement[]
  keyPersonnel?: KeyPersonnel[]
  organisation?: Organisation
  department?: Department
  businessImpactAssessment?: BusinessImpactAssessment
  businessContinuityPlan?: BusinessContinuityPlan
}

export interface CriticalFunctionDependency {
  criticalFunctionId: string
  functionName: string
  dependencyType: string
  isCritical: boolean
}

export interface ResourceRequirement {
  resourceType: string
  quantity: number
  unit: string
  critical: boolean
  available?: boolean
}

export interface KeyPersonnel {
  userId: string
  name: string
  role: string
  isPrimary: boolean
  backupUserId?: string
}

/**
 * Business Impact Assessment - Matches backend BIA entity
 */
export interface BusinessImpactAssessment extends BaseEntity {
  organisationId: string
  criticalFunctionId: string
  assessedDate: string | Date
  financialImpactPerDay: number
  operationalImpact: string
  regulatoryImpact?: string
  reputationalImpact?: ReputationalImpact
  maximumAcceptableOutage?: number
  assessedBy?: string
  reviewDate?: string | Date
  nextReviewDate?: string | Date
  seasonalVariations?: SeasonalVariation[]
  thirdPartyDependencies?: ThirdPartyDependency[]
  impactAssessmentDetails?: ImpactAssessmentDetails
  organisation?: Organisation
  criticalFunction?: CriticalFunction
  assessor?: { uuid: string; email: string }
}

export interface SeasonalVariation {
  season: string
  financialImpactMultiplier: number
  operationalImpact: string
  startDate: Date
  endDate: Date
}

export interface ThirdPartyDependency {
  providerName: string
  service: string
  criticality: string
  slaInHours: number
  contactEmail: string
  contactPhone: string
}

export interface ImpactAssessmentDetails {
  financialImpactCurrency: string
  operationalImpactScore: number
  regulatoryImpactScore: number
  reputationalImpactScore: number
  overallImpactScore: number
  impactAnalysisNotes: string
}

/**
 * Business Continuity Plan - Matches backend BCP entity
 */
export interface BusinessContinuityPlan extends BaseEntity {
  organisationId: string
  criticalFunctionId: string
  planName: string
  version: number
  planStatus: BCMPlanStatus
  approvedBy?: string
  approvalDate?: string | Date
  reviewDueDate: string | Date
  lastReviewDate?: string | Date
  recoveryTimeObjective?: number
  recoveryPointObjective?: number
  emergencyContactList?: EmergencyContactList
  planDocumentUrl?: string
  planObjectives?: string
  scope?: string
  assumptions?: string
  keyPersonnel?: KeyPersonnel[]
  recoveryProcedures?: RecoveryProcedure[]
  isActive: boolean
  parentBcpId?: string
  versionHistory?: VersionHistoryEntry[]
  organisation?: Organisation
  criticalFunction?: CriticalFunction
  approver?: { uuid: string; email: string }
  parentBcp?: BusinessContinuityPlan
  subBcps?: BusinessContinuityPlan[]
  recoveryStrategies?: RecoveryStrategy[]
  exerciseTests?: ExerciseTest[]
}

export interface EmergencyContactList {
  primaryContacts: EmergencyContact[]
  secondaryContacts: EmergencyContact[]
  externalContacts: ExternalContact[]
}

export interface EmergencyContact {
  name: string
  role: string
  email: string
  phone: string
  isPrimary: boolean
}

export interface ExternalContact {
  name: string
  organisation: string
  email: string
  phone: string
  purpose: string
}

export interface RecoveryProcedure {
  stepNumber: number
  action: string
  responsiblePerson: string
  estimatedTime: number
  dependencies: string[]
  successCriteria: string
}

export interface VersionHistoryEntry {
  version: number
  status: BCMPlanStatus
  updatedAt: Date
  updatedBy: string
  changeNotes: string
}

/**
 * BCP Template - Matches backend BCPTemplate entity
 */
export interface BCPTemplate extends BaseEntity {
  organisationId?: string
  templateName: string
  description?: string
  category: BCPTemplateCategory
  defaultStatus: BCMPlanStatus
  sections: BCPTemplateSection[]
  defaultRto?: number
  defaultRpo?: number
  defaultReviewPeriodDays?: number
  tags?: string[]
  usageCount?: number
  isSystemTemplate: boolean
  organisation?: Organisation
}

export interface BCPTemplateSection {
  title: string
  description: string
  order: number
  content?: string
}

/**
 * Recovery Strategy - Matches backend RecoveryStrategy entity
 */
export interface RecoveryStrategy extends BaseEntity {
  organisationId: string
  businessContinuityPlanId: string
  recoveryStrategyType: RecoveryStrategyType
  strategyName?: string
  description?: string
  resourceRequirements?: ResourceRequirements
  estimatedRecoveryCost: number
  testSuccessRate: number
  estimatedRecoveryTime?: number
  isPrimary: boolean
  isActive: boolean
  dependencies?: StrategyDependency[]
  validationEvidence?: ValidationEvidence[]
  implementationSteps?: ImplementationStep[]
  organisation?: Organisation
  businessContinuityPlan?: BusinessContinuityPlan
}

export interface ResourceRequirements {
  staffRequired: number
  equipment: string[]
  facilities: string[]
  technology: string[]
  thirdPartyServices: string[]
}

export interface StrategyDependency {
  strategyId: string
  strategyName: string
  dependencyType: string
  critical: boolean
}

export interface ValidationEvidence {
  testId: string
  testDate: Date
  success: boolean
  notes: string
  executedBy: string
}

export interface ImplementationStep {
  stepNumber: number
  action: string
  responsiblePerson: string
  estimatedDuration: number
  dependencies: string[]
}

/**
 * Exercise Test - Matches backend ExerciseTest entity
 */
export interface ExerciseTest extends BaseEntity {
  organisationId: string
  businessContinuityPlanId: string
  exerciseTestType: ExerciseTestType
  testName?: string
  description?: string
  scheduledDate: string | Date
  executedDate?: string | Date
  participants: string[]
  participantDetails?: ParticipantDetail[]
  passed: boolean
  lessonsLearned?: string
  correctiveActions?: string
  durationMinutes?: number
  successCriteriaMet?: number
  testScenarios?: TestScenario[]
  testObservations?: TestObservation[]
  organisation?: Organisation
  businessContinuityPlan?: BusinessContinuityPlan
}

export interface ParticipantDetail {
  userId: string
  name: string
  role: string
  attended: boolean
  feedback?: string
}

export interface TestScenario {
  scenario: string
  description: string
  expectedOutcome: string
  actualOutcome: string
  passed: boolean
}

export interface TestObservation {
  observation: string
  severity: string
  actionRequired: boolean
  actionTaken?: string
}

/**
 * BCM Lifecycle Status
 */
export interface BCMLifecycleStatus extends BaseEntity {
  organisationId: string
  phase: BCMLifecyclePhase
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
  progressPercentage: number
  startedAt?: string | Date
  completedAt?: string | Date
  blockedReason?: string
  assignedTo?: string
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
  dueDate?: string | Date
  completedAt?: string | Date
  assignedTo?: string
  dependsOn?: string[]
}

// ============================================
// API Request/Response DTOs (camelCase)
// ============================================

export interface CreateCriticalFunctionRequest {
  organisationId: string
  departmentId: string
  name: string
  description?: string
  recoveryPriority?: RecoveryPriority
  recoveryTimeObjective?: number
  recoveryPointObjective?: number
  maximumTolerableDowntime?: number
  workRecoveryTime?: number
  requiresBcp?: boolean
  dependencies?: CriticalFunctionDependency[]
  resourceRequirements?: ResourceRequirement[]
}

export interface UpdateCriticalFunctionRequest {
  departmentId?: string
  name?: string
  description?: string
  recoveryPriority?: RecoveryPriority
  recoveryTimeObjective?: number
  recoveryPointObjective?: number
  maximumTolerableDowntime?: number
  workRecoveryTime?: number
  requiresBcp?: boolean
  dependencies?: CriticalFunctionDependency[]
  resourceRequirements?: ResourceRequirement[]
}

export interface CreateBIARequest {
  organisationId: string
  criticalFunctionId: string
  assessedDate: string | Date
  financialImpactPerDay: number
  operationalImpact: string
  regulatoryImpact?: string
  reputationalImpact?: ReputationalImpact
  maximumAcceptableOutage?: number
  seasonalVariations?: SeasonalVariation[]
  thirdPartyDependencies?: ThirdPartyDependency[]
}

export interface UpdateBIARequest {
  assessedDate?: string | Date
  financialImpactPerDay?: number
  operationalImpact?: string
  regulatoryImpact?: string
  reputationalImpact?: ReputationalImpact
  maximumAcceptableOutage?: number
  seasonalVariations?: SeasonalVariation[]
  thirdPartyDependencies?: ThirdPartyDependency[]
}

export interface CreateBCPRequest {
  organisationId: string
  criticalFunctionId: string
  planName: string
  planStatus?: BCMPlanStatus
  reviewDueDate: string | Date
  emergencyContactList: EmergencyContactList
  planDocumentUrl?: string
  planObjectives?: string
  scope?: string
  assumptions?: string
  keyPersonnel?: KeyPersonnel[]
  recoveryTimeObjective?: number
  recoveryPointObjective?: number
}

export interface UpdateBCPRequest {
  criticalFunctionId?: string
  planName?: string
  planStatus?: BCMPlanStatus
  reviewDueDate?: string | Date
  emergencyContactList?: EmergencyContactList
  planDocumentUrl?: string
  planObjectives?: string
  scope?: string
  assumptions?: string
  keyPersonnel?: KeyPersonnel[]
  recoveryTimeObjective?: number
  recoveryPointObjective?: number
}

export interface CreateRecoveryStrategyRequest {
  organisationId: string
  businessContinuityPlanId: string
  recoveryStrategyType: RecoveryStrategyType
  strategyName?: string
  description?: string
  resourceRequirements?: ResourceRequirements
  estimatedRecoveryCost: number
  estimatedRecoveryTime?: number
  isPrimary?: boolean
}

export interface UpdateRecoveryStrategyRequest {
  recoveryStrategyType?: RecoveryStrategyType
  strategyName?: string
  description?: string
  resourceRequirements?: ResourceRequirements
  estimatedRecoveryCost?: number
  estimatedRecoveryTime?: number
  testSuccessRate?: number
  isPrimary?: boolean
  isActive?: boolean
}

export interface CreateExerciseTestRequest {
  organisationId: string
  businessContinuityPlanId: string
  exerciseTestType: ExerciseTestType
  testName?: string
  description?: string
  scheduledDate: string | Date
  participants: string[]
  participantDetails?: ParticipantDetail[]
}

export interface UpdateExerciseTestRequest {
  exerciseTestType?: ExerciseTestType
  testName?: string
  description?: string
  scheduledDate?: string | Date
  participants?: string[]
  participantDetails?: ParticipantDetail[]
}

export interface RecordTestResultRequest {
  passed: boolean
  lessonsLearned: string
  correctiveActions: string
  executedDate: string | Date
  durationMinutes?: number
  successCriteriaMet?: number
  testScenarios?: TestScenario[]
  testObservations?: TestObservation[]
}

export interface CreateBCPTemplateRequest {
  organisationId?: string
  templateName: string
  description?: string
  category?: BCPTemplateCategory
  defaultStatus?: BCMPlanStatus
  sections: BCPTemplateSection[]
  defaultRto?: number
  defaultRpo?: number
  defaultReviewPeriodDays?: number
  tags?: string[]
  isSystemTemplate?: boolean
}

export interface UpdateBCPTemplateRequest {
  templateName?: string
  description?: string
  category?: BCPTemplateCategory
  defaultStatus?: BCMPlanStatus
  sections?: BCPTemplateSection[]
  defaultRto?: number
  defaultRpo?: number
  defaultReviewPeriodDays?: number
  tags?: string[]
}

export interface ApplyTemplateRequest {
  criticalFunctionId: string
  planName: string
  reviewDueDate?: string | Date
  recoveryTimeObjective?: number
  recoveryPointObjective?: number
  emergencyContactList?: EmergencyContactList
  planDocumentUrl?: string
  planStatus?: BCMPlanStatus
  keyPersonnel?: KeyPersonnel[]
}

// ============================================
// Query Parameter Types
// ============================================

export interface CriticalFunctionQueryParams {
  departmentId?: string
  organisationId?: string
  search?: string
  recoveryPriority?: RecoveryPriority
  requiresBcp?: boolean
  isActive?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface BIAQueryParams {
  criticalFunctionId?: string
  organisationId?: string
  minFinancialImpact?: number
  maxFinancialImpact?: number
  assessedAfter?: string | Date
  assessedBefore?: string | Date
  page?: number
  limit?: number
}

export interface BCPQueryParams {
  criticalFunctionId?: string
  organisationId?: string
  planStatus?: BCMPlanStatus
  reviewDueBefore?: string | Date
  reviewDueAfter?: string | Date
  isActive?: boolean
  page?: number
  limit?: number
}

export interface ExerciseTestQueryParams {
  businessContinuityPlanId?: string
  organisationId?: string
  exerciseTestType?: ExerciseTestType
  passed?: boolean
  upcomingOnly?: boolean
  overdueOnly?: boolean
  dateAfter?: string | Date
  dateBefore?: string | Date
  page?: number
  limit?: number
}

export interface RecoveryStrategyQueryParams {
  businessContinuityPlanId?: string
  organisationId?: string
  recoveryStrategyType?: RecoveryStrategyType
  minSuccessRate?: number
  maxSuccessRate?: number
  isPrimary?: boolean
  isActive?: boolean
  page?: number
  limit?: number
}

// ============================================
// Response/Analysis Types
// ============================================

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

export interface MaturityAssessment {
  domain: string
  currentLevel: number
  targetLevel: number
  gap: number
  recommendations: string[]
}

export interface BCMMetrics {
  totalCriticalFunctions: number
  assessedFunctions: number
  plansApproved: number
  plansActive: number
  testsPassed: number
  testsFailed: number
  averageRtoAchievement: number
  averageRpoAchievement: number
  overallMaturityScore: number
}

export interface BCMDashboardData {
  metrics: BCMMetrics
  recentActivities: RecentActivity[]
  upcomingReviews: UpcomingReview[]
  pendingApprovals: number
  expiringPlans: ExpiringPlan[]
  complianceGaps: ComplianceGap[]
}

export interface UpcomingReview {
  planId: string
  planName: string
  reviewDueDate: string
  daysUntilDue: number
  status: 'UPCOMING' | 'OVERDUE' | 'DUE_SOON'
}

export interface ExpiringPlan {
  planId: string
  planName: string
  expiryDate: string
  daysUntilExpiry: number
}

export interface ComplianceGap {
  requirement: string
  currentStatus: string
  targetStatus: string
  actionItems: string[]
  priority: 'high' | 'medium' | 'low'
}