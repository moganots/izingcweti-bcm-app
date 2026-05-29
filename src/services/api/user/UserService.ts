import { BaseService } from '../../BaseService'
import { API_ENDPOINTS } from '../../../core/constants/api.constants'
import {
  UserRole,
  type User,
  type UserPreferences,
  type CreateUserRequest,
  type UpdateUserRequest,
  type PaginatedResponse,
  type QueryParams,
} from '../../../modules'

export interface UserQueryParams extends QueryParams {
  organisation_id?: string
  role?: UserRole
  is_active?: boolean
  training_completed?: boolean
  search?: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

export interface UpdateProfileRequest {
  email?: string
  first_name?: string
  last_name?: string
  phone?: string
  avatar?: string
  preferences?: Partial<UserPreferences>
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  trainingCompleted: number
  trainingPending: number
  byRole: Record<UserRole, number>
  byOrganisation: Record<string, number>
}

export interface BulkImportResult {
  created: number
  updated: number
  failed: number
  errors: string[]
}

export class UserService extends BaseService {
  async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getPaginated<User>(API_ENDPOINTS.USERS.BASE, params as Record<string, any>)
  }

  async getUser(id: string): Promise<User> {
    const response = await this.get<User>(API_ENDPOINTS.USERS.BY_ID(id))
    return this.extractData(response)
  }

  async getProfile(): Promise<User> {
    const response = await this.get<User>(API_ENDPOINTS.USERS.PROFILE)
    return this.extractData(response)
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await this.post<User>(API_ENDPOINTS.USERS.BASE, data)
    return this.extractData(response)
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await this.put<User>(API_ENDPOINTS.USERS.BY_ID(id), data)
    return this.extractData(response)
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await this.put<User>(API_ENDPOINTS.USERS.PROFILE, data)
    return this.extractData(response)
  }

  async deleteUser(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.USERS.BY_ID(id))
  }

  async deactivateUser(id: string): Promise<User> {
    const response = await this.patch<User>(API_ENDPOINTS.USERS.DEACTIVATE(id))
    return this.extractData(response)
  }

  async activateUser(id: string): Promise<User> {
    const response = await this.patch<User>(API_ENDPOINTS.USERS.ACTIVATE(id))
    return this.extractData(response)
  }

  async changeUserPassword(id: string, data: { new_password: string }): Promise<void> {
    const response = await this.post(API_ENDPOINTS.USERS.CHANGE_PASSWORD(id), data)
    this.extractData(response)
  }

  async getUsersByOrganisation(
    organisationId: string,
    params?: UserQueryParams
  ): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, organisation_id: organisationId })
  }

  async getUsersByRole(role: UserRole, params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, role })
  }

  async getActiveUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, is_active: true })
  }

  async getInactiveUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, is_active: false })
  }

  async getUsersPendingTraining(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, training_completed: false })
  }

  async getUsersCompletedTraining(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, training_completed: true })
  }

  async getStats(organisationId?: string): Promise<UserStats> {
    const params = organisationId ? { organisation_id: organisationId } : undefined
    const response = await this.get<UserStats>(API_ENDPOINTS.USERS.STATISTICS, params)
    return this.extractData(response)
  }

  async searchUsers(query: string, params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, search: query })
  }

  async updateTrainingStatus(id: string, completed: boolean): Promise<User> {
    const response = await this.patch<User>(API_ENDPOINTS.USERS.UPDATE_TRAINING(id), {
      training_completed_at: completed ? new Date().toISOString() : null,
    })
    return this.extractData(response)
  }

  async permanentlyDeleteUser(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.USERS.PERMANENT_DELETE(id))
  }

  async restoreUser(id: string): Promise<User> {
    const response = await this.post<User>(API_ENDPOINTS.USERS.RESTORE(id))
    return this.extractData(response)
  }

  async changeMyPassword(data: ChangePasswordRequest): Promise<void> {
    const response = await this.post(API_ENDPOINTS.USERS.CHANGE_MY_PASSWORD, data)
    this.extractData(response)
  }

  async bulkImportUsers(users: CreateUserRequest[]): Promise<BulkImportResult> {
    const response = await this.post<BulkImportResult>(API_ENDPOINTS.USERS.BULK_IMPORT, { users })
    return this.extractData(response)
  }

  async exportUsers(params?: {
    organisation_id?: string
    role?: UserRole
    format?: 'csv' | 'json'
  }): Promise<void> {
    const format = params?.format || 'csv'
    await this.download(
      API_ENDPOINTS.USERS.EXPORT,
      `users_export_${new Date().toISOString().split('T')[0]}.${format}`,
      { params: params as Record<string, any> }
    )
  }

  async resendInvitation(id: string): Promise<void> {
    await this.post(API_ENDPOINTS.USERS.RESEND_INVITATION(id))
  }

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const response = await this.get<UserPreferences>(API_ENDPOINTS.USERS.PREFERENCES(userId))
    return this.extractData(response)
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const response = await this.put<UserPreferences>(
      API_ENDPOINTS.USERS.PREFERENCES(userId),
      preferences
    )
    return this.extractData(response)
  }

  async getMySessions(): Promise<any[]> {
    const response = await this.get<any[]>(API_ENDPOINTS.USERS.MY_SESSIONS)
    return this.extractData(response)
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.delete(API_ENDPOINTS.USERS.REVOKE_SESSION(sessionId))
  }

  async revokeOtherSessions(): Promise<void> {
    await this.post(API_ENDPOINTS.USERS.REVOKE_OTHER_MY_SESSIONS)
  }

  async getUserRoles(): Promise<UserRole[]> {
    const response = await this.get<UserRole[]>(API_ENDPOINTS.USERS.ROLES)
    return this.extractData(response)
  }

  async verifyEmail(token: string): Promise<void> {
    await this.post(API_ENDPOINTS.USERS.VERIFY_EMAIL, { token })
  }

  async resendVerificationEmail(): Promise<void> {
    await this.post(API_ENDPOINTS.USERS.RESEND_VERIFICATION)
  }
}

export const userService = new UserService()
