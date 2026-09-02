<template>
  <q-header elevated :class="headerClass">
    <q-toolbar>
      <!-- Logo and App Name (Left Aligned) -->
      <div class="row items-center cursor-pointer" style="min-width: 80px" @click="$router.push('/dashboard')">
        <q-avatar size="36px" class="q-mr-sm">
          <img src="/izingcweti-logo-icon-no-bg.png" alt="Logo" />
        </q-avatar>
        <div>
          <div class="text-weight-bold">{{ appName }}</div>
          <div class="text-caption" style="font-size: 10px; line-height: 1.2">
            {{ companyName }}
          </div>
        </div>
      </div>

      <!-- Page Title with Back Button (Centered - takes available space) -->
      <div class="row justify-center items-center" style="flex: 1">
        <!-- Back Button -->
        <q-btn size="0.6em" v-if="canGoBack" dense round icon="keyboard_arrow_left" class="q-mr-sm" @click="goBack">
          <q-tooltip>Go Back</q-tooltip>
        </q-btn>

        <div class="text-h6 text-weight-medium text-center" style="font-size: 0.8em">
          {{ pageTitle }}
        </div>
      </div>

      <!-- Right Aligned Buttons -->
      <div class="row items-center q-gutter-sm" style="min-width: 70px; justify-content: flex-end">
        <!-- Connectivity Status Indicator -->
        <q-btn dense round :icon="isOffline ? 'wifi_off' : 'wifi'" :color="isOffline ? 'red' : 'green'" size="0.7em"
          @click="toggleNetworkInfo">
          <q-tooltip>{{
            isOffline ? 'Offline Mode - No connection' : 'Online Mode - Connected'
          }}</q-tooltip>
        </q-btn>

        <!-- Notifications Button -->
        <q-btn round :icon="'notifications'" size="0.7em" @click="openNotifications">
          <q-badge v-if="unreadCount > 0" color="red" floating transparent>
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </q-badge>
        </q-btn>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore, useNotificationStore } from '../../stores'
import { useNetwork } from '../../composables/useNetwork'
import AppConfig from 'src/utils/config'

defineProps<{ pageIcon?: string; pageTitle?: string }>()

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const { isOnline, connectionType } = useNetwork()

const companyName = AppConfig.app.company.name || 'Izingcweti'
const appName = AppConfig.app.shortName || 'BCM App'

const isOffline = computed(() => !isOnline.value)
const headerClass = computed(() => 'bg-primary text-white')
const pageTitle = computed(() => (route.meta?.title as string) || 'Dashboard')

// Notification state
const unreadCount = computed(() => notificationStore.unreadCount || 0)

// Check if there's a previous page in navigation history
const canGoBack = computed(() => window.history.length > 1)

// Navigate back
function goBack(): void {
  router.back()
}

function toggleNetworkInfo(): void {
  const connectionTypeLabel = connectionType.value || 'unknown'
  const status = isOffline.value ? 'Offline' : 'Online'

  $q.dialog({
    title: 'Network Status',
    message: `
      Status: ${status}
      Connection: ${connectionTypeLabel}
      Last checked: ${new Date().toLocaleTimeString()}
    `,
    ok: 'OK',
    persistent: false,
  })
}

function openNotifications(): void {
  router.push('/notifications')
}

// Load notification counts on mount
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await notificationStore.fetchCounts()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  // No cleanup needed
})
</script>

<style lang="scss" scoped>
:deep(.q-toolbar) {
  min-height: 56px;
}

// Mobile responsive adjustments
@media (max-width: 600px) {
  :deep(.q-toolbar) {
    padding: 0 8px;
  }

  .text-h6 {
    font-size: 1rem;
  }

  .q-avatar {
    width: 28px;
    height: 28px;
  }

  .text-weight-bold {
    font-size: 0.875rem;
  }

  .text-caption {
    font-size: 8px;
  }

  .q-btn--round {
    font-size: 20px;
    width: 32px;
    height: 32px;
  }

  .q-gutter-sm {
    gap: 0.2em;
  }
}

@media (min-width: 601px) and (max-width: 1024px) {
  .q-btn--round {
    font-size: 22px;
    width: 36px;
    height: 36px;
  }
}
</style>