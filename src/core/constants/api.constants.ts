// ============================================
// API Base Configuration
// ============================================

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const API_TIMEOUT = 30000
export const API_RETRY_COUNT = 3
export const API_RETRY_DELAY = 1000

// ============================================
// HTTP Status Codes
// ============================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const

// ============================================
// Error Codes
// ============================================

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SYNC_CONFLICT: 'SYNC_CONFLICT',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  OFFLINE_MODE: 'OFFLINE_MODE',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
} as const

// ============================================
// Storage Keys
// ============================================

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  SETTINGS: 'settings',
  THEME: 'theme',
  LANGUAGE: 'language',
  LAST_SYNC: 'last_sync',
  OFFLINE_QUEUE: 'offline_queue',
  DEVICE_ID: 'device_id',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  PUSH_TOKEN: 'push_token',
} as const

// ============================================
// File Constraints
// ============================================

export const FILE_CONSTRAINTS = {
  MAX_SIZE_MB: 50,
  MAX_SIZE_BYTES: 50 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ],
  ALLOWED_EXTENSIONS: [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.txt', '.csv',
  ],
} as const

// ============================================
// Pagination Defaults
// ============================================

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
  LIMIT_OPTIONS: [10, 20, 50, 100],
} as const

// ============================================
// Date Formats
// ============================================

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  TIME: 'HH:mm',
  TIME_12H: 'hh:mm A',
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd MMMM yyyy',
} as const

// ============================================
// API Endpoints — Fully Aligned with Backend Routes
// ============================================
// All routes are mounted under /api/v1 (via EnvironmentConfig.api.baseUrl).
// This file contains ONLY the relative paths as defined in the backend routers.
// ============================================

export const API_ENDPOINTS = {
  // ============================================
  // Health & System — mounted at root (not under /api/v1)
  // ============================================
  API: {
    PING: '/ping',
    HEALTH: '/health',
  },

  // ============================================
  // Auth Endpoints — mounted at /api/v1/auth (auth.routes.ts)
  // ============================================
  AUTH: {
    // Public routes
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    VALIDATE: '/auth/validate',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',

    // Authenticated user routes
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    CHANGE_PASSWORD: '/auth/change-password',
    SESSIONS: '/auth/sessions',
    SESSION: (tokenId: string) => `/auth/sessions/${tokenId}`,

    // User profile
    PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/profile',
    PROFILE_CHANGE_PASSWORD: '/auth/profile/change-password',

    // My tokens
    MY_TOKENS: '/auth/me/tokens',
    REVOKE_CURRENT_TOKEN: '/auth/me/revoke',

    // Admin: Token Management
    TOKENS: {
      BASE: '/auth/tokens',
      CREATE: '/auth/tokens',
      BY_ID: (uuid: string) => `/auth/tokens/${uuid}`,
      UPDATE: (uuid: string) => `/auth/tokens/${uuid}`,
      DELETE: (uuid: string) => `/auth/tokens/${uuid}`,
      REVOKE: (uuid: string) => `/auth/tokens/${uuid}/revoke`,
      REVOKE_ALL_BY_USER: (userId: string) =>
        `/auth/tokens/users/${userId}/revoke-all`,
      BY_USER_ID: (userId: string) => `/auth/tokens/users/${userId}`,
      ACTIVE_BY_USER: (userId: string) => `/auth/tokens/users/${userId}/active`,
      BY_TOKEN_VALUE: (tokenValue: string) =>
        `/auth/tokens/value/${tokenValue}`,
      EXPIRED: '/auth/tokens/expired',
      CLEANUP: '/auth/tokens/cleanup',
    },

    // Admin: User Management
    USERS: {
      BASE: '/auth/users',
      CREATE: '/auth/users',
      ALL: '/auth/users',
      ACTIVE: '/auth/users/active',
      STATISTICS: '/auth/users/statistics',
      BY_ROLE: (role: string) => `/auth/users/role/${role}`,
      BY_ORGANISATION: (organisationId: string) =>
        `/auth/users/organisation/${organisationId}`,
      BY_ID: (uuid: string) => `/auth/users/${uuid}`,
      UPDATE: (uuid: string) => `/auth/users/${uuid}`,
      CHANGE_PASSWORD: (uuid: string) =>
        `/auth/users/${uuid}/change-password`,
      UPDATE_TRAINING: (uuid: string) =>
        `/auth/users/${uuid}/training-completed`,
      DEACTIVATE: (uuid: string) => `/auth/users/${uuid}/deactivate`,
      ACTIVATE: (uuid: string) => `/auth/users/${uuid}/activate`,
      LOCK: (uuid: string) => `/auth/users/${uuid}/lock`,
      UNLOCK: (uuid: string) => `/auth/users/${uuid}/unlock`,
      DELETE: (uuid: string) => `/auth/users/${uuid}`,
    },

    // Admin: Auth Cleanup
    CLEANUP: '/auth/cleanup',
  },

  // ============================================
  // Organisation Endpoints — mounted at /api/v1/organisation
  // (organisation.routes.ts — serves organisations, business-units, departments)
  // ============================================
  ORGANISATIONS: {
    BASE: '/organisation',
    CREATE: '/organisation',
    ALL: '/organisation',
    STATISTICS: '/organisation/statistics',
    BY_TENANT: (tenantId: string) => `/organisation/tenant/${tenantId}`,
    BY_INDUSTRY: (industryType: string) =>
      `/organisation/industry/${industryType}`,
    BY_ID: (uuid: string) => `/organisation/${uuid}`,
    UPDATE: (uuid: string) => `/organisation/${uuid}`,
    DELETE: (uuid: string) => `/organisation/${uuid}`,
  },

  // ============================================
  // Business Units — nested under /organisation/business-units
  // ============================================
  BUSINESS_UNITS: {
    BASE: '/organisation/business-units',
    CREATE: '/organisation/business-units',
    ALL: '/organisation/business-units',
    STATISTICS: '/organisation/business-units/statistics',
    BY_ORGANISATION: (organisationId: string) =>
      `/organisation/business-units/organisation/${organisationId}`,
    BY_HEAD_USER: (headUserId: string) =>
      `/organisation/business-units/head/${headUserId}`,
    BY_CRITICALITY: (criticalityScore: string) =>
      `/organisation/business-units/criticality/${criticalityScore}`,
    BY_ID: (uuid: string) => `/organisation/business-units/${uuid}`,
    UPDATE: (uuid: string) => `/organisation/business-units/${uuid}`,
    DELETE: (uuid: string) => `/organisation/business-units/${uuid}`,
  },

  // ============================================
  // Departments — nested under /organisation/departments
  // ============================================
  DEPARTMENTS: {
    BASE: '/organisation/departments',
    CREATE: '/organisation/departments',
    ALL: '/organisation/departments',
    SEARCH: '/organisation/departments/search',
    STATISTICS: '/organisation/departments/statistics',
    BY_BUSINESS_UNIT: (businessUnitId: string) =>
      `/organisation/departments/business-unit/${businessUnitId}`,
    TREE: (businessUnitId: string) =>
      `/organisation/departments/tree/${businessUnitId}`,
    SUB_DEPARTMENTS: (parentDepartmentId: string) =>
      `/organisation/departments/sub/${parentDepartmentId}`,
    REORDER: '/organisation/departments/reorder',
    BY_ID: (uuid: string) => `/organisation/departments/${uuid}`,
    UPDATE: (uuid: string) => `/organisation/departments/${uuid}`,
    DELETE: (uuid: string) => `/organisation/departments/${uuid}`,
  },

  // ============================================
  // Tenants — Admin mounted at /api/v1/admin/tenants (admin.routes.ts)
  // ============================================
  TENANTS: {
    BASE: '/admin/tenants',
    CREATE: '/admin/tenants',
    ALL: '/admin/tenants',
    STATISTICS: '/admin/tenants/statistics',
    BY_DOMAIN_PREFIX: (domainPrefix: string) =>
      `/admin/tenants/domain/${domainPrefix}`,
    METRICS: (uuid: string) => `/admin/tenants/${uuid}/metrics`,
    BY_ID: (uuid: string) => `/admin/tenants/${uuid}`,
    UPDATE: (uuid: string) => `/admin/tenants/${uuid}`,
    UPDATE_STATUS: (uuid: string) => `/admin/tenants/${uuid}/status`,
    DELETE: (uuid: string) => `/admin/tenants/${uuid}`,
    AUDIT_LOGS: (tenantId: string) =>
      `/admin/tenants/${tenantId}/audit-logs`,
    AUDIT_SUMMARY: (tenantId: string) =>
      `/admin/tenants/${tenantId}/audit-logs/summary`,
    AUDIT_BY_ACTION: (tenantId: string, action: string) =>
      `/admin/tenants/${tenantId}/audit-logs/actions/${action}`,
    AUDIT_TIMELINE: (tenantId: string) =>
      `/admin/tenants/${tenantId}/audit-logs/timeline`,
  },

  // ============================================
  // BCM Endpoints — mounted at /api/v1/bcm
  // (bcm.routes.ts)
  // ============================================
  CRITICAL_FUNCTIONS: {
    BASE: '/bcm/critical-functions',
    CREATE: '/bcm/critical-functions',
    ALL: '/bcm/critical-functions',
    SUMMARY: '/bcm/critical-functions/summary',
    FUNCTIONS_REQUIRING_BCP: '/bcm/critical-functions/requires-bcp',
    PRIORITY_SUMMARY: '/bcm/critical-functions/priority-summary',
    BY_DEPARTMENT: (departmentId: string) =>
      `/bcm/critical-functions/department/${departmentId}`,
    BY_PRIORITY: (priority: string) =>
      `/bcm/critical-functions/priority/${priority}`,
    BY_ID: (uuid: string) => `/bcm/critical-functions/${uuid}`,
    UPDATE: (uuid: string) => `/bcm/critical-functions/${uuid}`,
    DELETE: (uuid: string) => `/bcm/critical-functions/${uuid}`,
  },

  BIA: {
    BASE: '/bcm/bia',
    CREATE: '/bcm/bia',
    ALL: '/bcm/bia',
    FINANCIAL_SUMMARY: '/bcm/bia/financial-summary',
    HIGH_IMPACT: '/bcm/bia/high-impact',
    BY_FUNCTION: (functionId: string) => `/bcm/bia/function/${functionId}`,
    BY_ID: (uuid: string) => `/bcm/bia/${uuid}`,
    UPDATE: (uuid: string) => `/bcm/bia/${uuid}`,
    DELETE: (uuid: string) => `/bcm/bia/${uuid}`,
  },

  BCP: {
    BASE: '/bcm/bcp',
    CREATE: '/bcm/bcp',
    ALL: '/bcm/bcp',
    ACTIVE: '/bcm/bcp/active',
    DUE_FOR_REVIEW: '/bcm/bcp/due-for-review',
    STATISTICS: '/bcm/bcp/statistics',
    BY_FUNCTION: (functionId: string) => `/bcm/bcp/function/${functionId}`,
    BY_ID: (uuid: string) => `/bcm/bcp/${uuid}`,
    UPDATE: (uuid: string) => `/bcm/bcp/${uuid}`,
    APPROVE: (uuid: string) => `/bcm/bcp/${uuid}/approve`,
    ARCHIVE: (uuid: string) => `/bcm/bcp/${uuid}/archive`,
    DELETE: (uuid: string) => `/bcm/bcp/${uuid}`,
  },

  BCP_TEMPLATES: {
    BASE: '/bcm/bcp-templates',
    CREATE: '/bcm/bcp-templates',
    ALL: '/bcm/bcp-templates',
    SYSTEM: '/bcm/bcp-templates/system',
    BY_CATEGORY: (category: string) =>
      `/bcm/bcp-templates/category/${category}`,
    BY_TAGS: '/bcm/bcp-templates/by-tags',
    STATISTICS: '/bcm/bcp-templates/statistics',
    BY_ID: (uuid: string) => `/bcm/bcp-templates/${uuid}`,
    APPLY: (uuid: string) => `/bcm/bcp-templates/${uuid}/apply`,
    UPDATE: (uuid: string) => `/bcm/bcp-templates/${uuid}`,
    DELETE: (uuid: string) => `/bcm/bcp-templates/${uuid}`,
  },

  RECOVERY_STRATEGIES: {
    BASE: '/bcm/recovery-strategies',
    CREATE: '/bcm/recovery-strategies',
    ALL: '/bcm/recovery-strategies',
    HIGH_SUCCESS_RATE: '/bcm/recovery-strategies/high-success-rate',
    STATISTICS: '/bcm/recovery-strategies/statistics',
    BY_PLAN: (planId: string) =>
      `/bcm/recovery-strategies/plan/${planId}`,
    BY_TYPE: (type: string) => `/bcm/recovery-strategies/type/${type}`,
    BY_ID: (uuid: string) => `/bcm/recovery-strategies/${uuid}`,
    UPDATE: (uuid: string) => `/bcm/recovery-strategies/${uuid}`,
    DELETE: (uuid: string) => `/bcm/recovery-strategies/${uuid}`,
  },

  EXERCISE_TESTS: {
    BASE: '/bcm/exercise-tests',
    CREATE: '/bcm/exercise-tests',
    ALL: '/bcm/exercise-tests',
    PASSED: '/bcm/exercise-tests/passed',
    FAILED: '/bcm/exercise-tests/failed',
    UPCOMING: '/bcm/exercise-tests/upcoming',
    PAST: '/bcm/exercise-tests/past',
    BY_BCP: (bcpId: string) => `/bcm/exercise-tests/bcp/${bcpId}`,
    BY_ID: (uuid: string) => `/bcm/exercise-tests/${uuid}`,
    UPDATE: (uuid: string) => `/bcm/exercise-tests/${uuid}`,
    RECORD_RESULT: (uuid: string) =>
      `/bcm/exercise-tests/${uuid}/record-result`,
    DELETE: (uuid: string) => `/bcm/exercise-tests/${uuid}`,
  },

  INCIDENTS: {
    BASE: '/bcm/incidents',
    CREATE: '/bcm/incidents',
    ALL: '/bcm/incidents',
    ACTIVE: '/bcm/incidents/active',
    CLOSED: '/bcm/incidents/closed',
    CRITICAL: '/bcm/incidents/critical',
    BY_ORGANISATION: (organisationId: string) =>
      `/bcm/incidents/organisation/${organisationId}`,
    BY_SEVERITY: (severity: string) =>
      `/bcm/incidents/severity/${severity}`,
    BY_BCP: (bcpId: string) => `/bcm/incidents/bcp/${bcpId}`,
    BY_ID: (uuid: string) => `/bcm/incidents/${uuid}`,
    UPDATE: (uuid: string) => `/bcm/incidents/${uuid}`,
    ASSIGN: (uuid: string) => `/bcm/incidents/${uuid}/assign`,
    CLOSE: (uuid: string) => `/bcm/incidents/${uuid}/close`,
    REOPEN: (uuid: string) => `/bcm/incidents/${uuid}/reopen`,
    ESCALATE: (uuid: string) => `/bcm/incidents/${uuid}/escalate`,
    ACKNOWLEDGE: (uuid: string) =>
      `/bcm/incidents/${uuid}/acknowledge`,
    ADD_UPDATE: (uuid: string) => `/bcm/incidents/${uuid}/updates`,
    DELETE: (uuid: string) => `/bcm/incidents/${uuid}`,
  },

  // ============================================
  // Compliance Endpoints — mounted at /api/v1/compliance
  // (compliance.routes.ts)
  // ============================================
  COMPLIANCE: {
    BASE: '/compliance',
    RECORDS: '/compliance/records',
    CREATE: '/compliance/records',
    SUMMARY: '/compliance/summary',
    STATS: '/compliance/stats',
    OVERDUE: '/compliance/overdue',
    UPCOMING: '/compliance/upcoming',
    BY_ORGANISATION: (organisationId: string) =>
      `/compliance/organisation/${organisationId}`,
    BY_STANDARD: (standard: string) =>
      `/compliance/standard/${standard}`,
    BY_STATUS: (status: string) => `/compliance/status/${status}`,
    BY_ID: (uuid: string) => `/compliance/records/${uuid}`,
    UPDATE: (uuid: string) => `/compliance/records/${uuid}`,
    UPDATE_STATUS: (uuid: string) =>
      `/compliance/records/${uuid}/status`,
    DELETE: (uuid: string) => `/compliance/records/${uuid}`,
  },

  // ============================================
  // Risk Endpoints — mounted at /api/v1/risk (risk.routes.ts)
  // ============================================
  RISKS: {
    BASE: '/risk',
    CREATE: '/risk',
    ALL: '/risk',
    STATISTICS: '/risk/statistics',
    HIGH: '/risk/high',
    MY_ASSIGNED: '/risk/my-assigned',
    OVERDUE_REVIEWS: '/risk/overdue-reviews',
    MATRIX: '/risk/matrix',
    TRENDS: '/risk/trends',
    BY_ID: (uuid: string) => `/risk/${uuid}`,
    UPDATE: (uuid: string) => `/risk/${uuid}`,
    DELETE: (uuid: string) => `/risk/${uuid}`,
    ASSESS: (uuid: string) => `/risk/${uuid}/assess`,
    APPROVE: (uuid: string) => `/risk/${uuid}/approve`,
    ASSIGN: (uuid: string) => `/risk/${uuid}/assign`,
    CLOSE: (uuid: string) => `/risk/${uuid}/close`,
    CONTROLS: (uuid: string) => `/risk/${uuid}/controls`,
    CONTROL: (uuid: string, controlId: string) =>
      `/risk/${uuid}/controls/${controlId}`,
    ORGANISATION_MATRIX: (organisationId: string) =>
      `/risk/organisation/${organisationId}/matrix`,
    ORGANISATION_STATS: (organisationId: string) =>
      `/risk/organisation/${organisationId}/stats`,
    ORGANISATION_EXPORT: (organisationId: string) =>
      `/risk/organisation/${organisationId}/export`,
  },

  // ============================================
  // Governance Endpoints — mounted at /api/v1/governance
  // (governance.routes.ts)
  // ============================================
  GOVERNANCE: {
    POLICIES: {
      BASE: '/governance/policies',
      CREATE: '/governance/policies',
      ALL: '/governance/policies',
      STATS: '/governance/policies/stats',
      BY_ID: (uuid: string) => `/governance/policies/${uuid}`,
      UPDATE: (uuid: string) => `/governance/policies/${uuid}`,
      DELETE: (uuid: string) => `/governance/policies/${uuid}`,
      ACTIVATE: (uuid: string) =>
        `/governance/policies/${uuid}/activate`,
      DEACTIVATE: (uuid: string) =>
        `/governance/policies/${uuid}/deactivate`,
    },
    MATURITY: {
      BASE: '/governance/maturity',
      CREATE: '/governance/maturity',
      ALL: '/governance/maturity',
      LATEST: '/governance/maturity/latest',
      BY_ID: (uuid: string) => `/governance/maturity/${uuid}`,
      UPDATE: (uuid: string) => `/governance/maturity/${uuid}`,
      DELETE: (uuid: string) => `/governance/maturity/${uuid}`,
    },
    ACTIVITIES: {
      BASE: '/governance/activities',
      ALL: '/governance/activities',
      RECENT: '/governance/activities/recent',
      LOG: '/governance/activities',
    },
    METRICS: {
      BASE: '/governance/metrics',
      COMPLIANCE_OVERVIEW: '/governance/compliance-overview',
    },
  },

  // ============================================
  // Training Endpoints — mounted at /api/v1/training (training.routes.ts)
  // ============================================
  TRAINING: {
    BASE: '/training',

    COURSES: {
      BASE: '/training/courses',
      ALL: '/training/courses',
      CREATE: '/training/courses',
      BY_ID: (id: string) => `/training/courses/${id}`,
      UPDATE: (id: string) => `/training/courses/${id}`,
      DELETE: (id: string) => `/training/courses/${id}`,
    },

    PROGRESS: {
      BASE: '/training/progress',
      LIST: '/training/progress',
      BY_USER_AND_COURSE: (userId: string, courseId: string) =>
        `/training/progress/user/${userId}/course/${courseId}`,
      ENROLL: '/training/enroll',
      UPDATE: (progressId: string) =>
        `/training/progress/${progressId}`,
    },

    CERTIFICATIONS: {
      BASE: '/training/certifications',
      BY_USER: (userId: string) =>
        `/training/certifications/user/${userId}`,
      CREATE: '/training/certifications',
      UPDATE: (id: string) => `/training/certifications/${id}`,
      DELETE: (id: string) => `/training/certifications/${id}`,
    },
  },

  // ============================================
  // Attestation Endpoints — mounted at /api/v1/attestation
  // (attestation.routes.ts)
  // ============================================
  ATTESTATION: {
    DOCUMENTS: {
      BASE: '/attestation/documents',
      ALL: '/attestation/documents',
      CREATE: '/attestation/documents',
      BY_ID: (id: string) => `/attestation/documents/${id}`,
      UPDATE: (id: string) => `/attestation/documents/${id}`,
      DELETE: (id: string) => `/attestation/documents/${id}`,
    },
    USER: {
      BASE: (userId: string) => `/attestation/user/${userId}`,
      ATTESTATION: (userId: string, attestationId: string) =>
        `/attestation/user/${userId}/attestation/${attestationId}`,
    },
    ACKNOWLEDGE: '/attestation/acknowledge',
    USER_ATTESTATIONS: {
      BASE: '/attestation/user-attestations',
      CREATE: '/attestation/user-attestations',
    },
  },

  // ============================================
  // Workflow Endpoints — mounted at /api/v1/workflow (workflow.routes.ts)
  // ============================================
  WORKFLOWS: {
    BASE: '/workflow',
    CREATE: '/workflow',
    ALL: '/workflow',
    STATS: '/workflow/stats',
    BY_TYPE: (workflowType: string) =>
      `/workflow/type/${workflowType}`,
    BY_STATE: (workflowState: string) =>
      `/workflow/state/${workflowState}`,
    PENDING_APPROVALS: '/workflow/pending/approvals',
    OVERDUE: '/workflow/status/overdue',
    ACTIVE: '/workflow/status/active',
    ESCALATED: '/workflow/status/escalated',
    BY_ID: (uuid: string) => `/workflow/${uuid}`,
    UPDATE: (uuid: string) => `/workflow/${uuid}`,
    DELETE: (uuid: string) => `/workflow/${uuid}`,
    SUBMIT: (uuid: string) => `/workflow/${uuid}/submit`,
    APPROVE: (uuid: string) => `/workflow/${uuid}/approve`,
    REJECT: (uuid: string) => `/workflow/${uuid}/reject`,
    COMPLETE: (uuid: string) => `/workflow/${uuid}/complete`,
    ADD_COMMENT: (uuid: string) => `/workflow/${uuid}/comment`,
    ESCALATE: (uuid: string) => `/workflow/${uuid}/escalate`,
    REASSIGN: (uuid: string) => `/workflow/${uuid}/reassign`,
    ARCHIVE: (uuid: string) => `/workflow/${uuid}/archive`,
    CANCEL: (uuid: string) => `/workflow/${uuid}/cancel`,
  },

  // ============================================
  // Document Endpoints — mounted at /api/v1/document (document.routes.ts)
  // ============================================
  DOCUMENTS: {
    BASE: '/document',
    UPLOAD: '/document/upload',
    SEARCH: '/document/search',
    STATS: '/document/stats',
    PENDING_APPROVALS: '/document/pending-approvals',
    APPROVED: '/document/approved',
    EXPIRED: '/document/expired',
    ALL: '/document',
    BY_TYPE: (documentType: string) =>
      `/document/type/${documentType}`,
    BY_STATUS: (status: string) => `/document/status/${status}`,
    BY_ORGANISATION: (organisationId: string) =>
      `/document/organisation/${organisationId}`,
    DOWNLOAD: (uuid: string) => `/document/${uuid}/download`,
    BY_ID: (uuid: string) => `/document/${uuid}`,
    UPDATE: (uuid: string) => `/document/${uuid}`,
    NEW_VERSION: (uuid: string) => `/document/${uuid}/new-version`,
    SUBMIT_REVIEW: (uuid: string) => `/document/${uuid}/submit-review`,
    APPROVE: (uuid: string) => `/document/${uuid}/approve`,
    REJECT: (uuid: string) => `/document/${uuid}/reject`,
    ARCHIVE: (uuid: string) => `/document/${uuid}/archive`,
    PUBLISH: (uuid: string) => `/document/${uuid}/publish`,
    DELETE: (uuid: string) => `/document/${uuid}`,
    VERSIONS: (uuid: string) => `/document/${uuid}/versions`,
    RESTORE: (uuid: string, versionNumber: number) =>
      `/document/${uuid}/restore/${versionNumber}`,
  },

  // ============================================
  // Notifications — mounted at /api/v1/notifications (shared.routes.ts)
  // ============================================
  NOTIFICATIONS: {
    BASE: '/notifications',
    ALL: '/notifications',
    CREATE: '/notifications',
    BULK: '/notifications/bulk',
    UNREAD_COUNT: '/notifications/unread/count',
    COUNTS: '/notifications/counts',
    MARK_ALL_READ: '/notifications/mark-all-read',
    PREFERENCES: '/notifications/preferences',
    BY_ID: (uuid: string) => `/notifications/${uuid}`,
    MARK_READ: (uuid: string) => `/notifications/${uuid}/read`,
    ARCHIVE: (uuid: string) => `/notifications/${uuid}/archive`,
    DELETE: (uuid: string) => `/notifications/${uuid}`,

    TEMPLATES: {
      BASE: '/notifications/templates',
      ALL: '/notifications/templates',
      CREATE: '/notifications/templates',
      BY_ID: (uuid: string) => `/notifications/templates/${uuid}`,
      BY_TYPE: (type: string) =>
        `/notifications/templates/type/${type}`,
      ACTIVE_BY_TYPE: (type: string) =>
        `/notifications/templates/active/${type}`,
      ACTIVE: '/notifications/templates/active',
      ACTIVATE: (uuid: string) =>
        `/notifications/templates/${uuid}/activate`,
      DEACTIVATE: (uuid: string) =>
        `/notifications/templates/${uuid}/deactivate`,
      PREVIEW: (uuid: string) =>
        `/notifications/templates/${uuid}/preview`,
      STATS: '/notifications/templates/stats',
    },

    STATS: (recipientId: string) =>
      `/notifications/stats/${recipientId}`,
  },

  // ============================================
  // Reports — mounted at /api/v1/reports (shared.routes.ts)
  // ============================================
  REPORTS: {
    BASE: '/reports',
    CREATE: '/reports',
    ALL: '/reports',
    PUBLIC: '/reports/public',
    STATS: '/reports/stats',
    BY_TYPE: (reportType: string) => `/reports/type/${reportType}`,
    BY_ORGANISATION: (organisationId: string) =>
      `/reports/organisation/${organisationId}`,
    BY_ID: (uuid: string) => `/reports/${uuid}`,
    UPDATE: (uuid: string) => `/reports/${uuid}`,
    DELETE: (uuid: string) => `/reports/${uuid}`,
    GENERATE: (uuid: string) => `/reports/${uuid}/generate`,
    CANCEL: (uuid: string) => `/reports/${uuid}/cancel`,
    SCHEDULE: (uuid: string) => `/reports/${uuid}/schedule`,
    GET_DATA: (uuid: string) => `/reports/${uuid}/data`,
    DELETE_EXPIRED: '/reports/maintenance/delete-expired',
  },

  // ============================================
  // Dashboard — mounted at /api/v1/dashboards (shared.routes.ts)
  // ============================================
  DASHBOARD: {
    USER_CONFIG: '/dashboards/user-config',
    CONFIGS: '/dashboards/configs',
    CREATE_CONFIG: '/dashboards/configs',
    CONFIG_BY_ID: (uuid: string) => `/dashboards/configs/${uuid}`,
    UPDATE_CONFIG: (uuid: string) => `/dashboards/configs/${uuid}`,
    DELETE_CONFIG: (uuid: string) => `/dashboards/configs/${uuid}`,

    ORGANISATION_CONFIGS: (organisationId: string) =>
      `/dashboards/organisations/${organisationId}/configs`,
    ROLE_CONFIGS: (organisationId: string, role: string) =>
      `/dashboards/organisations/${organisationId}/roles/${role}/configs`,

    COMPLETE: (organisationId: string) =>
      `/dashboards/organisations/${organisationId}/complete`,
    KPIS: (organisationId: string) =>
      `/dashboards/organisations/${organisationId}/kpis`,
    RISK_SUMMARY: (organisationId: string) =>
      `/dashboards/organisations/${organisationId}/risk-summary`,
    BCM_SUMMARY: (organisationId: string) =>
      `/dashboards/organisations/${organisationId}/bcm-summary`,
    INCIDENT_SUMMARY: (organisationId: string) =>
      `/dashboards/organisations/${organisationId}/incident-summary`,
    COMPLIANCE_SUMMARY: (organisationId: string) =>
      `/dashboards/organisations/${organisationId}/compliance-summary`,
    WORKFLOW_SUMMARY: (organisationId: string) =>
      `/dashboards/organisations/${organisationId}/workflow-summary`,
    RECENT_ACTIVITY: (organisationId: string) =>
      `/dashboards/organisations/${organisationId}/recent-activity`,
    UPCOMING_TASKS: (organisationId: string) =>
      `/dashboards/organisations/${organisationId}/upcoming-tasks`,
    RISK_TRENDS: (organisationId: string) =>
      `/dashboards/organisations/${organisationId}/risk-trends`,
    COMPLIANCE_OVERVIEW: (organisationId: string) =>
      `/dashboards/organisations/${organisationId}/compliance-overview`,
  },

  // ============================================
  // Audit — mounted at /api/v1/audit (shared.routes.ts)
  // ============================================
  AUDIT: {
    BASE: '/audit/logs',
    ALL: '/audit/logs',
    BY_ID: (uuid: string) => `/audit/logs/${uuid}`,
    ENTITY_HISTORY: (entityType: string, entityId: string) =>
      `/audit/entity-history/${entityType}/${entityId}`,
    USER_ACTIVITY: (userId: string) =>
      `/audit/user-activity/${userId}`,
    LOG_ACTIVITY: '/audit/log-activity',
    LOG_BATCH: '/audit/log-batch',
    STATS: '/audit/stats',
    SUMMARY: '/audit/summary',
    EXPORT: '/audit/export',
    CLEANUP: '/audit/cleanup',
    APPLY_RETENTION: '/audit/apply-retention',

    RETENTION_POLICIES: {
      BASE: '/audit/retention-policies',
      ALL: '/audit/retention-policies',
      CREATE: '/audit/retention-policies',
      BY_ID: (uuid: string) =>
        `/audit/retention-policies/${uuid}`,
      UPDATE: (uuid: string) =>
        `/audit/retention-policies/${uuid}`,
      DELETE: (uuid: string) =>
        `/audit/retention-policies/${uuid}`,
    },
  },

  // ============================================
  // Admin Endpoints — mounted at /api/v1/admin (admin.routes.ts)
  // ============================================

  // (Tenants were placed in TENANTS above for BC)

  FEATURE_TOGGLES: {
    BASE: '/admin/feature-toggles',
    CREATE: '/admin/feature-toggles',
    ALL: '/admin/feature-toggles',
    STATS: '/admin/feature-toggles/stats',
    EVALUATE: '/admin/feature-toggles/evaluate',
    BATCH_EVALUATE: '/admin/feature-toggles/evaluate/batch',
    BY_ID: (uuid: string) => `/admin/feature-toggles/${uuid}`,
    UPDATE: (uuid: string) => `/admin/feature-toggles/${uuid}`,
    DELETE: (uuid: string) => `/admin/feature-toggles/${uuid}`,
    AUDIT_LOGS: (featureToggleId: string) =>
      `/admin/feature-toggles/${featureToggleId}/audit-logs`,

    OVERRIDES: {
      BASE: '/admin/feature-toggles/overrides',
      CREATE: '/admin/feature-toggles/overrides',
      ALL: '/admin/feature-toggles/overrides',
      ACTIVE: '/admin/feature-toggles/overrides/active',
      EXPIRED: '/admin/feature-toggles/overrides/expired',
      BY_ID: (uuid: string) =>
        `/admin/feature-toggles/overrides/${uuid}`,
      UPDATE: (uuid: string) =>
        `/admin/feature-toggles/overrides/${uuid}`,
      DELETE: (uuid: string) =>
        `/admin/feature-toggles/overrides/${uuid}`,
    },
  },

  RULES: {
    BASE: '/admin/rules',
    CREATE: '/admin/rules',
    ALL: '/admin/rules',
    STATISTICS: '/admin/rules/statistics',
    ACTIVE: '/admin/rules/active',
    BY_ID: (uuid: string) => `/admin/rules/${uuid}`,
    UPDATE: (uuid: string) => `/admin/rules/${uuid}`,
    DELETE: (uuid: string) => `/admin/rules/${uuid}`,
    ACTIVATE: (uuid: string) => `/admin/rules/${uuid}/activate`,
    DEACTIVATE: (uuid: string) => `/admin/rules/${uuid}/deactivate`,
    ARCHIVE: (uuid: string) => `/admin/rules/${uuid}/archive`,
    EXECUTE: (uuid: string) => `/admin/rules/${uuid}/execute`,
    TEST: (uuid: string) => `/admin/rules/${uuid}/test`,
    DUPLICATE: (uuid: string) => `/admin/rules/${uuid}/duplicate`,
    VERSIONS: (uuid: string) => `/admin/rules/${uuid}/versions`,
    RESTORE: (uuid: string, versionNumber: number) =>
      `/admin/rules/${uuid}/restore/${versionNumber}`,
    ORGANISATION_STATS: (organisationId: string) =>
      `/admin/rules/stats/organisation/${organisationId}`,
    TEST_DEFINITION: '/admin/rules/test-rule',
    VALIDATE: '/admin/rules/validate',

    EXECUTION_LOGS: {
      BASE: (ruleId: string) =>
        `/admin/rules/${ruleId}/execution-logs`,
      STATS: (ruleId: string) =>
        `/admin/rules/${ruleId}/execution-logs/stats`,
      SUMMARY: (ruleId: string) =>
        `/admin/rules/${ruleId}/execution-logs/summary`,
      BY_ID: (uuid: string) =>
        `/admin/rules/execution-logs/${uuid}`,
      DELETE: (uuid: string) =>
        `/admin/rules/execution-logs/${uuid}`,
      CLEANUP: '/admin/rules/execution-logs/cleanup',
    },
  },

  CACHE: {
    BASE: '/admin/cache',
    CREATE: '/admin/cache',
    STATS: '/admin/cache/stats',
    CLEAN_EXPIRED: '/admin/cache/clean-expired',
    CLEAR_ALL: '/admin/cache/clear-all',
    BY_PATTERN: '/admin/cache/pattern',
    BY_TAGS: (tags: string) => `/admin/cache/tags/${tags}`,
    DELETE_BY_TAGS: (tags: string) => `/admin/cache/tags/${tags}`,
    BULK: '/admin/cache/bulk',
    EXISTS: (key: string) =>
      `/admin/cache/${encodeURIComponent(key)}/exists`,
    GET_OR_SET: (key: string) =>
      `/admin/cache/${encodeURIComponent(key)}/get-or-set`,
    BY_KEY: (key: string) =>
      `/admin/cache/${encodeURIComponent(key)}`,
    UPDATE: (key: string) =>
      `/admin/cache/${encodeURIComponent(key)}`,
    DELETE: (key: string) =>
      `/admin/cache/${encodeURIComponent(key)}`,
  },

  // ============================================
  // Sync Endpoints — mounted at /api/v1/sync (sync.routes.ts)
  // ============================================
  SYNC: {
    BASE: '/sync',

    // Pull / Push
    PULL: '/sync/pull',
    PUSH: '/sync/push',
    BATCH: '/sync/batch',

    // Pending Changes
    PENDING_CHANGES: '/sync/pending-changes',
    PENDING_CHANGES_BULK: '/sync/pending-changes/bulk',
    PENDING_CHANGES_PENDING: '/sync/pending-changes/pending',
    PENDING_CHANGES_STATS: '/sync/pending-changes/stats',
    PENDING_CHANGES_BY_ENTITY: (entityId: string) =>
      `/sync/pending-changes/entity/${entityId}`,
    PENDING_CHANGES_BY_TYPE: (entityType: string) =>
      `/sync/pending-changes/type/${entityType}`,
    PENDING_CHANGES_BY_ID: (uuid: string) =>
      `/sync/pending-changes/${uuid}`,
    PENDING_CHANGES_PROCESS: (uuid: string) =>
      `/sync/pending-changes/${uuid}/process`,
    PENDING_CHANGES_DELETE: (uuid: string) =>
      `/sync/pending-changes/${uuid}`,
    PENDING_CHANGES_RETRY_FAILED:
      '/sync/pending-changes/retry-failed',
    PENDING_CHANGES_CLEANUP: '/sync/pending-changes/cleanup',

    // Conflicts
    CONFLICTS: '/sync/conflicts',
    CONFLICTS_UNRESOLVED: '/sync/conflicts/unresolved',
    CONFLICTS_STATS: '/sync/conflicts/stats',
    CONFLICTS_BY_ENTITY: (entityId: string) =>
      `/sync/conflicts/entity/${entityId}`,
    CONFLICT_BY_ID: (uuid: string) => `/sync/conflicts/${uuid}`,
    CONFLICT_RESOLVE: (uuid: string) =>
      `/sync/conflicts/${uuid}/resolve`,
    CONFLICT_DELETE: (uuid: string) => `/sync/conflicts/${uuid}`,
    CONFLICTS_RESOLVE: '/sync/conflicts/resolve',
    CONFLICTS_CLEANUP: '/sync/conflicts/cleanup',

    // Metadata
    METADATA: '/sync/metadata',
    METADATA_BULK: '/sync/metadata/bulk',
    METADATA_BY_KEY: (key: string) => `/sync/metadata/${key}`,
    METADATA_BY_PREFIX: (prefix: string) =>
      `/sync/metadata/prefix/${prefix}`,
    METADATA_BY_PATTERN: (pattern: string) =>
      `/sync/metadata/pattern/${pattern}`,
    METADATA_UPDATE: (key: string) => `/sync/metadata/${key}`,
    METADATA_UPSERT: (key: string) =>
      `/sync/metadata/${key}/upsert`,
    METADATA_UPDATE_TOKEN: '/sync/metadata/last-sync-token',
    METADATA_INCREMENT: (key: string) =>
      `/sync/metadata/${key}/increment`,
    METADATA_BACKUP: '/sync/metadata/backup',
    METADATA_RESTORE: (backupKey: string) =>
      `/sync/metadata/restore/${backupKey}`,
    METADATA_CLEAR_PREFIX: (prefix: string) =>
      `/sync/metadata/prefix/${prefix}`,
    METADATA_DELETE: (key: string) => `/sync/metadata/${key}`,
    LAST_SYNC_TOKEN: '/sync/metadata/last-sync-token',
    SYNC_PROGRESS: '/sync/metadata/sync-progress',
    METADATA_MAP: '/sync/metadata/map',
    METADATA_STATS: '/sync/metadata/stats',
  },

  // ============================================
  // Improvements / Lessons — mounted at /api/v1/improvements
  // (improvements.routes.ts)
  // ============================================
  IMPROVEMENTS: {
    LESSONS: {
      BASE: '/improvements/lessons',
      CREATE: '/improvements/lessons',
      ALL: '/improvements/lessons',
      STATS: '/improvements/lessons/stats',
      WITH_ACTIONS: '/improvements/lessons/with-actions',
      BY_SOURCE: (source: string) =>
        `/improvements/lessons/source/${source}`,
      BY_IDENTIFIED_BY: (userId: string) =>
        `/improvements/lessons/identified-by/${userId}`,
      DETAIL: (uuid: string) =>
        `/improvements/lessons/${uuid}/detail`,
      BY_ID: (uuid: string) => `/improvements/lessons/${uuid}`,
      UPDATE: (uuid: string) => `/improvements/lessons/${uuid}`,
      DELETE: (uuid: string) => `/improvements/lessons/${uuid}`,
      BULK: '/improvements/lessons/bulk',
      ACTIONS: {
        ADD: (uuid: string) =>
          `/improvements/lessons/${uuid}/actions`,
        REMOVE: (uuid: string, actionId: string) =>
          `/improvements/lessons/${uuid}/actions/${actionId}`,
      },
    },
  },
} as const

// ============================================
// Type Exports
// ============================================

export type ApiEndpoints = typeof API_ENDPOINTS
export type ApiEndpointGroup = keyof ApiEndpoints