import { Network } from '@capacitor/network'
import { BaseService } from '../BaseService'
import { ConnectionType, getConnectionType, CONNECTION_TYPE_LABELS } from './../../types'
import type { NetworkStatus, ConnectionQuality, ApiResponse } from './../../types'
import type { NetworkInfo } from './../../models/entities'
import { useUiStore } from './../../stores/ui/ui.store'
import { API_ENDPOINTS } from 'src/utils/constants'

// Health check response interface
interface HealthCheckResponse extends ApiResponse {
  database?: string
}

// Ping response interface
interface PingResponse extends ApiResponse { }

/**
 * Network Monitor Service
 * Extends BaseService to leverage API capabilities
 * Monitors network connectivity and connection quality
 */
export class NetworkMonitor extends BaseService {
  private listeners: Set<(status: NetworkStatus) => void> = new Set()
  private _isOnline: boolean = true
  private _connectionType: ConnectionType = ConnectionType.UNKNOWN
  private _signalStrength: number = 0
  private _isMonitoring: boolean = false
  private _checkInterval: ReturnType<typeof setInterval> | null = null
  private _capacitorListener: any = null

  private static instance: NetworkMonitor | null = null

  private constructor() {
    super()
  }

  /**
   * Get singleton instance of NetworkMonitor
   */
  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor()
    }
    return NetworkMonitor.instance
  }

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

  /**
   * Get network status as NetworkInfo (for SyncEngine compatibility)
   */
  getNetworkStatus(): NetworkInfo {
    return {
      isOnline: this._isOnline,
      connectionType: this._connectionType,
      lastChecked: new Date().toISOString(),
    }
  }

  // ============================================
  // Monitoring
  // ============================================

  /**
   * Start monitoring network status
   */
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

      // Check health every 60 seconds (matches app.ts health check interval)
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

  /**
   * Stop monitoring network status
   */
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

  /**
   * Update network status and notify listeners
   */
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
        `🌐 Network: ${connected ? 'Online' : 'Offline'} (${CONNECTION_TYPE_LABELS[connectionType]
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

  /**
   * Check if current connection is metered (cellular)
   */
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

  /**
   * Check if connection has high bandwidth
   */
  isHighBandwidth(): boolean {
    return (
      this._connectionType === ConnectionType.WIFI ||
      this._connectionType === ConnectionType.ETHERNET
    )
  }

  /**
   * Check connection quality by measuring latency
   */
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

  /**
   * Check if it's safe to perform sync operations
   */
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

  /**
   * Check if metered sync is allowed by user preference
   */
  private isMeteredSyncAllowed(): boolean {
    return localStorage.getItem('bcm_metered_sync') === 'true'
  }

  // ============================================
  // Listeners
  // ============================================

  /**
   * Add network status change listener
   * @returns Unsubscribe function
   */
  addListener(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.listeners.clear()
  }

  // ============================================
  // API Integration Methods (using BaseService)
  // ============================================

  /**
   * Check server connectivity via ping endpoint
   * Uses /api/ping for lightweight connectivity check
   */
  async checkServerConnectivity(): Promise<boolean> {
    try {
      const response = await this.get<PingResponse>(API_ENDPOINTS.API.PING)
      const validStatuses = ['ok', 'success', 'connected', 'running', 'up', 'alive']
      const isValid = response && validStatuses.includes(response?.status?.toLowerCase()!)

      if (isValid) {
        console.debug('✓ Server connectivity verified')
      }
      return isValid || false
    } catch (error) {
      console.debug('Server connectivity check failed:', error)
      return false
    }
  }

  /**
   * Get detailed server health information
   * Uses /api/health for comprehensive health check including database status
   */
  async getServerHealth(): Promise<HealthCheckResponse | null> {
    try {
      return (await this.get<HealthCheckResponse>(API_ENDPOINTS.API.HEALTH)) || {}
    } catch (error) {
      console.error('Server health check failed:', error)
      return null
    }
  }

  /**
   * Get detailed server ping information
   * Uses /api/ping for comprehensive ping check including database status
   */
  async getServerPing(): Promise<HealthCheckResponse | null> {
    try {
      return (await this.get<HealthCheckResponse>(API_ENDPOINTS.API.PING)) || {}
    } catch (error) {
      console.error('Server health check failed:', error)
      return null
    }
  }

  /**
   * Check if server database is healthy
   */
  async isDatabaseHealthy(): Promise<boolean> {
    try {
      const health = await this.getServerHealth()
      return health?.database === 'connected' || health?.status === 'healthy'
    } catch {
      return false
    }
  }

  /**
   * Get server uptime information
   */
  async getServerUptime(): Promise<number | null> {
    try {
      const ping = await this.get<PingResponse>(API_ENDPOINTS.API.PING)
      return ping?.uptime || null
    } catch {
      return null
    }
  }

  /**
   * Perform comprehensive health check
   * Checks both network connectivity and server health
   */
  async performFullHealthCheck(): Promise<{
    isOnline: boolean
    serverReachable: boolean
    databaseHealthy: boolean
    latency: number
    serverStatus: HealthCheckResponse | null
    timestamp: string
  }> {
    const startTime = Date.now()

    const serverReachable = await this.checkServerConnectivity()
    const databaseHealthy = await this.isDatabaseHealthy()
    const serverStatus = await this.getServerHealth()

    const latency = Date.now() - startTime

    return {
      isOnline: this._isOnline,
      serverReachable:
        serverReachable ||
        ['ok', 'success', 'healthy', 'up', 'running'].includes(serverStatus?.status!),
      databaseHealthy,
      latency,
      serverStatus,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Get detailed network diagnostics
   */
  async getNetworkDiagnostics(): Promise<{
    isOnline: boolean
    connectionType: string
    latency: number
    serverReachable: boolean
    databaseHealthy: boolean
    signalStrength: number
    isMetered: boolean
    isHighBandwidth: boolean
    serverVersion?: string
    serverEnvironment?: string
    serverUptime?: number
    timestamp: string
  }> {
    const quality = await this.checkConnectionQuality()
    const health = await this.performFullHealthCheck()

    return {
      isOnline: this._isOnline,
      connectionType: CONNECTION_TYPE_LABELS[this._connectionType],
      latency: quality.latency,
      serverReachable: health.serverReachable,
      databaseHealthy: health.databaseHealthy,
      signalStrength: this._signalStrength,
      isMetered: this.isMeteredConnection(),
      isHighBandwidth: this.isHighBandwidth(),
      serverVersion: health.serverStatus?.apiVersion,
      serverEnvironment: health.serverStatus?.environment,
      serverUptime: health.serverStatus?.uptime!,
      timestamp: new Date().toISOString(),
    } as any
  }

  /**
   * Wait for stable connection
   * @param timeoutMs Maximum wait time in milliseconds
   */
  async waitForStableConnection(timeoutMs: number = 30000): Promise<boolean> {
    const startTime = Date.now()
    let stableChecks = 0

    while (Date.now() - startTime < timeoutMs) {
      if (!this._isOnline) {
        await this.delay(1000)
        continue
      }

      const quality = await this.checkConnectionQuality()
      if (quality.quality === 'good' || quality.quality === 'excellent') {
        stableChecks++
        if (stableChecks >= 2) {
          return true
        }
      } else {
        stableChecks = 0
      }

      await this.delay(2000)
    }

    return false
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // ============================================
  // Health Check
  // ============================================

  /**
   * Perform health check to verify connectivity
   * Uses /api/ping for lightweight check and updates status accordingly
   */
  private async performHealthCheck(): Promise<void> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      // Use ping endpoint for lightweight check
      const isServerReachable = await this.checkServerConnectivity()

      clearTimeout(timeoutId)

      if (isServerReachable && !this._isOnline) {
        // Server is reachable but we thought we were offline - update status
        this.updateStatus(true, this._connectionType)
      } else if (!isServerReachable && this._isOnline) {
        // Server is not reachable but we thought we were online
        // Check if it's a network error or server error
        try {
          const pingResult = await this.get<PingResponse>(API_ENDPOINTS.API.PING)
          if (!pingResult) {
            this.updateStatus(false, ConnectionType.NONE)
          }
        } catch (error) {
          // Network error - go offline
          this.updateStatus(false, ConnectionType.NONE)
        }
      }
    } catch {
      // Only mark offline on actual network errors
      if (this._isOnline) {
        this.updateStatus(false, ConnectionType.NONE)
      }
    }
  }
}

// Export singleton instance
export const networkMonitor = NetworkMonitor.getInstance()
