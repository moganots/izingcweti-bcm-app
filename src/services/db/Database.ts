import Dexie, { Table } from 'dexie'
import { Settings } from 'http2'
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
  cache!: Table<CacheEntry, string> // <-- Add cache table
  pendingChanges!: Table<PendingChange, string>
  syncConflicts!: Table<SyncConflict, string>
  syncMetadata!: Table<SyncMetadata, string>

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
      complianceRecords:
        'uuid, organisation_id, compliance_standard, compliance_status, sync_status',
      settings: 'uuid, user_id, organisation_id, is_system_default, sync_status',
      cache: 'key, expires_at, tags, sync_status', // <-- Add cache table schema
      pendingChanges: 'uuid, entity_type, entity_id, operation_type, sync_status',
      syncConflicts: 'uuid, entity_id, entity_type, resolved, sync_status',
      syncMetadata: 'key, sync_status',
    })

    // Version 2: Add any new indexes or tables
    this.version(2)
      .stores({
        cache: 'key, expires_at, tags, hit_count, sync_status',
      })
      .upgrade(async (tx) => {
        // Migration logic if needed
      })
  }

  async initialize(): Promise<void> {
    await this.open()
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
}

// Export singleton instance
export const db = new BCMDatabase()
