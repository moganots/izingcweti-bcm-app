import { db } from '../db/Database'
import { ConflictResolutionStrategy, ConflictType, SyncConflict } from '../../models/entities/sync/sync.entity'

/**
 * Conflict Resolution Result
 */
export interface ConflictResolution {
  conflictId: string
  strategy: ConflictResolutionStrategy
  resolvedData: Record<string, any>
  resolvedBy: string
  resolvedAt: string
  notes?: string
}

/**
 * Conflict Resolver Service
 * Handles detection and resolution of sync conflicts
 * 
 * IMPORTANT: All entity field names use camelCase to match frontend entities.
 */
export class ConflictResolver {
    private static readonly TABLE_NORMALIZATION: Record<string, string> = {
    organisation: 'organisations',
    businessUnit: 'businessUnits',
    department: 'departments',
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
    workflow: 'workflows',
    notification: 'notifications',
    report: 'reports',
    dashboardConfig: 'dashboardConfigs',
    auditLog: 'auditLogs',
    rule: 'rules',
    featureToggle: 'featureToggles',
    trainingCourse: 'trainingCourses',
    certification: 'certifications',
    attestationDocument: 'attestationDocuments',
    userAttestation: 'userAttestations',
    lesson: 'lessons',
  }

  private normalizeTableName(name: string): string {
    return ConflictResolver.TABLE_NORMALIZATION[name] ?? name
  }

  // ============================================
  // Conflict Detection
  // ============================================

  /**
   * Detect conflict between client and server versions
   */
  detectConflict(
    clientVersion: Record<string, any>,
    serverVersion: Record<string, any>
  ): ConflictType | null {
    // Check if both versions modified since last sync
    if (clientVersion.updatedAt && serverVersion.updatedAt) {
      const clientTime = new Date(clientVersion.updatedAt).getTime()
      const serverTime = new Date(serverVersion.updatedAt).getTime()
      const lastSyncTime = Math.max(
        clientVersion.lastSyncAt ? new Date(clientVersion.lastSyncAt).getTime() : 0,
        serverVersion.lastSyncAt ? new Date(serverVersion.lastSyncAt).getTime() : 0
      )

      // If both modified after last sync, it's a conflict
      if (clientTime > lastSyncTime && serverTime > lastSyncTime) {
        return ConflictType.UPDATE_UPDATE
      }
    }

    // Check if client deleted but server updated
    if (clientVersion.deletedAt && !serverVersion.deletedAt) {
      return ConflictType.DELETE_UPDATE
    }

    // Check for version skew (versions differ by more than 1)
    if (clientVersion.version && serverVersion.version) {
      if (Math.abs(clientVersion.version - serverVersion.version) > 1) {
        return ConflictType.VERSION_SKEW
      }
    }

    return null
  }

  /**
   * Find differences between client and server versions
   */
  findDifferences(
    clientVersion: Record<string, any>,
    serverVersion: Record<string, any>
  ): Array<{ field: string; clientValue: any; serverValue: any }> {
    const differences: Array<{ field: string; clientValue: any; serverValue: any }> = []
    const allFields = new Set([...Object.keys(clientVersion), ...Object.keys(serverVersion)])

    // Exclude metadata fields (camelCase to match entities)
    const excludeFields = [
      'uuid',
      'createdAt',
      'createdBy',
      'updatedAt',
      'updatedBy',
      'version',
      'syncStatus',
      'lastSyncAt',
    ]

    for (const field of allFields) {
      if (excludeFields.includes(field)) continue

      const clientValue = clientVersion[field]
      const serverValue = serverVersion[field]

      if (JSON.stringify(clientValue) !== JSON.stringify(serverValue)) {
        differences.push({ field, clientValue, serverValue })
      }
    }

    return differences
  }

  // ============================================
  // Conflict Resolution
  // ============================================

  /**
   * Resolve a sync conflict
   */
  async resolve(
    conflictId: string,
    resolution: {
      strategy: ConflictResolutionStrategy
      resolvedData?: Record<string, any>
      userId: string
      notes?: string
    }
  ): Promise<SyncConflict> {
    const conflictRepo = db.getRepository('syncConflicts')
    if (!conflictRepo) {
      throw new Error('syncConflicts table not found')
    }

    const conflict = (await conflictRepo.findById(conflictId)) as SyncConflict | null

    if (!conflict) {
      throw new Error(`Conflict not found: ${conflictId}`)
    }

    if (conflict.resolved) {
      throw new Error('Conflict is already resolved')
    }

    let resolvedData: Record<string, any>

    switch (resolution.strategy) {
      case ConflictResolutionStrategy.LAST_WRITE_WINS:
        resolvedData = this.resolveLastWriteWins(conflict.clientVersion, conflict.serverVersion)
        break

      case ConflictResolutionStrategy.DELETE_WINS:
        resolvedData = this.resolveDeleteWins(conflict.clientVersion, conflict.serverVersion)
        break

      case ConflictResolutionStrategy.USER_MEDIATED:
        if (!resolution.resolvedData || Object.keys(resolution.resolvedData).length === 0) {
          throw new Error('Non-empty resolvedData required for user-mediated resolution')
        }
        resolvedData = resolution.resolvedData
        break

      case ConflictResolutionStrategy.MERGE:
        resolvedData = this.resolveMerge(conflict.clientVersion, conflict.serverVersion)
        break

      default:
        throw new Error(`Unknown resolution strategy: ${resolution.strategy}`)
    }

    // Update conflict record (camelCase fields)
    const now = new Date().toISOString()
    const updated = await conflictRepo.update(conflictId, {
      resolved: true,
      resolutionStrategy: resolution.strategy,
      resolutionData: resolvedData,
      resolvedAt: now,
      resolvedBy: resolution.userId,
      resolutionNotes: resolution.notes,
      updatedAt: now,
    })

    // Apply resolved data to local database
    await this.applyResolution(conflict.entityType, conflict.entityId, resolvedData)

    return updated as SyncConflict
  }

  /**
   * Resolve multiple conflicts in bulk
   */
  async resolveBulk(
    resolutions: Array<{
      conflictId: string
      strategy: ConflictResolutionStrategy
      resolvedData?: Record<string, any>
    }>,
    userId: string
  ): Promise<number> {
    let resolvedCount = 0

    for (const resolution of resolutions) {
      try {
        await this.resolve(resolution.conflictId, {
          ...resolution,
          userId,
        })
        resolvedCount++
      } catch (error) {
        console.error(`Failed to resolve conflict ${resolution.conflictId}:`, error)
      }
    }

    return resolvedCount
  }

  // ============================================
  // Resolution Strategies
  // ============================================

  /**
   * Last Write Wins - Keep the most recently modified version
   */
  private resolveLastWriteWins(
    clientVersion: Record<string, any>,
    serverVersion: Record<string, any>
  ): Record<string, any> {
    const clientTime = new Date(clientVersion.updatedAt || clientVersion.createdAt).getTime()
    const serverTime = new Date(serverVersion.updatedAt || serverVersion.createdAt).getTime()

    const resolved = clientTime > serverTime ? { ...clientVersion } : { ...serverVersion }

    // Ensure resolved data is marked as synced
    resolved.syncStatus = 'SYNCED'
    resolved.updatedAt = new Date().toISOString()

    return resolved
  }

  /**
   * Delete Wins - If either version is deleted, keep the deletion
   */
  private resolveDeleteWins(
    clientVersion: Record<string, any>,
    serverVersion: Record<string, any>
  ): Record<string, any> {
    if (clientVersion.deletedAt || serverVersion.deletedAt) {
      return {
        ...serverVersion,
        deletedAt: clientVersion.deletedAt || serverVersion.deletedAt,
        deletedBy: clientVersion.deletedBy || serverVersion.deletedBy,
        syncStatus: 'SYNCED',
        updatedAt: new Date().toISOString(),
      }
    }
    return this.resolveLastWriteWins(clientVersion, serverVersion)
  }

  /**
   * Merge - Attempt to merge both versions
   */
  private resolveMerge(
    clientVersion: Record<string, any>,
    serverVersion: Record<string, any>
  ): Record<string, any> {
    const differences = this.findDifferences(clientVersion, serverVersion)
    const merged = { ...serverVersion }

    // For each difference, prefer non-null values
    for (const diff of differences) {
      if (diff.clientValue !== null && diff.clientValue !== undefined) {
        merged[diff.field] = diff.clientValue
      } else if (diff.serverValue !== null && diff.serverValue !== undefined) {
        merged[diff.field] = diff.serverValue
      }
    }

    merged.syncStatus = 'SYNCED'
    merged.updatedAt = new Date().toISOString()
    merged.version = Math.max(clientVersion.version || 0, serverVersion.version || 0) + 1

    return merged
  }

  // ============================================
  // Resolution Application
  // ============================================

  /**
   * Apply resolved data to local database
   */
    private async applyResolution(
    entityType: string,
    entityId: string,
    resolvedData: Record<string, any>,
  ): Promise<void> {
    const tableName = this.normalizeTableName(entityType)
    const repository = db.getRepository(tableName)

    if (!repository) {
      console.warn(`[ConflictResolver] Unknown table: ${tableName}`)
      return
    }

    try {
      const existing = await repository.findById(entityId)
      if (existing) {
        await repository.update(entityId, {
          ...resolvedData,
          syncStatus: 'SYNCED',
          updatedAt: new Date().toISOString(),
        })
      } else {
        await repository.create({
          uuid: entityId,
          ...resolvedData,
          syncStatus: 'SYNCED',
        })
      }
    } catch (error) {
      console.error(
        `[ConflictResolver] Failed to apply resolution for ${tableName}/${entityId}:`,
        error,
      )
      throw error
    }
  }

  // ============================================
  // Auto-Resolution
  // ============================================

  /**
   * Attempt to auto-resolve conflicts based on default strategy
   */
  async autoResolve(conflict: SyncConflict, userId: string): Promise<boolean> {
    const defaultStrategy = this.getDefaultStrategy()

    try {
      await this.resolve(conflict.uuid, {
        strategy: defaultStrategy,
        userId,
        notes: 'Auto-resolved',
      })
      return true
    } catch {
      return false
    }
  }

  /**
   * Get default resolution strategy from settings
   */
    private getDefaultStrategy(): ConflictResolutionStrategy {
    if (typeof localStorage === 'undefined') {
      return ConflictResolutionStrategy.LAST_WRITE_WINS
    }
    const saved = localStorage.getItem('bcm_conflict_strategy')
    if (
      saved &&
      (Object.values(ConflictResolutionStrategy) as string[]).includes(saved)
    ) {
      return saved as ConflictResolutionStrategy
    }
    return ConflictResolutionStrategy.LAST_WRITE_WINS
  }

  /**
   * Get conflict statistics
   */
  async getStats(): Promise<{
    total: number
    resolved: number
    unresolved: number
    byType: Record<string, number>
    byStrategy: Record<string, number>
  }> {
    const conflictRepo = db.getRepository('syncConflicts')
    if (!conflictRepo) {
      return { total: 0, resolved: 0, unresolved: 0, byType: {}, byStrategy: {} }
    }

    const all = (await conflictRepo.findAll()) as SyncConflict[]

    const byType: Record<string, number> = {}
    const byStrategy: Record<string, number> = {}

    all.forEach((c) => {
      byType[c.conflictType] = (byType[c.conflictType] || 0) + 1
      if (c.resolutionStrategy) {
        byStrategy[String(c.resolutionStrategy)] =
          (byStrategy[String(c.resolutionStrategy)] || 0) + 1
      }
    })

    return {
      total: all.length,
      resolved: all.filter((c) => c.resolved).length,
      unresolved: all.filter((c) => !c.resolved).length,
      byType,
      byStrategy,
    }
  }
}