import { Database } from '../db/Database'
import type { SyncConflict } from '../../models/entities/sync.entity'
import { ConflictType, ConflictResolutionStrategy } from '../../models/entities/sync.entity'

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
 */
export class ConflictResolver {
  private db: Database

  constructor() {
    this.db = Database.getInstance()
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
    if (clientVersion.updated_at && serverVersion.updated_at) {
      return ConflictType.UPDATE_UPDATE
    }

    // Check if client deleted but server updated
    if (clientVersion.deleted_at && !serverVersion.deleted_at) {
      return ConflictType.DELETE_UPDATE
    }

    // Check for version skew
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

    // Exclude metadata fields
    const excludeFields = [
      'uuid',
      'created_at',
      'created_by',
      'updated_at',
      'updated_by',
      'version',
      'sync_status',
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
    const conflictRepo = this.db.getRepository('syncConflicts')
    const conflict = await conflictRepo.findById(conflictId)

    if (!conflict) {
      throw new Error(`Conflict not found: ${conflictId}`)
    }

    if (conflict.resolved) {
      throw new Error('Conflict is already resolved')
    }

    let resolvedData: Record<string, any>

    switch (resolution.strategy) {
      case ConflictResolutionStrategy.LAST_WRITE_WINS:
        resolvedData = this.resolveLastWriteWins(conflict.client_version, conflict.server_version)
        break

      case ConflictResolutionStrategy.DELETE_WINS:
        resolvedData = this.resolveDeleteWins(conflict.client_version, conflict.server_version)
        break

      case ConflictResolutionStrategy.USER_MEDIATED:
        if (!resolution.resolvedData) {
          throw new Error('Resolved data required for user-mediated resolution')
        }
        resolvedData = resolution.resolvedData
        break

      case ConflictResolutionStrategy.MERGE:
        resolvedData = this.resolveMerge(conflict.client_version, conflict.server_version)
        break

      default:
        throw new Error(`Unknown resolution strategy: ${resolution.strategy}`)
    }

    // Update conflict record
    const now = new Date().toISOString()
    const updated = await conflictRepo.update(conflictId, {
      resolved: true,
      resolution_strategy: resolution.strategy,
      resolved_data: resolvedData,
      resolved_at: now,
      updated_at: now,
    } as Partial<SyncConflict>)

    // Apply resolved data to local database
    await this.applyResolution(conflict.entity_type, conflict.entity_id, resolvedData)

    return updated!
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
    const clientTime = new Date(clientVersion.updated_at || clientVersion.created_at).getTime()
    const serverTime = new Date(serverVersion.updated_at || serverVersion.created_at).getTime()

    return clientTime > serverTime ? { ...clientVersion } : { ...serverVersion }
  }

  /**
   * Delete Wins - If either version is deleted, keep the deletion
   */
  private resolveDeleteWins(
    clientVersion: Record<string, any>,
    serverVersion: Record<string, any>
  ): Record<string, any> {
    if (clientVersion.deleted_at || serverVersion.deleted_at) {
      return {
        ...serverVersion,
        deleted_at: clientVersion.deleted_at || serverVersion.deleted_at,
        deleted_by: clientVersion.deleted_by || serverVersion.deleted_by,
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
    resolvedData: Record<string, any>
  ): Promise<void> {
    try {
      const repository = this.db.getRepository(entityType)

      if (repository) {
        const existing = await repository.findById(entityId)

        if (existing) {
          await repository.update(entityId, {
            ...resolvedData,
            sync_status: 'SYNCED',
          })
        } else {
          await repository.create({
            uuid: entityId,
            ...resolvedData,
            sync_status: 'SYNCED',
          })
        }
      }
    } catch (error) {
      console.error(`Failed to apply resolution for ${entityType}/${entityId}:`, error)
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
    const saved = localStorage.getItem('bcm_conflict_strategy')
    if (
      saved &&
      Object.values(ConflictResolutionStrategy).includes(saved as ConflictResolutionStrategy)
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
    const conflictRepo = this.db.getRepository('syncConflicts')
    const all = await conflictRepo.findAll()

    const byType: Record<string, number> = {}
    const byStrategy: Record<string, number> = {}

    all.forEach((c: SyncConflict) => {
      byType[c.conflict_type] = (byType[c.conflict_type] || 0) + 1
      if (c.resolution_strategy) {
        byStrategy[String(c.resolution_strategy)] =
          (byStrategy[String(c.resolution_strategy)] || 0) + 1
      }
    })

    return {
      total: all.length,
      resolved: all.filter((c: SyncConflict) => c.resolved).length,
      unresolved: all.filter((c: SyncConflict) => !c.resolved).length,
      byType,
      byStrategy,
    }
  }
}
