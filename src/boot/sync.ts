
import { boot } from 'quasar/wrappers'
import { useSyncStore, useAuthStore } from '../stores'

/**
 * Sync Boot File
 * Initializes the offline-first sync engine
 */
export default boot(async () => {
  const authStore = useAuthStore()
  const syncStore = useSyncStore()

  let isInitializing = false

  async function initializeSync(): Promise<void> {
    if (isInitializing || syncStore.isInitialized) return

    isInitializing = true

    try {
      await syncStore.initialize()
      console.log('Sync engine initialized')

      if (syncStore.isOnline && authStore.isAuthenticated) {
        await syncStore.sync()
        console.log('Initial sync completed')
      }
    } catch (error) {
      console.error('Failed to initialize sync engine:', error)
    } finally {
      isInitializing = false
    }
  }

  const unwatch = authStore.$subscribe((_mutation, state) => {
    if (state.isInitialized && state.tokens?.accessToken && state.user) {
      void initializeSync()
    }
  })

  if (authStore.isInitialized && authStore.isAuthenticated) {
    await initializeSync()
  }

  const handleOnline = async () => {
    if (
      authStore.isAuthenticated &&
      syncStore.isInitialized &&
      syncStore.hasPending
    ) {
      console.log('Online - triggering sync...')
      await syncStore.sync().catch(console.error)
    }
  }

  const handleOffline = () => {
    console.log('Offline - changes will be queued')
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  const cleanup = () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    unwatch()

    if (syncStore.isInitialized) {
      syncStore.cleanup()
    }
  }

  window.addEventListener('beforeunload', cleanup)
})