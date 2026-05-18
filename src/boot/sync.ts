import { boot } from 'quasar/wrappers'
import { useSyncStore, useAuthStore, useUiStore } from '../stores'

/**
 * Sync Boot File
 * Initializes the offline-first sync engine
 */
export default boot(async () => {
  const authStore = useAuthStore()
  const syncStore = useSyncStore()
  const uiStore = useUiStore()

  // Wait for authentication to initialize
  const unwatch = authStore.$subscribe((mutation, state) => {
    cleanup()
    if (state.isInitialized && state.tokens?.access_token && state.user) {
      initializeSync()
    }
  })

  // Initialize if already authenticated
  if (authStore.isInitialized && authStore.isAuthenticated) {
    await initializeSync()
  }

  /**
   * Initialize the sync engine
   */
  async function initializeSync(): Promise<void> {
    try {
      // Initialize the sync store (which initializes the sync engine)
      await syncStore.initialize()
      console.log('✓ Sync engine initialized')

      // Perform initial sync if online
      if (!uiStore.isOffline) {
        // Use fullSync which does both push and pull
        await syncStore.fullSync()
        console.log('✓ Initial sync completed')
      } else {
        console.log('📡 Offline - skipping initial sync, changes will be queued')
      }

      // Start periodic sync (only if sync engine is initialized)
      if (syncStore.isInitialized) {
        syncStore.startPeriodicSync()
      }
    } catch (error) {
      console.error('Failed to initialize sync engine:', error)
    }
  }

  // Handle online/offline transitions
  const handleOnline = async () => {
    if (authStore.isAuthenticated && syncStore.isInitialized && syncStore.hasPendingChanges) {
      console.log('🌐 Online - triggering sync...')
      await syncStore.fullSync().catch(console.error)
    }
  }

  const handleOffline = () => {
    console.log('📡 Offline - changes will be queued')
  }

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Cleanup function for when the app is destroyed
  const cleanup = () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    if (syncStore.isInitialized) {
      syncStore.stopPeriodicSync()
      syncStore.cleanup().catch(console.error)
    }
    unwatch()
  }

  // Register cleanup
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanup)
  }
})
