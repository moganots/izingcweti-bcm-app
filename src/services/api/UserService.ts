import { BaseService } from './BaseService'
import { API_ENDPOINTS } from '../../utils/constants'
import type { PaginatedResponse } from '../../types/common.types'
import type { UserQueryParams } from '../../types/bcm.types'

/**
 * User interface
 */
export interface User {
    uuid: string
    email: string
    organisation_id: string
    role: string
    is_active: boolean
    last_login?: string | null
    training_completed_at?: string | null
    created_by: string
    created_at: string
    updated_by: string
    updated_at: string
    version: number
    sync_status: string
    organisation?: {
        uuid: string
        name: string
    }
}

/**
 * Create User Request
 */
export interface CreateUserRequest {
    email: string
    password: string
    organisation_id: string
    role: string
    is_active?: boolean
}

/**
 * Update User Request
 */
export interface UpdateUserRequest {
    email?: string
    role?: string
    organisation_id?: string
    is_active?: boolean
    training_completed_at?: string
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
    byRole: Record<string, number>
    byOrganisation: Record<string, number>
}

/**
 * User API Service
 */
export class UserService extends BaseService {
    /**
     * Get all users with pagination and filters
     */
    async getUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
        return this.getPaginated<User>(API_ENDPOINTS.USERS.BASE, params as Record<string, any>)
    }

    /**
     * Get user by ID
     */
    async getUser(id: string): Promise<User> {
        const response = await this.get<User>(API_ENDPOINTS.USERS.BY_ID(id))
        return this.extractData(response)
    }

    /**
     * Create a new user
     */
    async createUser(data: CreateUserRequest): Promise<User> {
        const response = await this.post<User>(API_ENDPOINTS.USERS.BASE, data)
        return this.extractData(response)
    }

    /**
     * Update a user
     */
    async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
        const response = await this.put<User>(API_ENDPOINTS.USERS.BY_ID(id), data)
        return this.extractData(response)
    }

    /**
     * Delete a user
     */
    async deleteUser(id: string): Promise<void> {
        await this.delete(API_ENDPOINTS.USERS.BY_ID(id))
    }

    /**
     * Deactivate a user
     */
    async deactivateUser(id: string): Promise<User> {
        const response = await this.patch<User>(API_ENDPOINTS.USERS.DEACTIVATE(id))
        return this.extractData(response)
    }

    /**
     * Activate a user
     */
    async activateUser(id: string): Promise<User> {
        const response = await this.patch<User>(API_ENDPOINTS.USERS.ACTIVATE(id))
        return this.extractData(response)
    }

    /**
     * Change user password (admin)
     */
    async changeUserPassword(id: string, data: { new_password: string }): Promise<void> {
        const response = await this.post(API_ENDPOINTS.USERS.CHANGE_PASSWORD(id), data)
        this.extractData(response)
    }

    /**
     * Get users by organisation
     */
    async getUsersByOrganisation(
        organisationId: string,
        params?: UserQueryParams
    ): Promise<PaginatedResponse<User>> {
        return this.getPaginated<User>(API_ENDPOINTS.USERS.BASE, {
            ...params,
            organisation_id: organisationId,
        } as Record<string, any>)
    }

    /**
     * Get users by role
     */
    async getUsersByRole(role: string, params?: UserQueryParams): Promise<PaginatedResponse<User>> {
        return this.getPaginated<User>(API_ENDPOINTS.USERS.BASE, {
            ...params,
            role,
        } as Record<string, any>)
    }

    /**
     * Get active users
     */
    async getActiveUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
        return this.getPaginated<User>(API_ENDPOINTS.USERS.BASE, {
            ...params,
            is_active: true,
        } as Record<string, any>)
    }

    /**
     * Get inactive users
     */
    async getInactiveUsers(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
        return this.getPaginated<User>(API_ENDPOINTS.USERS.BASE, {
            ...params,
            is_active: false,
        } as Record<string, any>)
    }

    /**
     * Get users with pending training
     */
    async getUsersPendingTraining(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
        return this.getPaginated<User>(API_ENDPOINTS.USERS.BASE, {
            ...params,
            training_completed: false,
        } as Record<string, any>)
    }

    /**
     * Get users with completed training
     */
    async getUsersCompletedTraining(params?: UserQueryParams): Promise<PaginatedResponse<User>> {
        return this.getPaginated<User>(API_ENDPOINTS.USERS.BASE, {
            ...params,
            training_completed: true,
        } as Record<string, any>)
    }

    /**
     * Get user statistics
     */
    async getStats(organisationId?: string): Promise<UserStats> {
        const params: Record<string, any> = {}
        if (organisationId) params.organisation_id = organisationId

        const response = await this.get<UserStats>('/users/stats', params)
        return this.extractData(response)
    }

    /**
     * Search users
     */
    async searchUsers(query: string, params?: UserQueryParams): Promise<PaginatedResponse<User>> {
        return this.getPaginated<User>(API_ENDPOINTS.USERS.BASE, {
            ...params,
            search: query,
        } as Record<string, any>)
    }

    /**
     * Bulk import users
     */
    async bulkImportUsers(
        users: CreateUserRequest[]
    ): Promise<{ created: number; failed: number; errors: string[] }> {
        const response = await this.post<{ created: number; failed: number; errors: string[] }>(
            '/users/bulk-import',
            { users }
        )
        return this.extractData(response)
    }

    /**
     * Export users
     */
    async exportUsers(params?: {
        organisation_id?: string
        role?: string
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
}

// Export singleton
export const userService = new UserService()
