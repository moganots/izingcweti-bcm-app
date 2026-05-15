import 'vue-router'

/**
 * Extend Vue Router's RouteMeta interface
 */
declare module 'vue-router' {
    interface RouteMeta {
        /** Page title for header and document title */
        title?: string
        /** Icon for navigation menu */
        icon?: string
        /** Whether page requires authentication */
        requiresAuth?: boolean
        /** Whether page requires guest (unauthenticated) access */
        requiresGuest?: boolean
        /** Required user roles to access this page */
        roles?: string[]
        /** Required permissions to access this page */
        permissions?: string[]
        /** Whether to show in navigation menu */
        showInMenu?: boolean
        /** Show back button in header */
        showBack?: boolean
        /** Transition animation name */
        transition?: string
        /** Order in navigation menu */
        order?: number
        /** Badge to show in menu */
        badge?: string | number
        /** Badge color */
        badgeColor?: string
    }
}
