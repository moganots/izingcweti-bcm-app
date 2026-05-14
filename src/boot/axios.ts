import { boot } from 'quasar/wrappers'
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '../stores/auth.store'
import { useUiStore } from '../stores/ui.store'
import { Loading, QSpinnerDots, Notify } from 'quasar'
import type { ApiResponse } from '../types/common.types'

// Extend Axios config types
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    showLoading?: boolean
    showError?: boolean
    retryCount?: number
    skipAuth?: boolean
  }
}

/**
 * Create and export the API client instance
 * This is created outside the boot function so it can be imported by services
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9810/api',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Active requests counter for loading state
let activeRequests = 0

/**
 * Axios Boot File
 * Configures interceptors for auth, loading, and error handling
 */
export default boot(({ app, router }) => {
  // ============================================
  // Request Interceptor
  // ============================================
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const authStore = useAuthStore()

      // Add auth token if available and not skipped
      if (!config.skipAuth && authStore.tokens?.access_token) {
        config.headers.Authorization = `Bearer ${authStore.tokens.access_token}`
      }

      // Add organisation ID header
      if (authStore.user?.organisation_id) {
        config.headers['X-Organisation-Id'] = authStore.user.organisation_id
      }

      // Add request tracing ID
      config.headers['X-Request-Id'] = generateRequestId()

      // Show loading spinner for non-silent requests
      if (config.showLoading !== false) {
        activeRequests++
        Loading.show({
          spinner: QSpinnerDots,
          message: 'Loading...',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        })
      }

      return config
    },
    (error: AxiosError) => {
      hideLoading()
      return Promise.reject(error)
    }
  )

  // ============================================
  // Response Interceptor
  // ============================================
  apiClient.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      hideLoading()
      return response
    },
    async (error: AxiosError) => {
      hideLoading()

      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean
      }

      // Handle 401 Unauthorized - attempt token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          const authStore = useAuthStore()
          await authStore.refreshToken()

          // Retry the original request with new token
          if (authStore.tokens?.access_token) {
            originalRequest.headers.Authorization = `Bearer ${authStore.tokens.access_token}`
            return apiClient(originalRequest)
          }
        } catch (refreshError) {
          // Refresh failed - logout user
          const authStore = useAuthStore()
          await authStore.logout()
          router.push('/auth/login')
          return Promise.reject(refreshError)
        }
      }

      // Handle 403 Forbidden
      if (error.response?.status === 403) {
        const uiStore = useUiStore()
        uiStore.setError('You do not have permission to perform this action.')

        if (originalRequest?.showError !== false) {
          Notify.create({
            type: 'negative',
            message: 'Access denied. You do not have permission.',
            position: 'top',
            timeout: 5000,
          })
        }
      }

      // Handle 429 Too Many Requests with retry
      if (error.response?.status === 429) {
        const retryAfter = parseInt((error.response.headers as any)?.['retry-after'] || '5')

        if (originalRequest?.retryCount === undefined) {
          originalRequest.retryCount = 0
        }

        if ((originalRequest.retryCount || 0) < 3) {
          originalRequest.retryCount = (originalRequest.retryCount || 0) + 1

          // Wait and retry
          await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000))
          return apiClient(originalRequest)
        }
      }

      // Handle 404 Not Found
      if (error.response?.status === 404) {
        if (originalRequest?.showError !== false) {
          console.warn('Resource not found:', originalRequest?.url)
        }
      }

      // Handle 500 Server Errors
      if (error.response && error.response.status >= 500) {
        console.error('Server error:', {
          status: error.response.status,
          url: originalRequest?.url,
          data: error.response.data,
        })

        if (originalRequest?.showError !== false) {
          Notify.create({
            type: 'negative',
            message: 'A server error occurred. Please try again later.',
            position: 'top',
            timeout: 5000,
          })
        }
      }

      // Handle network errors (no response)
      if (!error.response) {
        const uiStore = useUiStore()
        uiStore.setOffline()

        if (originalRequest?.showError !== false) {
          Notify.create({
            type: 'warning',
            message: 'Network error. Working in offline mode.',
            position: 'top',
            timeout: 3000,
          })
        }
      }

      return Promise.reject(error)
    }
  )

  /**
   * Hide loading spinner
   */
  function hideLoading(): void {
    activeRequests = Math.max(0, activeRequests - 1)
    if (activeRequests === 0) {
      Loading.hide()
    }
  }

  /**
   * Generate unique request ID for tracing
   */
  function generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  // Make axios and apiClient available globally via Vue prototype
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = apiClient

  // Also provide via Vue's provide/inject
  app.provide('axios', axios)
  app.provide('apiClient', apiClient)

  console.log('✓ Axios HTTP client configured')
})
