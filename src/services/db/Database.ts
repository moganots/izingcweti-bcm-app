import Dexie, { Table } from 'dexie';
import type { Settings } from '../../models/entities/settings/settings.entity';
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
  CacheEntry,
  Notification,
  FeatureToggle,
  FeatureToggleOverride,
  FeatureToggleAuditLog,
} from '../../models/entities';
import type { Document } from '../../models/entities/document/document.entity';

export class BCMDatabase extends Dexie {
  // Tables
  users!: Table<User, string>;
  organisations!: Table<Organisation, string>;
  businessUnits!: Table<BusinessUnit, string>;
  departments!: Table<Department, string>;
  documents!: Table<Document, string>;
  risks!: Table<Risk, string>;
  incidents!: Table<Incident, string>;
  workflows!: Table<Workflow, string>;
  notifications!: Table<Notification, string>;
  auditLogs!: Table<AuditLog, string>;
  complianceRecords!: Table<ComplianceRecord, string>;
  settings!: Table<Settings, string>;
  cache!: Table<CacheEntry, string>;
  pendingChanges!: Table<PendingChange, string>;
  syncConflicts!: Table<SyncConflict, string>;
  syncMetadata!: Table<SyncMetadata, string>;
  featureToggles!: Table<FeatureToggle, string>;
  featureToggleOverrides!: Table<FeatureToggleOverride, string>;
  featureToggleAuditLogs!: Table<FeatureToggleAuditLog, string>;

  private static instance: BCMDatabase | null = null;

  constructor() {
    super('BCMDatabase');

    // Version 1: Initial schema
    this.version(1).stores({
      users: 'uuid, email, organisationId, role, isActive, syncStatus',
      organisations: 'uuid, name, industryType, syncStatus',
      businessUnits: 'uuid, name, organisationId, criticalityScore, syncStatus',
      departments: 'uuid, name, businessUnitId, syncStatus',
      documents: 'uuid, title, documentType, status, organisationId, uploadedBy, syncStatus',
      risks: 'uuid, organisationId, riskCategory, impactSeverity, syncStatus',
      incidents: 'uuid, organisationId, incidentSeverity, syncStatus',
      workflows: 'uuid, workflowType, workflowState, assignedTo, syncStatus',
      notifications: 'uuid, recipientId, status, syncStatus',
      auditLogs: 'uuid, userId, organisationId, action, auditCategory, createdAt, syncStatus',
      complianceRecords: 'uuid, organisationId, complianceStandard, complianceStatus, syncStatus',
      settings: 'uuid, userId, organisationId, isSystemDefault, syncStatus',
      cache: 'key, expiresAt, tags, syncStatus',
      pendingChanges: 'uuid, entityType, entityId, operationType, priority, attempts, syncStatus',
      syncConflicts: 'uuid, entityId, entityType, conflictType, resolved, syncStatus',
      syncMetadata: 'key, value, syncStatus',
      featureToggles: 'uuid, organisationId, name, status, environment, syncStatus',
      featureToggleOverrides: 'uuid, featureToggleId, organisationId, value, syncStatus',
      featureToggleAuditLogs: 'uuid, featureToggleId, action, auditedBy, syncStatus',
    });

    // Version 2: Add hit_count index to cache
    this.version(2).stores({
      cache: 'key, expiresAt, tags, hitCount, syncStatus',
    }).upgrade(async (_tx: any) => {
      // Migration logic if needed
    });

    // Version 3: Add feature toggle tables
    this.version(3).stores({
      featureToggles: 'uuid, organisationId, name, status, environment, syncStatus',
      featureToggleOverrides: 'uuid, featureToggleId, organisationId, value, syncStatus',
      featureToggleAuditLogs: 'uuid, featureToggleId, action, auditedBy, syncStatus',
    });
  }

  static getInstance(): BCMDatabase {
    if (!BCMDatabase.instance) {
      BCMDatabase.instance = new BCMDatabase();
    }
    return BCMDatabase.instance;
  }

  async initialize(): Promise<void> {
    await this.open();
  }

  isDbOpen(): boolean {
    return this.isOpen();
  }

  getName(): string {
    return this.name;
  }

  getVersion(): number {
    return this.verno;
  }

  getTableNames(): string[] {
    return Object.keys(this._allTables);
  }

  getRepository(tableName: string): any {
    const table = (this as any)[tableName];
    if (!table) {
      console.warn(`Table ${tableName} not found`);
      return null;
    }

    // Return a repository wrapper with common methods
    return {
      table,
      findById: async (id: string) => await table.get(id),
      findAll: async () => await table.toArray(),
      findOne: async (filter: Record<string, any>) => {
        const [key, value] = Object.entries(filter)[0]!;
        return await table.where(key).equals(value).first();
      },
      findMany: async (filter: Record<string, any>) => {
        const [key, value] = Object.entries(filter)[0]!;
        return await table.where(key).equals(value).toArray();
      },
      create: async (data: any) => {
        const id = data.uuid || crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
        const record = { ...data, uuid: id };
        await table.add(record);
        return record;
      },
      update: async (id: string, data: any) => {
        await table.update(id, data);
        return await table.get(id);
      },
      upsert: async (data: any) => {
        const existing = await table.get(data.uuid);
        if (existing) {
          await table.update(data.uuid, data);
          return await table.get(data.uuid);
        } else {
          await table.add(data);
          return data;
        }
      },
      delete: async (id: string) => {
        await table.delete(id);
      },
      softDelete: async (id: string, deletedBy: string = 'system') => {
        const record = await table.get(id);
        if (record) {
          const now = new Date().toISOString();
          await table.update(id, {
            deletedAt: now,
            deletedBy: deletedBy,
            syncStatus: 'PENDING',
          });
          return await table.get(id);
        }
        return null;
      },
      exists: async (id: string) => {
        const record = await table.get(id);
        return !!record && !record.deletedAt;
      },
      clearAll: async () => {
        await table.clear();
      },
      // PendingChanges specific methods
      getOrderedByPriority: async () => {
        return await table.orderBy('priority').toArray();
      },
      getPendingCount: async () => {
        return await table.where('syncStatus').equals('PENDING').count();
      },
      getFailedChanges: async () => {
        return await table.where('status').equals('FAILED').toArray();
      },
      incrementAttempts: async (id: string) => {
        const record = await table.get(id);
        if (record) {
          const attempts = (record.attempts || 0) + 1;
          await table.update(id, { attempts });
        }
      },
      // SyncMetadata specific methods
      getLastSyncToken: async () => {
        const record = await table.where('key').equals('last_sync_token').first();
        return record?.value || null;
      },
      setLastSyncToken: async (token: string) => {
        const existing = await table.where('key').equals('last_sync_token').first();
        if (existing) {
          await table.update(existing.uuid, {
            value: token,
            updatedAt: new Date().toISOString(),
          });
        } else {
          await table.add({
            uuid: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
            key: 'last_sync_token',
            value: token,
            syncStatus: 'SYNCED',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system',
            updatedBy: 'system',
            version: 1,
          });
        }
      },
      getLastSyncTime: async () => {
        const record = await table.where('key').equals('last_sync_time').first();
        return record?.value || null;
      },
      setLastSyncTime: async (time: string) => {
        const existing = await table.where('key').equals('last_sync_time').first();
        if (existing) {
          await table.update(existing.uuid, {
            value: time,
            updatedAt: new Date().toISOString(),
          });
        } else {
          await table.add({
            uuid: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
            key: 'last_sync_time',
            value: time,
            syncStatus: 'SYNCED',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system',
            updatedBy: 'system',
            version: 1,
          });
        }
      },
      getByKey: async (key: string) => {
        return await table.where('key').equals(key).first();
      },
      // Cache specific methods
      getByTags: async (tags: string[]) => {
        // This is a simple implementation - for production, consider a more robust approach
        const all = await table.toArray();
        return all.filter((entry: any) => {
          if (!entry.tags) return false;
          const entryTags = Array.isArray(entry.tags) ? entry.tags : entry.tags.split(',');
          return tags.some((tag) => entryTags.includes(tag));
        });
      },
      deleteByTags: async (tags: string[]) => {
        const entries = await (table as any).getByTags(tags);
        for (const entry of entries) {
          await table.delete(entry.uuid);
        }
        return entries.length;
      },
    };
  }
}

// Export singleton instance
export const db = BCMDatabase.getInstance();