import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials } from './../../models/entities/user/user.entity'
import { authService } from './../../services/api/auth/AuthService'
import { StorageUtils, AuthTokens } from './../../utils/storage.utils'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const tokens = ref<AuthTokens | null>(null)
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!tokens.value?.access_token && !!user.value)
  const userId = computed(() => user.value?.uuid || '')
  const userEmail = computed(() => user.value?.email || '')
  const userRole = computed(() => user.value?.role || '')
  const userOrganisationId = computed(() => user.value?.organisation_id || '')
  const isActive = computed(() => user.value?.is_active ?? false)
  const isAdmin = computed(() => {
    const adminRoles = [
      'System Administrator',
      'Super Admin',
      'SYSTEM_ADMINISTRATOR',
      'SUPER_ADMIN',
    ]
    return adminRoles.includes(userRole.value)
  })
  const isBCMManager = computed(
    () => userRole.value === 'BCM Manager' || userRole.value === 'BCM_MANAGER'
  )
  const fullName = computed(() => {
    if (user.value?.first_name && user.value?.last_name) {
      return `${user.value.first_name} ${user.value.last_name}`
    }
    if (user.value?.first_name) return user.value.first_name
    if (user.value?.email) {
      const namePart = user.value.email.split('@')[0]
      return namePart ? namePart.replace(/[._]/g, ' ') : 'User'
    }
    return 'User'
  })

  // Actions

  /**
   * Initialize authentication - called by boot/auth.ts
   */
  async function initialize(): Promise<void> {
    if (isInitialized.value) return

    isLoading.value = true
    error.value = null

    try {
      // Try to get stored tokens synchronously first
      const storedTokens = StorageUtils.getTokens()
      const storedUser = StorageUtils.getUserData()

      if (storedTokens?.access_token && storedUser) {
        // storedTokens already matches AuthTokens type
        tokens.value = storedTokens
        user.value = storedUser as User

        // Validate token and refresh if needed
        await refreshTokenIfNeeded()
      } else if (storedTokens?.access_token) {
        // Have token but no user data - fetch profile
        tokens.value = storedTokens
        await fetchProfile()
      }
    } catch (err: any) {
      console.error('Auth initialization failed:', err)
      // Clear invalid data
      user.value = null
      tokens.value = null
      StorageUtils.clearTokens()
    } finally {
      isInitialized.value = true
      isLoading.value = false
    }
  }

  /**
   * Check authentication status - called by App.vue
   */
  async function checkAuth(): Promise<boolean> {
    if (!isInitialized.value) {
      await initialize()
    }
    return isAuthenticated.value
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await authService.login(credentials)

      const newTokens: AuthTokens = {
        access_token: response.tokens.access_token,
        refresh_token: response.tokens.refresh_token,
        expires_in: response.tokens.expires_in,
        token_type: response.tokens.token_type || 'Bearer',
      }

      tokens.value = newTokens
      user.value = response.user

      // Save to storage
      StorageUtils.saveTokens(newTokens)
      StorageUtils.saveUserData(response.user)

      // Save remembered email
      if (credentials.remember_me) {
        localStorage.setItem('bcm_remembered_email', credentials.email)
      } else {
        localStorage.removeItem('bcm_remembered_email')
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Login failed'
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  async function register(registrationData: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    organisation_id?: string
  }): Promise<User> {
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

  async function refreshToken(): Promise<void> {
    if (!tokens.value?.refresh_token) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await authService.refreshToken(tokens.value.refresh_token)

      const updatedTokens: AuthTokens = {
        ...tokens.value,
        access_token: response.access_token,
        expires_in: response.expires_in,
      }

      tokens.value = updatedTokens
      StorageUtils.saveTokens(updatedTokens)
    } catch (err: any) {
      console.error('Token refresh failed:', err)
      await logout()
      throw err
    }
  }

  async function refreshTokenIfNeeded(): Promise<boolean> {
    if (!tokens.value?.access_token) return false

    try {
      const tokenData = parseJWT(tokens.value.access_token)
      if (tokenData?.exp) {
        const expiresIn = tokenData.exp * 1000 - Date.now()
        // Refresh if less than 5 minutes remaining
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

  async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to change password'
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  async function forgotPassword(email: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await authService.forgotPassword({ email })
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to send reset email'
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  async function resetPassword(token: string, newPassword: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await authService.resetPassword({
        token,
        new_password: newPassword,
        confirm_password: newPassword,
      })
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to reset password'
      error.value = message
      throw new Error(message)
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      // Attempt to notify server, but don't wait for response
      await authService.logout().catch(() => { })
    } finally {
      // Clear state regardless of server response
      user.value = null
      tokens.value = null
      error.value = null
      isInitialized.value = false
      StorageUtils.clearTokens()
    }
  }

  async function updateProfile(data: Partial<User>): Promise<void> {
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

  function hasRole(role: string | string[]): boolean {
    if (!user.value) return false
    const roles = Array.isArray(role) ? role : [role]
    // Normalize role strings for comparison
    const normalizedUserRole = userRole.value.toUpperCase()
    return roles.some((r) => r.toUpperCase() === normalizedUserRole)
  }

  function parseJWT(token: string): Record<string, any> | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null
      const base64Url = parts[1]
      const base64 = base64Url!?.replace(/-/g, '+').replace(/_/g, '/')
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

  // Reset function for testing
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
    isActive,
    isAdmin,
    isBCMManager,
    fullName,

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
    updateProfile,
    hasRole,
    reset,
  }
})
