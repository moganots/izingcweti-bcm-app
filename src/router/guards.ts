import type { Router, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { useUiStore } from '../stores/ui.store'

/**
 * Setup authentication and navigation guards
 */
export function setupAuthGuards(router: Router): void {
  router.beforeEach(
    async (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()

      // Wait for auth to initialize if needed
      if (!authStore.isInitialized) {
        await authStore.initialize()
      }

      const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
      const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)
      const requiredRoles = to.meta.roles as string[] | undefined
      const requiredPermissions = to.meta.permissions as string[] | undefined

      // ==========================================
      // Authentication Check
      // ==========================================
      if (requiresAuth && !authStore.isAuthenticated) {
        next({
          name: 'Login',
          query: { redirect: to.fullPath },
        })
        return
      }

      // ==========================================
      // Guest Check (redirect authenticated users away from login)
      // ==========================================
      if (requiresGuest && authStore.isAuthenticated) {
        next({ name: 'Dashboard' })
        return
      }

      // ==========================================
      // Role-Based Access Check
      // ==========================================
      if (requiredRoles && requiredRoles.length > 0) {
        const userRole = authStore.userRole
        const hasRole = requiredRoles.includes(userRole)

        if (!hasRole) {
          console.warn(`Access denied: Role "${userRole}" not in [${requiredRoles.join(', ')}]`)
          next({ name: 'Dashboard' })
          return
        }
      }

      // ==========================================
      // Permission-Based Access Check
      // ==========================================
      if (requiredPermissions && requiredPermissions.length > 0) {
        const { usePermissions } = await import('../composables/usePermissions')
        const { canAny } = usePermissions()

        if (!canAny(requiredPermissions as any)) {
          console.warn(`Access denied: Missing permissions [${requiredPermissions.join(', ')}]`)
          next({ name: 'Dashboard' })
          return
        }
      }

      // ==========================================
      // Active User Check
      // ==========================================
      if (requiresAuth && authStore.isAuthenticated && !authStore.isActive) {
        await authStore.logout()
        next({
          name: 'Login',
          query: {
            message: 'Your account has been deactivated. Contact your administrator.',
          },
        })
        return
      }

      next()
    }
  )

  // ============================================
  // Global After Each Guard
  // ============================================
  router.afterEach((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    // Update document title
    const appName = import.meta.env.VITE_APP_NAME || 'Izingcweti BCM'
    const title = to.meta.title as string
    document.title = title ? `${title} - ${appName}` : appName

    // Scroll to top on navigation (handled by scrollBehavior)
    if (!to.hash) {
      window.scrollTo(0, 0)
    }

    // Track page view if analytics enabled
    if (import.meta.env.VITE_ANALYTICS_ENABLED === 'true') {
      trackPageView(to)
    }
  })

  // ============================================
  // Navigation Error Handler
  // ============================================
  router.onError((error) => {
    console.error('Router error:', error)
    const uiStore = useUiStore()
    uiStore.setError('Navigation failed. Please try again.')
  })
}

/**
 * Setup offline guard
 * Redirects to appropriate pages when offline
 */
export function setupOfflineGuard(router: Router): void {
  router.beforeEach(
    (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
      const uiStore = useUiStore()

      if (uiStore.isOffline) {
        // Routes that require internet connectivity
        const offlineRestrictedRoutes = ['DocumentUpload', 'SyncDashboard']

        if (to.name && offlineRestrictedRoutes.includes(to.name as string)) {
          next({ name: 'Dashboard' })
          return
        }
      }

      next()
    }
  )
}

/**
 * Setup page transition guard
 * Determines transition direction based on route depth
 */
export function setupTransitionGuard(router: Router): void {
  router.beforeEach(
    (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
      if (!from.name) {
        to.meta.transition = 'fade'
      } else {
        const toDepth = to.path.split('/').filter(Boolean).length
        const fromDepth = from.path.split('/').filter(Boolean).length
        to.meta.transition = toDepth > fromDepth ? 'slide-left' : 'slide-right'
      }
      next()
    }
  )
}

/**
 * Track page view for analytics
 */
function trackPageView(route: RouteLocationNormalized): void {
  try {
    // Send page view to analytics service
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Page view: ${route.fullPath}`)
    }
    // In production, send to actual analytics service
    // analyticsService.trackPageView(route.fullPath, route.meta.title);
  } catch (error) {
    // Silently ignore analytics errors
  }
}
