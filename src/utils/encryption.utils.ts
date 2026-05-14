// src/utils/encryption.utils.ts

import CryptoJS from 'crypto-js'

/**
 * Encryption Utility Functions
 * Provides client-side encryption/decryption for sensitive data
 */

// Default encryption key (should be overridden in production)
const DEFAULT_KEY = 'bcm-mobile-encryption-key-2025'

/**
 * Get encryption key from environment or use default
 */
function getEncryptionKey(): string {
  return import.meta.env.VITE_ENCRYPTION_KEY || DEFAULT_KEY
}

/**
 * Encrypt data
 */
export function encrypt(data: string, customKey?: string): string {
  try {
    const key = customKey || getEncryptionKey()
    return CryptoJS.AES.encrypt(data, key).toString()
  } catch (error) {
    console.error('Encryption failed:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt data
 */
export function decrypt(encryptedData: string, customKey?: string): string {
  try {
    const key = customKey || getEncryptionKey()
    const bytes = CryptoJS.AES.decrypt(encryptedData, key)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Encrypt an object
 */
export function encryptObject(obj: Record<string, any>, customKey?: string): string {
  try {
    const jsonString = JSON.stringify(obj)
    return encrypt(jsonString, customKey)
  } catch (error) {
    console.error('Object encryption failed:', error)
    throw new Error('Failed to encrypt object')
  }
}

/**
 * Decrypt to an object
 */
export function decryptObject<T = Record<string, any>>(
  encryptedData: string,
  customKey?: string
): T {
  try {
    const jsonString = decrypt(encryptedData, customKey)
    return JSON.parse(jsonString) as T
  } catch (error) {
    console.error('Object decryption failed:', error)
    throw new Error('Failed to decrypt object')
  }
}

/**
 * Generate a SHA-256 hash
 */
export function sha256(data: string): string {
  return CryptoJS.SHA256(data).toString()
}

/**
 * Generate a SHA-512 hash
 */
export function sha512(data: string): string {
  return CryptoJS.SHA512(data).toString()
}

/**
 * Generate an MD5 hash (for non-security purposes like checksums)
 */
export function md5(data: string): string {
  return CryptoJS.MD5(data).toString()
}

/**
 * Generate a random token
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const randomValues = new Uint8Array(length)

  // Check if crypto.getRandomValues is available
  if (!crypto || !crypto.getRandomValues) {
    // Fallback to a less secure but deterministic method for environments without crypto
    // Note: This is not cryptographically secure and should only be used as a fallback
    for (let i = 0; i < length; i++) {
      const randomValue = Math.floor(Math.random() * 256)
      result += chars.charAt(randomValue % chars.length)
    }
    return result
  }

  crypto.getRandomValues(randomValues)

  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length)
  }

  return result
}

/**
 * Generate a random numeric code
 */
export function generateCode(length: number = 6): string {
  const digits = '0123456789'
  let result = ''
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)

  for (let i = 0; i < length; i++) {
    result += digits.charAt(randomValues?.[i] % 10)
  }

  return result
}

/**
 * Hash a password (client-side)
 */
export function hashPassword(password: string): string {
  const salt = generateToken(16)
  const hash = sha256(password + salt)
  return `${salt}:${hash}`
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':')
  const computedHash = sha256(password + salt)
  return computedHash === hash
}

/**
 * Encode to Base64
 */
export function encodeBase64(data: string): string {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data))
}

/**
 * Decode from Base64
 */
export function decodeBase64(encoded: string): string {
  return CryptoJS.enc.Base64.parse(encoded).toString(CryptoJS.enc.Utf8)
}

/**
 * Create a checksum for data integrity verification
 */
export function createChecksum(data: string): string {
  return sha256(data).substring(0, 16)
}

/**
 * Verify data integrity using checksum
 */
export function verifyChecksum(data: string, checksum: string): boolean {
  return createChecksum(data) === checksum
}
