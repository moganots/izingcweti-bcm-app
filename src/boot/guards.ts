import { boot } from 'quasar/wrappers'
import { useUiStore } from './../stores'

export default boot(({ router }) => {
  router.beforeEach((to, from, next) => {
    // Just log navigation, no Loading to avoid DOM conflicts
    console.log(`Navigating from ${from?.path} to ${to.path}`)
    next()
  })

  router.afterEach((to) => {
    // Update document title only
    try {
      const appName = import.meta.env.VITE_APP_NAME || 'Business Continuity Management System'
      const title = to.meta.title as string
      document.title = title ? `${title} - ${appName}` : appName
    } catch (error) {
      console.warn('Failed to update title:', error)
    }
  })

  // Handle navigation errors
  router.onError((error) => {
    console.error('Router error:', error)

    // Ignore Quasar layout internal errors
    if (
      error instanceof Error &&
      (error.message?.includes('height') ||
        error.message?.includes('parentNode') ||
        error.message?.includes('undefined'))
    ) {
      console.warn('Layout error (ignored):', error.message)
      return
    }

    const uiStore = useUiStore()
    uiStore.setError('Navigation failed. Please try again.')
  })
})
