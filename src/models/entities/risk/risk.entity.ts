import { Organisation } from './../organisation/organisation.entity'
import { SyncStatus } from './../sync/sync.entity'

/**
 * Risk Category Enum
 */
export enum RiskCategory {
  FINANCIAL = 'Financial',
  OPERATIONAL = 'Operational',
  COMPLIANCE_AND_LEGAL = 'Compliance_and_Legal',
  REPUTATIONAL = 'Reputational',
  PEOPLE_AND_SAFETY = 'People_and_Safety',
  ASSETS_AND_IT = 'Assets_and_IT',
  CYBER = 'Cyber',
  NATURAL = 'Natural',
  HUMAN = 'Human',
  SUPPLY = 'Supply',
}

/**
 * Impact Severity Enum
 */
export enum ImpactSeverity {
  INSIGNIFICANT = 'Insignificant',
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

/**
 * Risk Entity
 */
export interface Risk {
  uuid: string
  organisation_id: string
  risk_category: RiskCategory
  likelihood: number
  impact_severity: ImpactSeverity
  inherent_risk_score: number
  residual_risk_score: number
  mitigation_control_ids?: string[]
  created_by: string
  created_at: string
  updated_by: string
  updated_at: string
  version: number
  sync_status: SyncStatus
  organisation?: Organisation
}

/**
 * Risk Matrix Cell
 */
export interface RiskMatrixCell {
  likelihood: number
  impact: ImpactSeverity
  score: number
  count: number
  color: string
}

/**
 * Risk Assessment Data
 */
export interface RiskAssessment {
  likelihood: number
  impact_severity: ImpactSeverity
  inherent_risk_score: number
  residual_risk_score: number
}

/**
 * Risk Stats
 */
export interface RiskStats {
  total: number
  critical: number
  high: number
  medium: number
  low: number
  mitigated: number
  byCategory: Record<string, number>
  bySeverity: Record<string, number>
}
