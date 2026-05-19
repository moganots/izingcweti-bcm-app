import { ref, onMounted, onUnmounted, computed } from 'vue'

export function useNetwork() {
  const isOnline = ref(navigator.onLine)
  const connectionType = ref('unknown')
  const signalStrength = ref(0)
  const isMetered = ref(false)

  function updateNetworkStatus() {
    isOnline.value = navigator.onLine

    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        connectionType.value = connection.effectiveType || connection.type || 'unknown'
        isMetered.value = connection.metered || false

        // Estimate signal strength based on connection type
        if (connectionType.value === '4g') signalStrength.value = 80
        else if (connectionType.value === '3g') signalStrength.value = 50
        else if (connectionType.value === '2g') signalStrength.value = 20
        else if (connectionType.value === 'wifi') signalStrength.value = 100
        else signalStrength.value = 0
      }
    }
  }

  function handleOnline() {
    isOnline.value = true
    updateNetworkStatus()
  }

  function handleOffline() {
    isOnline.value = false
  }

  onMounted(() => {
    updateNetworkStatus()
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        connection.addEventListener('change', updateNetworkStatus)
      }
    }
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)

    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus)
      }
    }
  })

  return {
    isOnline: computed(() => isOnline.value),
    connectionType: computed(() => connectionType.value),
    signalStrength: computed(() => signalStrength.value),
    isMetered: computed(() => isMetered.value),
  }
}
