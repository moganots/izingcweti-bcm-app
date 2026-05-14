// src/boot/quasar.ts

import { boot } from 'quasar/wrappers'
import { Notify, Loading, Dialog } from 'quasar'

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
    spinner: undefined,
    message: 'Loading...',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    spinnerColor: 'white',
    messageColor: 'white',
  })

  // Configure Dialog defaults
  Dialog.setDefaults({
    persistent: true,
    ok: {
      color: 'primary',
      label: 'OK',
      flat: false,
    },
    cancel: {
      color: 'grey',
      label: 'Cancel',
      flat: true,
    },
  })

  // Provide Quasar utilities globally
  app.config.globalProperties.$q = {
    notify: Notify.create,
    loading: {
      show: Loading.show,
      hide: Loading.hide,
    },
    dialog: Dialog.create,
  }
})
