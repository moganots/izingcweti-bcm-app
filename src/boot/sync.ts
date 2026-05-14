// src/boot/sync.ts

import { boot } from 'quasar/wrappers'
import { useSyncStore } from '../stores/sync.store'
import { useAuthStore } from '../stores/auth.store'
import { useUiStore } from '../stores/ui.store'

/**
 * Sync Boot File
 * Initializes the offline-first sync engine
 */
export default boot(async ({}) => {
  const authStore = useAuthStore()
  const syncStore = useSyncStore()
  const uiStore = useUiStore()

  // Wait for authentication to initialize
  const unwatch = authStore.$subscribe((mutation, state) => {
    if (state.isInitialized && state.isAuthenticated) {
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
      await syncStore.initialize()
      console.log('✓ Sync engine initialized')

      // Perform initial sync if online
      if (!uiStore.isOffline) {
        await syncStore.fullSync()
        console.log('✓ Initial sync completed')
      }

      // Start periodic sync
      syncStore.startPeriodicSync()
    } catch (error) {
      console.error('Failed to initialize sync engine:', error)
    }
  }

  // Handle online/offline transitions
  window.addEventListener('online', async () => {
    if (authStore.isAuthenticated && syncStore.hasPendingChanges) {
      console.log('🌐 Online - triggering sync...')
      await syncStore.fullSync().catch(console.error)
    }
  })

  window.addEventListener('offline', () => {
    console.log('📡 Offline - changes will be queued')
  })
})
