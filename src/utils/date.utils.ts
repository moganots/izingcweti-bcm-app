// src/utils/date.utils.ts

import {
  format,
  formatDistanceToNow,
  parseISO,
  isValid,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  isAfter,
  isBefore,
  addDays,
  addMonths,
  startOfDay,
  endOfDay,
} from 'date-fns'

/**
 * Date Utility Functions
 * Comprehensive date formatting and manipulation helpers
 */

/**
 * Format a date for display
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatStr: string = 'MMM DD, YYYY'
): string {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return ''
    return format(dateObj, formatStr)
  } catch {
    return ''
  }
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, 'MMM DD, YYYY HH:mm')
}

/**
 * Format time only
 */
export function formatTime(date: string | Date | null | undefined): string {
  return formatDate(date, 'HH:mm')
}

/**
 * Format date as ISO string
 */
export function formatISO(date: string | Date | null | undefined): string {
  if (!date) return ''
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? dateObj.toISOString() : ''
  } catch {
    return ''
  }
}

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatTimeAgo(date: string | Date | null | undefined): string {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return ''
    return formatDistanceToNow(dateObj, { addSuffix: true })
  } catch {
    return ''
  }
}

/**
 * Get friendly relative time with more detail
 */
export function formatTimeAgoDetailed(date: string | Date | null | undefined): string {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return ''

    const now = new Date()
    const minutes = differenceInMinutes(now, dateObj)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`

    const hours = differenceInHours(now, dateObj)
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`

    const days = differenceInDays(now, dateObj)
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) !== 1 ? 's' : ''} ago`
    if (days < 365)
      return `${Math.floor(days / 30)} month${Math.floor(days / 30) !== 1 ? 's' : ''} ago`

    return formatDate(dateObj, 'MMM DD, YYYY')
  } catch {
    return ''
  }
}

/**
 * Check if a date is today
 */
export function isToday(date: string | Date | null | undefined): boolean {
  if (!date) return false
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  } catch {
    return false
  }
}

/**
 * Check if a date is in the past
 */
export function isPast(date: string | Date | null | undefined): boolean {
  if (!date) return false
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isBefore(dateObj, new Date())
  } catch {
    return false
  }
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: string | Date | null | undefined): boolean {
  if (!date) return false
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isAfter(dateObj, new Date())
  } catch {
    return false
  }
}

/**
 * Check if a date is overdue
 */
export function isOverdue(date: string | Date | null | undefined): boolean {
  if (!date) return false
  return isPast(date)
}

/**
 * Get days until a date
 */
export function daysUntil(date: string | Date | null | undefined): number {
  if (!date) return 0
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return differenceInDays(dateObj, new Date())
  } catch {
    return 0
  }
}

/**
 * Get days between two dates
 */
export function daysBetween(start: string | Date, end: string | Date): number {
  try {
    const startObj = typeof start === 'string' ? parseISO(start) : start
    const endObj = typeof end === 'string' ? parseISO(end) : end
    return differenceInDays(endObj, startObj)
  } catch {
    return 0
  }
}

/**
 * Get duration between two dates in human readable format
 */
export function getDuration(start: string | Date, end?: string | Date): string {
  try {
    const startObj = typeof start === 'string' ? parseISO(start) : start
    const endObj = end ? (typeof end === 'string' ? parseISO(end) : end) : new Date()

    const hours = differenceInHours(endObj, startObj)
    const minutes = differenceInMinutes(endObj, startObj) % 60

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    }

    return `${hours}h ${minutes}m`
  } catch {
    return ''
  }
}

/**
 * Get the start of today
 */
export function today(): Date {
  return startOfDay(new Date())
}

/**
 * Get the end of today
 */
export function endOfToday(): Date {
  return endOfDay(new Date())
}

/**
 * Add days to a date
 */
export function addDaysToDate(date: string | Date, days: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return addDays(dateObj, days)
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatForInput(date: string | Date | null | undefined): string {
  return formatDate(date, 'yyyy-MM-dd')
}

/**
 * Get current timestamp ISO string
 */
export function now(): string {
  return new Date().toISOString()
}

/**
 * Check if date is within range
 */
export function isWithinRange(
  date: string | Date,
  start: string | Date,
  end: string | Date
): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const startObj = typeof start === 'string' ? parseISO(start) : start
    const endObj = typeof end === 'string' ? parseISO(end) : end
    return isAfter(dateObj, startObj) && isBefore(dateObj, endObj)
  } catch {
    return false
  }
}

/**
 * Group dates by period
 */
export function groupByPeriod(
  dates: string[],
  period: 'day' | 'week' | 'month'
): Record<string, number> {
  const grouped: Record<string, number> = {}

  dates.forEach((date) => {
    const dateObj = parseISO(date)
    let key: string

    switch (period) {
      case 'day':
        key = format(dateObj, 'yyyy-MM-dd')
        break
      case 'week':
        key = `Week ${format(dateObj, 'w, yyyy')}`
        break
      case 'month':
        key = format(dateObj, 'MMM yyyy')
        break
    }

    grouped[key] = (grouped[key] || 0) + 1
  })

  return grouped
}

/**
 * Parse date safely
 */
export function parseDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return isValid(dateObj) ? dateObj : null
  } catch {
    return null
  }
}
