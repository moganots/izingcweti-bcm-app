import { computed } from 'vue'
import { useAuthStore } from '../stores/auth/auth.store'
import { UserRole } from '../models/user/user.entity'

const PERMISSIONS: Record<string, UserRole[] | 'all'> = {
    VIEW_DASHBOARD: 'all',
    VIEW_DOCUMENTS: 'all',
    VIEW_NOTIFICATIONS: 'all',
    VIEW_SETTINGS: 'all',
    VIEW_SYNC_STATUS: 'all',

    // BCM
    VIEW_CRITICAL_FUNCTIONS: [
        UserRole.BCM_MANAGER,
        UserRole.BCM_COORDINATOR,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    CREATE_CRITICAL_FUNCTIONS: [
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],

    // Risk
    VIEW_RISKS: [
        UserRole.RISK_OWNER,
        UserRole.BCM_MANAGER,
        UserRole.AUDITOR,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    EDIT_RISKS: [
        UserRole.RISK_OWNER,
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],

    // Admin
    MANAGE_USERS: [UserRole.SYSTEM_ADMINISTRATOR, UserRole.SUPER_ADMIN],
    MANAGE_ORGANISATIONS: [UserRole.SYSTEM_ADMINISTRATOR, UserRole.SUPER_ADMIN],
    MANAGE_SYSTEM: [UserRole.SUPER_ADMIN],
} as const

type PermissionKey = keyof typeof PERMISSIONS

export function usePermissions() {
    const authStore = useAuthStore()

    const currentRole = computed<UserRole | null>(() => {
        if (!authStore.user) return null
        return authStore.user.role as UserRole
    })

    function can(permission: PermissionKey): boolean {
        if (!authStore.isAuthenticated) return false

        const allowedRoles = PERMISSIONS[permission]
        if (allowedRoles === 'all') return true

        const userRole = authStore.userRole as UserRole
        return (allowedRoles as readonly UserRole[]).includes(userRole)
    }

    function canAny(permissions: PermissionKey[]): boolean {
        return permissions.some((p) => can(p))
    }

    function canAll(permissions: PermissionKey[]): boolean {
        return permissions.every((p) => can(p))
    }

    function cannot(permission: PermissionKey): boolean {
        return !can(permission)
    }

    return {
        currentRole,
        isAuthenticated: computed(() => authStore.isAuthenticated),
        isAdmin: computed(() => authStore.isAdmin),
        isBCMManager: computed(() => authStore.isBCMManager),
        can,
        canAny,
        canAll,
        cannot,
    }
}