import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials } from '../models/entities/user.entity'
import { authService } from '../services/api/AuthService'
import { StorageUtils } from '../utils/storage.utils'

/**
 * Auth token interface
 */
interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in?: number
  token_type?: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const tokens = ref<AuthTokens | null>(null)
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!tokens.value?.access_token)
  const userId = computed(() => user.value?.uuid || '')
  const userEmail = computed(() => user.value?.email || '')
  const userRole = computed(() => user.value?.role || '')
  const userOrganisationId = computed(() => user.value?.organisation_id || '')
  const isActive = computed(() => user.value?.is_active ?? false)
  const isAdmin = computed(() => {
    const adminRoles = ['System Administrator', 'Super Admin']
    return adminRoles.includes(userRole.value)
  })
  const isBCMManager = computed(() => userRole.value === 'BCM Manager')
  const fullName = computed(() => {
    if (!user.value?.email) return 'User'
    const namePart = user.value.email.split('@')[0]
    return namePart ? namePart.replace(/[._]/g, ' ') : 'User'
  })

  // Actions

  async function initialize(): Promise<void> {
    if (isInitialized.value) return

    isLoading.value = true
    error.value = null

    try {
      // Use synchronous getTokens() for initialization (fast, no await needed)
      const storedTokens = StorageUtils.getTokens()

      if (storedTokens?.access_token) {
        tokens.value = storedTokens

        // Get stored user data synchronously
        const storedUser = StorageUtils.getUserData()
        if (storedUser) {
          user.value = storedUser as User
        } else {
          // Fetch fresh user data from server
          await fetchProfile()
        }
      }
    } catch (err: any) {
      console.error('Auth initialization failed:', err)
      user.value = null
      tokens.value = null
    } finally {
      isInitialized.value = true
      isLoading.value = false
    }
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await authService.login(credentials)

      tokens.value = {
        access_token: response.tokens.access_token,
        refresh_token: response.tokens.refresh_token,
        expires_in: response.tokens.expires_in,
        token_type: response.tokens.token_type,
      }

      user.value = response.user

      // Save tokens synchronously (fast, no await needed)
      StorageUtils.saveTokens(tokens.value)
      StorageUtils.saveUserData(response.user)

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

      tokens.value = {
        ...tokens.value,
        access_token: response.access_token,
        expires_in: response.expires_in,
      }

      StorageUtils.saveTokens(tokens.value)
    } catch (err: any) {
      console.error('Token refresh failed:', err)
      await logout()
      throw err
    }
  }

  async function refreshTokenIfNeeded(): Promise<void> {
    if (!tokens.value?.access_token) return

    try {
      const tokenData = parseJWT(tokens.value.access_token)
      if (tokenData?.exp) {
        const expiresIn = tokenData.exp * 1000 - Date.now()
        if (expiresIn < 300000) {
          await refreshToken()
        }
      }
    } catch (err) {
      console.error('Token expiry check failed:', err)
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

  async function logout(): Promise<void> {
    try {
      await authService.logout().catch(() => { })
    } finally {
      user.value = null
      tokens.value = null
      error.value = null
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
    return roles.includes(userRole.value)
  }

  function parseJWT(token: string): Record<string, any> | null {
    try {
      const base64Url = token!?.split('.')[1]
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

  return {
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
    isActive,
    isAdmin,
    isBCMManager,
    fullName,
    initialize,
    login,
    logout,
    fetchProfile,
    refreshToken,
    refreshTokenIfNeeded,
    changePassword,
    updateProfile,
    hasRole,
  }
})
