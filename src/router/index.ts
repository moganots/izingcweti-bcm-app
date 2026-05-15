import {
  createRouter,
  createWebHistory,
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
  history: Capacitor.isNativePlatform()
    ? createWebHashHistory(import.meta.env.BASE_URL || '/')
    : createWebHistory(import.meta.env.BASE_URL || '/'),
  routes,
  scrollBehavior(
    to: RouteLocationNormalized,
    from: RouteLocationNormalizedLoaded,
    savedPosition: { left: number; top: number } | null
  ) {
    // If saved position exists (browser back/forward navigation), restore it
    if (savedPosition) {
      return savedPosition
    }
    // If navigating to a new page, scroll to top
    if (to.hash) {
      // If URL has a hash, scroll to that element
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    // Otherwise scroll to top
    return { top: 0, left: 0 }
  },
})

// ============================================
// Setup All Guards
// ============================================
setupAuthGuards(router)
setupOfflineGuard(router)
setupTransitionGuard(router)

export default router

// Re-export for convenience
export { router }
