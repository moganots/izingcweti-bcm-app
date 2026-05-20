/**
 * Safely converts any value to a number
 */
export function toNumber(value: unknown, defaultValue: number = 0): number {
  if (value === null || value === undefined) return defaultValue

  // Handle boolean values
  if (typeof value === 'boolean') return value ? 1 : 0

  // Handle string values
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return defaultValue

    const parsed = parseFloat(trimmed)
    return isNaN(parsed) ? defaultValue : parsed
  }

  // Handle numbers
  if (typeof value === 'number') {
    return isNaN(value) ? defaultValue : value
  }

  // Handle objects (try to convert)
  try {
    const num = Number(value)
    return isNaN(num) ? defaultValue : num
  } catch {
    return defaultValue
  }
}

/**
 * Rounds a number to specified decimal places
 */
export function round(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals)
  return Math.round(value * multiplier) / multiplier
}

/**
 * Formats a number with thousand separators
 */
export function formatNumber(value: number, decimals: number = 2): string {
  const rounded = round(value, decimals)
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

/**
 * Clamps a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Checks if a value is a valid number
 */
export function isValidNumber(value: unknown): boolean {
  if (value === null || value === undefined) return false
  const num = Number(value)
  return !isNaN(num) && isFinite(num)
}

/**
 * Gets percentage value (clamped between 0 and 100)
 */
export function getValidPercentage(value: unknown, defaultValue: number = 0): number {
  const num = toNumber(value, defaultValue)
  return clamp(round(num, 1), 0, 100)
}

/**
 * Formats currency with proper rounding
 */
export function formatCurrencyValue(value: unknown, currency: string = 'ZAR'): string {
  const num = toNumber(value, 0)
  const rounded = round(num, 2)

  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rounded)
}

// Usage example in your component with the utility functions:
/*
import { toNumber, round, getValidPercentage, formatCurrencyValue } from '../../utils/numberUtils'

// Then in your component:
const estimatedCost = formatCurrencyValue(props.strategy.estimated_recovery_cost)
const successRate = getValidPercentage(props.strategy.test_success_rate, 0)
const roundedRate = round(successRate, 0)
*/
