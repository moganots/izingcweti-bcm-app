export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  METERED = 'metered',
  SLOW = 'slow',
}

export enum PlatformType {
  WEB = 'web',
  IOS = 'ios',
  ANDROID = 'android',
  DESKTOP = 'desktop',
}

export enum Environment {
  LOCAL = 'local',
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

export enum EntityType {
  ORGANISATION = 'organisation',
  BUSINESS_UNIT = 'business_unit',
  DEPARTMENT = 'department',
  USER = 'user',
  CRITICAL_FUNCTION = 'critical_function',
  RISK = 'risk',
  BUSINESS_IMPACT_ASSESSMENT = 'business_impact_assessment',
  BUSINESS_CONTINUITY_PLAN = 'business_continuity_plan',
  RECOVERY_STRATEGY = 'recovery_strategy',
  INCIDENT = 'incident',
  EXERCISE_TEST = 'exercise_test',
  AUDIT_LOG = 'audit_log',
  COMPLIANCE_RECORD = 'compliance_record',
  DOCUMENT = 'document',
  NOTIFICATION = 'notification',
  WORKFLOW = 'workflow',
  TENANT = 'tenant',
  RULE = 'rule',
  FEATURE_TOGGLE = 'feature_toggle',
  REPORT = 'report',
  SETTINGS = 'settings',
  CACHE = 'cache',
  AUTH_TOKEN = 'auth_token',
  SYNC_METADATA = 'sync_metadata',
  SYNC_CONFLICT = 'sync_conflict',
  PENDING_CHANGE = 'pending_change',
}

export enum StorageQuotaLevel {
  NORMAL = 'normal',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
}

export enum ContentType {
  JSON = 'application/json',
  FORM_DATA = 'multipart/form-data',
  FORM_URLENCODED = 'application/x-www-form-urlencoded',
  TEXT = 'text/plain',
  CSV = 'text/csv',
  PDF = 'application/pdf',
  OCTET_STREAM = 'application/octet-stream',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  PDF = 'pdf',
  EXCEL = 'excel',
}

export enum DateRangePreset {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  THIS_WEEK = 'this_week',
  LAST_WEEK = 'last_week',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  THIS_QUARTER = 'this_quarter',
  LAST_QUARTER = 'last_quarter',
  THIS_YEAR = 'this_year',
  LAST_YEAR = 'last_year',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
}

export interface RecentActivity {
  id: string
  type: string
  action: string
  description: string
  user: {
    uuid: string
    email: string
  }
  timestamp: string
  entity_type: string
  entity_id: string
}
