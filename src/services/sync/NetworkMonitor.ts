import { Network } from '@capacitor/network'
import { ConnectionType, getConnectionType, CONNECTION_TYPE_LABELS } from '../../types/sync.types'
import type { NetworkStatus, ConnectionQuality } from '../../types/sync.types'
import { useUiStore } from '../../stores/ui.store'

export class NetworkMonitor {
  private listeners: Set<(status: NetworkStatus) => void> = new Set()
  private _isOnline: boolean = true
  private _connectionType: ConnectionType = ConnectionType.UNKNOWN
  private _signalStrength: number = 0
  private _isMonitoring: boolean = false
  private _checkInterval: ReturnType<typeof setInterval> | null = null
  private _capacitorListener: any = null

  // ============================================
  // Getters
  // ============================================

  get isOnline(): boolean {
    return this._isOnline
  }

  get connectionType(): ConnectionType {
    return this._connectionType
  }

  get connectionTypeLabel(): string {
    return CONNECTION_TYPE_LABELS[this._connectionType]
  }

  get signalStrength(): number {
    return this._signalStrength
  }

  get isMonitoring(): boolean {
    return this._isMonitoring
  }

  get currentStatus(): NetworkStatus {
    return {
      isOnline: this._isOnline,
      connectionType: this._connectionType,
      signalStrength: this._signalStrength,
      isMetered: this.isMeteredConnection(),
      lastChecked: new Date().toISOString(),
    }
  }

  // ============================================
  // Monitoring
  // ============================================

  async startMonitoring(): Promise<void> {
    if (this._isMonitoring) return

    try {
      const initialStatus = await Network.getStatus()
      this.updateStatus(initialStatus.connected, getConnectionType(initialStatus.connectionType))

      this._capacitorListener = await Network.addListener('networkStatusChange', (status) => {
        this.updateStatus(status.connected, getConnectionType(status.connectionType))
      })

      if (typeof window !== 'undefined') {
        window.addEventListener('online', () => this.updateStatus(true, ConnectionType.UNKNOWN))
        window.addEventListener('offline', () => this.updateStatus(false, ConnectionType.NONE))
      }

      this._checkInterval = setInterval(() => {
        this.performHealthCheck()
      }, 60000)

      this._isMonitoring = true
      console.log(`✓ Network monitoring started (${this.connectionTypeLabel})`)
    } catch (error) {
      console.error('Failed to start network monitoring:', error)
      this._isOnline = true
      this._connectionType = ConnectionType.UNKNOWN
    }
  }

  stopMonitoring(): void {
    if (this._capacitorListener) {
      this._capacitorListener.remove()
      this._capacitorListener = null
    }

    if (this._checkInterval) {
      clearInterval(this._checkInterval)
      this._checkInterval = null
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', () => this.updateStatus(true, ConnectionType.UNKNOWN))
      window.removeEventListener('offline', () => this.updateStatus(false, ConnectionType.NONE))
    }

    this._isMonitoring = false
    console.log('✓ Network monitoring stopped')
  }

  // ============================================
  // Status Updates
  // ============================================

  private updateStatus(connected: boolean, connectionType: ConnectionType): void {
    const previousOnline = this._isOnline
    const previousType = this._connectionType

    this._isOnline = connected
    this._connectionType = connected ? connectionType : ConnectionType.NONE

    const status: NetworkStatus = {
      isOnline: connected,
      connectionType: this._connectionType,
      signalStrength: this._signalStrength,
      isMetered: this.isMeteredConnection(),
      lastChecked: new Date().toISOString(),
    }

    // Update UI store
    const uiStore = useUiStore()
    if (connected) {
      uiStore.setOnline(connectionType)
    } else {
      uiStore.setOffline()
    }

    // Notify listeners
    this.listeners.forEach((listener) => {
      try {
        listener(status)
      } catch (error) {
        console.error('Network status listener error:', error)
      }
    })

    // Log changes
    if (previousOnline !== connected) {
      console.log(
        `🌐 Network: ${connected ? 'Online' : 'Offline'} (${
          CONNECTION_TYPE_LABELS[connectionType]
        })`
      )
    } else if (previousType !== connectionType) {
      console.log(
        `🔀 Connection type changed: ${CONNECTION_TYPE_LABELS[previousType]} → ${CONNECTION_TYPE_LABELS[connectionType]}`
      )
    }
  }

  // ============================================
  // Connection Checks
  // ============================================

  isMeteredConnection(): boolean {
    switch (this._connectionType) {
      case ConnectionType.CELLULAR:
        return true
      case ConnectionType.WIFI:
      case ConnectionType.ETHERNET:
        return false
      case ConnectionType.NONE:
      case ConnectionType.UNKNOWN:
      default:
        return false
    }
  }

  isHighBandwidth(): boolean {
    return (
      this._connectionType === ConnectionType.WIFI ||
      this._connectionType === ConnectionType.ETHERNET
    )
  }

  async checkConnectionQuality(): Promise<ConnectionQuality> {
    if (!this._isOnline || this._connectionType === ConnectionType.NONE) {
      return {
        type: ConnectionType.NONE,
        strength: 0,
        latency: 0,
        bandwidth: 0,
        reliable: false,
        quality: 'none',
      }
    }

    try {
      const startTime = Date.now()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      await fetch(`${import.meta.env.VITE_API_BASE_URL}/ping`, {
        method: 'HEAD',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const latency = Date.now() - startTime

      let quality: 'excellent' | 'good' | 'fair' | 'poor'
      if (latency < 100) quality = 'excellent'
      else if (latency < 300) quality = 'good'
      else if (latency < 1000) quality = 'fair'
      else quality = 'poor'

      return {
        type: this._connectionType,
        strength: this._signalStrength,
        latency,
        bandwidth: 0, // Would need actual measurement
        reliable: quality !== 'poor',
        quality,
      }
    } catch {
      return {
        type: this._connectionType,
        strength: 0,
        latency: 0,
        bandwidth: 0,
        reliable: false,
        quality: 'none',
      }
    }
  }

  async isSyncSafe(): Promise<boolean> {
    if (!this._isOnline) return false

    const quality = await this.checkConnectionQuality()

    if (quality.quality === 'poor' || quality.quality === 'none') {
      return false
    }

    if (this.isMeteredConnection() && !this.isMeteredSyncAllowed()) {
      return false
    }

    return true
  }

  private isMeteredSyncAllowed(): boolean {
    return localStorage.getItem('bcm_metered_sync') === 'true'
  }

  // ============================================
  // Listeners
  // ============================================

  addListener(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  removeAllListeners(): void {
    this.listeners.clear()
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/ping`, {
        method: 'HEAD',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok && !this._isOnline) {
        this.updateStatus(true, this._connectionType)
      } else if (!response.ok && this._isOnline) {
        this.updateStatus(false, ConnectionType.NONE)
      }
    } catch {
      if (this._isOnline) {
        this.updateStatus(false, ConnectionType.NONE)
      }
    }
  }
}

export const networkMonitor = new NetworkMonitor()
