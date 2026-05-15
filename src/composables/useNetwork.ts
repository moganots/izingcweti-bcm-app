import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Capacitor } from '@capacitor/core'
import { Network } from '@capacitor/network'

export function useNetwork() {
  const isOnline = ref(navigator.onLine)
  const connectionType = ref<string | null>(null)

  const handleOnline = () => {
    isOnline.value = true
    console.log('Network: online')
  }

  const handleOffline = () => {
    isOnline.value = false
    console.log('Network: offline')
  }

  const setupNativeNetworkListener = async () => {
    if (!Capacitor.isNativePlatform()) return

    try {
      const status = await Network.getStatus()
      isOnline.value = status.connected
      connectionType.value = status.connectionType

      Network.addListener('networkStatusChange', (status) => {
        isOnline.value = status.connected
        connectionType.value = status.connectionType
      })
    } catch (error) {
      console.error('Failed to setup network listener:', error)
    }
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setupNativeNetworkListener()
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    isOnline,
    connectionType,
    isOffline: computed(() => !isOnline.value),
  }
}
