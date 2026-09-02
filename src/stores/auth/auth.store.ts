import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  User,
  LoginCredentials,
  AuthTokens,
  RegistrationData,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthToken,
  SessionInfo,
  UpdateUserRequest,
} from './../../models/entities/user/user.entity'
import {
  UserRole,
} from './../../models/entities/user/user.entity'
import { authService } from './../../services/api/auth/AuthService'
import { StorageUtils } from './../../utils/storage.utils'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const tokens = ref<AuthTokens | null>(null)
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ============================================
  // Getters
  // ============================================

  const isAuthenticated = computed(() => !!tokens.value?.accessToken && !!user.value)
  const userId = computed(() => user.value?.uuid || '')
  const userEmail = computed(() => user.value?.email || '')
  const userRole = computed(() => user.value?.role || '')
  const userOrganisationId = computed(() => user.value?.organisationId || '')
  const userDepartmentId = computed(() => user.value?.departmentId || '')
  const isActive = computed(() => user.value?.isActive ?? false)
  const isEmailVerified = computed(() => user.value?.isEmailVerified ?? false)

  const fullName = computed(() => {
    if (user.value?.firstName && user.value?.lastName) {
      return `${user.value.firstName} ${user.value.lastName}`
    }
    if (user.value?.firstName) return user.value.firstName
    if (user.value?.email) {
      const namePart = user.value.email.split('@')[0]
      return namePart ? namePart.replace(/[._]/g, ' ') : 'User'
    }
    return 'User'
  })

  // Role-based computed properties
  const isGlobalAdmin = computed(() => { return UserRole.SUPER_ADMIN === userRole.value as UserRole || UserRole.SYSTEM_ADMINISTRATOR === userRole.value as UserRole })
  
  const isSuperAdmin = computed(() => { return UserRole.SUPER_ADMIN === userRole.value as UserRole })
  
  const isSystemAdmin = computed(() => { return UserRole.SYSTEM_ADMINISTRATOR === userRole.value as UserRole })

  const isAdmin = computed(() => {
    const adminRoles = [
      UserRole.SYSTEM_ADMINISTRATOR,
      UserRole.SUPER_ADMIN,
    ]
    return adminRoles.includes(userRole.value as UserRole)
  })

  const isBCMManager = computed(() => {
    const managerRoles = [
      UserRole.BCM_MANAGER,
    ]
    return managerRoles.includes(userRole.value as UserRole)
  })

  const isRiskOwner = computed(() => {
    return userRole.value === UserRole.RISK_OWNER
  })

  const isProcessOwner = computed(() => {
    return userRole.value === UserRole.PROCESS_OWNER
  })

  const isBCMCoordinator = computed(() => {
    return userRole.value === UserRole.BCM_COORDINATOR
  })

  const isAccountLocked = computed(() => {
    if (!user.value?.lockedUntil) return false
    return new Date(user.value.lockedUntil) > new Date()
  })

  const lockRemainingTime = computed(() => {
    if (!user.value?.lockedUntil) return null
    const now = new Date()
    const lockUntil = new Date(user.value.lockedUntil)
    if (now >= lockUntil) return 0
    return lockUntil.getTime() - now.getTime()
  })

  // ============================================
  // Actions
  // ============================================

  /**
   * Initialize auth state from localStorage
   */
  async function initialize(): Promise<void> {
    if (isInitialized.value) return

    isLoading.value = true
    error.value = null

    try {
      const storedTokens = StorageUtils.getTokens()
      const storedUser = StorageUtils.getUserData()

      if (storedTokens?.accessToken && storedUser) {
        tokens.value = storedTokens
        user.value = storedUser as User
        await refreshTokenIfNeeded()
      } else if (storedTokens?.accessToken) {
        tokens.value = storedTokens
        await fetchProfile()
      }
    } catch (err: any) {
      console.error('Auth initialization failed:', err)
      user.value = null
      tokens.value = null
      StorageUtils.clearTokens()
    } finally {
      isInitialized.value = true
      isLoading.value = false
    }
  }

  /**
   * Check authentication status
   */
  async function checkAuth(): Promise<boolean> {
    if (!isInitialized.value) {
      await initialize()
    }
    return isAuthenticated.value
  }

  /**
   * Login user
   */
  async function login(credentials: LoginCredentials): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await authService.login(credentials)

      const newTokens: AuthTokens = {
        accessToken: response.tokens.accessToken,
        refreshToken: response.tokens.refreshToken,
        expiresIn: response.tokens.expiresIn,
        tokenType: response.tokens.tokenType || 'Bearer',
      }

      tokens.value = newTokens
      user.value = response.user

      StorageUtils.saveTokens(newTokens)
      StorageUtils.saveUserData(response.user)

      if (credentials.rememberMe) {
        StorageUtils.saveRememberedEmail(credentials.email)
      } else {
        StorageUtils.clearRememberedEmail()
      }

      console.log('Login successful:', {
        userId: response.user.uuid,
        email: response.user.email,
        role: response.user.role,
      })
    } catch (err: any) {
      console.error('Login error:', err)
      const message = err.response?.data?.message || err.message || 'Login failed'
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Register new user
   */
  async function register(registrationData: RegistrationData): Promise<User> {
    isLoading.value = true
    error.value = null

    try {
      const user = await authService.register(registrationData)
      return user
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Registration failed'
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch user profile
   */
  async function fetchProfile(): Promise<void> {
    try {
      const profile = await authService.getProfile()
      user.value = profile
      StorageUtils.saveUserData(profile)
    } catch (err: any) {
      console.error('Failed to fetch profile:', err)
      if (err.response?.status === 401) {
        await logout()
      }
      throw err
    }
  }

  /**
   * Refresh access token
   */
  async function refreshToken(): Promise<void> {
    if (!tokens.value?.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await authService.refreshToken()

      if (response) {
        const updatedTokens: AuthTokens = {
          ...tokens.value,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken || tokens.value.refreshToken,
          expiresIn: response.expiresIn,
        }

        tokens.value = updatedTokens
        StorageUtils.saveTokens(updatedTokens)
      }
    } catch (err: any) {
      console.error('Token refresh failed:', err)
      await logout()
      throw err
    }
  }

  /**
   * Refresh token if needed (expires in < 5 minutes)
   */
  async function refreshTokenIfNeeded(): Promise<boolean> {
    if (!tokens.value?.accessToken) return false

    try {
      const tokenData = parseJWT(tokens.value.accessToken)
      if (tokenData?.exp) {
        const expiresIn = tokenData.exp * 1000 - Date.now()
        if (expiresIn < 300000) {
          await refreshToken()
          return true
        }
      }
      return false
    } catch (err) {
      console.error('Token expiry check failed:', err)
      return false
    }
  }

  /**
   * Change password
   */
  async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const request: ChangePasswordRequest = {
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmPassword: newPassword,
      }
      await authService.changePassword(request)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to change password'
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Forgot password - send reset email
   */
  async function forgotPassword(email: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const request: ForgotPasswordRequest = { email }
      await authService.forgotPassword(request)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to send reset email'
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset password with token
   */
  async function resetPassword(token: string, newPassword: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const request: ResetPasswordRequest = {
        token,
        newPassword: newPassword,
        confirmPassword: newPassword,
      }
      await authService.resetPassword(request)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to reset password'
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout user
   */
  async function logout(): Promise<void> {
    try {
      await authService.logout().catch(() => { })
    } finally {
      user.value = null
      tokens.value = null
      error.value = null
      isInitialized.value = false
      StorageUtils.clearTokens()
    }
  }

  /**
   * Logout from all devices
   */
  async function logoutAllDevices(): Promise<void> {
    try {
      await authService.logoutAllDevices()
    } finally {
      user.value = null
      tokens.value = null
      error.value = null
      isInitialized.value = false
      StorageUtils.clearTokens()
    }
  }

  /**
   * Update user profile
   */
  async function updateProfile(data: UpdateUserRequest): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await authService.updateProfile(data)
      user.value = { ...user.value, ...response } as User
      StorageUtils.saveUserData(user.value)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update profile'
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get active sessions
   */
  async function getSessions(): Promise<SessionInfo[]> {
    try {
      return await authService.getSessions()
    } catch (err: any) {
      console.error('Failed to get sessions:', err)
      throw err
    }
  }

  /**
   * Revoke a session
   */
  async function revokeSession(sessionId: string): Promise<void> {
    try {
      await authService.revokeSession(sessionId)
    } catch (err: any) {
      console.error('Failed to revoke session:', err)
      throw err
    }
  }

  /**
   * Get user tokens
   */
  async function getUserTokens(userId: string): Promise<AuthToken[]> {
    try {
      return await authService.getUserTokens(userId)
    } catch (err: any) {
      console.error('Failed to get user tokens:', err)
      throw err
    }
  }

  /**
   * Revoke a token
   */
  async function revokeToken(tokenId: string): Promise<void> {
    try {
      await authService.revokeToken(tokenId)
    } catch (err: any) {
      console.error('Failed to revoke token:', err)
      throw err
    }
  }

  /**
   * Check if user has a specific role
   */
  function hasRole(role: string | string[]): boolean {
    if (!user.value) return false
    const roles = Array.isArray(role) ? role : [role]
    const normalizedUserRole = userRole.value.toUpperCase()
    return roles.some((r) => r.toUpperCase() === normalizedUserRole)
  }

  /**
   * Check if user has permission
   */
  function hasPermission(permission: string): boolean {
    if (!user.value) return false

    const permissions: Record<string, string[]> = {
      admin: [
        UserRole.SYSTEM_ADMINISTRATOR,
        UserRole.SUPER_ADMIN,
      ],
      bcm_manager: [
        UserRole.BCM_MANAGER,
      ],
      risk_owner: [
        UserRole.RISK_OWNER,
      ],
      process_owner: [
        UserRole.PROCESS_OWNER,
      ],
      bcm_coordinator: [
        UserRole.BCM_COORDINATOR,
      ],
      auditor: [
        UserRole.AUDITOR,
      ],
      approver: [
        UserRole.APPROVER,
      ],
    }

    const allowedRoles = permissions[permission] || []
    return allowedRoles.includes(userRole.value as string)
  }

  /**
   * Parse JWT token
   */
  function parseJWT(token: string): Record<string, any> | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null
      const base64Url = parts[1]
      const base64 = base64Url?.replace(/-/g, '+').replace(/_/g, '/') || ''
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch {
      return null
    }
  }

  /**
   * Reset auth state
   */
  function reset(): void {
    user.value = null
    tokens.value = null
    isInitialized.value = false
    isLoading.value = false
    error.value = null
    StorageUtils.clearTokens()
  }

  return {
    // State
    user,
    tokens,
    isInitialized,
    isLoading,
    error,

    // Getters
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
    isBCMManager,
    isRiskOwner,
    isProcessOwner,
    isBCMCoordinator,
    isAccountLocked,
    lockRemainingTime,

    // Actions
    initialize,
    checkAuth,
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
    hasRole,
    hasPermission,
    reset,
  }
})