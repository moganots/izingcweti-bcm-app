/**
 * Application Constants
 * Centralized constants for the BCM Mobile application
 */

// ============================================
// API Endpoints
// ============================================
export const API_ENDPOINTS = {
  // ============================================
  // Auth Endpoints
  // ============================================
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    VERIFY_RESET_TOKEN: (token: string) => `/auth/verify-reset-token/${token}`,
  },

  // ============================================
  // Users Endpoints
  // ============================================
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
    ACTIVATE: (id: string) => `/users/${id}/activate`,
    CHANGE_PASSWORD: (id: string) => `/users/${id}/change-password`,
    STATS: '/users/stats',
    BULK_IMPORT: '/users/bulk-import',
    EXPORT: '/users/export',
    RESEND_INVITATION: (id: string) => `/users/${id}/resend-invitation`,
    UPDATE_TRAINING: (id: string) => `/users/${id}/training`,
    SEARCH: '/users/search',
  },

  // ============================================
  // Organisations Endpoints
  // ============================================
  ORGANISATIONS: {
    BASE: '/organisations',
    BY_ID: (id: string) => `/organisations/${id}`,
    PERMANENT_DELETE: (id: string) => `/organisations/${id}/permanent`,
    RESTORE: (id: string) => `/organisations/${id}/restore`,
    DASHBOARD: (id: string) => `/organisations/${id}/dashboard`,
    STATS: '/organisations/stats',
    HIERARCHY: (id: string) => `/organisations/${id}/hierarchy`,
    TREE: (id: string) => `/organisations/${id}/tree`,
    VALIDATE_NAME: '/organisations/validate-name',
    INDUSTRY_TYPES: '/organisations/industry-types',
    CRITICALITY_SCORES: '/organisations/criticality-scores',
    SEARCH: '/organisations/search',
    BULK_IMPORT: '/organisations/bulk-import',
    EXPORT: '/organisations/export',
    EXPORT_STRUCTURE: (id: string) => `/organisations/${id}/export-structure`,

    // Business Units
    BUSINESS_UNITS: {
      BASE: '/business-units',
      BY_ID: (id: string) => `/business-units/${id}`,
      CRITICAL: (organisationId: string) =>
        `/organisations/${organisationId}/business-units/critical`,
      SEARCH: '/business-units/search',
      BULK_IMPORT: (organisationId: string) =>
        `/organisations/${organisationId}/business-units/bulk-import`,
      EXPORT: (organisationId: string) => `/organisations/${organisationId}/business-units/export`,
    },

    // Departments
    DEPARTMENTS: {
      BASE: '/departments',
      BY_ID: (id: string) => `/departments/${id}`,
      WITHOUT_BIA: (organisationId: string) =>
        `/organisations/${organisationId}/departments/without-bia`,
      SEARCH: '/departments/search',
      BULK_IMPORT: (businessUnitId: string) =>
        `/business-units/${businessUnitId}/departments/bulk-import`,
      EXPORT: (businessUnitId: string) => `/business-units/${businessUnitId}/departments/export`,
    },
  },

  // ============================================
  // Documents Endpoints
  // ============================================
  DOCUMENTS: {
    BASE: '/documents',
    BY_ID: (id: string) => `/documents/${id}`,
    UPLOAD_VERSION: (id: string) => `/documents/${id}/versions`,
    DOWNLOAD: (id: string) => `/documents/${id}/download`,
    PREVIEW: (id: string) => `/documents/${id}/preview`,
    VERSIONS: (id: string) => `/documents/${id}/versions`,
    RESTORE_VERSION: (id: string) => `/documents/${id}/versions/restore`,
    APPROVE: (id: string) => `/documents/${id}/approve`,
    REJECT: (id: string) => `/documents/${id}/reject`,
    ARCHIVE: (id: string) => `/documents/${id}/archive`,
    PUBLISH: (id: string) => `/documents/${id}/publish`,
    VERIFY: (id: string) => `/documents/${id}/verify`,
    STATS: (organisationId: string) => `/organisations/${organisationId}/documents/stats`,
    SEARCH: '/documents/search',
    TAGS: (id: string) => `/documents/${id}/tags`,
    BULK_DOWNLOAD: '/documents/bulk-download',
  },

  // ============================================
  // BCM Endpoints
  // ============================================
  BCM: {
    // Critical Functions
    CRITICAL_FUNCTIONS: {
      BASE: '/critical-functions',
      BY_ID: (id: string) => `/critical-functions/${id}`,
      BY_DEPARTMENT: (departmentId: string) => `/departments/${departmentId}/critical-functions`,
      BY_ORGANISATION: (organisationId: string) =>
        `/organisations/${organisationId}/critical-functions`,
      SEARCH: '/critical-functions/search',
    },

    // Business Impact Assessments
    BIA: {
      BASE: '/business-impact-assessments',
      BY_ID: (id: string) => `/business-impact-assessments/${id}`,
      BY_FUNCTION: (functionId: string) => `/critical-functions/${functionId}/bia`,
      BY_ORGANISATION: (organisationId: string) => `/organisations/${organisationId}/bia`,
    },

    // Business Continuity Plans
    BCP: {
      BASE: '/business-continuity-plans',
      BY_ID: (id: string) => `/business-continuity-plans/${id}`,
      BY_FUNCTION: (functionId: string) => `/critical-functions/${functionId}/bcp`,
      BY_ORGANISATION: (organisationId: string) => `/organisations/${organisationId}/bcp`,
      APPROVE: (id: string) => `/business-continuity-plans/${id}/approve`,
      REVIEW: (id: string) => `/business-continuity-plans/${id}/review`,
      EXPORT: (id: string) => `/business-continuity-plans/${id}/export`,
    },

    // Recovery Strategies
    RECOVERY_STRATEGIES: {
      BASE: '/recovery-strategies',
      BY_ID: (id: string) => `/recovery-strategies/${id}`,
      BY_BCP: (bcpId: string) => `/business-continuity-plans/${bcpId}/recovery-strategies`,
    },

    // Exercise Tests
    EXERCISE_TESTS: {
      BASE: '/exercise-tests',
      BY_ID: (id: string) => `/exercise-tests/${id}`,
      BY_BCP: (bcpId: string) => `/business-continuity-plans/${bcpId}/exercise-tests`,
      SCHEDULE: (id: string) => `/exercise-tests/${id}/schedule`,
      COMPLETE: (id: string) => `/exercise-tests/${id}/complete`,
    },
  },

  // ============================================
  // Risk Endpoints
  // ============================================
  RISKS: {
    BASE: '/risks',
    BY_ID: (id: string) => `/risks/${id}`,
    BY_ORGANISATION: (organisationId: string) => `/organisations/${organisationId}/risks`,
    BY_CATEGORY: (category: string) => `/risks/category/${category}`,
    MATRIX: (organisationId: string) => `/organisations/${organisationId}/risks/matrix`,
    STATS: (organisationId: string) => `/organisations/${organisationId}/risks/stats`,
    ASSESS: (id: string) => `/risks/${id}/assess`,
    MITIGATE: (id: string) => `/risks/${id}/mitigate`,
    EXPORT: (organisationId: string) => `/organisations/${organisationId}/risks/export`,
    SEARCH: '/risks/search',
  },

  // ============================================
  // Incident Endpoints
  // ============================================
  INCIDENTS: {
    BASE: '/incidents',
    BY_ID: (id: string) => `/incidents/${id}`,
    BY_ORGANISATION: (organisationId: string) => `/organisations/${organisationId}/incidents`,
    BY_SEVERITY: (severity: string) => `/incidents/severity/${severity}`,
    STATS: (organisationId: string) => `/organisations/${organisationId}/incidents/stats`,
    CLOSE: (id: string) => `/incidents/${id}/close`,
    ESCALATE: (id: string) => `/incidents/${id}/escalate`,
    EXPORT: (organisationId: string) => `/organisations/${organisationId}/incidents/export`,
    SEARCH: '/incidents/search',
  },

  // ============================================
  // Workflow Endpoints
  // ============================================
  WORKFLOWS: {
    BASE: '/workflows',
    BY_ID: (id: string) => `/workflows/${id}`,
    MY_WORKFLOWS: '/workflows/my',
    PENDING_APPROVALS: '/workflows/pending-approvals',
    STATS: '/workflows/stats',
    SUBMIT: (id: string) => `/workflows/${id}/submit`,
    APPROVE: (id: string) => `/workflows/${id}/approve`,
    REJECT: (id: string) => `/workflows/${id}/reject`,
    ESCALATE: (id: string) => `/workflows/${id}/escalate`,
    REASSIGN: (id: string) => `/workflows/${id}/reassign`,
    ADD_COMMENT: (id: string) => `/workflows/${id}/comments`,
    BY_ENTITY: (entityType: string, entityId: string) =>
      `/workflows/entity/${entityType}/${entityId}`,
    SEARCH: '/workflows/search',
    EXPORT: '/workflows/export',
  },

  // ============================================
  // Notification Endpoints
  // ============================================
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id: string) => `/notifications/${id}`,
    UNREAD: '/notifications/unread',
    COUNTS: '/notifications/counts',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    PREFERENCES: '/notifications/preferences',
    PREFERENCE_BY_TYPE: (type: string) => `/notifications/preferences/${type}`,
    ARCHIVE: (id: string) => `/notifications/${id}/archive`,
    DISMISS: (id: string) => `/notifications/${id}/dismiss`,
  },

  // ============================================
  // Audit Endpoints
  // ============================================
  AUDIT: {
    BASE: '/audit-logs',
    BY_ID: (id: string) => `/audit-logs/${id}`,
    BY_USER: (userId: string) => `/audit-logs/user/${userId}`,
    BY_ORGANISATION: (organisationId: string) => `/audit-logs/organisation/${organisationId}`,
    BY_ENTITY: (entityType: string, entityId: string) =>
      `/audit-logs/entity/${entityType}/${entityId}`,
    STATS: '/audit-logs/stats',
    EXPORT: '/audit-logs/export',
    RETENTION_POLICIES: '/audit-logs/retention-policies',
    RETENTION_POLICY_BY_ID: (id: string) => `/audit-logs/retention-policies/${id}`,
  },

  // ============================================
  // Compliance Endpoints
  // ============================================
  COMPLIANCE: {
    BASE: '/compliance-records',
    BY_ID: (id: string) => `/compliance-records/${id}`,
    BY_ORGANISATION: (organisationId: string) => `/organisations/${organisationId}/compliance`,
    BY_STANDARD: (standard: string) => `/compliance-records/standard/${standard}`,
    STATS: (organisationId: string) => `/organisations/${organisationId}/compliance/stats`,
    UPDATE_STATUS: (id: string) => `/compliance-records/${id}/status`,
    ADD_EVIDENCE: (id: string) => `/compliance-records/${id}/evidence`,
    REMOVE_EVIDENCE: (id: string) => `/compliance-records/${id}/evidence`,
    SCHEDULE_AUDIT: (id: string) => `/compliance-records/${id}/schedule-audit`,
    BULK_UPDATE: '/compliance-records/bulk-update',
    GAPS: (organisationId: string) => `/organisations/${organisationId}/compliance/gaps`,
    EXPORT: '/compliance-records/export',
    AUDIT_HISTORY: (id: string) => `/compliance-records/${id}/audit-history`,
  },

  // ============================================
  // Settings Endpoints
  // ============================================
  SETTINGS: {
    BASE: '/settings',
    BY_ID: (id: string) => `/settings/${id}`,
    USER: (userId: string) => `/settings/user/${userId}`,
    ORGANISATION: (organisationId: string) => `/settings/organisation/${organisationId}`,
    SYSTEM_DEFAULTS: '/settings/system-defaults',
    RESET_USER: (userId: string) => `/settings/user/${userId}/reset`,
    RESET_ORGANISATION: (organisationId: string) =>
      `/settings/organisation/${organisationId}/reset`,
    PREFERENCE: (userId: string, key: string) => `/settings/user/${userId}/preference/${key}`,
    PREFERENCES_BULK: (userId: string) => `/settings/user/${userId}/preferences/bulk`,
    NOTIFICATION_SETTINGS: (userId: string, type: string) =>
      `/settings/user/${userId}/notifications/${type}`,
    NOTIFICATION_SETTINGS_BULK: (userId: string) => `/settings/user/${userId}/notifications/bulk`,
    THEME_SETTINGS: (userId: string) => `/settings/user/${userId}/theme`,
    LANGUAGE_SETTINGS: (userId: string) => `/settings/user/${userId}/language`,
    SECURITY_SETTINGS: (userId: string) => `/settings/user/${userId}/security`,
    SYNC_SETTINGS: (userId: string) => `/settings/user/${userId}/sync`,
    TWO_FACTOR: (userId: string) => `/settings/user/${userId}/two-factor`,
    VERIFY_TWO_FACTOR: (userId: string) => `/settings/user/${userId}/two-factor/verify`,
    TRIGGER_SYNC: (userId: string) => `/settings/user/${userId}/sync/trigger`,
    BULK_UPDATE: '/settings/bulk',
    VALIDATE: '/settings/validate',
    TEMPLATES: '/settings/templates',
    TEMPLATE_BY_ID: (id: string) => `/settings/templates/${id}`,
    APPLY_TEMPLATE: (templateId: string) => `/settings/templates/${templateId}/apply`,
    AVAILABLE_THEMES: '/settings/themes',
    AVAILABLE_LOCALES: '/settings/locales',
    EXPORT: '/settings/export',
    IMPORT: '/settings/import',
  },

  // ============================================
  // Rules Endpoints
  // ============================================
  RULES: {
    BASE: '/rules',
    BY_ID: (id: string) => `/rules/${id}`,
    BY_TYPE: (type: string) => `/rules/type/${type}`,
    BY_ENTITY: (entityType: string) => `/rules/entity/${entityType}`,
    ACTIVE: '/rules/active',
    STATS: '/rules/stats',
    TEST: '/rules/test',
    EXECUTE: (id: string) => `/rules/${id}/execute`,
    TOGGLE: (id: string) => `/rules/${id}/toggle`,
    EXECUTION_LOGS: (id: string) => `/rules/${id}/logs`,
    VALIDATE: '/rules/validate',
    SEARCH: '/rules/search',
    EXPORT: '/rules/export',
    IMPORT: '/rules/import',
  },

  // ============================================
  // Sync Endpoints
  // ============================================
  SYNC: {
    PULL: '/sync/pull',
    PUSH: '/sync/push',
    CONFLICTS: '/sync/conflicts',
    RESOLVE_CONFLICT: (id: string) => `/sync/conflicts/${id}/resolve`,
    PENDING_CHANGES: '/sync/pending-changes',
    CLEAR_PENDING: '/sync/pending-changes/clear',
    STATUS: '/sync/status',
    METADATA: '/sync/metadata',
    METADATA_BY_KEY: (key: string) => `/sync/metadata/${key}`,
  },

  // ============================================
  // Cache Endpoints
  // ============================================
  CACHE: {
    BASE: '/cache',
    BY_KEY: (key: string) => `/cache/${encodeURIComponent(key)}`,
    CLEAR: '/cache/clear',
    CLEAR_BY_TAGS: '/cache/clear-by-tags',
    STATS: '/cache/stats',
    KEYS: '/cache/keys',
    KEYS_BY_PATTERN: (pattern: string) => `/cache/keys/${encodeURIComponent(pattern)}`,
    BULK: '/cache/bulk',
  },

  // ============================================
  // Dashboard Endpoints
  // ============================================
  DASHBOARD: {
    KPI_METRICS: (orgId: string) => `/dashboard/${orgId}/kpi-metrics`,
    RISK_SUMMARY: (orgId: string) => `/dashboard/${orgId}/risk-summary`,
    BCM_SUMMARY: (orgId: string) => `/dashboard/${orgId}/bcm-summary`,
    INCIDENT_SUMMARY: (orgId: string) => `/dashboard/${orgId}/incident-summary`,
    COMPLIANCE_SUMMARY: (orgId: string) => `/dashboard/${orgId}/compliance-summary`,
    WORKFLOW_SUMMARY: (orgId: string) => `/dashboard/${orgId}/workflow-summary`,
    RECENT_ACTIVITY: (orgId: string) => `/dashboard/${orgId}/recent-activity`,
    UPCOMING_TASKS: (orgId: string) => `/dashboard/${orgId}/upcoming-tasks`,
    RISK_TRENDS: (orgId: string) => `/dashboard/${orgId}/risk-trends`,
    COMPLIANCE_OVERVIEW: (orgId: string) => `/dashboard/${orgId}/compliance-overview`,
  },

  // ============================================
  // Reports Endpoints
  // ============================================
  REPORTS: {
    BASE: '/reports',
    BY_ID: (id: string) => `/reports/${id}`,
    GENERATE: '/reports/generate',
    SCHEDULE: '/reports/schedule',
    SCHEDULED: '/reports/scheduled',
    SCHEDULED_BY_ID: (id: string) => `/reports/scheduled/${id}`,
    TEMPLATES: '/reports/templates',
    TEMPLATE_BY_ID: (id: string) => `/reports/templates/${id}`,
    EXPORT: (id: string) => `/reports/${id}/export`,
    DOWNLOAD: (id: string, format: string) => `/reports/${id}/download/${format}`,
    RISK_REPORT: (organisationId: string) => `/reports/risk/${organisationId}`,
    COMPLIANCE_REPORT: (organisationId: string) => `/reports/compliance/${organisationId}`,
    INCIDENT_REPORT: (organisationId: string) => `/reports/incident/${organisationId}`,
    BCM_MATURITY_REPORT: (organisationId: string) => `/reports/bcm-maturity/${organisationId}`,
    AUDIT_REPORT: (organisationId: string) => `/reports/audit/${organisationId}`,
  },

  // ============================================
  // Training Endpoints
  // ============================================
  TRAINING: {
    BASE: '/training',
    COURSES: '/training/courses',
    COURSE_BY_ID: (id: string) => `/training/courses/${id}`,
    MY_COURSES: '/training/my-courses',
    ASSIGNED: '/training/assigned',
    ENROLL: (courseId: string) => `/training/courses/${courseId}/enroll`,
    PROGRESS: (courseId: string) => `/training/courses/${courseId}/progress`,
    COMPLETE: (courseId: string) => `/training/courses/${courseId}/complete`,
    CERTIFICATE: (courseId: string) => `/training/courses/${courseId}/certificate`,
    STATS: '/training/stats',
    MATERIALS: (courseId: string) => `/training/courses/${courseId}/materials`,
    MATERIAL_BY_ID: (courseId: string, materialId: string) =>
      `/training/courses/${courseId}/materials/${materialId}`,
    QUIZZES: (courseId: string) => `/training/courses/${courseId}/quizzes`,
    SUBMIT_QUIZ: (courseId: string, quizId: string) =>
      `/training/courses/${courseId}/quizzes/${quizId}/submit`,
  },

  // ============================================
  // Services Endpoints (Microservices)
  // ============================================
  SERVICES: {
    // File Service
    FILES: {
      BASE: '/services/files',
      UPLOAD: '/services/files/upload',
      UPLOAD_CHUNK: '/services/files/upload-chunk',
      DOWNLOAD: (fileId: string) => `/services/files/${fileId}/download`,
      DELETE: (fileId: string) => `/services/files/${fileId}`,
      METADATA: (fileId: string) => `/services/files/${fileId}/metadata`,
      PROCESS: (fileId: string) => `/services/files/${fileId}/process`,
      CONVERT: (fileId: string) => `/services/files/${fileId}/convert`,
      THUMBNAIL: (fileId: string) => `/services/files/${fileId}/thumbnail`,
      OPTIMIZE: (fileId: string) => `/services/files/${fileId}/optimize`,
      SCAN_VIRUS: (fileId: string) => `/services/files/${fileId}/scan`,
    },

    // Email Service
    EMAIL: {
      BASE: '/services/email',
      SEND: '/services/email/send',
      SEND_BULK: '/services/email/send-bulk',
      SEND_TEMPLATE: '/services/email/send-template',
      TEMPLATES: '/services/email/templates',
      TEMPLATE_BY_ID: (id: string) => `/services/email/templates/${id}`,
      TRACK: (messageId: string) => `/services/email/track/${messageId}`,
      STATUS: (messageId: string) => `/services/email/status/${messageId}`,
      QUEUE: '/services/email/queue',
      QUEUE_BY_ID: (id: string) => `/services/email/queue/${id}`,
    },

    // SMS Service
    SMS: {
      BASE: '/services/sms',
      SEND: '/services/sms/send',
      SEND_BULK: '/services/sms/send-bulk',
      STATUS: (messageId: string) => `/services/sms/status/${messageId}`,
      BALANCE: '/services/sms/balance',
      SENDER_IDS: '/services/sms/sender-ids',
      LOGS: '/services/sms/logs',
      QUEUE: '/services/sms/queue',
    },

    // Push Notification Service
    PUSH: {
      BASE: '/services/push',
      SEND: '/services/push/send',
      SEND_BULK: '/services/push/send-bulk',
      REGISTER: '/services/push/register',
      UNREGISTER: (deviceId: string) => `/services/push/devices/${deviceId}`,
      DEVICES: '/services/push/devices',
      TOPICS: '/services/push/topics',
      SUBSCRIBE: (topic: string) => `/services/push/topics/${topic}/subscribe`,
      UNSUBSCRIBE: (topic: string) => `/services/push/topics/${topic}/unsubscribe`,
    },

    // PDF Service
    PDF: {
      BASE: '/services/pdf',
      GENERATE: '/services/pdf/generate',
      GENERATE_FROM_HTML: '/services/pdf/generate-from-html',
      GENERATE_FROM_TEMPLATE: '/services/pdf/generate-from-template',
      MERGE: '/services/pdf/merge',
      SPLIT: '/services/pdf/split',
      EXTRACT_TEXT: (pdfId: string) => `/services/pdf/${pdfId}/extract-text`,
      CONVERT: (pdfId: string) => `/services/pdf/${pdfId}/convert`,
      WATERMARK: (pdfId: string) => `/services/pdf/${pdfId}/watermark`,
      SIGN: (pdfId: string) => `/services/pdf/${pdfId}/sign`,
      VERIFY_SIGNATURE: (pdfId: string) => `/services/pdf/${pdfId}/verify`,
      COMPRESS: (pdfId: string) => `/services/pdf/${pdfId}/compress`,
      TEMPLATES: '/services/pdf/templates',
      TEMPLATE_BY_ID: (id: string) => `/services/pdf/templates/${id}`,
    },

    // Export Service
    EXPORT: {
      BASE: '/services/export',
      CSV: '/services/export/csv',
      EXCEL: '/services/export/excel',
      JSON: '/services/export/json',
      STATUS: (jobId: string) => `/services/export/status/${jobId}`,
      DOWNLOAD: (jobId: string) => `/services/export/download/${jobId}`,
      CANCEL: (jobId: string) => `/services/export/cancel/${jobId}`,
      JOBS: '/services/export/jobs',
    },

    // Import Service
    IMPORT: {
      BASE: '/services/import',
      UPLOAD: '/services/import/upload',
      VALIDATE: '/services/import/validate',
      PROCESS: (jobId: string) => `/services/import/process/${jobId}`,
      STATUS: (jobId: string) => `/services/import/status/${jobId}`,
      MAPPING: '/services/import/mapping',
      MAPPING_BY_ID: (id: string) => `/services/import/mapping/${id}`,
      TEMPLATES: '/services/import/templates',
      JOBS: '/services/import/jobs',
      JOB_BY_ID: (jobId: string) => `/services/import/jobs/${jobId}`,
    },

    // Search Service
    SEARCH: {
      BASE: '/services/search',
      INDEX: '/services/search/index',
      QUERY: '/services/search/query',
      ADVANCED: '/services/search/advanced',
      SUGGEST: '/services/search/suggest',
      FILTERS: '/services/search/filters',
      REINDEX: '/services/search/reindex',
      STATUS: '/services/search/status',
      DOCUMENT: (documentId: string) => `/services/search/documents/${documentId}`,
      BULK_INDEX: '/services/search/bulk-index',
    },

    // Analytics Service
    ANALYTICS: {
      BASE: '/services/analytics',
      EVENTS: '/services/analytics/events',
      TRACK: '/services/analytics/track',
      PAGE_VIEW: '/services/analytics/page-view',
      USER_SESSION: '/services/analytics/session',
      DASHBOARD: '/services/analytics/dashboard',
      METRICS: '/services/analytics/metrics',
      REPORTS: '/services/analytics/reports',
      EXPORT: '/services/analytics/export',
      FUNNEL: '/services/analytics/funnel',
      RETENTION: '/services/analytics/retention',
    },

    // Geo Service
    GEO: {
      BASE: '/services/geo',
      IP_LOOKUP: '/services/geo/ip',
      LOCATION: '/services/geo/location',
      REVERSE_GEOCODE: '/services/geo/reverse',
      DISTANCE: '/services/geo/distance',
      BOUNDING_BOX: '/services/geo/bounding-box',
      NEARBY: '/services/geo/nearby',
      TIMEZONE: '/services/geo/timezone',
      COUNTRY_INFO: (countryCode: string) => `/services/geo/countries/${countryCode}`,
      COUNTRIES: '/services/geo/countries',
      CITIES: '/services/geo/cities',
    },

    // Notification Service (Aggregator)
    NOTIFICATION_SERVICE: {
      BASE: '/services/notification-service',
      SEND: '/services/notification-service/send',
      SEND_BULK: '/services/notification-service/send-bulk',
      PREFERENCES: '/services/notification-service/preferences',
      CHANNELS: '/services/notification-service/channels',
      TEMPLATES: '/services/notification-service/templates',
      LOGS: '/services/notification-service/logs',
      STATS: '/services/notification-service/stats',
      QUEUE: '/services/notification-service/queue',
      BROADCAST: '/services/notification-service/broadcast',
    },

    // Webhook Service
    WEBHOOK: {
      BASE: '/services/webhooks',
      REGISTER: '/services/webhooks/register',
      UNREGISTER: (webhookId: string) => `/services/webhooks/${webhookId}`,
      EVENTS: '/services/webhooks/events',
      DELIVERY_LOGS: '/services/webhooks/delivery-logs',
      RETRY: (deliveryId: string) => `/services/webhooks/delivery-logs/${deliveryId}/retry`,
      SECRETS: '/services/webhooks/secrets',
      STATS: '/services/webhooks/stats',
    },

    // Audit Service (Centralized)
    AUDIT_SERVICE: {
      BASE: '/services/audit-service',
      LOG: '/services/audit-service/log',
      BULK_LOG: '/services/audit-service/bulk-log',
      QUERY: '/services/audit-service/query',
      EXPORT: '/services/audit-service/export',
      STATS: '/services/audit-service/stats',
      RETENTION: '/services/audit-service/retention',
      SCHEMA: '/services/audit-service/schema',
    },

    // Report Service (Advanced)
    REPORT_SERVICE: {
      BASE: '/services/report-service',
      GENERATE: '/services/report-service/generate',
      SCHEDULE: '/services/report-service/schedule',
      TEMPLATES: '/services/report-service/templates',
      DATA_SOURCES: '/services/report-service/data-sources',
      VISUALIZATIONS: '/services/report-service/visualizations',
      EXPORT: '/services/report-service/export',
      DASHBOARDS: '/services/report-service/dashboards',
      DASHBOARD_BY_ID: (id: string) => `/services/report-service/dashboards/${id}`,
      WIDGETS: '/services/report-service/widgets',
      SCHEDULED_JOBS: '/services/report-service/scheduled-jobs',
    },

    // Workflow Service (Orchestration)
    WORKFLOW_SERVICE: {
      BASE: '/services/workflow-service',
      DEFINITIONS: '/services/workflow-service/definitions',
      DEFINITION_BY_ID: (id: string) => `/services/workflow-service/definitions/${id}`,
      INSTANCES: '/services/workflow-service/instances',
      INSTANCE_BY_ID: (id: string) => `/services/workflow-service/instances/${id}`,
      TASKS: '/services/workflow-service/tasks',
      TASK_BY_ID: (id: string) => `/services/workflow-service/tasks/${id}`,
      COMPLETE_TASK: (taskId: string) => `/services/workflow-service/tasks/${taskId}/complete`,
      CLAIM_TASK: (taskId: string) => `/services/workflow-service/tasks/${taskId}/claim`,
      VARIABLES: (instanceId: string) =>
        `/services/workflow-service/instances/${instanceId}/variables`,
      HISTORY: '/services/workflow-service/history',
    },

    // Integration Service
    INTEGRATION: {
      BASE: '/services/integrations',
      LIST: '/services/integrations',
      BY_ID: (id: string) => `/services/integrations/${id}`,
      CONNECT: (id: string) => `/services/integrations/${id}/connect`,
      DISCONNECT: (id: string) => `/services/integrations/${id}/disconnect`,
      SYNC: (id: string) => `/services/integrations/${id}/sync`,
      WEBHOOKS: (id: string) => `/services/integrations/${id}/webhooks`,
      CREDENTIALS: (id: string) => `/services/integrations/${id}/credentials`,
      STATUS: (id: string) => `/services/integrations/${id}/status`,
      LOGS: (id: string) => `/services/integrations/${id}/logs`,
      AVAILABLE: '/services/integrations/available',
    },
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
