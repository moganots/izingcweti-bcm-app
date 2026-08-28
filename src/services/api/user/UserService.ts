import { BaseService } from '../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
  UserRole,
  type User,
  type CreateUserRequest,
  type UpdateUserRequest,
  type PaginatedResponse,
  type UserQueryParams,
  type UserStats,
  type BulkImportResult,
  type LockAccountRequest,
} from '../../../models/entities/user/user.entity'

/**
 * User Service - Aligned with Backend DTOs (camelCase)
 * Wraps AuthService for user management operations
 */
export class UserService extends BaseService {
  // ============================================
  // User CRUD Operations
  // ============================================

  /**
   * Get Users - GET /auth/users
   */
  async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    const response = await this.getPaginated<User>(API_ENDPOINTS.USERS.LIST, params as Record<string, any>)
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
      hasMore: response.hasMore || false,
    }
  }

  /**
   * Get User By ID - GET /auth/users/:uuid
   */
  async getUser(id: string): Promise<User> {
    const response = await this.get<User>(API_ENDPOINTS.USERS.BY_ID(id))
    return this.extractData(response)
  }

  /**
   * Get Profile - GET /auth/users/profile
   */
  async getProfile(): Promise<User> {
    const response = await this.get<User>(API_ENDPOINTS.USERS.PROFILE)
    return this.extractData(response)
  }

  /**
   * Create User - POST /auth/users
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    const payload = {
      email: data.email,
      password: data.password,
      organisationId: data.organisationId,
      departmentId: data.departmentId,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      role: data.role,
      preferences: data.preferences,
      isActive: data.isActive,
      isEmailVerified: data.isEmailVerified,
    }
    Object.keys(payload).forEach((key) => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload]
      }
    })
    const response = await this.post<User>(API_ENDPOINTS.USERS.BASE, payload)
    return this.extractData(response)
  }

  /**
   * Update User - PATCH /auth/users/:uuid
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      role: data.role,
      isActive: data.isActive,
      preferences: data.preferences,
      departmentId: data.departmentId,
      avatarUrl: data.avatarUrl,
      metadata: data.metadata,
    }
    Object.keys(payload).forEach((key) => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload]
      }
    })
    const response = await this.patch<User>(API_ENDPOINTS.USERS.UPDATE(id), payload)
    return this.extractData(response)
  }

  /**
   * Update Profile - PATCH /auth/users/profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      preferences: data.preferences,
      avatarUrl: data.avatarUrl,
      metadata: data.metadata,
    }
    Object.keys(payload).forEach((key) => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload]
      }
    })
    const response = await this.patch<User>(API_ENDPOINTS.USERS.PROFILE, payload)
    return this.extractData(response)
  }

  /**
   * Delete User - DELETE /auth/users/:uuid (Super Admin only)
   */
  async deleteUser(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.USERS.DELETE(id))
  }

  // ============================================
  // User Status Management
  // ============================================

  /**
   * Deactivate User - PATCH /auth/users/:uuid/deactivate
   */
  async deactivateUser(id: string): Promise<User> {
    const response = await this.patch<User>(API_ENDPOINTS.USERS.DEACTIVATE(id))
    return this.extractData(response)
  }

  /**
   * Activate User - PATCH /auth/users/:uuid/activate
   */
  async activateUser(id: string): Promise<User> {
    const response = await this.patch<User>(API_ENDPOINTS.USERS.ACTIVATE(id))
    return this.extractData(response)
  }

  /**
   * Lock User Account - POST /auth/users/:uuid/lock
   */
  async lockUserAccount(id: string, data: LockAccountRequest): Promise<void> {
    await this.post(API_ENDPOINTS.USERS.LOCK_ACCOUNT(id), data)
  }

  /**
   * Unlock User Account - POST /auth/users/:uuid/unlock
   */
  async unlockUserAccount(id: string): Promise<void> {
    await this.post(API_ENDPOINTS.USERS.UNLOCK_ACCOUNT(id))
  }

  /**
   * Change User Password - POST /auth/users/:uuid/change-password
   */
  async changeUserPassword(id: string, newPassword: string): Promise<void> {
    await this.post(API_ENDPOINTS.USERS.CHANGE_USER_PASSWORD(id), {
      newPassword,
    })
  }

  // ============================================
  // User Queries
  // ============================================

  /**
   * Get Users By Organisation - GET /auth/users/organisation/:organisationId
   */
  async getUsersByOrganisation(
    organisationId: string,
    params?: UserQueryParams
  ): Promise<PaginatedResponse<User>> {
    const response = await this.getPaginated<User>(
      API_ENDPOINTS.USERS.BY_ORGANISATION(organisationId),
      params as Record<string, any>
    )
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
      hasMore: response.hasMore || false,
    }
  }

  /**
   * Get Users By Role - GET /auth/users/role/:role
   */
  async getUsersByRole(role: UserRole, params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    const response = await this.getPaginated<User>(
      API_ENDPOINTS.USERS.BY_ROLE(role),
      params as Record<string, any>
    )
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
      hasMore: response.hasMore || false,
    }
  }

  /**
   * Get Active Users - GET /auth/users/active
   */
  async getActiveUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    const response = await this.getPaginated<User>(
      API_ENDPOINTS.USERS.ACTIVE,
      params as Record<string, any>
    )
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
      hasMore: response.hasMore || false,
    }
  }

  /**
   * Get Inactive Users
   */
  async getInactiveUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, isActive: false })
  }

  // ============================================
  // Statistics & Analytics
  // ============================================

  /**
   * Get User Statistics - GET /auth/users/statistics
   */
  async getStats(organisationId?: string): Promise<UserStats> {
    const params = organisationId ? { organisationId } : undefined
    const response = await this.get<UserStats>(API_ENDPOINTS.USERS.STATISTICS, params)
    return this.extractData(response)
  }

  // ============================================
  // Search & Export
  // ============================================

  /**
   * Search Users
   */
  async searchUsers(query: string, params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, search: query })
  }

  /**
   * Update Training Status - PATCH /auth/users/:uuid/training-completed
   */
  async updateTrainingStatus(id: string, completed: boolean): Promise<User> {
    const response = await this.patch<User>(API_ENDPOINTS.USERS.UPDATE_TRAINING(id), {
      trainingCompletedAt: completed ? new Date().toISOString() : null,
    })
    return this.extractData(response)
  }

  // ============================================
  // Export & Import
  // ============================================

  /**
   * Export Users - GET /auth/users/export
   */
  async exportUsers(params?: {
    organisationId?: string
    role?: UserRole
    format?: 'csv' | 'json'
  }): Promise<void> {
    await this.download(API_ENDPOINTS.USERS.EXPORT, `users_export.${params?.format || 'json'}`, {
      params: params as Record<string, any>,
    })
  }

  /**
   * Bulk Import Users - POST /auth/users/bulk-import
   */
  async bulkImportUsers(usersData: CreateUserRequest[]): Promise<BulkImportResult> {
    const response = await this.post<BulkImportResult>(API_ENDPOINTS.USERS.BULK_IMPORT, {
      users: usersData.map((u) => ({
        email: u.email,
        password: u.password,
        organisationId: u.organisationId,
        departmentId: u.departmentId,
        firstName: u.firstName,
        lastName: u.lastName,
        phoneNumber: u.phoneNumber,
        role: u.role,
        preferences: u.preferences,
        isActive: u.isActive,
        isEmailVerified: u.isEmailVerified,
      })),
    })
    return this.extractData(response)
  }

  /**
   * Resend Invitation - POST /auth/users/:uuid/resend-invitation
   */
  async resendInvitation(id: string): Promise<void> {
    await this.post(API_ENDPOINTS.USERS.RESEND_INVITATION(id))
  }
}

export const userService = new UserService()