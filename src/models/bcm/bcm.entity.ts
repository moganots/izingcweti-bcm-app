import type { BaseEntity } from "../../core/base/base.entity";
import type { Organisation, Department } from "../organisation/organisation.entity";

// ============================================
// BCM Module - Enums (Aligned with Backend)
// ============================================

/**
 * Maturity Score Enum (numeric, keep as is)
 */
export enum MaturityScore {
  INITIAL = "Initial",
  REPEATABLE = "Repeatable",
  DEFINED = "Defined",
  QUANTITATIVELY_MANAGED = "QuantitativelyManaged",
  OPTIMISING = "Optimising",
  OPTIMISED = "Optimised",
}

/**
 * Criticality Score Enum
 */
export enum CriticalityScore {
  CRITICAL = "Critical",
  URGENT = "Urgent",
  IMPORTANT = "Important",
  NORMAL = "Normal",
  NON_ESSENTIAL = "NonEssential",
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
  UNKNOWN = "Unknown",
}

/**
 * Reputational Impact Enum
 */
export enum ReputationalImpact {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical",
  SIGNIFICANT = "Significant",
}

/**
 * BCM Plan Status Enum
 */
export enum BCMPlanStatus {
  DRAFT = "Draft",
  UNDER_REVIEW = "UnderReview",
  APPROVED = "Approved",
  ACTIVE = "Active",
  ARCHIVED = "Archived",
  PUBLISHED = "Published",
  UNDER_REVISION = "UnderRevision",
  VALIDATION_PENDING = "ValidationPending",
  VALIDATION_APPROVED = "ValidationApproved",
  VALIDATION_REJECTED = "ValidationRejected",
  DEACTIVATED = "Deactivated",
  REACTIVATED = "Reactivated",
  EXPIRED = "Expired",
  REVOKED = "Revoked",
  SUSPENDED = "Suspended",
  TERMINATED = "Terminated",
  ON_HOLD = "OnHold",
  RESUMED = "Resumed",
  REOPENED = "Reopened",
  CLOSED = "Closed",
  COMPLETED_WITH_ISSUES = "CompletedWithIssues",
}

/**
 * BCP Template Category Enum
 */
export enum BCPTemplateCategory {
  IT_DISASTER_RECOVERY = "IT_DISASTER_RECOVERY",
  BUSINESS_CONTINUITY = "BUSINESS_CONTINUITY",
  CRISIS_MANAGEMENT = "CRISIS_MANAGEMENT",
  PANDEMIC_RESPONSE = "PANDEMIC_RESPONSE",
  CYBER_SECURITY = "CYBER_SECURITY",
  OPERATIONAL_RESILIENCE = "OPERATIONAL_RESILIENCE",
  SUPPLY_CHAIN = "SUPPLY_CHAIN",
  COMMUNICATION = "COMMUNICATION",
  GENERAL = "GENERAL",
  FINANCIAL = "FINANCIAL",
  HUMAN_RESOURCES = "HUMAN_RESOURCES",
  LEGAL_COMPLIANCE = "LEGAL_COMPLIANCE",
  FACILITIES = "FACILITIES",
  TECHNOLOGY = "TECHNOLOGY",
  DATA_PROTECTION = "DATA_PROTECTION",
  CLOUD_RECOVERY = "CLOUD_RECOVERY",
  PHYSICAL_SECURITY = "PHYSICAL_SECURITY",
  CUSTOMER_SERVICE = "CUSTOMER_SERVICE",
  VENDOR_MANAGEMENT = "VENDOR_MANAGEMENT",
  INSURANCE = "INSURANCE",
  ENVIRONMENTAL = "ENVIRONMENTAL",
  PUBLIC_RELATIONS = "PUBLIC_RELATIONS",
  EXECUTIVE_LEADERSHIP = "EXECUTIVE_LEADERSHIP",
  OPERATIONS = "OPERATIONS",
  RISK_MANAGEMENT = "RISK_MANAGEMENT",
}

/**
 * Recovery Strategy Type Enum
 */
export enum RecoveryStrategyType {
  HOT_SITE = "HotSite",
  COLD_SITE = "ColdSite",
  MOBILE_SITE = "MobileSite",
  CLOUD_FAILOVER = "CloudFailover",
  MANUAL_WORKAROUND = "ManualWorkaround",
  HYBRID = "Hybrid",
  MUTUAL_AGREEMENT = "ManualAgreement",
  CLOUD_BASED = "CloudBased",
  WARM_SITE = "WarmSite",
  RECIPROCAL_AGREEMENT = "ReciprocalAgreement",
}

/**
 * Recovery Priority Enum
 */
export enum RecoveryPriority {
  CRITICAL = "Critical",
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
  VERY_LOW = "VeryLow",
}

/**
 * Exercise Test Type Enum
 */
export enum ExerciseTestType {
  TABLETOP = "Tabletop",
  WALKTHROUGH = "Walkthrough",
  FULL = "Full",
  TECHNICAL = "Technical",
  FULL_SCALE = "FullScale",
  SIMULATION = "Simulation",
}

/**
 * BCM Lifecycle Phase Enum
 */
export enum BCMLifecyclePhase {
  INITIATION_GOVERNANCE = "InitiationAndGovernance",
  EMBEDDING = "EmbeddingBusinessContinuity",
  RISK_ASSESSMENT = "RiskAssessment",
  BUSINESS_IMPACT_ANALYSIS = "BusinessImpactAnalysis",
  STRATEGY_DESIGN = "StrategyDesign",
  PLAN_GENERATION = "PlanGeneration",
  APPROVAL_WORKFLOWS = "ApprovalWorkflows",
  TESTING_VALIDATION = "TestingAndValidation",
  CONTINUOUS_IMPROVEMENT = "ContinuousImprovement",
}

// ============================================
// Incident Module - Enums (Aligned with Backend)
// ============================================

export enum EscalationLevel {
  NO_ESCALATION = "NoEscalation",
  LEVEL_1_SUPERVISOR = "Level1Supervisor",
  LEVEL_2_DEPARTMENT_HEAD = "Level2DepartmentHead",
  LEVEL_3_BUSINESS_UNIT_MANAGER = "Level3BusinessUnitManager",
  LEVEL_4_EXECUTIVE_DIRECTOR = "Level4ExecutiveDirector",
  LEVEL_5_BOARD = "Level5Board",
  CRITICAL = "Critical",
}

export enum EscalationStatus {
  NOT_ESCALATED = "NotEscalated",
  ESCALATED = "Escalated",
  ACKNOWLEDGED = "Acknowledged",
  IN_PROGRESS = "InProgress",
  RESOLVED = "Resolved",
  REJECTED = "Rejected",
  DECLINED = "Declined",
}

export enum IncidentCategory {
  TECHNICAL = "Technical",
  PROCESS = "Process",
  PEOPLE = "People",
  EXTERNAL = "External",
  ENVIRONMENTAL = "Environmental",
  CYBERSECURITY = "Cybersecurity",
  PHYSICAL = "Physical",
  COMPLIANCE = "Compliance",
}

export enum IncidentSeverity {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical",
  CATASTROPHIC = "Catastrophic",
  INFORMATIONAL = "Informational",
  UNKNOWN = "Unknown",
}

export enum IncidentStatus {
  ACTIVE = "Active",
  DETECTED = "Detected",
  REPORTED = "Reported",
  ASSESSING = "Assessing",
  CLASSIFIED = "Classified",
  ESCALATED = "Escalated",
  RESPONDING = "Responding",
  MITIGATING = "Mitigating",
  STABILISED = "Stabilised",
  RECOVERING = "Recovering",
  RESOLVED = "Resolved",
  CLOSED = "Closed",
  REOPENED = "Reopened",
  MONITORING = "Monitoring",
  UNDER_INVESTIGATION = "UnderInvestigation",
  AWAITING_APPROVAL = "AwaitingApproval",
  REJECTED = "Rejected",
  CANCELLED = "Cancelled",
  DUPLICATE = "Duplicate",
  OPEN = "Open",
  IN_PROGRESS = "InProgress",
  MITIGATED = "Mitigated",
}

export enum ReopenReason {
  NEW_EVIDENCE = "NewEvidence",
  INCORRECT_RESOLUTION = "IncorrectResolution",
  RELATED_INCIDENT = "RelatedIncident",
  ONGOING_IMPACT = "OngoingImpact",
  CUSTOMER_REQUEST = "CustomerRequest",
  REGULATORY_REQUIREMENT = "RegulatoryRequirement",
  AUDIT_FINDING = "AuditFinding",
  ROOT_CAUSE_NOT_ADDRESSED = "RootCauseNotAddressed",
  PREMATURE_CLOSURE = "PrematureClosure",
  SYSTEM_REOPENED = "SystemReopened",
  ADMIN_OVERRIDE = "AdminOverride",
  OTHER = "Other",
}

// ============================================
// Core BCM Entities - Aligned with Backend
// ============================================

/**
 * Critical Function Entity
 * Backend: src/modules/bcm/models/entities/critical-function.entity.ts
 */
export interface CriticalFunction extends BaseEntity {
  organisationId: string;
  departmentId: string;
  name: string;
  description?: string;
  recoveryPriority: RecoveryPriority;
  recoveryTimeObjective?: number;
  recoveryPointObjective?: number;
  maximumTolerableDowntime?: number;
  workRecoveryTime?: number;
  requiresBcp: boolean;
  isActive: boolean;
  dependencies?: CriticalFunctionDependency[];
  resourceRequirements?: CriticalFunctionResourceRequirement[];
  keyPersonnel?: CriticalFunctionKeyPersonnel[];

  // Relationships
  organisation?: Organisation;
  department?: Department;
  businessContinuityPlan?: BusinessContinuityPlan;
  businessImpactAssessment?: BusinessImpactAssessment;
}

export interface CriticalFunctionDependency {
  criticalFunctionId: string;
  functionName: string;
  dependencyType: string;
  isCritical: boolean;
}

export interface CriticalFunctionResourceRequirement {
  resourceType: string;
  quantity: number;
  unit: string;
  critical: boolean;
  available: boolean;
}

export interface CriticalFunctionKeyPersonnel {
  userId: string;
  name: string;
  role: string;
  isPrimary: boolean;
  backupUserId?: string;
}

/**
 * Business Impact Assessment Entity
 * Backend: src/modules/bcm/models/entities/business-impact-assessment.entity.ts
 */
export interface BusinessImpactAssessment extends BaseEntity {
  organisationId: string;
  criticalFunctionId: string;
  assessedDate: Date;
  financialImpactPerDay: number;
  operationalImpact: string;
  regulatoryImpact?: string;
  reputationalImpact?: ReputationalImpact;
  maximumAcceptableOutage?: number;
  seasonalVariations?: SeasonalVariation[];
  thirdPartyDependencies?: ThirdPartyDependency[];
  impactAssessmentDetails?: ImpactAssessmentDetails;
  assessedBy?: string;
  reviewDate?: Date;
  nextReviewDate?: Date;

  // Relationships
  organisation?: Organisation;
  assessor?: { uuid: string; email: string };
  criticalFunction?: CriticalFunction;
}

export interface SeasonalVariation {
  season: string;
  financialImpactMultiplier: number;
  operationalImpact: string;
  startDate: Date;
  endDate: Date;
}

export interface ThirdPartyDependency {
  providerName: string;
  service: string;
  criticality: string;
  slaInHours: number;
  contactEmail: string;
  contactPhone: string;
}

export interface ImpactAssessmentDetails {
  financialImpactCurrency: string;
  operationalImpactScore: number;
  regulatoryImpactScore: number;
  reputationalImpactScore: number;
  overallImpactScore: number;
  impactAnalysisNotes: string;
}

/**
 * Business Continuity Plan Entity
 * Backend: src/modules/bcm/models/entities/business-continuity-plan.entity.ts
 */
export interface BusinessContinuityPlan extends BaseEntity {
  organisationId: string;
  planName: string;
  criticalFunctionId: string;
  version: number;
  planStatus: BCMPlanStatus;
  approvedBy?: string;
  approvalDate?: Date;
  reviewDueDate: Date;
  lastReviewDate?: Date;
  recoveryTimeObjective?: number;
  recoveryPointObjective?: number;
  emergencyContactList?: EmergencyContactList;
  planDocumentUrl?: string;
  planObjectives?: string;
  scope?: string;
  assumptions?: string;
  keyPersonnel?: BCPKeyPersonnel[];
  recoveryProcedures?: RecoveryProcedure[];
  isActive: boolean;
  versionHistory?: VersionHistoryEntry[];
  parentBcpId?: string;

  // Relationships
  organisation?: Organisation;
  approver?: { uuid: string; email: string };
  criticalFunction?: CriticalFunction;
  recoveryStrategies?: RecoveryStrategy[];
  exerciseTests?: ExerciseTest[];
  incidents?: Incident[];
  parentBcp?: BusinessContinuityPlan;
  subBcps?: BusinessContinuityPlan[];
}

export interface EmergencyContactList {
  primaryContacts: EmergencyContact[];
  secondaryContacts: EmergencyContact[];
  externalContacts: ExternalContact[];
}

export interface EmergencyContact {
  name: string;
  role: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

export interface ExternalContact {
  name: string;
  organisation: string;
  email: string;
  phone: string;
  purpose: string;
}

export interface BCPKeyPersonnel {
  name: string;
  role: string;
  contact: string;
  backupPerson?: string;
  responsibilities: string[];
}

export interface RecoveryProcedure {
  stepNumber: number;
  action: string;
  responsiblePerson: string;
  estimatedTime: number;
  dependencies: string[];
  successCriteria: string;
}

export interface VersionHistoryEntry {
  version: number;
  status: BCMPlanStatus;
  updatedAt: Date;
  updatedBy: string;
  changeNotes: string;
}

/**
 * BCP Template Entity
 * Backend: src/modules/bcm/models/entities/bcp-template.entity.ts
 */
export interface BCPTemplate extends BaseEntity {
  organisationId?: string;
  templateName: string;
  description?: string;
  category: BCPTemplateCategory;
  defaultStatus: BCMPlanStatus;
  sections: BCPTemplateSection[];
  defaultRto?: number;
  defaultRpo?: number;
  defaultReviewPeriodDays?: number;
  tags?: string[];
  usageCount?: number;
  isSystemTemplate: boolean;

  // Relationships
  organisation?: Organisation;
}

export interface BCPTemplateSection {
  title: string;
  description: string;
  order: number;
  content?: string;
}

/**
 * Recovery Strategy Entity
 * Backend: src/modules/bcm/models/entities/recovery-strategy.entity.ts
 */
export interface RecoveryStrategy extends BaseEntity {
  organisationId: string;
  businessContinuityPlanId: string;
  recoveryStrategyType: RecoveryStrategyType;
  strategyName?: string;
  description?: string;
  resourceRequirements?: ResourceRequirements;
  estimatedRecoveryCost: number;
  testSuccessRate: number;
  estimatedRecoveryTime?: number;
  isPrimary: boolean;
  isActive: boolean;
  dependencies?: StrategyDependency[];
  validationEvidence?: ValidationEvidence[];
  implementationSteps?: ImplementationStep[];

  // Relationships
  organisation?: Organisation;
  businessContinuityPlan?: BusinessContinuityPlan;
}

export interface ResourceRequirements {
  staffRequired: number;
  equipment: string[];
  facilities: string[];
  technology: string[];
  thirdPartyServices: string[];
}

export interface StrategyDependency {
  strategyId: string;
  strategyName: string;
  dependencyType: string;
  critical: boolean;
}

export interface ValidationEvidence {
  testId: string;
  testDate: Date;
  success: boolean;
  notes: string;
  executedBy: string;
}

export interface ImplementationStep {
  stepNumber: number;
  action: string;
  responsiblePerson: string;
  estimatedDuration: number;
  dependencies: string[];
}

/**
 * Exercise Test Entity
 * Backend: src/modules/bcm/models/entities/exercise-test.entity.ts
 */
export interface ExerciseTest extends BaseEntity {
  organisationId: string;
  businessContinuityPlanId: string;
  exerciseTestType: ExerciseTestType;
  testName?: string;
  description?: string;
  scheduledDate: Date;
  executedDate?: Date;
  participants: string[];
  participantDetails?: ParticipantDetail[];
  passed: boolean;
  lessonsLearned?: string;
  correctiveActions?: string;
  durationMinutes?: number;
  successCriteriaMet?: number;
  testScenarios?: TestScenario[];
  testObservations?: TestObservation[];

  // Relationships
  organisation?: Organisation;
  businessContinuityPlan?: BusinessContinuityPlan;
}

export interface ParticipantDetail {
  userId: string;
  name: string;
  role: string;
  attended: boolean;
  feedback?: string;
}

export interface TestScenario {
  scenario: string;
  description: string;
  expectedOutcome: string;
  actualOutcome: string;
  passed: boolean;
}

export interface TestObservation {
  observation: string;
  severity: string;
  actionRequired: boolean;
  actionTaken?: string;
}

/**
 * Incident Entity
 * Backend: src/modules/bcm/models/entities/incident.entity.ts
 */
export interface Incident extends BaseEntity {
  organisationId: string;
  businessContinuityPlanIdActivated: string;
  incidentTitle: string;
  declaredAt: Date;
  declaredBy?: string;
  closedBy?: string;
  closedAt?: Date;
  incidentSeverity: IncidentSeverity;
  incidentStatus: IncidentStatus;
  rootCause: string;
  recoveryActualTime: string;
  resolutionNotes?: string;
  escalatedBy?: string;
  escalationLevel: EscalationLevel;
  escalationStatus: EscalationStatus;
  escalatedTo?: string;
  escalatedAt?: Date;
  escalationReason?: string;
  escalationHistory?: EscalationHistoryEntry[];
  assignedBy?: string;
  assignedTo?: string;
  assignedAt?: Date;
  incidentUpdates?: IncidentUpdate[];
  escalationAttempts: number;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  impactAnalysis?: IncidentImpactAnalysis;

  // Relationships
  organisation?: Organisation;
  businessContinuityPlan?: BusinessContinuityPlan;
  declarer?: { uuid: string; email: string };
  closer?: { uuid: string; email: string };
  assignee?: { uuid: string; email: string };
  escalator?: { uuid: string; email: string };
}

export interface EscalationHistoryEntry {
  escalatedAt: Date;
  escalatedBy: string;
  fromLevel: EscalationLevel;
  toLevel: EscalationLevel;
  reason: string;
  escalatedTo: string;
  notes?: string;
}

export interface IncidentUpdate {
  updateText: string;
  updatedBy: string;
  updatedAt: Date;
  escalationLevel?: EscalationLevel;
  status?: string;
  severity?: IncidentSeverity;
}

export interface IncidentImpactAnalysis {
  financialImpact: number;
  operationalImpact: string;
  reputationalImpact: string;
  regulatoryImpact: string;
  affectedCustomers: number;
  affectedEmployees: number;
  downtimeMinutes: number;
}

/**
 * BCM Lifecycle Status Entity
 */
export interface BCMLifecycleStatus extends BaseEntity {
  organisationId: string;
  phase: BCMLifecyclePhase;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
  progressPercentage: number;
  startedAt?: Date;
  completedAt?: Date;
  blockedReason?: string;
  assignedTo?: string;
  dependencies?: string[];
  tasks: LifecycleTask[];
  documents: string[];
  metadata?: Record<string, any>;
}

export interface LifecycleTask {
  id: string;
  title: string;
  description?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
  dueDate?: Date;
  completedAt?: Date;
  assignedTo?: string;
  dependsOn?: string[];
}

// ============================================
// Helper Functions
// ============================================

export const BusinessContinuityPlanHelpers = {
  isApproved: (bcp: BusinessContinuityPlan): boolean => {
    return (
      bcp.planStatus === BCMPlanStatus.APPROVED ||
      bcp.planStatus === BCMPlanStatus.ACTIVE
    );
  },

  isOverdueForReview: (bcp: BusinessContinuityPlan): boolean => {
    return bcp.reviewDueDate < new Date();
  },

  daysUntilReview: (bcp: BusinessContinuityPlan): number => {
    const now = new Date();
    const diff = bcp.reviewDueDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },
};

export const ExerciseTestHelpers = {
  isScheduled: (test: ExerciseTest): boolean => {
    return test.scheduledDate > new Date();
  },

  isOverdue: (test: ExerciseTest): boolean => {
    return !test.executedDate && test.scheduledDate < new Date();
  },

  participantCount: (test: ExerciseTest): number => {
    return test.participants?.length || 0;
  },

  attendedCount: (test: ExerciseTest): number => {
    return test.participantDetails?.filter((p) => p.attended).length || 0;
  },

  attendanceRate: (test: ExerciseTest): number => {
    const total = ExerciseTestHelpers.participantCount(test);
    if (total === 0) return 0;
    return (ExerciseTestHelpers.attendedCount(test) / total) * 100;
  },
};

export const IncidentHelpers = {
  isResolved: (incident: Incident): boolean => {
    return (
      incident.incidentStatus === IncidentStatus.RESOLVED ||
      incident.incidentStatus === IncidentStatus.CLOSED
    );
  },

  totalDurationHours: (incident: Incident): number | null => {
    if (!incident.closedAt) return null;
    return (
      (incident.closedAt.getTime() - incident.declaredAt.getTime()) /
      (1000 * 60 * 60)
    );
  },

  isEscalated: (incident: Incident): boolean => {
    return incident.escalationLevel !== EscalationLevel.NO_ESCALATION;
  },
};

export function getIncidentSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    CRITICAL: "Critical",
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low",
    INFORMATIONAL: "Informational",
  };
  return labels[severity] || severity;
}

export function getIncidentSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    CRITICAL: "negative",
    HIGH: "warning",
    MEDIUM: "orange",
    LOW: "positive",
    INFORMATIONAL: "info",
  };
  return colors[severity] || "grey";
}

export function getIncidentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    OPEN: "Open",
    INVESTIGATING: "Investigating",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
    ESCALATED: "Escalated",
  };
  return labels[status] || status;
}

export function getIncidentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    OPEN: "warning",
    INVESTIGATING: "info",
    RESOLVED: "positive",
    CLOSED: "grey",
    ESCALATED: "negative",
  };
  return colors[status] || "grey";
}