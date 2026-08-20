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
} from '../../../models/entities/user/user.entity'

export interface BulkImportResult {
  created: number
  updated: number
  failed: number
  errors: string[]
}

export class UserService extends BaseService {
  // ============================================
  // User CRUD Operations
  // ============================================

  async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    const queryParams = this.mapQueryParamsToSnakeCase(params || {});
    const response = await this.getPaginated<User>(API_ENDPOINTS.USERS.LIST, queryParams);
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
    };
  }

  async getUser(id: string): Promise<User> {
    const response = await this.get<User>(API_ENDPOINTS.USERS.BY_ID(id));
    return this.extractData(response);
  }

  async getProfile(): Promise<User> {
    const response = await this.get<User>(API_ENDPOINTS.USERS.PROFILE);
    return this.extractData(response);
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const payload = {
      email: data.email,
      password: data.password,
      organisation_id: data.organisationId,
      department_id: data.departmentId,
      first_name: data.firstName,
      last_name: data.lastName,
      phone_number: data.phoneNumber,
      role: data.role,
    };
    const response = await this.post<User>(API_ENDPOINTS.USERS.BASE, payload);
    return this.extractData(response);
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const payload = this.mapUpdateRequestToSnakeCase(data);
    const response = await this.patch<User>(API_ENDPOINTS.USERS.UPDATE(id), payload);
    return this.extractData(response);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const payload = this.mapUserToSnakeCase(data);
    const response = await this.patch<User>(API_ENDPOINTS.USERS.PROFILE, payload);
    return this.extractData(response);
  }

  async deleteUser(id: string): Promise<void> {
    await this.delete(API_ENDPOINTS.USERS.DELETE(id));
  }

  // ============================================
  // User Status Management
  // ============================================

  async deactivateUser(id: string): Promise<User> {
    const response = await this.patch<User>(API_ENDPOINTS.USERS.DEACTIVATE(id));
    return this.extractData(response);
  }

  async activateUser(id: string): Promise<User> {
    const response = await this.patch<User>(API_ENDPOINTS.USERS.ACTIVATE(id));
    return this.extractData(response);
  }

  async changeUserPassword(id: string, newPassword: string): Promise<void> {
    await this.post(API_ENDPOINTS.USERS.CHANGE_USER_PASSWORD(id), {
      new_password: newPassword,
    });
  }

  // ============================================
  // User Queries
  // ============================================

  async getUsersByOrganisation(
    organisationId: string,
    params?: UserQueryParams
  ): Promise<PaginatedResponse<User>> {
    const queryParams = this.mapQueryParamsToSnakeCase(params || {});
    const response = await this.getPaginated<User>(
      API_ENDPOINTS.USERS.BY_ORGANISATION(organisationId),
      queryParams
    );
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
    };
  }

  async getUsersByRole(role: UserRole, params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    const queryParams = this.mapQueryParamsToSnakeCase(params || {});
    const response = await this.getPaginated<User>(
      API_ENDPOINTS.USERS.BY_ROLE(role),
      queryParams
    );
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
    };
  }

  async getActiveUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    const queryParams = this.mapQueryParamsToSnakeCase(params || {});
    const response = await this.getPaginated<User>(
      API_ENDPOINTS.USERS.ACTIVE,
      queryParams
    );
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
    };
  }

  async getInactiveUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, isActive: false });
  }

  // ============================================
  // Statistics & Analytics
  // ============================================

  async getStats(organisationId?: string): Promise<UserStats> {
    const params = organisationId ? { organisation_id: organisationId } : undefined;
    const response = await this.get<UserStats>(API_ENDPOINTS.USERS.STATISTICS, params);
    return this.extractData(response);
  }

  // ============================================
  // Search & Export
  // ============================================

  async searchUsers(query: string, params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, search: query });
  }

  async updateTrainingStatus(id: string, completed: boolean): Promise<User> {
    const response = await this.patch<User>(API_ENDPOINTS.USERS.UPDATE_TRAINING(id), {
      training_completed_at: completed ? new Date().toISOString() : null,
    });
    return this.extractData(response);
  }

  // ============================================
  // Helper Methods - DTO to Entity Mappers
  // ============================================

  /**
   * Map camelCase query params to snake_case for backend
   */
  private mapQueryParamsToSnakeCase(params: UserQueryParams): Record<string, any> {
    const mapped: Record<string, any> = {};

    if (params.organisationId) mapped.organisation_id = params.organisationId;
    if (params.departmentId) mapped.department_id = params.departmentId;
    if (params.role) mapped.role = params.role;
    if (params.isActive !== undefined) mapped.is_active = params.isActive;
    if (params.search) mapped.search = params.search;
    if (params.page) mapped.page = params.page;
    if (params.limit) mapped.limit = params.limit;
    if (params.sortBy) mapped.sort_by = params.sortBy;
    if (params.sortOrder) mapped.sort_order = params.sortOrder;
    if (params.startDate) mapped.start_date = params.startDate;
    if (params.endDate) mapped.end_date = params.endDate;

    return mapped;
  }

  /**
   * Map camelCase User to snake_case for backend
   */
  private mapUserToSnakeCase(data: Partial<User>): Record<string, any> {
    const mapped: Record<string, any> = {};

    if (data.first_name !== undefined) mapped.first_name = data.first_name;
    if (data.last_name !== undefined) mapped.last_name = data.last_name;
    if (data.phone_number !== undefined) mapped.phone_number = data.phone_number;
    if (data.role !== undefined) mapped.role = data.role;
    if (data.is_active !== undefined) mapped.is_active = data.is_active;
    if (data.preferences !== undefined) mapped.preferences = data.preferences;
    if (data.department_id !== undefined) mapped.department_id = data.department_id;
    if (data.avatar_url !== undefined) mapped.avatar_url = data.avatar_url;
    if (data.email !== undefined) mapped.email = data.email;
    if (data.organisation_id !== undefined) mapped.organisation_id = data.organisation_id;

    return mapped;
  }

  /**
   * Map camelCase UpdateUserRequest to snake_case for backend
   */
  private mapUpdateRequestToSnakeCase(data: UpdateUserRequest): Record<string, any> {
    const mapped: Record<string, any> = {};

    if (data.firstName !== undefined) mapped.first_name = data.firstName;
    if (data.lastName !== undefined) mapped.last_name = data.lastName;
    if (data.phoneNumber !== undefined) mapped.phone_number = data.phoneNumber;
    if (data.role !== undefined) mapped.role = data.role;
    if (data.isActive !== undefined) mapped.is_active = data.isActive;
    if (data.preferences !== undefined) mapped.preferences = data.preferences;
    if (data.departmentId !== undefined) mapped.department_id = data.departmentId;

    return mapped;
  }
}

export const userService = new UserService();