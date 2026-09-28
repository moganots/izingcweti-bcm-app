import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { NetworkMonitor } from '../../services/sync/NetworkMonitor'
import {
  ConnectionType,
  CONNECTION_TYPE_LABELS,
  NetworkStatus,
} from '../../types/sync.types'

export const useNetworkStore = defineStore('network', () => {
  // ============================================
  // State
  // ============================================
  const isOnline = ref(navigator.onLine)
  const connectionType = ref<ConnectionType>(ConnectionType.UNKNOWN)
  const signalStrength = ref(0)
  const isMetered = ref(false)
  const lastChecked = ref<string>(new Date().toISOString())

  // ============================================
  // Dependencies
  // ============================================
  let networkMonitor: NetworkMonitor | null = null
  let removeListener: (() => void) | null = null

  // ============================================
  // Getters
  // ============================================
  const connectionLabel = computed(
    () => CONNECTION_TYPE_LABELS[connectionType.value]
  )
  const isHighBandwidth = computed(
    () =>
      connectionType.value === ConnectionType.WIFI ||
      connectionType.value === ConnectionType.ETHERNET
  )
  const isOffline = computed(() => !isOnline.value)
  const isSlowConnection = computed(
    () => signalStrength.value > 0 && signalStrength.value < 30
  )

  // ============================================
  // Actions
  // ============================================

  /**
   * Initialize network monitoring
   */
  async function init(): Promise<void> {
    if (networkMonitor) return

    networkMonitor = NetworkMonitor.getInstance()
    await networkMonitor.startMonitoring()

    // Subscribe to status changes
    removeListener = networkMonitor.addListener((status: NetworkStatus) => {
      isOnline.value = status.isOnline
      connectionType.value = status.connectionType
      signalStrength.value = status.signalStrength
      isMetered.value = status.isMetered
      lastChecked.value = status.lastChecked
    })

    // Get initial status
    const currentStatus = networkMonitor.currentStatus
    isOnline.value = currentStatus.isOnline
    connectionType.value = currentStatus.connectionType
    signalStrength.value = currentStatus.signalStrength
    isMetered.value = currentStatus.isMetered
  }

  /**
   * Manually check connectivity
   */
  async function check(): Promise<boolean> {
    if (!networkMonitor) await init()

    try {
      const reachable = await networkMonitor!.checkServerConnectivity()
      isOnline.value = reachable
      lastChecked.value = new Date().toISOString()
      return reachable
    } catch {
      return false
    }
  }

  /**
   * Get connection quality
   */
  async function getQuality() {
    if (!networkMonitor) await init()
    return networkMonitor!.checkConnectionQuality()
  }

  /**
   * Check if it's safe to sync (not on metered with restriction)
   */
  async function isSyncSafe(): Promise<boolean> {
    if (!networkMonitor) await init()
    return networkMonitor!.isSyncSafe()
  }

  /**
   * Cleanup
   */
  function destroy(): void {
    if (removeListener) {
      removeListener()
      removeListener = null
    }
    if (networkMonitor) {
      networkMonitor.stopMonitoring()
    }
  }

  return {
    // State
    isOnline: readonly(isOnline),
    connectionType: readonly(connectionType),
    signalStrength: readonly(signalStrength),
    isMetered: readonly(isMetered),
    lastChecked: readonly(lastChecked),

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
    destroy,
  }
})