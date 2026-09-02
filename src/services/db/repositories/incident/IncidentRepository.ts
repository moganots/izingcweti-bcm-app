import type { Table } from 'dexie'
import { BaseRepository } from '../BaseRepository'
import {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  EscalationLevel,
  EscalationStatus
} from './../../../../models/entities'

/**
 * Incident Repository
 * Handles CRUD operations for Incident entities with camelCase field names
 * Aligned with incident.entity.ts
 */
export class IncidentRepository extends BaseRepository<Incident> {
  constructor(table: Table<Incident, string>) {
    super(table, 'incidents')
  }

  /**
   * Find incidents by organisation
   */
  async findByOrganisation(organisationId: string): Promise<Incident[]> {
    return this.findMany({ organisationId } as Partial<Incident>)
  }

  /**
   * Find incidents by severity
   */
  async findBySeverity(severity: IncidentSeverity): Promise<Incident[]> {
    return this.findMany({ incidentSeverity: severity } as Partial<Incident>)
  }

  /**
   * Find incidents by status
   */
  async findByStatus(status: IncidentStatus): Promise<Incident[]> {
    return this.findMany({ incidentStatus: status } as Partial<Incident>)
  }

  /**
   * Find incidents by escalation level
   */
  async findByEscalationLevel(level: EscalationLevel): Promise<Incident[]> {
    return this.findMany({ escalationLevel: level } as Partial<Incident>)
  }

  /**
   * Find active (unclosed) incidents
   */
  async findActive(): Promise<Incident[]> {
    return this.table
      .filter((incident) => !incident.closedAt)
      .toArray()
  }

  /**
   * Find closed incidents
   */
  async findClosed(): Promise<Incident[]> {
    return this.table
      .filter((incident) => !!incident.closedAt)
      .toArray()
  }

  /**
   * Find active incidents by severity
   */
  async findActiveBySeverity(severity: IncidentSeverity): Promise<Incident[]> {
    return this.table
      .filter((incident) =>
        incident.incidentSeverity === severity &&
        !incident.closedAt
      )
      .toArray()
  }

  /**
   * Find critical active incidents
   */
  async findCritical(): Promise<Incident[]> {
    return this.findActiveBySeverity(IncidentSeverity.CRITICAL)
  }

  /**
   * Find high severity active incidents
   */
  async findHighSeverity(): Promise<Incident[]> {
    return this.table
      .filter((incident) =>
        (incident.incidentSeverity === IncidentSeverity.CRITICAL ||
          incident.incidentSeverity === IncidentSeverity.HIGH) &&
        !incident.closedAt
      )
      .toArray()
  }

  /**
   * Find escalated incidents
   */
  async findEscalated(): Promise<Incident[]> {
    return this.table
      .filter((incident) =>
        incident.escalationStatus === EscalationStatus.ESCALATED ||
        incident.escalationLevel !== EscalationLevel.NO_ESCALATION
      )
      .toArray()
  }

  /**
   * Find incidents assigned to a user
   */
  async findByAssignedTo(userId: string): Promise<Incident[]> {
    return this.findMany({ assignedTo: userId } as Partial<Incident>)
  }

  /**
   * Find unassigned incidents
   */
  async findUnassigned(): Promise<Incident[]> {
    return this.table
      .filter((incident) => !incident.assignedTo)
      .toArray()
  }

  /**
   * Find incidents by BCP activated
   */
  async findByBCP(bcpId: string): Promise<Incident[]> {
    return this.findMany({
      businessContinuityPlanIdActivated: bcpId
    } as Partial<Incident>)
  }

  /**
   * Find incidents by root cause search
   */
  async findByRootCause(searchTerm: string): Promise<Incident[]> {
    const all = await this.findAll()
    return all.filter((incident) =>
      incident.rootCause?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  /**
   * Find incidents by title search
   */
  async findByTitle(searchTerm: string): Promise<Incident[]> {
    const all = await this.findAll()
    return all.filter((incident) =>
      incident.incidentTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  /**
   * Find incidents by date range (declared at)
   */
  async findByDateRange(startDate: string | Date, endDate: string | Date): Promise<Incident[]> {
    const start = startDate instanceof Date ? startDate.toISOString().split('T')[0] : (startDate ?? '')
    const end = endDate instanceof Date ? endDate.toISOString().split('T')[0] : (endDate ?? '')

    if (!start || !end) {
      return []
    }

    return this.table
      .filter((incident) => {
        const declaredAt = incident.declaredAt
        if (!declaredAt) return false

        const dateStr = declaredAt instanceof Date ? declaredAt.toISOString().split('T')[0] : String(declaredAt)
        if (!dateStr) return false

        return dateStr >= start && dateStr <= end
      })
      .toArray()
  }

  /**
   * Find incidents by closure date range
   */
  async findByClosedDateRange(startDate: string | Date, endDate: string | Date): Promise<Incident[]> {
    const start = startDate instanceof Date ? startDate.toISOString().split('T')[0] : (startDate ?? '')
    const end = endDate instanceof Date ? endDate.toISOString().split('T')[0] : (endDate ?? '')

    if (!start || !end) {
      return []
    }

    return this.table
      .filter((incident) => {
        const closedAt = incident.closedAt
        if (!closedAt) return false

        const dateStr = closedAt instanceof Date ? closedAt.toISOString().split('T')[0] : String(closedAt)
        if (!dateStr) return false

        return dateStr >= start && dateStr <= end
      })
      .toArray()
  }

  /**
   * Find incidents declared after a specific date
   */
  async findDeclaredAfter(date: string | Date): Promise<Incident[]> {
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : (date ?? '')

    if (!dateStr) {
      return []
    }

    return this.table
      .filter((incident) => {
        const declaredAt = incident.declaredAt
        if (!declaredAt) return false

        const dStr = declaredAt instanceof Date ? declaredAt.toISOString().split('T')[0] : String(declaredAt)
        if (!dStr) return false

        return dStr >= dateStr
      })
      .toArray()
  }

  /**
   * Find recent incidents
   */
  async findRecent(limit: number = 10): Promise<Incident[]> {
    return this.table
      .orderBy('declaredAt')
      .reverse()
      .limit(limit)
      .toArray()
  }

  /**
   * Find incidents with high escalation attempts
   */
  async findWithHighEscalationAttempts(minAttempts: number = 3): Promise<Incident[]> {
    return this.table
      .filter((incident) => (incident.escalationAttempts || 0) >= minAttempts)
      .toArray()
  }

  /**
   * Find incidents that are overdue for resolution
   */
  async findOverdueForResolution(maxHours: number = 24): Promise<Incident[]> {
    const now = new Date()
    const maxAge = new Date(now.getTime() - maxHours * 60 * 60 * 1000)

    return this.table
      .filter((incident) => {
        if (incident.closedAt) return false
        const declaredAt = incident.declaredAt
        if (!declaredAt) return false
        const declaredDate = declaredAt instanceof Date ? declaredAt : new Date(declaredAt)
        return declaredDate < maxAge
      })
      .toArray()
  }

  /**
   * Get incident statistics
   * Returns stats matching IncidentStats interface from incident.entity.ts
   */
  async getStats(): Promise<{
    total: number
    active: number
    closed: number
    critical: number
    high: number
    medium: number
    low: number
    bySeverity: Record<string, number>
    byStatus: Record<string, number>
    avgResolutionTime: number
  }> {
    const all = await this.findAll()
    const bySeverity: Record<string, number> = {}
    const byStatus: Record<string, number> = {}

    let active = 0
    let closed = 0
    let critical = 0
    let high = 0
    let medium = 0
    let low = 0
    let totalResolutionMs = 0
    let resolvedCount = 0

    for (const incident of all) {
      // Count by severity
      const severity = incident.incidentSeverity || 'UNKNOWN'
      bySeverity[severity] = (bySeverity[severity] || 0) + 1

      // Count by status
      const status = incident.incidentStatus || IncidentStatus.OPEN
      byStatus[status] = (byStatus[status] || 0) + 1

      // Count active/closed
      if (incident.closedAt) {
        closed++
        // Calculate resolution time
        const declaredAt = incident.declaredAt
        if (declaredAt) {
          const declaredDate = declaredAt instanceof Date ? declaredAt : new Date(declaredAt)
          const closedDate = incident.closedAt instanceof Date ? incident.closedAt : new Date(incident.closedAt)
          totalResolutionMs += closedDate.getTime() - declaredDate.getTime()
          resolvedCount++
        }
      } else {
        active++
      }

      // Count by severity (active only)
      if (!incident.closedAt) {
        switch (incident.incidentSeverity) {
          case IncidentSeverity.CRITICAL:
            critical++
            break
          case IncidentSeverity.HIGH:
            high++
            break
          case IncidentSeverity.MEDIUM:
            medium++
            break
          case IncidentSeverity.LOW:
            low++
            break
          default:
            break
        }
      }
    }

    const avgResolutionTime = resolvedCount > 0
      ? totalResolutionMs / resolvedCount / (1000 * 60 * 60)
      : 0

    return {
      total: all.length,
      active,
      closed,
      critical,
      high,
      medium,
      low,
      bySeverity,
      byStatus,
      avgResolutionTime: Math.round(avgResolutionTime * 100) / 100,
    }
  }

  /**
   * Get dashboard statistics
   * Returns stats matching IncidentDashboardStats interface
   */
  async getDashboardStats(): Promise<{
    total: number
    active: number
    closed: number
    critical: number
    high: number
    medium: number
    low: number
    averageResolutionHours: number
    byMonth: Array<{ month: string; count: number }>
  }> {
    const all = await this.findAll()
    const stats = await this.getStats()

    // Group by month for trend
    const monthMap: Record<string, number> = {}
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)

    for (const incident of all) {
      const declaredAt = incident.declaredAt
      if (!declaredAt) continue
      const date = declaredAt instanceof Date ? declaredAt : new Date(declaredAt)
      if (date < sixMonthsAgo) continue

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthMap[monthKey] = (monthMap[monthKey] || 0) + 1
    }

    const byMonth = Object.entries(monthMap)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return {
      total: stats.total,
      active: stats.active,
      closed: stats.closed,
      critical: stats.critical,
      high: stats.high,
      medium: stats.medium,
      low: stats.low,
      averageResolutionHours: stats.avgResolutionTime,
      byMonth,
    }
  }

  /**
   * Get average resolution time (in hours)
   */
  async getAverageResolutionTime(): Promise<number> {
    const stats = await this.getStats()
    return stats.avgResolutionTime
  }

  /**
   * Get incidents by escalation level
   */
  async getEscalationDistribution(): Promise<Record<EscalationLevel, number>> {
    const all = await this.findAll()
    const distribution: Record<EscalationLevel, number> = {
      [EscalationLevel.NO_ESCALATION]: 0,
      [EscalationLevel.LEVEL_1_SUPERVISOR]: 0,
      [EscalationLevel.LEVEL_2_DEPARTMENT_HEAD]: 0,
      [EscalationLevel.LEVEL_3_BUSINESS_UNIT_MANAGER]: 0,
      [EscalationLevel.LEVEL_4_EXECUTIVE_DIRECTOR]: 0,
      [EscalationLevel.LEVEL_5_BOARD]: 0,
      [EscalationLevel.CRITICAL]: 0,
    }

    for (const incident of all) {
      const level = incident.escalationLevel || EscalationLevel.NO_ESCALATION
      distribution[level] = (distribution[level] || 0) + 1
    }

    return distribution
  }

  /**
   * Get incidents by severity distribution
   */
  async getSeverityDistribution(): Promise<Record<IncidentSeverity, number>> {
    const all = await this.findAll()
    const distribution: Record<IncidentSeverity, number> = {
      [IncidentSeverity.CRITICAL]: 0,
      [IncidentSeverity.HIGH]: 0,
      [IncidentSeverity.MEDIUM]: 0,
      [IncidentSeverity.LOW]: 0,
      [IncidentSeverity.INFORMATIONAL]: 0,
    }

    for (const incident of all) {
      const severity = incident.incidentSeverity || IncidentSeverity.INFORMATIONAL
      distribution[severity] = (distribution[severity] || 0) + 1
    }

    return distribution
  }

  /**
   * Search incidents by multiple criteria
   */
  async search(params: {
    search?: string
    severity?: IncidentSeverity
    status?: IncidentStatus
    organisationId?: string
    assignedTo?: string
    startDate?: string | Date
    endDate?: string | Date
  }): Promise<Incident[]> {
    let results = await this.findAll()

    // Filter by organisation
    if (params.organisationId) {
      results = results.filter((i) => i.organisationId === params.organisationId)
    }

    // Filter by severity
    if (params.severity) {
      results = results.filter((i) => i.incidentSeverity === params.severity)
    }

    // Filter by status
    if (params.status) {
      results = results.filter((i) => i.incidentStatus === params.status)
    }

    // Filter by assigned to
    if (params.assignedTo) {
      results = results.filter((i) => i.assignedTo === params.assignedTo)
    }

    // Filter by date range
    if (params.startDate) {
      const start = params.startDate instanceof Date ? params.startDate : new Date(params.startDate)
      results = results.filter((i) => {
        const declaredAt = i.declaredAt
        if (!declaredAt) return false
        const date = declaredAt instanceof Date ? declaredAt : new Date(declaredAt)
        return date >= start
      })
    }

    if (params.endDate) {
      const end = params.endDate instanceof Date ? params.endDate : new Date(params.endDate)
      results = results.filter((i) => {
        const declaredAt = i.declaredAt
        if (!declaredAt) return false
        const date = declaredAt instanceof Date ? declaredAt : new Date(declaredAt)
        return date <= end
      })
    }

    // Text search
    if (params.search) {
      const searchLower = params.search.toLowerCase()
      results = results.filter((i) =>
        i.incidentTitle?.toLowerCase().includes(searchLower) ||
        i.rootCause?.toLowerCase().includes(searchLower) ||
        i.resolutionNotes?.toLowerCase().includes(searchLower)
      )
    }

    return results
  }

  /**
   * Get incident count by organisation
   */
  async countByOrganisation(organisationId: string): Promise<number> {
    const incidents = await this.findByOrganisation(organisationId)
    return incidents.length
  }

  /**
   * Get incident count by status
   */
  async countByStatus(status: IncidentStatus): Promise<number> {
    const incidents = await this.findByStatus(status)
    return incidents.length
  }

  /**
   * Get incident count by severity
   */
  async countBySeverity(severity: IncidentSeverity): Promise<number> {
    const incidents = await this.findBySeverity(severity)
    return incidents.length
  }

  /**
   * Get active incident count
   */
  async countActive(): Promise<number> {
    const incidents = await this.findActive()
    return incidents.length
  }

  /**
   * Get closed incident count
   */
  async countClosed(): Promise<number> {
    const incidents = await this.findClosed()
    return incidents.length
  }
}