import { boot } from 'quasar/wrappers'
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { Loading, QSpinnerDots, Notify } from 'quasar'
import type { ApiResponse } from './../types'

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
 * Determine the base URL based on environment
 */
const getBaseUrl = (): string => {
  // In development, use relative path (will be proxied by Vite)
  if (import.meta.env.DEV) {
    return '/api'
  }

  // In production, use the full API URL from env
  return import.meta.env.VITE_API_BASE_URL || '/api'
}

/**
 * Create and export the API client instance
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Active requests counter for loading state
let activeRequests = 0

// Store references (initialized after boot)
let authStore: any = null
let uiStore: any = null
let routerInstance: any = null

/**
 * Lazy load stores to avoid circular dependencies
 */
async function getAuthStore() {
  if (!authStore) {
    const { useAuthStore } = await import('../stores/auth/auth.store')
    authStore = useAuthStore()
  }
  return authStore
}

async function getUiStore() {
  if (!uiStore) {
    const { useUiStore } = await import('../stores/ui/ui.store')
    uiStore = useUiStore()
  }
  return uiStore
}

/**
 * Refresh token interceptor queue
 */
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

// ============================================
// Request Interceptor
// ============================================
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const store = await getAuthStore()

    // Add auth token if available and not skipped
    if (!config.skipAuth && store.tokens?.access_token) {
      config.headers.Authorization = `Bearer ${store.tokens.access_token}`
    }

    // Add organisation ID header
    if (store.user?.organisation_id) {
      config.headers['X-Organisation-Id'] = store.user.organisation_id
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
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Queue the request while token is being refreshed
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return apiClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const store = await getAuthStore()
        await store.refreshToken()

        // Retry the original request with new token
        if (store.tokens?.access_token) {
          processQueue()
          originalRequest.headers.Authorization = `Bearer ${store.tokens.access_token}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        processQueue(refreshError)
        const store = await getAuthStore()
        await store.logout()
        if (routerInstance) {
          routerInstance.push('/auth/login')
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      const ui = await getUiStore()
      ui.setError('You do not have permission to perform this action.')

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
      } else {
        Notify.create({
          type: 'warning',
          message: 'Too many requests. Please try again later.',
          position: 'top',
          timeout: 5000,
        })
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
      const ui = await getUiStore()
      ui.setOffline()

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

/**
 * Axios Boot File
 * Configures interceptors for auth, loading, and error handling
 */
export default boot(async ({ app, router }) => {
  // Store router instance for use in interceptors
  routerInstance = router

  // Make axios and apiClient available globally via Vue prototype
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = apiClient

  // Also provide via Vue's provide/inject
  app.provide('axios', axios)
  app.provide('apiClient', apiClient)

  console.log('✓ Axios HTTP client configured')
  console.log(`  Base URL: ${getBaseUrl()}`)
  console.log(`  Environment: ${import.meta.env.MODE}`)
})
