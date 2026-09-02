import type { Table } from 'dexie'
import { BaseRepository } from '../BaseRepository'
import { 
  User, 
  UserRole, 
  UserStats,
} from './../../../../models/entities'

/**
 * User Repository
 * Handles CRUD operations for User entities with camelCase field names
 * Aligned with user.entity.ts
 */
export class UserRepository extends BaseRepository<User> {
  constructor(table: Table<User, string>) {
    super(table, 'users')
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | undefined> {
    return this.findOne({ email } as Partial<User>)
  }

  /**
   * Find users by organisation
   */
  async findByOrganisation(organisationId: string): Promise<User[]> {
    return this.findMany({ organisationId } as Partial<User>)
  }

  /**
   * Find users by department
   */
  async findByDepartment(departmentId: string): Promise<User[]> {
    return this.findMany({ departmentId } as Partial<User>)
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole): Promise<User[]> {
    return this.findMany({ role } as Partial<User>)
  }

  /**
   * Find users by multiple roles
   */
  async findByRoles(roles: UserRole[]): Promise<User[]> {
    const all = await this.findAll()
    return all.filter((user) => {
      const userRole = user.role as UserRole
      return roles.includes(userRole)
    })
  }

  /**
   * Find active users
   */
  async findActive(): Promise<User[]> {
    return this.findMany({ isActive: true } as Partial<User>)
  }

  /**
   * Find inactive users
   */
  async findInactive(): Promise<User[]> {
    return this.findMany({ isActive: false } as Partial<User>)
  }

  /**
   * Find users with email verified
   */
  async findVerified(): Promise<User[]> {
    return this.findMany({ isEmailVerified: true } as Partial<User>)
  }

  /**
   * Find users with email not verified
   */
  async findUnverified(): Promise<User[]> {
    return this.findMany({ isEmailVerified: false } as Partial<User>)
  }

  /**
   * Find users who have completed training
   */
  async findTrainingCompleted(): Promise<User[]> {
    return this.table
      .filter((user) => user.trainingCompletedAt !== undefined && user.trainingCompletedAt !== null)
      .toArray()
  }

  /**
   * Find users who have NOT completed training
   */
  async findTrainingIncomplete(): Promise<User[]> {
    return this.table
      .filter((user) => 
        user.isActive === true && 
        (user.trainingCompletedAt === undefined || user.trainingCompletedAt === null)
      )
      .toArray()
  }

  /**
   * Find users by search term (email, firstName, lastName)
   */
  async search(query: string): Promise<User[]> {
    const lower = query.toLowerCase()
    const all = await this.findAll()
    return all.filter((user) => 
      user.email?.toLowerCase().includes(lower) ||
      user.firstName?.toLowerCase().includes(lower) ||
      user.lastName?.toLowerCase().includes(lower) ||
      user.fullName?.toLowerCase().includes(lower)
    )
  }

  /**
   * Find users by last login date range
   */
  async findByLastLoginRange(startDate: Date, endDate: Date): Promise<User[]> {
    const all = await this.findAll()
    return all.filter((user) => {
      if (!user.lastLoginAt) return false
      const date = user.lastLoginAt instanceof Date ? user.lastLoginAt : new Date(user.lastLoginAt)
      return date >= startDate && date <= endDate
    })
  }

  /**
   * Find users by lock status
   */
  async findLocked(includeExpired: boolean = false): Promise<User[]> {
    const all = await this.findAll()
    const now = new Date()
    return all.filter((user) => {
      if (!user.lockedUntil) return false
      const lockedUntil = user.lockedUntil instanceof Date ? user.lockedUntil : new Date(user.lockedUntil)
      if (includeExpired) {
        return user.isAccountLocked === true || lockedUntil > now
      }
      return lockedUntil > now
    })
  }

  /**
   * Find users with failed login attempts above threshold
   */
  async findWithFailedLoginAttempts(threshold: number = 5): Promise<User[]> {
    const all = await this.findAll()
    return all.filter((user) => (user.failedLoginAttempts || 0) >= threshold)
  }

  /**
   * Find users by organisation and role
   */
  async findByOrganisationAndRole(organisationId: string, role: UserRole): Promise<User[]> {
    const users = await this.findByOrganisation(organisationId)
    return users.filter((user) => user.role === role)
  }

  /**
   * Get users with pagination
   */
  async getWithPagination(
    page: number = 1,
    limit: number = 20,
    filters?: {
      organisationId?: string
      departmentId?: string
      role?: UserRole
      isActive?: boolean
      search?: string
    }
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    let results = await this.findAll()

    // Apply filters
    if (filters?.organisationId) {
      results = results.filter((u) => u.organisationId === filters.organisationId)
    }
    if (filters?.departmentId) {
      results = results.filter((u) => u.departmentId === filters.departmentId)
    }
    if (filters?.role) {
      results = results.filter((u) => u.role === filters.role)
    }
    if (filters?.isActive !== undefined) {
      results = results.filter((u) => u.isActive === filters.isActive)
    }
    if (filters?.search) {
      const lower = filters.search.toLowerCase()
      results = results.filter((u) => 
        u.email?.toLowerCase().includes(lower) ||
        u.firstName?.toLowerCase().includes(lower) ||
        u.lastName?.toLowerCase().includes(lower)
      )
    }

    const total = results.length
    const start = (page - 1) * limit
    const end = start + limit

    // Sort by createdAt descending
    const sorted = results.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime()
      const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime()
      return dateB - dateA
    })

    const data = sorted.slice(start, end)

    return { data, total, page, limit }
  }

  /**
   * Get user statistics
   * Returns stats matching UserStats interface
   */
  async getStats(organisationId?: string): Promise<UserStats> {
    let all = await this.findAll()
    if (organisationId) {
      all = all.filter((u) => u.organisationId === organisationId)
    }

    const usersByRole: Record<string, number> = {}
    let totalUsers = all.length
    let activeUsers = 0
    let inactiveUsers = 0
    let verifiedUsers = 0
    let trainingCompleted = 0

    for (const user of all) {
      // Count by role
      const role = user.role || 'UNKNOWN'
      usersByRole[role] = (usersByRole[role] || 0) + 1

      // Count active/inactive
      if (user.isActive) {
        activeUsers++
      } else {
        inactiveUsers++
      }

      // Count verified
      if (user.isEmailVerified) {
        verifiedUsers++
      }

      // Count training completed
      if (user.trainingCompletedAt) {
        trainingCompleted++
      }
    }

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByRole,
      verifiedUsers,
      trainingCompleted,
    }
  }

  /**
   * Get user count by role
   */
  async countByRole(organisationId?: string): Promise<Record<UserRole, number>> {
    let all = await this.findAll()
    if (organisationId) {
      all = all.filter((u) => u.organisationId === organisationId)
    }

    const counts: Record<UserRole, number> = {
      [UserRole.SYSTEM_ADMINISTRATOR]: 0,
      [UserRole.BCM_MANAGER]: 0,
      [UserRole.RISK_OWNER]: 0,
      [UserRole.PROCESS_OWNER]: 0,
      [UserRole.BCM_COORDINATOR]: 0,
      [UserRole.IT_RECOVERY_OWNER]: 0,
      [UserRole.APPROVER]: 0,
      [UserRole.AUDITOR]: 0,
      [UserRole.SUPER_ADMIN]: 0,
    }

    for (const user of all) {
      const role = user.role as UserRole
      if (role in counts) {
        counts[role] = (counts[role] || 0) + 1
      }
    }

    return counts
  }

  /**
   * Count users by organisation
   */
  async countByOrganisation(organisationId: string): Promise<number> {
    const users = await this.findByOrganisation(organisationId)
    return users.length
  }

  /**
   * Count active users by organisation
   */
  async countActiveByOrganisation(organisationId: string): Promise<number> {
    const users = await this.findByOrganisation(organisationId)
    return users.filter((u) => u.isActive).length
  }

  /**
   * Get admins (System Administrators and Super Admins)
   */
  async findAdmins(): Promise<User[]> {
    const all = await this.findAll()
    return all.filter((user) => 
      user.role === UserRole.SYSTEM_ADMINISTRATOR || 
      user.role === UserRole.SUPER_ADMIN
    )
  }

  /**
   * Get BCM Managers
   */
  async findBCMManagers(): Promise<User[]> {
    return this.findByRole(UserRole.BCM_MANAGER)
  }

  /**
   * Get users by organisation and active status
   */
  async findByOrganisationAndActive(organisationId: string, isActive: boolean): Promise<User[]> {
    const users = await this.findByOrganisation(organisationId)
    return users.filter((user) => user.isActive === isActive)
  }

  /**
   * Update user active status
   */
  async setActive(uuid: string, isActive: boolean, userId: string = 'system'): Promise<User | null> {
    const result = await this.update(uuid, {
      isActive,
      updatedBy: userId,
      updatedAt: new Date(),
    } as Partial<User>)
    return result || null
  }

  /**
   * Activate user
   */
  async activate(uuid: string, userId: string = 'system'): Promise<User | null> {
    return this.setActive(uuid, true, userId)
  }

  /**
   * Deactivate user
   */
  async deactivate(uuid: string, userId: string = 'system'): Promise<User | null> {
    return this.setActive(uuid, false, userId)
  }

  /**
   * Verify user email
   */
  async verifyEmail(uuid: string, userId: string = 'system'): Promise<User | null> {
    const result = await this.update(uuid, {
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      updatedBy: userId,
      updatedAt: new Date(),
    } as Partial<User>)
    return result || null
  }

  /**
   * Record user login
   */
  async recordLogin(uuid: string): Promise<User | null> {
    const result = await this.update(uuid, {
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    } as Partial<User>)
    return result || null
  }

  /**
   * Increment failed login attempts
   */
  async incrementFailedLoginAttempts(uuid: string): Promise<User | null> {
    const user = await this.findById(uuid)
    if (!user) return null

    const currentAttempts = user.failedLoginAttempts || 0
    const result = await this.update(uuid, {
      failedLoginAttempts: currentAttempts + 1,
      updatedAt: new Date(),
    } as Partial<User>)
    return result || null
  }

  /**
   * Reset failed login attempts
   */
  async resetFailedLoginAttempts(uuid: string): Promise<User | null> {
    const result = await this.update(uuid, {
      failedLoginAttempts: 0,
      updatedAt: new Date(),
    } as Partial<User>)
    return result || null
  }

  /**
   * Lock user account
   */
  async lockAccount(
    uuid: string, 
    reason: string, 
    durationHours?: number,
    userId: string = 'system'
  ): Promise<User | null> {
    const lockedUntil = durationHours ? new Date(Date.now() + durationHours * 60 * 60 * 1000) : null
    const result = await this.update(uuid, {
      lockedAt: new Date(),
      lockedUntil: lockedUntil,
      lockReason: reason,
      isActive: false,
      updatedBy: userId,
      updatedAt: new Date(),
    } as Partial<User>)
    return result || null
  }

  /**
   * Unlock user account
   */
  async unlockAccount(uuid: string, userId: string = 'system'): Promise<User | null> {
    const result = await this.update(uuid, {
      lockedAt: null,
      lockedUntil: null,
      lockReason: undefined,
      isActive: true,
      updatedBy: userId,
      updatedAt: new Date(),
    } as unknown as Partial<User>)
    return result || null
  }

  /**
   * Update user role
   */
  async updateRole(uuid: string, role: UserRole, userId: string = 'system'): Promise<User | null> {
    const result = await this.update(uuid, {
      role,
      updatedBy: userId,
      updatedAt: new Date(),
    } as Partial<User>)
    return result || null
  }

  /**
   * Record training completion
   */
  async recordTrainingCompletion(uuid: string, userId: string = 'system'): Promise<User | null> {
    const result = await this.update(uuid, {
      trainingCompletedAt: new Date(),
      updatedBy: userId,
      updatedAt: new Date(),
    } as Partial<User>)
    return result || null
  }

  /**
   * Bulk update user status
   */
  async bulkUpdateStatus(
    uuids: string[], 
    isActive: boolean, 
    userId: string = 'system'
  ): Promise<{ updated: number; failed: number; errors: string[] }> {
    const result = {
      updated: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const uuid of uuids) {
      try {
        const user = await this.findById(uuid)
        if (!user) {
          result.failed++
          result.errors.push(`User ${uuid} not found`)
          continue
        }

        await this.setActive(uuid, isActive, userId)
        result.updated++
      } catch (error: any) {
        result.failed++
        result.errors.push(error.message || `Failed to update user ${uuid}`)
      }
    }

    return result
  }

  /**
   * Bulk update user roles
   */
  async bulkUpdateRoles(
    updates: { uuid: string; role: UserRole }[], 
    userId: string = 'system'
  ): Promise<{ updated: number; failed: number; errors: string[] }> {
    const result = {
      updated: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const update of updates) {
      try {
        const user = await this.findById(update.uuid)
        if (!user) {
          result.failed++
          result.errors.push(`User ${update.uuid} not found`)
          continue
        }

        await this.updateRole(update.uuid, update.role, userId)
        result.updated++
      } catch (error: any) {
        result.failed++
        result.errors.push(error.message || `Failed to update user ${update.uuid}`)
      }
    }

    return result
  }

  /**
   * Get users without department
   */
  async findWithoutDepartment(): Promise<User[]> {
    return this.table
      .filter((user) => !user.departmentId)
      .toArray()
  }

  /**
   * Get users by department and active status
   */
  async findByDepartmentAndActive(departmentId: string, isActive: boolean): Promise<User[]> {
    const users = await this.findByDepartment(departmentId)
    return users.filter((user) => user.isActive === isActive)
  }

  /**
   * Get recent users (created in last N days)
   */
  async findRecent(days: number = 30): Promise<User[]> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    const all = await this.findAll()
    return all.filter((user) => {
      const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt)
      return createdAt >= cutoff
    })
  }

  /**
   * Search users by full name or email with pagination
   */
  async searchWithPagination(
    query: string,
    page: number = 1,
    limit: number = 20,
    organisationId?: string
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    let results = await this.search(query)
    if (organisationId) {
      results = results.filter((u) => u.organisationId === organisationId)
    }

    const total = results.length
    const start = (page - 1) * limit
    const end = start + limit

    const data = results.slice(start, end)

    return { data, total, page, limit }
  }

  /**
   * Get user count by department
   */
  async countByDepartment(departmentId: string): Promise<number> {
    const users = await this.findByDepartment(departmentId)
    return users.length
  }

  /**
   * Get user count by organisation and role
   */
  async countByOrganisationAndRole(organisationId: string, role: UserRole): Promise<number> {
    const users = await this.findByOrganisationAndRole(organisationId, role)
    return users.length
  }

  /**
   * Check if user exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email)
    return !!user
  }

  /**
   * Get user by email and organisation
   */
  async findByEmailAndOrganisation(email: string, organisationId: string): Promise<User | undefined> {
    const user = await this.findByEmail(email)
    if (user && user.organisationId === organisationId) {
      return user
    }
    return undefined
  }
}