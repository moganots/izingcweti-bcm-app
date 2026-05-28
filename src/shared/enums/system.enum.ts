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
}
