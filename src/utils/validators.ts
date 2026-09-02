/**
 * Validation Utility Functions
 * Reusable validation rules for forms and data validation
 */

// ============================================
// String Validators
// ============================================

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * Requires: 8+ chars, uppercase, lowercase, number, special char
 */
export function isStrongPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain an uppercase letter' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain a lowercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain a number' }
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: 'Password must contain a special character' }
  }
  return { valid: true }
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]{7,15}$/
  return phoneRegex.test(phone)
}

/**
 * Validate URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate UUID v4
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Check if string is empty or whitespace only
 */
export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0
}

/**
 * Validate string length
 */
export function isValidLength(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max
}

/**
 * Validate against regex pattern
 */
export function matchesPattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value)
}

// ============================================
// Number Validators
// ============================================

/**
 * Check if value is a valid number
 */
export function isValidNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

/**
 * Check if number is in range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Check if value is a positive number
 */
export function isPositive(value: number): boolean {
  return value > 0
}

/**
 * Check if value is a non-negative number
 */
export function isNonNegative(value: number): boolean {
  return value >= 0
}

/**
 * Check if value is an integer
 */
export function isInteger(value: number): boolean {
  return Number.isInteger(value)
}

// ============================================
// Date Validators
// ============================================

/**
 * Check if date is valid
 */
export function isValidDate(date: any): boolean {
  if (!date) return false
  const d = new Date(date)
  return d instanceof Date && !isNaN(d.getTime())
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: string | Date): boolean {
  return new Date(date) > new Date()
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: string | Date): boolean {
  return new Date(date) < new Date()
}

// ============================================
// Object & Array Validators
// ============================================

/**
 * Check if value is an object
 */
export function isObject(value: any): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Check if array is not empty
 */
export function isNonEmptyArray(value: any): boolean {
  return Array.isArray(value) && value.length > 0
}

/**
 * Check if object has required keys
 */
export function hasRequiredKeys(obj: Record<string, any>, keys: string[]): boolean {
  return keys.every((key) => obj[key] !== undefined && obj[key] !== null)
}

// ============================================
// BCM-Specific Validators
// ============================================

/**
 * Validate risk likelihood (0-1)
 */
export function isValidLikelihood(value: number): boolean {
  return isInRange(value, 0, 1)
}

/**
 * Validate risk score
 */
export function isValidRiskScore(value: number): boolean {
  return isNonNegative(value)
}

/**
 * Validate residual vs inherent risk
 */
export function isResidualValid(inherentScore: number, residualScore: number): boolean {
  return residualScore <= inherentScore
}

/**
 * Validate recovery time format (e.g., "4 hours", "2 days")
 */
export function isValidRecoveryTime(value: string): boolean {
  const pattern = /^\d+\s+(minutes?|hours?|days?|weeks?)$/i
  return pattern.test(value)
}

/**
 * Validate percentage (0-100)
 */
export function isValidPercentage(value: number): boolean {
  return isInRange(value, 0, 100)
}

// ============================================
// Form Rule Generators for Quasar/VeeValidate
// ============================================

/**
 * Generate email validation rule
 */
export function emailRule(val: string): string | boolean {
  if (isEmpty(val)) return 'Email is required'
  if (!isValidEmail(val)) return 'Please enter a valid email address'
  return true
}

/**
 * Generate required field rule
 */
export function requiredRule(val: any, fieldName: string = 'This field'): string | boolean {
  if (val === null || val === undefined || (typeof val === 'string' && isEmpty(val))) {
    return `${fieldName} is required`
  }
  if (Array.isArray(val) && val.length === 0) {
    return `${fieldName} is required`
  }
  return true
}

/**
 * Generate password validation rule
 */
export function passwordRule(val: string): string | boolean {
  if (isEmpty(val)) return 'Password is required'
  const result = isStrongPassword(val)
  if (!result.valid) return result.message || 'Invalid password'
  return true
}

/**
 * Generate confirm password rule
 */
export function confirmPasswordRule(targetPassword: string): (val: string) => string | boolean {
  return (val: string) => {
    if (isEmpty(val)) return 'Please confirm your password'
    if (val !== targetPassword) return 'Passwords do not match'
    return true
  }
}

/**
 * Generate min length rule
 */
export function minLengthRule(
  min: number,
  fieldName: string = 'This field'
): (val: string) => string | boolean {
  return (val: string) => {
    if (val && val.length < min) return `${fieldName} must be at least ${min} characters`
    return true
  }
}

/**
 * Generate max length rule
 */
export function maxLengthRule(
  max: number,
  fieldName: string = 'This field'
): (val: string) => string | boolean {
  return (val: string) => {
    if (val && val.length > max) return `${fieldName} must be at most ${max} characters`
    return true
  }
}

/**
 * Generate UUID validation rule
 */
export function uuidRule(val: string, fieldName: string = 'ID'): string | boolean {
  if (isEmpty(val)) return `${fieldName} is required`
  if (!isValidUUID(val)) return `${fieldName} must be a valid UUID`
  return true
}

/**
 * Generate number range rule
 */
export function numberRangeRule(
  min: number,
  max: number,
  fieldName: string = 'Value'
): (val: number) => string | boolean {
  return (val: number) => {
    if (val === null || val === undefined) return `${fieldName} is required`
    if (!isInRange(val, min, max)) return `${fieldName} must be between ${min} and ${max}`
    return true
  }
}
