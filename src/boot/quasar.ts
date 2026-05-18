import { boot } from 'quasar/wrappers'
import {
  Notify,
  Loading,
  Dialog,
  type QVueGlobals,
  type QNotifyCreateOptions,
  type QLoadingShowOptions,
  type QDialogOptions,
} from 'quasar'

/**
 * Quasar Plugins Boot File
 * Configures Quasar plugins with default settings
 */
export default boot(({ app }) => {
  // Configure Notify defaults
  Notify.setDefaults({
    position: 'top',
    timeout: 3000,
    textColor: 'white',
    actions: [{ icon: 'close', color: 'white' }],
  })

  // Configure Loading defaults
  Loading.setDefaults({
    message: 'Loading...',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    spinnerColor: 'white',
    messageColor: 'white',
  })

  // Helper function to get loading active state
  const getLoadingActive = (group?: string): boolean => {
    try {
      // Try calling as function first (some Quasar versions)
      if (typeof Loading.isActive === 'function') {
        return (Loading.isActive as (group?: string) => boolean)(group)
      }
      // Use as property
      return Loading.isActive as boolean
    } catch {
      // Fallback
      return false
    }
  }

  // Create properly typed Quasar global object
  const $q: QVueGlobals = {
    // Notify: function that returns an update function
    notify: (opts: string | QNotifyCreateOptions) => {
      return Notify.create(opts)
    },

    // Loading: object with show/hide methods
    loading: {
      show: (opts?: QLoadingShowOptions) => {
        return Loading.show(opts)
      },
      hide: (group?: string) => {
        Loading.hide(group)
      },
      // isActive as a method for consistency
      get isActive(): boolean {
        // Loading.isActive can be either a function or a boolean property
        // depending on the Quasar version
        if (typeof Loading.isActive === 'function') {
          return (Loading.isActive as () => boolean)()
        }
        return Loading.isActive as boolean
      },
    },

    // Dialog: function that returns a DialogChainObject
    dialog: (opts: QDialogOptions) => {
      return Dialog.create(opts)
    },
  }

  // Assign to global properties
  app.config.globalProperties.$q = $q
})

// Export individual plugins for direct import (recommended for composition API)
export { Notify, Loading, Dialog }
