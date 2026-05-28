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
