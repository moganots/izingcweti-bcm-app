import { BaseEntity } from '../../../core/base/base.entity'
import { RiskCategory, RiskStatus, RiskTreatment } from '../enums/risk.enum'

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
