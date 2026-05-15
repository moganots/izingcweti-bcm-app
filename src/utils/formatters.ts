// src/utils/formatters.ts

import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

/**
 * Data Formatting Utilities
 * Provides consistent formatting across the application
 */

// ============================================
// Number Formatters
// ============================================

/**
 * Format currency value
 * @param value - Number to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | null | undefined,
  currency: string = 'USD',
  locale: string = 'en-US',
): string {
  if (value === null || value === undefined) return 'N/A';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

/**
 * Format number with thousands separators
 * @param value - Number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';

  try {
    return new Intl.NumberFormat('en-US').format(value);
  } catch {
    return value.toString();
  }
}

/**
 * Format percentage value
 * @param value - Number to format as percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format decimal to fixed precision
 * @param value - Number to format
 * @param precision - Number of decimal places (default: 2)
 * @returns Formatted decimal string
 */
export function formatDecimal(value: number | null | undefined, precision: number = 2): string {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(precision);
}

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Human-readable file size string
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || bytes === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Format duration in milliseconds to human-readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;

  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Format duration in hours for incident resolution time
 * @param hours - Duration in hours
 * @returns Formatted duration string
 */
export function formatResolutionTime(hours: number | null | undefined): string {
  if (hours === null || hours === undefined) return 'N/A';
  if (hours < 1) return `${Math.round(hours * 60)} minutes`;
  if (hours < 24) return `${hours.toFixed(1)} hours`;
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  return `${days}d ${remainingHours}h`;
}

// ============================================
// String Formatters
// ============================================

/**
 * Truncate text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation (default: 50)
 * @returns Truncated text string
 */
export function truncateText(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Capitalize first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text string
 */
export function capitalizeWords(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Convert underscore or camelCase to Title Case
 * @param text - Text to convert
 * @returns Title Case text string
 */
export function toTitleCase(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Convert string to camelCase
 * @param text - Text to convert
 * @returns camelCase text string
 */
export function toCamelCase(text: string): string {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
      index === 0 ? letter.toLowerCase() : letter.toUpperCase(),
    )
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Convert text to URL-friendly slug
 * @param text - Text to slugify
 * @returns Slugified text string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Mask sensitive data showing only last N characters
 * @param text - Text to mask
 * @param visibleChars - Number of characters to show at the end (default: 4)
 * @returns Masked text string
 */
export function maskText(text: string, visibleChars: number = 4): string {
  if (!text || text.length <= visibleChars) return text;
  const masked = '*'.repeat(text.length - visibleChars);
  return masked + text.slice(-visibleChars);
}

/**
 * Mask email address for privacy
 * @param email - Email address to mask
 * @returns Masked email string
 */
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (!domain) return email;
  const maskedUsername =
    username!?.charAt(0) + '***' + username!?.charAt(username!?.length - 1);
  return `${maskedUsername}@${domain}`;
}

/**
 * Format phone number to standard display format
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11) {
    return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

/**
 * Extract initials from a name or email address
 * 
 * Examples:
 * - "John Doe" → "JD"
 * - "john.doe@example.com" → "JD"
 * - "John" → "JO"
 * - "john_doe" → "JD"
 * - null/undefined → "?"
 * 
 * @param text - Name, email, or any string to extract initials from
 * @returns 1-2 character uppercase initials, or "?" if input is empty
 */
export function getInitials(text: string | null | undefined): string {
  // Handle null/undefined/empty
  if (!text || text.trim().length === 0) {
    return '?';
  }

  // If it's an email, extract the local part (before @)
  let name = text!?.trim() || '';
  if (text?.includes('@')) {
    name = text.split('@')[0]!?.trim() || '';
  }

  // Replace common separators with spaces
  name = name.replace(/[._\-+]/g, ' ');

  // Split into parts
  const parts = name.trim().split(/\s+/).filter(Boolean);

  // If we have at least two parts, use first and last
  if (parts.length >= 2) {
    const firstInitial = parts[0]!?.charAt(0);
    const lastInitial = parts[parts.length - 1]!?.charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }

  // Single part - use first two characters (or just first if single character)
  const singlePart = parts[0];
  if (singlePart!?.length >= 2) {
    return singlePart!?.substring(0, 2).toUpperCase();
  }

  return singlePart!?.charAt(0).toUpperCase();
}

// ============================================
// Status & Severity Color Formatters
// ============================================

/**
 * Get color for incident severity level
 * @param severity - Severity string
 * @returns CSS color name
 */
export function getSeverityColor(severity: string | null | undefined): string {
  if (!severity) return 'grey';

  const colors: Record<string, string> = {
    Critical: 'red',
    High: 'orange',
    Medium: 'yellow',
    Low: 'green',
    Informational: 'blue',
    Insignificant: 'grey',
  };

  return colors[severity] || 'grey';
}

/**
 * Get color for risk score
 * @param score - Risk score number
 * @returns CSS color name
 */
export function getRiskScoreColor(score: number): string {
  if (score >= 8.5) return 'red';
  if (score >= 7) return 'orange';
  if (score >= 5) return 'yellow';
  if (score >= 3) return 'light-green';
  return 'green';
}

/**
 * Get color for BCP/Workflow/Document status
 * @param status - Status string
 * @returns CSS color name
 */
export function getStatusColor(status: string | null | undefined): string {
  if (!status) return 'grey';

  const colors: Record<string, string> = {
    // BCP Statuses
    Draft: 'grey',
    Approved: 'blue',
    Active: 'green',
    Archived: 'orange',
    // Document Statuses
    DRAFT: 'grey',
    APPROVED: 'green',
    PUBLISHED: 'green',
    UNDER_REVIEW: 'blue',
    REJECTED: 'red',
    EXPIRED: 'brown',
    // Notification Statuses
    UNREAD: 'primary',
    READ: 'grey',
    // Workflow States
    Submitted: 'blue',
    InReview: 'orange',
    Completed: 'green',
    Rejected: 'red',
    Cancelled: 'grey',
    Escalated: 'deep-orange',
  };

  return colors[status] || 'grey';
}

/**
 * Get icon for document type
 * @param docType - Document type string
 * @returns Material icon name
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
  };

  return icons[docType] || 'description';
}

/**
 * Get color for document type
 * @param docType - Document type string
 * @returns CSS color name
 */
export function getDocumentColor(docType: string): string {
  const colors: Record<string, string> = {
    BCM_POLICY: 'red',
    RISK_ASSESSMENT: 'orange',
    BIA_REPORT: 'blue',
    BCP_DOCUMENT: 'green',
    RECOVERY_STRATEGY: 'purple',
    TEST_RESULTS: 'teal',
    INCIDENT_REPORT: 'deep-orange',
    COMPLIANCE_EVIDENCE: 'indigo',
    TRAINING_MATERIAL: 'cyan',
    AUDIT_REPORT: 'brown',
  };

  return colors[docType] || 'grey';
}

// ============================================
// JSON Formatters
// ============================================

/**
 * Format JSON for display with indentation
 * @param obj - Object to format
 * @param indent - Indentation spaces (default: 2)
 * @returns Formatted JSON string
 */
export function formatJSON(obj: any, indent: number = 2): string {
  try {
    return JSON.stringify(obj, null, indent);
  } catch {
    return String(obj);
  }
}

/**
 * Parse JSON safely with fallback
 * @param str - JSON string to parse
 * @param fallback - Fallback value if parsing fails (default: null)
 * @returns Parsed object or fallback
 */
export function parseJSON<T = any>(str: string, fallback: T | null = null): T | null {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

// ============================================
// Export all formatters as a namespace
// ============================================

export const Formatters = {
  // Number
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDecimal,
  formatFileSize,
  formatDuration,
  formatResolutionTime,
  // String
  truncateText,
  capitalizeWords,
  toTitleCase,
  toCamelCase,
  slugify,
  maskText,
  maskEmail,
  formatPhone,
  getInitials,
  // Status/Color
  getSeverityColor,
  getRiskScoreColor,
  getStatusColor,
  getDocumentIcon,
  getDocumentColor,
  // JSON
  formatJSON,
  parseJSON,
};