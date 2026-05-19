<template>
  <q-header elevated :class="headerClass">
    <q-toolbar>
      <q-btn flat dense round icon="menu" @click="$emit('toggle-drawer')" />
      <q-toolbar-title class="cursor-pointer" @click="$router.push('/dashboard')">
        <q-icon name="shield" size="24px" class="q-mr-sm" />
        {{ title || 'Izingcweti BCM App' }}
      </q-toolbar-title>

      <q-btn v-if="isOffline" flat dense round icon="wifi_off" color="orange" />
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
      </q-btn>
      <q-btn flat dense round icon="notifications" @click="$router.push('/notifications')">
        <q-badge v-if="notificationStore.unreadCount > 0" floating color="red">
          {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
        </q-badge>
      </q-btn>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useSyncStore } from '../../stores/sync.store'
import { useNotificationStore } from '../../stores/notification.store'
import { useUiStore } from '../../stores/ui.store'

const router = useRouter()
const $q = useQuasar()
const syncStore = useSyncStore()
const notificationStore = useNotificationStore()
const uiStore = useUiStore()

defineProps<{ title?: string }>()
defineEmits<{ 'toggle-drawer': [] }>()

const isOffline = computed(() => uiStore.isOffline)
const headerClass = computed(() => ({ 'bg-primary text-white': true }))

async function handleSync(): Promise<void> {
  try {
    await syncStore.fullSync()
    $q.notify({ type: 'positive', message: 'Synced', position: 'top', timeout: 2000 })
  } catch (e: any) {
    $q.notify({ type: 'negative', message: e.message, position: 'top' })
  }
}
</script>
