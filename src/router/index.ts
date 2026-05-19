import {
  createRouter,
  createWebHashHistory,
  type RouteLocationNormalized,
  type RouteLocationNormalizedLoaded,
} from 'vue-router'
import routes from './routes'
import { setupAllGuards /*setupErrorHandler*/ } from './guards'

/**
 * Create router instance
 */
const router = createRouter({
  history: createWebHashHistory('/'),
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
setupAllGuards(router)
//setupErrorHandler(router)

// Log initial route for debugging
router.isReady().then(() => {
  console.log('Router is ready. Current route:', router.currentRoute.value)
})

export default router
export { router }
