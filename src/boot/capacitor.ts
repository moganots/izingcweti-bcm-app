import { boot } from 'quasar/wrappers'
import { Capacitor } from '@capacitor/core'
import { useSyncStore, useUiStore } from './../stores'

export default boot(async ({ router }) => {
  const uiStore = useUiStore()
  const syncStore = useSyncStore()

  const platform = Capacitor.getPlatform()
  const isNative = Capacitor.isNativePlatform()

  console.log(`📱 Running on ${platform} (${isNative ? 'native' : 'web'})`)

  // Skip native initialization on web
  if (!isNative) {
    console.log('Web platform detected - Capacitor plugins will be mocked')
    return
  }

  // Only initialize native features on actual device/emulator
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    const { SplashScreen } = await import('@capacitor/splash-screen')
    const { Keyboard, KeyboardResize } = await import('@capacitor/keyboard')
    const { Network } = await import('@capacitor/network')
    const { Device } = await import('@capacitor/device')
    const { App } = await import('@capacitor/app')

    // Configure status bar
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#1a73e8' })

    // Hide splash screen after app is ready
    await SplashScreen.hide({ fadeOutDuration: 500 })

    // Configure keyboard behavior
    await Keyboard.setAccessoryBarVisible({ isVisible: false })
    await Keyboard.setResizeMode({ mode: KeyboardResize.Body })

    // Get device info
    const deviceInfo = await Device.getInfo()
    console.log('📱 Device:', deviceInfo.manufacturer, deviceInfo.model)
    console.log('📱 OS:', deviceInfo.operatingSystem, deviceInfo.osVersion)

    // Set up network monitoring
    await setupNetworkMonitoring(Network, uiStore, syncStore)

    // Set up app lifecycle handlers
    setupAppLifecycle(App, syncStore)

    // Set up push notifications (optional)
    if (import.meta.env.VITE_FEATURE_PUSH_NOTIFICATIONS) {
      await setupPushNotifications()
    }

    console.log('✓ Native features initialized')
  } catch (error) {
    console.error('Failed to initialize native features:', error)
  }
})

// Separate functions to avoid reference errors
async function setupNetworkMonitoring(Network: any, uiStore: any, syncStore: any): Promise<void> {
  try {
    const status = await Network.getStatus()
    if (status.connected) {
      uiStore.setOnline(status.connectionType)
    } else {
      uiStore.setOffline()
    }

    Network.addListener('networkStatusChange', (status: any) => {
      if (status.connected) {
        uiStore.setOnline(status.connectionType)
        syncStore.fullSync().catch((err: Error) => {
          console.error('Sync after reconnect failed:', err)
        })
      } else {
        uiStore.setOffline()
      }
    })
  } catch (error) {
    console.error('Network monitoring setup failed:', error)
  }
}

function setupAppLifecycle(CapacitorApp: any, syncStore: any): void {
  CapacitorApp.addListener('pause', () => {
    console.log('📱 App paused')
  })

  CapacitorApp.addListener('resume', () => {
    console.log('📱 App resumed')
    syncStore.fullSync().catch(console.error)
  })

  CapacitorApp.addListener('backButton', ({ canGoBack }: { canGoBack: boolean }) => {
    if (canGoBack) {
      window.history.back()
    } else {
      CapacitorApp.exitApp()
    }
  })
}

async function setupPushNotifications(): Promise<void> {
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    const permission = await PushNotifications.requestPermissions()

    if (permission.receive === 'granted') {
      await PushNotifications.register()

      PushNotifications.addListener('registration', (token: any) => {
        console.log('🔔 Push registration token:', token.value)
      })

      PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
        console.log('🔔 Notification received:', notification)
      })

      PushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
        console.log('🔔 Notification action:', action)
      })
    }
  } catch (error) {
    console.error('Push notification setup failed:', error)
  }
}
