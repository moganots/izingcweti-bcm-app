<template>
  <q-drawer
    v-model="drawerOpen"
    side="right"
    :width="280"
    :breakpoint="768"
    bordered
    :class="{ 'bg-dark text-white': isDarkMode }"
  >
    <!-- Drawer Header -->
    <div class="drawer-header q-pa-md">
      <div class="row items-center">
        <q-avatar size="48px" class="q-mr-sm">
          <img src="/izingcweti-logo-icon-no-bg.png" alt="Logo" />
        </q-avatar>
        <div>
          <div class="text-h6 text-white">Izingcweti BCM</div>
          <div class="text-caption text-grey-4">
            {{ userRole || 'User' }}
          </div>
        </div>
      </div>

      <!-- User Info -->
      <div class="q-mt-sm">
        <div class="text-subtitle2 text-white">{{ userFullName }}</div>
        <div class="text-caption text-grey-4">{{ userEmail }}</div>
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
        <!-- Main Navigation Items (not in footer) -->
        <template v-for="group in menuGroups" :key="group.label">
          <q-item-label header :class="isDarkMode ? 'text-grey-4' : 'text-grey-7'">
            {{ group.label }}
          </q-item-label>

          <q-item
            v-for="item in group.items"
            :key="item.name"
            clickable
            v-ripple
            :to="{ name: item.name }"
            :active="route.name === item.name"
            exact
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
        </template>

        <q-separator spaced />

        <!-- Admin Section -->
        <template v-if="authStore.isAdmin">
          <q-item-label header :class="isDarkMode ? 'text-grey-4' : 'text-grey-7'">
            Administration
          </q-item-label>

          <q-item
            v-for="item in adminItems"
            :key="item.name"
            clickable
            v-ripple
            :to="{ name: item.name }"
            :active="route.name === item.name"
            exact
            active-class="text-primary"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </template>

        <q-separator spaced />

        <!-- System Section -->
        <q-item-label header :class="isDarkMode ? 'text-grey-4' : 'text-grey-7'">
          System
        </q-item-label>

        <q-item clickable v-ripple :to="{ name: 'Documents' }" exact active-class="text-primary">
          <q-item-section avatar>
            <q-icon name="folder" />
          </q-item-section>
          <q-item-section>Documents</q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'Settings' }" exact active-class="text-primary">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>Settings</q-item-section>
        </q-item>

        <q-separator spaced />

        <!-- Footer Actions -->
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
    </q-scroll-area>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore, useSyncStore, useUiStore } from '../../stores'

interface MenuItem {
  name: string
  label: string
  icon: string
  badge?: string | number
  badgeColor?: string
}

interface MenuGroup {
  label: string
  items: MenuItem[]
}

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const syncStore = useSyncStore()
const uiStore = useUiStore()

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const drawerOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const userRole = computed(() => authStore.userRole)
const userFullName = computed(() => authStore.fullName)
const userEmail = computed(() => authStore.userEmail)
const isDarkMode = computed(() => uiStore.isDarkMode)

// Menu Groups (All navigation not in footer)
const menuGroups: MenuGroup[] = [
  {
    label: 'Business Continuity',
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
    items: [
      { name: 'Risks', label: 'Risk Register', icon: 'warning' },
      { name: 'Compliance', label: 'Compliance', icon: 'verified_user' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Incidents', label: 'Incidents', icon: 'report' },
      { name: 'Workflows', label: 'Workflows', icon: 'account_tree' },
    ],
  },
]

const adminItems = [
  { name: 'Users', label: 'User Management', icon: 'people' },
  { name: 'Organisations', label: 'Organisations', icon: 'business' },
  { name: 'AuditLogs', label: 'Audit Logs', icon: 'history' },
]

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
</style>
