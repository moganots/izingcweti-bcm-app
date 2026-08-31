import type { BaseEntity } from '@/types/common/base.entity';

export enum RiskCategory {
  FINANCIAL = 'FINANCIAL',
  OPERATIONAL = 'OPERATIONAL',
  COMPLIANCE = 'COMPLIANCE',
  REPUTATIONAL = 'REPUTATIONAL',
  STRATEGIC = 'STRATEGIC',
  CYBERSECURITY = 'CYBERSECURITY',
  NATURAL_DISASTER = 'NATURAL_DISASTER',
  TECHNOLOGY_FAILURE = 'TECHNOLOGY_FAILURE',
  HUMAN_ERROR = 'HUMAN_ERROR',
  THIRD_PARTY = 'THIRD_PARTY',
}

export enum RiskStatus {
  IDENTIFIED = 'IDENTIFIED',
  ASSESSING = 'ASSESSING',
  APPROVED = 'APPROVED',
  TREATING = 'TREATING',
  MONITORING = 'MONITORING',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
}

export enum RiskTreatment {
  AVOID = 'AVOID',
  MITIGATE = 'MITIGATE',
  TRANSFER = 'TRANSFER',
  ACCEPT = 'ACCEPT',
  EXPLOIT = 'EXPLOIT',
}

export enum RiskLikelihoodLevel {
  RARE = 'RARE',
  UNLIKELY = 'UNLIKELY',
  POSSIBLE = 'POSSIBLE',
  LIKELY = 'LIKELY',
  ALMOST_CERTAIN = 'ALMOST_CERTAIN',
}

export enum RiskImpactLevel {
  INSIGNIFICANT = 'INSIGNIFICANT',
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  MAJOR = 'MAJOR',
  SEVERE = 'SEVERE',
  CATASTROPHIC = 'CATASTROPHIC',
}

export enum RiskScoreLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EXTREME = 'EXTREME',
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

export interface RiskDto extends BaseEntity {
  organisationId: string;
  title: string;
  description?: string;
  riskCategory: RiskCategory;
  status: RiskStatus;
  inherentLikelihood: number;
  inherentImpact: number;
  inherentRiskScore: number;
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
  actionHistory?: ActionHistoryDto[];
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  approvalNotes?: string;
}

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