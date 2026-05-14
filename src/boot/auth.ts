import { boot } from 'quasar/wrappers'
import { useAuthStore } from '../stores/auth.store'

/**
 * Authentication Boot File
 * Initializes authentication state and sets up route guards
 */
export default boot(async ({ router }) => {
  const authStore = useAuthStore()

  // Initialize authentication from stored tokens
  try {
    await authStore.initialize()
    console.log('✓ Authentication initialized')
  } catch (error) {
    console.error('Failed to initialize authentication:', error)
  }

  // Global route guards
  router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)
    const requiredRoles = to.meta.roles as string[] | undefined

    // Wait for auth initialization if needed
    if (!authStore.isInitialized) {
      await authStore.initialize()
    }

    // Check authentication
    if (requiresAuth && !authStore.isAuthenticated) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath },
      })
      return
    }

    // Redirect authenticated users away from guest pages
    if (requiresGuest && authStore.isAuthenticated) {
      next({ name: 'Dashboard' })
      return
    }

    // Check role-based access
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.includes(authStore.userRole)
      if (!hasRole) {
        next({ name: 'Dashboard' })
        return
      }
    }

    next()
  })

  // Handle token refresh on app resume
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && authStore.isAuthenticated) {
      try {
        await authStore.refreshTokenIfNeeded()
      } catch (error) {
        console.error('Token refresh on resume failed:', error)
      }
    }
  })

  // Handle online/offline status for auth
  window.addEventListener('online', () => {
    if (authStore.isAuthenticated) {
      authStore.refreshTokenIfNeeded().catch(console.error)
    }
  })
})
