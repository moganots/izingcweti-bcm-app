import type { Router, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore, useUiStore, useSyncStore } from './../stores'

/**
 * Toast notification interface
 */
interface ToastNotification {
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  timeout?: number
}

/**
 * Route access context
 */
interface RouteAccessContext {
  requiresAuth: boolean
  requiresGuest: boolean
  requiredRoles: string[]
  requiredPermissions: string[]
  routeName: string | null | undefined
  routePath: string
}

/**
 * Setup authentication guard
 * Handles public/private route access, role-based authorization, and guest redirects
 */
export function setupAuthGuards(router: Router): void {
  router.beforeEach(
    async (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      try {
        const authStore = useAuthStore()

        // Log navigation (only in development)
        if (import.meta.env.DEV) {
          console.log(`[Router Guard] Navigating from: ${from.path} to: ${to.path}`)
          console.log(`[Router Guard] Auth state:`, {
            isInitialized: authStore.isInitialized,
            isAuthenticated: authStore.isAuthenticated,
            userRole: authStore.userRole,
            userId: authStore.userId,
          })
        }

        // Wait for auth to initialize with timeout
        if (!authStore.isInitialized) {
          console.log('[Router Guard] Waiting for auth initialization...')
          try {
            await Promise.race([
              authStore.initialize(),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Auth initialization timeout')), 5000)
              ),
            ])
          } catch (initError) {
            console.error('[Router Guard] Auth initialization failed:', initError)
            // If auth fails and route requires auth, redirect to login
            const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth === true)
            if (requiresAuth) {
              console.log(
                '[Router Guard] Auth required but initialization failed, redirecting to login'
              )
              next({ name: 'Login', query: { redirect: to.fullPath, error: 'auth_init_failed' } })
              return
            }
          }
        }

        // Get route access context
        const context = getRouteAccessContext(to)

        // Log access requirements (development only)
        if (import.meta.env.DEV) {
          console.log(`[Router Guard] Route requirements:`, context)
        }

        // ==========================================
        // Authentication Check
        // ==========================================
        if (context.requiresAuth && !authStore.isAuthenticated) {
          console.log('[Router Guard] Auth required but not authenticated, redirecting to login')
          trackAuthRedirect(to, from, 'unauthenticated')
          next({
            name: 'Login',
            query: {
              redirect: to.fullPath,
              timestamp: Date.now().toString(),
            },
          })
          return
        }

        // ==========================================
        // Guest Check (redirect authenticated users away from auth pages)
        // ==========================================
        if (context.requiresGuest && authStore.isAuthenticated) {
          console.log('[Router Guard] Guest route but authenticated, redirecting to dashboard')
          trackAuthRedirect(to, from, 'authenticated_guest')
          next({ name: 'Dashboard' })
          return
        }

        // ==========================================
        // Role-Based Access Control
        // ==========================================
        if (context.requiredRoles.length > 0) {
          const hasRequiredRole = context.requiredRoles.some(
            (role) =>
              authStore.userRole?.toUpperCase() === role.toUpperCase() || authStore.hasRole(role)
          )

          if (!hasRequiredRole) {
            console.warn(
              `[Router Guard] Access denied: User role "${authStore.userRole
              }" does not have required roles: ${context.requiredRoles.join(', ')}`
            )
            trackAccessDenied(to, from, 'role', authStore.userRole, context.requiredRoles)
            next({ name: 'Dashboard', query: { error: 'access_denied' } })
            return
          }
        }

        // ==========================================
        // Permission-Based Access Control
        // ==========================================
        if (context.requiredPermissions.length > 0) {
          // This would integrate with a permission service if available
          // For now, log warning and allow access (permissions check can be implemented later)
          if (import.meta.env.DEV) {
            console.warn(
              `[Router Guard] Permission check not fully implemented. Required: ${context.requiredPermissions.join(
                ', '
              )}`
            )
          }
        }

        // ==========================================
        // Maintenance Mode Check
        // ==========================================
        if ((await isMaintenanceMode()) && !isMaintenanceBypassAllowed(authStore)) {
          console.log('[Router Guard] Maintenance mode active, redirecting to maintenance page')
          if (to.name !== 'Maintenance') {
            next({ name: 'Maintenance', query: { redirect: to.fullPath } })
            return
          }
        }

        // ==========================================
        // Feature Flag Check
        // ==========================================
        const featureCheck = await checkFeatureAccess(to)
        if (!featureCheck.allowed) {
          console.warn(`[Router Guard] Feature disabled: ${featureCheck.featureName}`)
          next({ name: 'Dashboard', query: { error: 'feature_disabled' } })
          return
        }

        // ==========================================
        // Rate Limiting / Throttling (Navigation)
        // ==========================================
        if (!shouldAllowNavigation(to, from)) {
          console.warn('[Router Guard] Navigation rate limited')
          // Still allow navigation but log it
        }

        console.log('[Router Guard] Navigation allowed')
        next()
      } catch (error) {
        console.error('[Router Guard] Unexpected error:', error)
        // Fall through to allow navigation on unexpected errors to prevent app lockout
        next()
      }
    }
  )
}

/**
 * Setup offline guard
 * Handles offline mode restrictions and notifications
 */
export function setupOfflineGuard(router: Router): void {
  router.beforeEach(
    (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
      const uiStore = useUiStore()
      const syncStore = useSyncStore()

      if (uiStore.isOffline) {
        // Routes that require internet connectivity
        const offlineRestrictedRoutes = [
          'DocumentUpload',
          'SyncDashboard',
          'AuditLogs',
          'Reports',
          'ExportData',
          'ImportData',
        ]

        // Routes that work offline but show warning
        const offlineWarningRoutes = ['Dashboard', 'Risks', 'Incidents', 'Documents', 'Profile']

        if (to.name && offlineRestrictedRoutes.includes(String(to.name))) {
          console.log(`[Router Guard] Offline mode: Restricted route "${String(to.name)}" blocked`)
          // Use addToast instead of showToast
          uiStore.addToast({
            type: 'warning',
            title: 'Offline Mode',
            message: 'This feature requires an internet connection',
            duration: 3000,
          })
          next({ name: String(from.name) || 'Dashboard' })
          return
        }

        if (to.name && offlineWarningRoutes.includes(String(to.name))) {
          console.log(`[Router Guard] Offline mode: Warning shown for "${String(to.name)}"`)
          // Show warning but allow navigation
          if (syncStore.hasPendingChanges) {
            uiStore.addToast({
              type: 'info',
              title: 'Pending Changes',
              message: 'You have pending changes that will sync when online',
              duration: 5000,
            })
          }
        }
      }

      next()
    }
  )
}

/**
 * Setup transition guard with enhanced animation handling
 */
export function setupTransitionGuard(router: Router): void {
  router.beforeEach(
    (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
      // Only set transitions if meta exists and transitions are enabled
      if (to.meta && from.meta) {
        // Check if transitions are enabled in user preferences
        const transitionsEnabled = checkTransitionsEnabled()

        if (transitionsEnabled) {
          if (!from.name) {
            // Initial load - use fade
            to.meta.transition = 'fade'
          } else {
            // Determine transition direction based on navigation depth
            const toDepth = getRouteDepth(to)
            const fromDepth = getRouteDepth(from)

            if (toDepth !== fromDepth) {
              to.meta.transition = toDepth > fromDepth ? 'slide-left' : 'slide-right'
            } else {
              // Same depth, check if navigation is modal/overlay
              const isModalRoute = to.meta.modal === true
              to.meta.transition = isModalRoute ? 'modal' : 'fade'
            }
          }
        } else {
          to.meta.transition = 'none'
        }
      }
      next()
    }
  )
}

/**
 * Setup sync status guard
 * Ensures sync operations are handled before leaving certain routes
 */
export function setupSyncGuard(router: Router): void {
  router.beforeEach(
    async (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const syncStore = useSyncStore()

      // Check if leaving a route with pending changes
      const leavingSyncCriticalRoute = isSyncCriticalRoute(from)
      const enteringSyncCriticalRoute = isSyncCriticalRoute(to)

      if (leavingSyncCriticalRoute && syncStore.hasPendingChanges && !enteringSyncCriticalRoute) {
        console.log('[Router Guard] Pending changes detected, prompting user')

        // This would integrate with a dialog service
        const shouldSync = await promptUserForSync()

        if (shouldSync) {
          await syncStore.fullSync()
        }
      }

      next()
    }
  )
}

/**
 * Setup route change tracking for analytics
 */
export function setupAnalyticsGuard(router: Router): void {
  router.afterEach((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    // Update document title
    if (to.meta?.title) {
      const appName = import.meta.env.VITE_APP_NAME || 'Izingcweti BCM'
      document.title = `${to.meta.title} - ${appName}`
    }

    // Track page view
    trackPageView(to, from)

    // Track route transition time
    if (from.name && to.name && to.meta?.trackTime !== false) {
      trackTransitionTime(from, to)
    }
  })
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get route access context
 */
function getRouteAccessContext(route: RouteLocationNormalized): RouteAccessContext {
  const requiredRoles: string[] = []
  const requiredPermissions: string[] = []

  // Collect roles and permissions from all matched routes
  route.matched.forEach((record) => {
    if (record.meta?.roles) {
      const roles = Array.isArray(record.meta.roles) ? record.meta.roles : [record.meta.roles]
      requiredRoles.push(...roles)
    }
    if (record.meta?.permissions) {
      const permissions = Array.isArray(record.meta.permissions)
        ? record.meta.permissions
        : [record.meta.permissions]
      requiredPermissions.push(...permissions)
    }
  })

  // Convert route name to string safely
  const routeName = route.name ? String(route.name) : null

  return {
    requiresAuth: route.matched.some((record) => record.meta?.requiresAuth === true),
    requiresGuest: route.matched.some((record) => record.meta?.requiresGuest === true),
    requiredRoles: [...new Set(requiredRoles)], // Deduplicate
    requiredPermissions: [...new Set(requiredPermissions)],
    routeName,
    routePath: route.path,
  }
}

/**
 * Get route depth (number of segments)
 */
function getRouteDepth(route: RouteLocationNormalized): number {
  return route.path.split('/').filter(Boolean).length
}

/**
 * Check if transitions are enabled in user preferences
 */
function checkTransitionsEnabled(): boolean {
  try {
    const settings = localStorage.getItem('bcm_settings')
    if (settings) {
      const parsed = JSON.parse(settings)
      return parsed.enable_transitions !== false
    }
  } catch {
    // Default to true
  }
  return true
}

/**
 * Check if maintenance mode is active
 */
async function isMaintenanceMode(): Promise<boolean> {
  try {
    // Check a maintenance flag from API or localStorage
    const maintenanceFlag = localStorage.getItem('bcm_maintenance_mode')
    if (maintenanceFlag === 'true') return true

    // Could also check an API endpoint
    // const response = await apiClient.get('/maintenance/status')
    // return response.data.maintenance
  } catch {
    // Default to false
  }
  return false
}

/**
 * Check if user can bypass maintenance mode
 */
function isMaintenanceBypassAllowed(authStore: any): boolean {
  // Admin users can bypass maintenance mode
  return authStore.isAdmin || authStore.userRole === 'System Administrator'
}

/**
 * Check feature access based on feature flags
 */
async function checkFeatureAccess(
  route: RouteLocationNormalized
): Promise<{ allowed: boolean; featureName?: string }> {
  // This would integrate with a feature flag service
  const featureFlagKey = route.meta?.featureFlag as string

  if (featureFlagKey) {
    // Check if feature is enabled
    const isEnabled = localStorage.getItem(`feature_${featureFlagKey}`) !== 'false'
    return { allowed: isEnabled, featureName: featureFlagKey }
  }

  return { allowed: true }
}

/**
 * Check if navigation should be rate limited
 */
function shouldAllowNavigation(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
): boolean {
  const key = `nav_${from.path}_${to.path}`
  const lastNav = parseInt(localStorage.getItem(key) || '0', 10)
  const now = Date.now()

  // Minimum 100ms between same route transitions
  if (now - lastNav < 100) {
    return false
  }

  localStorage.setItem(key, now.toString())
  return true
}

/**
 * Check if a route is sync-critical (has pending changes that matter)
 */
function isSyncCriticalRoute(route: RouteLocationNormalized): boolean {
  const syncCriticalRoutes = [
    'DocumentUpload',
    'RiskCreate',
    'IncidentReport',
    'BCPCreate',
    'BIACreate',
    'WorkflowCreate',
  ]
  return route.name ? syncCriticalRoutes.includes(String(route.name)) : false
}

/**
 * Prompt user for sync before leaving
 */
async function promptUserForSync(): Promise<boolean> {
  // This would show a dialog
  // For now, return false to allow navigation
  return false
}

/**
 * Track authentication redirects
 */
function trackAuthRedirect(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  reason: string
): void {
  if (import.meta.env.DEV) {
    console.log(`[Analytics] Auth redirect: ${reason} from ${from.path} to ${to.path}`)
  }
  // Send to analytics service
  // analyticsService.trackEvent('auth_redirect', { reason, from: from.path, to: to.path })
}

/**
 * Track access denied events
 */
function trackAccessDenied(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  reason: string,
  userRole: string,
  required: string[]
): void {
  if (import.meta.env.DEV) {
    console.log(
      `[Analytics] Access denied: ${reason} - User: ${userRole}, Required: ${required.join(', ')}`
    )
  }
  // Send to analytics and audit service
  // auditService.log({
  //   action: 'ACCESS_DENIED',
  //   entity_type: 'route',
  //   entity_id: to.path,
  //   metadata: { reason, userRole, required }
  // })
}

/**
 * Track page view for analytics
 */
function trackPageView(to: RouteLocationNormalized, from: RouteLocationNormalized): void {
  try {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Page view: ${to.fullPath} (from: ${from.fullPath || 'direct'})`)
    }

    // Send to analytics service
    // analyticsService.trackPageView({
    //   path: to.fullPath,
    //   title: to.meta?.title,
    //   referrer: from.fullPath,
    //   timestamp: new Date().toISOString()
    // })
  } catch (error) {
    // Silently ignore analytics errors
  }
}

/**
 * Track route transition time
 */
function trackTransitionTime(_from: RouteLocationNormalized, _to: RouteLocationNormalized): void {
  // Track for performance monitoring
  if (import.meta.env.DEV) {
    console.log(`[Performance] Route transition: ${_from.path} → ${_to.path}`)
  }
  // Would send to performance monitoring service
}

// ============================================
// Export all guard setup functions
// ============================================

export const setupAllGuards = (router: Router): void => {
  setupAuthGuards(router)
  setupOfflineGuard(router)
  setupTransitionGuard(router)
  setupSyncGuard(router)
  setupAnalyticsGuard(router)
}

/**
 * Setup route pre-fetching for performance
 */
export function setupPrefetchGuard(router: Router): void {
  router.beforeResolve(async (to: RouteLocationNormalized) => {
    // Prefetch data for routes that declare prefetch meta
    if (to.meta?.prefetch && typeof to.meta.prefetch === 'string') {
      try {
        // Dynamically import prefetch module
        await import(`../stores/${to.meta.prefetch}.store`)
        console.log(`[Prefetch] Prefetched data for ${to.path}`)
      } catch (error) {
        console.warn(`[Prefetch] Failed to prefetch ${to.meta.prefetch}:`, error)
      }
    }
  })
}
