/**
 * Application Constants
 * Centralized constants for the BCM Mobile application
 */

// ============================================
// API Endpoints
// ============================================
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    CHANGE_PASSWORD: '/auth/change-password',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
    ACTIVATE: (id: string) => `/users/${id}/activate`,
    CHANGE_PASSWORD: (id: string) => `/users/${id}/change-password`,
  },

  // Organisations
  ORGANISATIONS: {
    BASE: '/organisations',
    BY_ID: (id: string) => `/organisations/${id}`,
    BY_INDUSTRY: (type: string) => `/organisations/industry/${type}`,
  },

  // Business Units
  BUSINESS_UNITS: {
    BASE: '/business-units',
    BY_ID: (id: string) => `/business-units/${id}`,
    BY_ORGANISATION: (orgId: string) => `/business-units/organisation/${orgId}`,
  },

  // Departments
  DEPARTMENTS: {
    BASE: '/departments',
    BY_ID: (id: string) => `/departments/${id}`,
    BY_BUSINESS_UNIT: (buId: string) => `/departments/business-unit/${buId}`,
  },

  // Critical Functions
  CRITICAL_FUNCTIONS: {
    BASE: '/critical-functions',
    BY_ID: (id: string) => `/critical-functions/${id}`,
    BY_DEPARTMENT: (deptId: string) => `/critical-functions/department/${deptId}`,
  },

  // BIA
  BIA: {
    BASE: '/business-impact-assessments',
    BY_ID: (id: string) => `/business-impact-assessments/${id}`,
    BY_FUNCTION: (funcId: string) => `/business-impact-assessments/function/${funcId}`,
    STATS: '/business-impact-assessments/stats',
  },

  // BCP
  BCP: {
    BASE: '/business-continuity-plans',
    BY_ID: (id: string) => `/business-continuity-plans/${id}`,
    BY_FUNCTION: (funcId: string) => `/business-continuity-plans/function/${funcId}`,
    ACTIVE: '/business-continuity-plans/active',
    APPROVE: (id: string) => `/business-continuity-plans/${id}/approve`,
    ARCHIVE: (id: string) => `/business-continuity-plans/${id}/archive`,
  },

  // Recovery Strategies
  RECOVERY_STRATEGIES: {
    BASE: '/recovery-strategies',
    BY_ID: (id: string) => `/recovery-strategies/${id}`,
    BY_BCP: (bcpId: string) => `/recovery-strategies/bcp/${bcpId}`,
  },

  // Exercise Tests
  EXERCISE_TESTS: {
    BASE: '/exercise-tests',
    BY_ID: (id: string) => `/exercise-tests/${id}`,
    BY_BCP: (bcpId: string) => `/exercise-tests/bcp/${bcpId}`,
    UPCOMING: '/exercise-tests/upcoming',
    OVERDUE: '/exercise-tests/overdue',
    COMPLETED: '/exercise-tests/completed',
    RECORD_RESULT: (id: string) => `/exercise-tests/${id}/record-result`,
  },

  // Risks
  RISKS: {
    BASE: '/risks',
    BY_ID: (id: string) => `/risks/${id}`,
    HIGH: '/risks/high',
    CRITICAL: '/risks/critical',
    BY_CATEGORY: (cat: string) => `/risks/category/${cat}`,
    REASSESS: (id: string) => `/risks/${id}/reassess`,
    ADD_CONTROLS: (id: string) => `/risks/${id}/add-controls`,
    REMOVE_CONTROL: (id: string, controlId: string) => `/risks/${id}/remove-control/${controlId}`,
  },

  // Incidents
  INCIDENTS: {
    BASE: '/incidents',
    BY_ID: (id: string) => `/incidents/${id}`,
    ACTIVE: '/incidents/active',
    CRITICAL: '/incidents/critical',
    CLOSE: (id: string) => `/incidents/${id}/close`,
    REOPEN: (id: string) => `/incidents/${id}/reopen`,
    ESCALATE: (id: string) => `/incidents/${id}/escalate`,
  },

  // Compliance
  COMPLIANCE: {
    BASE: '/compliance-records',
    BY_ID: (id: string) => `/compliance-records/${id}`,
    OVERDUE: '/compliance-records/overdue',
    UPCOMING: '/compliance-records/upcoming',
    BY_STANDARD: (std: string) => `/compliance-records/standard/${std}`,
  },

  // Workflows
  WORKFLOWS: {
    BASE: '/workflows',
    BY_ID: (id: string) => `/workflows/${id}`,
    PENDING_APPROVALS: '/workflows/pending-approvals',
    SUBMIT: (id: string) => `/workflows/${id}/submit`,
    APPROVE: (id: string) => `/workflows/${id}/approve`,
    REJECT: (id: string) => `/workflows/${id}/reject`,
    ESCALATE: (id: string) => `/workflows/${id}/escalate`,
    REASSIGN: (id: string) => `/workflows/${id}/reassign`,
    ADD_COMMENT: (id: string) => `/workflows/${id}/comment`,
  },

  // Documents
  DOCUMENTS: {
    BASE: '/documents',
    BY_ID: (id: string) => `/documents/${id}`,
    UPLOAD: '/documents/upload',
    DOWNLOAD: (id: string) => `/documents/${id}/download`,
    APPROVE: (id: string) => `/documents/${id}/approve`,
    REJECT: (id: string) => `/documents/${id}/reject`,
    SEARCH: '/documents/search',
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    MY: '/notifications/me',
    UNREAD: '/notifications/unread',
    COUNTS: '/notifications/counts',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    ARCHIVE: (id: string) => `/notifications/${id}/archive`,
    PREFERENCES: '/notifications/preferences',
  },

  // Audit
  AUDIT: {
    BASE: '/audit',
    STATS: '/audit/stats',
    ENTITY_HISTORY: (type: string, id: string) => `/audit/entity/${type}/${id}`,
    EXPORT: '/audit/export',
  },

  // Sync
  SYNC: {
    PENDING_CHANGES: '/pending-changes',
    CONFLICTS: '/sync-conflicts',
    UNRESOLVED: '/sync-conflicts/unresolved',
    METADATA: '/sync-metadata',
    LAST_TOKEN: '/sync-metadata/last-sync-token',
  },

  // Rules
  RULES: {
    BASE: '/rules',
    BY_ID: (id: string) => `/rules/${id}`,
    ACTIVE: '/rules/active',
    TEST: '/rules/test',
    EXECUTE: (id: string) => `/rules/${id}/execute`,
  },

  // Dashboard
  DASHBOARD: {
    KPIS: '/dashboard/kpis',
    RECENT_INCIDENTS: '/dashboard/recent-incidents',
    UPCOMING_TESTS: '/dashboard/upcoming-tests',
    PENDING_WORKFLOWS: '/dashboard/pending-workflows',
    COMPLIANCE_OVERVIEW: '/dashboard/compliance-overview',
    RISK_TRENDS: '/dashboard/risk-trends',
    MATURITY_PROGRESS: '/dashboard/maturity-progress',
    INCIDENT_TRENDS: '/dashboard/incident-trends',
  },

  // Cache
  CACHE: {
    STATS: '/cache/stats',
    CLEAN_EXPIRED: '/cache/clean-expired',
    BY_KEY: (key: string) => `/cache/${key}`,
  },
} as const

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
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
  ISO_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  TIME: 'HH:mm',
  TIME_WITH_SECONDS: 'HH:mm:ss',
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD MMMM YYYY',
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
