import { Preferences } from '@capacitor/preferences'
import { STORAGE_KEYS } from './constants'

/**
 * Auth token interface - must match the one in auth.store.ts
 */
export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in?: number // Make optional to match both definitions
  token_type?: string // Make optional
}

// ============================================
// Capacitor Preferences Storage (Async)
// ============================================

export async function setStorageItem(key: string, value: string): Promise<void> {
  try {
    await Preferences.set({ key, value })
  } catch (error) {
    console.warn('Capacitor storage failed, falling back to localStorage:', error)
    localStorage.setItem(key, value)
  }
}

export async function getStorageItem(key: string): Promise<string | null> {
  try {
    const { value } = await Preferences.get({ key })
    return value || null
  } catch (error) {
    console.warn('Capacitor storage failed, falling back to localStorage:', error)
    return localStorage.getItem(key)
  }
}

export async function removeStorageItem(key: string): Promise<void> {
  try {
    await Preferences.remove({ key })
  } catch (error) {
    console.warn('Capacitor storage failed, falling back to localStorage:', error)
    localStorage.removeItem(key)
  }
}

export async function clearStorage(): Promise<void> {
  try {
    await Preferences.clear()
  } catch (error) {
    console.warn('Capacitor storage failed, falling back to localStorage:', error)
    localStorage.clear()
  }
}

export async function getStorageKeys(): Promise<string[]> {
  try {
    const { keys } = await Preferences.keys()
    return keys
  } catch (error) {
    console.warn('Capacitor storage failed:', error)
    return Object.keys(localStorage)
  }
}

// ============================================
// JSON Storage Helpers (Async)
// ============================================

export async function setJSONItem(key: string, value: any): Promise<void> {
  try {
    const jsonString = JSON.stringify(value)
    await setStorageItem(key, jsonString)
  } catch (error) {
    console.error('Failed to store JSON:', error)
  }
}

export async function getJSONItem<T = any>(key: string): Promise<T | null> {
  try {
    const value = await getStorageItem(key)
    if (!value) return null
    return JSON.parse(value) as T
  } catch (error) {
    console.error('Failed to parse stored JSON:', error)
    return null
  }
}

// ============================================
// Auth-Specific Storage (Async)
// ============================================

export async function saveTokensAsync(tokens: AuthTokens): Promise<void> {
  await setJSONItem(STORAGE_KEYS.AUTH_TOKEN, tokens)
}

export async function getTokensAsync(): Promise<AuthTokens | null> {
  return getJSONItem<AuthTokens>(STORAGE_KEYS.AUTH_TOKEN)
}

export async function clearTokensAsync(): Promise<void> {
  await removeStorageItem(STORAGE_KEYS.AUTH_TOKEN)
  await removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN)
  await removeStorageItem(STORAGE_KEYS.USER_DATA)
}

export async function saveUserDataAsync(userData: any): Promise<void> {
  await setJSONItem(STORAGE_KEYS.USER_DATA, userData)
}

export async function getUserDataAsync<T = any>(): Promise<T | null> {
  return getJSONItem<T>(STORAGE_KEYS.USER_DATA)
}

// ============================================
// Settings Storage (Async)
// ============================================

interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: boolean
  biometricEnabled: boolean
  syncInterval: number
  cacheEnabled: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'en',
  notifications: true,
  biometricEnabled: false,
  syncInterval: 5,
  cacheEnabled: true,
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  const current = await getSettings()
  const updated = { ...current, ...settings }
  await setJSONItem(STORAGE_KEYS.SETTINGS, updated)
}

export async function getSettings(): Promise<AppSettings> {
  const stored = await getJSONItem<Partial<AppSettings>>(STORAGE_KEYS.SETTINGS)
  return { ...DEFAULT_SETTINGS, ...stored }
}

// ============================================
// Cache Helpers
// ============================================

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

export async function setCacheItemAsync<T>(
  key: string,
  data: T,
  ttlSeconds: number = 3600
): Promise<void> {
  const item: CacheItem<T> = {
    data,
    timestamp: Date.now(),
    ttl: ttlSeconds * 1000,
  }
  await setJSONItem(`cache_${key}`, item)
}

export async function getCacheItemAsync<T>(key: string): Promise<T | null> {
  const item = await getJSONItem<CacheItem<T>>(`cache_${key}`)
  if (!item) return null
  const isExpired = Date.now() - item.timestamp > item.ttl
  if (isExpired) {
    await removeStorageItem(`cache_${key}`)
    return null
  }
  return item.data
}

export async function removeCacheItemAsync(key: string): Promise<void> {
  await removeStorageItem(`cache_${key}`)
}

export async function hasCacheItemAsync(key: string): Promise<boolean> {
  const item = await getJSONItem<CacheItem<any>>(`cache_${key}`)
  if (!item) return false
  const isExpired = Date.now() - item.timestamp > item.ttl
  if (isExpired) {
    await removeStorageItem(`cache_${key}`)
    return false
  }
  return true
}

export async function clearCacheAsync(): Promise<void> {
  const keys = await getStorageKeys()
  const cacheKeys = keys.filter((k) => k.startsWith('cache_'))
  for (const key of cacheKeys) {
    await removeStorageItem(key)
  }
}

// ============================================
// Migration & Versioning (Async)
// ============================================

export async function getStorageVersion(): Promise<number> {
  const version = await getStorageItem('storage_version')
  return version ? parseInt(version, 10) : 1
}

export async function setStorageVersion(version: number): Promise<void> {
  await setStorageItem('storage_version', version.toString())
}

// ============================================
// StorageUtils Object
// Provides both synchronous (localStorage) and asynchronous (Capacitor) methods
// ============================================

export const StorageUtils = {
  // ==========================================
  // Synchronous localStorage methods
  // ==========================================

  /** Set a string value synchronously */
  set: (key: string, value: string): void => {
    localStorage.setItem(key, value)
  },

  /** Get a string value synchronously */
  get: (key: string): string | null => {
    return localStorage.getItem(key)
  },

  /** Remove a value synchronously */
  remove: (key: string): void => {
    localStorage.removeItem(key)
  },

  /** Clear all localStorage synchronously */
  clear: (): void => {
    localStorage.clear()
  },

  /** Set a JSON value synchronously */
  setJSON: (key: string, value: any): void => {
    localStorage.setItem(key, JSON.stringify(value))
  },

  /** Get a JSON value synchronously */
  getJSON: <T = any>(key: string): T | null => {
    const value = localStorage.getItem(key)
    if (!value) return null
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  },

  // ==========================================
  // Synchronous Storage Helpers
  // ==========================================

  /** Remove a value from storage (synchronous) */
  removeStorageItem: (key: string): void => {
    localStorage.removeItem(key)
  },

  /** Get all storage keys (synchronous) */
  getStorageKeys: (): string[] => {
    return Object.keys(localStorage)
  },

  // ==========================================
  // Synchronous Auth Helpers
  // ==========================================

  /** Save auth tokens synchronously */
  saveTokens: (tokens: AuthTokens): void => {
    StorageUtils.setJSON(STORAGE_KEYS.AUTH_TOKEN, tokens)
  },

  /** Get auth tokens synchronously */
  getTokens: (): AuthTokens | null => {
    return StorageUtils.getJSON<AuthTokens>(STORAGE_KEYS.AUTH_TOKEN)
  },

  /** Clear auth tokens synchronously */
  clearTokens: (): void => {
    StorageUtils.remove(STORAGE_KEYS.AUTH_TOKEN)
    StorageUtils.remove(STORAGE_KEYS.REFRESH_TOKEN)
    StorageUtils.remove(STORAGE_KEYS.USER_DATA)
  },

  /** Save user data synchronously */
  saveUserData: (userData: any): void => {
    StorageUtils.setJSON(STORAGE_KEYS.USER_DATA, userData)
  },

  /** Get user data synchronously */
  getUserData: <T = any>(): T | null => {
    return StorageUtils.getJSON<T>(STORAGE_KEYS.USER_DATA)
  },

  // ==========================================
  // Synchronous Cache Helpers
  // ==========================================

  /** Set cache item with TTL */
  setCacheItem: <T>(key: string, data: T, ttlSeconds: number = 3600): void => {
    const item: CacheItem<T> = { data, timestamp: Date.now(), ttl: ttlSeconds * 1000 }
    StorageUtils.setJSON(`cache_${key}`, item)
  },

  /** Get cache item if not expired */
  getCacheItem: <T>(key: string): T | null => {
    const item = StorageUtils.getJSON<CacheItem<T>>(`cache_${key}`)
    if (!item) return null
    const isExpired = Date.now() - item.timestamp > item.ttl
    if (isExpired) {
      StorageUtils.remove(`cache_${key}`)
      return null
    }
    return item.data
  },

  /** Remove a specific cache item */
  removeCacheItem: (key: string): void => {
    StorageUtils.removeStorageItem(`cache_${key}`)
  },

  /** Check if cache item exists and is not expired */
  hasCacheItem: (key: string): boolean => {
    const item = StorageUtils.getJSON<CacheItem<any>>(`cache_${key}`)
    if (!item) return false
    const isExpired = Date.now() - item.timestamp > item.ttl
    if (isExpired) {
      StorageUtils.remove(`cache_${key}`)
      return false
    }
    return true
  },

  /** Clear all cache items */
  clearCache: (): void => {
    const keys = StorageUtils.getStorageKeys()
    const cacheKeys = keys.filter((k) => k.startsWith('cache_'))
    for (const key of cacheKeys) {
      StorageUtils.removeStorageItem(key)
    }
  },

  // ==========================================
  // Synchronous Clear All Storage
  // ==========================================

  /**
   * Clear all application storage synchronously
   * This removes ALL data including auth tokens, user data, settings, and cache
   */
  clearStorage: (): void => {
    // Clear all localStorage
    localStorage.clear()

    // Also clear sessionStorage if used
    sessionStorage.clear()

    console.log('✓ All storage cleared')
  },

  /**
   * Clear all application data except auth tokens
   * Useful for resetting app state without logging out
   */
  clearAppData: (): void => {
    const keys = StorageUtils.getStorageKeys()
    const preserveKeys = [
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]

    keys.forEach((key: any) => {
      if (!preserveKeys.includes(key)) {
        StorageUtils.removeStorageItem(key)
      }
    })

    console.log('✓ App data cleared (auth preserved)')
  },

  /**
   * Get storage usage statistics
   */
  getStorageStats: (): {
    totalKeys: number
    totalSize: number
    keysByPrefix: Record<string, number>
  } => {
    const keys = StorageUtils.getStorageKeys()
    let totalSize = 0
    const keysByPrefix: Record<string, number> = {}

    keys.forEach((key) => {
      const value = localStorage.getItem(key) || ''
      totalSize += new Blob([value]).size

      const prefix = key.split('_')[0] || 'other'
      keysByPrefix[prefix] = (keysByPrefix[prefix] || 0) + 1
    })

    return { totalKeys: keys.length, totalSize, keysByPrefix }
  },

  // ==========================================
  // Settings Helpers
  // ==========================================

  /** Save app settings */
  saveSettings: async (settings: Partial<AppSettings>): Promise<void> => {
    await saveSettings(settings)
  },

  /** Get app settings */
  getSettings: async (): Promise<AppSettings> => {
    return getSettings()
  },

  // ==========================================
  // Async Cache Helpers
  // ==========================================

  setCacheItemAsync: async <T>(key: string, data: T, ttlSeconds?: number): Promise<void> => {
    await setCacheItemAsync(key, data, ttlSeconds)
  },

  getCacheItemAsync: async <T>(key: string): Promise<T | null> => {
    return getCacheItemAsync<T>(key)
  },

  removeCacheItemAsync: async (key: string): Promise<void> => {
    await removeCacheItemAsync(key)
  },

  hasCacheItemAsync: async (key: string): Promise<boolean> => {
    return hasCacheItemAsync(key)
  },

  clearCacheAsync: async (): Promise<void> => {
    await clearCacheAsync()
  },

  // ==========================================
  // Async Auth Helpers
  // ==========================================

  saveTokensAsync: async (tokens: AuthTokens): Promise<void> => {
    await saveTokensAsync(tokens)
  },

  getTokensAsync: async (): Promise<AuthTokens | null> => {
    return getTokensAsync()
  },

  clearTokensAsync: async (): Promise<void> => {
    await clearTokensAsync()
  },

  saveUserDataAsync: async (userData: any): Promise<void> => {
    await saveUserDataAsync(userData)
  },

  getUserDataAsync: async <T = any>(): Promise<T | null> => {
    return getUserDataAsync<T>()
  },

  // ==========================================
  // Async Clear All Storage
  // ==========================================

  /**
   * Clear all application storage asynchronously (Capacitor + localStorage)
   */
  clearStorageAsync: async (): Promise<void> => {
    await clearStorage()
    sessionStorage.clear()
    console.log('✓ All storage cleared (async)')
  },
}
