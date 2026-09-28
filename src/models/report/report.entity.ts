import { BaseEntity } from "src/core/base/base.entity";
import { BusinessUnit, Department, Organisation } from "../organisation/organisation.entity";

// ============================================
// Report Module - Enums (Aligned with Backend)
// ============================================

export enum ReportType {
    BCM_SUMMARY = "BcmSummary",
    RISK_ASSESSMENT = "RiskAssessment",
    COMPLIANCE_STATUS = "ComplianceStatus",
    INCIDENT_REPORT = "IncidentReport",
    BIA_REPORT = "BiaReport",
    BCP_STATUS = "BcpStatus",
    EXERCISE_RESULTS = "ExerciseResults",
    TRAINING_COMPLETION = "TrainingCompletion",
    AUDIT_TRAIL = "AuditTrail",
    EXECUTIVE_DASHBOARD = "ExecutiveDashboard",
    OPERATIONAL_REPORT = "OperationalReport",
    TREND_ANALYSIS = "TrendAnalysis",
    GAP_ANALYSIS = "GapAnalysis",
    CUSTOM = "Custom",
}

export enum ReportFormat {
    PDF = "PDF",
    EXCEL = "Excel",
    CSV = "CSV",
    JSON = "JSON",
    HTML = "HTML",
    DOCX = "DOCX",
}

export enum ReportStatus {
    PENDING = "Pending",
    GENERATING = "Generating",
    COMPLETED = "Completed",
    FAILED = "Failed",
    SCHEDULED = "Scheduled",
    EXPIRED = "Expired",
    CANCELLED = "Cancelled",
}

export enum ReportFrequency {
    ONCE = "Once",
    DAILY = "Daily",
    WEEKLY = "Weekly",
    MONTHLY = "Monthly",
    QUARTERLY = "Quarterly",
    ANNUALLY = "Annually",
}

// ============================================
// Report Entity - Aligned with Backend
// Backend: src/modules/reporting/models/entities/report.entity.ts
// ============================================

export interface ReportRecipient {
    email: string;
    name?: string;
}

export interface ReportSorting {
    field: string;
    direction: "ASC" | "DESC";
}

export interface Report extends BaseEntity {
    organisationId: string;
    businessUnitId?: string;
    departmentId?: string;
    name: string;
    description?: string;
    reportType: ReportType;
    format: ReportFormat;
    status: ReportStatus;
    parameters?: Record<string, any>;
    filters?: Record<string, any>;
    columns?: string[];
    sorting?: ReportSorting[];
    frequency?: ReportFrequency;
    scheduledAt?: Date;
    lastRunAt?: Date;
    completedAt?: Date;
    fileUrl?: string;
    fileSize?: number;
    rowCount: number;
    errorMessage?: string;
    metadata?: Record<string, any>;
    isPublic: boolean;
    recipients?: ReportRecipient[];
    retentionDays: number;
    expiresAt?: Date;

    // Relationships
    organisation?: Organisation;
    businessUnit?: BusinessUnit;
    department?: Department;
}

// ============================================
// Report Helper Functions
// ============================================

export const ReportHelpers = {
    isExpired: (report: Report): boolean => {
        return report.expiresAt ? report.expiresAt < new Date() : false;
    },

    isScheduled: (report: Report): boolean => {
        return !!report.scheduledAt && report.scheduledAt > new Date();
    },

    isRecurring: (report: Report): boolean => {
        return !!report.frequency && report.frequency !== ReportFrequency.ONCE;
    },

    isCompleted: (report: Report): boolean => {
        return report.status === ReportStatus.COMPLETED;
    },

    isGenerating: (report: Report): boolean => {
        return report.status === ReportStatus.GENERATING;
    },

    hasFailed: (report: Report): boolean => {
        return report.status === ReportStatus.FAILED;
    },

    fileSizeFormatted: (report: Report): string => {
        if (!report.fileSize) return "N/A";
        const sizes = ["Bytes", "KB", "MB", "GB"];
        if (report.fileSize === 0) return "0 Bytes";
        const i = Math.floor(Math.log(report.fileSize) / Math.log(1024));
        return `${Math.round(
            (report.fileSize / Math.pow(1024, i)) * 100
        ) / 100} ${sizes[i]}`;
    },

    daysUntilExpiry: (report: Report): number | null => {
        if (!report.expiresAt) return null;
        const now = new Date();
        if (now >= report.expiresAt) return 0;
        return Math.ceil(
            (report.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
    },
};

// ============================================
// Report Enums - Labels, Colors, Icons
// ============================================

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
    [ReportType.BCM_SUMMARY]: "BCM Summary",
    [ReportType.RISK_ASSESSMENT]: "Risk Assessment",
    [ReportType.COMPLIANCE_STATUS]: "Compliance Status",
    [ReportType.INCIDENT_REPORT]: "Incident Report",
    [ReportType.BIA_REPORT]: "Business Impact Analysis",
    [ReportType.BCP_STATUS]: "BCP Status",
    [ReportType.EXERCISE_RESULTS]: "Exercise Results",
    [ReportType.TRAINING_COMPLETION]: "Training Completion",
    [ReportType.AUDIT_TRAIL]: "Audit Trail",
    [ReportType.EXECUTIVE_DASHBOARD]: "Executive Dashboard",
    [ReportType.OPERATIONAL_REPORT]: "Operational Report",
    [ReportType.TREND_ANALYSIS]: "Trend Analysis",
    [ReportType.GAP_ANALYSIS]: "Gap Analysis",
    [ReportType.CUSTOM]: "Custom Report",
};

export const REPORT_TYPE_ICONS: Record<ReportType, string> = {
    [ReportType.BCM_SUMMARY]: "business_center",
    [ReportType.RISK_ASSESSMENT]: "warning",
    [ReportType.COMPLIANCE_STATUS]: "verified",
    [ReportType.INCIDENT_REPORT]: "report",
    [ReportType.BIA_REPORT]: "assessment",
    [ReportType.BCP_STATUS]: "description",
    [ReportType.EXERCISE_RESULTS]: "playlist_add_check",
    [ReportType.TRAINING_COMPLETION]: "school",
    [ReportType.AUDIT_TRAIL]: "history",
    [ReportType.EXECUTIVE_DASHBOARD]: "dashboard",
    [ReportType.OPERATIONAL_REPORT]: "settings",
    [ReportType.TREND_ANALYSIS]: "trending_up",
    [ReportType.GAP_ANALYSIS]: "compare_arrows",
    [ReportType.CUSTOM]: "insert_chart",
};

export const REPORT_FORMAT_LABELS: Record<ReportFormat, string> = {
    [ReportFormat.PDF]: "PDF",
    [ReportFormat.EXCEL]: "Excel",
    [ReportFormat.CSV]: "CSV",
    [ReportFormat.JSON]: "JSON",
    [ReportFormat.HTML]: "HTML",
    [ReportFormat.DOCX]: "Word Document",
};

export const REPORT_FORMAT_ICONS: Record<ReportFormat, string> = {
    [ReportFormat.PDF]: "picture_as_pdf",
    [ReportFormat.EXCEL]: "table_chart",
    [ReportFormat.CSV]: "grid_on",
    [ReportFormat.JSON]: "data_object",
    [ReportFormat.HTML]: "code",
    [ReportFormat.DOCX]: "description",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
    [ReportStatus.PENDING]: "Pending",
    [ReportStatus.GENERATING]: "Generating",
    [ReportStatus.COMPLETED]: "Completed",
    [ReportStatus.FAILED]: "Failed",
    [ReportStatus.SCHEDULED]: "Scheduled",
    [ReportStatus.EXPIRED]: "Expired",
    [ReportStatus.CANCELLED]: "Cancelled",
};

export const REPORT_STATUS_COLORS: Record<ReportStatus, string> = {
    [ReportStatus.PENDING]: "warning",
    [ReportStatus.GENERATING]: "info",
    [ReportStatus.COMPLETED]: "positive",
    [ReportStatus.FAILED]: "negative",
    [ReportStatus.SCHEDULED]: "blue",
    [ReportStatus.EXPIRED]: "grey-7",
    [ReportStatus.CANCELLED]: "grey",
};

export const REPORT_STATUS_ICONS: Record<ReportStatus, string> = {
    [ReportStatus.PENDING]: "hourglass_empty",
    [ReportStatus.GENERATING]: "sync",
    [ReportStatus.COMPLETED]: "check_circle",
    [ReportStatus.FAILED]: "error",
    [ReportStatus.SCHEDULED]: "event",
    [ReportStatus.EXPIRED]: "event_busy",
    [ReportStatus.CANCELLED]: "cancel",
};

export const REPORT_FREQUENCY_LABELS: Record<ReportFrequency, string> = {
    [ReportFrequency.ONCE]: "Once",
    [ReportFrequency.DAILY]: "Daily",
    [ReportFrequency.WEEKLY]: "Weekly",
    [ReportFrequency.MONTHLY]: "Monthly",
    [ReportFrequency.QUARTERLY]: "Quarterly",
    [ReportFrequency.ANNUALLY]: "Annually",
};

export const REPORT_FREQUENCY_ICONS: Record<ReportFrequency, string> = {
    [ReportFrequency.ONCE]: "looks_one",
    [ReportFrequency.DAILY]: "today",
    [ReportFrequency.WEEKLY]: "date_range",
    [ReportFrequency.MONTHLY]: "calendar_month",
    [ReportFrequency.QUARTERLY]: "calendar_view_quarter",
    [ReportFrequency.ANNUALLY]: "event_repeat",
};

export function getReportTypeLabel(type: ReportType): string {
    return REPORT_TYPE_LABELS[type] || type;
}

export function getReportTypeIcon(type: ReportType): string {
    return REPORT_TYPE_ICONS[type] || "description";
}

export function getReportFormatLabel(format: ReportFormat): string {
    return REPORT_FORMAT_LABELS[format] || format;
}

export function getReportFormatIcon(format: ReportFormat): string {
    return REPORT_FORMAT_ICONS[format] || "insert_drive_file";
}

export function getReportStatusLabel(status: ReportStatus): string {
    return REPORT_STATUS_LABELS[status] || status;
}

export function getReportStatusColor(status: ReportStatus): string {
    return REPORT_STATUS_COLORS[status] || "grey";
}

export function getReportStatusIcon(status: ReportStatus): string {
    return REPORT_STATUS_ICONS[status] || "help";
}

export function getReportFrequencyLabel(frequency: ReportFrequency): string {
    return REPORT_FREQUENCY_LABELS[frequency] || frequency;
}

export function getReportFrequencyIcon(frequency: ReportFrequency): string {
    return REPORT_FREQUENCY_ICONS[frequency] || "event";
}

// ============================================
// Display Options Generators
// ============================================

export function getReportTypeOptions(): Array<{
    label: string;
    value: ReportType;
    icon: string;
}> {
    return Object.values(ReportType).map((type) => ({
        label: getReportTypeLabel(type),
        value: type,
        icon: getReportTypeIcon(type),
    }));
}

export function getReportFormatOptions(): Array<{
    label: string;
    value: ReportFormat;
    icon: string;
}> {
    return Object.values(ReportFormat).map((format) => ({
        label: getReportFormatLabel(format),
        value: format,
        icon: getReportFormatIcon(format),
    }));
}

export function getReportStatusOptions(): Array<{
    label: string;
    value: ReportStatus;
    color: string;
    icon: string;
}> {
    return Object.values(ReportStatus).map((status) => ({
        label: getReportStatusLabel(status),
        value: status,
        color: getReportStatusColor(status),
        icon: getReportStatusIcon(status),
    }));
}

export function getReportFrequencyOptions(): Array<{
    label: string;
    value: ReportFrequency;
    icon: string;
}> {
    return Object.values(ReportFrequency).map((frequency) => ({
        label: getReportFrequencyLabel(frequency),
        value: frequency,
        icon: getReportFrequencyIcon(frequency),
    }));
}

// ============================================
// Report Statistics
// ============================================

export interface ReportStats {
    total: number;
    byStatus: Record<ReportStatus, number>;
    byType: Record<ReportType, number>;
    byFormat: Record<ReportFormat, number>;
    completed: number;
    pending: number;
    failed: number;
    scheduled: number;
    totalFileSize: number;
    averageGenerationTime: number;
}

export interface ReportGenerationResult {
    reportId: string;
    success: boolean;
    fileUrl?: string;
    fileSize?: number;
    rowCount?: number;
    errorMessage?: string;
    generationTimeMs: number;
}

// ============================================
// Report Request/Response Types
// ============================================

export interface CreateReportRequest {
    organisationId: string;
    businessUnitId?: string;
    departmentId?: string;
    name: string;
    description?: string;
    reportType: ReportType;
    format?: ReportFormat;
    parameters?: Record<string, any>;
    filters?: Record<string, any>;
    columns?: string[];
    sorting?: ReportSorting[];
    frequency?: ReportFrequency;
    scheduledAt?: Date;
    recipients?: ReportRecipient[];
    isPublic?: boolean;
    retentionDays?: number;
}

export interface UpdateReportRequest {
    name?: string;
    description?: string;
    format?: ReportFormat;
    status?: ReportStatus;
    parameters?: Record<string, any>;
    filters?: Record<string, any>;
    columns?: string[];
    sorting?: ReportSorting[];
    frequency?: ReportFrequency;
    scheduledAt?: Date;
    recipients?: ReportRecipient[];
    isPublic?: boolean;
    retentionDays?: number;
}

export interface ReportQueryParams {
    organisationId?: string;
    businessUnitId?: string;
    departmentId?: string;
    reportType?: ReportType;
    format?: ReportFormat;
    status?: ReportStatus;
    frequency?: ReportFrequency;
    createdBy?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
}

export interface GenerateReportRequest {
    reportId: string;
    format?: ReportFormat;
    parameters?: Record<string, any>;
    filters?: Record<string, any>;
}

export interface ScheduleReportRequest {
    reportId: string;
    frequency: ReportFrequency;
    scheduledAt: Date;
    recipients?: ReportRecipient[];
}