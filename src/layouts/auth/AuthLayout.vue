<!-- src/layouts/auth/AuthLayout.vue -->
<template>
  <q-layout view="hHh LpR fFf">
    <q-page-container>
      <div class="auth-container row items-center justify-center">
        <div class="auth-card col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
          <div class="text-center q-mb-lg">
            <q-img
              src="/logo.svg"
              :width="80"
              :height="80"
              class="q-mb-md"
              fallback-src="/fallback-logo.png"
            />
            <div class="text-h4 text-primary q-mb-xs">
              {{ appName }}
            </div>
            <div class="text-subtitle2 text-grey-6">
              Business Continuity Management System
            </div>
          </div>

          <q-card flat bordered class="auth-card-content">
            <q-card-section>
              <router-view />
            </q-card-section>
          </q-card>

          <div class="text-center q-mt-lg text-caption text-grey-6">
            &copy; {{ currentYear }} {{ appName }}. All rights reserved.
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const appName = import.meta.env.VITE_APP_NAME || 'Izingcweti BCM'
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped lang="scss">
.auth-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
  padding: 20px;
}

.auth-card {
  backdrop-filter: blur(10px);
}

.auth-card-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
}
</style>