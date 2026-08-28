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
    BASE: '/organisations',
    STATISTICS: '/organisations/statistics',
    BY_TENANT: (tenantId: string) => `/organisations/tenant/${tenantId}`,
    BY_INDUSTRY: (industryType: string) => `/organisations/industry/${industryType}`,
    BY_ID: (uuid: string) => `/organisations/${uuid}`,
    UPDATE: (uuid: string) => `/organisations/${uuid}`,
    DELETE: (uuid: string) => `/organisations/${uuid}`,
  },

  // ============================================
  // Business Units Endpoints (business-unit.routes.ts)
  // ============================================
  BUSINESS_UNITS: {
    BASE: '/business-units',
    STATISTICS: '/business-units/statistics',
    BY_ORGANISATION: (organisationId: string) => `/business-units/organisation/${organisationId}`,
    BY_ID: (uuid: string) => `/business-units/${uuid}`,
    UPDATE: (uuid: string) => `/business-units/${uuid}`,
    DELETE: (uuid: string) => `/business-units/${uuid}`,
  },

  // ============================================
  // Departments Endpoints (department.routes.ts)
  // ============================================
  DEPARTMENTS: {
    BASE: '/departments',
    SEARCH: '/departments/search',
    STATISTICS: '/departments/statistics',
    BY_BUSINESS_UNIT: (businessUnitId: string) => `/departments/business-unit/${businessUnitId}`,
    TREE: (businessUnitId: string) => `/departments/${businessUnitId}/tree`,
    REORDER: '/departments/reorder',
    BY_ID: (uuid: string) => `/departments/${uuid}`,
    UPDATE: (uuid: string) => `/departments/${uuid}`,
    DELETE: (uuid: string) => `/departments/${uuid}`,
  },

  // ============================================
  // Critical Functions Endpoints (critical-function.routes.ts)
  // ============================================
  CRITICAL_FUNCTIONS: {
    BASE: '/bcm/critical-functions',
    SUMMARY: '/bcm/critical-functions/summary',
    FUNCTIONS_REQUIRING_BCP: '/bcm/critical-functions/requires-bcp',
    PRIORITY_SUMMARY: '/bcm/critical-functions/priority-summary',
    BY_DEPARTMENT: (departmentId: string) => `/bcm/critical-functions/department/${departmentId}`,
    BY_PRIORITY: (priority: string) => `/bcm/critical-functions/priority/${priority}`,
    BY_ID: (uuid: string) => `/bcm/critical-functions/${uuid}`,
    UPDATE: (uuid: string) => `/bcm/critical-functions/${uuid}`,
    DELETE: (uuid: string) => `/bcm/critical-functions/${uuid}`,
  },

  // ============================================
  // Business Impact Assessment Endpoints (business-impact-assessment.routes.ts)
  // ============================================
  BIA: {
    BASE: '/bcm/impact-assessments',
    FINANCIAL_SUMMARY: '/bcm/impact-assessments/financial-summary',
    HIGH_IMPACT: '/bcm/impact-assessments/high-impact',
    BY_FUNCTION: (functionId: string) => `/bcm/impact-assessments/function/${functionId}`,
    BY_ID: (uuid: string) => `/bcm/impact-assessments/${uuid}`,
    UPDATE: (uuid: string) => `/bcm/impact-assessments/${uuid}`,
    DELETE: (uuid: string) => `/bcm/impact-assessments/${uuid}`,
  },

  // ============================================
  // Business Continuity Plans Endpoints (business-continuity-plan.routes.ts)
  // ============================================
  BCP: {
    BASE: '/bcm/plans',
    ACTIVE: '/bcm/plans/active',
    DUE_FOR_REVIEW: '/bcm/plans/due-for-review',
    STATISTICS: '/bcm/plans/statistics',
    BY_FUNCTION: (functionId: string) => `/bcm/plans/function/${functionId}`,
    BY_ID: (uuid: string) => `/bcm/plans/${uuid}`,
    UPDATE: (uuid: string) => `/bcm/plans/${uuid}`,
    APPROVE: (uuid: string) => `/bcm/plans/${uuid}/approve`,
    ARCHIVE: (uuid: string) => `/bcm/plans/${uuid}/archive`,
    DELETE: (uuid: string) => `/bcm/plans/${uuid}`,
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
  // Risks Endpoints (risk.routes.ts)
  // ============================================
  RISKS: {
    BASE: '/risks',
    STATISTICS: '/risks/statistics',
    HIGH_RISKS: '/risks/high',
    MY_ASSIGNED: '/risks/my-assigned',
    OVERDUE_REVIEWS: '/risks/overdue-reviews',
    BY_ID: (uuid: string) => `/risks/${uuid}`,
    UPDATE: (uuid: string) => `/risks/${uuid}`,
    ASSESS: (uuid: string) => `/risks/${uuid}/assess`,
    APPROVE: (uuid: string) => `/risks/${uuid}/approve`,
    ASSIGN: (uuid: string) => `/risks/${uuid}/assign`,
    CLOSE: (uuid: string) => `/risks/${uuid}/close`,
    DELETE: (uuid: string) => `/risks/${uuid}`,
  },

  // ============================================
  // Incidents Endpoints (incident.routes.ts)
  // ============================================
  INCIDENTS: {
    BASE: '/incidents',
    ACTIVE: '/incidents/active',
    CLOSED: '/incidents/closed',
    CRITICAL: '/incidents/critical',
    DATE_RANGE: '/incidents/date-range',
    BY_ORGANISATION: (organisationId: string) => `/incidents/organisation/${organisationId}`,
    BY_SEVERITY: (severity: string) => `/incidents/severity/${severity}`,
    BY_BCP: (bcpId: string) => `/incidents/bcp/${bcpId}`,
    BY_ID: (uuid: string) => `/incidents/${uuid}`,
    UPDATE: (uuid: string) => `/incidents/${uuid}`,
    CLOSE: (uuid: string) => `/incidents/${uuid}/close`,
    REOPEN: (uuid: string) => `/incidents/${uuid}/reopen`,
    ESCALATE: (uuid: string) => `/incidents/${uuid}/escalate`,
    ASSIGN: (uuid: string) => `/incidents/${uuid}/assign`,
    ADD_UPDATE: (uuid: string) => `/incidents/${uuid}/updates`,
    DELETE: (uuid: string) => `/incidents/${uuid}`,
  },

  // ============================================
  // Exercise Tests Endpoints (exercise-test.routes.ts)
  // ============================================
  EXERCISE_TESTS: {
    BASE: '/exercise-tests',
    PASSED: '/exercise-tests/passed',
    FAILED: '/exercise-tests/failed',
    UPCOMING: '/exercise-tests/upcoming',
    PAST: '/exercise-tests/past',
    DATE_RANGE: '/exercise-tests/date-range',
    BY_BCP: (bcpId: string) => `/exercise-tests/bcp/${bcpId}`,
    BY_ID: (uuid: string) => `/exercise-tests/${uuid}`,
    UPDATE: (uuid: string) => `/exercise-tests/${uuid}`,
    RECORD_RESULT: (uuid: string) => `/exercise-tests/${uuid}/record-result`,
    DELETE: (uuid: string) => `/exercise-tests/${uuid}`,
  },

  // ============================================
  // Compliance Records Endpoints (compliance-record.routes.ts)
  // ============================================
  COMPLIANCE: {
    BASE: '/compliance',
    SUMMARY: '/compliance/summary',
    OVERDUE: '/compliance/overdue',
    UPCOMING: '/compliance/upcoming',
    BY_ORGANISATION: (organisationId: string) => `/compliance/organisation/${organisationId}`,
    BY_STANDARD: (standard: string) => `/compliance/standard/${standard}`,
    BY_STATUS: (status: string) => `/compliance/status/${status}`,
    BY_ID: (uuid: string) => `/compliance/${uuid}`,
    UPDATE: (uuid: string) => `/compliance/${uuid}`,
    UPDATE_STATUS: (uuid: string) => `/compliance/${uuid}/status`,
    DELETE: (uuid: string) => `/compliance/${uuid}`,
  },

  // ============================================
  // Workflow Endpoints (workflow.routes.ts)
  // ============================================
  WORKFLOWS: {
    BASE: '/workflows',
    STATS: '/workflows/stats',
    PENDING_APPROVALS: '/workflows/pending/approvals',
    OVERDUE: '/workflows/status/overdue',
    ACTIVE: '/workflows/status/active',
    ESCALATED: '/workflows/status/escalated',
    BY_TYPE: (workflowType: string) => `/workflows/type/${workflowType}`,
    BY_STATE: (workflowState: string) => `/workflows/state/${workflowState}`,
    BY_INITIATED_BY: (userId: string) => `/workflows/initiated-by/${userId}`,
    BY_ASSIGNED_TO: (userId: string) => `/workflows/assigned-to/${userId}`,
    BY_ID: (uuid: string) => `/workflows/${uuid}`,
    UPDATE: (uuid: string) => `/workflows/${uuid}`,
    DELETE: (uuid: string) => `/workflows/${uuid}`,
    SUBMIT: (uuid: string) => `/workflows/${uuid}/submit`,
    APPROVE: (uuid: string) => `/workflows/${uuid}/approve`,
    REJECT: (uuid: string) => `/workflows/${uuid}/reject`,
    COMPLETE: (uuid: string) => `/workflows/${uuid}/complete`,
    ADD_COMMENT: (uuid: string) => `/workflows/${uuid}/comment`,
    ESCALATE: (uuid: string) => `/workflows/${uuid}/escalate`,
    REASSIGN: (uuid: string) => `/workflows/${uuid}/reassign`,
    ARCHIVE: (uuid: string) => `/workflows/${uuid}/archive`,
    CANCEL: (uuid: string) => `/workflows/${uuid}/cancel`,
  },

  // ============================================
  // Rules Endpoints (rule.routes.ts)
  // ============================================
  RULES: {
    BASE: '/rules',
    STATISTICS: '/rules/statistics',
    ACTIVE: '/rules/active',
    BY_ID: (uuid: string) => `/rules/${uuid}`,
    UPDATE: (uuid: string) => `/rules/${uuid}`,
    ACTIVATE: (uuid: string) => `/rules/${uuid}/activate`,
    DEACTIVATE: (uuid: string) => `/rules/${uuid}/deactivate`,
    ARCHIVE: (uuid: string) => `/rules/${uuid}/archive`,
    EXECUTE: (uuid: string) => `/rules/${uuid}/execute`,
    TEST: (uuid: string) => `/rules/${uuid}/test`,
    DELETE: (uuid: string) => `/rules/${uuid}`,
    EXECUTION_LOGS: (ruleId: string) => `/rules/${ruleId}/execution-logs`,
    EXECUTION_STATS: (ruleId: string) => `/rules/${ruleId}/execution-logs/stats`,
    EXECUTION_LOGS_CLEANUP: '/rules/execution-logs/cleanup',
  },

  // ============================================
  // Documents Endpoints (document.routes.ts)
  // ============================================
  DOCUMENTS: {
    BASE: '/documents',
    UPLOAD: '/documents/upload',
    SEARCH: '/documents/search',
    STATS: '/documents/stats',
    PENDING_APPROVALS: '/documents/pending-approvals',
    APPROVED: '/documents/approved',
    EXPIRED: '/documents/expired',
    BY_TYPE: (documentType: string) => `/documents/type/${documentType}`,
    BY_STATUS: (status: string) => `/documents/status/${status}`,
    BY_ORGANISATION: (organisationId: string) => `/documents/organisation/${organisationId}`,
    DOWNLOAD: (uuid: string) => `/documents/${uuid}/download`,
    BY_ID: (uuid: string) => `/documents/${uuid}`,
    UPDATE: (uuid: string) => `/documents/${uuid}`,
    NEW_VERSION: (uuid: string) => `/documents/${uuid}/new-version`,
    SUBMIT_REVIEW: (uuid: string) => `/documents/${uuid}/submit-review`,
    APPROVE: (uuid: string) => `/documents/${uuid}/approve`,
    REJECT: (uuid: string) => `/documents/${uuid}/reject`,
    ARCHIVE: (uuid: string) => `/documents/${uuid}/archive`,
    PUBLISH: (uuid: string) => `/documents/${uuid}/publish`,
    DELETE: (uuid: string) => `/documents/${uuid}`,
  },

  // ============================================
  // Notifications Endpoints (notification.routes.ts)
  // ============================================
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread/count',
    COUNTS: '/notifications/counts',
    MARK_ALL_READ: '/notifications/mark-all-read',
    PREFERENCES: '/notifications/preferences',
    TEMPLATES: '/notifications/templates',
    CREATE_TEMPLATE: '/notifications/templates',
    BULK: '/notifications/bulk',
    BY_ID: (uuid: string) => `/notifications/${uuid}`,
    MARK_READ: (uuid: string) => `/notifications/${uuid}/read`,
    ARCHIVE: (uuid: string) => `/notifications/${uuid}/archive`,
    DELETE: (uuid: string) => `/notifications/${uuid}`,
  },

  // ============================================
  // Feature Toggle Endpoints (feature-toggle.routes.ts)
  // ============================================
  FEATURE_TOGGLES: {
    BASE: '/features',
    STATS: '/features/stats',
    EVALUATE: '/features/evaluate',
    BATCH_EVALUATE: '/features/evaluate/batch',
    OVERRIDES: '/features/overrides',
    ACTIVE_OVERRIDES: '/features/overrides/active',
    DELETE_EXPIRED_OVERRIDES: '/features/overrides/expired',
    OVERRIDE_BY_ID: (uuid: string) => `/features/overrides/${uuid}`,
    UPDATE_OVERRIDE: (uuid: string) => `/features/overrides/${uuid}`,
    DELETE_OVERRIDE: (uuid: string) => `/features/overrides/${uuid}`,
    BY_ID: (uuid: string) => `/features/${uuid}`,
    UPDATE: (uuid: string) => `/features/${uuid}`,
    DELETE: (uuid: string) => `/features/${uuid}`,
    AUDIT_LOGS: (featureToggleId: string) => `/features/${featureToggleId}/audit-logs`,
  },

  // ============================================
  // Sync Endpoints (sync.routes.ts)
  // ============================================
  SYNC: {
    BASE: '/sync',
    PULL: '/sync/pull',
    PUSH: '/sync/push',
    BATCH: '/sync/batch',
    CONFLICTS_RESOLVE: '/sync/conflicts/resolve',

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

    // Sync Conflicts
    CONFLICTS: '/sync/conflicts',
    CONFLICTS_UNRESOLVED: '/sync/conflicts/unresolved',
    CONFLICTS_STATS: '/sync/conflicts/stats',
    CONFLICTS_BY_ENTITY: (entityId: string) => `/sync/conflicts/entity/${entityId}`,
    CONFLICT_BY_ID: (uuid: string) => `/sync/conflicts/${uuid}`,
    CONFLICT_RESOLVE: (uuid: string) => `/sync/conflicts/${uuid}/resolve`,
    CONFLICT_DELETE: (uuid: string) => `/sync/conflicts/${uuid}`,
    CONFLICTS_CLEANUP: '/sync/conflicts/cleanup',

    // Sync Metadata
    METADATA: '/sync/metadata',
    METADATA_BULK: '/sync/metadata/bulk',
    LAST_SYNC_TOKEN: '/sync/metadata/last-sync-token',
    SYNC_PROGRESS: '/sync/metadata/sync-progress',
    METADATA_MAP: '/sync/metadata/map',
    METADATA_STATS: '/sync/metadata/stats',
    METADATA_BY_PREFIX: (prefix: string) => `/sync/metadata/prefix/${prefix}`,
    METADATA_BY_PATTERN: (pattern: string) => `/sync/metadata/pattern/${pattern}`,
    METADATA_BY_KEY: (key: string) => `/sync/metadata/${key}`,
    METADATA_UPDATE: (key: string) => `/sync/metadata/${key}`,
    METADATA_UPSERT: (key: string) => `/sync/metadata/${key}/upsert`,
    METADATA_UPDATE_TOKEN: '/sync/metadata/last-sync-token',
    METADATA_INCREMENT: (key: string) => `/sync/metadata/${key}/increment`,
    METADATA_BACKUP: '/sync/metadata/backup',
    METADATA_RESTORE: (backupKey: string) => `/sync/metadata/restore/${backupKey}`,
    METADATA_CLEAR_PREFIX: (prefix: string) => `/sync/metadata/prefix/${prefix}`,
    METADATA_DELETE: (key: string) => `/sync/metadata/${key}`,
  },

  // ============================================
  // Audit Endpoints (audit.routes.ts)
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
    RETENTION_POLICY_BY_ID: (uuid: string) => `/audit/retention-policies/${uuid}`,
    CREATE_RETENTION_POLICY: '/audit/retention-policies',
    UPDATE_RETENTION_POLICY: (uuid: string) => `/audit/retention-policies/${uuid}`,
    DELETE_RETENTION_POLICY: (uuid: string) => `/audit/retention-policies/${uuid}`,
    APPLY_RETENTION: '/audit/apply-retention',
  },

  // ============================================
  // Cache Endpoints (cache.routes.ts)
  // ============================================
  CACHE: {
    BASE: '/cache',
    STATS: '/cache/stats',
    CLEAN_EXPIRED: '/cache/clean-expired',
    CLEAR_ALL: '/cache/clear-all',
    BY_PATTERN: '/cache/pattern',
    BY_TAGS: (tags: string) => `/cache/tags/${tags}`,
    DELETE_BY_TAGS: (tags: string) => `/cache/tags/${tags}`,
    BULK: '/cache/bulk',
    EXISTS: (key: string) => `/cache/${encodeURIComponent(key)}/exists`,
    GET_OR_SET: (key: string) => `/cache/${encodeURIComponent(key)}/get-or-set`,
    BY_KEY: (key: string) => `/cache/${encodeURIComponent(key)}`,
    UPDATE: (key: string) => `/cache/${encodeURIComponent(key)}`,
    DELETE: (key: string) => `/cache/${encodeURIComponent(key)}`,
  },

  // ============================================
  // Dashboard Endpoints (dashboard.routes.ts)
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
    KPIS: (organisationId: string) => `/dashboards/organisations/${organisationId}/kpis`,
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
  // Reports Endpoints (report.routes.ts)
  // ============================================
  REPORTS: {
    BASE: '/reports',
    PUBLIC: '/reports/public',
    STATS: '/reports/stats',
    BY_TYPE: (reportType: string) => `/reports/type/${reportType}`,
    BY_ORGANISATION: (organisationId: string) => `/reports/organisation/${organisationId}`,
    BY_ID: (uuid: string) => `/reports/${uuid}`,
    UPDATE: (uuid: string) => `/reports/${uuid}`,
    DELETE: (uuid: string) => `/reports/${uuid}`,
    GENERATE: (uuid: string) => `/reports/${uuid}/generate`,
    CANCEL: (uuid: string) => `/reports/${uuid}/cancel`,
    SCHEDULE: (uuid: string) => `/reports/${uuid}/schedule`,
    GET_DATA: (uuid: string) => `/reports/${uuid}/data`,
    DELETE_EXPIRED: '/reports/maintenance/delete-expired',
  },
} as const
