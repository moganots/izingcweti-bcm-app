import { computed, watch, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth/auth.store'
import type { LoginCredentials, RegistrationData, UpdateUserRequest } from '../models/user/user.entity'
import { UserRole } from '../models/user/user.entity'

export interface UseAuthOptions {
  redirectOnLogout?: string
  redirectOnUnauthorized?: string
}

/**
 * Authentication composable
 * Aligned with useAuthStore
 */
export function useAuth(options: UseAuthOptions = {}) {
  const {
    redirectOnLogout = '/auth/login',
    redirectOnUnauthorized = '/auth/login',
  } = options

  const authStore = useAuthStore()
  const router = useRouter()

  // Refs / computed from store
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
    isGlobalAdmin,
    isSuperAdmin,
    isSystemAdmin,
    isAdmin,
    isOrgAdmin,
    isBCMManager,
    isRiskOwner,
    isProcessOwner,
    isBCMCoordinator,
    isApprover,
    isAuditor,
    isAccountLocked,
    lockRemainingTime,
  } = storeToRefs(authStore)

  // Local state
  const isReady = ref(false)

  // ============================================
  // Role Checks
  // ============================================
  function hasRole(role: UserRole | UserRole[]): boolean {
    return authStore.hasRole(role)
  }

  function hasAnyRole(roles: UserRole[]): boolean {
    return roles.some((role) => authStore.hasRole(role))
  }

  function hasAllRoles(roles: UserRole[]): boolean {
    return roles.every((role) => authStore.hasRole(role))
  }

  function hasPermission(permission: string): boolean {
    return authStore.hasPermission(permission)
  }

  // ============================================
  // Domain Permission Shortcuts
  // ============================================
  const canManageBCM = computed(() => authStore.hasPermission('bcm_manager'))
  const canManageRisks = computed(() => authStore.hasPermission('risk_owner'))
  const canApprove = computed(() => authStore.hasPermission('approver'))
  const canAudit = computed(() => authStore.hasPermission('auditor'))
  const canManageUsers = computed(() => authStore.hasPermission('admin'))

  // ============================================
  // Actions
  // ============================================
  async function login(
    email: string,
    password: string,
    rememberMe = false
  ): Promise<void> {
    await authStore.login({ email, password, rememberMe } as LoginCredentials)
  }

  async function register(data: RegistrationData): Promise<void> {
    await authStore.register(data)
  }

  async function changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await authStore.changePassword(currentPassword, newPassword)
  }

  async function forgotPassword(email: string): Promise<void> {
    await authStore.forgotPassword(email)
  }

  async function resetPassword(token: string, newPassword: string): Promise<void> {
    await authStore.resetPassword(token, newPassword)
  }

  async function logout(): Promise<void> {
    await authStore.logout()
    await router.push(redirectOnLogout)
  }

  async function logoutAllDevices(): Promise<void> {
    await authStore.logoutAllDevices()
    await router.push(redirectOnLogout)
  }

  async function updateProfile(data: UpdateUserRequest): Promise<void> {
    await authStore.updateProfile(data)
  }

  async function checkAuthentication(): Promise<boolean> {
    return await authStore.checkAuth()
  }

  // ============================================
  // Guards
  // ============================================
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

  function requireRole(role: UserRole | UserRole[], redirectTo?: string): boolean {
    if (!requireAuth(redirectTo)) return false
    if (!hasRole(role)) {
      router.push({ name: 'Dashboard' })
      return false
    }
    return true
  }

  function requirePermission(permission: string, redirectTo?: string): boolean {
    if (!requireAuth(redirectTo)) return false
    if (!hasPermission(permission)) {
      router.push({ name: 'Dashboard' })
      return false
    }
    return true
  }

  // ============================================
  // Lifecycle
  // ============================================
  onMounted(async () => {
    await authStore.initialize()
    isReady.value = true
  })

  watch(
    () => authStore.isAuthenticated,
    (auth) => {
      if (!auth) isReady.value = false
    }
  )

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
    isGlobalAdmin,
    isSuperAdmin,
    isSystemAdmin,
    isAdmin,
    isOrgAdmin,
    isBCMManager,
    isRiskOwner,
    isProcessOwner,
    isBCMCoordinator,
    isApprover,
    isAuditor,
    isAccountLocked,
    lockRemainingTime,

    // Role / permission
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasPermission,
    canManageBCM,
    canManageRisks,
    canApprove,
    canAudit,
    canManageUsers,

    // Actions
    initialize: authStore.initialize,
    checkAuthentication,
    login,
    register,
    fetchProfile: authStore.fetchProfile,
    refreshToken: authStore.refreshToken,
    changePassword,
    forgotPassword,
    resetPassword,
    logout,
    logoutAllDevices,
    updateProfile,
    reset: authStore.reset,

    // Guards
    requireAuth,
    requireRole,
    requirePermission,
  }
}

export default useAuth