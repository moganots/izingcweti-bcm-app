// src/utils/formatters.ts

/**
 * Data Formatting Utilities
 * Provides consistent formatting across the application
 */

// ============================================
// Number Formatters
// ============================================

/**
 * Format currency value
 */
export function formatCurrency(
  value: number | null | undefined,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  if (value === null || value === undefined) return 'N/A'

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `$${value.toFixed(2)}`
  }
}

/**
 * Format number with commas
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A'

  try {
    return new Intl.NumberFormat('en-US').format(value)
  } catch {
    return value.toString()
  }
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return 'N/A'
  return `${value.toFixed(decimals)}%`
}

/**
 * Format decimal to fixed precision
 */
export function formatDecimal(value: number | null | undefined, precision: number = 2): string {
  if (value === null || value === undefined) return 'N/A'
  return value.toFixed(precision)
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || bytes === 0) return '0 B'

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  if (i === 0) return `${bytes} ${sizes[i]}`
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`

  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

// ============================================
// String Formatters
// ============================================

/**
 * Truncate text to specified length
 */
export function truncateText(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Convert enum/snake_case to Title Case
 */
export function toTitleCase(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Convert string to camelCase
 */
export function toCamelCase(text: string): string {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
      index === 0 ? letter.toLowerCase() : letter.toUpperCase()
    )
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
}

/**
 * Slugify text for URLs
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Mask sensitive data (e.g., email, phone)
 */
export function maskText(text: string, visibleChars: number = 4): string {
  if (!text || text.length <= visibleChars) return text
  const masked = '*'.repeat(text.length - visibleChars)
  return masked + text.slice(-visibleChars)
}

/**
 * Mask email address
 */
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@')
  if (!domain) return email
  const maskedUsername = username?.charAt(0) + '***' + username?.charAt(username?.length - 1)
  return `${maskedUsername}@${domain}`
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  if (cleaned.length === 11) {
    return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  return phone
}

// ============================================
// Status & Severity Formatters
// ============================================

/**
 * Get color for severity level
 */
export function getSeverityColor(severity: string | null | undefined): string {
  if (!severity) return 'grey'

  const colors: Record<string, string> = {
    Critical: 'red',
    High: 'orange',
    Medium: 'yellow',
    Low: 'green',
    Informational: 'blue',
    Insignificant: 'grey',
  }

  return colors[severity] || 'grey'
}

/**
 * Get color for risk score
 */
export function getRiskScoreColor(score: number): string {
  if (score >= 8.5) return 'red'
  if (score >= 7) return 'orange'
  if (score >= 5) return 'yellow'
  if (score >= 3) return 'light-green'
  return 'green'
}

/**
 * Get color for BCP status
 */
export function getStatusColor(status: string | null | undefined): string {
  if (!status) return 'grey'

  const colors: Record<string, string> = {
    Draft: 'grey',
    Approved: 'blue',
    Active: 'green',
    Archived: 'orange',
    DRAFT: 'grey',
    APPROVED: 'green',
    PUBLISHED: 'green',
    UNDER_REVIEW: 'blue',
    REJECTED: 'red',
    EXPIRED: 'brown',
    UNREAD: 'primary',
    READ: 'grey',
  }

  return colors[status] || 'grey'
}

/**
 * Get icon for document type
 */
export function getDocumentIcon(docType: string): string {
  const icons: Record<string, string> = {
    BCM_POLICY: 'policy',
    RISK_ASSESSMENT: 'warning',
    BIA_REPORT: 'assessment',
    BCP_DOCUMENT: 'description',
    RECOVERY_STRATEGY: 'restore',
    TEST_RESULTS: 'playlist_add_check',
    INCIDENT_REPORT: 'report',
    COMPLIANCE_EVIDENCE: 'verified',
    TRAINING_MATERIAL: 'school',
    AUDIT_REPORT: 'search',
    EXERCISE_REPORT: 'fitness_center',
    MEETING_MINUTES: 'group',
  }

  return icons[docType] || 'description'
}

/**
 * Format JSON for display
 */
export function formatJSON(obj: any, indent: number = 2): string {
  try {
    return JSON.stringify(obj, null, indent)
  } catch {
    return String(obj)
  }
}

/**
 * Parse JSON safely
 */
export function parseJSON(str: string, fallback: any = null): any {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}
