export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 100,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
    MAX_LENGTH: 255,
  },
  UUID: {
    PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  },
  PHONE: {
    PATTERN: /^\+?[1-9]\d{1,14}$/,
  },
  URL: {
    PATTERN: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  },
  RISK_SCORE: {
    MIN: 0,
    MAX: 25,
  },
  LIKELIHOOD: {
    MIN: 0,
    MAX: 5,
  },
  IMPACT: {
    MIN: 0,
    MAX: 5,
  },
  RTO_HOURS: {
    MIN: 0,
    MAX: 168,
  },
  RPO_HOURS: {
    MIN: 0,
    MAX: 168,
  },
  FILE_SIZE_MB: {
    MAX: 50,
  },
} as const

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  EMAIL_EXISTS: 'Email already exists',
  PASSWORD_MIN_LENGTH: `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`,
  PASSWORD_PATTERN: 'Password must contain uppercase, lowercase, number and special character',
  PASSWORDS_MATCH: 'Passwords do not match',
  UUID: 'Invalid ID format',
  PHONE: 'Please enter a valid phone number',
  URL: 'Please enter a valid URL',
  RISK_SCORE: `Risk score must be between ${VALIDATION_RULES.RISK_SCORE.MIN} and ${VALIDATION_RULES.RISK_SCORE.MAX}`,
  LIKELIHOOD: `Likelihood must be between ${VALIDATION_RULES.LIKELIHOOD.MIN} and ${VALIDATION_RULES.LIKELIHOOD.MAX}`,
  IMPACT: `Impact must be between ${VALIDATION_RULES.IMPACT.MIN} and ${VALIDATION_RULES.IMPACT.MAX}`,
  RTO: `RTO must be between ${VALIDATION_RULES.RTO_HOURS.MIN} and ${VALIDATION_RULES.RTO_HOURS.MAX} hours`,
  RPO: `RPO must be between ${VALIDATION_RULES.RPO_HOURS.MIN} and ${VALIDATION_RULES.RPO_HOURS.MAX} hours`,
  FILE_SIZE: `File size must not exceed ${VALIDATION_RULES.FILE_SIZE_MB.MAX}MB`,
  INVALID_FILE_TYPE: 'Invalid file type',
  DATE_RANGE: 'End date must be after start date',
} as const
