// src/boot/pinia.ts

import { boot } from 'quasar/wrappers'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

/**
 * Pinia Boot File
 * Creates and configures the Pinia store instance with persistence
 */
export default boot(({ app }) => {
  const pinia = createPinia()

  // Add persistence plugin
  pinia.use(piniaPluginPersistedstate)

  // Configure default persistence options
  pinia.use((context) => {
    const storeId = context.store.$id

    // Only persist specific stores
    const persistedStores = ['auth', 'ui', 'settings']

    if (persistedStores.includes(storeId)) {
      context.store.$persist = {
        enabled: true,
        strategies: [
          {
            key: `bcm_${storeId}`,
            storage: localStorage,
            paths: getPersistedPaths(storeId),
          },
        ],
      }
    }
  })

  app.use(pinia)
})

/**
 * Get the paths to persist for each store
 */
function getPersistedPaths(storeId: string): string[] {
  const paths: Record<string, string[]> = {
    auth: ['tokens', 'user', 'isInitialized'],
    ui: ['isDarkMode', 'themeClass'],
    settings: ['preferences'],
  }

  return paths[storeId] || []
}
