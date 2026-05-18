// src/composables/usePermissions.ts

import { computed } from 'vue';
import { useAuthStore } from '../stores/auth/auth.store';
import { UserRole } from '../models/entities/user/user.entity';

/**
 * Permission definitions for each feature
 * Each permission maps to an array of roles that are allowed to perform it
 * 'all' means any authenticated user can access
 */
const PERMISSIONS: Record<string, UserRole[] | 'all'> = {
    // Critical Functions
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
    EDIT_CRITICAL_FUNCTIONS: [
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    DELETE_CRITICAL_FUNCTIONS: [
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],

    // BIA
    VIEW_BIA: [
        UserRole.BCM_MANAGER,
        UserRole.BCM_COORDINATOR,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    CREATE_BIA: [
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    EDIT_BIA: [
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],

    // BCP
    VIEW_BCP: [
        UserRole.BCM_MANAGER,
        UserRole.BCM_COORDINATOR,
        UserRole.AUDITOR,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    CREATE_BCP: [
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    APPROVE_BCP: [
        UserRole.BCM_MANAGER,
        UserRole.APPROVER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],

    // Recovery Strategies
    VIEW_RECOVERY_STRATEGIES: [
        UserRole.BCM_MANAGER,
        UserRole.BCM_COORDINATOR,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    CREATE_RECOVERY_STRATEGIES: [
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],

    // Exercise Tests
    VIEW_EXERCISE_TESTS: [
        UserRole.BCM_MANAGER,
        UserRole.BCM_COORDINATOR,
        UserRole.AUDITOR,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    CREATE_EXERCISE_TESTS: [
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    RECORD_TEST_RESULTS: [
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],

    // Risk Management
    VIEW_RISKS: [
        UserRole.RISK_OWNER,
        UserRole.BCM_MANAGER,
        UserRole.AUDITOR,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    CREATE_RISKS: [
        UserRole.RISK_OWNER,
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    EDIT_RISKS: [
        UserRole.RISK_OWNER,
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    REASSESS_RISKS: [
        UserRole.RISK_OWNER,
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    DELETE_RISKS: [
        UserRole.RISK_OWNER,
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],

    // Compliance
    VIEW_COMPLIANCE: [
        UserRole.BCM_MANAGER,
        UserRole.AUDITOR,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    CREATE_COMPLIANCE: [
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],

    // Incidents
    VIEW_INCIDENTS: [
        UserRole.BCM_MANAGER,
        UserRole.BCM_COORDINATOR,
        UserRole.IT_RECOVERY_OWNER,
        UserRole.AUDITOR,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    CREATE_INCIDENTS: [
        UserRole.BCM_MANAGER,
        UserRole.IT_RECOVERY_OWNER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    EDIT_INCIDENTS: [
        UserRole.BCM_MANAGER,
        UserRole.IT_RECOVERY_OWNER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    CLOSE_INCIDENTS: [
        UserRole.BCM_MANAGER,
        UserRole.IT_RECOVERY_OWNER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    REOPEN_INCIDENTS: [
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    ESCALATE_INCIDENTS: [
        UserRole.BCM_MANAGER,
        UserRole.IT_RECOVERY_OWNER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],

    // Workflows
    VIEW_WORKFLOWS: [
        UserRole.BCM_MANAGER,
        UserRole.BCM_COORDINATOR,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    CREATE_WORKFLOWS: [
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    APPROVE_WORKFLOWS: [
        UserRole.BCM_MANAGER,
        UserRole.APPROVER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    REJECT_WORKFLOWS: [
        UserRole.BCM_MANAGER,
        UserRole.APPROVER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    ESCALATE_WORKFLOWS: [
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    REASSIGN_WORKFLOWS: [
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],

    // Documents
    VIEW_DOCUMENTS: 'all' as const,
    UPLOAD_DOCUMENTS: [
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    EDIT_DOCUMENTS: [
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    APPROVE_DOCUMENTS: [
        UserRole.BCM_MANAGER,
        UserRole.APPROVER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    DELETE_DOCUMENTS: [
        UserRole.BCM_MANAGER,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],

    // Notifications
    VIEW_NOTIFICATIONS: 'all' as const,
    MANAGE_NOTIFICATION_PREFERENCES: 'all' as const,

    // Audit
    VIEW_AUDIT_LOGS: [
        UserRole.AUDITOR,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    EXPORT_AUDIT_LOGS: [
        UserRole.AUDITOR,
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],

    // Admin
    MANAGE_USERS: [
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    MANAGE_ORGANISATIONS: [
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],
    MANAGE_SYSTEM: [
        UserRole.SUPER_ADMIN,
    ],

    // Sync
    VIEW_SYNC_STATUS: 'all' as const,
    MANAGE_SYNC: [
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],

    // Settings
    VIEW_SETTINGS: 'all' as const,
    MANAGE_SETTINGS: [
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
    ],

    // Dashboard
    VIEW_DASHBOARD: 'all' as const,
} as const;

// Type for permission keys
type PermissionKey = keyof typeof PERMISSIONS;

/**
 * Composable for permission-based access control
 * Provides methods to check if the current user has specific permissions
 */
export function usePermissions() {
    const authStore = useAuthStore();

    /**
     * Get the current user's role
     */
    const currentRole = computed<UserRole | null>(() => {
        if (!authStore.user) return null;
        return authStore.user.role as UserRole;
    });

    /**
     * Check if current user has a specific permission
     * 
     * @param permission - The permission key to check
     * @returns true if the user has the permission, false otherwise
     */
    function can(permission: PermissionKey): boolean {
        // If not authenticated, deny all permissions
        if (!authStore.isAuthenticated) return false;

        const allowedRoles = PERMISSIONS[permission];

        // 'all' means any authenticated user can access
        if (allowedRoles === 'all') {
            return true;
        }

        // Check if user's role is in the allowed roles
        const userRole = authStore.userRole as UserRole;
        return (allowedRoles as readonly UserRole[]).includes(userRole);
    }

    /**
     * Check if user can perform any of the specified permissions
     * 
     * @param permissions - Array of permission keys to check
     * @returns true if the user has at least one of the permissions
     */
    function canAny(permissions: PermissionKey[]): boolean {
        return permissions.some((p) => can(p));
    }

    /**
     * Check if user can perform all of the specified permissions
     * 
     * @param permissions - Array of permission keys to check
     * @returns true if the user has all of the permissions
     */
    function canAll(permissions: PermissionKey[]): boolean {
        return permissions.every((p) => can(p));
    }

    /**
     * Check if user cannot perform a specific permission
     * 
     * @param permission - The permission key to check
     * @returns true if the user does NOT have the permission
     */
    function cannot(permission: PermissionKey): boolean {
        return !can(permission);
    }

    /**
     * Check if user is authenticated (has any valid session)
     */
    const isAuthenticated = computed(() => authStore.isAuthenticated);

    /**
     * Check if user has admin privileges
     */
    const isAdmin = computed(() => authStore.isAdmin);

    /**
     * Check if user has BCM Manager privileges
     */
    const isBCMManager = computed(() => authStore.isBCMManager);

    return {
        // State
        currentRole,
        isAuthenticated,
        isAdmin,
        isBCMManager,
        // Permission checks
        can,
        canAny,
        canAll,
        cannot,
    };
}