import { computed } from 'vue';
import { useAuthStore } from '../stores/auth/auth.store';
import { useRouter } from 'vue-router';
import { LoginCredentials, UserRole } from '../models/entities/user/user.entity';

/**
 * Composable for authentication-related functionality
 */
export function useAuth() {
    const authStore = useAuthStore();
    const router = useRouter();

    // ============================================
    // State & Getters
    // ============================================
    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const currentUser = computed(() => authStore.user);
    const userRole = computed(() => authStore.userRole);
    const userEmail = computed(() => authStore.userEmail);
    const userId = computed(() => authStore.userId);
    const organisationId = computed(() => authStore.userOrganisationId);
    const isAdmin = computed(() => authStore.isAdmin);
    const isBCMManager = computed(() => authStore.isBCMManager);

    // ============================================
    // Role Checks
    // ============================================
    function hasRole(role: string | string[]): boolean {
        return authStore.hasRole(role);
    }

    function hasAnyRole(roles: string[]): boolean {
        return roles.some((role) => authStore.hasRole(role));
    }

    function hasAllRoles(roles: string[]): boolean {
        return roles.every((role) => authStore.hasRole(role));
    }

    // ============================================
    // Permission Checks
    // ============================================
    function canManageBCM(): boolean {
        return hasAnyRole([
            UserRole.BCM_MANAGER,
            UserRole.SYSTEM_ADMINISTRATOR,
            UserRole.SUPER_ADMIN,
        ]);
    }

    function canManageRisks(): boolean {
        return hasAnyRole([
            UserRole.RISK_OWNER,
            UserRole.BCM_MANAGER,
            UserRole.SYSTEM_ADMINISTRATOR,
            UserRole.SUPER_ADMIN,
        ]);
    }

    function canApprove(): boolean {
        return hasAnyRole([
            UserRole.APPROVER,
            UserRole.BCM_MANAGER,
            UserRole.SYSTEM_ADMINISTRATOR,
            UserRole.SUPER_ADMIN,
        ]);
    }

    function canAudit(): boolean {
        return hasAnyRole([
            UserRole.AUDITOR,
            UserRole.SYSTEM_ADMINISTRATOR,
            UserRole.SUPER_ADMIN,
        ]);
    }

    function canManageIncidents(): boolean {
        return hasAnyRole([
            UserRole.BCM_MANAGER,
            UserRole.IT_RECOVERY_OWNER,
            UserRole.SYSTEM_ADMINISTRATOR,
            UserRole.SUPER_ADMIN,
        ]);
    }

    function canManageUsers(): boolean {
        return hasAnyRole([UserRole.SYSTEM_ADMINISTRATOR, UserRole.SUPER_ADMIN]);
    }

    function canViewAuditLogs(): boolean {
        return hasAnyRole([
            UserRole.AUDITOR,
            UserRole.SYSTEM_ADMINISTRATOR,
            UserRole.SUPER_ADMIN,
        ]);
    }

    // ============================================
    // Actions
    // ============================================
    async function login(email: string, password: string, rememberMe?: boolean): Promise<void> {
        await authStore.login({ email, password, rememberMe } as LoginCredentials);
    }

    async function logout(): Promise<void> {
        await authStore.logout();
        await router.push('/auth/login');
    }

    async function refreshToken(): Promise<void> {
        await authStore.refreshToken();
    }

    /**
     * Require authentication - redirect to login if not authenticated
     */
    function requireAuth(redirectTo?: string): boolean {
        if (!isAuthenticated.value) {
            router.push({
                name: 'Login',
                query: { redirect: redirectTo || router.currentRoute.value.fullPath },
            });
            return false;
        }
        return true;
    }

    /**
     * Require specific role - redirect if not authorized
     */
    function requireRole(role: string | string[]): boolean {
        if (!requireAuth()) return false;
        if (!hasRole(role)) {
            router.push({ name: 'Dashboard' });
            return false;
        }
        return true;
    }

    return {
        // State
        isAuthenticated,
        currentUser,
        userRole,
        userEmail,
        userId,
        organisationId,
        isAdmin,
        isBCMManager,
        // Role checks
        hasRole,
        hasAnyRole,
        hasAllRoles,
        // Permission checks
        canManageBCM,
        canManageRisks,
        canApprove,
        canAudit,
        canManageIncidents,
        canManageUsers,
        canViewAuditLogs,
        // Actions
        login,
        logout,
        refreshToken,
        requireAuth,
        requireRole,
    };
}