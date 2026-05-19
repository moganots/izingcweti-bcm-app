<template>
  <q-footer elevated class="bg-primary text-white">
    <q-tabs
      v-model="selectedTab"
      inline-label
      class="text-white"
      active-color="yellow"
      indicator-color="yellow"
      @update:model-value="handleTabChange"
    >
      <q-tab name="home" icon="home" label="Home" />
      <q-tab name="notifications" icon="notifications" label="Notifications">
        <q-badge v-if="unreadCount > 0" color="red" floating>
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </q-badge>
      </q-tab>
      <q-tab name="sync" icon="sync" :label="syncLabel">
        <q-badge v-if="pendingCount > 0" color="orange" floating>
          {{ pendingCount > 99 ? '99+' : pendingCount }}
        </q-badge>
      </q-tab>
      <q-tab name="profile" icon="person" label="Profile" />
      <q-tab name="menu" icon="menu" label="Menu" />
    </q-tabs>
  </q-footer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useSyncStore, useNotificationStore } from '../../stores'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const syncStore = useSyncStore()
const notificationStore = useNotificationStore()

const selectedTab = ref('home')

const unreadCount = computed(() => notificationStore.unreadCount || 0)
const pendingCount = computed(() => syncStore.pendingCount || 0)
const isSyncing = computed(() => syncStore.isSyncing)
const syncLabel = computed(() => (isSyncing.value ? 'Syncing' : 'Sync'))

// Watch route changes to update selected tab
watch(
  () => route.name,
  (newName) => {
    if (newName === 'Dashboard') selectedTab.value = 'home'
    else if (newName === 'Notifications') selectedTab.value = 'notifications'
    else if (newName === 'Profile') selectedTab.value = 'profile'
    else if (newName === 'SyncDashboard') selectedTab.value = 'sync'
    else selectedTab.value = 'menu'
  },
  { immediate: true }
)

async function handleTabChange(tab: string): Promise<void> {
  switch (tab) {
    case 'home':
      router.push({ name: 'Dashboard' })
      break
    case 'notifications':
      router.push({ name: 'Notifications' })
      break
    case 'sync':
      if (isSyncing.value) return
      try {
        await syncStore.fullSync()
        $q.notify({ type: 'positive', message: 'Sync completed', position: 'top', timeout: 2000 })
      } catch (e: any) {
        $q.notify({ type: 'negative', message: e.message, position: 'top' })
      }
      break
    case 'profile':
      router.push({ name: 'Profile' })
      break
    case 'menu':
      // Emit event to parent to open drawer
      break
  }
}
</script>
