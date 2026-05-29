// ============================================
// Risk Module - Enums
// ============================================

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

export enum ImpactSeverity {
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
  if (score < 8) return RiskScoreLevel.LOW
  if (score < 15) return RiskScoreLevel.MEDIUM
  if (score < 20) return RiskScoreLevel.HIGH
  return RiskScoreLevel.EXTREME
}

export function getRiskColor(score: number): string {
  if (score < 8) return '#10B981'
  if (score < 15) return '#F59E0B'
  if (score < 20) return '#F97316'
  return '#EF4444'
}

// ============================================
// Risk Module - Types
// ============================================

import { QueryParams } from 'src/shared/types/common.types'
import { BaseEntity } from '../../core/base/base.entity'

export interface MitigatingControl {
  control_id: string
  control_name: string
  effectiveness: number
  implemented_date: string
}

export interface RiskFactor {
  factor: string
  weight: number
  score: number
}

export interface RiskActionHistory {
  action: string
  performed_by: string
  performed_at: string
  notes?: string
}

export interface Risk extends BaseEntity {
  organisation_id: string
  title: string
  description?: string
  risk_category: RiskCategory
  status: RiskStatus
  inherent_likelihood: number
  inherent_impact: number
  inherent_risk_score: number
  residual_likelihood?: number
  residual_impact?: number
  residual_risk_score?: number
  treatment_strategy?: RiskTreatment
  treatment_plan?: string
  assigned_to?: string
  review_date?: string
  target_completion_date?: string
  actual_completion_date?: string
  mitigating_controls?: MitigatingControl[]
  risk_factors?: RiskFactor[]
  action_history?: RiskActionHistory[]
  requires_approval: boolean
  approved_by?: string
  approved_at?: string
  approval_notes?: string
}

export interface RiskAssessmentWorkflow {
  risk_id: string
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED'
  submitted_by: string
  submitted_at: string
  reviewed_by?: string
  reviewed_at?: string
  comments?: string
  assessment_data: RiskAssessmentData
}

export interface RiskAssessmentData {
  likelihood: number
  impact: number
  inherent_score: number
  residual_likelihood?: number
  residual_impact?: number
  residual_score?: number
  controls: string[]
  treatment_plan?: string
}

export interface RiskMitigationPlan {
  risk_id: string
  plan_name: string
  description: string
  actions: RiskMitigationAction[]
  start_date: string
  target_completion_date: string
  actual_completion_date?: string
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED'
  budget?: number
  actual_cost?: number
  owner_id: string
}

export interface RiskMitigationAction {
  id: string
  description: string
  assigned_to: string
  due_date: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
  completed_at?: string
  notes?: string
}

export interface RiskSummary {
  id: string
  title: string
  category: string
  score: number
  status: string
}

export interface RiskHeatmapSummary {
  total_risks: number
  critical_risks: number
  high_risks: number
  medium_risks: number
  low_risks: number
}

export interface RiskMatrixData {
  likelihood: number
  impact: number
  count: number
  risks: Array<{ id: string; title: string; score: number }>
}

export interface RiskHeatmapData {
  categories: string[]
  inherent: number[]
  residual: number[]
  matrix: RiskHeatmapCell[][]
  summary: RiskHeatmapSummary
}

export interface RiskTrendData {
  period: string
  identified: number
  assessed: number
  mitigated: number
  closed: number
  average_score: number
}

export interface RiskHeatmapCell {
  likelihood_level: number
  impact_level: number
  count: number
  risks: RiskSummary[]
  color: string
}

export interface RiskTrendAnalysis {
  periods: string[]
  identified: number[]
  mitigated: number[]
  closed: number[]
  average_scores: number[]
  projected_trend: number[]
}

// Request Types
export interface CreateRiskRequest {
  organisation_id: string
  title: string
  description?: string
  risk_category: RiskCategory
  inherent_likelihood: number
  inherent_impact: number
  treatment_strategy?: RiskTreatment
  treatment_plan?: string
  assigned_to?: string
  review_date?: string
  target_completion_date?: string
}

export interface UpdateRiskRequest {
  title?: string
  description?: string
  risk_category?: RiskCategory
  status?: RiskStatus
  inherent_likelihood?: number
  inherent_impact?: number
  residual_likelihood?: number
  residual_impact?: number
  treatment_strategy?: RiskTreatment
  treatment_plan?: string
  assigned_to?: string
  review_date?: string
  target_completion_date?: string
}

export interface AssessRiskRequest {
  inherent_likelihood: number
  inherent_impact: number
  residual_likelihood?: number
  residual_impact?: number
  mitigating_controls?: MitigatingControl[]
}

export interface RiskQueryParams extends QueryParams {
  status?: RiskStatus
  risk_category?: string
  impact_severity?: string
  organisation_id?: string
  min_inherent_score?: number
  max_inherent_score?: number
  min_residual_score?: number
  max_residual_score?: number
  min_likelihood?: number
  max_likelihood?: number
  has_controls?: boolean
  needs_mitigation?: boolean
  high_only?: boolean
  critical_only?: boolean
  threshold?: number
}
