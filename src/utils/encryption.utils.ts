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

  // Check if crypto.getRandomValues is available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomValues = new Uint8Array(length)
    crypto.getRandomValues(randomValues)
    for (let i = 0; i < length; i++) {
      result += chars.charAt(randomValues[i]! % chars.length)
    }
  } else {
    // Fallback to a less secure but deterministic method for environments without crypto
    // Note: This is not cryptographically secure and should only be used as a fallback
    for (let i = 0; i < length; i++) {
      const randomValue = Math.floor(Math.random() * 256)
      result += chars.charAt(randomValue % chars.length)
    }
  }

  return result
}

/**
 * Generate a random numeric code
 */
export function generateCode(length: number = 6): string {
  const digits = '0123456789'
  let result = ''

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomValues = new Uint8Array(length)
    crypto.getRandomValues(randomValues)
    for (let i = 0; i < length; i++) {
      result += digits.charAt(randomValues[i]! % 10)
    }
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < length; i++) {
      result += digits.charAt(Math.floor(Math.random() * 10))
    }
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

/**
 * Generate a secure random UUID v4
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback UUID v4 generation
  const chars = '0123456789abcdef'
  let result = ''
  const randomValues = new Uint8Array(36)
  
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues)
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < 36; i++) {
      randomValues[i] = Math.floor(Math.random() * 256)
    }
  }

  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      result += '-'
    } else if (i === 14) {
      result += '4' // UUID version 4
    } else if (i === 19) {
      result += chars.charAt((randomValues[i]! & 0x3f) | 0x80) // UUID variant
    } else {
      result += chars.charAt(randomValues[i]! % 16)
    }
  }

  return result
}