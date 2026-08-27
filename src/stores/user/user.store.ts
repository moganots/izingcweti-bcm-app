import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { User } from './../../models/entities'
import { userService } from './../../services/api'
import {
    UserStats,
    CreateUserRequest,
    UpdateUserRequest,
    UserQueryParams,
    UserRole,
} from './../../models/entities/user/user.entity'

export const useUserStore = defineStore('user', () => {
    // ============================================
    // State
    // ============================================
    const users = ref<User[]>([])
    const selectedUser = ref<User | null>(null)
    const stats = ref<UserStats | null>(null)
    const isLoading = ref(false)
    const isSaving = ref(false)
    const error = ref<string | null>(null)
    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalItems = ref(0)

    // ============================================
    // Getters
    // ============================================
    const activeUsers = computed(() => users.value.filter((u) => u.isActive))

    const inactiveUsers = computed(() => users.value.filter((u) => !u.isActive))

    const trainingCompleted = computed(() => users.value.filter((u) => u.trainingCompletedAt))

    const trainingPending = computed(() =>
        users.value.filter((u) => u.isActive && !u.trainingCompletedAt)
    )

    const usersByRole = computed(() => {
        const grouped: Record<string, User[]> = {}
        users.value.forEach((u) => {
            const role = u.role || 'Unknown'
            if (!grouped[role]) grouped[role] = []
            grouped[role].push(u)
        })
        return grouped
    })

    const usersByOrganisation = computed(() => {
        const grouped: Record<string, User[]> = {}
        users.value.forEach((u) => {
            const orgId = u.organisationId || 'Unknown'
            if (!grouped[orgId]) grouped[orgId] = []
            grouped[orgId].push(u)
        })
        return grouped
    })

    const userRoles = computed(() => {
        return [...new Set(users.value.map((u) => u.role))].filter(Boolean).sort()
    })

    // ============================================
    // Actions
    // ============================================

    /**
     * Load users with optional filters
     */
    async function loadUsers(filters?: UserQueryParams): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            const response = await userService.getUsers({
                ...filters,
                page: currentPage.value,
            })

            users.value = response.data || []
            totalPages.value = response.totalPages || 1
            totalItems.value = response.total || 0
        } catch (err: any) {
            console.error('Failed to load users:', err)
            error.value = err.message || 'Failed to load users'
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Load a single user by ID
     */
    async function loadUser(id: string): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            selectedUser.value = await userService.getUser(id)
        } catch (err: any) {
            console.error('Failed to load user:', err)
            error.value = err.message || 'Failed to load user'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Load user statistics
     */
    async function loadStats(organisationId?: string): Promise<void> {
        try {
            stats.value = await userService.getStats(organisationId)
        } catch (err: any) {
            console.error('Failed to load user stats:', err)
        }
    }

    /**
     * Create a new user
     */
    async function createUser(data: CreateUserRequest): Promise<User> {
        isSaving.value = true
        error.value = null

        try {
            const created = await userService.createUser(data)
            users.value.unshift(created)
            return created
        } catch (err: any) {
            console.error('Failed to create user:', err)
            error.value = err.response?.data?.message || err.message || 'Failed to create user'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Update a user
     */
    async function updateUser(id: string, data: UpdateUserRequest): Promise<User> {
        isSaving.value = true
        error.value = null

        try {
            const updated = await userService.updateUser(id, data)
            const index = users.value.findIndex((u) => u.uuid === id)
            if (index !== -1) {
                users.value[index] = updated
            }
            if (selectedUser.value?.uuid === id) {
                selectedUser.value = updated
            }
            return updated
        } catch (err: any) {
            console.error('Failed to update user:', err)
            error.value = err.response?.data?.message || err.message || 'Failed to update user'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Delete a user
     */
    async function deleteUser(id: string): Promise<void> {
        isSaving.value = true
        error.value = null

        try {
            await userService.deleteUser(id)
            users.value = users.value.filter((u) => u.uuid !== id)
            if (selectedUser.value?.uuid === id) {
                selectedUser.value = null
            }
        } catch (err: any) {
            console.error('Failed to delete user:', err)
            error.value = err.response?.data?.message || err.message || 'Failed to delete user'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Deactivate a user
     */
    async function deactivateUser(id: string): Promise<User> {
        isSaving.value = true
        error.value = null

        try {
            const updated = await userService.deactivateUser(id)
            updateLocalUser(id, updated)
            return updated
        } catch (err: any) {
            console.error('Failed to deactivate user:', err)
            error.value = err.message || 'Failed to deactivate user'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Activate a user
     */
    async function activateUser(id: string): Promise<User> {
        isSaving.value = true
        error.value = null

        try {
            const updated = await userService.activateUser(id)
            updateLocalUser(id, updated)
            return updated
        } catch (err: any) {
            console.error('Failed to activate user:', err)
            error.value = err.message || 'Failed to activate user'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Update user training status
     */
    async function updateTrainingStatus(id: string, completed: boolean): Promise<User> {
        isSaving.value = true
        error.value = null

        try {
            const updated = await userService.updateTrainingStatus(id, completed)
            updateLocalUser(id, updated)
            return updated
        } catch (err: any) {
            console.error('Failed to update training:', err)
            error.value = err.message || 'Failed to update training'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Search users
     */
    async function searchUsers(query: string): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            const response = await userService.searchUsers(query)
            users.value = response.data || []
            totalPages.value = response.totalPages || 1
        } catch (err: any) {
            error.value = err.message || 'Failed to search users'
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Load users by role
     */
    async function loadUsersByRole(role: string): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            const response = await userService.getUsersByRole(role as any, {
                page: currentPage.value,
            })
            users.value = response.data || []
            totalPages.value = response.totalPages || 1
        } catch (err: any) {
            error.value = err.message || 'Failed to load users by role'
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Load active users
     */
    async function loadActiveUsers(): Promise<void> {
        isLoading.value = true
        error.value = null

        try {
            const response = await userService.getActiveUsers({
                page: currentPage.value,
            })
            users.value = response.data || []
            totalPages.value = response.totalPages || 1
        } catch (err: any) {
            error.value = err.message || 'Failed to load active users'
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Export users
     */
    async function exportUsers(params?: {
        organisationId?: string
        role?: UserRole
        format?: 'csv' | 'json'
    }): Promise<void> {
        try {
            await userService.exportUsers(params)
        } catch (err: any) {
            console.error('Failed to export users:', err)
            error.value = err.message || 'Failed to export users'
            throw err
        }
    }

    /**
     * Bulk import users
     */
    async function bulkImportUsers(
        usersData: CreateUserRequest[]
    ): Promise<{ created: number; failed: number; errors: string[] }> {
        isSaving.value = true
        error.value = null

        try {
            const result = await userService.bulkImportUsers(usersData)
            await loadUsers()
            return result
        } catch (err: any) {
            error.value = err.message || 'Failed to import users'
            throw err
        } finally {
            isSaving.value = false
        }
    }

    /**
     * Set current page and reload
     */
    async function setPage(page: number): Promise<void> {
        currentPage.value = page
        await loadUsers()
    }

    /**
     * Clear selected user
     */
    function clearSelection(): void {
        selectedUser.value = null
    }

    /**
     * Clear all user data
     */
    function clearAll(): void {
        users.value = []
        selectedUser.value = null
        stats.value = null
        error.value = null
        currentPage.value = 1
        totalPages.value = 1
        totalItems.value = 0
    }

    // ============================================
    // Private Helpers
    // ============================================

    /**
     * Update a user in the local list and selected user
     */
    function updateLocalUser(id: string, updated: User): void {
        const index = users.value.findIndex((u) => u.uuid === id)
        if (index !== -1) {
            users.value[index] = updated
        }
        if (selectedUser.value?.uuid === id) {
            selectedUser.value = updated
        }
    }

    return {
        // State
        users,
        selectedUser,
        stats,
        isLoading,
        isSaving,
        error,
        currentPage,
        totalPages,
        totalItems,
        // Getters
        activeUsers,
        inactiveUsers,
        trainingCompleted,
        trainingPending,
        usersByRole,
        usersByOrganisation,
        userRoles,
        // Actions
        loadUsers,
        loadUser,
        loadStats,
        createUser,
        updateUser,
        deleteUser,
        deactivateUser,
        activateUser,
        updateTrainingStatus,
        searchUsers,
        loadUsersByRole,
        loadActiveUsers,
        exportUsers,
        bulkImportUsers,
        setPage,
        clearSelection,
        clearAll,
    }
})