import type { BaseEntity } from './../../../core/base/base.entity';

export enum RiskCategory {
  FINANCIAL = 'Financial',
  OPERATIONAL = 'Operational',
  COMPLIANCE = 'Compliance',
  REPUTATIONAL = 'Reputational',
  STRATEGIC = 'Strategic',
  CYBERSECURITY = 'Cybersecurity',
  NATURAL_DISASTER = 'NaturalDisaster',
  TECHNOLOGY_FAILURE = 'TechnologyFailure',
  HUMAN_ERROR = 'HumanError',
  THIRD_PARTY = 'ThirdParty',
  REGULATORY = 'Regulatory',
  HEALTH_SAFETY = 'HealthSafety',
  SUPPLY_CHAIN = 'SupplyChain',
  LEGAL = 'Legal',
  POLITICAL = 'Political',
  ENVIRONMENTAL = 'Environmental',
  COMPLIANCE_AND_LEGAL = "ComplianceAndLegal",
  FINANCIAL_AND_ECONOMIC = "FinancialAndEconomic",
  STRATEGIC_AND_REPUTATIONAL = "StrategicAndReputational",
  PEOPLE_AND_SAFETY = "PeopleAndSafety",
  ASSETS_AND_IT = "AssetsAndIT",
  CYBER = "Cyber",
  NATURAL = "Natural",
  HUMAN = "Human",
  SUPPLY = "Supply",
  BUSINESS_INTERRUPTION = "BusinessInterruption",
  DATA_BREACH = "DataBreach",
}

export enum RiskStatus {
  IDENTIFIED = "Identified",
  ASSESSING = "Assessing",
  ASSESED = "Assessed",
  IN_REVIEW = "InReview",
  APPROVED = "Approved",
  TREATMENT_PLANNED = "TreatmentPlanned",
  IN_PROGESS = "InProgress",
  MITIGATED = "Mitigated",
  TREATING = "Treating",
  MONITORING = "Monitoring",
  TRANSFERRED = "Transferred",
  ACCEPTED = "Accepted",
  CLOSED = "Closed",
  REJECTED = "Rejected",
}

export enum RiskTreatment {
  AVOID = "Avoid",
  REDUCE = "Reduce",
  MITIGATE = "Mitigate",
  TRANSFER = "Transfer",
  ACCEPT = "Accept",
  SHARE = "Share",
  EXPLOIT = "Exploit",
}

export enum RiskImpactLevel {
  INSIGNIFICANT = "Insignificant",
  LOW = "Low",
  MINOR = "Minor",
  MODERATE = "Moderate",
  MEDIUM = "Medium",
  HIGH = "High",
  MAJOR = "Major",
  CRITICAL = "Critical",
  SEVERE = "Severe",
  CATASTROPHIC = "Catastrophic",
}

export enum RiskLikelihoodLevel {
  RARE = "Rare",
  UNLIKELY = "Unlikely",
  POSSIBLE = "Possible",
  LIKELY = "Likely",
  ALMOST_CERTAIN = "AlmostCertain",
}

export enum RiskScoreLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  EXTREME = "Extreme",
}

export function getRiskScoreLevel(score: number): RiskScoreLevel {
  if (score < 8) return RiskScoreLevel.LOW;
  if (score < 15) return RiskScoreLevel.MEDIUM;
  if (score < 20) return RiskScoreLevel.HIGH;
  return RiskScoreLevel.EXTREME;
}

export function getRiskColor(score: number): string {
  if (score < 8) return '#10B981'; // Green
  if (score < 15) return '#F59E0B'; // Yellow
  if (score < 20) return '#F97316'; // Orange
  return '#EF4444'; // Red
}

// ============================================
// DTOs (camelCase aligned with backend)
// ============================================

export interface MitigatingControlDto {
  controlId: string;
  controlName: string;
  effectiveness: number;
  implementedDate: Date;
}

export interface RiskFactorDto {
  factor: string;
  weight: number;
  score: number;
}

export interface ActionHistoryDto {
  action: string;
  performedBy: string;
  performedAt: Date;
  notes?: string;
}

// ============================================
// Risk Entity (camelCase aligned with backend)
// ============================================

export interface Risk extends BaseEntity {
  organisationId: string;
  title: string;
  description?: string;
  riskCategory: RiskCategory;
  status: RiskStatus;
  inherentLikelihood: number;
  inherentImpact: number;
  inherentRiskScore: number;
  inherentLikelihoodLevel?: RiskLikelihoodLevel;
  inherentImpactLevel?: RiskImpactLevel;
  residualLikelihood?: number;
  residualImpact?: number;
  residualRiskScore?: number;
  residualLikelihoodLevel?: RiskLikelihoodLevel;
  residualImpactLevel?: RiskImpactLevel;
  treatmentStrategy?: RiskTreatment;
  treatmentPlan?: string;
  assignedTo?: string;
  reviewDate?: Date;
  targetCompletionDate?: Date;
  actualCompletionDate?: Date;
  mitigatingControls?: MitigatingControlDto[];
  riskFactors?: RiskFactorDto[];
  actionHistory?: ActionHistoryDto[];
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  approvalNotes?: string;
  parentRiskId?: string;
  riskOwner?: {
    userId: string;
    name: string;
    email: string;
    department: string;
  };
  categoryHierarchy?: {
    primaryCategory: RiskCategory;
    subCategory?: string;
    subSubCategory?: string;
  };
}

// ============================================
// DTOs
// ============================================

export interface CreateRiskDto {
  title: string;
  description?: string;
  riskCategory: RiskCategory;
  inherentLikelihood: number;
  inherentImpact: number;
  residualLikelihood?: number;
  residualImpact?: number;
  treatmentStrategy?: RiskTreatment;
  treatmentPlan?: string;
  assignedTo?: string;
  reviewDate?: Date;
  targetCompletionDate?: Date;
  mitigatingControls?: MitigatingControlDto[];
  riskFactors?: RiskFactorDto[];
  organisationId: string;
}

export interface UpdateRiskDto {
  title?: string;
  description?: string;
  riskCategory?: RiskCategory;
  status?: RiskStatus;
  inherentLikelihood?: number;
  inherentImpact?: number;
  residualLikelihood?: number;
  residualImpact?: number;
  residualRiskScore?: number;
  treatmentStrategy?: RiskTreatment;
  treatmentPlan?: string;
  assignedTo?: string;
  reviewDate?: Date;
  targetCompletionDate?: Date;
  actualCompletionDate?: Date;
  mitigatingControls?: MitigatingControlDto[];
  riskFactors?: RiskFactorDto[];
  requiresApproval?: boolean;
}

export interface AssessRiskDto {
  inherentLikelihood: number;
  inherentImpact: number;
  residualLikelihood?: number;
  residualImpact?: number;
}

export interface ApproveRiskDto {
  notes?: string;
}

export interface AssignRiskDto {
  assignedTo: string;
}

export interface AddControlDto {
  controlName: string;
  effectiveness: number;
  implementedDate?: Date;
  controlId?: string;
}

export interface RiskQueryDto {
  organisationId?: string;
  riskCategory?: RiskCategory;
  status?: RiskStatus;
  assignedTo?: string;
  reviewFrom?: Date;
  reviewTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ============================================
// Stats DTOs
// ============================================

export interface RiskStatsDto {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  averageInherentScore: number;
  averageResidualScore: number;
  riskReductionPercentage: number;
  overdueReviews: number;
  pendingApprovals: number;
}

export interface RiskComprehensiveAnalytics {
  totalRisks: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byTreatment: Record<string, number>;
  averageInherentScore: number;
  averageResidualScore: number;
  riskReductionPercentage: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  overdueReviews: number;
  pendingApprovals: number;
  openRisks: number;
  closedRisks: number;
}

// ============================================
// Matrix & Trends
// ============================================

export interface RiskMatrixData {
  likelihood: number;
  impact: number;
  count: number;
  risks: RiskSummary[];
}

export interface RiskSummary {
  uuid: string;
  title: string;
  category: string;
  score: number;
  status: string;
}

export interface RiskHeatmapCell {
  likelihoodLevel: number;
  impactLevel: number;
  count: number;
  risks: RiskSummary[];
  color: string;
}

export interface RiskHeatmapData {
  categories: string[];
  inherent: number[];
  residual: number[];
  matrix: RiskHeatmapCell[][];
  summary: {
    totalRisks: number;
    criticalRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
  };
}

export interface RiskTrendData {
  month: string;
  status: string;
  count: number;
}

export interface RiskTrendAnalysis {
  periods: string[];
  identified: number[];
  mitigated: number[];
  closed: number[];
  averageScores: number[];
  projectedTrend: number[];
}

// ============================================
// Helper Functions - Labels & Colors
// ============================================

export function getRiskCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    FINANCIAL: 'Financial',
    OPERATIONAL: 'Operational',
    COMPLIANCE: 'Compliance',
    REPUTATIONAL: 'Reputational',
    STRATEGIC: 'Strategic',
    CYBERSECURITY: 'Cybersecurity',
    NATURAL_DISASTER: 'Natural Disaster',
    TECHNOLOGY_FAILURE: 'Technology Failure',
    HUMAN_ERROR: 'Human Error',
    THIRD_PARTY: 'Third Party',
    OTHER: 'Other',
  }
  return labels[category] || category
}

export function getRiskCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    FINANCIAL: 'blue',
    OPERATIONAL: 'orange',
    COMPLIANCE: 'purple',
    REPUTATIONAL: 'red',
    STRATEGIC: 'teal',
    CYBERSECURITY: 'deep-orange',
    NATURAL_DISASTER: 'brown',
    TECHNOLOGY_FAILURE: 'grey',
    HUMAN_ERROR: 'pink',
    THIRD_PARTY: 'indigo',
    OTHER: 'grey',
  }
  return colors[category] || 'grey'
}

export function getRiskStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    IDENTIFIED: 'Identified',
    ASSESSING: 'Assessing',
    APPROVED: 'Approved',
    TREATING: 'Treating',
    MONITORING: 'Monitoring',
    CLOSED: 'Closed',
    REJECTED: 'Rejected',
  }
  return labels[status] || status
}

export function getRiskStatusColor(status: string): string {
  const colors: Record<string, string> = {
    IDENTIFIED: 'grey',
    ASSESSING: 'blue',
    APPROVED: 'green',
    TREATING: 'orange',
    MONITORING: 'primary',
    CLOSED: 'grey-7',
    REJECTED: 'red',
  }
  return colors[status] || 'grey'
}

export function getRiskTreatmentLabel(treatment: string): string {
  const labels: Record<string, string> = {
    AVOID: 'Avoid',
    MITIGATE: 'Mitigate',
    TRANSFER: 'Transfer',
    ACCEPT: 'Accept',
    EXPLOIT: 'Exploit',
  }
  return labels[treatment] || treatment
}

export function getRiskTreatmentColor(treatment: string): string {
  const colors: Record<string, string> = {
    AVOID: 'red',
    MITIGATE: 'green',
    TRANSFER: 'orange',
    ACCEPT: 'grey',
    EXPLOIT: 'purple',
  }
  return colors[treatment] || 'grey'
}

export function getRiskImpactLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    INSIGNIFICANT: 'Insignificant',
    MINOR: 'Minor',
    MODERATE: 'Moderate',
    MAJOR: 'Major',
    SEVERE: 'Severe',
    CATASTROPHIC: 'Catastrophic',
  }
  return labels[level] || level
}

export function getRiskImpactLevelColor(level: string): string {
  const colors: Record<string, string> = {
    INSIGNIFICANT: 'grey',
    MINOR: 'blue',
    MODERATE: 'yellow',
    MAJOR: 'orange',
    SEVERE: 'deep-orange',
    CATASTROPHIC: 'red',
  }
  return colors[level] || 'grey'
}

export function getRiskLikelihoodLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    RARE: 'Rare',
    UNLIKELY: 'Unlikely',
    POSSIBLE: 'Possible',
    LIKELY: 'Likely',
    ALMOST_CERTAIN: 'Almost Certain',
  }
  return labels[level] || level
}

export function getRiskLikelihoodLevelColor(level: string): string {
  const colors: Record<string, string> = {
    RARE: 'grey',
    UNLIKELY: 'blue',
    POSSIBLE: 'yellow',
    LIKELY: 'orange',
    ALMOST_CERTAIN: 'red',
  }
  return colors[level] || 'grey'
}

export function getRiskScoreLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    EXTREME: 'Extreme',
  }
  return labels[level] || level
}

export function getRiskScoreLevelColor(level: string): string {
  const colors: Record<string, string> = {
    LOW: 'green',
    MEDIUM: 'yellow',
    HIGH: 'orange',
    EXTREME: 'red',
  }
  return colors[level] || 'grey'
}