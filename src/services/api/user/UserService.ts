import { BaseService } from '../../BaseService'
import {
  // Enums
  UserRole,
  // Types
  type User,
  type UserPreferences,
  type CreateUserRequest,
  type UpdateUserRequest,
  // Shared Types
  type PaginatedResponse,
  type QueryParams,
} from '../../../modules'

/**
 * User Query Parameters
 */
export interface UserQueryParams extends QueryParams {
  organisation_id?: string
  role?: UserRole
  is_active?: boolean
  training_completed?: boolean
  search?: string
}

/**
 * Change Password Request
 */
export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

/**
 * Update Profile Request
 */
export interface UpdateProfileRequest {
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
  avatar?: string
  preferences?: Partial<UserPreferences>
}

/**
 * User Statistics
 */
export interface UserStats {
  total: number
  active: number
  inactive: number
  trainingCompleted: number
  trainingPending: number
  byRole: Record<UserRole, number>
  byOrganisation: Record<string, number>
}

/**
 * Bulk Import Result
 */
export interface BulkImportResult {
  created: number
  updated: number
  failed: number
  errors: string[]
}

/**
 * User API Service
 * Uses consolidated module types and enums
 */
export class UserService extends BaseService {
  /**
   * Get all users with pagination and filters
   */
  async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getPaginated<User>('/users', params as Record<string, any>)
  }

  /**
   * Get user by ID
   */
  async getUser(id: string): Promise<User> {
    const response = await this.get<User>(`/users/${id}`)
    return this.extractData(response)
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await this.get<User>('/users/profile')
    return this.extractData(response)
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await this.post<User>('/users', data)
    return this.extractData(response)
  }

  /**
   * Update a user
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await this.put<User>(`/users/${id}`, data)
    return this.extractData(response)
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await this.put<User>('/users/profile', data)
    return this.extractData(response)
  }

  /**
   * Delete a user (soft delete)
   */
  async deleteUser(id: string): Promise<void> {
    await this.delete(`/users/${id}`)
  }

  /**
   * Permanently delete a user
   */
  async permanentlyDeleteUser(id: string): Promise<void> {
    await this.delete(`/users/${id}/permanent`)
  }

  /**
   * Restore a deleted user
   */
  async restoreUser(id: string): Promise<User> {
    const response = await this.post<User>(`/users/${id}/restore`)
    return this.extractData(response)
  }

  /**
   * Deactivate a user
   */
  async deactivateUser(id: string): Promise<User> {
    const response = await this.patch<User>(`/users/${id}/deactivate`)
    return this.extractData(response)
  }

  /**
   * Activate a user
   */
  async activateUser(id: string): Promise<User> {
    const response = await this.patch<User>(`/users/${id}/activate`)
    return this.extractData(response)
  }

  /**
   * Change user password (admin)
   */
  async changeUserPassword(id: string, data: { new_password: string }): Promise<void> {
    const response = await this.post(`/users/${id}/change-password`, data)
    this.extractData(response)
  }

  /**
   * Change current user password
   */
  async changeMyPassword(data: ChangePasswordRequest): Promise<void> {
    const response = await this.post('/users/change-password', data)
    this.extractData(response)
  }

  /**
   * Get users by organisation
   */
  async getUsersByOrganisation(
    organisationId: string,
    params?: UserQueryParams
  ): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, organisation_id: organisationId })
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole, params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, role })
  }

  /**
   * Get active users
   */
  async getActiveUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, is_active: true })
  }

  /**
   * Get inactive users
   */
  async getInactiveUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, is_active: false })
  }

  /**
   * Get users with pending training
   */
  async getUsersPendingTraining(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, training_completed: false })
  }

  /**
   * Get users with completed training
   */
  async getUsersCompletedTraining(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, training_completed: true })
  }

  /**
   * Get user statistics
   */
  async getStats(organisationId?: string): Promise<UserStats> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<UserStats>('/users/stats', params)
    return this.extractData(response)
  }

  /**
   * Search users
   */
  async searchUsers(query: string, params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, search: query })
  }

  /**
   * Bulk import users
   */
  async bulkImportUsers(users: CreateUserRequest[]): Promise<BulkImportResult> {
    const response = await this.post<BulkImportResult>('/users/bulk-import', { users })
    return this.extractData(response)
  }

  /**
   * Export users
   */
  async exportUsers(params?: {
    organisation_id?: string
    role?: UserRole
    format?: 'csv' | 'json'
  }): Promise<void> {
    const format = params?.format || 'csv'
    await this.download(
      '/users/export',
      `users_export_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: params as Record<string, any> }
    )
  }

  /**
   * Resend invitation email
   */
  async resendInvitation(id: string): Promise<void> {
    await this.post(`/users/${id}/resend-invitation`)
  }

  /**
   * Update user training status
   */
  async updateTrainingStatus(id: string, completed: boolean): Promise<User> {
    const response = await this.patch<User>(`/users/${id}/training`, {
      training_completed_at: completed ? new Date().toISOString() : null,
    })
    return this.extractData(response)
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const response = await this.get<UserPreferences>(`/users/${userId}/preferences`)
    return this.extractData(response)
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const response = await this.put<UserPreferences>(`/users/${userId}/preferences`, preferences)
    return this.extractData(response)
  }

  /**
   * Get current user's sessions
   */
  async getMySessions(): Promise<any[]> {
    const response = await this.get<any[]>('/users/sessions')
    return this.extractData(response)
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await this.delete(`/users/sessions/${sessionId}`)
  }

  /**
   * Revoke all other sessions
   */
  async revokeOtherSessions(): Promise<void> {
    await this.post('/users/sessions/revoke-others')
  }

  /**
   * Get available user roles
   */
  async getUserRoles(): Promise<UserRole[]> {
    const response = await this.get<UserRole[]>('/users/roles')
    return this.extractData(response)
  }

  /**
   * Verify user email
   */
  async verifyEmail(token: string): Promise<void> {
    await this.post('/users/verify-email', { token })
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<void> {
    await this.post('/users/resend-verification')
  }
}

// Export singleton
export const userService = new UserService()
