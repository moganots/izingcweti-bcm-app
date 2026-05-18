import type { Table } from 'dexie'
import { BaseRepository } from '../BaseRepository'
import { Incident } from './../../../../models/entities'

/**
 * Incident Repository
 */
export class IncidentRepository extends BaseRepository<Incident> {
  constructor(table: Table<Incident, string>) {
    super(table, 'incidents')
  }

  /**
   * Find incidents by organisation
   */
  async findByOrganisation(organisationId: string): Promise<Incident[]> {
    return this.findMany({ organisation_id: organisationId } as Partial<Incident>)
  }

  /**
   * Find incidents by severity
   */
  async findBySeverity(severity: string): Promise<Incident[]> {
    return this.findMany({ incident_severity: severity } as Partial<Incident>)
  }

  /**
   * Find active (unclosed) incidents
   */
  async findActive(): Promise<Incident[]> {
    return this.table.filter((incident) => !incident.closed_at).toArray()
  }

  /**
   * Find closed incidents
   */
  async findClosed(): Promise<Incident[]> {
    return this.table.filter((incident) => !!incident.closed_at).toArray()
  }

  /**
   * Find critical active incidents
   */
  async findCritical(): Promise<Incident[]> {
    return this.table
      .filter((incident) => incident.incident_severity === 'Critical' && !incident.closed_at)
      .toArray()
  }

  /**
   * Find high severity active incidents
   */
  async findHighSeverity(): Promise<Incident[]> {
    return this.table
      .filter(
        (incident) =>
          (incident.incident_severity === 'Critical' || incident.incident_severity === 'High') &&
          !incident.closed_at
      )
      .toArray()
  }

  /**
   * Find incidents by BCP activated
   */
  async findByBCP(bcpId: string): Promise<Incident[]> {
    return this.findMany({ business_continuity_plan_id_activated: bcpId } as Partial<Incident>)
  }

  /**
   * Find incidents declared within date range
   */
  async findByDateRange(startDate: string, endDate: string): Promise<Incident[]> {
    return this.table
      .filter((incident) => incident.declared_at >= startDate && incident.declared_at <= endDate)
      .toArray()
  }

  /**
   * Find recent incidents
   */
  async findRecent(limit: number = 10): Promise<Incident[]> {
    return this.table.orderBy('declared_at').reverse().limit(limit).toArray()
  }

  /**
   * Get incident statistics
   */
  async getStats(): Promise<{
    total: number
    active: number
    closed: number
    critical: number
    bySeverity: Record<string, number>
  }> {
    const all = await this.findAll()
    const bySeverity: Record<string, number> = {}

    all.forEach((incident) => {
      bySeverity[incident.incident_severity] = (bySeverity[incident.incident_severity] || 0) + 1
    })

    return {
      total: all.length,
      active: all.filter((i) => !i.closed_at).length,
      closed: all.filter((i) => !!i.closed_at).length,
      critical: all.filter((i) => i.incident_severity === 'Critical' && !i.closed_at).length,
      bySeverity,
    }
  }

  /**
   * Get average resolution time (in hours)
   */
  async getAverageResolutionTime(): Promise<number> {
    const closed = await this.findClosed()
    if (closed.length === 0) return 0

    const totalHours = closed.reduce((sum, incident) => {
      const declared = new Date(incident.declared_at).getTime()
      const closedTime = new Date(incident.closed_at!).getTime()
      return sum + (closedTime - declared) / (1000 * 60 * 60)
    }, 0)

    return Math.round((totalHours / closed.length) * 100) / 100
  }
}
