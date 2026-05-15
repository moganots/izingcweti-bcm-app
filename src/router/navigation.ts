import { router } from './index'

/**
 * Route name constants for type safety
 */
export const ROUTE_NAMES = {
    DASHBOARD: 'Dashboard',
    LOGIN: 'Login',
    CRITICAL_FUNCTION_DETAIL: 'CriticalFunctionDetail',
    BIA_DETAIL: 'BIADetail',
    BCP_DETAIL: 'BCPDetail',
    RISK_DETAIL: 'RiskDetail',
    INCIDENT_DETAIL: 'IncidentDetail',
    WORKFLOW_DETAIL: 'WorkflowDetail',
    DOCUMENT_DETAIL: 'DocumentDetail',
    RULE_DETAIL: 'RuleDetail',
    COMPLIANCE_DETAIL: 'ComplianceDetail',
    AUDIT_DETAIL: 'AuditDetail',
} as const

/**
 * Entity type to route name mapping
 */
const ENTITY_ROUTE_MAP: Record<string, string> = {
    'critical-function': ROUTE_NAMES.CRITICAL_FUNCTION_DETAIL,
    bia: ROUTE_NAMES.BIA_DETAIL,
    bcp: ROUTE_NAMES.BCP_DETAIL,
    risk: ROUTE_NAMES.RISK_DETAIL,
    incident: ROUTE_NAMES.INCIDENT_DETAIL,
    workflow: ROUTE_NAMES.WORKFLOW_DETAIL,
    document: ROUTE_NAMES.DOCUMENT_DETAIL,
    rule: ROUTE_NAMES.RULE_DETAIL,
    compliance: ROUTE_NAMES.COMPLIANCE_DETAIL,
    audit: ROUTE_NAMES.AUDIT_DETAIL,
}

/**
 * Navigation helper functions
 * Provides type-safe navigation methods for common routes
 */
export const navigate = {
    /**
     * Navigate to dashboard
     */
    toDashboard(): void {
        router.push({ name: ROUTE_NAMES.DASHBOARD })
    },

    /**
     * Navigate to login with optional redirect URL
     * @param redirect - URL to redirect to after successful login
     */
    toLogin(redirect?: string): void {
        router.push({
            name: ROUTE_NAMES.LOGIN,
            query: redirect ? { redirect } : undefined,
        } as any)
    },

    /**
     * Navigate to a BCM entity detail page
     * @param entityType - Type of entity (e.g., 'incident', 'risk', 'bcp')
     * @param id - UUID of the entity
     */
    toEntityDetail(entityType: string, id: string): void {
        const routeName = ENTITY_ROUTE_MAP[entityType]
        if (routeName) {
            router.push({ name: routeName, params: { id } })
        } else {
            console.warn(`Unknown entity type: ${entityType}`)
            router.push({ name: ROUTE_NAMES.DASHBOARD })
        }
    },

    /**
     * Navigate back if history exists, otherwise go to fallback
     * @param fallback - Route name to navigate to if no history exists
     */
    goBack(fallback: string = ROUTE_NAMES.DASHBOARD): void {
        if (window.history.length > 2) {
            router.back()
        } else {
            router.push({ name: fallback })
        }
    },

    /**
     * Navigate to a named route with optional params and query
     * @param name - Route name
     * @param params - Route params
     * @param query - Query parameters
     */
    to(name: string, params?: Record<string, string>, query?: Record<string, string>): void {
        router.push({ name, params, query } as any)
    },

    /**
     * Replace current route with a new one
     * @param name - Route name to replace with
     * @param params - Route params
     */
    replace(name: string, params?: Record<string, string>): void {
        router.replace({ name, params } as any)
    },

    /**
     * Navigate to a specific path
     * @param path - Full path to navigate to
     */
    toPath(path: string): void {
        router.push(path)
    },

    /**
     * Navigate to the notifications page
     */
    toNotifications(): void {
        router.push({ name: 'Notifications' })
    },

    /**
     * Navigate to the settings page
     */
    toSettings(): void {
        router.push({ name: 'Settings' })
    },

    /**
     * Navigate to the profile page
     */
    toProfile(): void {
        router.push({ name: 'Profile' })
    },

    /**
     * Navigate to create a new entity
     * @param entityType - Type of entity to create
     */
    toCreate(entityType: string): void {
        const createRoutes: Record<string, string> = {
            incident: 'IncidentCreate',
            risk: 'RiskCreate',
            bcp: 'BCPCreate',
            bia: 'BIACreate',
            workflow: 'WorkflowCreate',
            document: 'DocumentUpload',
            rule: 'RuleCreate',
        }
        const routeName = createRoutes[entityType]
        if (routeName) {
            router.push({ name: routeName })
        }
    },

    /**
     * Navigate to entity list page
     * @param entityType - Type of entity list to view
     */
    toList(entityType: string): void {
        const listRoutes: Record<string, string> = {
            incidents: 'Incidents',
            risks: 'Risks',
            bcp: 'BCP',
            bia: 'BIA',
            workflows: 'Workflows',
            documents: 'Documents',
            rules: 'Rules',
            compliance: 'Compliance',
        }
        const routeName = listRoutes[entityType]
        if (routeName) {
            router.push({ name: routeName })
        }
    },
}
