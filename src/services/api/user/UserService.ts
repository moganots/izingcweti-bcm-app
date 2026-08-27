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
    const response = await this.getPaginated<User>(API_ENDPOINTS.USERS.LIST, params as Record<string, any>);
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
      hasMore: response.hasMore || false,
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
    // Backend expects camelCase in DTO
    const payload = {
      email: data.email,
      password: data.password,
      organisationId: data.organisationId,
      departmentId: data.departmentId,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      role: data.role,
    };
    const response = await this.post<User>(API_ENDPOINTS.USERS.BASE, payload);
    return this.extractData(response);
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    // Backend expects camelCase in DTO
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
    };
    // Remove undefined values
    Object.keys(payload).forEach((key) => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });
    const response = await this.patch<User>(API_ENDPOINTS.USERS.UPDATE(id), payload);
    return this.extractData(response);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      preferences: data.preferences,
      avatarUrl: data.avatarUrl,
      metadata: data.metadata,
    };
    Object.keys(payload).forEach((key) => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });
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
      newPassword: newPassword,
    });
  }

  // ============================================
  // User Queries
  // ============================================

  async getUsersByOrganisation(
    organisationId: string,
    params?: UserQueryParams
  ): Promise<PaginatedResponse<User>> {
    const response = await this.getPaginated<User>(
      API_ENDPOINTS.USERS.BY_ORGANISATION(organisationId),
      params as Record<string, any>
    );
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
      hasMore: response.hasMore || false,
    };
  }

  async getUsersByRole(role: UserRole, params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    const response = await this.getPaginated<User>(
      API_ENDPOINTS.USERS.BY_ROLE(role),
      params as Record<string, any>
    );
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
      hasMore: response.hasMore || false,
    };
  }

  async getActiveUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    const response = await this.getPaginated<User>(
      API_ENDPOINTS.USERS.ACTIVE,
      params as Record<string, any>
    );
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 1,
      hasMore: response.hasMore || false,
    };
  }

  async getInactiveUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
    return this.getUsers({ ...params, isActive: false });
  }

  // ============================================
  // Statistics & Analytics
  // ============================================

  async getStats(organisationId?: string): Promise<UserStats> {
    const params = organisationId ? { organisationId } : undefined;
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
      trainingCompletedAt: completed ? new Date().toISOString() : null,
    });
    return this.extractData(response);
  }

  // ============================================
  // Export & Import
  // ============================================

  async exportUsers(params?: {
    organisationId?: string;
    role?: UserRole;
    format?: 'csv' | 'json';
  }): Promise<void> {
    await this.download(API_ENDPOINTS.USERS.EXPORT, `users_export.${params?.format || 'json'}`, {
      params: params as Record<string, any>,
    });
  }

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
      })),
    });
    return this.extractData(response);
  }

  async resendInvitation(id: string): Promise<void> {
    await this.post(API_ENDPOINTS.USERS.RESEND_INVITATION(id));
  }
}

export const userService = new UserService();