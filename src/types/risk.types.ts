/**
 * Create Risk Request
 */
export interface CreateRiskRequest {
  organisation_id: string
  risk_category: string
  likelihood: number
  impact_severity: string
  inherent_risk_score: number
  residual_risk_score: number
  mitigation_control_ids?: string[]
}

/**
 * Update Risk Request
 */
export interface UpdateRiskRequest {
  risk_category?: string
  likelihood?: number
  impact_severity?: string
  inherent_risk_score?: number
  residual_risk_score?: number
  mitigation_control_ids?: string[]
}

/**
 * Reassess Risk Request
 */
export interface ReassessRiskRequest {
  likelihood: number
  impact_severity: string
  inherent_risk_score: number
  residual_risk_score: number
}
