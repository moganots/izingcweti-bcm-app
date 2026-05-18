// src/services/db/Database.ts
import Dexie, { Table } from 'dexie'
import type { Settings } from '../../models/entities/settings/settings.entity'
import {
  User,
  Organisation,
  BusinessUnit,
  Department,
  Risk,
  Incident,
  Workflow,
  AuditLog,
  ComplianceRecord,
  PendingChange,
  SyncConflict,
  SyncMetadata,
  CacheEntry
} from '../../models/entities'
import type { Document } from '../../models/entities/organisation/organisation.entity'
import type { Notification } from '../../models/entities/notification/notification.entity'

export class BCMDatabase extends Dexie {
  // Tables
  users!: Table<User, string>
  organisations!: Table<Organisation, string>
  businessUnits!: Table<BusinessUnit, string>
  departments!: Table<Department, string>
  documents!: Table<Document, string>
  risks!: Table<Risk, string>
  incidents!: Table<Incident, string>
  workflows!: Table<Workflow, string>
  notifications!: Table<Notification, string>
  auditLogs!: Table<AuditLog, string>
  complianceRecords!: Table<ComplianceRecord, string>
  settings!: Table<Settings, string>
  cache!: Table<CacheEntry, string>
  pendingChanges!: Table<PendingChange, string>
  syncConflicts!: Table<SyncConflict, string>
  syncMetadata!: Table<SyncMetadata, string>

  private static instance: BCMDatabase | null = null

  constructor() {
    super('BCMDatabase')

    // Version 1: Initial schema
    this.version(1).stores({
      users: 'uuid, email, organisation_id, role, is_active, sync_status',
      organisations: 'uuid, name, industry_type, sync_status',
      businessUnits: 'uuid, name, organisation_id, criticality_score, sync_status',
      departments: 'uuid, name, business_id, sync_status',
      documents: 'uuid, title, document_type, status, organisation_id, uploaded_by, sync_status',
      risks: 'uuid, organisation_id, risk_category, impact_severity, sync_status',
      incidents: 'uuid, organisation_id, incident_severity, sync_status',
      workflows: 'uuid, workflow_type, workflow_state, assigned_to, sync_status',
      notifications: 'uuid, recipient_id, status, sync_status',
      auditLogs: 'uuid, user_id, organisation_id, action, audit_category, created_at, sync_status',
      complianceRecords: 'uuid, organisation_id, compliance_standard, compliance_status, sync_status',
      settings: 'uuid, user_id, organisation_id, is_system_default, sync_status',
      cache: 'key, expires_at, tags, sync_status',
      pendingChanges: 'uuid, entity_type, entity_id, operation_type, priority, attempts, sync_status',
      syncConflicts: 'uuid, entity_id, entity_type, conflict_type, resolved, sync_status',
      syncMetadata: 'key, value, sync_status',
    })

    // Version 2: Add hit_count index to cache
    this.version(2).stores({
      cache: 'key, expires_at, tags, hit_count, sync_status',
    }).upgrade(async (tx) => {
      // Migration logic if needed
    })
  }

  static getInstance(): BCMDatabase {
    if (!BCMDatabase.instance) {
      BCMDatabase.instance = new BCMDatabase()
    }
    return BCMDatabase.instance
  }

  async initialize(): Promise<void> {
    await this.open()
  }

  isDbOpen(): boolean {
    return this.isOpen()
  }

  getName(): string {
    return this.name
  }

  getVersion(): number {
    return this.verno
  }

  getTableNames(): string[] {
    return Object.keys(this._allTables)
  }

  getRepository(tableName: string): any {
    const table = (this as any)[tableName]
    if (!table) {
      console.warn(`Table ${tableName} not found`)
      return null
    }
    
    // Return a repository wrapper with common methods
    return {
      table,
      findById: async (id: string) => await table.get(id),
      findAll: async () => await table.toArray(),
      findOne: async (filter: Record<string, any>) => {
        const [key, value] = Object.entries(filter)[0]!
        return await table.where(key).equals(value).first()
      },
      findMany: async (filter: Record<string, any>) => {
        const [key, value] = Object.entries(filter)[0]!
        return await table.where(key).equals(value).toArray()
      },
      create: async (data: any) => {
        const id = data.uuid || crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`
        const record = { ...data, uuid: id }
        await table.add(record)
        return record
      },
      update: async (id: string, data: any) => {
        await table.update(id, data)
        return await table.get(id)
      },
      upsert: async (data: any) => {
        const existing = await table.get(data.uuid)
        if (existing) {
          await table.update(data.uuid, data)
          return await table.get(data.uuid)
        } else {
          await table.add(data)
          return data
        }
      },
      delete: async (id: string) => {
        await table.delete(id)
      },
      clearAll: async () => {
        await table.clear()
      },
      // PendingChanges specific methods
      getOrderedByPriority: async () => {
        return await table.orderBy('priority').toArray()
      },
      getPendingCount: async () => {
        return await table.where('sync_status').equals('PENDING').count()
      },
      incrementAttempts: async (id: string) => {
        const record = await table.get(id)
        if (record) {
          const attempts = (record.attempts || 0) + 1
          await table.update(id, { attempts })
        }
      },
      // SyncMetadata specific methods
      getLastSyncToken: async () => {
        const record = await table.where('key').equals('last_sync_token').first()
        return record?.value || null
      },
      setLastSyncToken: async (token: string) => {
        const existing = await table.where('key').equals('last_sync_token').first()
        if (existing) {
          await table.update(existing.uuid, { value: token, updated_at: new Date().toISOString() })
        } else {
          await table.add({
            uuid: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
            key: 'last_sync_token',
            value: token,
            sync_status: 'SYNCED',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      },
      getLastSyncTime: async () => {
        const record = await table.where('key').equals('last_sync_time').first()
        return record?.value || null
      },
      setLastSyncTime: async (time: string) => {
        const existing = await table.where('key').equals('last_sync_time').first()
        if (existing) {
          await table.update(existing.uuid, { value: time, updated_at: new Date().toISOString() })
        } else {
          await table.add({
            uuid: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
            key: 'last_sync_time',
            value: time,
            sync_status: 'SYNCED',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      },
      getByKey: async (key: string) => {
        return await table.where('key').equals(key).first()
      },
    }
  }
}

// Export singleton instance
export const db = BCMDatabase.getInstance()