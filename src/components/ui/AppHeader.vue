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
          <div class="text-weight-bold">{{ appName }}</div>
          <div class="text-caption" style="font-size: 10px; line-height: 1.2">
            {{ companyName }}
          </div>
        </div>
      </div>

      <!-- Page Title with Back Button (Centered - takes available space) -->
      <div class="row justify-center items-center" style="flex: 1">
        <!-- Back Button -->
        <q-btn v-if="canGoBack" flat dense round icon="arrow_back" class="q-mr-sm" @click="goBack">
          <q-tooltip>Go Back</q-tooltip>
        </q-btn>

        <div class="text-h6 text-weight-medium text-center">
          {{ pageTitle }}
        </div>
      </div>

      <!-- Right Aligned Buttons -->
      <div class="row items-center q-gutter-sm" style="min-width: 120px; justify-content: flex-end">
        <!-- Connectivity Status Indicator -->
        <q-btn
          flat
          dense
          round
          :icon="isOffline ? 'wifi_off' : 'wifi'"
          :color="isOffline ? 'red' : 'green'"
          size="0.9em"
          @click="toggleNetworkInfo"
        >
          <q-tooltip>{{
            isOffline ? 'Offline Mode - No connection' : 'Online Mode - Connected'
          }}</q-tooltip>
        </q-btn>

        <!-- Notifications Button -->
        <q-btn
          flat
          dense
          round
          icon="notifications"
          @click="$router.push('/notifications')"
          size="0.9em"
        >
          <q-badge v-if="notificationStore.unreadCount > 0" floating color="red">
            {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
          </q-badge>
          <q-tooltip>Notifications</q-tooltip>
        </q-btn>

        <!-- Sync Button with Badge -->
        <q-btn
          flat
          dense
          round
          icon="sync"
          :color="syncStore.isSyncing ? 'orange' : 'white'"
          :class="{ 'rotate-animation': syncStore.isSyncing }"
          :loading="syncStore.isSyncing"
          size="0.9em"
          @click="handleSync"
        >
          <q-badge v-if="syncStore.pendingCount > 0 && !syncStore.isSyncing" floating color="red">
            {{ syncStore.pendingCount > 99 ? '99+' : syncStore.pendingCount }}
          </q-badge>
          <q-tooltip>{{
            syncStore.isSyncing ? 'Syncing...' : `Sync Now (${syncStore.pendingCount} pending)`
          }}</q-tooltip>
        </q-btn>

        <!-- QR Code Scanner Button -->
        <q-btn flat dense round icon="qr_code_scanner" @click="openQRScanner" size="0.9em">
          <q-tooltip>Scan QR Code</q-tooltip>
        </q-btn>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useSyncStore, useNotificationStore, useUiStore } from '../../stores'
import { capitalizeFirstLettersAdvanced } from 'src/utils/formatters'
import AppConfig from 'src/utils/config'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const syncStore = useSyncStore()
const notificationStore = useNotificationStore()
const uiStore = useUiStore()

const props = defineProps<{ pageTitle?: string }>()

const companyName = AppConfig.app.company.name || 'Izingcweti'
const appName = AppConfig.app.shortName || 'BCM App'

const isOffline = computed(() => uiStore.isOffline)
const headerClass = computed(() => 'bg-primary text-white')
const pageTitle = computed(() => props.pageTitle || (route.meta?.title as string) || 'Dashboard')

// Check if there's a previous page in navigation history
const canGoBack = computed(() => window.history.length > 1)

// Navigate back
function goBack(): void {
  router.back()
}

async function handleSync(): Promise<void> {
  if (syncStore.isSyncing) return

  // Check if online
  if (isOffline.value) {
    $q.notify({
      type: 'warning',
      message: 'Cannot sync while offline. Please check your connection.',
      position: 'top',
      timeout: 3000,
    })
    return
  }

  try {
    await syncStore.fullSync()
    $q.notify({
      type: 'positive',
      message: 'Sync completed successfully',
      position: 'top',
      timeout: 2000,
    })
  } catch (e: any) {
    $q.notify({
      type: 'negative',
      message: e.message || 'Sync failed',
      position: 'top',
      timeout: 3000,
    })
  }
}

function toggleNetworkInfo(): void {
  const connectionType = uiStore.networkType || 'unknown'
  const status = isOffline.value ? 'Offline' : 'Online'

  $q.dialog({
    title: 'Network Status',
    message: `
      Status: ${status}
      Connection: ${connectionType}
      Last checked: ${new Date().toLocaleTimeString()}
    `,
    ok: 'OK',
    persistent: false,
  })
}

function openQRScanner(): void {
  // Check if running on Capacitor (mobile)
  const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.()

  if (isCapacitor) {
    $q.dialog({
      title: 'QR Scanner',
      message: 'Scan a QR code to quickly access documents, incidents, or assets.',
      persistent: true,
      ok: {
        label: 'Open Scanner',
        color: 'primary',
      },
      cancel: {
        label: 'Cancel',
        color: 'negative',
      },
    }).onOk(async () => {
      try {
        // Dynamic import for Capacitor Barcode Scanner
        const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner')

        // Check and request permissions
        await BarcodeScanner.checkPermission({ force: true })

        // Start scan
        const result = await BarcodeScanner.startScan()

        if (result.hasContent) {
          const scannedData = result.content
          $q.notify({
            type: 'info',
            message: `Scanned: ${scannedData.substring(0, 50)}${
              scannedData.length > 50 ? '...' : ''
            }`,
            position: 'top',
            timeout: 3000,
          })

          // Handle the scanned data
          await handleScannedData(scannedData)
        }

        // Stop scan
        await BarcodeScanner.stopScan()
      } catch (error) {
        console.error('QR Scanner error:', error)
        $q.notify({
          type: 'negative',
          message: 'Failed to open scanner. Please check camera permissions.',
          position: 'top',
        })
      }
    })
  } else {
    // Web fallback - show input dialog
    $q.dialog({
      title: 'QR Code Input',
      message: 'Enter QR code value manually (web fallback):',
      prompt: {
        model: '',
        type: 'text',
        isValid: (val: string) => val.length > 0,
        invalidMessage: 'Please enter a value',
      } as any,
      cancel: true,
      persistent: true,
      ok: {
        label: 'Submit',
        color: 'primary',
      },
    }).onOk(async (data: string) => {
      if (data) {
        await handleScannedData(data)
      }
    })
  }
}

async function handleScannedData(data: string): Promise<void> {
  // Parse and handle scanned QR data
  try {
    // Check if it's a URL
    if (data.startsWith('http://') || data.startsWith('https://')) {
      $q.dialog({
        title: 'Open URL?',
        message: `Do you want to open: ${data}`,
        cancel: true,
        persistent: true,
      }).onOk(() => {
        window.open(data, '_blank')
      })
      return
    }

    // Check if it's JSON data
    if (data.startsWith('{')) {
      const parsed = JSON.parse(data)

      // Handle different types of QR data
      switch (parsed.type) {
        case 'document':
          await router.push(`/documents/${parsed.id}`)
          $q.notify({ type: 'positive', message: 'Opening document...', position: 'top' })
          break
        case 'incident':
          await router.push(`/incidents/${parsed.id}`)
          $q.notify({ type: 'positive', message: 'Opening incident...', position: 'top' })
          break
        case 'asset':
          await router.push(`/assets/${parsed.id}`)
          $q.notify({ type: 'positive', message: 'Opening asset...', position: 'top' })
          break
        case 'risk':
          await router.push(`/risks/${parsed.id}`)
          $q.notify({ type: 'positive', message: 'Opening risk...', position: 'top' })
          break
        default:
          // Show generic data
          $q.dialog({
            title: 'Scanned Data',
            message: JSON.stringify(parsed, null, 2),
            ok: 'OK',
          })
      }
    } else {
      // Plain text - try to route based on format
      if (data.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // UUID format - might be an entity ID
        $q.dialog({
          title: 'Scanned ID',
          message: `Scanned ID: ${data}\n\nWhat would you like to do?`,
          options: {
            type: 'radio',
            model: 'document',
            items: [
              { label: 'Open as Document', value: 'document' },
              { label: 'Open as Incident', value: 'incident' },
              { label: 'Open as Risk', value: 'risk' },
            ],
          },
          cancel: true,
          persistent: true,
        }).onOk(async (type: string) => {
          await router.push(`/${type}s/${data}`)
        })
      } else {
        // Show as plain text
        $q.dialog({
          title: 'Scanned Data',
          message: data,
          ok: 'OK',
        })
      }
    }
  } catch (error) {
    // Not JSON or invalid format - treat as plain text
    console.warn('Failed to parse QR data:', error)
    $q.dialog({
      title: 'Scanned Data',
      message: data,
      ok: 'OK',
    })
  }
}
</script>

<style lang="scss" scoped>
:deep(.q-toolbar) {
  min-height: 56px;
}

.rotate-animation {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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

  // Adjust button sizes on mobile
  .q-btn--round {
    font-size: 20px;
    width: 32px;
    height: 32px;
  }

  // Reduce gutter on mobile for more space
  .q-gutter-sm {
    gap: 4px;
  }
}

// Tablet adjustments
@media (min-width: 601px) and (max-width: 1024px) {
  .q-btn--round {
    font-size: 22px;
    width: 36px;
    height: 36px;
  }
}
</style>
