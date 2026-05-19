<template>
  <q-header elevated :class="headerClass">
    <q-toolbar>
      <!-- Logo and App Name (Left Aligned) -->
      <div
        class="row items-center cursor-pointer"
        style="min-width: 120px"
        @click="$router.push('/dashboard')"
      >
        <q-avatar size="36px" class="q-mr-sm">
          <img src="/izingcweti-logo-icon-no-bg.png" alt="Logo" />
        </q-avatar>
        <div>
          <div class="text-weight-bold">{{ appShortName }}</div>
          <div class="text-caption" style="font-size: 10px; line-height: 1.2">
            {{ companyName }}
          </div>
        </div>
      </div>

      <!-- Page Title (Centered - takes available space) -->
      <div class="row justify-center" style="flex: 1">
        <div class="text-h6 text-weight-medium text-center">
          {{ pageTitle }}
        </div>
      </div>

      <!-- Right Aligned Buttons -->
      <div class="row items-center q-gutter-sm" style="min-width: 120px; justify-content: flex-end">
        <!-- QR Code Scanner Button -->
        <q-btn flat dense round icon="qr_code_scanner" @click="openQRScanner">
          <q-tooltip>Scan QR Code</q-tooltip>
        </q-btn>

        <!-- Offline Indicator -->
        <q-btn v-if="isOffline" flat dense round icon="wifi_off" color="orange">
          <q-tooltip>Offline Mode</q-tooltip>
        </q-btn>

        <!-- Sync Button with Badge -->
        <q-btn
          v-if="syncStore.hasPendingChanges"
          flat
          dense
          round
          icon="sync"
          :color="syncStore.isSyncing ? 'orange' : 'white'"
          @click="handleSync"
        >
          <q-badge v-if="syncStore.pendingCount > 0" floating color="red">
            {{ syncStore.pendingCount > 99 ? '99+' : syncStore.pendingCount }}
          </q-badge>
          <q-tooltip>{{ syncStore.isSyncing ? 'Syncing...' : 'Sync Now' }}</q-tooltip>
        </q-btn>

        <!-- Notifications Button -->
        <q-btn flat dense round icon="notifications" @click="$router.push('/notifications')">
          <q-badge v-if="notificationStore.unreadCount > 0" floating color="red">
            {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
          </q-badge>
          <q-tooltip>Notifications</q-tooltip>
        </q-btn>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useSyncStore, useNotificationStore, useUiStore } from '../../stores'

const route = useRoute()
const $q = useQuasar()
const syncStore = useSyncStore()
const notificationStore = useNotificationStore()
const uiStore = useUiStore()

const props = defineProps<{ pageTitle?: string }>()

const companyName = import.meta.env.VITE_COMPANY_NAME || 'Izingcweti'
const appShortName = 'BCM'

const isOffline = computed(() => uiStore.isOffline)
const headerClass = computed(() => ({ 'bg-primary text-white': true }))
const pageTitle = computed(() => props.pageTitle || (route.meta?.title as string) || 'Dashboard')

async function handleSync(): Promise<void> {
  if (syncStore.isSyncing) return
  try {
    await syncStore.fullSync()
    $q.notify({ type: 'positive', message: 'Synced', position: 'top', timeout: 2000 })
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  }
}

function openQRScanner(): void {
  $q.dialog({
    title: 'QR Scanner',
    message: 'QR code scanning feature will open the camera',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    $q.notify({
      type: 'info',
      message: 'QR Scanner opened (integration with Capacitor)',
      position: 'top',
    })
  })
}
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
}
</style>
