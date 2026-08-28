import { computed, watch, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth/auth.store'
import { useRouter } from 'vue-router'
import { LoginCredentials, UserRole } from '../models/entities/user/user.entity'

export interface UseAuthOptions {
  redirectOnLogout?: string
  redirectOnUnauthorized?: string
}

/**
 * Composable for authentication-related functionality
 */
export function useAuth(options: UseAuthOptions = {}) {
  const {
    redirectOnLogout = '/auth/login',
    redirectOnUnauthorized = '/auth/login',
  } = options

  const authStore = useAuthStore()
  const router = useRouter()

  // Store refs for reactivity
  const {
    user,
    tokens,
    isInitialized,
    isLoading,
    error,
    isAuthenticated,
    userId,
    userEmail,
    userRole,
    userOrganisationId,
    userDepartmentId,
    isActive,
    isEmailVerified,
    fullName,
    isAdmin,
    isBCMManager,
    isRiskOwner,
    isProcessOwner,
    isBCMCoordinator,
    isAccountLocked,
    lockRemainingTime,
  } = storeToRefs(authStore)

  // Store actions
  const {
    initialize,
    checkAuth,
    login: storeLogin,
    register: storeRegister,
    fetchProfile,
    refreshToken,
    refreshTokenIfNeeded,
    changePassword: storeChangePassword,
    forgotPassword: storeForgotPassword,
    resetPassword: storeResetPassword,
    logout: storeLogout,
    logoutAllDevices: storeLogoutAllDevices,
    updateProfile: storeUpdateProfile,
    getSessions: storeGetSessions,
    revokeSession: storeRevokeSession,
    getUserTokens: storeGetUserTokens,
    revokeToken: storeRevokeToken,
    hasRole: storeHasRole,
    hasPermission: storeHasPermission,
    reset,
  } = authStore

  // Local state
  const isReady = ref(false)

  // ============================================
  // Computed
  // ============================================

  const isInitializedReady = computed(() => isInitialized.value)
  const isLoadingAuth = computed(() => isLoading.value)
  const authError = computed(() => error.value)

  // ============================================
  // Role Checks
  // ============================================

  function hasRole(role: string | string[]): boolean {
    return storeHasRole(role)
  }

  function hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => storeHasRole(role))
  }

  function hasAllRoles(roles: string[]): boolean {
    return roles.every((role) => storeHasRole(role))
  }

  // ============================================
  // Permission Checks
  // ============================================

  function canManageBCM(): boolean {
    return hasAnyRole([
      UserRole.BCM_MANAGER,
      UserRole.SYSTEM_ADMINISTRATOR,
      UserRole.SUPER_ADMIN,
    ])
  }

  function canManageRisks(): boolean {
    return hasAnyRole([
      UserRole.RISK_OWNER,
      UserRole.BCM_MANAGER,
      UserRole.SYSTEM_ADMINISTRATOR,
      UserRole.SUPER_ADMIN,
    ])
  }

  function canApprove(): boolean {
    return hasAnyRole([
      UserRole.APPROVER,
      UserRole.BCM_MANAGER,
      UserRole.SYSTEM_ADMINISTRATOR,
      UserRole.SUPER_ADMIN,
    ])
  }

  function canAudit(): boolean {
    return hasAnyRole([
      UserRole.AUDITOR,
      UserRole.SYSTEM_ADMINISTRATOR,
      UserRole.SUPER_ADMIN,
    ])
  }

  function canManageIncidents(): boolean {
    return hasAnyRole([
      UserRole.BCM_MANAGER,
      UserRole.IT_RECOVERY_OWNER,
      UserRole.SYSTEM_ADMINISTRATOR,
      UserRole.SUPER_ADMIN,
    ])
  }

  function canManageUsers(): boolean {
    return hasAnyRole([UserRole.SYSTEM_ADMINISTRATOR, UserRole.SUPER_ADMIN])
  }

  function canViewAuditLogs(): boolean {
    return hasAnyRole([
      UserRole.AUDITOR,
      UserRole.SYSTEM_ADMINISTRATOR,
      UserRole.SUPER_ADMIN,
    ])
  }

  function canManageDashboard(): boolean {
    return hasAnyRole([
      UserRole.BCM_MANAGER,
      UserRole.SYSTEM_ADMINISTRATOR,
      UserRole.SUPER_ADMIN,
    ])
  }

  function isSuperAdmin(): boolean {
    return userRole.value === UserRole.SUPER_ADMIN
  }

  function isSystemAdmin(): boolean {
    return userRole.value === UserRole.SYSTEM_ADMINISTRATOR
  }

  // ============================================
  // Actions
  // ============================================

  /**
   * Login user
   */
  async function login(email: string, password: string, rememberMe?: boolean): Promise<void> {
    await storeLogin({ email, password, rememberMe } as LoginCredentials)
  }

  /**
   * Register new user
   */
  async function register(data: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    organisationId?: string
    departmentId?: string
    phoneNumber?: string
    role?: UserRole
  }): Promise<void> {
    await storeRegister(data)
  }

  /**
   * Change password
   */
  async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await storeChangePassword(currentPassword, newPassword)
  }

  /**
   * Forgot password
   */
  async function forgotPassword(email: string): Promise<void> {
    await storeForgotPassword(email)
  }

  /**
   * Reset password
   */
  async function resetPassword(token: string, newPassword: string): Promise<void> {
    await storeResetPassword(token, newPassword)
  }

  /**
   * Logout user
   */
  async function logout(): Promise<void> {
    await storeLogout()
    await router.push(redirectOnLogout)
  }

  /**
   * Logout from all devices
   */
  async function logoutAllDevices(): Promise<void> {
    await storeLogoutAllDevices()
    await router.push(redirectOnLogout)
  }

  /**
   * Update user profile
   */
  async function updateProfile(data: Partial<{
    firstName?: string
    lastName?: string
    phoneNumber?: string
    preferences?: Record<string, any>
    avatarUrl?: string
    metadata?: Record<string, any>
  }>): Promise<void> {
    await storeUpdateProfile(data)
  }

  /**
   * Get active sessions
   */
  async function getSessions() {
    return await storeGetSessions()
  }

  /**
   * Revoke a session
   */
  async function revokeSession(sessionId: string): Promise<void> {
    await storeRevokeSession(sessionId)
  }

  /**
   * Get user tokens
   */
  async function getUserTokens(userId: string) {
    return await storeGetUserTokens(userId)
  }

  /**
   * Revoke a token
   */
  async function revokeToken(tokenId: string): Promise<void> {
    await storeRevokeToken(tokenId)
  }

  /**
   * Check if user is authenticated
   */
  async function checkAuthentication(): Promise<boolean> {
    return await checkAuth()
  }

  /**
   * Require authentication - redirect to login if not authenticated
   */
  function requireAuth(redirectTo?: string): boolean {
    if (!isAuthenticated.value) {
      router.push({
        path: redirectOnUnauthorized,
        query: { redirect: redirectTo || router.currentRoute.value.fullPath },
      })
      return false
    }
    return true
  }

  /**
   * Require specific role - redirect if not authorized
   */
  function requireRole(role: string | string[], redirectTo?: string): boolean {
    if (!requireAuth(redirectTo)) return false
    if (!hasRole(role)) {
      router.push({ name: 'Dashboard' })
      return false
    }
    return true
  }

  /**
   * Require specific permission - redirect if not authorized
   */
  function requirePermission(permission: string, redirectTo?: string): boolean {
    if (!requireAuth(redirectTo)) return false
    if (!storeHasPermission(permission)) {
      router.push({ name: 'Dashboard' })
      return false
    }
    return true
  }

  // ============================================
  // Lifecycle
  // ============================================

  onMounted(async () => {
    await initialize()
    isReady.value = true
  })

  // Watch for authentication changes
  watch(isAuthenticated, async (auth) => {
    if (!auth) {
      // Optionally handle logout redirect here
    }
  })

  // ============================================
  // Return API
  // ============================================

  return {
    // State
    user,
    tokens,
    isInitialized,
    isLoading,
    error,
    isReady,
    isAuthenticated,
    userId,
    userEmail,
    userRole,
    userOrganisationId,
    userDepartmentId,
    isActive,
    isEmailVerified,
    fullName,
    isAdmin,
    isBCMManager,
    isRiskOwner,
    isProcessOwner,
    isBCMCoordinator,
    isAccountLocked,
    lockRemainingTime,
    isInitializedReady,
    isLoadingAuth,
    authError,

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
    canManageDashboard,
    isSuperAdmin,
    isSystemAdmin,

    // Actions
    initialize,
    checkAuthentication,
    login,
    register,
    fetchProfile,
    refreshToken,
    refreshTokenIfNeeded,
    changePassword,
    forgotPassword,
    resetPassword,
    logout,
    logoutAllDevices,
    updateProfile,
    getSessions,
    revokeSession,
    getUserTokens,
    revokeToken,

    // Guards
    requireAuth,
    requireRole,
    requirePermission,

    // Utils
    reset,
  }
}

export default useAuth