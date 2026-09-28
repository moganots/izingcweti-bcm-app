import { Network } from '@capacitor/network'
import { BaseService } from '../BaseService'
import {
  ConnectionType,
  getConnectionType,
  CONNECTION_TYPE_LABELS,
  NetworkStatus,
  NetworkInfo,
} from '../../types/sync.types'
import { API_ENDPOINTS, STORAGE_KEYS } from '../../core/constants/api.constants'
import type { ApiResponse } from '../../shared/types/common.types'

// ============================================
// Response Types
// ============================================

interface HealthCheckResponse extends ApiResponse {
  database?: string
  uptime?: number
  environment?: string
  apiVersion?: string
}

interface PingResponse extends ApiResponse {
  uptime?: number
}

export interface ConnectionQuality {
  type: ConnectionType
  strength: number
  latency: number
  bandwidth: number
  reliable: boolean
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'none'
}

export type NetworkStatusListener = (status: NetworkStatus) => void

// ============================================
// Constants
// ============================================

/** How often we poll the server health endpoint (ms). */
const HEALTH_CHECK_INTERVAL_MS = 60_000

/** TTL for the cached connection-quality result (ms). */
const QUALITY_CACHE_TTL_MS = 2_000

/** Timeout for individual ping/health HTTP calls (ms). */
const CONNECTIVITY_TIMEOUT_MS = 5_000

/** Debounce window for rapid online/offline toggles (ms). */
const STATUS_DEBOUNCE_MS = 250

/** Thresholds (ms) for classifying latency into a quality bucket. */
const LATENCY_EXCELLENT_MS = 100
const LATENCY_GOOD_MS = 300
const LATENCY_FAIR_MS = 1_000

// ============================================
// NetworkMonitor
// ============================================

/**
 * Network Monitor Service
 *
 * Monitors device network connectivity and connection quality.
 * - Uses `@capacitor/network` on native platforms.
 * - Falls back to `window.online`/`offline` events on the web.
 * - Periodically probes the backend via `/ping`.
 *
 * Backend contract:
 *  - `GET ${API_BASE_URL}/ping`   → used for connectivity probe
 *  - `GET ${API_BASE_URL}/health` → used for deep health probe
 *
 * NOTE: This service does **not** depend on any UI store — the
 *       `network.store.ts` subscribes to `addListener()`.
 */
export class NetworkMonitor extends BaseService {
  // ---- Singleton ----
  private static instance: NetworkMonitor | null = null

  // ---- Listeners ----
  private listeners: Set<NetworkStatusListener> = new Set()

  // ---- State ----
  private _isOnline: boolean = true
  private _connectionType: ConnectionType = ConnectionType.UNKNOWN
  private _signalStrength: number = 0

  // ---- Lifecycle ----
  private _isMonitoring: boolean = false
  private _checkInterval: ReturnType<typeof setInterval> | null = null
  private _capacitorListener: { remove: () => void } | null = null
  private _boundOnlineHandler: (() => void) | null = null
  private _boundOfflineHandler: (() => void) | null = null

  // ---- Debounce / cache ----
  private _pendingStatusChange: ReturnType<typeof setTimeout> | null = null
  private _qualityCache: { value: ConnectionQuality; expiresAt: number } | null = null

  // ============================================
  // Constructor
  // ============================================

  private constructor() {
    super()

    // Seed initial online state from the browser when available (SSR-safe).
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      this._isOnline = navigator.onLine
      this._connectionType = this._isOnline
        ? ConnectionType.UNKNOWN
        : ConnectionType.NONE
    }
  }

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
      lastChecked: this.nowIso(),
    }
  }

  /**
   * Full network snapshot including latency + quality, used by SyncEngine.
   * Result is cached for `QUALITY_CACHE_TTL_MS` to avoid hammering the server.
   */
  async getNetworkStatus(): Promise<NetworkInfo> {
    const quality = await this.checkConnectionQuality()
    return {
      isOnline: this._isOnline,
      connectionType: this._connectionType,
      signalStrength: this._signalStrength,
      isMetered: this.isMeteredConnection(),
      latency: quality.latency,
      quality: quality.quality,
      lastChecked: this.nowIso(),
    }
  }

  // ============================================
  // Monitoring Lifecycle
  // ============================================

  async startMonitoring(): Promise<void> {
    if (this._isMonitoring) return

    try {
      // 1. Read initial status from Capacitor (native) — falls back gracefully.
      try {
        const initialStatus = await Network.getStatus()
        this.updateStatus(
          initialStatus.connected,
          getConnectionType(initialStatus.connectionType),
        )
      } catch {
        // Native plugin unavailable (web) — rely on browser events below.
      }

      // 2. Subscribe to Capacitor network-status changes.
      try {
        this._capacitorListener = await Network.addListener(
          'networkStatusChange',
          (status) => {
            this.updateStatus(
              status.connected,
              getConnectionType(status.connectionType),
            )
          },
        )
      } catch {
        this._capacitorListener = null
      }

      // 3. Subscribe to browser online/offline events.
      if (typeof window !== 'undefined') {
        this._boundOnlineHandler = () =>
          this.updateStatus(true, ConnectionType.UNKNOWN)
        this._boundOfflineHandler = () =>
          this.updateStatus(false, ConnectionType.NONE)
        window.addEventListener('online', this._boundOnlineHandler)
        window.addEventListener('offline', this._boundOfflineHandler)
      }

      // 4. Periodic server-side health check.
      this._checkInterval = setInterval(() => {
        this.performHealthCheck().catch(() => {
          /* already handled internally */
        })
      }, HEALTH_CHECK_INTERVAL_MS)

      this._isMonitoring = true
      console.log(
        `✓ Network monitoring started (${this.connectionTypeLabel})`,
      )
    } catch (error) {
      // Roll back partial state on failure.
      console.error('Failed to start network monitoring:', error)
      this.stopMonitoring()
      this._isOnline = true
      this._connectionType = ConnectionType.UNKNOWN
    }
  }

  stopMonitoring(): void {
    if (this._capacitorListener) {
      try {
        this._capacitorListener.remove()
      } catch {
        /* noop */
      }
      this._capacitorListener = null
    }

    if (this._checkInterval) {
      clearInterval(this._checkInterval)
      this._checkInterval = null
    }

    if (this._pendingStatusChange) {
      clearTimeout(this._pendingStatusChange)
      this._pendingStatusChange = null
    }

    if (typeof window !== 'undefined') {
      if (this._boundOnlineHandler) {
        window.removeEventListener('online', this._boundOnlineHandler)
        this._boundOnlineHandler = null
      }
      if (this._boundOfflineHandler) {
        window.removeEventListener('offline', this._boundOfflineHandler)
        this._boundOfflineHandler = null
      }
    }

    this._isMonitoring = false
    console.log('✓ Network monitoring stopped')
  }

  /**
   * Reset internal state — primarily for tests / hot-reload.
   */
  reset(): void {
    this.stopMonitoring()
    this.listeners.clear()
    this._qualityCache = null
    this._signalStrength = 0
    this._isOnline =
      typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
        ? navigator.onLine
        : true
    this._connectionType = this._isOnline
      ? ConnectionType.UNKNOWN
      : ConnectionType.NONE
  }

  // ============================================
  // Status Updates
  // ============================================

  /**
   * Debounced status update. Prevents thrashing when the OS emits
   * rapid online/offline/online sequences during network transitions.
   */
  private updateStatus(connected: boolean, connectionType: ConnectionType): void {
    if (this._pendingStatusChange) {
      clearTimeout(this._pendingStatusChange)
    }

    this._pendingStatusChange = setTimeout(() => {
      this._pendingStatusChange = null
      this.applyStatus(connected, connectionType)
    }, STATUS_DEBOUNCE_MS)
  }

  private applyStatus(connected: boolean, connectionType: ConnectionType): void {
    const previousOnline = this._isOnline
    const previousType = this._connectionType

    this._isOnline = connected
    this._connectionType = connected ? connectionType : ConnectionType.NONE

    // Invalidate quality cache on any status change.
    this._qualityCache = null

    const status: NetworkStatus = {
      isOnline: this._isOnline,
      connectionType: this._connectionType,
      signalStrength: this._signalStrength,
      isMetered: this.isMeteredConnection(),
      lastChecked: this.nowIso(),
    }

    this.notifyListeners(status)

    if (previousOnline !== connected) {
      console.log(
        `🌐 Network: ${connected ? 'Online' : 'Offline'} (${CONNECTION_TYPE_LABELS[this._connectionType]})`,
      )
    } else if (previousType !== this._connectionType) {
      console.log(
        `🔀 Connection type changed: ${CONNECTION_TYPE_LABELS[previousType]} → ${CONNECTION_TYPE_LABELS[this._connectionType]}`,
      )
    }
  }

  private notifyListeners(status: NetworkStatus): void {
    this.listeners.forEach((listener) => {
      try {
        listener(status)
      } catch (error) {
        console.error('Network status listener error:', error)
      }
    })
  }

  // ============================================
  // Connection Classification
  // ============================================

  isMeteredConnection(): boolean {
    switch (this._connectionType) {
      case ConnectionType.CELLULAR:
        return true
      case ConnectionType.WIFI:
      case ConnectionType.ETHERNET:
        return false
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

  /**
   * Probe the server to determine latency and classify connection quality.
   * Result is cached for a short TTL to avoid repeated round-trips.
   */
  async checkConnectionQuality(): Promise<ConnectionQuality> {
    // Serve from cache if fresh.
    if (
      this._qualityCache &&
      Date.now() < this._qualityCache.expiresAt
    ) {
      return this._qualityCache.value
    }

    const none = this.noneQuality()

    if (!this._isOnline || this._connectionType === ConnectionType.NONE) {
      this._qualityCache = {
        value: none,
        expiresAt: Date.now() + QUALITY_CACHE_TTL_MS,
      }
      return none
    }

    try {
      const startTime = Date.now()
      const reachable = await this.checkServerConnectivity()
      const latency = Date.now() - startTime

      if (!reachable) {
        this._qualityCache = {
          value: none,
          expiresAt: Date.now() + QUALITY_CACHE_TTL_MS,
        }
        return none
      }

      const quality = this.classifyLatency(latency)

      const result: ConnectionQuality = {
        type: this._connectionType,
        strength: this._signalStrength,
        latency,
        bandwidth: 0,
        reliable: quality !== 'poor',
        quality,
      }

      this._qualityCache = {
        value: result,
        expiresAt: Date.now() + QUALITY_CACHE_TTL_MS,
      }
      return result
    } catch {
      this._qualityCache = {
        value: none,
        expiresAt: Date.now() + QUALITY_CACHE_TTL_MS,
      }
      return none
    }
  }

  /**
   * Determine whether it is currently safe to run a sync operation.
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
   * Resolves as soon as the device is online (or the timeout elapses).
   * Useful for queue processors that must wait for connectivity.
   */
  waitForOnline(timeoutMs: number = 30_000): Promise<boolean> {
    if (this._isOnline) return Promise.resolve(true)

    return new Promise<boolean>((resolve) => {
      let settled = false

      const cleanup = () => {
        if (unsubscribe) unsubscribe()
        if (timer) clearTimeout(timer)
      }

      const unsubscribe = this.addListener((status) => {
        if (status.isOnline && !settled) {
          settled = true
          cleanup()
          resolve(true)
        }
      })

      const timer = setTimeout(() => {
        if (settled) return
        settled = true
        cleanup()
        resolve(false)
      }, timeoutMs)
    })
  }

  /**
   * Set the signal strength (0–100) reported by native plugins.
   */
  setSignalStrength(strength: number): void {
    this._signalStrength = Math.max(0, Math.min(100, strength))
  }

  // ============================================
  // Listeners
  // ============================================

  /**
   * Subscribe to network-status changes.
   * Returns an unsubscribe function; the current status is delivered
   * asynchronously on subscribe so callers immediately see state.
   */
  addListener(listener: NetworkStatusListener): () => void {
    this.listeners.add(listener)

    // Push current status to the new listener on the next tick.
    queueMicrotask(() => {
      if (!this.listeners.has(listener)) return
      try {
        listener(this.currentStatus)
      } catch (error) {
        console.error('Network status listener error (initial):', error)
      }
    })

    return () => {
      this.listeners.delete(listener)
    }
  }

  removeAllListeners(): void {
    this.listeners.clear()
  }

  // ============================================
  // API Integration
  // ============================================

  /**
   * Lightweight reachability probe.
   *
   * Uses `GET ${API_BASE_URL}/ping`. If the backend does not expose `/ping`
   * at the base URL root, this will gracefully return `false`.
   *
   * NOTE: `PING` and `HEALTH` in `API_ENDPOINTS.API` are **root-relative**
   * paths (i.e., they resolve to `${API_BASE_URL}/ping`), NOT
   * `${API_BASE_URL}/api/v1/ping`, because the backend mounts them at the
   * application root. `BaseService.buildUrl()` handles this via the
   * `endpoint.startsWith('http')` guard.
   */
  async checkServerConnectivity(): Promise<boolean> {
    try {
      const response = await this.get<PingResponse>(
        API_ENDPOINTS.API.PING,
        undefined,
        { timeout: CONNECTIVITY_TIMEOUT_MS },
      )
      // Some backends return a 200 with `success: false`, others with
      // `success: true`. Treat any successful HTTP response as reachable.
      return response?.success !== false
    } catch {
      return false
    }
  }

  /**
   * Deep health check — returns the server's health payload or `null`.
   */
  async getServerHealth(): Promise<HealthCheckResponse | null> {
    try {
      return (
        (await this.get<HealthCheckResponse>(
          API_ENDPOINTS.API.HEALTH,
          undefined,
          { timeout: CONNECTIVITY_TIMEOUT_MS },
        )) || null
      )
    } catch {
      return null
    }
  }

  /**
   * Returns `true` if the backend reports its database is healthy.
   */
  async isDatabaseHealthy(): Promise<boolean> {
    try {
      const health = await this.getServerHealth()
      if (!health) return false
      return (
        health.database === 'connected' ||
        (health as any).status === 'healthy' ||
        health.success === true
      )
    } catch {
      return false
    }
  }

  // ============================================
  // Private Helpers
  // ============================================

  private async performHealthCheck(): Promise<void> {
    try {
      const isServerReachable = await this.checkServerConnectivity()

      if (isServerReachable && !this._isOnline) {
        // Recovered — preserve last-known connection type if we had one.
        const restoredType =
          this._connectionType === ConnectionType.NONE
            ? ConnectionType.UNKNOWN
            : this._connectionType
        this.updateStatus(true, restoredType)
      } else if (!isServerReachable && this._isOnline) {
        // Server unreachable — degrade to NONE.
        this.updateStatus(false, ConnectionType.NONE)
      }
    } catch {
      if (this._isOnline) {
        this.updateStatus(false, ConnectionType.NONE)
      }
    }
  }

  private classifyLatency(latency: number): ConnectionQuality['quality'] {
    if (latency < LATENCY_EXCELLENT_MS) return 'excellent'
    if (latency < LATENCY_GOOD_MS) return 'good'
    if (latency < LATENCY_FAIR_MS) return 'fair'
    return 'poor'
  }

  private noneQuality(): ConnectionQuality {
    return {
      type: ConnectionType.NONE,
      strength: 0,
      latency: 0,
      bandwidth: 0,
      reliable: false,
      quality: 'none',
    }
  }

  /**
   * Returns `true` if metered sync is allowed by user settings.
   * SSR-safe.
   */
  private isMeteredSyncAllowed(): boolean {
    if (typeof localStorage === 'undefined') return false
    return localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE + '_metered_sync') === 'true'
      || localStorage.getItem('bcm_metered_sync') === 'true'
  }

  private nowIso(): string {
    return new Date().toISOString()
  }
}

// ============================================
// Singleton Export
// ============================================

export const networkMonitor = NetworkMonitor.getInstance()