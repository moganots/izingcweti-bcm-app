import { Table } from "dexie"
import { BaseRepository } from "../BaseRepository"
import { AuditLog } from "./../../../../models/entities"

/**
 * Audit Log Repository
 */
export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor(table: Table<AuditLog, string>) {
    super(table, 'audit_logs')
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.findMany({ user_id: userId } as Partial<AuditLog>)
  }

  async findByOrganisation(orgId: string): Promise<AuditLog[]> {
    return this.findMany({ organisation_id: orgId } as Partial<AuditLog>)
  }

  async findByAction(action: string): Promise<AuditLog[]> {
    return this.findMany({ action } as Partial<AuditLog>)
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.table
      .filter((log) => log.entity_type === entityType && log.entity_id === entityId)
      .toArray()
  }

  async findByDateRange(startDate: string, endDate: string): Promise<AuditLog[]> {
    return this.table
      .filter((log) => log.created_at >= startDate && log.created_at <= endDate)
      .toArray()
  }

  async getRecent(limit: number = 50): Promise<AuditLog[]> {
    return this.table.orderBy('created_at').reverse().limit(limit).toArray()
  }

  async cleanup(daysOld: number = 90): Promise<number> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - daysOld)
    const cutoffStr = cutoff.toISOString()

    const oldLogs = await this.table.filter((log) => log.created_at < cutoffStr).toArray()

    const ids = oldLogs.map((log) => log.uuid)
    await this.deleteMany(ids)

    return ids.length
  }
}
