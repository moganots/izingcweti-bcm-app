import { boot } from 'quasar/wrappers'
import { Capacitor } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Keyboard, KeyboardResize } from '@capacitor/keyboard'
import { Network } from '@capacitor/network'
import { PushNotifications } from '@capacitor/push-notifications'
import { Device } from '@capacitor/device'
import { useUiStore } from '../stores/ui.store'
import { useSyncStore } from '../stores/sync.store'

/**
 * Capacitor Boot File
 * Initializes native platform features and event listeners
 */
export default boot(async ({ router }) => {
  const uiStore = useUiStore()
  const syncStore = useSyncStore()

  // Check if running on native platform
  const platform = Capacitor.getPlatform()
  const isNative = Capacitor.isNativePlatform()

  console.log(`📱 Running on ${platform} (${isNative ? 'native' : 'web'})`)

  if (isNative) {
    await initializeNativeFeatures()
  }

  // ============================================
  // Native Features Initialization
  // ============================================
  async function initializeNativeFeatures(): Promise<void> {
    try {
      // Configure status bar
      await StatusBar.setStyle({ style: Style.Dark })
      await StatusBar.setBackgroundColor({ color: '#1a73e8' })

      // Hide splash screen after app is ready
      await SplashScreen.hide({ fadeOutDuration: 500 })

      // Configure keyboard behavior
      await Keyboard.setAccessoryBarVisible({ isVisible: false })
      await Keyboard.setResizeMode({ mode: 'body' as KeyboardResize })

      // Get device info
      const deviceInfo = await Device.getInfo()
      console.log('📱 Device:', deviceInfo.manufacturer, deviceInfo.model)
      console.log('📱 OS:', deviceInfo.operatingSystem, deviceInfo.osVersion)

      // Set up network monitoring
      await setupNetworkMonitoring()

      // Set up push notifications
      await setupPushNotifications()

      // Set up app lifecycle handlers
      setupAppLifecycle()

      console.log('✓ Native features initialized')
    } catch (error) {
      console.error('Failed to initialize native features:', error)
    }
  }

  // ============================================
  // Network Monitoring
  // ============================================
  async function setupNetworkMonitoring(): Promise<void> {
    try {
      // Get initial network status
      const status = await Network.getStatus()
      updateNetworkStatus(status.connected, status.connectionType)

      // Listen for network changes
      Network.addListener('networkStatusChange', (status) => {
        updateNetworkStatus(status.connected, status.connectionType)
      })
    } catch (error) {
      console.error('Network monitoring setup failed:', error)
    }
  }

  function updateNetworkStatus(connected: boolean, connectionType: string): void {
    if (connected) {
      uiStore.setOnline(connectionType)

      // Trigger sync when coming back online
      syncStore.fullSync().catch((err) => {
        console.error('Sync after reconnect failed:', err)
      })
    } else {
      uiStore.setOffline()
    }
  }

  // ============================================
  // Push Notifications
  // ============================================
  async function setupPushNotifications(): Promise<void> {
    if (!import.meta.env.VITE_FEATURE_PUSH_NOTIFICATIONS) {
      console.log('ℹ Push notifications disabled')
      return
    }

    try {
      // Request permission
      const permission = await PushNotifications.requestPermissions()

      if (permission.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register()

        // Listen for registration
        PushNotifications.addListener('registration', (token) => {
          console.log('🔔 Push registration token:', token.value)
          // Send token to backend
        })

        // Listen for incoming notifications
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('🔔 Notification received:', notification)
        })

        // Handle notification tap
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('🔔 Notification action:', action)
          // Navigate based on notification data
        })
      }
    } catch (error) {
      console.error('Push notification setup failed:', error)
    }
  }

  // ============================================
  // App Lifecycle Handlers
  // ============================================
  function setupAppLifecycle(): void {
    // App paused (going to background)
    CapacitorApp.addListener('pause', () => {
      console.log('📱 App paused')
      // Save any pending state
    })

    // App resumed (coming to foreground)
    CapacitorApp.addListener('resume', () => {
      console.log('📱 App resumed')
      // Refresh data or check for updates
      syncStore.fullSync().catch(console.error)
    })

    // Back button (Android)
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back()
      } else {
        CapacitorApp.exitApp()
      }
    })

    // App URL opened (deep links)
    CapacitorApp.addListener('appUrlOpen', (data) => {
      console.log('🔗 Deep link opened:', data.url)
      // Handle deep links
    })
  }
})
