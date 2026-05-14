import { boot } from 'quasar/wrappers'
import { useUiStore } from '../stores/ui.store'

/**
 * Route Guards Boot File
 * Additional route guard configurations
 */
export default boot(({ router }) => {
  // Progress bar on route change
  router.beforeEach((to, from, next) => {
    // Start progress bar
    if (typeof window !== 'undefined') {
      const progressBar = document.getElementById('nprogress')
      if (progressBar) {
        progressBar.style.display = 'block'
      }
    }
    next()
  })

  router.afterEach((to, from) => {
    // Complete progress bar
    if (typeof window !== 'undefined') {
      const progressBar = document.getElementById('nprogress')
      if (progressBar) {
        setTimeout(() => {
          progressBar.style.display = 'none'
        }, 300)
      }
    }

    // Scroll to top on navigation
    window.scrollTo(0, 0)

    // Update document title
    const appName = import.meta.env.VITE_APP_NAME || 'BCM Mobile'
    const title = to.meta.title as string
    document.title = title ? `${title} - ${appName}` : appName
  })

  // Handle navigation errors
  router.onError((error) => {
    console.error('Router error:', error)

    const uiStore = useUiStore()
    uiStore.setError('Navigation failed. Please try again.')
  })
})
