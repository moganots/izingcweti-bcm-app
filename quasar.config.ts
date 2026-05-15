// quasar.config.ts
import { defineConfig } from '#q-app/wrappers'

export default defineConfig(() => {
  return {
    boot: [
      'pinia', // Pinia store setup (FIRST - stores need to be available)
      'quasar', // Quasar plugins configuration
      'i18n', // Internationalization
      'axios', // HTTP client
      'dexie', // Local database (IndexedDB)
      'capacitor', // Native platform features
      'auth', // Authentication (depends on stores)
      'sync', // Sync engine (depends on auth & dexie)
      'guards', // Route guards (depends on auth)
      'permissions', // Permission checks (depends on auth)
      'errorHandler', // Global error handler (LAST - should catch all errors)
    ],
    css: ['app.scss'],
    extras: ['roboto-font', 'material-icons'],
    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari16'],
        node: 'node20',
      },
      typescript: {
        strict: true,
      },
      vueRouterMode: 'hash',
    },
    devServer: {
      open: false,
      port: 8080,
    },
    framework: {
      config: {
        notify: {
          position: 'top',
          timeout: 3000,
          multiLine: false,
        },
        loadingBar: {
          color: 'primary',
          size: '3px',
          position: 'top',
        },
      },
      plugins: ['Notify', 'LoadingBar', 'Dialog', 'Loading'],
    },
    animations: ['fadeIn', 'fadeOut', 'slideInRight', 'slideOutLeft'],
    ssr: {
      pwa: false,
    },
    pwa: {
      workboxMode: 'GenerateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
    },
  }
})
