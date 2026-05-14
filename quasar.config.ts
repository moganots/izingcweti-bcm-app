// quasar.config.ts
import { defineConfig } from '#q-app/wrappers'

export default defineConfig(() => {
  return {
    boot: [
      'quasar', // Quasar plugins configuration
      'pinia', // Pinia store setup
      'i18n', // Internationalization
      'axios', // HTTP client
      'capacitor', // Native platform features
      'dexie', // Local database
      'auth', // Authentication
      'sync', // Sync engine
      'guards', // Route guards
      'permissions', // Permission checks
      'errorHandler', // Global error handler
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
