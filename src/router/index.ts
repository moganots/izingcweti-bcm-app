import {
  createRouter,
  createWebHashHistory,
  type RouteLocationNormalized,
  type RouteLocationNormalizedLoaded,
} from 'vue-router'
import { Capacitor } from '@capacitor/core'
import routes from './routes'
import { setupAuthGuards, setupOfflineGuard, setupTransitionGuard } from './guards'

/**
 * Create router instance
 * Uses hash history on native platforms for better compatibility with Capacitor
 */
const router = createRouter({
  // Use hash history on native mobile (iOS/Android), HTML5 history on web
  // For web development, use hash mode consistently to avoid issues
  history: process.env.NODE_ENV === 'production' && Capacitor.isNativePlatform()
    ? createWebHashHistory('/')
    : createWebHashHistory('/'), // Use hash history for both dev and prod to ensure consistency
  routes,
  scrollBehavior(
    to: RouteLocationNormalized,
    from: RouteLocationNormalizedLoaded,
    savedPosition: { left: number; top: number } | null
  ) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    return { top: 0, left: 0 }
  },
})

// ============================================
// Setup All Guards
// ============================================
setupAuthGuards(router)
setupOfflineGuard(router)
setupTransitionGuard(router)

// Log initial route for debugging
router.isReady().then(() => {
  console.log('Router is ready. Current route:', router.currentRoute.value)
})

export default router

// Re-export for convenience
export { router }