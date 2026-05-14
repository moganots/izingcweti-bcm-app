// src/router/guards.ts
import type { Router } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

export function setupAuthGuards(router: Router): void {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

    // Check authentication status
    if (!authStore.isInitialized) {
      await authStore.checkAuth();
    }

    if (requiresAuth && !authStore.isAuthenticated) {
      // Redirect to login if not authenticated
      next({ name: 'Login', query: { redirect: to.fullPath } });
    } else if (!requiresAuth && authStore.isAuthenticated && to.name === 'Login') {
      // Redirect to dashboard if already authenticated
      next({ name: 'Dashboard' });
    } else {
      next();
    }
  });
}