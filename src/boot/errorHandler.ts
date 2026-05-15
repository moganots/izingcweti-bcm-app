import { boot } from 'quasar/wrappers'
import { Notify } from 'quasar'
import { useUiStore } from '../stores/ui.store'

/**
 * Global Error Handler Boot File
 * Catches unhandled errors and displays user-friendly messages
 */
export default boot(({ app }) => {
  const uiStore = useUiStore()

  // Vue error handler
  app.config.errorHandler = (err: any, instance, info) => {
    console.error('Vue Error:', err, info)

    const message = getErrorMessage(err)

    if (import.meta.env.DEV) {
      console.error('Component:', instance)
      console.error('Info:', info)
    }

    Notify.create({
      type: 'negative',
      message,
      caption: import.meta.env.DEV ? err.message : undefined,
      position: 'top',
      timeout: 5000,
      actions: [{ icon: 'close', color: 'white' }],
    })
  }

  // Global promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason)

    const message = getErrorMessage(event.reason)

    Notify.create({
      type: 'negative',
      message,
      position: 'top',
      timeout: 5000,
    })

    // Prevent default console error
    event.preventDefault()
  })

  // Global error handler
  window.addEventListener('error', (event) => {
    console.error('Global Error:', event.error)

    // Only handle non-Promise errors here
    if (event.error && !(event.error instanceof PromiseRejectionEvent)) {
      const message = getErrorMessage(event.error)

      Notify.create({
        type: 'negative',
        message,
        position: 'top',
        timeout: 5000,
      })
    }
  })
})

/**
 * Get user-friendly error message
 */
function getErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred.'

  // Network errors
  if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
    return 'Network connection lost. Working in offline mode.'
  }

  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.'
  }

  // API errors
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  // Known error messages
  if (error.message) {
    // Truncate long messages
    if (error.message.length > 200) {
      return error.message.substring(0, 200) + '...'
    }
    return error.message
  }

  return 'An unexpected error occurred. Please try again.'
}
