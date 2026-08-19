/**
 * Application Constants
 * Centralized constants for the BCM Mobile application
 * Updated to match all backend routes from app.ts and *.routes.ts files
 */

// ============================================
// Pagination
// ============================================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  LIMIT_OPTIONS: [10, 20, 50, 100],
} as const

// ============================================
// File Upload
// ============================================
export const FILE_UPLOAD = {
  MAX_SIZE_BYTES: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/json',
  ],
  ALLOWED_EXTENSIONS: [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.txt',
    '.csv',
    '.zip',
    '.json',
  ],
} as const

// ============================================
// Date & Time Formats
// ============================================
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-DD',
  ISO_WITH_TIME: 'yyyy-MM-DDTHH:mm:ss.SSSZ',
  TIME: 'HH:mm',
  TIME_WITH_SECONDS: 'HH:mm:ss',
  SHORT: 'DD/MM/yyyy',
  LONG: 'DD MMMM yyyy',
  RELATIVE: 'relative',
} as const

// ============================================
// Risk Assessment
// ============================================
export const RISK = {
  LIKELIHOOD_LEVELS: [
    { label: 'Very Low', value: 0.2, color: 'green' },
    { label: 'Low', value: 0.4, color: 'light-green' },
    { label: 'Medium', value: 0.6, color: 'yellow' },
    { label: 'High', value: 0.8, color: 'orange' },
    { label: 'Very High', value: 1.0, color: 'red' },
  ],
  IMPACT_LEVELS: ['Insignificant', 'Low', 'Medium', 'High', 'Critical'],
  SCORE_THRESHOLDS: {
    LOW: 3,
    MEDIUM: 6,
    HIGH: 8,
    CRITICAL: 8.5,
  },
} as const

// ============================================
// BCM Specific
// ============================================
export const BCM = {
  PLAN_STATUSES: ['Draft', 'Approved', 'Active', 'Archived'] as const,
  TEST_TYPES: ['Tabletop', 'Walkthrough', 'Full'] as const,
  STRATEGY_TYPES: ['HotSite', 'ColdSite', 'CloudFailover', 'ManualWorkaround'] as const,
  INCIDENT_SEVERITIES: ['Critical', 'High', 'Medium', 'Low', 'Informational'] as const,
  COMPLIANCE_STANDARDS: ['ISO22301', 'NIST800-34', 'FFIEC', 'COBIT2019'] as const,
} as const

// ============================================
// Storage Keys
// ============================================
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  EXPIRES_IN: 'expires_in',
  USER_DATA: 'user_data',
  SETTINGS: 'settings',
  THEME: 'theme',
  LAST_SYNC: 'last_sync',
  REMEMBERED_EMAIL: 'remembered_email',
  ONBOARDING_COMPLETED: 'bcm_onboarding_completed',
} as const

// ============================================
// Routes
// ============================================
export const ROUTES = {
  LOGIN: '/auth/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
} as const

// ============================================
// Colors
// ============================================
export const COLORS = {
  PRIMARY: '#1a73e8',
  SECONDARY: '#5c6bc0',
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  ERROR: '#f44336',
  INFO: '#2196f3',
  GREY: '#9e9e9e',
} as const

// ============================================
// Animation Durations
// ============================================
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const
