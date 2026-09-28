import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useNetworkStore } from '../stores/network/network.store'

export interface UseNetworkOptions {
  /** Auto-initialize monitoring on mount */
  autoInit?: boolean
  /** Poll interval for connectivity checks (0 = disabled) */
  pollIntervalMs?: number
}

/**
 * Unified network status + connectivity composable
 * Aligned with useNetworkStore
 */
export function useNetwork(options: UseNetworkOptions = {}) {
  const { autoInit = true, pollIntervalMs = 0 } = options

  const networkStore = useNetworkStore()

  const {
    isOnline,
    connectionType,
    signalStrength,
    isMetered,
    lastChecked,
    connectionLabel,
    isHighBandwidth,
    isOffline,
    isSlowConnection,
  } = storeToRefs(networkStore)

  let pollIntervalId: ReturnType<typeof setInterval> | null = null

  // ============================================
  // Actions
  // ============================================
  async function init(): Promise<void> {
    await networkStore.init()
  }

  async function check(): Promise<boolean> {
    return networkStore.check()
  }

  async function getQuality() {
    return networkStore.getQuality()
  }

  async function isSyncSafe(): Promise<boolean> {
    return networkStore.isSyncSafe()
  }

  // ============================================
  // Lifecycle
  // ============================================
  onMounted(async () => {
    if (autoInit) await networkStore.init()

    if (pollIntervalMs > 0) {
      pollIntervalId = setInterval(() => {
        networkStore.check().catch(console.error)
      }, pollIntervalMs)
    }
  })

  onUnmounted(() => {
    if (pollIntervalId) {
      clearInterval(pollIntervalId)
      pollIntervalId = null
    }
  })

  return {
    // State
    isOnline,
    connectionType,
    signalStrength,
    isMetered,
    lastChecked,

    // Getters
    connectionLabel,
    isHighBandwidth,
    isOffline,
    isSlowConnection,

    // Actions
    init,
    check,
    getQuality,
    isSyncSafe,
  }
}

export default useNetwork