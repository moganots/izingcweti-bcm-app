import type { Table } from 'dexie'
import { BaseRepository } from './BaseRepository'
import type { Risk } from '../../../models/entities/risk.entity'

/**
 * Risk Repository
 */
export class RiskRepository extends BaseRepository<Risk> {
  constructor(table: Table<Risk, string>) {
    super(table, 'risks')
  }

  /**
   * Find risks by organisation
   */
  async findByOrganisation(organisationId: string): Promise<Risk[]> {
    return this.findMany({ organisation_id: organisationId } as Partial<Risk>)
  }

  /**
   * Find risks by category
   */
  async findByCategory(category: string): Promise<Risk[]> {
    return this.findMany({ risk_category: category } as Partial<Risk>)
  }

  /**
   * Find risks by impact severity
   */
  async findByImpactSeverity(severity: string): Promise<Risk[]> {
    return this.findMany({ impact_severity: severity } as Partial<Risk>)
  }

  /**
   * Find high risks (inherent score >= threshold)
   */
  async findHigh(threshold: number = 7): Promise<Risk[]> {
    return this.table.filter((risk) => risk.inherent_risk_score >= threshold).toArray()
  }

  /**
   * Find critical risks (inherent score >= 8.5)
   */
  async findCritical(): Promise<Risk[]> {
    return this.findHigh(8.5)
  }

  /**
   * Find risks that have been mitigated (have controls)
   */
  async findMitigated(): Promise<Risk[]> {
    return this.table
      .filter((risk) => risk.mitigation_control_ids! && risk.mitigation_control_ids?.length > 0)
      .toArray()
  }

  /**
   * Find risks needing mitigation (high residual score, no controls)
   */
  async findNeedingMitigation(threshold: number = 5): Promise<Risk[]> {
    return this.table
      .filter(
        (risk) =>
          risk.residual_risk_score >= threshold &&
          (!risk.mitigation_control_ids || risk.mitigation_control_ids.length === 0)
      )
      .toArray()
  }

  /**
   * Find risks by score range
   */
  async findByScoreRange(minScore: number, maxScore: number): Promise<Risk[]> {
    return this.table
      .filter(
        (risk) => risk.inherent_risk_score >= minScore && risk.inherent_risk_score <= maxScore
      )
      .toArray()
  }

  /**
   * Get risk statistics
   */
  async getStats(): Promise<{
    total: number
    critical: number
    high: number
    medium: number
    low: number
    mitigated: number
    byCategory: Record<string, number>
    bySeverity: Record<string, number>
    avgInherentScore: number
    avgResidualScore: number
  }> {
    const all = await this.findAll()
    const byCategory: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}
    let totalInherent = 0
    let totalResidual = 0

    all.forEach((risk) => {
      byCategory[risk.risk_category] = (byCategory[risk.risk_category] || 0) + 1
      bySeverity[risk.impact_severity] = (bySeverity[risk.impact_severity] || 0) + 1
      totalInherent += risk.inherent_risk_score
      totalResidual += risk.residual_risk_score
    })

    return {
      total: all.length,
      critical: all.filter((r) => r.inherent_risk_score >= 8.5).length,
      high: all.filter((r) => r.inherent_risk_score >= 7 && r.inherent_risk_score < 8.5).length,
      medium: all.filter((r) => r.inherent_risk_score >= 5 && r.inherent_risk_score < 7).length,
      low: all.filter((r) => r.inherent_risk_score < 5).length,
      mitigated: all.filter((r) => r.mitigation_control_ids && r.mitigation_control_ids.length > 0)
        .length,
      byCategory,
      bySeverity,
      avgInherentScore: all.length > 0 ? Math.round((totalInherent / all.length) * 100) / 100 : 0,
      avgResidualScore: all.length > 0 ? Math.round((totalResidual / all.length) * 100) / 100 : 0,
    }
  }

  /**
   * Get risk heat map data
   */
  async getHeatMapData(): Promise<Array<{ impact: string; likelihood: number; count: number }>> {
    const all = await this.findAll()
    const heatMap: Array<{ impact: string; likelihood: number; count: number }> = []

    const impacts = ['Insignificant', 'Low', 'Medium', 'High', 'Critical']
    const likelihoods = [0.2, 0.4, 0.6, 0.8, 1.0]

    impacts.forEach((impact) => {
      likelihoods.forEach((likelihood) => {
        const count = all.filter(
          (r) => r.impact_severity === impact && Math.abs(r.likelihood - likelihood) < 0.2
        ).length
        heatMap.push({ impact, likelihood, count })
      })
    })

    return heatMap
  }

  /**
   * Get risk reduction (difference between inherent and residual)
   */
  async getRiskReductionStats(): Promise<{
    avgReduction: number
    maxReduction: number
    minReduction: number
    totalReduction: number
  }> {
    const all = await this.findAll()
    if (all.length === 0) {
      return { avgReduction: 0, maxReduction: 0, minReduction: 0, totalReduction: 0 }
    }

    const reductions = all.map((r) => r.inherent_risk_score - r.residual_risk_score)

    return {
      avgReduction: Math.round((reductions.reduce((a, b) => a + b, 0) / all.length) * 100) / 100,
      maxReduction: Math.max(...reductions),
      minReduction: Math.min(...reductions),
      totalReduction: Math.round(reductions.reduce((a, b) => a + b, 0) * 100) / 100,
    }
  }
}
