// src/utils/storage.utils.ts

import { Preferences } from '@capacitor/preferences'
import { STORAGE_KEYS } from './constants'

/**
 * Auth token interface
 */
interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in?: number
  token_type?: string
}

// ============================================
// Capacitor Preferences Storage (Async)
// ============================================

/**
 * Set a value in storage (async)
 */
export async function setStorageItem(key: string, value: string): Promise<void> {
  try {
    await Preferences.set({ key, value })
  } catch (error) {
    console.warn('Capacitor storage failed, falling back to localStorage:', error)
    localStorage.setItem(key, value)
  }
}

/**
 * Get a value from storage (async)
 */
export async function getStorageItem(key: string): Promise<string | null> {
  try {
    const { value } = await Preferences.get({ key })
    return value || null
  } catch (error) {
    console.warn('Capacitor storage failed, falling back to localStorage:', error)
    return localStorage.getItem(key)
  }
}

/**
 * Remove a value from storage (async)
 */
export async function removeStorageItem(key: string): Promise<void> {
  try {
    await Preferences.remove({ key })
  } catch (error) {
    console.warn('Capacitor storage failed, falling back to localStorage:', error)
    localStorage.removeItem(key)
  }
}

/**
 * Clear all storage (async)
 */
export async function clearStorage(): Promise<void> {
  try {
    await Preferences.clear()
  } catch (error) {
    console.warn('Capacitor storage failed, falling back to localStorage:', error)
    localStorage.clear()
  }
}

/**
 * Get all storage keys (async)
 */
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

/**
 * Set a JSON object in storage (async)
 */
export async function setJSONItem(key: string, value: any): Promise<void> {
  try {
    const jsonString = JSON.stringify(value)
    await setStorageItem(key, jsonString)
  } catch (error) {
    console.error('Failed to store JSON:', error)
  }
}

/**
 * Get a JSON object from storage (async)
 */
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

/**
 * Save authentication tokens (async)
 */
export async function saveTokensAsync(tokens: AuthTokens): Promise<void> {
  await setJSONItem(STORAGE_KEYS.AUTH_TOKEN, tokens)
}

/**
 * Get authentication tokens (async)
 */
export async function getTokensAsync(): Promise<AuthTokens | null> {
  return getJSONItem<AuthTokens>(STORAGE_KEYS.AUTH_TOKEN)
}

/**
 * Clear authentication tokens (async)
 */
export async function clearTokensAsync(): Promise<void> {
  await removeStorageItem(STORAGE_KEYS.AUTH_TOKEN)
  await removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN)
  await removeStorageItem(STORAGE_KEYS.USER_DATA)
}

/**
 * Save user data (async)
 */
export async function saveUserDataAsync(userData: any): Promise<void> {
  await setJSONItem(STORAGE_KEYS.USER_DATA, userData)
}

/**
 * Get user data (async)
 */
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
// Cache Helpers (Async)
// ============================================

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

export async function setCacheItem<T>(
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

export async function getCacheItem<T>(key: string): Promise<T | null> {
  const item = await getJSONItem<CacheItem<T>>(`cache_${key}`)
  if (!item) return null

  const isExpired = Date.now() - item.timestamp > item.ttl
  if (isExpired) {
    await removeStorageItem(`cache_${key}`)
    return null
  }
  return item.data
}

export async function clearCache(): Promise<void> {
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
  // Use for non-critical operations or when async is not needed
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
  // Asynchronous Capacitor Preferences methods
  // Use for critical data that needs reliable persistence
  // ==========================================

  /** Save auth tokens asynchronously (Capacitor with localStorage fallback) */
  saveTokensAsync: async (tokens: AuthTokens): Promise<void> => {
    await saveTokensAsync(tokens)
  },

  /** Get auth tokens asynchronously (Capacitor with localStorage fallback) */
  getTokensAsync: async (): Promise<AuthTokens | null> => {
    return getTokensAsync()
  },

  /** Clear auth tokens asynchronously (Capacitor with localStorage fallback) */
  clearTokensAsync: async (): Promise<void> => {
    await clearTokensAsync()
  },

  /** Save user data asynchronously (Capacitor with localStorage fallback) */
  saveUserDataAsync: async (userData: any): Promise<void> => {
    await saveUserDataAsync(userData)
  },

  /** Get user data asynchronously (Capacitor with localStorage fallback) */
  getUserDataAsync: async <T = any>(): Promise<T | null> => {
    return getUserDataAsync<T>()
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
}
