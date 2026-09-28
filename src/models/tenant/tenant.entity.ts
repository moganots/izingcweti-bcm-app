import type { BaseEntity } from "../../core/base/base.entity";
import type { Organisation } from "../organisation/organisation.entity";
import type { User } from "../user/user.entity";

// ============================================
// Tenant Module - Enums (Aligned with Backend)
// ============================================

/**
 * Tenant Status Enum
 * Backend: src/types/enums/tenant.enum.ts
 */
export enum TenantStatus {
    PENDING = "Pending",
    ACTIVE = "Active",
    SUSPENDED = "Suspended",
    INACTIVE = "Inactive",
    TRIAL = "Trial",
    EXPIRED = "Expired",
    CANCELLED = "Cancelled",
    PROVISIONING = "Provisioning",
    DEPROVISIONING = "Deprovisioning",
    MAINTENANCE = "Maintenance",
}

/**
 * Tenant Tier Enum
 */
export enum TenantTier {
    FREE = "Free",
    BASIC = "Basic",
    STANDARD = "Standard",
    PROFESSIONAL = "Professional",
    ENTERPRISE = "Enterprise",
    PREMIUM = "Premium",
    CUSTOM = "Custom",
}

/**
 * AWS Region Enum
 */
export enum AwsRegion {
    US_EAST_1 = "us-east-1",
    US_EAST_2 = "us-east-2",
    US_WEST_1 = "us-west-1",
    US_WEST_2 = "us-west-2",
    EU_WEST_1 = "eu-west-1",
    EU_WEST_2 = "eu-west-2",
    EU_CENTRAL_1 = "eu-central-1",
    AP_SOUTHEAST_1 = "ap-southeast-1",
    AP_SOUTHEAST_2 = "ap-southeast-2",
    AP_NORTHEAST_1 = "ap-northeast-1",
    AP_SOUTH_1 = "ap-south-1",
    SA_EAST_1 = "sa-east-1",
    AF_SOUTH_1 = "af-south-1",
    ME_SOUTH_1 = "me-south-1",
}

/**
 * Tenant Audit Action Enum
 */
export enum TenantAuditAction {
    CREATED = "Created",
    UPDATED = "Updated",
    ACTIVATED = "Activated",
    DEACTIVATED = "Deactivated",
    SUSPENDED = "Suspended",
    REACTIVATED = "Reactivated",
    TIER_CHANGED = "TierChanged",
    FEATURE_ENABLED = "FeatureEnabled",
    FEATURE_DISABLED = "FeatureDisabled",
    QUOTA_UPDATED = "QuotaUpdated",
    CONFIG_UPDATED = "ConfigUpdated",
    DOMAIN_UPDATED = "DomainUpdated",
    BILLING_UPDATED = "BillingUpdated",
    SUBSCRIPTION_CHANGED = "SubscriptionChanged",
    DATA_EXPORTED = "DataExported",
    DATA_DELETED = "DataDeleted",
    BACKUP_CREATED = "BackupCreated",
    RESTORE_COMPLETED = "RestoreCompleted",
    DELETED = "Deleted",
}

/**
 * Tenant Feature Enum
 */
export enum TenantFeature {
    BASIC = "basic",
    BCM = "bcm",
    RISK_MANAGEMENT = "riskManagement",
    COMPLIANCE = "compliance",
    DOCUMENT_MANAGEMENT = "documentManagement",
    TRAINING = "training",
    REPORTING = "reporting",
    WORKFLOW = "workflow",
    NOTIFICATIONS = "notifications",
    API_ACCESS = "apiAccess",
    SSO = "sso",
    MFA = "mfa",
    AUDIT_LOGS = "auditLogs",
    DATA_EXPORT = "dataExport",
    CUSTOM_BRANDING = "customBranding",
    ADVANCED_ANALYTICS = "advancedAnalytics",
    INTEGRATIONS = "integrations",
    PRIORITY_SUPPORT = "prioritySupport",
    DEDICATED_INSTANCE = "dedicatedInstance",
}

// ============================================
// Tenant Module - Embedded Types (JSONB)
// ============================================

/**
 * Tenant Resource Quotas
 */
export interface TenantResourceQuotas {
    maxUsers?: number;
    maxOrganisations?: number;
    maxStorageGb?: number;
    maxApiCallsPerDay?: number;
    maxReportsPerMonth?: number;
    maxWorkflowsPerMonth?: number;
    maxDocuments?: number;
    maxTrainingCourses?: number;
    maxActiveIncidents?: number;
    maxDataRetentionDays?: number;
}

/**
 * AWS Resources
 */
export interface AwsResources {
    vpcId?: string;
    subnetIds?: string[];
    securityGroupIds?: string[];
    rdsInstanceId?: string;
    s3BucketName?: string;
    cloudFrontDistributionId?: string;
    lambdaFunctionArns?: string[];
    sqsQueueUrls?: string[];
    snsTopicArns?: string[];
    elasticacheClusterId?: string;
    secretsManagerArns?: string[];
}

/**
 * Tenant Configuration
 */
export interface TenantConfig {
    timezone?: string;
    locale?: string;
    dateFormat?: string;
    timeFormat?: string;
    currency?: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    customDomain?: string;
    ssoEnabled?: boolean;
    ssoProvider?: string;
    mfaRequired?: boolean;
    sessionTimeoutMinutes?: number;
    passwordPolicy?: {
        minLength?: number;
        requireUppercase?: boolean;
        requireLowercase?: boolean;
        requireNumbers?: boolean;
        requireSpecialChars?: boolean;
        expirationDays?: number;
        historyCount?: number;
    };
    emailSettings?: {
        fromAddress?: string;
        fromName?: string;
        replyToAddress?: string;
    };
    notificationSettings?: {
        emailEnabled?: boolean;
        smsEnabled?: boolean;
        pushEnabled?: boolean;
    };
    backupSettings?: {
        enabled?: boolean;
        frequency?: "daily" | "weekly" | "monthly";
        retentionDays?: number;
        lastBackupAt?: string;
    };
}

// ============================================
// Tenant Entity - Aligned with Backend
// Backend: src/modules/tenant/models/entities/tenant.entity.ts
// ============================================

export interface Tenant extends BaseEntity {
    name: string;
    domainPrefix: string;
    customDomain?: string;
    email: string;
    status: TenantStatus;
    tier: TenantTier;
    primaryRegion: AwsRegion;
    awsAccountId?: string;
    awsResources?: AwsResources;
    resourceQuotas?: TenantResourceQuotas;
    config?: TenantConfig;
    features?: TenantFeature[];
    billingEmail?: string;
    subscriptionId?: string;
    subscriptionEndDate?: Date;
    dataIsolationEnabled: boolean;
    encryptionEnabled: boolean;
    encryptionKeyArn?: string;
    lastBackupAt?: Date;
    tags?: Record<string, string>;

    // Relationships
    organisations?: Organisation[];
}

// ============================================
// Tenant Audit Log Entity - Aligned with Backend
// Backend: src/modules/tenant/models/entities/tenant-audit-log.entity.ts
// ============================================

export interface TenantAuditLog extends BaseEntity {
    tenantId: string;
    action: TenantAuditAction;
    performedBy: string;
    oldValue?: any;
    newValue?: any;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;

    // Relationships
    tenant?: Tenant;
    performer?: User;
}

// ============================================
// Tenant Helper Functions (Computed Properties)
// ============================================

export const TenantHelpers = {
    /**
     * Check if tenant is active
     */
    isActive: (tenant: Tenant): boolean => {
        return tenant.status === TenantStatus.ACTIVE;
    },

    /**
     * Check if tenant is in trial period
     */
    isTrial: (tenant: Tenant): boolean => {
        return tenant.status === TenantStatus.TRIAL;
    },

    /**
     * Check if tenant subscription is expired
     */
    isSubscriptionExpired: (tenant: Tenant): boolean => {
        if (!tenant.subscriptionEndDate) return false;
        return tenant.subscriptionEndDate < new Date();
    },

    /**
     * Get days until subscription expires
     */
    daysUntilSubscriptionExpires: (tenant: Tenant): number | null => {
        if (!tenant.subscriptionEndDate) return null;
        const now = new Date();
        if (now >= tenant.subscriptionEndDate) return 0;
        return Math.ceil(
            (tenant.subscriptionEndDate.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        );
    },

    /**
     * Check if tenant has a specific feature
     */
    hasFeature: (tenant: Tenant, feature: TenantFeature): boolean => {
        return tenant.features?.includes(feature) ?? false;
    },

    /**
     * Check if tenant can add more users
     */
    canAddUser: (tenant: Tenant, currentUserCount: number): boolean => {
        if (!tenant.resourceQuotas?.maxUsers) return true;
        return currentUserCount < tenant.resourceQuotas.maxUsers;
    },

    /**
     * Get remaining user quota
     */
    remainingUserQuota: (
        tenant: Tenant,
        currentUserCount: number
    ): number | null => {
        if (!tenant.resourceQuotas?.maxUsers) return null;
        return Math.max(0, tenant.resourceQuotas.maxUsers - currentUserCount);
    },

    /**
     * Get quota usage percentage
     */
    getUserQuotaUsagePercentage: (
        tenant: Tenant,
        currentUserCount: number
    ): number => {
        if (!tenant.resourceQuotas?.maxUsers) return 0;
        return Math.min(
            100,
            Math.round((currentUserCount / tenant.resourceQuotas.maxUsers) * 100)
        );
    },

    /**
     * Check if tenant is on enterprise tier
     */
    isEnterprise: (tenant: Tenant): boolean => {
        return (
            tenant.tier === TenantTier.ENTERPRISE ||
            tenant.tier === TenantTier.PREMIUM
        );
    },

    /**
     * Get organisation count
     */
    organisationCount: (tenant: Tenant): number => {
        return tenant.organisations?.length ?? 0;
    },

    /**
     * Check if backup is overdue
     */
    isBackupOverdue: (tenant: Tenant, daysThreshold: number = 7): boolean => {
        if (!tenant.lastBackupAt) return true;
        const now = new Date();
        const diffDays = Math.floor(
            (now.getTime() - tenant.lastBackupAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return diffDays > daysThreshold;
    },

    /**
     * Get full domain URL
     */
    getDomainUrl: (tenant: Tenant): string => {
        if (tenant.customDomain) {
            return `https://${tenant.customDomain}`;
        }
        return `https://${tenant.domainPrefix}.bcm.app`;
    },

    /**
     * Check if tenant is in a healthy state
     */
    isHealthy: (tenant: Tenant): boolean => {
        const healthyStatuses = [
            TenantStatus.ACTIVE,
            TenantStatus.TRIAL,
        ];
        return (
            healthyStatuses.includes(tenant.status) &&
            !TenantHelpers.isSubscriptionExpired(tenant)
        );
    },
};

// ============================================
// Tenant Status Helpers - Labels & Colors
// ============================================

export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
    [TenantStatus.PENDING]: "Pending",
    [TenantStatus.ACTIVE]: "Active",
    [TenantStatus.SUSPENDED]: "Suspended",
    [TenantStatus.INACTIVE]: "Inactive",
    [TenantStatus.TRIAL]: "Trial",
    [TenantStatus.EXPIRED]: "Expired",
    [TenantStatus.CANCELLED]: "Cancelled",
    [TenantStatus.PROVISIONING]: "Provisioning",
    [TenantStatus.DEPROVISIONING]: "Deprovisioning",
    [TenantStatus.MAINTENANCE]: "Maintenance",
};

export const TENANT_STATUS_COLORS: Record<TenantStatus, string> = {
    [TenantStatus.PENDING]: "warning",
    [TenantStatus.ACTIVE]: "positive",
    [TenantStatus.SUSPENDED]: "negative",
    [TenantStatus.INACTIVE]: "grey",
    [TenantStatus.TRIAL]: "info",
    [TenantStatus.EXPIRED]: "red",
    [TenantStatus.CANCELLED]: "grey-7",
    [TenantStatus.PROVISIONING]: "blue",
    [TenantStatus.DEPROVISIONING]: "orange",
    [TenantStatus.MAINTENANCE]: "purple",
};

export const TENANT_STATUS_ICONS: Record<TenantStatus, string> = {
    [TenantStatus.PENDING]: "hourglass_empty",
    [TenantStatus.ACTIVE]: "check_circle",
    [TenantStatus.SUSPENDED]: "block",
    [TenantStatus.INACTIVE]: "pause_circle",
    [TenantStatus.TRIAL]: "card_giftcard",
    [TenantStatus.EXPIRED]: "event_busy",
    [TenantStatus.CANCELLED]: "cancel",
    [TenantStatus.PROVISIONING]: "sync",
    [TenantStatus.DEPROVISIONING]: "sync_disabled",
    [TenantStatus.MAINTENANCE]: "build",
};

export function getTenantStatusLabel(status: TenantStatus): string {
    return TENANT_STATUS_LABELS[status] || status;
}

export function getTenantStatusColor(status: TenantStatus): string {
    return TENANT_STATUS_COLORS[status] || "grey";
}

export function getTenantStatusIcon(status: TenantStatus): string {
    return TENANT_STATUS_ICONS[status] || "help";
}

// ============================================
// Tenant Tier Helpers - Labels & Colors
// ============================================

export const TENANT_TIER_LABELS: Record<TenantTier, string> = {
    [TenantTier.FREE]: "Free",
    [TenantTier.BASIC]: "Basic",
    [TenantTier.STANDARD]: "Standard",
    [TenantTier.PROFESSIONAL]: "Professional",
    [TenantTier.ENTERPRISE]: "Enterprise",
    [TenantTier.PREMIUM]: "Premium",
    [TenantTier.CUSTOM]: "Custom",
};

export const TENANT_TIER_COLORS: Record<TenantTier, string> = {
    [TenantTier.FREE]: "grey",
    [TenantTier.BASIC]: "blue",
    [TenantTier.STANDARD]: "teal",
    [TenantTier.PROFESSIONAL]: "purple",
    [TenantTier.ENTERPRISE]: "orange",
    [TenantTier.PREMIUM]: "deep-orange",
    [TenantTier.CUSTOM]: "indigo",
};

export const TENANT_TIER_ICONS: Record<TenantTier, string> = {
    [TenantTier.FREE]: "star_border",
    [TenantTier.BASIC]: "star_half",
    [TenantTier.STANDARD]: "star",
    [TenantTier.PROFESSIONAL]: "workspace_premium",
    [TenantTier.ENTERPRISE]: "business",
    [TenantTier.PREMIUM]: "diamond",
    [TenantTier.CUSTOM]: "settings",
};

export function getTenantTierLabel(tier: TenantTier): string {
    return TENANT_TIER_LABELS[tier] || tier;
}

export function getTenantTierColor(tier: TenantTier): string {
    return TENANT_TIER_COLORS[tier] || "grey";
}

export function getTenantTierIcon(tier: TenantTier): string {
    return TENANT_TIER_ICONS[tier] || "help";
}

// ============================================
// AWS Region Helpers - Labels
// ============================================

export const AWS_REGION_LABELS: Record<AwsRegion, string> = {
    [AwsRegion.US_EAST_1]: "US East (N. Virginia)",
    [AwsRegion.US_EAST_2]: "US East (Ohio)",
    [AwsRegion.US_WEST_1]: "US West (N. California)",
    [AwsRegion.US_WEST_2]: "US West (Oregon)",
    [AwsRegion.EU_WEST_1]: "EU (Ireland)",
    [AwsRegion.EU_WEST_2]: "EU (London)",
    [AwsRegion.EU_CENTRAL_1]: "EU (Frankfurt)",
    [AwsRegion.AP_SOUTHEAST_1]: "Asia Pacific (Singapore)",
    [AwsRegion.AP_SOUTHEAST_2]: "Asia Pacific (Sydney)",
    [AwsRegion.AP_NORTHEAST_1]: "Asia Pacific (Tokyo)",
    [AwsRegion.AP_SOUTH_1]: "Asia Pacific (Mumbai)",
    [AwsRegion.SA_EAST_1]: "South America (São Paulo)",
    [AwsRegion.AF_SOUTH_1]: "Africa (Cape Town)",
    [AwsRegion.ME_SOUTH_1]: "Middle East (Bahrain)",
};

export const AWS_REGION_FLAGS: Record<AwsRegion, string> = {
    [AwsRegion.US_EAST_1]: "🇺🇸",
    [AwsRegion.US_EAST_2]: "🇺🇸",
    [AwsRegion.US_WEST_1]: "🇺🇸",
    [AwsRegion.US_WEST_2]: "🇺🇸",
    [AwsRegion.EU_WEST_1]: "🇮🇪",
    [AwsRegion.EU_WEST_2]: "🇬🇧",
    [AwsRegion.EU_CENTRAL_1]: "🇩🇪",
    [AwsRegion.AP_SOUTHEAST_1]: "🇸🇬",
    [AwsRegion.AP_SOUTHEAST_2]: "🇦🇺",
    [AwsRegion.AP_NORTHEAST_1]: "🇯🇵",
    [AwsRegion.AP_SOUTH_1]: "🇮🇳",
    [AwsRegion.SA_EAST_1]: "🇧🇷",
    [AwsRegion.AF_SOUTH_1]: "🇿🇦",
    [AwsRegion.ME_SOUTH_1]: "🇧🇭",
};

export function getAwsRegionLabel(region: AwsRegion): string {
    return AWS_REGION_LABELS[region] || region;
}

export function getAwsRegionFlag(region: AwsRegion): string {
    return AWS_REGION_FLAGS[region] || "🌍";
}

export function getAwsRegionOptions(): Array<{
    label: string;
    value: AwsRegion;
    flag: string;
}> {
    return Object.values(AwsRegion).map((region) => ({
        label: getAwsRegionLabel(region),
        value: region,
        flag: getAwsRegionFlag(region),
    }));
}

// ============================================
// Tenant Audit Action Helpers - Labels & Colors
// ============================================

export const TENANT_AUDIT_ACTION_LABELS: Record<TenantAuditAction, string> = {
    [TenantAuditAction.CREATED]: "Tenant Created",
    [TenantAuditAction.UPDATED]: "Tenant Updated",
    [TenantAuditAction.ACTIVATED]: "Tenant Activated",
    [TenantAuditAction.DEACTIVATED]: "Tenant Deactivated",
    [TenantAuditAction.SUSPENDED]: "Tenant Suspended",
    [TenantAuditAction.REACTIVATED]: "Tenant Reactivated",
    [TenantAuditAction.TIER_CHANGED]: "Tier Changed",
    [TenantAuditAction.FEATURE_ENABLED]: "Feature Enabled",
    [TenantAuditAction.FEATURE_DISABLED]: "Feature Disabled",
    [TenantAuditAction.QUOTA_UPDATED]: "Quota Updated",
    [TenantAuditAction.CONFIG_UPDATED]: "Configuration Updated",
    [TenantAuditAction.DOMAIN_UPDATED]: "Domain Updated",
    [TenantAuditAction.BILLING_UPDATED]: "Billing Updated",
    [TenantAuditAction.SUBSCRIPTION_CHANGED]: "Subscription Changed",
    [TenantAuditAction.DATA_EXPORTED]: "Data Exported",
    [TenantAuditAction.DATA_DELETED]: "Data Deleted",
    [TenantAuditAction.BACKUP_CREATED]: "Backup Created",
    [TenantAuditAction.RESTORE_COMPLETED]: "Restore Completed",
    [TenantAuditAction.DELETED]: "Tenant Deleted",
};

export const TENANT_AUDIT_ACTION_COLORS: Record<TenantAuditAction, string> = {
    [TenantAuditAction.CREATED]: "positive",
    [TenantAuditAction.UPDATED]: "info",
    [TenantAuditAction.ACTIVATED]: "positive",
    [TenantAuditAction.DEACTIVATED]: "warning",
    [TenantAuditAction.SUSPENDED]: "negative",
    [TenantAuditAction.REACTIVATED]: "positive",
    [TenantAuditAction.TIER_CHANGED]: "purple",
    [TenantAuditAction.FEATURE_ENABLED]: "positive",
    [TenantAuditAction.FEATURE_DISABLED]: "warning",
    [TenantAuditAction.QUOTA_UPDATED]: "info",
    [TenantAuditAction.CONFIG_UPDATED]: "info",
    [TenantAuditAction.DOMAIN_UPDATED]: "blue",
    [TenantAuditAction.BILLING_UPDATED]: "orange",
    [TenantAuditAction.SUBSCRIPTION_CHANGED]: "orange",
    [TenantAuditAction.DATA_EXPORTED]: "info",
    [TenantAuditAction.DATA_DELETED]: "negative",
    [TenantAuditAction.BACKUP_CREATED]: "positive",
    [TenantAuditAction.RESTORE_COMPLETED]: "positive",
    [TenantAuditAction.DELETED]: "negative",
};

export const TENANT_AUDIT_ACTION_ICONS: Record<TenantAuditAction, string> = {
    [TenantAuditAction.CREATED]: "add_circle",
    [TenantAuditAction.UPDATED]: "edit",
    [TenantAuditAction.ACTIVATED]: "play_circle",
    [TenantAuditAction.DEACTIVATED]: "pause_circle",
    [TenantAuditAction.SUSPENDED]: "block",
    [TenantAuditAction.REACTIVATED]: "replay",
    [TenantAuditAction.TIER_CHANGED]: "upgrade",
    [TenantAuditAction.FEATURE_ENABLED]: "toggle_on",
    [TenantAuditAction.FEATURE_DISABLED]: "toggle_off",
    [TenantAuditAction.QUOTA_UPDATED]: "tune",
    [TenantAuditAction.CONFIG_UPDATED]: "settings",
    [TenantAuditAction.DOMAIN_UPDATED]: "language",
    [TenantAuditAction.BILLING_UPDATED]: "payment",
    [TenantAuditAction.SUBSCRIPTION_CHANGED]: "subscriptions",
    [TenantAuditAction.DATA_EXPORTED]: "file_download",
    [TenantAuditAction.DATA_DELETED]: "delete",
    [TenantAuditAction.BACKUP_CREATED]: "backup",
    [TenantAuditAction.RESTORE_COMPLETED]: "restore",
    [TenantAuditAction.DELETED]: "delete_forever",
};

export function getTenantAuditActionLabel(
    action: TenantAuditAction
): string {
    return TENANT_AUDIT_ACTION_LABELS[action] || action;
}

export function getTenantAuditActionColor(
    action: TenantAuditAction
): string {
    return TENANT_AUDIT_ACTION_COLORS[action] || "grey";
}

export function getTenantAuditActionIcon(action: TenantAuditAction): string {
    return TENANT_AUDIT_ACTION_ICONS[action] || "event_note";
}

// ============================================
// Tenant Feature Helpers - Labels & Icons
// ============================================

export const TENANT_FEATURE_LABELS: Record<TenantFeature, string> = {
    [TenantFeature.BCM]: "Business Continuity Management",
    [TenantFeature.RISK_MANAGEMENT]: "Risk Management",
    [TenantFeature.COMPLIANCE]: "Compliance",
    [TenantFeature.DOCUMENT_MANAGEMENT]: "Document Management",
    [TenantFeature.TRAINING]: "Training",
    [TenantFeature.REPORTING]: "Reporting",
    [TenantFeature.WORKFLOW]: "Workflow",
    [TenantFeature.NOTIFICATIONS]: "Notifications",
    [TenantFeature.API_ACCESS]: "API Access",
    [TenantFeature.SSO]: "Single Sign-On",
    [TenantFeature.MFA]: "Multi-Factor Authentication",
    [TenantFeature.AUDIT_LOGS]: "Audit Logs",
    [TenantFeature.DATA_EXPORT]: "Data Export",
    [TenantFeature.CUSTOM_BRANDING]: "Custom Branding",
    [TenantFeature.ADVANCED_ANALYTICS]: "Advanced Analytics",
    [TenantFeature.INTEGRATIONS]: "Integrations",
    [TenantFeature.PRIORITY_SUPPORT]: "Priority Support",
    [TenantFeature.DEDICATED_INSTANCE]: "Dedicated Instance",
    [TenantFeature.BASIC]: "Basic"
};

export const TENANT_FEATURE_ICONS: Record<TenantFeature, string> = {
    [TenantFeature.BCM]: "business_center",
    [TenantFeature.RISK_MANAGEMENT]: "warning",
    [TenantFeature.COMPLIANCE]: "verified",
    [TenantFeature.DOCUMENT_MANAGEMENT]: "folder",
    [TenantFeature.TRAINING]: "school",
    [TenantFeature.REPORTING]: "assessment",
    [TenantFeature.WORKFLOW]: "account_tree",
    [TenantFeature.NOTIFICATIONS]: "notifications",
    [TenantFeature.API_ACCESS]: "api",
    [TenantFeature.SSO]: "login",
    [TenantFeature.MFA]: "security",
    [TenantFeature.AUDIT_LOGS]: "history",
    [TenantFeature.DATA_EXPORT]: "download",
    [TenantFeature.CUSTOM_BRANDING]: "palette",
    [TenantFeature.ADVANCED_ANALYTICS]: "insights",
    [TenantFeature.INTEGRATIONS]: "extension",
    [TenantFeature.PRIORITY_SUPPORT]: "support_agent",
    [TenantFeature.DEDICATED_INSTANCE]: "dns",
    [TenantFeature.BASIC]: "extension"
};

export function getTenantFeatureLabel(feature: TenantFeature): string {
    return TENANT_FEATURE_LABELS[feature] || feature;
}

export function getTenantFeatureIcon(feature: TenantFeature): string {
    return TENANT_FEATURE_ICONS[feature] || "check_circle";
}

export function getTenantFeatureOptions(): Array<{
    label: string;
    value: TenantFeature;
    icon: string;
}> {
    return Object.values(TenantFeature).map((feature) => ({
        label: getTenantFeatureLabel(feature),
        value: feature,
        icon: getTenantFeatureIcon(feature),
    }));
}

// ============================================
// Tier Feature Mapping
// ============================================

export const TIER_FEATURES: Record<TenantTier, TenantFeature[]> = {
    [TenantTier.FREE]: [
        TenantFeature.BCM,
        TenantFeature.RISK_MANAGEMENT,
        TenantFeature.COMPLIANCE,
        TenantFeature.DOCUMENT_MANAGEMENT,
    ],
    [TenantFeature.BASIC as unknown as TenantTier]: [],
    [TenantTier.BASIC]: [
        TenantFeature.BCM,
        TenantFeature.RISK_MANAGEMENT,
        TenantFeature.COMPLIANCE,
        TenantFeature.DOCUMENT_MANAGEMENT,
        TenantFeature.TRAINING,
        TenantFeature.REPORTING,
    ],
    [TenantTier.STANDARD]: [
        TenantFeature.BCM,
        TenantFeature.RISK_MANAGEMENT,
        TenantFeature.COMPLIANCE,
        TenantFeature.DOCUMENT_MANAGEMENT,
        TenantFeature.TRAINING,
        TenantFeature.REPORTING,
        TenantFeature.WORKFLOW,
        TenantFeature.NOTIFICATIONS,
        TenantFeature.API_ACCESS,
    ],
    [TenantTier.PROFESSIONAL]: [
        TenantFeature.BCM,
        TenantFeature.RISK_MANAGEMENT,
        TenantFeature.COMPLIANCE,
        TenantFeature.DOCUMENT_MANAGEMENT,
        TenantFeature.TRAINING,
        TenantFeature.REPORTING,
        TenantFeature.WORKFLOW,
        TenantFeature.NOTIFICATIONS,
        TenantFeature.API_ACCESS,
        TenantFeature.SSO,
        TenantFeature.MFA,
        TenantFeature.AUDIT_LOGS,
        TenantFeature.DATA_EXPORT,
        TenantFeature.INTEGRATIONS,
    ],
    [TenantTier.ENTERPRISE]: [
        TenantFeature.BCM,
        TenantFeature.RISK_MANAGEMENT,
        TenantFeature.COMPLIANCE,
        TenantFeature.DOCUMENT_MANAGEMENT,
        TenantFeature.TRAINING,
        TenantFeature.REPORTING,
        TenantFeature.WORKFLOW,
        TenantFeature.NOTIFICATIONS,
        TenantFeature.API_ACCESS,
        TenantFeature.SSO,
        TenantFeature.MFA,
        TenantFeature.AUDIT_LOGS,
        TenantFeature.DATA_EXPORT,
        TenantFeature.CUSTOM_BRANDING,
        TenantFeature.ADVANCED_ANALYTICS,
        TenantFeature.INTEGRATIONS,
        TenantFeature.PRIORITY_SUPPORT,
    ],
    [TenantTier.PREMIUM]: [
        TenantFeature.BCM,
        TenantFeature.RISK_MANAGEMENT,
        TenantFeature.COMPLIANCE,
        TenantFeature.DOCUMENT_MANAGEMENT,
        TenantFeature.TRAINING,
        TenantFeature.REPORTING,
        TenantFeature.WORKFLOW,
        TenantFeature.NOTIFICATIONS,
        TenantFeature.API_ACCESS,
        TenantFeature.SSO,
        TenantFeature.MFA,
        TenantFeature.AUDIT_LOGS,
        TenantFeature.DATA_EXPORT,
        TenantFeature.CUSTOM_BRANDING,
        TenantFeature.ADVANCED_ANALYTICS,
        TenantFeature.INTEGRATIONS,
        TenantFeature.PRIORITY_SUPPORT,
        TenantFeature.DEDICATED_INSTANCE,
    ],
    [TenantTier.CUSTOM]: Object.values(TenantFeature),
};

export function getFeaturesForTier(tier: TenantTier): TenantFeature[] {
    return TIER_FEATURES[tier] || [];
}

// ============================================
// Display Options Generators
// ============================================

export function getTenantStatusOptions(): Array<{
    label: string;
    value: TenantStatus;
    color: string;
    icon: string;
}> {
    return Object.values(TenantStatus).map((status) => ({
        label: getTenantStatusLabel(status),
        value: status,
        color: getTenantStatusColor(status),
        icon: getTenantStatusIcon(status),
    }));
}

export function getTenantTierOptions(): Array<{
    label: string;
    value: TenantTier;
    color: string;
    icon: string;
}> {
    return Object.values(TenantTier).map((tier) => ({
        label: getTenantTierLabel(tier),
        value: tier,
        color: getTenantTierColor(tier),
        icon: getTenantTierIcon(tier),
    }));
}

export function getTenantAuditActionOptions(): Array<{
    label: string;
    value: TenantAuditAction;
    color: string;
    icon: string;
}> {
    return Object.values(TenantAuditAction).map((action) => ({
        label: getTenantAuditActionLabel(action),
        value: action,
        color: getTenantAuditActionColor(action),
        icon: getTenantAuditActionIcon(action),
    }));
}

// ============================================
// Tenant Statistics
// ============================================

export interface TenantStats {
    totalTenants: number;
    byStatus: Record<TenantStatus, number>;
    byTier: Record<TenantTier, number>;
    byRegion: Record<AwsRegion, number>;
    activeTenants: number;
    trialTenants: number;
    suspendedTenants: number;
    expiredTenants: number;
    totalOrganisations: number;
    totalUsers: number;
}

export interface TenantUsageStats {
    tenantId: string;
    userCount: number;
    organisationCount: number;
    storageUsedGb: number;
    apiCallsThisMonth: number;
    reportsThisMonth: number;
    workflowsThisMonth: number;
    documentCount: number;
    quotaUsage: {
        users: number;
        storage: number;
        apiCalls: number;
        reports: number;
    };
}

// ============================================
// Tenant Request/Response Types
// ============================================

export interface CreateTenantRequest {
    name: string;
    domainPrefix: string;
    email: string;
    tier?: TenantTier;
    primaryRegion?: AwsRegion;
    billingEmail?: string;
    dataIsolationEnabled?: boolean;
    encryptionEnabled?: boolean;
    config?: TenantConfig;
    features?: TenantFeature[];
    resourceQuotas?: TenantResourceQuotas;
    tags?: Record<string, string>;
}

export interface UpdateTenantRequest {
    name?: string;
    customDomain?: string;
    email?: string;
    billingEmail?: string;
    tier?: TenantTier;
    status?: TenantStatus;
    primaryRegion?: AwsRegion;
    config?: TenantConfig;
    features?: TenantFeature[];
    resourceQuotas?: TenantResourceQuotas;
    dataIsolationEnabled?: boolean;
    encryptionEnabled?: boolean;
    subscriptionEndDate?: Date;
    tags?: Record<string, string>;
}

export interface TenantQueryParams {
    status?: TenantStatus;
    tier?: TenantTier;
    primaryRegion?: AwsRegion;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
}

export interface TenantAuditLogQueryParams {
    tenantId?: string;
    action?: TenantAuditAction;
    performedBy?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
}