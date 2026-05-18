import type { RouteRecordRaw } from 'vue-router'

/**
 * Application Routes
 * Defines all routes for the BCM Mobile Application
 */
const routes: RouteRecordRaw[] = [
  // ============================================
  // Authentication Routes (Public)
  // ============================================
  {
    path: '/auth',
    component: () => import('layouts/auth/AuthLayout.vue'),
    meta: { requiresGuest: false },
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('pages/auth/LoginPage.vue'),
        meta: { title: 'Sign In', requiresGuest: false },
      },
      {
        path: 'forgot-password',
        name: 'ForgotPassword',
        component: () => import('pages/auth/ForgotPasswordPage.vue'),
        meta: { title: 'Forgot Password', requiresGuest: false },
      },
      {
        path: 'reset-password/:token',
        name: 'ResetPassword',
        component: () => import('pages/auth/ResetPasswordPage.vue'),
        meta: { title: 'Reset Password', requiresGuest: false },
      },
    ],
  },

  /*
  // ============================================
  // Main Application Routes (Authenticated)
  // ============================================
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // ==========================================
      // Dashboard
      // ==========================================
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('pages/dashboard/DashboardPage.vue'),
        meta: { title: 'Dashboard', icon: 'dashboard', showInMenu: true },
      },
      {
        path: 'dashboard/widgets',
        name: 'DashboardWidgets',
        component: () => import('pages/dashboard/DashboardWidgetsPage.vue'),
        meta: { title: 'Dashboard Widgets', icon: 'widgets' },
      },

      // ==========================================
      // BCM Module
      // ==========================================
      {
        path: 'bcm',
        meta: { title: 'BCM', icon: 'business' },
        children: [
          {
            path: 'critical-functions',
            name: 'CriticalFunctions',
            component: () => import('pages/bcm/CriticalFunctionsPage.vue'),
            meta: { title: 'Critical Functions', icon: 'functions', showInMenu: true },
          },
          {
            path: 'critical-functions/:id',
            name: 'CriticalFunctionDetail',
            component: () => import('pages/bcm/CriticalFunctionDetailPage.vue'),
            meta: { title: 'Critical Function Detail' },
          },
          {
            path: 'bia',
            name: 'BIA',
            component: () => import('pages/bcm/BiaListPage.vue'),
            meta: { title: 'Business Impact Analysis', icon: 'assessment', showInMenu: true },
          },
          {
            path: 'bia/create',
            name: 'BIACreate',
            component: () => import('pages/bcm/BiaCreatePage.vue'),
            meta: { title: 'Create BIA' },
          },
          {
            path: 'bia/:id',
            name: 'BIADetail',
            component: () => import('pages/bcm/BiaDetailPage.vue'),
            meta: { title: 'BIA Detail' },
          },
          {
            path: 'bcp',
            name: 'BCP',
            component: () => import('pages/bcm/BcpListPage.vue'),
            meta: { title: 'Business Continuity Plans', icon: 'description', showInMenu: true },
          },
          {
            path: 'bcp/create',
            name: 'BCPCreate',
            component: () => import('pages/bcm/BcpCreatePage.vue'),
            meta: { title: 'Create BCP' },
          },
          {
            path: 'bcp/:id',
            name: 'BCPDetail',
            component: () => import('pages/bcm/BcpDetailPage.vue'),
            meta: { title: 'BCP Detail' },
          },
          {
            path: 'recovery-strategies',
            name: 'RecoveryStrategies',
            component: () => import('pages/bcm/RecoveryStrategiesPage.vue'),
            meta: { title: 'Recovery Strategies', icon: 'restore', showInMenu: true },
          },
          {
            path: 'exercise-tests',
            name: 'ExerciseTests',
            component: () => import('pages/bcm/ExerciseTestsPage.vue'),
            meta: { title: 'Exercise Tests', icon: 'playlist_add_check', showInMenu: true },
          },
        ],
      },

      // ==========================================
      // Risk Management
      // ==========================================
      {
        path: 'risks',
        name: 'Risks',
        component: () => import('pages/risk/RiskListPage.vue'),
        meta: { title: 'Risk Management', icon: 'warning', showInMenu: true },
      },
      {
        path: 'risks/:id',
        name: 'RiskDetail',
        component: () => import('pages/risk/RiskDetailPage.vue'),
        meta: { title: 'Risk Detail' },
      },

      // ==========================================
      // Compliance
      // ==========================================
      {
        path: 'compliance',
        name: 'Compliance',
        component: () => import('pages/compliance/ComplianceListPage.vue'),
        meta: { title: 'Compliance', icon: 'verified_user', showInMenu: true },
      },
      {
        path: 'compliance/:id',
        name: 'ComplianceDetail',
        component: () => import('pages/compliance/ComplianceDetailPage.vue'),
        meta: { title: 'Compliance Detail' },
      },

      // ==========================================
      // Incident Management
      // ==========================================
      {
        path: 'incidents',
        name: 'Incidents',
        component: () => import('pages/incident/IncidentListPage.vue'),
        meta: { title: 'Incident Management', icon: 'report', showInMenu: true },
      },
      {
        path: 'incidents/:id',
        name: 'IncidentDetail',
        component: () => import('pages/incident/IncidentDetailPage.vue'),
        meta: { title: 'Incident Detail' },
      },

      // ==========================================
      // Workflow Management
      // ==========================================
      {
        path: 'workflows',
        name: 'Workflows',
        component: () => import('pages/workflow/WorkflowListPage.vue'),
        meta: { title: 'Workflows', icon: 'account_tree', showInMenu: true },
      },
      {
        path: 'workflows/:id',
        name: 'WorkflowDetail',
        component: () => import('pages/workflow/WorkflowDetailPage.vue'),
        meta: { title: 'Workflow Detail' },
      },

      // ==========================================
      // Rules Engine
      // ==========================================
      {
        path: 'rules',
        name: 'Rules',
        component: () => import('pages/rules/RulesListPage.vue'),
        meta: { title: 'Business Rules', icon: 'rule', showInMenu: true },
      },
      {
        path: 'rules/:id',
        name: 'RuleDetail',
        component: () => import('pages/rules/RuleDetailPage.vue'),
        meta: { title: 'Rule Detail' },
      },

      // ==========================================
      // Documents
      // ==========================================
      {
        path: 'documents',
        name: 'Documents',
        component: () => import('pages/documents/DocumentsPage.vue'),
        meta: { title: 'Documents', icon: 'folder', showInMenu: true },
      },
      {
        path: 'documents/upload',
        name: 'DocumentUpload',
        component: () => import('pages/documents/DocumentUploadPage.vue'),
        meta: { title: 'Upload Document' },
      },
      {
        path: 'documents/:id',
        name: 'DocumentDetail',
        component: () => import('pages/documents/DocumentDetailPage.vue'),
        meta: { title: 'Document Detail' },
      },

      // ==========================================
      // Notifications
      // ==========================================
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('pages/notifications/NotificationsPage.vue'),
        meta: { title: 'Notifications', icon: 'notifications', showInMenu: true },
      },
      {
        path: 'notifications/settings',
        name: 'NotificationSettings',
        component: () => import('pages/notifications/NotificationSettingsPage.vue'),
        meta: { title: 'Notification Settings' },
      },

      // ==========================================
      // Sync Management
      // ==========================================
      {
        path: 'sync',
        name: 'SyncDashboard',
        component: () => import('pages/sync/SyncDashboardPage.vue'),
        meta: { title: 'Synchronization', icon: 'sync' },
      },
      {
        path: 'sync/settings',
        name: 'SyncSettings',
        component: () => import('pages/sync/SyncSettingsPage.vue'),
        meta: { title: 'Sync Settings' },
      },

      // ==========================================
      // Cache Management
      // ==========================================
      {
        path: 'cache',
        name: 'CacheDashboard',
        component: () => import('pages/cache/CacheDashboardPage.vue'),
        meta: { title: 'Cache Management', icon: 'storage' },
      },
      {
        path: 'cache/settings',
        name: 'CacheSettings',
        component: () => import('pages/cache/CacheSettingsPage.vue'),
        meta: { title: 'Cache Settings' },
      },

      // ==========================================
      // User Profile
      // ==========================================
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('pages/auth/ProfilePage.vue'),
        meta: { title: 'Profile', icon: 'person', showInMenu: true },
      },

      // ==========================================
      // Settings
      // ==========================================
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('pages/settings/SettingsPage.vue'),
        meta: { title: 'Settings', icon: 'settings', showInMenu: true },
      },

      // ==========================================
      // Audit Logs
      // ==========================================
      {
        path: 'audit',
        name: 'AuditLogs',
        component: () => import('pages/audit/AuditLogsPage.vue'),
        meta: {
          title: 'Audit Logs',
          icon: 'history',
          roles: ['System Administrator', 'Super Admin', 'Auditor'],
        },
      },
    ],
  },

  */

  // ============================================
  // Error Routes
  // ============================================
  {
    path: '/:catchAll(.*)*',
    name: 'ErrorNotFound',
    component: () => import('pages/auth/ErrorNotFoundPage.vue'),
    meta: { title: 'Page Not Found' },
  },
]

export default routes
