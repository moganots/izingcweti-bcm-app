import { apiClient } from './../../boot/axios'
import { BCMDatabase } from '../db/Database'
import { NetworkMonitor } from './NetworkMonitor'
import { ConflictResolver } from './ConflictResolver'
import type {
  PendingChange,
  SyncConflict,
  SyncMetadata,
  SyncPullResponse,
  SyncPushResponse,
  SyncChange,
  NetworkInfo,
} from '../../models/entities/sync/sync.entity'
import {
  SyncPriority,
  OperationType,
  SyncStatus,
  ConflictResolutionStrategy,
  PendingChangeStatus,
} from '../../types/sync.types'
import { API_ENDPOINTS, STORAGE_KEYS } from '../../core/constants/api.constants'

// ============================================
// Local Types
// ============================================

export interface ProcessChangeResult {
  success: boolean
  operationType: OperationType
  entityType: string
  entityId: string
  serverResponse?: any
  error?: string
}

export interface SyncEngineStats {
  pendingChanges: number
  conflicts: number
  unresolvedConflicts: number
  lastSyncTime: string | null
  lastSyncToken: string | null
  isOnline: boolean
  syncInProgress: boolean
  deviceId: string
}

export interface FullSyncResult {
  pushResult: SyncPushResponse
  pullResult: SyncPullResponse | null
  durationMs: number
}

/**
 * Sync Engine Service
 * Core synchronization engine for offline-first data management.
 *
 * Backend contract: `src/routes/sync.routes.ts` (mounted at `${baseUrl}/sync`).
 * Frontend contract: `src/core/constants/api.constants.ts` → `API_ENDPOINTS.SYNC.*`
 *
 * IMPORTANT:
 *  - All entity field names use camelCase to match frontend entity definitions.
 *  - All endpoints are resolved from `API_ENDPOINTS` — no hardcoded paths.
 *  - `pendingChanges` rows carry `entityType` as the LOCAL Dexie table name
 *    (e.g. `businessUnits`, `criticalFunctions`). The `getEndpointForEntityType`
 *    map translates that to the correct REST base path.
 */
export class SyncEngine {
  private db: BCMDatabase
  private networkMonitor: NetworkMonitor
  private conflictResolver: ConflictResolver
  private readonly maxRetries: number
  private readonly batchSize: number
  private syncInProgress: boolean = false

  // ============================================
  // Entity → Endpoint Map (covers ALL domains)
  // ============================================

  /**
   * Maps local Dexie table names (used by `pendingChanges.entityType`)
   * to the backend REST base path (no trailing slash).
   *
   * NOTE: Keys are the LOCAL TABLE NAMES, values are the endpoint bases
   *       as defined in API_ENDPOINTS.
   */
  private static readonly ENTITY_ENDPOINT_MAP: Readonly<Record<string, string>> = {
    // ---- Organisation ----
    organisations: API_ENDPOINTS.ORGANISATIONS.BASE,
    businessUnits: API_ENDPOINTS.BUSINESS_UNITS.BASE,
    departments: API_ENDPOINTS.DEPARTMENTS.BASE,
    tenants: API_ENDPOINTS.TENANTS.BASE,

    // ---- BCM ----
    criticalFunctions: API_ENDPOINTS.CRITICAL_FUNCTIONS.BASE,
    businessImpactAssessments: API_ENDPOINTS.BIA.BASE,
    businessContinuityPlans: API_ENDPOINTS.BCP.BASE,
    bcpTemplates: API_ENDPOINTS.BCP_TEMPLATES.BASE,
    recoveryStrategies: API_ENDPOINTS.RECOVERY_STRATEGIES.BASE,
    exerciseTests: API_ENDPOINTS.EXERCISE_TESTS.BASE,
    incidents: API_ENDPOINTS.INCIDENTS.BASE,

    // ---- Risk & Compliance ----
    risks: API_ENDPOINTS.RISKS.BASE,
    complianceRecords: API_ENDPOINTS.COMPLIANCE.RECORDS,

    // ---- Governance ----
    governancePolicies: API_ENDPOINTS.GOVERNANCE.POLICIES.BASE,
    maturityAssessments: API_ENDPOINTS.GOVERNANCE.MATURITY.BASE,
    governanceActivities: API_ENDPOINTS.GOVERNANCE.ACTIVITIES.BASE,

    // ---- Documents ----
    documents: API_ENDPOINTS.DOCUMENTS.BASE,
    documentTemplates: `${API_ENDPOINTS.DOCUMENTS.BASE}/templates`,

    // ---- Workflows ----
    workflows: API_ENDPOINTS.WORKFLOWS.BASE,

    // ---- Notifications ----
    notifications: API_ENDPOINTS.NOTIFICATIONS.BASE,
    notificationPreferences: API_ENDPOINTS.NOTIFICATIONS.PREFERENCES,
    notificationTemplates: API_ENDPOINTS.NOTIFICATIONS.TEMPLATES.BASE,

    // ---- Reports / Dashboards ----
    reports: API_ENDPOINTS.REPORTS.BASE,
    dashboardConfigs: API_ENDPOINTS.DASHBOARD.CONFIGS,

    // ---- Audit ----
    auditLogs: API_ENDPOINTS.AUDIT.BASE,
    auditRetentionPolicies: API_ENDPOINTS.AUDIT.RETENTION_POLICIES.BASE,
    activityHistory: `${API_ENDPOINTS.AUDIT.BASE}/activity-history`,
    attachments: `${API_ENDPOINTS.AUDIT.BASE}/attachments`,
    comments: `${API_ENDPOINTS.AUDIT.BASE}/comments`,

    // ---- Rules / Feature Toggles / Cache ----
    rules: API_ENDPOINTS.RULES.BASE,
    ruleExecutionLogs: `${API_ENDPOINTS.RULES.BASE}/execution-logs`,
    featureToggles: API_ENDPOINTS.FEATURE_TOGGLES.BASE,
    featureToggleOverrides: API_ENDPOINTS.FEATURE_TOGGLES.OVERRIDES.BASE,
    featureToggleAuditLogs: `${API_ENDPOINTS.FEATURE_TOGGLES.BASE}/audit-logs`,

    // ---- Training & Attestation ----
    trainingCourses: API_ENDPOINTS.TRAINING.COURSES.BASE,
    userCourseProgress: API_ENDPOINTS.TRAINING.PROGRESS.BASE,
    certifications: API_ENDPOINTS.TRAINING.CERTIFICATIONS.BASE,
    attestationDocuments: API_ENDPOINTS.ATTESTATION.DOCUMENTS.BASE,
    userAttestations: API_ENDPOINTS.ATTESTATION.USER_ATTESTATIONS.BASE,

    // ---- Improvements ----
    lessons: API_ENDPOINTS.IMPROVEMENTS.LESSONS.BASE,

    // ---- Sync-managed tables (do NOT sync via push/pull — handled separately) ----
    pendingChanges: '',
    syncConflicts: API_ENDPOINTS.SYNC.CONFLICTS,
    syncMetadata: API_ENDPOINTS.SYNC.METADATA,
  }

  /**
   * Normalizes a singular/plural entityType string to its canonical Dexie table name.
   */
  private static readonly ENTITY_NORMALIZATION_MAP: Readonly<Record<string, string>> = {
    organisation: 'organisations',
    businessUnit: 'businessUnits',
    department: 'departments',
    tenant: 'tenants',
    criticalFunction: 'criticalFunctions',
    businessImpactAssessment: 'businessImpactAssessments',
    businessContinuityPlan: 'businessContinuityPlans',
    bcpTemplate: 'bcpTemplates',
    recoveryStrategy: 'recoveryStrategies',
    exerciseTest: 'exerciseTests',
    incident: 'incidents',
    risk: 'risks',
    complianceRecord: 'complianceRecords',
    governancePolicy: 'governancePolicies',
    maturityAssessment: 'maturityAssessments',
    governanceActivity: 'governanceActivities',
    document: 'documents',
    documentTemplate: 'documentTemplates',
    workflow: 'workflows',
    notification: 'notifications',
    notificationPreference: 'notificationPreferences',
    notificationTemplate: 'notificationTemplates',
    report: 'reports',
    dashboardConfig: 'dashboardConfigs',
    auditLog: 'auditLogs',
    auditRetentionPolicy: 'auditRetentionPolicies',
    activityHistory: 'activityHistory',
    attachment: 'attachments',
    comment: 'comments',
    rule: 'rules',
    ruleExecutionLog: 'ruleExecutionLogs',
    featureToggle: 'featureToggles',
    featureToggleOverride: 'featureToggleOverrides',
    featureToggleAuditLog: 'featureToggleAuditLogs',
    trainingCourse: 'trainingCourses',
    userCourseProgress: 'userCourseProgress',
    certification: 'certifications',
    attestationDocument: 'attestationDocuments',
    userAttestation: 'userAttestations',
    lesson: 'lessons',
  }

  constructor(db?: BCMDatabase) {
    this.db = db || BCMDatabase.getInstance()
    this.networkMonitor = NetworkMonitor.getInstance()
    this.conflictResolver = new ConflictResolver()
    this.maxRetries = parseInt(import.meta.env.VITE_SYNC_MAX_RETRIES || '5', 10)
    this.batchSize = parseInt(import.meta.env.VITE_SYNC_BATCH_SIZE || '50', 10)
  }

  // ============================================
  // Lifecycle
  // ============================================

  async initialize(): Promise<void> {
    await this.networkMonitor.startMonitoring()
    console.log('✓ Sync engine initialized')
  }

  async cleanup(): Promise<void> {
    this.networkMonitor.stopMonitoring()
    console.log('✓ Sync engine cleaned up')
  }

  // ============================================
  // Network Status
  // ============================================

  async getNetworkStatus(): Promise<NetworkInfo> {
    return this.networkMonitor.getNetworkStatus()
  }

  // ============================================
  // Pending Changes Management
  // ============================================

  async getPendingChanges(): Promise<PendingChange[]> {
    const repo = this.db.getRepository('pendingChanges')
    if (!repo) {
      console.warn('[SyncEngine] pendingChanges table not found')
      return []
    }
    const ordered = repo.getOrderedByPriority
      ? await repo.getOrderedByPriority()
      : await repo.findAll()
    return (ordered || []) as PendingChange[]
  }

  async addPendingChange(change: {
    entityType: string
    entityId: string
    operationType: OperationType
    data: Record<string, any>
    priority?: SyncPriority
  }): Promise<void> {
    const repo = this.db.getRepository('pendingChanges')
    if (!repo) throw new Error('pendingChanges table not found')

    const now = new Date().toISOString()
    const entityType = this.normalizeEntityType(change.entityType)

    await repo.create({
      uuid: this.generateUuid(),
      entityType,
      entityId: change.entityId,
      operationType: change.operationType,
      data: change.data,
      priority: change.priority ?? SyncPriority.MEDIUM,
      attempts: 0,
      status: PendingChangeStatus.PENDING,
      createdBy: 'system',
      createdAt: now,
      updatedBy: 'system',
      updatedAt: now,
      version: 1,
      syncStatus: SyncStatus.PENDING,
    })
  }

  async removePendingChange(id: string): Promise<void> {
    const repo = this.db.getRepository('pendingChanges')
    if (!repo) return
    await repo.delete(id)
  }

  async incrementAttempts(id: string): Promise<void> {
    const repo = this.db.getRepository('pendingChanges')
    if (!repo?.incrementAttempts) return
    await repo.incrementAttempts(id)
  }

  async resetAttempts(id: string): Promise<void> {
    const repo = this.db.getRepository('pendingChanges')
    if (!repo) return
    await repo.update(id, {
      attempts: 0,
      status: PendingChangeStatus.PENDING,
      updatedAt: new Date().toISOString(),
    })
  }

  async markFailed(id: string, errorMessage: string): Promise<void> {
    const repo = this.db.getRepository('pendingChanges')
    if (!repo) return
    await repo.update(id, {
      status: PendingChangeStatus.FAILED,
      errorMessage,
      updatedAt: new Date().toISOString(),
    })
  }

  async clearPendingChanges(): Promise<void> {
    const repo = this.db.getRepository('pendingChanges')
    if (!repo) return
    await repo.clearAll()
  }

  // ============================================
  // Push Changes (Local → Server)
  // ============================================

  /**
   * Push all pending local changes to the server.
   * Uses `POST ${baseUrl}/sync/push`.
   */
  async pushChanges(): Promise<SyncPushResponse> {
    this.assertNotSyncing()
    this.assertOnline()

    this.syncInProgress = true
    try {
      const pendingChanges = await this.getPendingChanges()

      if (pendingChanges.length === 0) {
        return {
          success: true,
          appliedChanges: 0,
          conflicts: [],
          syncToken: (await this.getSyncToken()) || '',
        }
      }

      const sorted = [...pendingChanges].sort(
        (a, b) => (a.priority ?? 3) - (b.priority ?? 3),
      )
      const batches = this.createBatches(sorted, this.batchSize)

      let appliedChanges = 0
      const allConflicts: SyncConflict[] = []

      for (const batch of batches) {
        try {
          const result = await this.pushBatch(batch)
          appliedChanges += result.appliedChanges
          allConflicts.push(...result.conflicts)
        } catch (err: any) {
          // Isolate batch failure: mark all items in the batch as failed
          console.error('[SyncEngine] Batch push failed:', err?.message)
          for (const item of batch) {
            await this.markFailed(item.uuid, err?.message || 'Batch push failed')
          }
        }
      }

      return {
        success: allConflicts.length === 0,
        appliedChanges,
        conflicts: allConflicts,
        syncToken: new Date().toISOString(),
      }
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Push a single batch of changes.
   */
  private async pushBatch(batch: PendingChange[]): Promise<{
    appliedChanges: number
    conflicts: SyncConflict[]
  }> {
    const response = await apiClient.post(API_ENDPOINTS.SYNC.PUSH, {
      changes: batch.map((c) => ({
        entityType: c.entityType,
        entityId: c.entityId,
        operationType: c.operationType,
        data: c.data,
        version: c.version,
        clientTimestamp: c.updatedAt,
      })),
      lastSyncToken: await this.getSyncToken(),
      deviceId: this.getDeviceId(),
    })

    const result = response.data ?? {}
    const conflicts: SyncConflict[] = []

    // Server returns appliedIds → remove those from local queue
    if (Array.isArray(result.appliedIds)) {
      for (const id of result.appliedIds) {
        await this.removePendingChange(id)
      }
    }

    // Server returns conflicts → save & surface
    if (Array.isArray(result.conflicts)) {
      for (const conflict of result.conflicts) {
        const saved = await this.saveConflict(conflict)
        conflicts.push(saved)
      }
    }

    // Server returns failedIds → bump attempt counter
    if (Array.isArray(result.failedIds)) {
      for (const id of result.failedIds) {
        await this.incrementAttempts(id)
      }
    }

    return {
      appliedChanges: result.appliedIds?.length ?? 0,
      conflicts,
    }
  }

  /**
   * Process a single change directly (used for retries / manual sync).
   * Routes to the correct endpoint via `getEndpointForEntityType`.
   */
  async processChange(change: PendingChange): Promise<ProcessChangeResult> {
    const { entityType, entityId, operationType, data } = change
    const endpoint = this.getEndpointForEntityType(entityType)

    try {
      let serverResponse: any = null

      switch (operationType) {
        case OperationType.CREATE:
          serverResponse = (await apiClient.post(endpoint, data)).data
          break
        case OperationType.UPDATE:
          serverResponse = (await apiClient.put(`${endpoint}/${entityId}`, data)).data
          break
        case OperationType.DELETE:
          serverResponse = (await apiClient.delete(`${endpoint}/${entityId}`)).data
          break
        default:
          throw new Error(`Unknown operation type: ${operationType}`)
      }

      return {
        success: true,
        operationType,
        entityType,
        entityId,
        serverResponse,
      }
    } catch (err: any) {
      return {
        success: false,
        operationType,
        entityType,
        entityId,
        error: err?.message || 'Unknown error',
      }
    }
  }

  // ============================================
  // Pull Changes (Server → Local)
  // ============================================

  /**
   * Pull changes from server.
   * Uses `GET ${baseUrl}/sync/pull`.
   */
  async pullChanges(since?: string | null): Promise<SyncPullResponse> {
    this.assertOnline()

    const syncToken = since ?? (await this.getSyncToken())

    const response = await apiClient.get(API_ENDPOINTS.SYNC.PULL, {
      params: {
        since: syncToken,
        limit: this.batchSize,
      },
    })

    const result: SyncPullResponse = response.data ?? {
      success: false,
      changes: [],
      syncToken: syncToken || '',
      hasMore: false,
    }

    if (Array.isArray(result.changes)) {
      for (const change of result.changes) {
        await this.applyRemoteChange(change)
      }
    }

    if (result.syncToken) {
      await this.setSyncToken(result.syncToken)
    }

    return result
  }

  /**
   * Apply a single remote change to the local Dexie DB.
   */
  async applyRemoteChange(change: SyncChange): Promise<void> {
    const entityType = this.normalizeEntityType(change.entityType)
    const repository = this.db.getRepository(entityType)

    if (!repository) {
      console.warn(`[SyncEngine] No repository for entity type: ${entityType}`)
      return
    }

    try {
      switch (change.operationType) {
        case OperationType.CREATE:
        case OperationType.UPDATE: {
          const existing = await repository.findById(change.entityId)

          // Local pending change + remote mutation = potential conflict
          if (existing && (existing as any).syncStatus === SyncStatus.PENDING) {
            await this.handlePotentialConflict(existing, change)
            return
          }

          await repository.upsert({
            uuid: change.entityId,
            ...change.data,
            syncStatus: SyncStatus.SYNCED,
            updatedAt: new Date().toISOString(),
          })
          break
        }

        case OperationType.DELETE:
          await repository.delete(change.entityId)
          break

        default:
          console.warn(
            `[SyncEngine] Unknown operationType: ${change.operationType}`,
          )
      }
    } catch (err) {
      console.error(
        `[SyncEngine] Failed to apply remote change for ${entityType}/${change.entityId}:`,
        err,
      )
      throw err
    }
  }

  private async handlePotentialConflict(
    localData: any,
    remoteChange: SyncChange,
  ): Promise<void> {
    const conflictType = this.conflictResolver.detectConflict(
      localData,
      remoteChange.data,
    )

    if (conflictType) {
      await this.saveConflict({
        entityId: remoteChange.entityId,
        entityType: remoteChange.entityType,
        clientVersion: localData,
        serverVersion: remoteChange.data,
        conflictType,
        detectedAt: new Date().toISOString(),
        resolved: false,
        autoResolvable: false,
        autoResolved: false,
      } as any)
    } else {
      const repository = this.db.getRepository(
        this.normalizeEntityType(remoteChange.entityType),
      )
      if (repository) {
        await repository.upsert({
          uuid: remoteChange.entityId,
          ...remoteChange.data,
          syncStatus: SyncStatus.SYNCED,
          updatedAt: new Date().toISOString(),
        })
      }
    }
  }

  // ============================================
  // Conflict Management
  // ============================================

  async saveConflict(
    conflictData: Partial<SyncConflict>,
  ): Promise<SyncConflict> {
    const conflictRepo = this.db.getRepository('syncConflicts')
    if (!conflictRepo) throw new Error('syncConflicts table not found')

    const now = new Date().toISOString()
    const conflict = (await conflictRepo.create({
      uuid: this.generateUuid(),
      ...conflictData,
      createdBy: 'system',
      createdAt: now,
      updatedBy: 'system',
      updatedAt: now,
      version: 1,
      syncStatus: SyncStatus.CONFLICT,
    })) as SyncConflict

    // Push conflict to server so admins can see it centrally
    if (this.networkMonitor.isOnline) {
      try {
        await apiClient.post(API_ENDPOINTS.SYNC.CONFLICTS, conflict)
      } catch (err) {
        console.warn('[SyncEngine] Failed to sync conflict to server:', err)
      }
    }

    return conflict
  }

  async getConflicts(): Promise<SyncConflict[]> {
    const conflictRepo = this.db.getRepository('syncConflicts')
    if (!conflictRepo) return []
    return ((await conflictRepo.findAll()) || []) as SyncConflict[]
  }

  async getUnresolvedConflicts(): Promise<SyncConflict[]> {
    const all = await this.getConflicts()
    return all.filter((c) => !c.resolved)
  }

  async resolveConflict(
    conflictId: string,
    resolution: {
      strategy: ConflictResolutionStrategy
      resolvedData?: Record<string, any>
      userId?: string
      notes?: string
    },
  ): Promise<void> {
    // 1. Resolve locally
    await this.conflictResolver.resolve(conflictId, {
      strategy: resolution.strategy,
      resolvedData: resolution.resolvedData,
      userId: resolution.userId || 'system',
      notes: resolution.notes,
    })

    // 2. Sync resolution to server (best-effort)
    if (this.networkMonitor.isOnline) {
      try {
        await apiClient.post(
          API_ENDPOINTS.SYNC.CONFLICT_RESOLVE(conflictId),
          {
            strategy: resolution.strategy,
            resolvedData: resolution.resolvedData,
            userId: resolution.userId || 'system',
            notes: resolution.notes,
          },
        )
      } catch (err) {
        console.warn(
          '[SyncEngine] Failed to sync conflict resolution to server:',
          err,
        )
      }
    }
  }

  // ============================================
  // Sync Token / Metadata
  // ============================================

  /**
   * Get the last sync token, falling back to the server if the local
   * cache is empty and we're online.
   */
  async getSyncToken(): Promise<string | null> {
    const metadataRepo = this.db.getRepository('syncMetadata')
    const local =
      metadataRepo?.getLastSyncToken
        ? await metadataRepo.getLastSyncToken()
        : null
    if (local) return local

    if (!this.networkMonitor.isOnline) return null

    try {
      const response = await apiClient.get(API_ENDPOINTS.SYNC.LAST_SYNC_TOKEN)
      const token = response.data?.token ?? response.data?.value ?? null
      if (token && metadataRepo?.setLastSyncToken) {
        await metadataRepo.setLastSyncToken(token)
      }
      return token
    } catch {
      return null
    }
  }

  async setSyncToken(token: string): Promise<void> {
    const metadataRepo = this.db.getRepository('syncMetadata')
    if (metadataRepo?.setLastSyncToken) {
      await metadataRepo.setLastSyncToken(token)
    }

    if (!this.networkMonitor.isOnline) return

    try {
      await apiClient.patch(API_ENDPOINTS.SYNC.METADATA_UPDATE_TOKEN, { token })
    } catch (err) {
      console.warn('[SyncEngine] Failed to sync token to server:', err)
    }
  }

  async getSyncMetadata(key?: string): Promise<SyncMetadata | null> {
    const metadataRepo = this.db.getRepository('syncMetadata')
    if (!metadataRepo) return null

    if (key && metadataRepo.getByKey) {
      return (await metadataRepo.getByKey(key)) ?? null
    }

    const token = metadataRepo.getLastSyncToken
      ? await metadataRepo.getLastSyncToken()
      : null
    const time = metadataRepo.getLastSyncTime
      ? await metadataRepo.getLastSyncTime()
      : null

    if (!token && !time) return null

    return {
      key: 'sync_state',
      value: JSON.stringify({ token, lastSyncTime: time }),
      uuid: 'sync_metadata',
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedBy: 'system',
      updatedAt: new Date().toISOString(),
      version: 1,
      syncStatus: SyncStatus.SYNCED,
    }
  }

  async updateSyncMetadata(key: string, value: string): Promise<void> {
    const metadataRepo = this.db.getRepository('syncMetadata')
    if (!metadataRepo) return

    const existing = metadataRepo.getByKey
      ? await metadataRepo.getByKey(key)
      : null

    if (existing) {
      await metadataRepo.update(existing.uuid, {
        value,
        updatedAt: new Date().toISOString(),
      })
    } else {
      await metadataRepo.create({
        key,
        value,
        uuid: this.generateUuid(),
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedBy: 'system',
        updatedAt: new Date().toISOString(),
        version: 1,
        syncStatus: SyncStatus.SYNCED,
      })
    }

    if (!this.networkMonitor.isOnline) return

    try {
      await apiClient.put(API_ENDPOINTS.SYNC.METADATA_UPSERT(key), { value })
    } catch (err) {
      console.warn('[SyncEngine] Failed to sync metadata to server:', err)
    }
  }

  /**
   * Get aggregate sync state from the server.
   * Composed from `METADATA_MAP` + `SYNC_PROGRESS` since no single
   * `GET /sync/status` route exists in the backend.
   */
  async getServerSyncStatus(): Promise<{
    lastSyncToken: string | null
    lastSyncTime: string | null
    pendingServerChanges: number
  } | null> {
    if (!this.networkMonitor.isOnline) return null

    try {
      const [progressRes, mapRes] = await Promise.all([
        apiClient.get(API_ENDPOINTS.SYNC.SYNC_PROGRESS),
        apiClient.get(API_ENDPOINTS.SYNC.METADATA_MAP),
      ])

      const progress = progressRes.data ?? {}
      const map = mapRes.data ?? {}

      return {
        lastSyncToken:
          progress.lastSyncToken ?? map.last_sync_token ?? null,
        lastSyncTime: progress.lastSyncTime ?? map.last_sync_time ?? null,
        pendingServerChanges:
          progress.pendingItems ??
          progress.pendingServerChanges ??
          0,
      }
    } catch (err) {
      console.error('[SyncEngine] Failed to get server sync status:', err)
      return null
    }
  }

  // ============================================
  // Full Sync
  // ============================================

  /**
   * Full bidirectional sync: push local → pull remote.
   */
  async fullSync(): Promise<FullSyncResult> {
    this.assertNotSyncing()
    this.assertOnline()

    this.syncInProgress = true
    const start = Date.now()

    try {
      const pushResult = await this.pushChanges()
      const pullResult = await this.pullChanges()

      await this.updateSyncMetadata(
        'last_sync_time',
        new Date().toISOString(),
      )

      return {
        pushResult,
        pullResult,
        durationMs: Date.now() - start,
      }
    } finally {
      this.syncInProgress = false
    }
  }

  /**
   * Wipe the local queue and request server-side cleanup.
   * Server-first: if cleanup succeeds, we trust the server state.
   */
  async clearAllPendingChanges(): Promise<void> {
    if (this.networkMonitor.isOnline) {
      try {
        await apiClient.delete(API_ENDPOINTS.SYNC.PENDING_CHANGES_CLEANUP)
      } catch (err) {
        console.warn(
          '[SyncEngine] Server pending-changes cleanup failed:',
          err,
        )
      }
    }
    await this.clearPendingChanges()
  }

  // ============================================
  // Stats & Retries
  // ============================================

  async getStats(): Promise<SyncEngineStats> {
    const pendingRepo = this.db.getRepository('pendingChanges')
    const conflictRepo = this.db.getRepository('syncConflicts')
    const metadataRepo = this.db.getRepository('syncMetadata')

    const [pendingCount, conflictsRaw, token, lastTime] = await Promise.all([
      pendingRepo?.getPendingCount?.() ?? Promise.resolve(0),
      conflictRepo?.findAll?.() ?? Promise.resolve([] as any[]),
      metadataRepo?.getLastSyncToken?.() ?? Promise.resolve(null),
      metadataRepo?.getLastSyncTime?.() ?? Promise.resolve(null),
    ])

    const conflicts = (conflictsRaw || []) as SyncConflict[]

    return {
      pendingChanges: pendingCount,
      conflicts: conflicts.length,
      unresolvedConflicts: conflicts.filter((c) => !c.resolved).length,
      lastSyncTime: lastTime,
      lastSyncToken: token,
      isOnline: this.networkMonitor.isOnline,
      syncInProgress: this.syncInProgress,
      deviceId: this.getDeviceId(),
    }
  }

  async retryFailedSyncs(): Promise<number> {
    const pendingRepo = this.db.getRepository('pendingChanges')
    if (!pendingRepo?.getFailedChanges) return 0

    const failedChanges = (await pendingRepo.getFailedChanges()) || []
    if (failedChanges.length === 0) return 0

    // Reset attempts for all failed items so the next push picks them up
    for (const change of failedChanges) {
      await this.resetAttempts(change.uuid)
    }

    // Try a batched push first
    if (this.networkMonitor.isOnline) {
      try {
        const result = await this.pushChanges()
        if (result.success) return failedChanges.length
      } catch {
        // fall through to per-item retry
      }
    }

    // Per-item fallback
    let retried = 0
    for (const change of failedChanges) {
      const result = await this.processChange(change)
      if (result.success) {
        await this.removePendingChange(change.uuid)
        retried++
      } else {
        await this.incrementAttempts(change.uuid)
      }
    }
    return retried
  }

  // ============================================
  // Private Helpers
  // ============================================

  /**
   * Resolve the REST base path for a given entity type.
   * Normalizes singular/plural forms and falls back gracefully.
   */
  getEndpointForEntityType(entityType: string): string {
    const normalized = this.normalizeEntityType(entityType)
    const mapped = SyncEngine.ENTITY_ENDPOINT_MAP[normalized]
    if (mapped) return mapped

    // Fallback: derive from normalised name (best-effort)
    console.warn(
      `[SyncEngine] No explicit endpoint mapping for entityType="${entityType}" (normalized="${normalized}"). Using fallback /${normalized}.`,
    )
    return `/${normalized}`
  }

  /**
   * Normalize an entityType to its canonical Dexie table name.
   */
  normalizeEntityType(entityType: string): string {
    if (!entityType) return entityType
    // Already plural and known?
    if (SyncEngine.ENTITY_ENDPOINT_MAP[entityType] !== undefined) {
      return entityType
    }
    // Try singular → plural map
    return SyncEngine.ENTITY_NORMALIZATION_MAP[entityType] ?? entityType
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    if (batchSize <= 0) return [items]
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  /**
   * Stable per-install device identifier, persisted in localStorage.
   */
  private getDeviceId(): string {
    // SSR-safe guard
    if (typeof window === 'undefined' || !('localStorage' in window)) {
      return 'server-side'
    }
    let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID)
    if (!deviceId) {
      deviceId = this.generateUuid()
      localStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId)
    }
    return deviceId
  }

  private generateUuid(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    // RFC4122 v4-ish fallback for older runtimes / SSR
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  private assertNotSyncing(): void {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress')
    }
  }

  private assertOnline(): void {
    if (!this.networkMonitor.isOnline) {
      throw new Error('Cannot sync while offline')
    }
  }
}