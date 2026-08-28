import { BaseService } from '../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import type {
  AuthTokens,
  LoginCredentials,
  LoginResponse,
  RegistrationData,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthToken,
  SessionInfo,
  User,
  BulkImportResult,
  LockAccountRequest,
  UserQueryParams,
  PaginatedResponse,
  UserStats,
  CreateUserRequest,
  UpdateUserRequest,
  UserRole,
} from './../../../models/entities/user/user.entity'

/**
 * Auth Service - Aligned with Backend DTOs (camelCase)
 */
export class AuthService extends BaseService {
  // ============================================
  // Authentication
  // ============================================

  /**
   * Login - POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (!credentials || !credentials.email || !credentials.password) {
      throw new Error('Email and password are required')
    }

    // Backend expects camelCase in DTO
    const payload = {
      email: credentials.email,
      password: credentials.password,
    }

    const response = await this.post<{
      accessToken: string
      refreshToken: string
      expiresIn: number
      tokenType: string
      user: User
    }>(API_ENDPOINTS.AUTH.LOGIN, payload)

    const data = this.extractData(response)

    // Store tokens
    this.setAuthToken(data.accessToken)
    this.setRefreshToken(data.refreshToken)

    // Return camelCase response
    return {
      tokens: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn || 3600,
        tokenType: data.tokenType || 'Bearer',
      },
      user: data.user,
      requiresMfa: false,
      mfaToken: '',
    }
  }

  /**
   * Register - POST /auth/register
   */
  async register(data: RegistrationData): Promise<User> {
    const payload = {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      organisationId: data.organisationId,
      departmentId: data.departmentId,
      phoneNumber: data.phoneNumber,
      role: data.role,
    }
    // Remove undefined values
    Object.keys(payload).forEach((key) => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload]
      }
    })

    const response = await this.post<User>(API_ENDPOINTS.AUTH.REGISTER, payload)
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
   * Logout - POST /auth/logout
   */
  async logout(): Promise<void> {
    try {
      await this.post(API_ENDPOINTS.AUTH.LOGOUT)
    } finally {
      this.clearAuthTokens()
    }
  }

  /**
   * Logout All Devices - POST /auth/logout-all
   */
  async logoutAllDevices(): Promise<void> {
    try {
      await this.post(API_ENDPOINTS.AUTH.LOGOUT_ALL)
    } finally {
      this.clearAuthTokens()
    }
  }

  /**
   * Refresh Token - POST /auth/refresh
   */
  async refreshToken(): Promise<AuthTokens | null> {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) return null

      const response = await this.post<{
        accessToken: string
        refreshToken?: string
        expiresIn: number
      }>(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken: refreshToken,
      })

      const data = this.extractData(response)

      if (!data || !data.accessToken) {
        throw new Error('Invalid refresh response')
      }

      this.setAuthToken(data.accessToken)
      if (data.refreshToken) {
        this.setRefreshToken(data.refreshToken)
      }

      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || refreshToken,
        expiresIn: data.expiresIn || 3600,
        tokenType: 'Bearer',
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.clearAuthTokens()
      return null
    }
  }

  /**
   * Validate Token - POST /auth/validate
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.get(API_ENDPOINTS.AUTH.VALIDATE)
      return true
    } catch {
      return false
    }
  }

  // ============================================
  // Password Management
  // ============================================

  /**
   * Change Password - POST /auth/change-password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    const payload = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }
    await this.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, payload)
  }

  /**
   * Forgot Password - POST /auth/forgot-password
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data)
  }

  /**
   * Reset Password - POST /auth/reset-password
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    const payload = {
      token: data.token,
      newPassword: data.newPassword,
    }
    await this.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload)
  }

  // ============================================
  // Session Management
  // ============================================

  /**
   * Get Sessions - GET /auth/sessions
   */
  async getSessions(): Promise<SessionInfo[]> {
    const response = await this.get<SessionInfo[]>(API_ENDPOINTS.AUTH.SESSIONS)
    return this.extractData(response)
  }

  /**
   * Revoke Session - DELETE /auth/sessions/:tokenId
   */
  async revokeSession(sessionId: string): Promise<void> {
    await this.delete(API_ENDPOINTS.AUTH.SESSION(sessionId))
  }

  // ============================================
  // Token Management
  // ============================================

  /**
   * Get User Tokens - GET /auth/tokens/users/:userId
   */
  async getUserTokens(userId: string): Promise<AuthToken[]> {
    const response = await this.get<AuthToken[]>(
      API_ENDPOINTS.AUTH_TOKENS.BY_USER_ID(userId)
    )
    return this.extractData(response)
  }

  /**
   * Revoke Token - POST /auth/tokens/:tokenId/revoke
   */
  async revokeToken(tokenId: string): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH_TOKENS.REVOKE(tokenId))
  }

  /**
   * Revoke All User Tokens - POST /auth/tokens/users/:userId/revoke-all
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH_TOKENS.REVOKE_ALL_BY_USER(userId))
  }

  /**
   * Get My Tokens - GET /auth/tokens/me/tokens
   */
  async getMyTokens(page: number = 1, limit: number = 10): Promise<PaginatedResponse<AuthToken>> {
    const response = await this.getPaginated<AuthToken>(
      API_ENDPOINTS.AUTH_TOKENS.MY_TOKENS,
      { page, limit }
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
   * Revoke Current Token - POST /auth/tokens/me/revoke
   */
  async revokeCurrentToken(): Promise<void> {
    await this.post(API_ENDPOINTS.AUTH_TOKENS.REVOKE_CURRENT)
  }

  /**
   * Cleanup Expired Tokens - POST /auth/tokens/cleanup
   */
  async cleanupExpiredTokens(): Promise<{
    revoked: number
    expired: number
    totalCleaned: number
  }> {
    const response = await this.post<{
      revoked: number
      expired: number
      totalCleaned: number
    }>(API_ENDPOINTS.AUTH_TOKENS.CLEANUP)
    const data = this.extractData(response)
    return {
      revoked: data.revoked,
      expired: data.expired,
      totalCleaned: data.totalCleaned,
    }
  }

  // ============================================
  // Profile & User Management
  // ============================================

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
   * Get User By ID - GET /auth/users/:uuid
   */
  async getUserById(userId: string): Promise<User> {
    const response = await this.get<User>(API_ENDPOINTS.USERS.BY_ID(userId))
    return this.extractData(response)
  }

  /**
   * Update User - PATCH /auth/users/:uuid
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
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
    const response = await this.patch<User>(
      API_ENDPOINTS.USERS.UPDATE(userId),
      payload
    )
    return this.extractData(response)
  }

  /**
   * Change User Password - POST /auth/users/:uuid/change-password
   */
  async changeUserPassword(userId: string, newPassword: string): Promise<void> {
    await this.post(API_ENDPOINTS.USERS.CHANGE_USER_PASSWORD(userId), {
      newPassword,
    })
  }

  /**
   * Deactivate User - PATCH /auth/users/:uuid/deactivate
   */
  async deactivateUser(userId: string): Promise<User> {
    const response = await this.patch<User>(API_ENDPOINTS.USERS.DEACTIVATE(userId))
    return this.extractData(response)
  }

  /**
   * Activate User - PATCH /auth/users/:uuid/activate
   */
  async activateUser(userId: string): Promise<User> {
    const response = await this.patch<User>(API_ENDPOINTS.USERS.ACTIVATE(userId))
    return this.extractData(response)
  }

  /**
   * Lock User Account - POST /auth/users/:uuid/lock
   */
  async lockUserAccount(userId: string, data: LockAccountRequest): Promise<void> {
    await this.post(API_ENDPOINTS.USERS.LOCK_ACCOUNT(userId), data)
  }

  /**
   * Unlock User Account - POST /auth/users/:uuid/unlock
   */
  async unlockUserAccount(userId: string): Promise<void> {
    await this.post(API_ENDPOINTS.USERS.UNLOCK_ACCOUNT(userId))
  }

  /**
   * Delete User - DELETE /auth/users/:uuid (Super Admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    await this.delete(API_ENDPOINTS.USERS.DELETE(userId))
  }

  // ============================================
  // User Management (Admin)
  // ============================================

  /**
   * Get Users - GET /auth/users
   */
  async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    const response = await this.getPaginated<User>(
      API_ENDPOINTS.USERS.LIST,
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
   * Get User Statistics - GET /auth/users/statistics
   */
  async getUserStats(organisationId?: string): Promise<UserStats> {
    const params = organisationId ? { organisationId } : undefined
    const response = await this.get<UserStats>(API_ENDPOINTS.USERS.STATISTICS, params)
    return this.extractData(response)
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
   * Update Training Status - PATCH /auth/users/:uuid/training-completed
   */
  async updateTrainingStatus(userId: string, completed: boolean): Promise<User> {
    const response = await this.patch<User>(API_ENDPOINTS.USERS.UPDATE_TRAINING(userId), {
      trainingCompletedAt: completed ? new Date().toISOString() : null,
    })
    return this.extractData(response)
  }

  /**
   * Resend Invitation - POST /auth/users/:uuid/resend-invitation
   */
  async resendInvitation(userId: string): Promise<void> {
    await this.post(API_ENDPOINTS.USERS.RESEND_INVITATION(userId))
  }

  // ============================================
  // Auth Cleanup (Admin)
  // ============================================

  /**
   * Cleanup Expired Tokens (Admin) - DELETE /auth/cleanup
   */
  async adminCleanupExpiredTokens(): Promise<{ count: number }> {
    const response = await this.delete<{ count: number }>(API_ENDPOINTS.AUTH.CLEANUP)
    return this.extractData(response)
  }
}

export const authService = new AuthService()