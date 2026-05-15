// src/router/routes.ts
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: () => import('../layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('../pages/auth/LoginPage.vue'),
        meta: { requiresAuth: false },
      },
      {
        path: 'forgot-password',
        name: 'ForgotPassword',
        component: () => import('../pages/auth/ForgotPasswordPage.vue'),
        meta: { requiresAuth: false },
      },
    ],
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../pages/dashboard/DashboardPage.vue'),
        meta: { title: 'Dashboard', icon: 'dashboard' },
      },
      {
        path: 'bcm/critical-functions',
        name: 'CriticalFunctions',
        component: () => import('../pages/bcm/CriticalFunctionsPage.vue'),
        meta: { title: 'Critical Functions', icon: 'functions' },
      },
      {
        path: 'bcm/bia',
        name: 'BIA',
        component: () => import('../pages/bcm/BiaListPage.vue'),
        meta: { title: 'Business Impact Analysis', icon: 'assessment' },
      },
      {
        path: 'bcm/bia/:id',
        name: 'BIADetail',
        component: () => import('../pages/bcm/BiaDetailPage.vue'),
        meta: { title: 'BIA Detail' },
      },
      {
        path: 'bcm/bcp',
        name: 'BCP',
        component: () => import('../pages/bcm/BcpListPage.vue'),
        meta: { title: 'Business Continuity Plans', icon: 'description' },
      },
      {
        path: 'bcm/bcp/:id',
        name: 'BCPDetail',
        component: () => import('../pages/bcm/BcpDetailPage.vue'),
        meta: { title: 'BCP Detail' },
      },
      {
        path: 'bcm/recovery-strategies',
        name: 'RecoveryStrategies',
        component: () => import('../pages/bcm/RecoveryStrategiesPage.vue'),
        meta: { title: 'Recovery Strategies', icon: 'restore' },
      },
      {
        path: 'bcm/exercise-tests',
        name: 'ExerciseTests',
        component: () => import('../pages/bcm/ExerciseTestsPage.vue'),
        meta: { title: 'Exercise Tests', icon: 'playlist_add_check' },
      },
      {
        path: 'risks',
        name: 'Risks',
        component: () => import('../pages/risk/RiskListPage.vue'),
        meta: { title: 'Risk Management', icon: 'warning' },
      },
      {
        path: 'risks/:id',
        name: 'RiskDetail',
        component: () => import('../pages/risk/RiskDetailPage.vue'),
        meta: { title: 'Risk Detail' },
      },
      {
        path: 'incidents',
        name: 'Incidents',
        component: () => import('../pages/incident/IncidentListPage.vue'),
        meta: { title: 'Incident Management', icon: 'report' },
      },
      {
        path: 'incidents/:id',
        name: 'IncidentDetail',
        component: () => import('../pages/incident/IncidentDetailPage.vue'),
        meta: { title: 'Incident Detail' },
      },
      {
        path: 'workflows',
        name: 'Workflows',
        component: () => import('../pages/workflow/WorkflowListPage.vue'),
        meta: { title: 'Workflows', icon: 'account_tree' },
      },
      {
        path: 'workflows/:id',
        name: 'WorkflowDetail',
        component: () => import('../pages/workflow/WorkflowDetailPage.vue'),
        meta: { title: 'Workflow Detail' },
      },
      {
        path: 'documents',
        name: 'Documents',
        component: () => import('../pages/documents/DocumentsPage.vue'),
        meta: { title: 'Documents', icon: 'folder' },
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('../pages/notifications/NotificationsPage.vue'),
        meta: { title: 'Notifications', icon: 'notifications' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../pages/auth/ProfilePage.vue'),
        meta: { title: 'Profile', icon: 'person' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../pages/settings/SettingsPage.vue'),
        meta: { title: 'Settings', icon: 'settings' },
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/auth/ErrorNotFoundPage.vue'),
  },
];

export default routes;