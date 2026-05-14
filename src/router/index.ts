// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import { setupAuthGuards } from './guards';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// Setup navigation guards
setupAuthGuards(router);

export default router;