import { boot } from 'quasar/wrappers'
import { useAuthStore } from './../stores/auth/auth.store'

export default boot(async ({ router }) => {
  const authStore = useAuthStore()

  // Initialize authentication from stored tokens
  try {
    await authStore.initialize()
    console.log('✓ Authentication initialized')
  } catch (error) {
    console.error('Failed to initialize authentication:', error)
  }

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
})
