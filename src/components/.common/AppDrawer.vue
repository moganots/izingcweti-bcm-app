<!-- src/components/ui/AppDrawer.vue -->
<template>
  <q-drawer
    v-model="drawerOpen"
    show-if-above
    :width="280"
    :breakpoint="768"
    bordered
    :class="{ 'bg-dark text-white': isDarkMode }"
  >
    <!-- Drawer Header -->
    <div class="drawer-header q-pa-md">
      <div class="row items-center">
        <q-avatar size="48px" class="q-mr-sm">
          <q-icon name="shield" size="32px" color="white" />
        </q-avatar>
        <div>
          <div class="text-h6 text-white">Izingcweti BCM App</div>
          <div class="text-caption text-grey-4">
            {{ userRole || 'User' }}
          </div>
        </div>
      </div>

      <!-- Sync Status -->
      <div v-if="syncStore.hasPendingChanges" class="sync-status q-mt-sm">
        <q-badge color="orange" class="full-width text-center q-py-xs">
          <q-icon name="sync" size="14px" class="q-mr-xs" />
          {{ syncStore.pendingCount }} pending changes
        </q-badge>
      </div>
    </div>

    <q-separator />

    <!-- Navigation Menu -->
    <q-scroll-area class="fit">
      <q-list padding>
        <!-- Dashboard -->
        <q-item clickable v-ripple :to="{ name: 'Dashboard' }" exact active-class="text-primary">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-separator spaced />

        <!-- BCM Section -->
        <q-item-label header :class="isDarkMode ? 'text-grey-4' : 'text-grey-7'">
          Business Continuity
        </q-item-label>

        <q-expansion-item
          v-for="group in menuGroups"
          :key="group.label"
          :icon="group.icon"
          :label="group.label"
          :default-opened="isGroupActive(group)"
          expand-separator
          header-class="text-weight-medium"
        >
          <q-item
            v-for="item in group.items"
            :key="item.name"
            :to="{ name: item.name }"
            :active="route.name === item.name"
            clickable
            v-ripple
            exact
            dense
            class="q-pl-lg"
            active-class="text-primary"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" size="20px" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
            <q-item-section v-if="item.badge" side>
              <q-badge :color="item.badgeColor" :label="item.badge" />
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-separator spaced />

        <!-- System Section -->
        <q-item-label header :class="isDarkMode ? 'text-grey-4' : 'text-grey-7'">
          System
        </q-item-label>

        <q-item
          clickable
          v-ripple
          :to="{ name: 'Notifications' }"
          exact
          active-class="text-primary"
        >
          <q-item-section avatar>
            <q-icon name="notifications" />
          </q-item-section>
          <q-item-section>Notifications</q-item-section>
          <q-item-section v-if="notificationStore.unreadCount > 0" side>
            <q-badge color="red" :label="notificationStore.unreadCount" />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'Documents' }" exact active-class="text-primary">
          <q-item-section avatar>
            <q-icon name="folder" />
          </q-item-section>
          <q-item-section>Documents</q-item-section>
        </q-item>

        <q-separator spaced />

        <!-- User Section -->
        <q-item clickable v-ripple :to="{ name: 'Profile' }" exact active-class="text-primary">
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>Profile</q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'Settings' }" exact active-class="text-primary">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>Settings</q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>

    <!-- Drawer Footer -->
    <div class="drawer-footer q-pa-sm" :class="isDarkMode ? 'bg-dark' : 'bg-grey-2'">
      <q-separator />
      <q-list dense>
        <q-item clickable v-ripple @click="handleSync">
          <q-item-section avatar>
            <q-icon
              name="sync"
              :color="syncStore.isSyncing ? 'orange' : 'primary'"
              :class="{ 'rotate-animation': syncStore.isSyncing }"
            />
          </q-item-section>
          <q-item-section>
            {{ syncStore.isSyncing ? 'Syncing...' : 'Sync Now' }}
          </q-item-section>
          <q-item-section side v-if="syncStore.lastSyncAt">
            <span class="text-caption text-grey-6">
              {{ formatTimeAgo(syncStore.lastSyncAt) }}
            </span>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="handleLogout">
          <q-item-section avatar>
            <q-icon name="logout" color="negative" />
          </q-item-section>
          <q-item-section class="text-negative">Logout</q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../../stores/auth/auth.store'
import { useSyncStore } from '../../stores/sync.store'
import { useNotificationStore } from '../../stores/notification/notification.store'
import { useUiStore } from '../../stores/ui/ui.store'

// ============================================
// Types
// ============================================
interface MenuItem {
  name: string
  label: string
  icon: string
  badge?: string | number
  badgeColor?: string
}

interface MenuGroup {
  label: string
  icon: string
  items: MenuItem[]
}

// ============================================
// Stores & Router
// ============================================
const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const syncStore = useSyncStore()
const notificationStore = useNotificationStore()
const uiStore = useUiStore()

// ============================================
// Props & Emits
// ============================================
const props = withDefaults(defineProps<{ modelValue?: boolean }>(), { modelValue: false })
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const drawerOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// ============================================
// Computed
// ============================================
const userRole = computed(() => authStore.userRole)
const isDarkMode = computed(() => uiStore.isDarkMode)

// ============================================
// Menu Groups - FIXED: Added proper typing
// ============================================
const menuGroups: MenuGroup[] = [
  {
    label: 'BCM Core',
    icon: 'business',
    items: [
      { name: 'CriticalFunctions', label: 'Critical Functions', icon: 'functions' },
      { name: 'BIA', label: 'Business Impact Analysis', icon: 'assessment' },
      { name: 'BCP', label: 'Continuity Plans', icon: 'description' },
      { name: 'RecoveryStrategies', label: 'Recovery Strategies', icon: 'restore' },
      { name: 'ExerciseTests', label: 'Exercise Tests', icon: 'playlist_add_check' },
    ],
  },
  {
    label: 'Risk & Compliance',
    icon: 'shield',
    items: [
      { name: 'Risks', label: 'Risk Management', icon: 'warning' },
      { name: 'Incidents', label: 'Incidents', icon: 'report' },
    ],
  },
  {
    label: 'Workflow',
    icon: 'account_tree',
    items: [{ name: 'Workflows', label: 'Workflows', icon: 'account_tree' }],
  },
]

// ============================================
// Methods
// ============================================
function isGroupActive(group: MenuGroup): boolean {
  return group.items.some((item) => route.name === item.name)
}

async function handleSync(): Promise<void> {
  if (syncStore.isSyncing) return
  try {
    await syncStore.fullSync()
    $q.notify({ type: 'positive', message: 'Sync completed', position: 'top' })
  } catch (error: any) {
    $q.notify({ type: 'negative', message: error.message, position: 'top' })
  }
}

async function handleLogout(): Promise<void> {
  $q.dialog({
    title: 'Logout',
    message: 'Are you sure you want to logout?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await authStore.logout()
    await router.push('/auth/login')
  })
}

function formatTimeAgo(date: string | null): string {
  if (!date) return ''
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
</script>

<style lang="scss" scoped>
.drawer-header {
  background: linear-gradient(
    135deg,
    var(--q-primary) 0%,
    color-mix(in srgb, var(--q-primary) 70%, black) 100%
  );
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

.drawer-footer {
  position: sticky;
  bottom: 0;
}
</style>
