export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const API_TIMEOUT = 30000
export const API_RETRY_COUNT = 3
export const API_RETRY_DELAY = 1000

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
    '.webp',
    '.txt',
    '.csv',
  ],
} as const

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
  LIMIT_OPTIONS: [10, 20, 50, 100],
} as const

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
// API Endpoints
// ============================================
export const API_ENDPOINTS = {
  // ============================================
  // Health & System Endpoints
  // ============================================
  API: {
    PING: '/ping',
    HEALTH: '/health',
  },

  // ============================================
  // Auth Endpoints (auth.routes.ts)
  // ============================================
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    REFRESH: '/auth/refresh',
    VALIDATE: '/auth/validate',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    SESSIONS: '/auth/sessions',
    SESSION: (tokenId: string) => `/auth/sessions/${tokenId}`,
    CLEANUP: '/auth/cleanup',
    PROFILE: '/auth/users/profile',
  },

  // ============================================
  // Auth Token Endpoints (auth-token.routes.ts)
  // ============================================
  AUTH_TOKENS: {
    BASE: '/auth/tokens',
    BY_ID: (uuid: string) => `/auth/tokens/${uuid}`,
    REVOKE: (uuid: string) => `/auth/tokens/${uuid}/revoke`,
    REVOKE_ALL_BY_USER: (userId: string) => `/auth/tokens/auth/users/${userId}/revoke-all`,
    BY_USER_ID: (userId: string) => `/auth/tokens/auth/users/${userId}`,
    ACTIVE_BY_USER: (userId: string) => `/auth/tokens/auth/users/${userId}/active`,
    MY_TOKENS: '/auth/tokens/me/tokens',
    REVOKE_CURRENT: '/auth/tokens/me/revoke',
    BY_TOKEN_VALUE: (tokenValue: string) => `/auth/tokens/value/${tokenValue}`,
    EXPIRED: '/auth/tokens/expired',
    CLEANUP: '/auth/tokens/cleanup',
  },

  // ============================================
  // Users Endpoints (user.routes.ts)
  // ============================================
  USERS: {
    BASE: '/auth/users',
    PROFILE: '/auth/users/profile',
    CHANGE_PASSWORD: '/auth/users/profile/change-password',
    LIST: '/auth/users',
    ACTIVE: '/auth/users/active',
    STATISTICS: '/auth/users/statistics',
    BY_ROLE: (role: string) => `/auth/users/role/${role}`,
    BY_ORGANISATION: (organisationId: string) => `/auth/users/organisation/${organisationId}`,
    BY_ID: (uuid: string) => `/auth/users/${uuid}`,
    UPDATE: (uuid: string) => `/auth/users/${uuid}`,
    CHANGE_USER_PASSWORD: (uuid: string) => `/auth/users/${uuid}/change-password`,
    UPDATE_TRAINING: (uuid: string) => `/auth/users/${uuid}/training-completed`,
    DEACTIVATE: (uuid: string) => `/auth/users/${uuid}/deactivate`,
    ACTIVATE: (uuid: string) => `/auth/users/${uuid}/activate`,
    LOCK_ACCOUNT: (uuid: string) => `/auth/users/${uuid}/lock`,
    UNLOCK_ACCOUNT: (uuid: string) => `/auth/users/${uuid}/unlock`,
    DELETE: (uuid: string) => `/auth/users/${uuid}`,
    BULK_IMPORT: '/auth/users/bulk-import',
    EXPORT: '/auth/users/export',
    RESEND_INVITATION: (uuid: string) => `/auth/users/${uuid}/resend-invitation`,
    PREFERENCES: (userId: string) => `/auth/users/${userId}/preferences`,
    MY_SESSIONS: '/auth/users/sessions',
    REVOKE_SESSION: (sessionId: string) => `/auth/users/sessions/${sessionId}`,
    REVOKE_OTHER_MY_SESSIONS: '/auth/users/sessions/revoke-others',
    ROLES: '/auth/users/roles',
    VERIFY_EMAIL: '/auth/users/verify-email',
    RESEND_VERIFICATION: '/auth/users/resend-verification',
  },

  // ============================================
  // Tenants Endpoints (tenant.routes.ts)
  // ============================================
  TENANTS: {
    BASE: '/tenants',
    STATISTICS: '/tenants/statistics',
    BY_DOMAIN_PREFIX: (domainPrefix: string) => `/tenants/domain/${domainPrefix}`,
    METRICS: (uuid: string) => `/tenants/${uuid}/metrics`,
    BY_ID: (uuid: string) => `/tenants/${uuid}`,
    UPDATE: (uuid: string) => `/tenants/${uuid}`,
    UPDATE_STATUS: (uuid: string) => `/tenants/${uuid}/status`,
    DELETE: (uuid: string) => `/tenants/${uuid}`,
    AUDIT_LOGS: (tenantId: string) => `/tenants/${tenantId}/audit-logs`,
    AUDIT_SUMMARY: (tenantId: string) => `/tenants/${tenantId}/audit-logs/summary`,
    AUDIT_BY_ACTION: (tenantId: string, action: string) =>
      `/tenants/${tenantId}/audit-logs/actions/${action}`,
    AUDIT_TIMELINE: (tenantId: string) => `/tenants/${tenantId}/audit-logs/timeline`,
  },

  // ============================================
  // Organisations Endpoints (organisation.routes.ts)
  // ============================================
  ORGANISATIONS: {
    BASE: '/organisation',
    STATISTICS: '/organisation/statistics',
    BY_TENANT: (tenantId: string) => `/organisation/tenant/${tenantId}`,
    BY_INDUSTRY: (industryType: string) => `/organisation/industry/${industryType}`,
    BY_ID: (uuid: string) => `/organisation/${uuid}`,
    UPDATE: (uuid: string) => `/organisation/${uuid}`,
    DELETE: (uuid: string) => `/organisation/${uuid}`,
  },

  // ============================================
  // Business Units Endpoints (business-unit.routes.ts)
  // ============================================
  BUSINESS_UNITS: {
    BASE: '/organisation/business-units',
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
  // Departments Endpoints (department.routes.ts)
  // ============================================
  DEPARTMENTS: {
    BASE: '/organisation/departments',
    SEARCH: '/organisation/departments/search',
    STATISTICS: '/organisation/departments/statistics',
    BY_BUSINESS_UNIT: (businessUnitId: string) =>
      `/organisation/departments/business-unit/${businessUnitId}`,
    TREE: (businessUnitId: string) => `/organisation/departments/tree/${businessUnitId}`,
    SUB_DEPARTMENTS: (parentDepartmentId: string) =>
      `/organisation/departments/sub/${parentDepartmentId}`,
    REORDER: '/organisation/departments/reorder',
    BY_ID: (uuid: string) => `/organisation/departments/${uuid}`,
    UPDATE: (uuid: string) => `/organisation/departments/${uuid}`,
    DELETE: (uuid: string) => `/organisation/departments/${uuid}`,
  },

  // ============================================
  // Critical Functions Endpoints (critical-function.routes.ts)
  // ============================================
  CRITICAL_FUNCTIONS: {
    BASE: '/bcm/critical-functions',
    SUMMARY: '/bcm/critical-functions/summary',
    FUNCTIONS_REQUIRING_BCP: '/bcm/critical-functions/requires-bcp',
    PRIORITY_SUMMARY: '/bcm/critical-functions/priority-summary',
    BY_DEPARTMENT: (departmentId: string) =>
      `/bcm/critical-functions/department/${departmentId}`,
    BY_PRIORITY: (priority: string) => `/bcm/critical-functions/priority/${priority}`,
    BY_ID: (uuid: string) => `/bcm/critical-functions/${uuid}`,
    UPDATE: (uuid: string) => `/bcm/critical-functions/${uuid}`,
    DELETE: (uuid: string) => `/bcm/critical-functions/${uuid}`,
  },

  // ============================================
  // Business Impact Assessment Endpoints (business-impact-assessment.routes.ts)
  // ============================================
  BIA: {
    BASE: '/bcm/bia',
    FINANCIAL_SUMMARY: '/bcm/bia/financial-summary',
    HIGH_IMPACT: '/bcm/bia/high-impact',
    BY_FUNCTION: (functionId: string) => `/bcm/bia/function/${functionId}`,
    BY_ID: (uuid: string) => `/bcm/bia/${uuid}`,
    UPDATE: (uuid: string) => `/bcm/bia/${uuid}`,
    DELETE: (uuid: string) => `/bcm/bia/${uuid}`,
  },

  // ============================================
  // Business Continuity Plans Endpoints (business-continuity-plan.routes.ts)
  // ============================================
  BCP: {
    BASE: '/bcm/bcp',
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

  // ============================================
  // BCP Templates Endpoints (bcm.routes.ts)
  // ============================================
  BCP_TEMPLATES: {
    BASE: '/bcm/bcp-templates',
    SYSTEM: '/bcm/bcp-templates/system',
    BY_CATEGORY: (category: string) => `/bcm/bcp-templates/category/${category}`,
    BY_TAGS: '/bcm/bcp-templates/by-tags',
    STATISTICS: '/bcm/bcp-templates/statistics',
    BY_ID: (uuid: string) => `/bcm/bcp-templates/${uuid}`,
    APPLY: (uuid: string) => `/bcm/bcp-templates/${uuid}/apply`,
    UPDATE: (uuid: string) => `/bcm/bcp-templates/${uuid}`,
    DELETE: (uuid: string) => `/bcm/bcp-templates/${uuid}`,
  },

  // ============================================
  // Recovery Strategies Endpoints (recovery-strategy.routes.ts)
  // ============================================
  RECOVERY_STRATEGIES: {
    BASE: '/bcm/recovery-strategies',
    HIGH_SUCCESS_RATE: '/bcm/recovery-strategies/high-success-rate',
    STATISTICS: '/bcm/recovery-strategies/statistics',
    BY_PLAN: (planId: string) => `/bcm/recovery-strategies/plan/${planId}`,
    BY_TYPE: (type: string) => `/bcm/recovery-strategies/type/${type}`,
    BY_ID: (uuid: string) => `/bcm/recovery-strategies/${uuid}`,
    UPDATE: (uuid: string) => `/bcm/recovery-strategies/${uuid}`,
    DELETE: (uuid: string) => `/bcm/recovery-strategies/${uuid}`,
  },

  // ============================================
  // Exercise Tests Endpoints (exercise-test.routes.ts)
  // ============================================
  EXERCISE_TESTS: {
    BASE: '/bcm/exercise-tests',
    PASSED: '/bcm/exercise-tests/passed',
    FAILED: '/bcm/exercise-tests/failed',
    UPCOMING: '/bcm/exercise-tests/upcoming',
    PAST: '/bcm/exercise-tests/past',
    DATE_RANGE: '/bcm/exercise-tests/date-range',
    BY_BCP: (bcpId: string) => `/bcm/exercise-tests/bcp/${bcpId}`,
    BY_ID: (uuid: string) => `/bcm/exercise-tests/${uuid}`,
    UPDATE: (uuid: string) => `/bcm/exercise-tests/${uuid}`,
    RECORD_RESULT: (uuid: string) => `/bcm/exercise-tests/${uuid}/record-result`,
    DELETE: (uuid: string) => `/bcm/exercise-tests/${uuid}`,
  },

  // ============================================
  // Incidents Endpoints (incident.routes.ts)
  // ============================================
  INCIDENTS: {
    BASE: '/bcm/incidents',
    ACTIVE: '/bcm/incidents/active',
    CLOSED: '/bcm/incidents/closed',
    CRITICAL: '/bcm/incidents/critical',
    DATE_RANGE: '/bcm/incidents/date-range',
    BY_ORGANISATION: (organisationId: string) =>
      `/bcm/incidents/organisation/${organisationId}`,
    BY_SEVERITY: (severity: string) => `/bcm/incidents/severity/${severity}`,
    BY_BCP: (bcpId: string) => `/bcm/incidents/bcp/${bcpId}`,
    BY_ID: (uuid: string) => `/bcm/incidents/${uuid}`,
    UPDATE: (uuid: string) => `/bcm/incidents/${uuid}`,
    CLOSE: (uuid: string) => `/bcm/incidents/${uuid}/close`,
    REOPEN: (uuid: string) => `/bcm/incidents/${uuid}/reopen`,
    ESCALATE: (uuid: string) => `/bcm/incidents/${uuid}/escalate`,
    ASSIGN: (uuid: string) => `/bcm/incidents/${uuid}/assign`,
    ACKNOWLEDGE: (uuid: string) => `/bcm/incidents/${uuid}/acknowledge`,
    ADD_UPDATE: (uuid: string) => `/bcm/incidents/${uuid}/updates`,
    DELETE: (uuid: string) => `/bcm/incidents/${uuid}`,
  },

  // ============================================
  // Compliance Records Endpoints (compliance.routes.ts)
  // ============================================
  COMPLIANCE: {
    BASE: '/compliance',
    SUMMARY: '/compliance/summary',
    STATS: '/compliance/stats',
    OVERDUE: '/compliance/overdue',
    UPCOMING: '/compliance/upcoming',
    RECORDS: '/compliance/records',
    BY_ORGANISATION: (organisationId: string) =>
      `/compliance/organisation/${organisationId}`,
    BY_STANDARD: (standard: string) => `/compliance/standard/${standard}`,
    BY_STATUS: (status: string) => `/compliance/status/${status}`,
    BY_ID: (uuid: string) => `/compliance/records/${uuid}`,
    UPDATE: (uuid: string) => `/compliance/records/${uuid}`,
    UPDATE_STATUS: (uuid: string) => `/compliance/records/${uuid}/status`,
    DELETE: (uuid: string) => `/compliance/records/${uuid}`,
  },

  // ============================================
  // Risks Endpoints (risk.routes.ts)
  // ============================================
  RISKS: {
    BASE: '/risk',
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
    CONTROL: (uuid: string, controlId: string) => `/risk/${uuid}/controls/${controlId}`,
    ORGANISATION_MATRIX: (organisationId: string) =>
      `/risk/organisation/${organisationId}/matrix`,
    ORGANISATION_STATS: (organisationId: string) =>
      `/risk/organisation/${organisationId}/stats`,
    ORGANISATION_EXPORT: (organisationId: string) =>
      `/risk/organisation/${organisationId}/export`,
  },

  // ============================================
  // Governance Endpoints (governance.routes.ts)
  // ============================================
  GOVERNANCE: {
    POLICIES: {
      BASE: '/governance/policies',
      STATS: '/governance/policies/stats',
      BY_ID: (uuid: string) => `/governance/policies/${uuid}`,
      CREATE: '/governance/policies',
      UPDATE: (uuid: string) => `/governance/policies/${uuid}`,
      DELETE: (uuid: string) => `/governance/policies/${uuid}`,
      ACTIVATE: (uuid: string) => `/governance/policies/${uuid}/activate`,
      DEACTIVATE: (uuid: string) => `/governance/policies/${uuid}/deactivate`,
    },
    MATURITY: {
      BASE: '/governance/maturity',
      LATEST: '/governance/maturity/latest',
      BY_ID: (uuid: string) => `/governance/maturity/${uuid}`,
      CREATE: '/governance/maturity',
      UPDATE: (uuid: string) => `/governance/maturity/${uuid}`,
      DELETE: (uuid: string) => `/governance/maturity/${uuid}`,
    },
    ACTIVITIES: {
      BASE: '/governance/activities',
      RECENT: '/governance/activities/recent',
      LOG: '/governance/activities',
    },
    METRICS: {
      BASE: '/governance/metrics',
      COMPLIANCE_OVERVIEW: '/governance/compliance-overview',
    },
  },

  // ============================================
  // Training Endpoints (training.routes.ts)
  // ============================================
  TRAINING: {
    BASE: '/training',
    COURSES: {
      BASE: '/training/courses',
      BY_ID: (id: string) => `/training/courses/${id}`,
      CREATE: '/training/courses',
      UPDATE: (id: string) => `/training/courses/${id}`,
      DELETE: (id: string) => `/training/courses/${id}`,
    },
    PROGRESS: {
      BASE: '/training/progress',
      BY_USER_AND_COURSE: (userId: string, courseId: string) =>
        `/training/progress/user/${userId}/course/${courseId}`,
      ENROLL: '/training/enroll',
      UPDATE: (progressId: string) => `/training/progress/${progressId}`,
    },
    CERTIFICATIONS: {
      BASE: '/training/certifications',
      BY_USER: (userId: string) => `/training/certifications/user/${userId}`,
      CREATE: '/training/certifications',
      UPDATE: (id: string) => `/training/certifications/${id}`,
      DELETE: (id: string) => `/training/certifications/${id}`,
    },
  },

  // ============================================
  // Attestation Endpoints (attestation.routes.ts)
  // ============================================
  ATTESTATION: {
    DOCUMENTS: {
      BASE: '/attestation/documents',
      BY_ID: (id: string) => `/attestation/documents/${id}`,
      CREATE: '/attestation/documents',
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
  // Workflow Endpoints (workflow.routes.ts)
  // ============================================
  WORKFLOWS: {
    BASE: '/workflow',
    STATS: '/workflow/stats',
    PENDING_APPROVALS: '/workflow/pending/approvals',
    OVERDUE: '/workflow/status/overdue',
    ACTIVE: '/workflow/status/active',
    ESCALATED: '/workflow/status/escalated',
    BY_TYPE: (workflowType: string) => `/workflow/type/${workflowType}`,
    BY_STATE: (workflowState: string) => `/workflow/state/${workflowState}`,
    BY_INITIATED_BY: (userId: string) => `/workflow/initiated-by/${userId}`,
    BY_ASSIGNED_TO: (userId: string) => `/workflow/assigned-to/${userId}`,
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
  // Documents Endpoints (document.routes.ts)
  // ============================================
  DOCUMENTS: {
    BASE: '/document',
    UPLOAD: '/document/upload',
    SEARCH: '/document/search',
    STATS: '/document/stats',
    PENDING_APPROVALS: '/document/pending-approvals',
    APPROVED: '/document/approved',
    EXPIRED: '/document/expired',
    BY_TYPE: (documentType: string) => `/document/type/${documentType}`,
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
  // Notifications Endpoints (shared.routes.ts)
  // ============================================
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread/count',
    COUNTS: '/notifications/counts',
    MARK_ALL_READ: '/notifications/mark-all-read',
    PREFERENCES: '/notifications/preferences',
    TEMPLATES: '/notifications/templates',
    BULK: '/notifications/bulk',
    BY_ID: (uuid: string) => `/notifications/${uuid}`,
    MARK_READ: (uuid: string) => `/notifications/${uuid}/read`,
    ARCHIVE: (uuid: string) => `/notifications/${uuid}/archive`,
    DELETE: (uuid: string) => `/notifications/${uuid}`,
    TEMPLATE_BY_ID: (uuid: string) => `/notifications/templates/${uuid}`,
    TEMPLATE_BY_TYPE: (type: string) => `/notifications/templates/type/${type}`,
    ACTIVE_TEMPLATE_BY_TYPE: (type: string) => `/notifications/templates/active/${type}`,
    ACTIVE_TEMPLATES: '/notifications/templates/active',
    ACTIVATE_TEMPLATE: (uuid: string) => `/notifications/templates/${uuid}/activate`,
    DEACTIVATE_TEMPLATE: (uuid: string) => `/notifications/templates/${uuid}/deactivate`,
    PREVIEW_TEMPLATE: (uuid: string) => `/notifications/templates/${uuid}/preview`,
    TEMPLATE_STATS: '/notifications/templates/stats',
    STATS: (recipientId: string) => `/notifications/stats/${recipientId}`,
  },

  // ============================================
  // Reports Endpoints (shared.routes.ts)
  // ============================================
  REPORTS: {
    BASE: '/reports',
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
  // Dashboard Endpoints (shared.routes.ts)
  // ============================================
  DASHBOARD: {
    USER_CONFIG: '/dashboards/user-config',
    CONFIGS: '/dashboards/configs',
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
  // Audit Endpoints (shared.routes.ts)
  // ============================================
  AUDIT: {
    BASE: '/audit/logs',
    BY_ID: (uuid: string) => `/audit/logs/${uuid}`,
    ENTITY_HISTORY: (entityType: string, entityId: string) =>
      `/audit/entity-history/${entityType}/${entityId}`,
    USER_ACTIVITY: (userId: string) => `/audit/user-activity/${userId}`,
    LOG_ACTIVITY: '/audit/log-activity',
    LOG_BATCH: '/audit/log-batch',
    STATS: '/audit/stats',
    SUMMARY: '/audit/summary',
    EXPORT: '/audit/export',
    CLEANUP: '/audit/cleanup',
    RETENTION_POLICIES: '/audit/retention-policies',
    RETENTION_POLICY_BY_ID: (uuid: string) =>
      `/audit/retention-policies/${uuid}`,
    CREATE_RETENTION_POLICY: '/audit/retention-policies',
    UPDATE_RETENTION_POLICY: (uuid: string) =>
      `/audit/retention-policies/${uuid}`,
    DELETE_RETENTION_POLICY: (uuid: string) =>
      `/audit/retention-policies/${uuid}`,
    APPLY_RETENTION: '/audit/apply-retention',
  },

  // ============================================
  // Admin Endpoints (admin.routes.ts)
  // ============================================
  ADMIN: {
    TENANTS: {
      BASE: '/admin/tenants',
      STATISTICS: '/admin/tenants/statistics',
      BY_DOMAIN_PREFIX: (domainPrefix: string) =>
        `/admin/tenants/domain/${domainPrefix}`,
      METRICS: (uuid: string) => `/admin/tenants/${uuid}/metrics`,
      BY_ID: (uuid: string) => `/admin/tenants/${uuid}`,
      UPDATE: (uuid: string) => `/admin/tenants/${uuid}`,
      UPDATE_STATUS: (uuid: string) => `/admin/tenants/${uuid}/status`,
      DELETE: (uuid: string) => `/admin/tenants/${uuid}`,
      AUDIT_LOGS: (tenantId: string) => `/admin/tenants/${tenantId}/audit-logs`,
      AUDIT_SUMMARY: (tenantId: string) =>
        `/admin/tenants/${tenantId}/audit-logs/summary`,
      AUDIT_BY_ACTION: (tenantId: string, action: string) =>
        `/admin/tenants/${tenantId}/audit-logs/actions/${action}`,
      AUDIT_TIMELINE: (tenantId: string) =>
        `/admin/tenants/${tenantId}/audit-logs/timeline`,
    },
    FEATURE_TOGGLES: {
      BASE: '/admin/feature-toggles',
      STATS: '/admin/feature-toggles/stats',
      EVALUATE: '/admin/feature-toggles/evaluate',
      BATCH_EVALUATE: '/admin/feature-toggles/evaluate/batch',
      OVERRIDES: '/admin/feature-toggles/overrides',
      ACTIVE_OVERRIDES: '/admin/feature-toggles/overrides/active',
      DELETE_EXPIRED_OVERRIDES: '/admin/feature-toggles/overrides/expired',
      OVERRIDE_BY_ID: (uuid: string) =>
        `/admin/feature-toggles/overrides/${uuid}`,
      UPDATE_OVERRIDE: (uuid: string) =>
        `/admin/feature-toggles/overrides/${uuid}`,
      DELETE_OVERRIDE: (uuid: string) =>
        `/admin/feature-toggles/overrides/${uuid}`,
      BY_ID: (uuid: string) => `/admin/feature-toggles/${uuid}`,
      UPDATE: (uuid: string) => `/admin/feature-toggles/${uuid}`,
      DELETE: (uuid: string) => `/admin/feature-toggles/${uuid}`,
      AUDIT_LOGS: (featureToggleId: string) =>
        `/admin/feature-toggles/${featureToggleId}/audit-logs`,
    },
    RULES: {
      BASE: '/admin/rules',
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
      EXECUTION_LOGS: (ruleId: string) =>
        `/admin/rules/${ruleId}/execution-logs`,
      EXECUTION_STATS: (ruleId: string) =>
        `/admin/rules/${ruleId}/execution-logs/stats`,
      EXECUTION_SUMMARY: (ruleId: string) =>
        `/admin/rules/${ruleId}/execution-logs/summary`,
      EXECUTION_LOG_BY_ID: (uuid: string) => `/admin/rules/execution-logs/${uuid}`,
      EXECUTION_LOG_DELETE: (uuid: string) => `/admin/rules/execution-logs/${uuid}`,
      EXECUTION_LOGS_CLEANUP: '/admin/rules/execution-logs/cleanup',
    },
    CACHE: {
      BASE: '/admin/cache',
      STATS: '/admin/cache/stats',
      CLEAN_EXPIRED: '/admin/cache/clean-expired',
      CLEAR_ALL: '/admin/cache/clear-all',
      BY_PATTERN: '/admin/cache/pattern',
      BY_TAGS: (tags: string) => `/admin/cache/tags/${tags}`,
      DELETE_BY_TAGS: (tags: string) => `/admin/cache/tags/${tags}`,
      BULK: '/admin/cache/bulk',
      EXISTS: (key: string) => `/admin/cache/${encodeURIComponent(key)}/exists`,
      GET_OR_SET: (key: string) =>
        `/admin/cache/${encodeURIComponent(key)}/get-or-set`,
      BY_KEY: (key: string) => `/admin/cache/${encodeURIComponent(key)}`,
      UPDATE: (key: string) => `/admin/cache/${encodeURIComponent(key)}`,
      DELETE: (key: string) => `/admin/cache/${encodeURIComponent(key)}`,
    },
  },

  // ============================================
  // Sync Endpoints (sync.routes.ts)
  // ============================================
  SYNC: {
    BASE: '/sync',

    // Pull/Push
    PULL: '/sync/pull',
    PUSH: '/sync/push',
    BATCH: '/sync/batch',

    // Pending Changes
    PENDING_CHANGES: '/sync/pending-changes',
    PENDING_CHANGES_BULK: '/sync/pending-changes/bulk',
    PENDING_CHANGES_PENDING: '/sync/pending-changes/pending',
    PENDING_CHANGES_STATS: '/sync/pending-changes/stats',
    PENDING_CHANGES_BY_ENTITY: (entityId: string) => `/sync/pending-changes/entity/${entityId}`,
    PENDING_CHANGES_BY_TYPE: (entityType: string) => `/sync/pending-changes/type/${entityType}`,
    PENDING_CHANGES_BY_ID: (uuid: string) => `/sync/pending-changes/${uuid}`,
    PENDING_CHANGES_PROCESS: (uuid: string) => `/sync/pending-changes/${uuid}/process`,
    PENDING_CHANGES_DELETE: (uuid: string) => `/sync/pending-changes/${uuid}`,
    PENDING_CHANGES_RETRY_FAILED: '/sync/pending-changes/retry-failed',
    PENDING_CHANGES_CLEANUP: '/sync/pending-changes/cleanup',

    // Conflicts
    CONFLICTS: '/sync/conflicts',
    CONFLICTS_UNRESOLVED: '/sync/conflicts/unresolved',
    CONFLICTS_STATS: '/sync/conflicts/stats',
    CONFLICTS_BY_ENTITY: (entityId: string) => `/sync/conflicts/entity/${entityId}`,
    CONFLICT_BY_ID: (uuid: string) => `/sync/conflicts/${uuid}`,
    CONFLICT_RESOLVE: (uuid: string) => `/sync/conflicts/${uuid}/resolve`,
    CONFLICT_DELETE: (uuid: string) => `/sync/conflicts/${uuid}`,
    CONFLICTS_RESOLVE: '/sync/conflicts/resolve',
    CONFLICTS_CLEANUP: '/sync/conflicts/cleanup',

    // Metadata
    METADATA: '/sync/metadata',
    METADATA_BULK: '/sync/metadata/bulk',
    METADATA_BY_KEY: (key: string) => `/sync/metadata/${key}`,
    METADATA_BY_PREFIX: (prefix: string) => `/sync/metadata/prefix/${prefix}`,
    METADATA_BY_PATTERN: (pattern: string) => `/sync/metadata/pattern/${pattern}`,
    METADATA_UPDATE: (key: string) => `/sync/metadata/${key}`,
    METADATA_UPSERT: (key: string) => `/sync/metadata/${key}/upsert`,
    METADATA_UPDATE_TOKEN: '/sync/metadata/last-sync-token',
    METADATA_INCREMENT: (key: string) => `/sync/metadata/${key}/increment`,
    METADATA_BACKUP: '/sync/metadata/backup',
    METADATA_RESTORE: (backupKey: string) => `/sync/metadata/restore/${backupKey}`,
    METADATA_CLEAR_PREFIX: (prefix: string) => `/sync/metadata/prefix/${prefix}`,
    METADATA_DELETE: (key: string) => `/sync/metadata/${key}`,
    LAST_SYNC_TOKEN: '/sync/metadata/last-sync-token',
    SYNC_PROGRESS: '/sync/metadata/sync-progress',
    METADATA_MAP: '/sync/metadata/map',
    METADATA_STATS: '/sync/metadata/stats',
  },

  // ============================================
  // Cache Endpoints (admin.routes.ts) - Top-level for backward compatibility
  // ============================================
  CACHE: {
    BASE: '/admin/cache',
    STATS: '/admin/cache/stats',
    CLEAN_EXPIRED: '/admin/cache/clean-expired',
    CLEAR_ALL: '/admin/cache/clear-all',
    BY_PATTERN: '/admin/cache/pattern',
    BY_TAGS: (tags: string) => `/admin/cache/tags/${tags}`,
    DELETE_BY_TAGS: (tags: string) => `/admin/cache/tags/${tags}`,
    BULK: '/admin/cache/bulk',
    EXISTS: (key: string) => `/admin/cache/${encodeURIComponent(key)}/exists`,
    GET_OR_SET: (key: string) =>
      `/admin/cache/${encodeURIComponent(key)}/get-or-set`,
    BY_KEY: (key: string) => `/admin/cache/${encodeURIComponent(key)}`,
    UPDATE: (key: string) => `/admin/cache/${encodeURIComponent(key)}`,
    DELETE: (key: string) => `/admin/cache/${encodeURIComponent(key)}`,
  },

  // ============================================
  // Feature Toggle Endpoints (admin.routes.ts) - Top-level for backward compatibility
  // ============================================
  FEATURE_TOGGLES: {
    BASE: '/admin/feature-toggles',
    STATS: '/admin/feature-toggles/stats',
    EVALUATE: '/admin/feature-toggles/evaluate',
    BATCH_EVALUATE: '/admin/feature-toggles/evaluate/batch',
    OVERRIDES: '/admin/feature-toggles/overrides',
    ACTIVE_OVERRIDES: '/admin/feature-toggles/overrides/active',
    DELETE_EXPIRED_OVERRIDES: '/admin/feature-toggles/overrides/expired',
    OVERRIDE_BY_ID: (uuid: string) =>
      `/admin/feature-toggles/overrides/${uuid}`,
    UPDATE_OVERRIDE: (uuid: string) =>
      `/admin/feature-toggles/overrides/${uuid}`,
    DELETE_OVERRIDE: (uuid: string) =>
      `/admin/feature-toggles/overrides/${uuid}`,
    BY_ID: (uuid: string) => `/admin/feature-toggles/${uuid}`,
    UPDATE: (uuid: string) => `/admin/feature-toggles/${uuid}`,
    DELETE: (uuid: string) => `/admin/feature-toggles/${uuid}`,
    AUDIT_LOGS: (featureToggleId: string) =>
      `/admin/feature-toggles/${featureToggleId}/audit-logs`,
  },

  // ============================================
  // Rules Endpoints (admin.routes.ts) - Top-level for backward compatibility
  // ============================================
  RULES: {
    BASE: '/admin/rules',
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
    EXECUTION_LOGS: (ruleId: string) =>
      `/admin/rules/${ruleId}/execution-logs`,
    EXECUTION_STATS: (ruleId: string) =>
      `/admin/rules/${ruleId}/execution-logs/stats`,
    EXECUTION_SUMMARY: (ruleId: string) =>
      `/admin/rules/${ruleId}/execution-logs/summary`,
    EXECUTION_LOG_BY_ID: (uuid: string) => `/admin/rules/execution-logs/${uuid}`,
    EXECUTION_LOG_DELETE: (uuid: string) => `/admin/rules/execution-logs/${uuid}`,
    EXECUTION_LOGS_CLEANUP: '/admin/rules/execution-logs/cleanup',
  },

  // ============================================
  // Improvements/Lessons Endpoints (improvements.routes.ts)
  // ============================================
  IMPROVEMENTS: {
    LESSONS: {
      BASE: '/improvements/lessons',
      STATS: '/improvements/lessons/stats',
      WITH_ACTIONS: '/improvements/lessons/with-actions',
      BY_SOURCE: (source: string) => `/improvements/lessons/source/${source}`,
      BY_IDENTIFIED_BY: (userId: string) => `/improvements/lessons/identified-by/${userId}`,
      DETAIL: (uuid: string) => `/improvements/lessons/${uuid}/detail`,
      BY_ID: (uuid: string) => `/improvements/lessons/${uuid}`,
      UPDATE: (uuid: string) => `/improvements/lessons/${uuid}`,
      DELETE: (uuid: string) => `/improvements/lessons/${uuid}`,
      BULK: '/improvements/lessons/bulk',
      ACTIONS: {
        ADD: (uuid: string) => `/improvements/lessons/${uuid}/actions`,
        REMOVE: (uuid: string, actionId: string) =>
          `/improvements/lessons/${uuid}/actions/${actionId}`,
      },
    },
  },
} as const