import { ComplianceOverview } from './bcm.types'

/**
 * Dashboard data
 */
export interface DashboardData {
    kpis: DashboardKPIs
    recentIncidents: any[]
    upcomingTests: any[]
    pendingWorkflows: any[]
    complianceOverview: ComplianceOverview[]
    riskTrends: RiskTrend[]
}

export interface DashboardKPIs {
    activeBCPs: number
    activeIncidents: number
    highRisks: number
    pendingApprovals: number
    complianceRate: number
    maturityScore: number
}

export interface RiskTrend {
    period: string
    label: string
    highRisks: number
    mediumRisks: number
    lowRisks: number
}
