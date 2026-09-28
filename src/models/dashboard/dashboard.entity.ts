import type { BaseEntity } from "../../core/base/base.entity";
import type { User } from "../user/user.entity";
import type { Organisation, BusinessUnit, Department } from "../organisation/organisation.entity";

// ============================================
// Dashboard Module - Enums (Aligned with Backend)
// ============================================

/**
 * Dashboard Role Enum
 * Defines the role-based dashboard configurations
 * Backend: src/types/enums/dashboard.enum.ts
 */
export enum DashboardRole {
    USER = "User",
    MANAGER = "Manager",
    ADMIN = "Admin",
    EXECUTIVE = "Executive",
    AUDITOR = "Auditor",
    BCM_COORDINATOR = "BcmCoordinator",
    RISK_MANAGER = "RiskManager",
    COMPLIANCE_OFFICER = "ComplianceOfficer",
    DEPARTMENT_HEAD = "DepartmentHead",
    BUSINESS_UNIT_HEAD = "BusinessUnitHead",
    SUPER_ADMIN = "SuperAdmin",
}

/**
 * Widget Type Enum
 * Defines all available dashboard widget types
 */
export enum WidgetType {
    // Chart Widgets
    PIE_CHART = "PieChart",
    BAR_CHART = "BarChart",
    LINE_CHART = "LineChart",
    AREA_CHART = "AreaChart",
    DONUT_CHART = "DonutChart",
    RADAR_CHART = "RadarChart",
    HEATMAP = "Heatmap",
    GAUGE = "Gauge",
    SPARKLINE = "Sparkline",

    // Data Widgets
    STAT_CARD = "StatCard",
    KPI_CARD = "KpiCard",
    METRIC_TILE = "MetricTile",
    COUNTER = "Counter",
    PROGRESS_BAR = "ProgressBar",
    PROGRESS_RING = "ProgressRing",

    // List Widgets
    DATA_TABLE = "DataTable",
    LIST = "List",
    TIMELINE = "Timeline",
    ACTIVITY_FEED = "ActivityFeed",
    RECENT_ITEMS = "RecentItems",
    TOP_ITEMS = "TopItems",

    // Calendar Widgets
    CALENDAR = "Calendar",
    UPCOMING_EVENTS = "UpcomingEvents",
    SCHEDULE = "Schedule",

    // Status Widgets
    STATUS_BOARD = "StatusBoard",
    ALERT_LIST = "AlertList",
    NOTIFICATION_LIST = "NotificationList",
    TASK_LIST = "TaskList",

    // Map Widgets
    MAP = "Map",
    GEO_CHART = "GeoChart",

    // Special Widgets
    RISK_MATRIX = "RiskMatrix",
    COMPLIANCE_OVERVIEW = "ComplianceOverview",
    BCM_OVERVIEW = "BcmOverview",
    INCIDENT_OVERVIEW = "IncidentOverview",
    TRAINING_OVERVIEW = "TrainingOverview",
    WORKFLOW_OVERVIEW = "WorkflowOverview",
    MATURITY_GAUGE = "MaturityGauge",
    QUICK_ACTIONS = "QuickActions",
    ANNOUNCEMENTS = "Announcements",
    WEATHER = "Weather",
    CLOCK = "Clock",
    CUSTOM = "Custom",
}

/**
 * Widget Category Enum
 * Groups widget types into categories
 */
export enum WidgetCategory {
    CHARTS = "Charts",
    DATA = "Data",
    LISTS = "Lists",
    CALENDAR = "Calendar",
    STATUS = "Status",
    MAPS = "Maps",
    BCM = "BusinessContinuity",
    SPECIAL = "Special",
    CUSTOM = "Custom",
}

/**
 * Widget Size Enum
 * Standard widget dimensions (grid units)
 */
export enum WidgetSize {
    SMALL = "Small",
    MEDIUM = "Medium",
    LARGE = "Large",
    WIDE = "Wide",
    TALL = "Tall",
    FULL = "Full",
}

/**
 * Dashboard Layout Type Enum
 */
export enum DashboardLayoutType {
    GRID = "Grid",
    FREEFORM = "Freeform",
    MASONRY = "Masonry",
    COLUMNS = "Columns",
    TABS = "Tabs",
}

/**
 * Data Refresh Interval Enum (in seconds)
 */
export enum DataRefreshInterval {
    NEVER = 0,
    THIRTY_SECONDS = 30,
    ONE_MINUTE = 60,
    FIVE_MINUTES = 300,
    FIFTEEN_MINUTES = 900,
    THIRTY_MINUTES = 1800,
    ONE_HOUR = 3600,
    DAILY = 86400,
}

// ============================================
// Dashboard Module - Embedded Types (JSONB)
// ============================================

/**
 * Widget Position
 */
export interface WidgetPosition {
    x: number;
    y: number;
    w: number;
    h: number;
}

/**
 * Dashboard Widget
 * Aligned with backend DashboardWidget interface
 */
export interface DashboardWidget {
    id: string;
    type: WidgetType;
    title: string;
    config: any;
    position: WidgetPosition;
    dataSource: string;
    refreshInterval?: number;
    isVisible?: boolean;
}

/**
 * Widget Configuration (generic)
 */
export interface WidgetConfig {
    // Chart-specific
    chartType?: string;
    colors?: string[];
    showLegend?: boolean;
    showLabels?: boolean;
    showGrid?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;

    // Data-specific
    metric?: string;
    aggregation?: "sum" | "average" | "count" | "min" | "max";
    timeRange?: string;
    filters?: Record<string, any>;
    groupBy?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    limit?: number;

    // Display-specific
    icon?: string;
    color?: string;
    format?: string;
    prefix?: string;
    suffix?: string;
    decimalPlaces?: number;

    // Links
    drillDownUrl?: string;
    clickAction?: string;

    // Custom
    customConfig?: Record<string, any>;
}

/**
 * Dashboard Layout
 */
export interface DashboardLayout {
    type: DashboardLayoutType;
    columns?: number;
    rowHeight?: number;
    gap?: number;
    padding?: number;
    compactType?: "vertical" | "horizontal" | null;
    preventCollision?: boolean;
}

/**
 * Dashboard Preferences
 */
export interface DashboardPreferences {
    theme?: "light" | "dark" | "system";
    showHeader?: boolean;
    showFooter?: boolean;
    showFilters?: boolean;
    showRefreshButton?: boolean;
    showFullscreenButton?: boolean;
    showSettingsButton?: boolean;
    autoRefresh?: boolean;
    autoRefreshInterval?: number;
    defaultTimeRange?: string;
    timezone?: string;
    locale?: string;
}

// ============================================
// Dashboard Config Entity - Aligned with Backend
// Backend: src/modules/dashboard/models/entities/dashboard.entity.ts
// ============================================

export interface DashboardConfig extends BaseEntity {
    organisationId: string;
    userId?: string;
    role: DashboardRole;
    widgets: DashboardWidget[];
    layout?: DashboardLayout;
    preferences?: DashboardPreferences;
    isActive: boolean;
    name?: string;
    description?: string;
    businessUnitId?: string;
    departmentId?: string;

    // Relationships
    organisation?: Organisation;
    businessUnit?: BusinessUnit;
    department?: Department;
    user?: User;
}

// ============================================
// Dashboard Helper Functions (Computed Properties)
// ============================================

export const DashboardHelpers = {
    /**
     * Check if dashboard is personal (user-specific)
     */
    isPersonal: (dashboard: DashboardConfig): boolean => {
        return !!dashboard.userId;
    },

    /**
     * Check if dashboard is organisation-wide
     */
    isOrganisationWide: (dashboard: DashboardConfig): boolean => {
        return !dashboard.userId && !dashboard.businessUnitId && !dashboard.departmentId;
    },

    /**
     * Check if dashboard is scoped to business unit
     */
    isBusinessUnitScoped: (dashboard: DashboardConfig): boolean => {
        return !!dashboard.businessUnitId && !dashboard.departmentId;
    },

    /**
     * Check if dashboard is scoped to department
     */
    isDepartmentScoped: (dashboard: DashboardConfig): boolean => {
        return !!dashboard.departmentId;
    },

    /**
     * Get widget count
     */
    widgetCount: (dashboard: DashboardConfig): number => {
        return dashboard.widgets?.length || 0;
    },

    /**
     * Get visible widget count
     */
    visibleWidgetCount: (dashboard: DashboardConfig): number => {
        return dashboard.widgets?.filter((w) => w.isVisible !== false).length || 0;
    },

    /**
     * Get hidden widget count
     */
    hiddenWidgetCount: (dashboard: DashboardConfig): number => {
        return dashboard.widgets?.filter((w) => w.isVisible === false).length || 0;
    },

    /**
     * Get widgets by type
     */
    getWidgetsByType: (
        dashboard: DashboardConfig,
        type: WidgetType
    ): DashboardWidget[] => {
        return dashboard.widgets?.filter((w) => w.type === type) || [];
    },

    /**
     * Get widget by ID
     */
    getWidgetById: (
        dashboard: DashboardConfig,
        widgetId: string
    ): DashboardWidget | undefined => {
        return dashboard.widgets?.find((w) => w.id === widgetId);
    },

    /**
     * Get widgets with auto-refresh enabled
     */
    autoRefreshWidgets: (dashboard: DashboardConfig): DashboardWidget[] => {
        return (
            dashboard.widgets?.filter(
                (w) => w.refreshInterval && w.refreshInterval > 0
            ) || []
        );
    },

    /**
     * Get minimum refresh interval (for dashboard-wide polling)
     */
    minRefreshInterval: (dashboard: DashboardConfig): number | null => {
        const widgets = DashboardHelpers.autoRefreshWidgets(dashboard);
        if (widgets.length === 0) return null;
        return Math.min(...widgets.map((w) => w.refreshInterval || Infinity));
    },

    /**
     * Check if dashboard has any visible widgets
     */
    hasVisibleWidgets: (dashboard: DashboardConfig): boolean => {
        return DashboardHelpers.visibleWidgetCount(dashboard) > 0;
    },

    /**
     * Get widgets grouped by category
     */
    getWidgetsByCategory: (
        dashboard: DashboardConfig
    ): Record<WidgetCategory, DashboardWidget[]> => {
        const result: Record<WidgetCategory, DashboardWidget[]> = {
            [WidgetCategory.CHARTS]: [],
            [WidgetCategory.DATA]: [],
            [WidgetCategory.LISTS]: [],
            [WidgetCategory.CALENDAR]: [],
            [WidgetCategory.STATUS]: [],
            [WidgetCategory.MAPS]: [],
            [WidgetCategory.BCM]: [],
            [WidgetCategory.SPECIAL]: [],
            [WidgetCategory.CUSTOM]: [],
        };

        for (const widget of dashboard.widgets || []) {
            const category = getWidgetCategory(widget.type);
            result[category].push(widget);
        }

        return result;
    },

    /**
     * Check if dashboard is empty
     */
    isEmpty: (dashboard: DashboardConfig): boolean => {
        return DashboardHelpers.widgetCount(dashboard) === 0;
    },
};

// ============================================
// Dashboard Role Helpers - Labels, Colors, Icons
// ============================================

export const DASHBOARD_ROLE_LABELS: Record<DashboardRole, string> = {
    [DashboardRole.USER]: "User",
    [DashboardRole.MANAGER]: "Manager",
    [DashboardRole.ADMIN]: "Administrator",
    [DashboardRole.EXECUTIVE]: "Executive",
    [DashboardRole.AUDITOR]: "Auditor",
    [DashboardRole.BCM_COORDINATOR]: "BCM Coordinator",
    [DashboardRole.RISK_MANAGER]: "Risk Manager",
    [DashboardRole.COMPLIANCE_OFFICER]: "Compliance Officer",
    [DashboardRole.DEPARTMENT_HEAD]: "Department Head",
    [DashboardRole.BUSINESS_UNIT_HEAD]: "Business Unit Head",
    [DashboardRole.SUPER_ADMIN]: "Super Administrator",
};

export const DASHBOARD_ROLE_COLORS: Record<DashboardRole, string> = {
    [DashboardRole.USER]: "grey",
    [DashboardRole.MANAGER]: "blue",
    [DashboardRole.ADMIN]: "purple",
    [DashboardRole.EXECUTIVE]: "orange",
    [DashboardRole.AUDITOR]: "teal",
    [DashboardRole.BCM_COORDINATOR]: "green",
    [DashboardRole.RISK_MANAGER]: "red",
    [DashboardRole.COMPLIANCE_OFFICER]: "indigo",
    [DashboardRole.DEPARTMENT_HEAD]: "cyan",
    [DashboardRole.BUSINESS_UNIT_HEAD]: "deep-purple",
    [DashboardRole.SUPER_ADMIN]: "deep-orange",
};

export const DASHBOARD_ROLE_ICONS: Record<DashboardRole, string> = {
    [DashboardRole.USER]: "person",
    [DashboardRole.MANAGER]: "supervisor_account",
    [DashboardRole.ADMIN]: "admin_panel_settings",
    [DashboardRole.EXECUTIVE]: "business_center",
    [DashboardRole.AUDITOR]: "fact_check",
    [DashboardRole.BCM_COORDINATOR]: "hub",
    [DashboardRole.RISK_MANAGER]: "warning",
    [DashboardRole.COMPLIANCE_OFFICER]: "verified",
    [DashboardRole.DEPARTMENT_HEAD]: "groups",
    [DashboardRole.BUSINESS_UNIT_HEAD]: "corporate_fare",
    [DashboardRole.SUPER_ADMIN]: "shield",
};

export function getDashboardRoleLabel(role: DashboardRole): string {
    return DASHBOARD_ROLE_LABELS[role] || role;
}

export function getDashboardRoleColor(role: DashboardRole): string {
    return DASHBOARD_ROLE_COLORS[role] || "grey";
}

export function getDashboardRoleIcon(role: DashboardRole): string {
    return DASHBOARD_ROLE_ICONS[role] || "dashboard";
}

// ============================================
// Widget Type Helpers - Labels, Colors, Icons, Categories
// ============================================

export const WIDGET_TYPE_LABELS: Record<WidgetType, string> = {
    // Charts
    [WidgetType.PIE_CHART]: "Pie Chart",
    [WidgetType.BAR_CHART]: "Bar Chart",
    [WidgetType.LINE_CHART]: "Line Chart",
    [WidgetType.AREA_CHART]: "Area Chart",
    [WidgetType.DONUT_CHART]: "Donut Chart",
    [WidgetType.RADAR_CHART]: "Radar Chart",
    [WidgetType.HEATMAP]: "Heatmap",
    [WidgetType.GAUGE]: "Gauge",
    [WidgetType.SPARKLINE]: "Sparkline",

    // Data
    [WidgetType.STAT_CARD]: "Stat Card",
    [WidgetType.KPI_CARD]: "KPI Card",
    [WidgetType.METRIC_TILE]: "Metric Tile",
    [WidgetType.COUNTER]: "Counter",
    [WidgetType.PROGRESS_BAR]: "Progress Bar",
    [WidgetType.PROGRESS_RING]: "Progress Ring",

    // Lists
    [WidgetType.DATA_TABLE]: "Data Table",
    [WidgetType.LIST]: "List",
    [WidgetType.TIMELINE]: "Timeline",
    [WidgetType.ACTIVITY_FEED]: "Activity Feed",
    [WidgetType.RECENT_ITEMS]: "Recent Items",
    [WidgetType.TOP_ITEMS]: "Top Items",

    // Calendar
    [WidgetType.CALENDAR]: "Calendar",
    [WidgetType.UPCOMING_EVENTS]: "Upcoming Events",
    [WidgetType.SCHEDULE]: "Schedule",

    // Status
    [WidgetType.STATUS_BOARD]: "Status Board",
    [WidgetType.ALERT_LIST]: "Alert List",
    [WidgetType.NOTIFICATION_LIST]: "Notification List",
    [WidgetType.TASK_LIST]: "Task List",

    // Maps
    [WidgetType.MAP]: "Map",
    [WidgetType.GEO_CHART]: "Geo Chart",

    // Special
    [WidgetType.RISK_MATRIX]: "Risk Matrix",
    [WidgetType.COMPLIANCE_OVERVIEW]: "Compliance Overview",
    [WidgetType.BCM_OVERVIEW]: "BCM Overview",
    [WidgetType.INCIDENT_OVERVIEW]: "Incident Overview",
    [WidgetType.TRAINING_OVERVIEW]: "Training Overview",
    [WidgetType.WORKFLOW_OVERVIEW]: "Workflow Overview",
    [WidgetType.MATURITY_GAUGE]: "Maturity Gauge",
    [WidgetType.QUICK_ACTIONS]: "Quick Actions",
    [WidgetType.ANNOUNCEMENTS]: "Announcements",
    [WidgetType.WEATHER]: "Weather",
    [WidgetType.CLOCK]: "Clock",
    [WidgetType.CUSTOM]: "Custom Widget",
};

export const WIDGET_TYPE_ICONS: Record<WidgetType, string> = {
    // Charts
    [WidgetType.PIE_CHART]: "pie_chart",
    [WidgetType.BAR_CHART]: "bar_chart",
    [WidgetType.LINE_CHART]: "show_chart",
    [WidgetType.AREA_CHART]: "area_chart",
    [WidgetType.DONUT_CHART]: "donut_large",
    [WidgetType.RADAR_CHART]: "radar",
    [WidgetType.HEATMAP]: "grid_on",
    [WidgetType.GAUGE]: "speed",
    [WidgetType.SPARKLINE]: "timeline",

    // Data
    [WidgetType.STAT_CARD]: "analytics",
    [WidgetType.KPI_CARD]: "speed",
    [WidgetType.METRIC_TILE]: "dashboard",
    [WidgetType.COUNTER]: "tag",
    [WidgetType.PROGRESS_BAR]: "linear_scale",
    [WidgetType.PROGRESS_RING]: "donut_small",

    // Lists
    [WidgetType.DATA_TABLE]: "table_chart",
    [WidgetType.LIST]: "list",
    [WidgetType.TIMELINE]: "timeline",
    [WidgetType.ACTIVITY_FEED]: "rss_feed",
    [WidgetType.RECENT_ITEMS]: "history",
    [WidgetType.TOP_ITEMS]: "leaderboard",

    // Calendar
    [WidgetType.CALENDAR]: "calendar_month",
    [WidgetType.UPCOMING_EVENTS]: "event",
    [WidgetType.SCHEDULE]: "schedule",

    // Status
    [WidgetType.STATUS_BOARD]: "view_kanban",
    [WidgetType.ALERT_LIST]: "notification_important",
    [WidgetType.NOTIFICATION_LIST]: "notifications",
    [WidgetType.TASK_LIST]: "checklist",

    // Maps
    [WidgetType.MAP]: "map",
    [WidgetType.GEO_CHART]: "public",

    // Special
    [WidgetType.RISK_MATRIX]: "grid_view",
    [WidgetType.COMPLIANCE_OVERVIEW]: "verified_user",
    [WidgetType.BCM_OVERVIEW]: "business_center",
    [WidgetType.INCIDENT_OVERVIEW]: "report_problem",
    [WidgetType.TRAINING_OVERVIEW]: "school",
    [WidgetType.WORKFLOW_OVERVIEW]: "account_tree",
    [WidgetType.MATURITY_GAUGE]: "trending_up",
    [WidgetType.QUICK_ACTIONS]: "flash_on",
    [WidgetType.ANNOUNCEMENTS]: "campaign",
    [WidgetType.WEATHER]: "cloud",
    [WidgetType.CLOCK]: "access_time",
    [WidgetType.CUSTOM]: "widgets",
};

export const WIDGET_TYPE_COLORS: Record<WidgetType, string> = {
    // Charts
    [WidgetType.PIE_CHART]: "blue",
    [WidgetType.BAR_CHART]: "green",
    [WidgetType.LINE_CHART]: "teal",
    [WidgetType.AREA_CHART]: "cyan",
    [WidgetType.DONUT_CHART]: "indigo",
    [WidgetType.RADAR_CHART]: "purple",
    [WidgetType.HEATMAP]: "deep-orange",
    [WidgetType.GAUGE]: "orange",
    [WidgetType.SPARKLINE]: "lime",

    // Data
    [WidgetType.STAT_CARD]: "blue-grey",
    [WidgetType.KPI_CARD]: "amber",
    [WidgetType.METRIC_TILE]: "blue",
    [WidgetType.COUNTER]: "green",
    [WidgetType.PROGRESS_BAR]: "teal",
    [WidgetType.PROGRESS_RING]: "cyan",

    // Lists
    [WidgetType.DATA_TABLE]: "indigo",
    [WidgetType.LIST]: "grey",
    [WidgetType.TIMELINE]: "purple",
    [WidgetType.ACTIVITY_FEED]: "pink",
    [WidgetType.RECENT_ITEMS]: "brown",
    [WidgetType.TOP_ITEMS]: "deep-purple",

    // Calendar
    [WidgetType.CALENDAR]: "red",
    [WidgetType.UPCOMING_EVENTS]: "orange",
    [WidgetType.SCHEDULE]: "amber",

    // Status
    [WidgetType.STATUS_BOARD]: "teal",
    [WidgetType.ALERT_LIST]: "red",
    [WidgetType.NOTIFICATION_LIST]: "blue",
    [WidgetType.TASK_LIST]: "green",

    // Maps
    [WidgetType.MAP]: "green",
    [WidgetType.GEO_CHART]: "blue",

    // Special
    [WidgetType.RISK_MATRIX]: "deep-orange",
    [WidgetType.COMPLIANCE_OVERVIEW]: "green",
    [WidgetType.BCM_OVERVIEW]: "purple",
    [WidgetType.INCIDENT_OVERVIEW]: "red",
    [WidgetType.TRAINING_OVERVIEW]: "blue",
    [WidgetType.WORKFLOW_OVERVIEW]: "teal",
    [WidgetType.MATURITY_GAUGE]: "amber",
    [WidgetType.QUICK_ACTIONS]: "orange",
    [WidgetType.ANNOUNCEMENTS]: "pink",
    [WidgetType.WEATHER]: "cyan",
    [WidgetType.CLOCK]: "grey",
    [WidgetType.CUSTOM]: "grey-7",
};

export const WIDGET_TYPE_CATEGORIES: Record<WidgetType, WidgetCategory> = {
    // Charts
    [WidgetType.PIE_CHART]: WidgetCategory.CHARTS,
    [WidgetType.BAR_CHART]: WidgetCategory.CHARTS,
    [WidgetType.LINE_CHART]: WidgetCategory.CHARTS,
    [WidgetType.AREA_CHART]: WidgetCategory.CHARTS,
    [WidgetType.DONUT_CHART]: WidgetCategory.CHARTS,
    [WidgetType.RADAR_CHART]: WidgetCategory.CHARTS,
    [WidgetType.HEATMAP]: WidgetCategory.CHARTS,
    [WidgetType.GAUGE]: WidgetCategory.CHARTS,
    [WidgetType.SPARKLINE]: WidgetCategory.CHARTS,

    // Data
    [WidgetType.STAT_CARD]: WidgetCategory.DATA,
    [WidgetType.KPI_CARD]: WidgetCategory.DATA,
    [WidgetType.METRIC_TILE]: WidgetCategory.DATA,
    [WidgetType.COUNTER]: WidgetCategory.DATA,
    [WidgetType.PROGRESS_BAR]: WidgetCategory.DATA,
    [WidgetType.PROGRESS_RING]: WidgetCategory.DATA,

    // Lists
    [WidgetType.DATA_TABLE]: WidgetCategory.LISTS,
    [WidgetType.LIST]: WidgetCategory.LISTS,
    [WidgetType.TIMELINE]: WidgetCategory.LISTS,
    [WidgetType.ACTIVITY_FEED]: WidgetCategory.LISTS,
    [WidgetType.RECENT_ITEMS]: WidgetCategory.LISTS,
    [WidgetType.TOP_ITEMS]: WidgetCategory.LISTS,

    // Calendar
    [WidgetType.CALENDAR]: WidgetCategory.CALENDAR,
    [WidgetType.UPCOMING_EVENTS]: WidgetCategory.CALENDAR,
    [WidgetType.SCHEDULE]: WidgetCategory.CALENDAR,

    // Status
    [WidgetType.STATUS_BOARD]: WidgetCategory.STATUS,
    [WidgetType.ALERT_LIST]: WidgetCategory.STATUS,
    [WidgetType.NOTIFICATION_LIST]: WidgetCategory.STATUS,
    [WidgetType.TASK_LIST]: WidgetCategory.STATUS,

    // Maps
    [WidgetType.MAP]: WidgetCategory.MAPS,
    [WidgetType.GEO_CHART]: WidgetCategory.MAPS,

    // BCM Specific
    [WidgetType.RISK_MATRIX]: WidgetCategory.BCM,
    [WidgetType.COMPLIANCE_OVERVIEW]: WidgetCategory.BCM,
    [WidgetType.BCM_OVERVIEW]: WidgetCategory.BCM,
    [WidgetType.INCIDENT_OVERVIEW]: WidgetCategory.BCM,
    [WidgetType.TRAINING_OVERVIEW]: WidgetCategory.BCM,
    [WidgetType.WORKFLOW_OVERVIEW]: WidgetCategory.BCM,
    [WidgetType.MATURITY_GAUGE]: WidgetCategory.BCM,

    // Special
    [WidgetType.QUICK_ACTIONS]: WidgetCategory.SPECIAL,
    [WidgetType.ANNOUNCEMENTS]: WidgetCategory.SPECIAL,
    [WidgetType.WEATHER]: WidgetCategory.SPECIAL,
    [WidgetType.CLOCK]: WidgetCategory.SPECIAL,

    // Custom
    [WidgetType.CUSTOM]: WidgetCategory.CUSTOM,
};

export function getWidgetTypeLabel(type: WidgetType): string {
    return WIDGET_TYPE_LABELS[type] || type;
}

export function getWidgetTypeIcon(type: WidgetType): string {
    return WIDGET_TYPE_ICONS[type] || "widgets";
}

export function getWidgetTypeColor(type: WidgetType): string {
    return WIDGET_TYPE_COLORS[type] || "grey";
}

export function getWidgetCategory(type: WidgetType): WidgetCategory {
    return WIDGET_TYPE_CATEGORIES[type] || WidgetCategory.CUSTOM;
}

export function getWidgetCategoryLabel(category: WidgetCategory): string {
    const labels: Record<WidgetCategory, string> = {
        [WidgetCategory.CHARTS]: "Charts & Graphs",
        [WidgetCategory.DATA]: "Data & Metrics",
        [WidgetCategory.LISTS]: "Lists & Tables",
        [WidgetCategory.CALENDAR]: "Calendar & Schedule",
        [WidgetCategory.STATUS]: "Status & Alerts",
        [WidgetCategory.MAPS]: "Maps & Geography",
        [WidgetCategory.BCM]: "BCM Widgets",
        [WidgetCategory.SPECIAL]: "Special Widgets",
        [WidgetCategory.CUSTOM]: "Custom Widgets",
    };
    return labels[category] || category;
}

export function getWidgetCategoryIcon(category: WidgetCategory): string {
    const icons: Record<WidgetCategory, string> = {
        [WidgetCategory.CHARTS]: "insert_chart",
        [WidgetCategory.DATA]: "analytics",
        [WidgetCategory.LISTS]: "list_alt",
        [WidgetCategory.CALENDAR]: "calendar_month",
        [WidgetCategory.STATUS]: "notifications_active",
        [WidgetCategory.MAPS]: "map",
        [WidgetCategory.BCM]: "business_center",
        [WidgetCategory.SPECIAL]: "star",
        [WidgetCategory.CUSTOM]: "widgets",
    };
    return icons[category] || "widgets";
}

export function getWidgetCategoryColor(category: WidgetCategory): string {
    const colors: Record<WidgetCategory, string> = {
        [WidgetCategory.CHARTS]: "blue",
        [WidgetCategory.DATA]: "green",
        [WidgetCategory.LISTS]: "teal",
        [WidgetCategory.CALENDAR]: "orange",
        [WidgetCategory.STATUS]: "red",
        [WidgetCategory.MAPS]: "cyan",
        [WidgetCategory.BCM]: "purple",
        [WidgetCategory.SPECIAL]: "amber",
        [WidgetCategory.CUSTOM]: "grey",
    };
    return colors[category] || "grey";
}

// ============================================
// Widget Size Helpers
// ============================================

export const WIDGET_SIZE_DIMENSIONS: Record<WidgetSize, WidgetPosition> = {
    [WidgetSize.SMALL]: { x: 0, y: 0, w: 3, h: 3 },
    [WidgetSize.MEDIUM]: { x: 0, y: 0, w: 6, h: 4 },
    [WidgetSize.LARGE]: { x: 0, y: 0, w: 8, h: 6 },
    [WidgetSize.WIDE]: { x: 0, y: 0, w: 12, h: 4 },
    [WidgetSize.TALL]: { x: 0, y: 0, w: 4, h: 8 },
    [WidgetSize.FULL]: { x: 0, y: 0, w: 12, h: 8 },
};

export const WIDGET_SIZE_LABELS: Record<WidgetSize, string> = {
    [WidgetSize.SMALL]: "Small",
    [WidgetSize.MEDIUM]: "Medium",
    [WidgetSize.LARGE]: "Large",
    [WidgetSize.WIDE]: "Wide",
    [WidgetSize.TALL]: "Tall",
    [WidgetSize.FULL]: "Full Width",
};

export function getWidgetSizeLabel(size: WidgetSize): string {
    return WIDGET_SIZE_LABELS[size] || size;
}

export function getWidgetSizeDimensions(size: WidgetSize): WidgetPosition {
    return WIDGET_SIZE_DIMENSIONS[size] || WIDGET_SIZE_DIMENSIONS[WidgetSize.MEDIUM];
}

// ============================================
// Layout Type Helpers
// ============================================

export const DASHBOARD_LAYOUT_TYPE_LABELS: Record<DashboardLayoutType, string> = {
    [DashboardLayoutType.GRID]: "Grid",
    [DashboardLayoutType.FREEFORM]: "Freeform",
    [DashboardLayoutType.MASONRY]: "Masonry",
    [DashboardLayoutType.COLUMNS]: "Columns",
    [DashboardLayoutType.TABS]: "Tabs",
};

export const DASHBOARD_LAYOUT_TYPE_ICONS: Record<DashboardLayoutType, string> = {
    [DashboardLayoutType.GRID]: "grid_view",
    [DashboardLayoutType.FREEFORM]: "drag_indicator",
    [DashboardLayoutType.MASONRY]: "view_quilt",
    [DashboardLayoutType.COLUMNS]: "view_column",
    [DashboardLayoutType.TABS]: "tab",
};

export function getDashboardLayoutTypeLabel(type: DashboardLayoutType): string {
    return DASHBOARD_LAYOUT_TYPE_LABELS[type] || type;
}

export function getDashboardLayoutTypeIcon(type: DashboardLayoutType): string {
    return DASHBOARD_LAYOUT_TYPE_ICONS[type] || "dashboard";
}

// ============================================
// Data Refresh Interval Helpers
// ============================================

export const REFRESH_INTERVAL_LABELS: Record<DataRefreshInterval, string> = {
    [DataRefreshInterval.NEVER]: "Never",
    [DataRefreshInterval.THIRTY_SECONDS]: "Every 30 seconds",
    [DataRefreshInterval.ONE_MINUTE]: "Every minute",
    [DataRefreshInterval.FIVE_MINUTES]: "Every 5 minutes",
    [DataRefreshInterval.FIFTEEN_MINUTES]: "Every 15 minutes",
    [DataRefreshInterval.THIRTY_MINUTES]: "Every 30 minutes",
    [DataRefreshInterval.ONE_HOUR]: "Every hour",
    [DataRefreshInterval.DAILY]: "Daily",
};

export function getRefreshIntervalLabel(interval: DataRefreshInterval): string {
    return REFRESH_INTERVAL_LABELS[interval] || `${interval}s`;
}

// ============================================
// Display Options Generators
// ============================================

export function getDashboardRoleOptions(): Array<{
    label: string;
    value: DashboardRole;
    color: string;
    icon: string;
}> {
    return Object.values(DashboardRole).map((role) => ({
        label: getDashboardRoleLabel(role),
        value: role,
        color: getDashboardRoleColor(role),
        icon: getDashboardRoleIcon(role),
    }));
}

export function getWidgetTypeOptions(): Array<{
    label: string;
    value: WidgetType;
    color: string;
    icon: string;
    category: WidgetCategory;
}> {
    return Object.values(WidgetType).map((type) => ({
        label: getWidgetTypeLabel(type),
        value: type,
        color: getWidgetTypeColor(type),
        icon: getWidgetTypeIcon(type),
        category: getWidgetCategory(type),
    }));
}

export function getWidgetTypeOptionsByCategory(): Record<
    WidgetCategory,
    Array<{ label: string; value: WidgetType; color: string; icon: string }>
> {
    const result = {} as Record<
        WidgetCategory,
        Array<{ label: string; value: WidgetType; color: string; icon: string }>
    >;

    for (const category of Object.values(WidgetCategory)) {
        result[category] = [];
    }

    for (const type of Object.values(WidgetType)) {
        const category = getWidgetCategory(type);
        result[category].push({
            label: getWidgetTypeLabel(type),
            value: type,
            color: getWidgetTypeColor(type),
            icon: getWidgetTypeIcon(type),
        });
    }

    return result;
}

export function getWidgetSizeOptions(): Array<{
    label: string;
    value: WidgetSize;
    dimensions: WidgetPosition;
}> {
    return Object.values(WidgetSize).map((size) => ({
        label: getWidgetSizeLabel(size),
        value: size,
        dimensions: getWidgetSizeDimensions(size),
    }));
}

export function getDashboardLayoutTypeOptions(): Array<{
    label: string;
    value: DashboardLayoutType;
    icon: string;
}> {
    return Object.values(DashboardLayoutType).map((type) => ({
        label: getDashboardLayoutTypeLabel(type),
        value: type,
        icon: getDashboardLayoutTypeIcon(type),
    }));
}

export function getRefreshIntervalOptions(): Array<{
    label: string;
    value: DataRefreshInterval;
}> {
    return Object.values(DataRefreshInterval)
        .filter((v): v is DataRefreshInterval => typeof v === "number")
        .map((interval) => ({
            label: getRefreshIntervalLabel(interval),
            value: interval,
        }));
}

// ============================================
// Dashboard Request/Response Types
// ============================================

export interface CreateDashboardRequest {
    organisationId: string;
    userId?: string;
    role: DashboardRole;
    widgets: DashboardWidget[];
    layout?: DashboardLayout;
    preferences?: DashboardPreferences;
    name?: string;
    description?: string;
    businessUnitId?: string;
    departmentId?: string;
    isActive?: boolean;
}

export interface UpdateDashboardRequest {
    role?: DashboardRole;
    widgets?: DashboardWidget[];
    layout?: DashboardLayout;
    preferences?: DashboardPreferences;
    isActive?: boolean;
    name?: string;
    description?: string;
    businessUnitId?: string;
    departmentId?: string;
}

export interface DashboardQueryParams {
    organisationId?: string;
    userId?: string;
    role?: DashboardRole;
    businessUnitId?: string;
    departmentId?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
}

export interface CreateWidgetRequest {
    type: WidgetType;
    title: string;
    config: WidgetConfig;
    position: WidgetPosition;
    dataSource: string;
    refreshInterval?: number;
    isVisible?: boolean;
}

export interface UpdateWidgetRequest {
    type?: WidgetType;
    title?: string;
    config?: WidgetConfig;
    position?: WidgetPosition;
    dataSource?: string;
    refreshInterval?: number;
    isVisible?: boolean;
}

export interface ReorderWidgetsRequest {
    widgets: Array<{
        id: string;
        position: WidgetPosition;
    }>;
}

// ============================================
// Dashboard Statistics
// ============================================

export interface DashboardStats {
    totalDashboards: number;
    byRole: Record<DashboardRole, number>;
    personalDashboards: number;
    organisationDashboards: number;
    businessUnitDashboards: number;
    departmentDashboards: number;
    activeDashboards: number;
    inactiveDashboards: number;
    totalWidgets: number;
    averageWidgetsPerDashboard: number;
}

export interface WidgetUsageStats {
    widgetType: WidgetType;
    count: number;
    percentage: number;
    dashboards: string[];
}

export interface DashboardUsageStats {
    dashboardId: string;
    viewCount: number;
    lastViewedAt?: Date;
    averageSessionDuration: number;
    mostUsedWidgets: WidgetType[];
}

// ============================================
// Default Dashboard Configurations
// ============================================

export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayout = {
    type: DashboardLayoutType.GRID,
    columns: 12,
    rowHeight: 80,
    gap: 16,
    padding: 16,
    compactType: "vertical",
    preventCollision: false,
};

export const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
    theme: "system",
    showHeader: true,
    showFooter: false,
    showFilters: true,
    showRefreshButton: true,
    showFullscreenButton: true,
    showSettingsButton: true,
    autoRefresh: true,
    autoRefreshInterval: 300,
    defaultTimeRange: "last30days",
    timezone: "UTC",
    locale: "en",
};

// ============================================
// Pre-built Dashboard Templates by Role
// ============================================

export interface DashboardTemplate {
    role: DashboardRole;
    name: string;
    description: string;
    widgets: Omit<DashboardWidget, "id">[];
}

export const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
    {
        role: DashboardRole.EXECUTIVE,
        name: "Executive Dashboard",
        description: "High-level overview of BCM, risk, and compliance status",
        widgets: [
            {
                type: WidgetType.BCM_OVERVIEW,
                title: "BCM Overview",
                config: {},
                position: { x: 0, y: 0, w: 6, h: 4 },
                dataSource: "bcm.overview",
                refreshInterval: 300,
            },
            {
                type: WidgetType.KPI_CARD,
                title: "Key Metrics",
                config: {},
                position: { x: 6, y: 0, w: 6, h: 4 },
                dataSource: "metrics.kpi",
                refreshInterval: 300,
            },
            {
                type: WidgetType.RISK_MATRIX,
                title: "Risk Matrix",
                config: {},
                position: { x: 0, y: 4, w: 6, h: 6 },
                dataSource: "risk.matrix",
                refreshInterval: 600,
            },
            {
                type: WidgetType.COMPLIANCE_OVERVIEW,
                title: "Compliance Status",
                config: {},
                position: { x: 6, y: 4, w: 6, h: 6 },
                dataSource: "compliance.overview",
                refreshInterval: 600,
            },
        ],
    },
    {
        role: DashboardRole.BCM_COORDINATOR,
        name: "BCM Coordinator Dashboard",
        description: "Operational view of BCPs, incidents, and exercises",
        widgets: [
            {
                type: WidgetType.STAT_CARD,
                title: "Active BCPs",
                config: { metric: "activeBcps" },
                position: { x: 0, y: 0, w: 3, h: 3 },
                dataSource: "bcm.activeBcps",
                refreshInterval: 300,
            },
            {
                type: WidgetType.STAT_CARD,
                title: "Open Incidents",
                config: { metric: "openIncidents" },
                position: { x: 3, y: 0, w: 3, h: 3 },
                dataSource: "incidents.open",
                refreshInterval: 60,
            },
            {
                type: WidgetType.STAT_CARD,
                title: "Upcoming Exercises",
                config: { metric: "upcomingExercises" },
                position: { x: 6, y: 0, w: 3, h: 3 },
                dataSource: "exercises.upcoming",
                refreshInterval: 300,
            },
            {
                type: WidgetType.STAT_CARD,
                title: "Plans Due for Review",
                config: { metric: "plansDueForReview" },
                position: { x: 9, y: 0, w: 3, h: 3 },
                dataSource: "bcps.dueForReview",
                refreshInterval: 3600,
            },
            {
                type: WidgetType.INCIDENT_OVERVIEW,
                title: "Recent Incidents",
                config: { limit: 5 },
                position: { x: 0, y: 3, w: 6, h: 6 },
                dataSource: "incidents.recent",
                refreshInterval: 60,
            },
            {
                type: WidgetType.UPCOMING_EVENTS,
                title: "Upcoming Events",
                config: { limit: 10 },
                position: { x: 6, y: 3, w: 6, h: 6 },
                dataSource: "events.upcoming",
                refreshInterval: 300,
            },
        ],
    },
    {
        role: DashboardRole.RISK_MANAGER,
        name: "Risk Manager Dashboard",
        description: "Risk assessment and mitigation tracking",
        widgets: [
            {
                type: WidgetType.STAT_CARD,
                title: "Total Risks",
                config: { metric: "totalRisks" },
                position: { x: 0, y: 0, w: 3, h: 3 },
                dataSource: "risks.total",
                refreshInterval: 300,
            },
            {
                type: WidgetType.STAT_CARD,
                title: "High Risks",
                config: { metric: "highRisks" },
                position: { x: 3, y: 0, w: 3, h: 3 },
                dataSource: "risks.high",
                refreshInterval: 300,
            },
            {
                type: WidgetType.STAT_CARD,
                title: "Overdue Reviews",
                config: { metric: "overdueReviews" },
                position: { x: 6, y: 0, w: 3, h: 3 },
                dataSource: "risks.overdueReviews",
                refreshInterval: 3600,
            },
            {
                type: WidgetType.STAT_CARD,
                title: "Pending Approvals",
                config: { metric: "pendingApprovals" },
                position: { x: 9, y: 0, w: 3, h: 3 },
                dataSource: "risks.pendingApprovals",
                refreshInterval: 300,
            },
            {
                type: WidgetType.RISK_MATRIX,
                title: "Risk Matrix",
                config: {},
                position: { x: 0, y: 3, w: 6, h: 6 },
                dataSource: "risks.matrix",
                refreshInterval: 600,
            },
            {
                type: WidgetType.PIE_CHART,
                title: "Risks by Category",
                config: { groupBy: "category" },
                position: { x: 6, y: 3, w: 6, h: 6 },
                dataSource: "risks.byCategory",
                refreshInterval: 600,
            },
        ],
    },
    {
        role: DashboardRole.COMPLIANCE_OFFICER,
        name: "Compliance Officer Dashboard",
        description: "Compliance status and audit tracking",
        widgets: [
            {
                type: WidgetType.STAT_CARD,
                title: "Compliance Rate",
                config: { metric: "complianceRate", suffix: "%" },
                position: { x: 0, y: 0, w: 4, h: 3 },
                dataSource: "compliance.rate",
                refreshInterval: 3600,
            },
            {
                type: WidgetType.STAT_CARD,
                title: "Overdue Audits",
                config: { metric: "overdueAudits" },
                position: { x: 4, y: 0, w: 4, h: 3 },
                dataSource: "compliance.overdueAudits",
                refreshInterval: 3600,
            },
            {
                type: WidgetType.STAT_CARD,
                title: "Upcoming Audits",
                config: { metric: "upcomingAudits" },
                position: { x: 8, y: 0, w: 4, h: 3 },
                dataSource: "compliance.upcomingAudits",
                refreshInterval: 3600,
            },
            {
                type: WidgetType.COMPLIANCE_OVERVIEW,
                title: "Compliance by Standard",
                config: {},
                position: { x: 0, y: 3, w: 12, h: 6 },
                dataSource: "compliance.byStandard",
                refreshInterval: 600,
            },
        ],
    },
    {
        role: DashboardRole.USER,
        name: "User Dashboard",
        description: "Personal dashboard for regular users",
        widgets: [
            {
                type: WidgetType.NOTIFICATION_LIST,
                title: "My Notifications",
                config: { limit: 5 },
                position: { x: 0, y: 0, w: 6, h: 4 },
                dataSource: "notifications.my",
                refreshInterval: 60,
            },
            {
                type: WidgetType.TASK_LIST,
                title: "My Tasks",
                config: { limit: 10 },
                position: { x: 6, y: 0, w: 6, h: 4 },
                dataSource: "tasks.my",
                refreshInterval: 300,
            },
            {
                type: WidgetType.UPCOMING_EVENTS,
                title: "Upcoming Events",
                config: { limit: 5 },
                position: { x: 0, y: 4, w: 12, h: 4 },
                dataSource: "events.upcoming",
                refreshInterval: 300,
            },
        ],
    },
];

export function getDashboardTemplateForRole(
    role: DashboardRole
): DashboardTemplate | undefined {
    return DASHBOARD_TEMPLATES.find((t) => t.role === role);
}

export function getDefaultWidgetsForRole(
    role: DashboardRole
): Omit<DashboardWidget, "id">[] {
    return getDashboardTemplateForRole(role)?.widgets || [];
}