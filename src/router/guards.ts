import type { Router, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '../stores/auth/auth.store'
import { useUiStore } from '../stores/ui/ui.store'

export function setupAuthGuards(router: Router): void {
  router.beforeEach(
    async (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore()
      
      console.log('[Router Guard] Navigating to:', to.name || to.path)
      console.log('[Router Guard] Auth state:', {
        isInitialized: authStore.isInitialized,
        isAuthenticated: authStore.isAuthenticated,
        userRole: authStore.userRole
      })

      // Wait for auth to initialize if needed
      if (!authStore.isInitialized) {
        console.log('[Router Guard] Waiting for auth initialization...')
        await authStore.initialize()
      }

      const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
      const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)
      
      console.log('[Router Guard] Route requirements:', { requiresAuth, requiresGuest })

      // ==========================================
      // Authentication Check
      // ==========================================
      if (requiresAuth && !authStore.isAuthenticated) {
        console.log('[Router Guard] Auth required but not authenticated, redirecting to login')
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
        console.log('[Router Guard] Guest route but authenticated, redirecting to dashboard')
        next({ name: 'Dashboard' })
        return
      }

      console.log('[Router Guard] Navigation allowed')
      next()
    }
  )
  
  // ... rest of the guards
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
