import type { Table } from 'dexie'
import { BaseRepository } from '../BaseRepository'
import {
  Risk,
  RiskCategory,
  RiskStatus,
  RiskTreatment,
  RiskLikelihoodLevel,
  RiskImpactLevel,
  RiskScoreLevel,
  RiskStatsDto,
  RiskComprehensiveAnalytics,
  RiskHeatmapData,
  getRiskScoreLevel,
  RiskHeatmapCell,
  getRiskColor,
} from './../../../../models/entities'

/**
 * Risk Repository
 * Handles CRUD operations for Risk entities with camelCase field names
 * Aligned with risk.entity.ts
 */
export class RiskRepository extends BaseRepository<Risk> {
  constructor(table: Table<Risk, string>) {
    super(table, 'risks')
  }

  /**
   * Find risks by organisation
   */
  async findByOrganisation(organisationId: string): Promise<Risk[]> {
    return this.findMany({ organisationId } as Partial<Risk>)
  }

  /**
   * Find risks by category
   */
  async findByCategory(category: RiskCategory): Promise<Risk[]> {
    return this.findMany({ riskCategory: category } as Partial<Risk>)
  }

  /**
   * Find risks by status
   */
  async findByStatus(status: RiskStatus): Promise<Risk[]> {
    return this.findMany({ status } as Partial<Risk>)
  }

  /**
   * Find risks by treatment strategy
   */
  async findByTreatment(treatment: RiskTreatment): Promise<Risk[]> {
    return this.findMany({ treatmentStrategy: treatment } as Partial<Risk>)
  }

  /**
   * Find risks by assigned user
   */
  async findByAssignedTo(assignedTo: string): Promise<Risk[]> {
    return this.findMany({ assignedTo } as Partial<Risk>)
  }

  /**
   * Find risks by inherent score level
   */
  async findByInherentLevel(level: RiskScoreLevel): Promise<Risk[]> {
    const all = await this.findAll()
    return all.filter((risk) => {
      const score = risk.inherentRiskScore || 0
      return getRiskScoreLevel(score) === level
    })
  }

  /**
   * Find high risks (inherent score >= threshold)
   */
  async findHigh(threshold: number = 7): Promise<Risk[]> {
    return this.table
      .filter((risk) => (risk.inherentRiskScore || 0) >= threshold)
      .toArray()
  }

  /**
   * Find critical risks (inherent score >= 8.5)
   */
  async findCritical(): Promise<Risk[]> {
    return this.findHigh(8.5)
  }

  /**
   * Find extreme risks (inherent score >= 20)
   */
  async findExtreme(): Promise<Risk[]> {
    return this.findHigh(20)
  }

  /**
   * Find risks that have been mitigated (have controls)
   */
  async findMitigated(): Promise<Risk[]> {
    return this.table
      .filter((risk) => {
        const controls = risk.mitigatingControls
        return Array.isArray(controls) && controls.length > 0
      })
      .toArray()
  }

  /**
   * Find risks needing mitigation (high residual score, no controls)
   */
  async findNeedingMitigation(threshold: number = 5): Promise<Risk[]> {
    return this.table
      .filter((risk) => {
        const residualScore = risk.residualRiskScore || 0
        const controls = risk.mitigatingControls
        return residualScore >= threshold && (!controls || controls.length === 0)
      })
      .toArray()
  }

  /**
   * Find risks by inherent score range
   */
  async findByInherentScoreRange(minScore: number, maxScore: number): Promise<Risk[]> {
    return this.table
      .filter((risk) => {
        const score = risk.inherentRiskScore || 0
        return score >= minScore && score <= maxScore
      })
      .toArray()
  }

  /**
   * Find risks by residual score range
   */
  async findByResidualScoreRange(minScore: number, maxScore: number): Promise<Risk[]> {
    return this.table
      .filter((risk) => {
        const score = risk.residualRiskScore || 0
        return score >= minScore && score <= maxScore
      })
      .toArray()
  }

  /**
   * Find risks with overdue reviews
   */
  async findOverdueReviews(): Promise<Risk[]> {
    const today = new Date()
    return this.table
      .filter((risk) => {
        if (!risk.reviewDate) return false
        const reviewDate = risk.reviewDate instanceof Date ? risk.reviewDate : new Date(risk.reviewDate)
        return reviewDate < today && risk.status !== RiskStatus.CLOSED
      })
      .toArray()
  }

  /**
   * Find risks pending approval
   */
  async findPendingApproval(): Promise<Risk[]> {
    return this.table
      .filter((risk) => {
        return risk.requiresApproval === true && !risk.approvedAt
      })
      .toArray()
  }

  /**
   * Find open risks (not closed)
   */
  async findOpen(): Promise<Risk[]> {
    return this.table
      .filter((risk) => risk.status !== RiskStatus.CLOSED)
      .toArray()
  }

  /**
   * Find closed risks
   */
  async findClosed(): Promise<Risk[]> {
    return this.findByStatus(RiskStatus.CLOSED)
  }

  /**
   * Find risks by likelihood level
   */
  async findByLikelihoodLevel(level: RiskLikelihoodLevel): Promise<Risk[]> {
    return this.findMany({ inherentLikelihoodLevel: level } as Partial<Risk>)
  }

  /**
   * Find risks by impact level
   */
  async findByImpactLevel(level: RiskImpactLevel): Promise<Risk[]> {
    return this.findMany({ inherentImpactLevel: level } as Partial<Risk>)
  }

  /**
   * Find risks with risk owner
   */
  async findWithRiskOwner(): Promise<Risk[]> {
    return this.table
      .filter((risk) => risk.riskOwner !== undefined && risk.riskOwner !== null)
      .toArray()
  }

  /**
   * Find risks by risk owner ID
   */
  async findByRiskOwner(userId: string): Promise<Risk[]> {
    return this.table
      .filter((risk) => risk.riskOwner?.userId === userId)
      .toArray()
  }

  /**
   * Search risks by title or description
   */
  async search(query: string): Promise<Risk[]> {
    const lower = query.toLowerCase()
    const all = await this.findAll()
    return all.filter((risk) =>
      risk.title?.toLowerCase().includes(lower) ||
      risk.description?.toLowerCase().includes(lower)
    )
  }

  /**
   * Get risk statistics
   * Returns stats matching RiskStatsDto
   */
  async getStats(organisationId?: string): Promise<RiskStatsDto> {
    let all = await this.findAll()
    if (organisationId) {
      all = all.filter((r) => r.organisationId === organisationId)
    }

    const byStatus: Record<string, number> = {}
    const byCategory: Record<string, number> = {}

    let totalInherent = 0
    let totalResidual = 0
    let highRiskCount = 0
    let mediumRiskCount = 0
    let lowRiskCount = 0
    let overdueReviews = 0
    let pendingApprovals = 0
    let risksWithResidual = 0

    for (const risk of all) {
      // Count by status
      const status = risk.status || RiskStatus.IDENTIFIED
      byStatus[status] = (byStatus[status] || 0) + 1

      // Count by category
      const category = risk.riskCategory || 'OTHER'
      byCategory[category] = (byCategory[category] || 0) + 1

      // Score calculations
      const inherentScore = risk.inherentRiskScore || 0
      totalInherent += inherentScore

      // High/Medium/Low counts based on inherent score (0-10 scale)
      if (inherentScore >= 8.5) {
        highRiskCount++
      } else if (inherentScore >= 5) {
        mediumRiskCount++
      } else {
        lowRiskCount++
      }

      // Residual score
      const residualScore = risk.residualRiskScore || 0
      if (residualScore > 0) {
        totalResidual += residualScore
        risksWithResidual++
      }

      // Overdue reviews
      if (risk.reviewDate) {
        const reviewDate = risk.reviewDate instanceof Date ? risk.reviewDate : new Date(risk.reviewDate)
        if (reviewDate < new Date() && risk.status !== RiskStatus.CLOSED) {
          overdueReviews++
        }
      }

      // Pending approvals
      if (risk.requiresApproval && !risk.approvedAt) {
        pendingApprovals++
      }
    }

    const averageInherentScore = all.length > 0 ? totalInherent / all.length : 0
    const averageResidualScore = risksWithResidual > 0 ? totalResidual / risksWithResidual : 0
    const riskReductionPercentage = this.calculateRiskReduction(all)

    return {
      total: all.length,
      byStatus,
      byCategory,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      averageInherentScore: Math.round(averageInherentScore * 100) / 100,
      averageResidualScore: Math.round(averageResidualScore * 100) / 100,
      riskReductionPercentage: Math.round(riskReductionPercentage * 100) / 100,
      overdueReviews,
      pendingApprovals,
    }
  }

  /**
   * Get comprehensive risk analytics
   */
  async getComprehensiveAnalytics(organisationId?: string): Promise<RiskComprehensiveAnalytics> {
    let all = await this.findAll()
    if (organisationId) {
      all = all.filter((r) => r.organisationId === organisationId)
    }

    const byStatus: Record<string, number> = {}
    const byCategory: Record<string, number> = {}
    const byTreatment: Record<string, number> = {}

    let totalInherent = 0
    let totalResidual = 0
    let risksWithResidual = 0
    let highRiskCount = 0
    let mediumRiskCount = 0
    let lowRiskCount = 0
    let overdueReviews = 0
    let pendingApprovals = 0
    let openRisks = 0
    let closedRisks = 0

    for (const risk of all) {
      // Count by status
      const status = risk.status || RiskStatus.IDENTIFIED
      byStatus[status] = (byStatus[status] || 0) + 1

      // Count by category
      const category = risk.riskCategory || 'OTHER'
      byCategory[category] = (byCategory[category] || 0) + 1

      // Count by treatment
      const treatment = risk.treatmentStrategy || 'NOT_SET'
      byTreatment[treatment] = (byTreatment[treatment] || 0) + 1

      // Score calculations
      const inherentScore = risk.inherentRiskScore || 0
      totalInherent += inherentScore

      const residualScore = risk.residualRiskScore || 0
      if (residualScore > 0) {
        totalResidual += residualScore
        risksWithResidual++
      }

      // Risk level counts
      if (inherentScore >= 8.5) {
        highRiskCount++
      } else if (inherentScore >= 5) {
        mediumRiskCount++
      } else {
        lowRiskCount++
      }

      // Overdue reviews
      if (risk.reviewDate) {
        const reviewDate = risk.reviewDate instanceof Date ? risk.reviewDate : new Date(risk.reviewDate)
        if (reviewDate < new Date() && risk.status !== RiskStatus.CLOSED) {
          overdueReviews++
        }
      }

      // Pending approvals
      if (risk.requiresApproval && !risk.approvedAt) {
        pendingApprovals++
      }

      // Open/Closed
      if (risk.status === RiskStatus.CLOSED) {
        closedRisks++
      } else {
        openRisks++
      }
    }

    const averageInherentScore = all.length > 0 ? totalInherent / all.length : 0
    const averageResidualScore = risksWithResidual > 0 ? totalResidual / risksWithResidual : 0
    const riskReductionPercentage = this.calculateRiskReduction(all)

    return {
      totalRisks: all.length,
      byStatus,
      byCategory,
      byTreatment,
      averageInherentScore: Math.round(averageInherentScore * 100) / 100,
      averageResidualScore: Math.round(averageResidualScore * 100) / 100,
      riskReductionPercentage: Math.round(riskReductionPercentage * 100) / 100,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      overdueReviews,
      pendingApprovals,
      openRisks,
      closedRisks,
    }
  }

  /**
   * Get risk heat map data
   * Returns RiskHeatmapData structure
   */
  async getHeatMapData(organisationId?: string): Promise<RiskHeatmapData> {
    let all = await this.findAll()
    if (organisationId) {
      all = all.filter((r) => r.organisationId === organisationId)
    }

    // Define impact and likelihood levels
    const impactLevels = [
      RiskImpactLevel.INSIGNIFICANT,
      RiskImpactLevel.MINOR,
      RiskImpactLevel.MODERATE,
      RiskImpactLevel.MAJOR,
      RiskImpactLevel.SEVERE,
      RiskImpactLevel.CATASTROPHIC,
    ]

    const likelihoodLevels = [
      RiskLikelihoodLevel.RARE,
      RiskLikelihoodLevel.UNLIKELY,
      RiskLikelihoodLevel.POSSIBLE,
      RiskLikelihoodLevel.LIKELY,
      RiskLikelihoodLevel.ALMOST_CERTAIN,
    ]

    // Map enum to numeric values for matrix
    const likelihoodValues: Record<RiskLikelihoodLevel, number> = {
      [RiskLikelihoodLevel.RARE]: 1,
      [RiskLikelihoodLevel.UNLIKELY]: 2,
      [RiskLikelihoodLevel.POSSIBLE]: 3,
      [RiskLikelihoodLevel.LIKELY]: 4,
      [RiskLikelihoodLevel.ALMOST_CERTAIN]: 5,
    }

    const impactValues: Record<RiskImpactLevel, number> = {
      [RiskImpactLevel.INSIGNIFICANT]: 1,
      [RiskImpactLevel.MINOR]: 2,
      [RiskImpactLevel.MODERATE]: 3,
      [RiskImpactLevel.MAJOR]: 4,
      [RiskImpactLevel.SEVERE]: 5,
      [RiskImpactLevel.CATASTROPHIC]: 6,
    }

    // Initialize matrix
    const matrix: RiskHeatmapCell[][] = []
    let criticalRisks = 0
    let highRisks = 0
    let mediumRisks = 0
    let lowRisks = 0

    for (let i = 0; i < impactLevels.length; i++) {
      matrix[i] = []
      for (let j = 0; j < likelihoodLevels.length; j++) {
        const impactLevel = impactLevels[i]!
        const likelihoodLevel = likelihoodLevels[j]!

        // Count risks in this cell
        const risksInCell = all.filter((risk) => {
          return risk.inherentImpactLevel === impactLevel &&
            risk.inherentLikelihoodLevel === likelihoodLevel
        })

        // Calculate color based on risk level
        const impactValue = impactValues[impactLevel] || 1
        const likelihoodValue = likelihoodValues[likelihoodLevel] || 1
        const riskScore = impactValue * likelihoodValue
        const color = getRiskColor(riskScore)

        // Update risk level counts
        const riskLevel = getRiskScoreLevel(riskScore)
        if (riskLevel === RiskScoreLevel.EXTREME) criticalRisks++
        else if (riskLevel === RiskScoreLevel.HIGH) highRisks++
        else if (riskLevel === RiskScoreLevel.MEDIUM) mediumRisks++
        else lowRisks++

        matrix[i]![j] = {
          likelihoodLevel: j + 1,
          impactLevel: i + 1,
          count: risksInCell.length,
          risks: risksInCell.map((r) => ({
            uuid: r.uuid,
            title: r.title,
            category: r.riskCategory || 'OTHER',
            score: r.inherentRiskScore || 0,
            status: r.status || RiskStatus.IDENTIFIED,
          })),
          color,
        }
      }
    }

    // Get categories
    const categories = all
      .map((r) => r.riskCategory || 'OTHER')
      .filter((value, index, self) => self.indexOf(value) === index)

    return {
      categories,
      inherent: all.map((r) => r.inherentRiskScore || 0),
      residual: all.map((r) => r.residualRiskScore || 0),
      matrix,
      summary: {
        totalRisks: all.length,
        criticalRisks,
        highRisks,
        mediumRisks,
        lowRisks,
      },
    }
  }

  /**
   * Get risk reduction statistics
   */
  async getRiskReductionStats(): Promise<{
    avgReduction: number
    maxReduction: number
    minReduction: number
    totalReduction: number
    reductionPercentage: number
  }> {
    const all = await this.findAll()
    if (all.length === 0) {
      return {
        avgReduction: 0,
        maxReduction: 0,
        minReduction: 0,
        totalReduction: 0,
        reductionPercentage: 0,
      }
    }

    const reductions = all.map((r) => (r.inherentRiskScore || 0) - (r.residualRiskScore || 0))
    const totalReduction = reductions.reduce((a, b) => a + b, 0)
    const totalInherent = all.reduce((sum, r) => sum + (r.inherentRiskScore || 0), 0)

    return {
      avgReduction: Math.round((totalReduction / all.length) * 100) / 100,
      maxReduction: Math.max(...reductions),
      minReduction: Math.min(...reductions),
      totalReduction: Math.round(totalReduction * 100) / 100,
      reductionPercentage: totalInherent > 0 ? Math.round((totalReduction / totalInherent) * 100 * 100) / 100 : 0,
    }
  }

  /**
   * Get risk distribution by category and status
   */
  async getRiskDistribution(organisationId?: string): Promise<{
    byCategory: Record<RiskCategory, number>
    byStatus: Record<RiskStatus, number>
    byTreatment: Record<RiskTreatment, number>
  }> {
    let all = await this.findAll()
    if (organisationId) {
      all = all.filter((r) => r.organisationId === organisationId)
    }

    const byCategory: Record<RiskCategory, number> = {
      [RiskCategory.FINANCIAL]: 0,
      [RiskCategory.OPERATIONAL]: 0,
      [RiskCategory.COMPLIANCE]: 0,
      [RiskCategory.REPUTATIONAL]: 0,
      [RiskCategory.STRATEGIC]: 0,
      [RiskCategory.CYBERSECURITY]: 0,
      [RiskCategory.NATURAL_DISASTER]: 0,
      [RiskCategory.TECHNOLOGY_FAILURE]: 0,
      [RiskCategory.HUMAN_ERROR]: 0,
      [RiskCategory.THIRD_PARTY]: 0,
      [RiskCategory.OTHER]: 0
    }

    const byStatus: Record<RiskStatus, number> = {
      [RiskStatus.IDENTIFIED]: 0,
      [RiskStatus.ASSESSING]: 0,
      [RiskStatus.APPROVED]: 0,
      [RiskStatus.TREATING]: 0,
      [RiskStatus.MONITORING]: 0,
      [RiskStatus.CLOSED]: 0,
      [RiskStatus.REJECTED]: 0,
    }

    const byTreatment: Record<RiskTreatment, number> = {
      [RiskTreatment.AVOID]: 0,
      [RiskTreatment.MITIGATE]: 0,
      [RiskTreatment.TRANSFER]: 0,
      [RiskTreatment.ACCEPT]: 0,
      [RiskTreatment.EXPLOIT]: 0,
    }

    for (const risk of all) {
      const category = risk.riskCategory || RiskCategory.OTHER
      byCategory[category] = (byCategory[category] || 0) + 1

      const status = risk.status || RiskStatus.IDENTIFIED
      byStatus[status] = (byStatus[status] || 0) + 1

      const treatment = risk.treatmentStrategy || RiskTreatment.ACCEPT
      byTreatment[treatment] = (byTreatment[treatment] || 0) + 1
    }

    return { byCategory, byStatus, byTreatment }
  }

  /**
   * Get risks by review date range
   */
  async findByReviewDateRange(startDate: Date, endDate: Date): Promise<Risk[]> {
    const all = await this.findAll()
    return all.filter((risk) => {
      if (!risk.reviewDate) return false
      const reviewDate = risk.reviewDate instanceof Date ? risk.reviewDate : new Date(risk.reviewDate)
      return reviewDate >= startDate && reviewDate <= endDate
    })
  }

  /**
   * Get risks with mitigation controls effectiveness
   */
  async getMitigationEffectiveness(): Promise<{
    avgEffectiveness: number
    maxEffectiveness: number
    minEffectiveness: number
    risksWithControls: number
    totalControls: number
  }> {
    const all = await this.findAll()
    let totalEffectiveness = 0
    let totalControls = 0
    let risksWithControls = 0

    for (const risk of all) {
      const controls = risk.mitigatingControls || []
      if (controls.length > 0) {
        risksWithControls++
        totalControls += controls.length
        for (const control of controls) {
          totalEffectiveness += control.effectiveness || 0
        }
      }
    }

    const avgEffectiveness = totalControls > 0 ? totalEffectiveness / totalControls : 0

    return {
      avgEffectiveness: Math.round(avgEffectiveness * 100) / 100,
      maxEffectiveness: 100,
      minEffectiveness: 0,
      risksWithControls,
      totalControls,
    }
  }

  /**
   * Calculate risk reduction percentage for a collection of risks
   */
  private calculateRiskReduction(risks: Risk[]): number {
    if (risks.length === 0) return 0

    let totalInherent = 0
    let totalResidual = 0
    let risksWithResidual = 0

    for (const risk of risks) {
      totalInherent += risk.inherentRiskScore || 0
      if (risk.residualRiskScore !== undefined && risk.residualRiskScore !== null) {
        totalResidual += risk.residualRiskScore
        risksWithResidual++
      }
    }

    if (risksWithResidual === 0 || totalInherent === 0) return 0

    const averageInherent = totalInherent / risks.length
    const averageResidual = totalResidual / risksWithResidual

    return ((averageInherent - averageResidual) / averageInherent) * 100
  }
}